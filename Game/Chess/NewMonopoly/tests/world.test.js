import test from 'node:test';
import assert from 'node:assert/strict';
import { MAP, ROUTE, ROUTE_INDEX, advanceTile, HOUSE_SUPPLY, PALACE_SUPPLY } from '../src/data/game.js';
import { createGame, command, phase } from '../src/core/engine.js';
import { serialize, deserialize } from '../src/core/save.js';
import { choose } from '../src/ai/strategy.js';
import { tilePosition, tileAngle, routeCurve } from '../src/render/world.js';

const make = (enhanced = true) =>
  createGame(
    [
      { lord: 0, ai: false },
      { lord: 1, ai: false },
    ],
    enhanced,
    42,
  );
const oldSave = (s) =>
  JSON.stringify({
    format: 'dingli-save',
    version: 2,
    state: {
      ...s,
      version: 2,
      assets: s.assets.slice(0, 40),
      houses: s.houses - HOUSE_SUPPLY + 32,
      palaces: s.palaces - PALACE_SUPPLY + 12,
    },
  });

test('AI consolidates larger split regions incrementally without trading them straight back', () => {
  let s = make(false);
  const group = MAP.filter((t) => t.group === 1);
  group.forEach((t, i) => {
    s.assets[t.id].owner = i < 3 ? 0 : 1;
  });
  phase(s, 'end');
  const proposal = choose(s);
  assert.equal(proposal.type, 'trade');
  assert.ok(group.some((t) => t.id === proposal.offer.take));
  s = command(s, proposal);
  assert.equal(choose(s).type, 'accept');
  s = command(s, choose(s));
  assert.equal(group.filter((t) => s.assets[t.id].owner === 0).length, 4);
  s = command(s, { type: 'end' });
  assert.notEqual(choose(s).type, 'trade');
});

test('AI preserves tradeable regions instead of scattering the limited housing stock', () => {
  const s = make();
  s.players[0].pos = 40;
  s.assets[40].owner = 0;
  phase(s, 'develop', { tile: 40 });
  assert.equal(choose(s).choice, 'skip');
  MAP.filter((t) => t.group === 0).forEach((t) => {
    s.assets[t.id].owner = 0;
  });
  assert.equal(choose(s).choice, 'build');
});

test('AI reallocates stranded buildings when the expanded bank is exhausted', () => {
  let s = make();
  MAP.filter((t) => t.group === 1).forEach((t) => {
    s.assets[t.id].owner = 0;
  });
  s.assets[1] = { owner: 0, level: 2, mortgaged: false };
  let used = 2;
  for (const t of MAP.filter((t) => t.group > 1)) {
    const level = Math.min(4, HOUSE_SUPPLY - used);
    if (!level) break;
    s.assets[t.id] = { owner: 1, level, mortgaged: false };
    used += level;
  }
  s.houses = HOUSE_SUPPLY - used;
  assert.equal(s.houses, 0);
  const action = choose(s);
  assert.deepEqual(action, { type: 'asset', action: 'demolish', tile: 1 });
  s = command(s, action);
  assert.equal(s.houses, 2);
  const build = choose(s);
  assert.equal(build.action, 'build');
  assert.equal(MAP[build.tile].group, 1);
  s = command(s, build);
  assert.equal(s.houses, 1);
});

test('route is a closed permutation of 64 stable entities with 24 interspersed new cities', () => {
  assert.equal(ROUTE.length, 64);
  assert.equal(new Set(ROUTE).size, 64);
  assert.equal(MAP.filter((t) => t.kind === 'city').length, 46);
  for (const t of MAP) {
    assert.equal(ROUTE[ROUTE_INDEX[t.id]], t.id);
    assert.equal(advanceTile(t.id, 64), t.id);
    assert.equal(advanceTile(advanceTile(t.id, 1), -1), t.id);
  }
  assert.equal(advanceTile(3, 1), 40);
  assert.equal(advanceTile(63, 1), 0);
  assert.equal(advanceTile(0, -1), 63);
});
test('city footprints leave natural gaps and connecting curves avoid unrelated city footprints', () => {
  for (let i = 0; i < ROUTE.length; i++) {
    const a = ROUTE[i],
      b = ROUTE[(i + 1) % ROUTE.length],
      pa = tilePosition(a),
      pb = tilePosition(b);
    const direction = pb.clone().sub(pa).normalize();
    const extent = (id) => {
      const angle = tileAngle(id);
      return (
        1.025 *
        (Math.abs(direction.x * Math.cos(angle) - direction.z * Math.sin(angle)) +
          Math.abs(direction.x * Math.sin(angle) + direction.z * Math.cos(angle)))
      );
    };
    assert.ok(pa.distanceTo(pb) - extent(a) - extent(b) > 1, `no natural gap at ${a}`);
    const curve = routeCurve(i);
    assert.ok(curve.getPoint(0).setY(0).distanceTo(pa) < 1e-8);
    assert.ok(curve.getPoint(1).setY(0).distanceTo(pb) < 1e-8);
    for (let t = 0; t <= 1; t += 0.125) {
      const point = curve.getPoint(t);
      for (const id of ROUTE)
        if (id !== a && id !== b)
          assert.ok(point.distanceTo(tilePosition(id)) > 2, `road crosses tile ${id}`);
    }
  }
});
test('actual movement reaches new cities, pays start income only at the route boundary and permits landing construction', () => {
  let s = make();
  s.players[0].pos = 3;
  s.players[0].cards = [8, 8];
  s = command(s, { type: 'card', index: 0 });
  assert.equal(s.players[0].pos, 40);
  assert.equal(s.phase, 'buy');
  s = command(s, { type: 'buy' });
  assert.equal(s.assets[40].owner, 0);
  s.players[0].pos = 3;
  s = command(s, { type: 'card', index: 0 });
  assert.equal(s.phase, 'develop');
  s = command(s, { type: 'develop', choice: 'build' });
  assert.equal(s.assets[40].level, 1);
  assert.deepEqual(deserialize(serialize(s)), s);
  s = make();
  s.players[0].pos = 39;
  s.players[0].cards = [8];
  const cash = s.players[0].cash;
  s = command(s, { type: 'card', index: 0 });
  assert.equal(s.players[0].pos, 61);
  assert.equal(s.players[0].cash, cash);
  s = make();
  s.players[0].pos = 63;
  s.players[0].cards = [8];
  s = command(s, { type: 'card', index: 0 });
  assert.equal(s.players[0].pos, 0);
  assert.equal(s.players[0].cash, cash + 200);
});
test('classic backward event follows the expanded route without paying start income', () => {
  let s = make(false);
  const preview = command(s, { type: 'roll' }),
    steps = preview.dice.reduce((a, b) => a + b);
  s.players[0].pos = advanceTile(2, -steps);
  s.eventDeck = [9, ...s.eventDeck.filter((id) => id !== 9)];
  s.eventCursor = 0;
  const cash = s.players[0].cash;
  s = command(s, { type: 'roll' });
  assert.equal(s.players[0].pos, 63);
  // The forward dice movement crossed start once; the backwards event grants nothing.
  assert.equal(s.players[0].cash, cash + 200);
});
test('v2 migration retains assets, guards, pending trade and combat; creates only unowned new cities', () => {
  let s = make();
  s.assets[39].owner = 0;
  s.players[0].generals[0].guard = 39;
  phase(s, 'trade', {
    from: 0,
    target: 1,
    resume: 'end',
    data: {},
    offer: { to: 1, give: 39, take: -1, giveCash: 0, takeCash: 0, giveEscape: 0, takeEscape: 0 },
  });
  let migrated = deserialize(oldSave(s));
  assert.deepEqual(migrated.assets.slice(0, 40), s.assets.slice(0, 40));
  assert.deepEqual(migrated.decision, s.decision);
  assert.equal(migrated.players[0].generals[0].guard, 39);
  assert.ok(migrated.assets.slice(40).every((a) => a.owner === -1 && a.level === 0 && !a.mortgaged));
  assert.match(migrated.log.at(-1), /64格/);
  assert.deepEqual(deserialize(serialize(migrated)), migrated);
  s = make();
  s.assets[1].owner = 1;
  s.players[0].pos = 1;
  phase(s, 'rent', { tile: 1, creditor: 1, amount: 2 });
  s = command(s, { type: 'siege', generals: [0] });
  migrated = deserialize(oldSave(s));
  assert.deepEqual(migrated.battle, s.battle);
  assert.equal(migrated.players[0].food, s.players[0].food);
  assert.deepEqual(
    command(migrated, { type: 'attack', target: 10 }).battle,
    command(s, { type: 'attack', target: 10 }).battle,
  );
});
test('migration rejects fake expanded v2 maps and out-of-range old references', () => {
  const s = make();
  assert.throws(
    () => deserialize(JSON.stringify({ format: 'dingli-save', version: 2, state: { ...s, version: 2 } })),
    /40格/,
  );
  s.players[0].pos = 63;
  assert.throws(() => deserialize(oldSave(s)), /范围/);
  s.players[0].pos = 0;
  phase(s, 'buy', { tile: 63 });
  assert.throws(() => deserialize(oldSave(s)), /范围/);
});
