import test from 'node:test';
import assert from 'node:assert/strict';
import { createGame, command, phase } from '../src/core/engine.js';
import { serialize, deserialize } from '../src/core/save.js';
import { choose } from '../src/ai/strategy.js';
import { SKILLS } from '../src/data/skills.js';
import { skillTargets } from '../src/core/combat.js';
import { HOUSE_SUPPLY, PALACE_SUPPLY } from '../src/data/game.js';
import { makeFighter } from '../src/core/progression.js';
const game = () =>
  createGame(
    [
      { lord: 0, ai: false },
      { lord: 1, ai: true },
    ],
    true,
    42,
  );
test('enhanced owned landing permits exactly one upgrade without a set', () => {
  let s = game();
  s.players[0].cards = [8];
  s.assets[1].owner = 0;
  s = command(s, { type: 'card', index: 0 });
  assert.equal(s.phase, 'develop');
  assert.equal(s.players[0].pos, 1);
  const cash = s.players[0].cash;
  s = command(s, { type: 'develop', choice: 'build' });
  assert.equal(s.assets[1].level, 1);
  assert.equal(s.houses, HOUSE_SUPPLY - 1);
  assert.equal(s.players[0].cash, cash - 50);
  assert.throws(() => command(s, { type: 'develop', choice: 'build' }), /建设机会/);
  assert.throws(() => command(s, { type: 'asset', action: 'build', tile: 1 }), /集齐/);
});
test('landing upgrade honors inventory, money, and palace conversion', () => {
  let s = game();
  s.assets[1].owner = 0;
  s.assets[1].level = 4;
  s.houses = HOUSE_SUPPLY - 4;
  s.players[0].pos = 1;
  phase(s, 'develop', { tile: 1 });
  s.players[0].cash = 0;
  assert.throws(() => command(s, { type: 'develop', choice: 'build' }), /金币/);
  s.players[0].cash = 500;
  s = command(s, { type: 'develop', choice: 'build' });
  assert.equal(s.assets[1].level, 5);
  assert.equal(s.palaces, PALACE_SUPPLY - 1);
  assert.equal(s.houses, HOUSE_SUPPLY);
});
test('classic ownership does not bypass monopoly construction', () => {
  const s = createGame(
    [
      { lord: 0, ai: false },
      { lord: 1, ai: true },
    ],
    false,
    42,
  );
  s.assets[1].owner = 0;
  s.players[0].pos = 1;
  assert.throws(() => command(s, { type: 'asset', action: 'build', tile: 1 }), /集齐/);
  phase(s, 'develop', { tile: 1 });
  assert.throws(() => command(s, { type: 'develop', choice: 'build' }), /建设机会/);
});
function shop() {
  let s = game();
  s.players[0].pos = 1;
  s.players[0].cards = [8];
  s.seed = 0;
  return command(s, { type: 'card', index: 0 });
}
test('secret shop opens below the 25 percent threshold and not above it', () => {
  for (const [seed, expected] of [
    [35, 'shop'],
    [36, 'event'],
  ]) {
    const s = game();
    s.players[0].pos = 1;
    s.players[0].cards = [8];
    s.seed = seed;
    assert.equal(command(s, { type: 'card', index: 0 }).phase, expected);
  }
});
test('secret shop generates seeded fixed stock, rejects repeat purchases and resumes event', () => {
  let s = shop();
  assert.equal(s.phase, 'shop');
  assert.equal(s.decision.offers.length, 3);
  const stock = structuredClone(s.decision.offers);
  assert.deepEqual(deserialize(serialize(s)).decision.offers, stock);
  const cash = s.players[0].cash;
  s = command(s, { type: 'shopBuy', index: 0 });
  assert.equal(s.players[0].cash, cash - stock[0].price);
  assert.ok(s.players[0].items.some((i) => i.id === stock[0].item.id));
  assert.throws(() => command(s, { type: 'shopBuy', index: 0 }), /售出/);
  assert.deepEqual(deserialize(serialize(s)), s);
  s = command(s, { type: 'shopLeave' });
  assert.equal(s.phase, 'event');
  assert.throws(() => command(s, { type: 'shopBuy', index: 1 }), /关闭/);
  s = command(s, { type: 'event', choice: 'recruit' });
  assert.equal(s.phase, 'end');
});
test('shop does not mutate state on insufficient funds, and AI can leave it', () => {
  let s = shop();
  s.players[0].cash = 0;
  const snapshot = structuredClone(s);
  assert.throws(() => command(s, { type: 'shopBuy', index: 0 }), /金币不足/);
  assert.deepEqual(s, snapshot);
  assert.equal(choose(s).type, 'shopLeave');
  s = command(s, choose(s));
  assert.equal(s.phase, 'event');
});
test('shop saves reject modified prices, duplicated stock and mismatched sold gear', () => {
  const root = JSON.parse(serialize(shop()));
  root.state.decision.offers[0].price++;
  assert.throws(() => deserialize(JSON.stringify(root)), /价格/);
  const duplicate = JSON.parse(serialize(shop()));
  duplicate.state.decision.offers[1] = structuredClone(duplicate.state.decision.offers[0]);
  assert.throws(() => deserialize(JSON.stringify(duplicate)), /重复/);
  const purchased = command(shop(), { type: 'shopBuy', index: 0 });
  const mismatch = JSON.parse(serialize(purchased));
  const id = mismatch.state.decision.offers[0].item.id;
  const item = mismatch.state.players[0].items.find((i) => i.id === id);
  item.slot = (item.slot + 1) % 6;
  assert.throws(() => deserialize(JSON.stringify(mismatch)), /记录不符/);
});
test('v1 saves explicitly migrate player scenery regions without changing money', () => {
  const root = JSON.parse(serialize(game()));
  root.version = 1;
  root.state.version = 1;
  root.state.assets = root.state.assets.slice(0, 40);
  root.state.houses -= HOUSE_SUPPLY - 32;
  root.state.palaces -= PALACE_SUPPLY - 12;
  root.state.players.forEach((p) => {
    delete p.region;
  });
  root.state.players[0].pos = 7;
  const s = deserialize(JSON.stringify(root));
  assert.equal(s.version, 6);
  assert.equal(s.players[0].region, 1);
  assert.equal(s.players[0].cash, 1500);
  assert.deepEqual(deserialize(serialize(s)), s);
});
test('special tiles retain last region while actual city landings update it', () => {
  let s = game();
  s.players[0].pos = 5;
  s.players[0].cards = [8, 8];
  s = command(s, { type: 'card', index: 0 });
  assert.equal(s.players[0].region, 1);
  s = command(s, { type: 'buy' });
  s = command(s, { type: 'card', index: 0 });
  assert.equal(s.players[0].pos, 7);
  assert.equal(s.players[0].region, 1);
});
function combat(id = 0) {
  let s = game();
  const general = (id, guard = -1) => ({ ...makeFighter(id), guard });
  s.players[0].generals = [id, (id + 1) % 40, (id + 2) % 40].map((i) => general(i));
  s.players[1].generals = [13, 14, 15].map((i) => general(i, 1));
  s.assets[1].owner = 1;
  s.players[0].pos = 1;
  phase(s, 'rent', { tile: 1, creditor: 1, amount: 2 });
  s = command(s, { type: 'siege', generals: s.players[0].generals.map((g) => g.id) });
  s = command(s, { type: 'defend', generals: [], hero: false });
  s.battle.order = [0, 1, 2, 10, 11, 12];
  s.battle.cursor = 0;
  s.battle.units.forEach((u) => {
    u.hp = Math.floor(u.max * 0.6);
    u.shield = 12;
    u.cooldown = 2;
    u.statuses = [];
  });
  s.battle.units[0].cooldown = 0;
  return s;
}
for (let id = 0; id < SKILLS.length; id++) {
  test(`unique skill ${id}: ${SKILLS[id].name} changes combat and survives save recovery`, () => {
    let s = combat(id);
    const skill = SKILLS[id],
      u = s.battle.units[0];
    const target = skillTargets(s.battle, u, skill)[0];
    const before = structuredClone(s.battle.units);
    s = command(s, { type: 'skill', target: target.id });
    assert.equal(s.battle.units[0].cooldown, skill.cooldown);
    const changed = s.battle.units.some((unit, i) =>
      ['hp', 'shield', 'atk', 'def', 'statuses'].some(
        (key) => JSON.stringify(unit[key]) !== JSON.stringify(before[i][key]),
      ),
    );
    assert.ok(changed, 'skill must alter health, shield, stats or statuses, not just cooldown/name');
    assert.deepEqual(deserialize(serialize(s)), s);
    assert.equal(s.combatEvent.actor, 0);
    assert.equal(s.combatEvent.units.length, 7);
  });
}
test('silence blocks skills but expires after a normal action; poison ticks through shared shields', () => {
  let s = combat(25);
  s = command(s, { type: 'skill', target: 10 });
  s.battle.cursor = s.battle.order.indexOf(10);
  const target = s.battle.units.find((u) => u.id === 10);
  target.statuses.push({ kind: 'silence', power: 0, turns: 1 });
  target.cooldown = 0;
  target.shield = 5;
  const hp = target.hp;
  assert.throws(() => command(s, { type: 'skill', target: 0 }), /封技/);
  s = command(s, { type: 'attack', target: 0 });
  const after = s.battle.units.find((u) => u.id === 10);
  assert.equal(after.hp, hp - 13);
  assert.equal(after.shield, 0);
  assert.ok(!after.statuses.some((x) => x.kind === 'silence'));
  assert.equal(after.statuses.find((x) => x.kind === 'poison').turns, 2);
});
test('ally skills reject enemies atomically and cleanse instead of ticking removed poison', () => {
  let s = combat(23);
  s.battle.units[0].statuses = [{ kind: 'poison', power: 18, turns: 3 }];
  const hp = s.battle.units[0].hp;
  s = command(s, { type: 'skill', target: 0 });
  assert.equal(s.battle.units[0].hp, Math.min(s.battle.units[0].max, hp + 24));
  assert.deepEqual(s.battle.units[0].statuses, []);
  const one = combat(16),
    before = structuredClone(one);
  assert.throws(() => command(one, { type: 'skill', target: 10 }), /目标/);
  assert.deepEqual(one, before);
});
test('legacy combat migrates empty statuses and new saves reject invalid effects', () => {
  const root = JSON.parse(serialize(combat()));
  root.version = 1;
  root.state.version = 1;
  root.state.assets = root.state.assets.slice(0, 40);
  root.state.houses -= HOUSE_SUPPLY - 32;
  root.state.palaces -= PALACE_SUPPLY - 12;
  delete root.state.combatEvent;
  root.state.players.forEach((p) => delete p.region);
  root.state.battle.units.forEach((u) => {
    delete u.shield;
    delete u.statuses;
  });
  const restored = deserialize(JSON.stringify(root));
  assert.ok(restored.battle.units.every((u) => u.shield === 0 && u.statuses.length === 0));
  const bad = JSON.parse(serialize(restored));
  bad.state.battle.units[0].statuses = [{ kind: 'unknown', power: 10, turns: 2 }];
  assert.throws(() => deserialize(JSON.stringify(bad)), /状态/);
});
