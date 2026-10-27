import test from 'node:test';
import assert from 'node:assert/strict';
import { createGame, command, phase } from '../src/core/engine.js';
import { serialize, deserialize } from '../src/core/save.js';
import { GENERALS, CARDS, EVENTS } from '../src/data/game.js';
import { rewardPresentation, sceneArt, CARD_SCENES, EVENT_SCENES } from '../src/ui/reward-scenes.js';
import { equipmentArt } from '../src/ui/equipment-art.js';
import { GameScene } from '../src/render/scene.js';
import { makeFighter } from '../src/core/progression.js';

const game = (enhanced = true) =>
  createGame(
    [
      { lord: 0, ai: false },
      { lord: 1, ai: true },
    ],
    enhanced,
    42,
  );
function eventState(seed = 42, choice = 'card') {
  const s = game();
  s.seed = seed;
  s.players[0].pos = choice === 'gear' ? 33 : 2;
  phase(s, 'event', { tile: s.players[0].pos });
  return s;
}
test('presentation collection is transient, deterministic and atomic even on late rejection', () => {
  for (const c of [{ type: 'recruit' }, { type: 'gear' }, { type: 'roll' }]) {
    const s = game(),
      before = structuredClone(s),
      events = [];
    const shown = command(s, c, events),
      silent = command(s, c);
    assert.deepEqual(shown, silent);
    assert.deepEqual(s, before);
    assert.deepEqual(deserialize(serialize(shown)), shown);
    assert.ok(events.length || c.type === 'roll');
    assert.equal(Object.hasOwn(shown, 'presentations'), false);
  }
  const s = game(),
    events = [];
  s.assets[1].owner = 99;
  assert.throws(() => command(s, { type: 'gear' }, events));
  assert.deepEqual(events, []);
});
test('all recruits and duplicates identify the actual draw and material conversion', () => {
  const seen = new Set(),
    visuals = new Set();
  for (let seed = 0; seed < 12000 && seen.size < GENERALS.length; seed++) {
    const s = game();
    s.seed = seed;
    s.players[0].generals = [];
    const events = [],
      result = command(s, { type: 'recruit' }, events);
    const e = events[0];
    seen.add(e.id);
    assert.equal(e.kind, 'general');
    assert.equal(result.players[0].generals[0].id, e.id);
    const r = rewardPresentation(e, result);
    visuals.add(sceneArt(r.recipe, r.seed));
    if (seen.size === 1) {
      s.players[0].generals = [makeFighter(e.id)];
      const duplicate = [],
        again = command(s, { type: 'recruit' }, duplicate);
      assert.equal(duplicate[0].duplicate, true);
      assert.equal(again.players[0].generals.length, 1);
      assert.equal(again.players[0].material - s.players[0].material, GENERALS[e.id].rarity * 2);
    }
  }
  assert.equal(seen.size, 90);
  assert.equal(visuals.size, 90);
});
test('all 24 card draws retain duplicates and overflow resumes discard after display', () => {
  const seen = new Set();
  for (let seed = 0; seed < 3000 && seen.size < CARDS.length; seed++) {
    const s = eventState(seed),
      events = [];
    s.players[0].cards = Array(8).fill(0);
    const result = command(s, { type: 'event', choice: 'card' }, events);
    const e = events[0];
    seen.add(e.id);
    assert.equal(e.kind, 'card');
    assert.equal(result.players[0].cards[8], e.id);
    assert.equal(result.phase, 'discard');
    assert.equal(command(result, { type: 'discard', index: 8 }).phase, 'end');
    assert.ok(sceneArt(rewardPresentation(e, result).recipe, e.id));
  }
  assert.equal(seen.size, 24);
  assert.equal(new Set(CARD_SCENES.map((r) => sceneArt(r))).size, 24);
});
test('classic events report the real deck card before chained rewards without changing debt or jail', () => {
  for (let id = 0; id < EVENTS.length; id++) {
    const s = eventState(100),
      events = [];
    const index = s.eventDeck.indexOf(id);
    [s.eventDeck[0], s.eventDeck[index]] = [s.eventDeck[index], s.eventDeck[0]];
    s.eventCursor = 0;
    s.players[0].cash = 1;
    const result = command(s, { type: 'event', choice: 'classic' }, events);
    assert.deepEqual(result, command(s, { type: 'event', choice: 'classic' }));
    assert.equal(events[0].kind, 'event');
    assert.equal(events[0].id, id);
    if (EVENTS[id].cash < 0) assert.equal(result.phase, 'debt');
    if (id === 6) assert.ok(result.players[0].jail >= 0);
    for (const e of events) assert.ok(rewardPresentation(e, result).name);
  }
  assert.equal(new Set(EVENT_SCENES.map((r) => sceneArt(r))).size, 12);
});
test('encounters retain every equipment/manual/relic reward in settlement order', () => {
  const kinds = new Set();
  let twoGear = false,
    duplicateManual = false;
  for (let seed = 0; seed < 1000; seed++) {
    const s = eventState(seed, 'gear'),
      events = [];
    s.players[0].manuals = [0, 1, 2, 3, 4, 5];
    const result = command(s, { type: 'event', choice: 'gear' }, events);
    assert.equal(events[0].kind, 'gear');
    assert.equal(events.length, 1 + result.players[0].loot.length);
    if (events.filter((e) => e.kind === 'gear').length === 2) {
      twoGear = true;
      assert.notEqual(events[0].id, events[1].id);
    }
    for (const e of events) {
      kinds.add(e.kind);
      assert.ok(rewardPresentation(e, result).name);
      if (e.kind === 'material') duplicateManual = true;
    }
    if (twoGear && duplicateManual && kinds.has('relic')) break;
  }
  assert.ok(twoGear && duplicateManual && kinds.has('relic'));
});
test('all thirty armory illustrations have unique paint references and material details', () => {
  const ids = new Set(),
    art = new Set();
  for (let q = 0; q < 5; q++)
    for (let slot = 0; slot < 6; slot++) {
      const svg = equipmentArt(slot, q);
      const paints = [...svg.matchAll(/id="([^"]+)"/g)].map((m) => m[1]);
      for (const id of paints) {
        assert.ok(!ids.has(id));
        ids.add(id);
      }
      for (const [, id] of svg.matchAll(/url\(#([^)]+)\)/g)) assert.ok(paints.includes(id));
      art.add(svg.replace(/armory-\d+/g, 'armory'));
      assert.ok(svg.includes('role="img"'));
    }
  assert.equal(art.size, 30);
});
test('equipment is attached to both hands/legs, ring-pommel weapon follows the arm, caches are reused', () => {
  const scene = Object.create(GameScene.prototype);
  scene.geometries = new Map();
  scene.materials = new Map();
  for (const troop of ['步', '骑', '弓']) {
    const items = Array.from({ length: 6 }, (_, slot) => ({ id: slot + 1, slot, quality: 4 }));
    const g = scene.warrior(
      '#aabbcc',
      items.map((i) => i.id),
      items,
      1,
      troop,
    );
    const parts = (slot) => {
      const found = [];
      g.traverse((o) => {
        if (o.name === `equipment-${slot}-4`) found.push(o);
      });
      return found;
    };
    assert.equal(parts(1).length, 2);
    assert.equal(parts(4).length, 2);
    assert.equal(parts(5).length, 2);
    assert.equal(parts(2)[0].parent, troop === '弓' ? g : g.userData.rig.right);
    assert.ok(parts(2)[0].children.some((o) => o.geometry.type === 'TorusGeometry'));
    assert.ok(parts(3).some((part) => part.children.length >= 100));
    const sizes = [scene.geometries.size, scene.materials.size];
    scene.warrior(
      '#aabbcc',
      items.map((i) => i.id),
      items,
      1,
      troop,
    );
    assert.deepEqual([scene.geometries.size, scene.materials.size], sizes);
  }
  scene.geometries.forEach((g) => g.dispose());
  scene.materials.forEach((m) => m.dispose());
});
