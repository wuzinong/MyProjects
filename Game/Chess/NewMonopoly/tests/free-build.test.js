import test from 'node:test';
import assert from 'node:assert/strict';
import { createGame, command, phase, rent, liquidationValue } from '../src/core/engine.js';
import { serialize, deserialize } from '../src/core/save.js';
import { choose } from '../src/ai/strategy.js';
import { MAP, HOUSE_SUPPLY, PALACE_SUPPLY } from '../src/data/game.js';

const make = (enhanced = false, freeBuild = false) =>
  createGame(
    [
      { lord: 0, ai: false },
      { lord: 1, ai: true },
    ],
    enhanced,
    42,
    freeBuild,
  );
const build = (s, tile = 1) => command(s, { type: 'asset', action: 'build', tile });

test('free construction is opt-in and independently upgrades a lone city in either mode', () => {
  for (const enhanced of [false, true]) {
    const standard = make(enhanced);
    standard.assets[1].owner = 0;
    assert.throws(() => build(standard), /集齐/);
    let s = make(enhanced, true);
    s.assets[1].owner = 0;
    s.players[0].cash = 10000;
    const cost = MAP[1].build;
    for (let level = 1; level <= 5; level++) {
      s = build(s);
      assert.equal(s.assets[1].level, level);
      assert.equal(s.players[0].cash, 10000 - cost * level);
    }
    assert.equal(s.houses, HOUSE_SUPPLY);
    assert.equal(s.palaces, PALACE_SUPPLY - 1);
    assert.throws(() => build(s), /最高级/);
    assert.equal(s.players[0].pos, 0);
  }
});
test('free construction retains ownership, mortgage, inventory, funds and phase restrictions', () => {
  const s = make(false, true);
  assert.throws(() => build(s), /自己/);
  s.assets[1].owner = 0;
  s.assets[1].mortgaged = true;
  assert.throws(() => build(s), /抵押/);
  s.assets[1].mortgaged = false;
  s.players[0].cash = 0;
  assert.throws(() => build(s), /金币/);
  s.players[0].cash = 1500;
  s.houses = 0;
  assert.throws(() => build(s), /库存/);
  s.houses = HOUSE_SUPPLY;
  phase(s, 'debt', { debtor: 0, creditor: -1, amount: 2000, after: 'end', data: {} });
  assert.throws(() => build(s), /偿债/);
  phase(s, 'buy', { tile: 3 });
  assert.throws(() => build(s), /阶段/);
  phase(s, 'roll');
  s.assets[5].owner = 0;
  assert.throws(() => build(s, 5), /城池/);
});
test('one-way enable is a saved human management command, not a mid-decision toggle', () => {
  const s = make();
  const enabled = command(s, { type: 'enableFreeBuild' });
  assert.equal(s.freeBuild, false);
  assert.equal(enabled.freeBuild, true);
  assert.equal(enabled.players[0].cash, s.players[0].cash);
  assert.deepEqual(deserialize(serialize(enabled)), enabled);
  assert.throws(() => command(enabled, { type: 'enableFreeBuild' }), /已开启/);
  phase(s, 'buy', { tile: 1 });
  assert.throws(() => command(s, { type: 'enableFreeBuild' }), /整备/);
  phase(s, 'roll');
  s.turn = 1;
  assert.throws(() => command(s, { type: 'enableFreeBuild' }), /真人/);
});
test('v4 saves preserve existing buildings and RNG and migrate with free construction disabled', () => {
  const s = make(true, true);
  s.assets[1].owner = 0;
  const developed = build(s);
  const old = { ...developed, version: 4 };
  delete old.freeBuild;
  const migrated = deserialize(JSON.stringify({ format: 'dingli-save', version: 4, state: old }));
  assert.equal(migrated.freeBuild, false);
  assert.equal(migrated.seed, old.seed);
  assert.deepEqual(migrated.assets, old.assets);
  assert.deepEqual(migrated.players, old.players);
  const invalid = JSON.parse(serialize(developed));
  delete invalid.state.freeBuild;
  assert.throws(() => deserialize(JSON.stringify(invalid)), /自由建造/);
  invalid.state.freeBuild = 'true';
  assert.throws(() => deserialize(JSON.stringify(invalid)), /自由建造/);
});
test('free construction does not grant set rent bonuses or let other owners block liquidation', () => {
  let s = make(false, true);
  const group = MAP.filter((t) => t.group === MAP[1].group);
  s.assets[1].owner = 0;
  assert.equal(rent(s, 1), MAP[1].rent[0]);
  const peer = group.find((t) => t.id !== 1);
  s.assets[peer.id].owner = 1;
  s.assets[peer.id].level = 1;
  s.houses--;
  assert.equal(liquidationValue(s, s.players[0]), 1500 + MAP[1].price / 2);
  s = command(s, { type: 'asset', action: 'mortgage', tile: 1 });
  assert.equal(s.assets[1].mortgaged, true);
  s = command(s, { type: 'asset', action: 'redeem', tile: 1 });
  s = command(s, {
    type: 'trade',
    offer: { to: 1, give: 1, take: -1, giveCash: 0, takeCash: 0, giveEscape: 0, takeEscape: 0 },
  });
  s = command(s, { type: 'accept' });
  assert.equal(s.assets[1].owner, 1);
  group.forEach((t) => {
    s.assets[t.id].owner = 1;
  });
  assert.equal(rent(s, 1), MAP[1].rent[0] * 2);
});
test('AI builds and retains isolated cities instead of demolishing them in a loop', () => {
  let s = make(false, true);
  s.assets[1].owner = 0;
  const c = choose(s);
  assert.deepEqual(c, { type: 'asset', action: 'build', tile: 1 });
  s = command(s, c);
  assert.notEqual(choose(s).action, 'demolish');
});
test('free construction AI games finish with 2/3/4 players in both rule sets', () => {
  for (const enhanced of [false, true])
    for (const count of [2, 3, 4]) {
      let s = createGame(
        Array.from({ length: count }, (_, lord) => ({ lord, ai: true })),
        enhanced,
        2468 + count,
        true,
      );
      let actions = 0;
      for (; s.phase !== 'over' && actions < 20000; actions++) s = command(s, choose(s));
      assert.equal(s.phase, 'over', `freeBuild ${enhanced}/${count}: ${actions} actions`);
    }
});
