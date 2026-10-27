import test from 'node:test';
import assert from 'node:assert/strict';
import { createGame, command, phase } from '../src/core/engine.js';
import { serialize, deserialize } from '../src/core/save.js';

const make = () =>
  createGame(
    [
      { lord: 0, ai: false },
      { lord: 1, ai: true },
    ],
    true,
    99,
  );
test('save restores random sequence and unmodified future actions', () => {
  const s = make(),
    restored = deserialize(serialize(s));
  assert.deepEqual(restored, s);
  assert.deepEqual(command(restored, { type: 'roll' }), command(s, { type: 'roll' }));
});
test('pending auction, debt, trade and combat round-trip', () => {
  let s = make();
  phase(s, 'buy', { tile: 1 });
  s = command(s, { type: 'auction' });
  assert.deepEqual(deserialize(serialize(s)), s);
  phase(s, 'debt', { debtor: 0, creditor: 1, amount: 1600, after: 'end', data: {} });
  assert.deepEqual(deserialize(serialize(s)), s);
  phase(s, 'end');
  s.assets[1].owner = 1;
  s = command(s, {
    type: 'trade',
    offer: { to: 1, give: -1, take: 1, giveCash: 200, takeCash: 0, giveEscape: 0, takeEscape: 0 },
  });
  assert.deepEqual(deserialize(serialize(s)), s);
  s.players[0].pos = 1;
  phase(s, 'rent', { tile: 1, creditor: 1, amount: 2 });
  s = command(s, { type: 'siege', generals: [0] });
  s = command(s, { type: 'defend', generals: s.players[1].generals.map((g) => g.id), hero: false });
  s.battle.cursor = s.battle.order.indexOf(0);
  const restored = deserialize(serialize(s));
  assert.deepEqual(
    command(restored, { type: 'attack', target: 10 }),
    command(s, { type: 'attack', target: 10 }),
  );
});
test('invalid, incompatible, oversized, broken references and inventory reject clearly', () => {
  assert.throws(() => deserialize('{'), /JSON/);
  assert.throws(() => deserialize(' '.repeat(2 * 1024 * 1024 + 1)), /2MB/);
  let root = JSON.parse(serialize(make()));
  root.version = 999;
  assert.throws(() => deserialize(JSON.stringify(root)), /版本/);
  root = JSON.parse(serialize(make()));
  root.state.players[0].generals[0].gear[0] = 99999;
  assert.throws(() => deserialize(JSON.stringify(root)), /装备/);
  root = JSON.parse(serialize(make()));
  root.state.houses = 0;
  assert.throws(() => deserialize(JSON.stringify(root)), /库存/);
});
