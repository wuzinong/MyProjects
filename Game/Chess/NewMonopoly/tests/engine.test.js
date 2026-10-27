import test from 'node:test';
import assert from 'node:assert/strict';
import { MAP, GENERALS, CARDS, validateData, HOUSE_SUPPLY, PALACE_SUPPLY } from '../src/data/game.js';
import {
  createGame,
  command,
  rent,
  assertState,
  phase,
  recruit,
  stats,
  liquidationValue,
  siegeReason,
} from '../src/core/engine.js';
const game = (enhanced = false, count = 3) =>
  createGame(
    Array.from({ length: count }, (_, lord) => ({ lord, ai: false })),
    enhanced,
    42,
  );
const own = (s, id, p = 0) => {
  s.assets[id].owner = p;
};
test('content: 64 tiles, real unique roster and complete enhancement card set', () => {
  assert.equal(validateData(), true);
  assert.equal(GENERALS.length, 90);
  assert.equal(CARDS.length, 24);
});
test('reject commands atomically and keep seeded outcomes deterministic', () => {
  const s = game(),
    copy = structuredClone(s);
  assert.throws(() => command(s, { type: 'buy' }));
  assert.deepEqual(s, copy);
  assert.deepEqual(command(s, { type: 'roll' }), command(copy, { type: 'roll' }));
});
test('classic mode has no hidden enhancement economy', () => {
  const s = game();
  assert.equal(s.players[0].food, 0);
  assert.equal(s.players[0].generals.length, 0);
  assert.throws(() => command(s, { type: 'recruit' }), /增强/);
});
test('full set doubles unimproved rent, mortgage suspends rent', () => {
  const s = game();
  own(s, 1);
  assert.equal(rent(s, 1), 2);
  own(s, 3);
  MAP.filter((t) => t.group === 0).forEach((t) => own(s, t.id));
  assert.equal(rent(s, 1), 4);
  s.assets[1].mortgaged = true;
  assert.equal(rent(s, 1), 0);
});
test('construction requires even builds; palace conversion preserves inventory', () => {
  let s = game();
  s.players[0].cash = 10000;
  own(s, 1);
  own(s, 3);
  const group = MAP.filter((t) => t.group === 0).map((t) => t.id);
  group.forEach((id) => own(s, id));
  s = command(s, { type: 'asset', action: 'build', tile: 1 });
  assert.throws(() => command(s, { type: 'asset', action: 'build', tile: 1 }), /均匀/);
  for (let level = 0; level < 5; level++)
    for (const tile of group) {
      if (level === 0 && tile === 1) continue;
      s = command(s, { type: 'asset', action: 'build', tile });
    }
  assert.equal(s.houses, HOUSE_SUPPLY);
  assert.equal(s.palaces, PALACE_SUPPLY - group.length);
  assert.equal(s.assets[1].level, 5);
  assert.throws(() => command(s, { type: 'asset', action: 'mortgage', tile: 1 }), /拆除/);
  s = command(s, { type: 'asset', action: 'demolish', tile: 1 });
  assert.equal(s.palaces, PALACE_SUPPLY);
});
test('mortgage and redemption include 10 percent interest on principal', () => {
  let s = game();
  own(s, 1);
  s = command(s, { type: 'asset', action: 'mortgage', tile: 1 });
  assert.equal(s.players[0].cash, 1530);
  s = command(s, { type: 'asset', action: 'redeem', tile: 1 });
  assert.equal(s.players[0].cash, 1497);
});
test('all players can auction; last bidder pays precisely once', () => {
  let s = game();
  phase(s, 'buy', { tile: 1 });
  s = command(s, { type: 'auction' });
  s = command(s, { type: 'bid', amount: 50 });
  s = command(s, { type: 'pass' });
  s = command(s, { type: 'pass' });
  assert.equal(s.assets[1].owner, 0);
  assert.equal(s.players[0].cash, 1450);
  assert.equal(s.phase, 'end');
});
test('auction with no bids leaves asset unowned', () => {
  let s = game();
  phase(s, 'buy', { tile: 1 });
  s = command(s, { type: 'auction' });
  for (let i = 0; i < 3; i++) s = command(s, { type: 'pass' });
  assert.equal(s.assets[1].owner, -1);
  assert.equal(s.phase, 'end');
});
test('debt cannot be skipped and can be resolved with mortgage', () => {
  let s = game();
  own(s, 39);
  s.players[0].cash = 10;
  phase(s, 'rent', { creditor: 1, amount: 100, tile: 3 });
  s = command(s, { type: 'pay' });
  assert.equal(s.phase, 'debt');
  assert.throws(() => command(s, { type: 'bankrupt' }), /尚可/);
  s = command(s, { type: 'asset', action: 'mortgage', tile: 39 });
  s = command(s, { type: 'pay' });
  assert.equal(s.players[0].cash, 110);
  assert.equal(s.players[1].cash, 1600);
  assert.equal(s.phase, 'end');
});
test('bankruptcy to bank schedules auctions and removes dead player', () => {
  let s = game();
  s.players[0].cash = 0;
  own(s, 1);
  phase(s, 'debt', { debtor: 0, creditor: -1, amount: 1000, after: 'end' });
  s = command(s, { type: 'bankrupt' });
  assert.equal(s.players[0].out, true);
  assert.equal(s.phase, 'auction');
  s = command(s, { type: 'pass' });
  s = command(s, { type: 'pass' });
  s = command(s, { type: 'end' });
  assert.equal(s.turn, 1);
});
test('remaining two survivors dissolve alliances; last survivor wins', () => {
  let s = game(true);
  s.alliances = [{ a: 1, b: 2, expires: 4 }];
  s.players[0].cash = 0;
  phase(s, 'debt', { debtor: 0, creditor: 1, amount: 9000, after: 'end' });
  s = command(s, { type: 'bankrupt' });
  assert.equal(s.alliances.length, 0);
  s.players[1].cash = 0;
  phase(s, 'debt', { debtor: 1, creditor: 2, amount: 9000, after: 'end' });
  s = command(s, { type: 'bankrupt' });
  assert.equal(s.phase, 'over');
});
test('trade is consent-based and checks mortgage transfer interest', () => {
  let s = game();
  own(s, 1);
  own(s, 3, 1);
  s.assets[3].mortgaged = true;
  const offer = { to: 1, give: 1, take: 3, giveCash: 30, takeCash: 0, giveEscape: 0, takeEscape: 0 };
  s = command(s, { type: 'trade', offer });
  assert.equal(s.assets[1].owner, 0);
  s = command(s, { type: 'accept' });
  assert.equal(s.assets[1].owner, 1);
  assert.equal(s.assets[3].owner, 0);
  assert.equal(s.players[0].cash, 1467);
});
test('pity, duplicate recruitment and equipment stat reversibility', () => {
  const s = game(true),
    p = s.players[0];
  p.pity = 19;
  const id = recruit(s, p, true);
  assert.equal(GENERALS[id].rarity, 3);
  assert.equal(p.pity, 0);
  const g = p.generals[0],
    before = stats(p, g);
  p.items.push({ id: 999, slot: 2, quality: 4 });
  g.gear[2] = 999;
  assert.equal(stats(p, g).atk, before.atk + 20);
  g.gear[2] = null;
  assert.deepEqual(stats(p, g), before);
});
test('alliance cannot be formed in two-player game and expires by full round', () => {
  assert.throws(() => command(game(true, 2), { type: 'alliance', target: 1 }), /至少三人/);
  let s = game(true);
  s = command(s, { type: 'alliance', target: 1 });
  s = command(s, { type: 'accept' });
  assert.equal(s.alliances[0].expires, 4);
  for (let i = 0; i < 9; i++) {
    phase(s, 'end');
    s = command(s, { type: 'end' });
  }
  assert.equal(s.round, 4);
  assert.equal(s.alliances.length, 0);
});
test('functional card limit, hand overflow and restoration of unresolved event', () => {
  let s = game(true);
  s.players[0].cards = Array(8).fill(0);
  phase(s, 'event', { tile: 17 });
  s = command(s, { type: 'event', choice: 'card' });
  assert.equal(s.phase, 'discard');
  s = command(s, { type: 'discard', index: 0 });
  assert.equal(s.phase, 'end');
  s = command(s, { type: 'card', index: 0 });
  s = command(s, { type: 'card', index: 0 });
  assert.throws(() => command(s, { type: 'card', index: 0 }), /两张/);
});
test('siege enforces food, ownership, alliance and per-round limit', () => {
  const s = game(true),
    p = s.players[0];
  own(s, 1, 1);
  s.players[0].pos = 1;
  phase(s, 'rent', { tile: 1, creditor: 1, amount: 2 });
  p.food = 0;
  assert.match(siegeReason(s, p, 1), /粮/);
  p.food = 60;
  p.siegeRound = 1;
  assert.match(siegeReason(s, p, 1), /本轮/);
  p.siegeRound = 0;
  s.alliances = [{ a: 0, b: 1, expires: 4 }];
  assert.match(siegeReason(s, p, 1), /盟约/);
});
test('manual combat changes state, resolves walls, captures ownership and returns to board', () => {
  let s = game(true);
  own(s, 1, 1);
  s.players[0].pos = 1;
  phase(s, 'rent', { tile: 1, creditor: 1, amount: 2 });
  s.players[0].generals[0].level = 10;
  s = command(s, { type: 'siege', generals: [0] });
  s = command(s, { type: 'defend', generals: s.players[1].generals.map((g) => g.id), hero: false });
  assert.equal(s.players[0].food, 40);
  for (let i = 0; i < 80 && s.phase === 'battle'; i++) {
    const b = s.battle,
      u = b.units.find((u) => u.id === b.order[b.cursor]);
    const target = b.units.filter((x) => x.side !== u.side && x.hp > 0).sort((a, b) => a.hp - b.hp)[0];
    s = command(s, { type: u.cooldown === 0 ? 'skill' : 'attack', target: target.id });
  }
  assert.notEqual(s.phase, 'battle');
  assert.equal(s.assets[1].owner, 0);
  assert.equal(s.players[0].cash, 1500);
});
test('captured uneven group can recover without creating inventory', () => {
  const s = game(true);
  own(s, 1);
  own(s, 3, 1);
  s.assets[3].level = 1;
  s.houses--;
  assert.equal(liquidationValue(s, s.players[0]), 1500);
  assertState(s);
});
test('guard cannot double occupy and trade releases the former garrison', () => {
  let s = game(true);
  own(s, 1);
  s = command(s, { type: 'guard', general: 0, tile: 1 });
  s = command(s, {
    type: 'trade',
    offer: { to: 1, give: 1, take: -1, giveCash: 0, takeCash: 50, giveEscape: 0, takeEscape: 0 },
  });
  s = command(s, { type: 'accept' });
  assert.equal(s.players[0].generals[0].guard, -1);
});
test('source map keeps special assets outside building groups', () => {
  assert.ok(MAP.filter((t) => t.kind !== 'city').every((t) => t.group === -1));
});
test('bankrupt players cannot negotiate a new alliance before their turn is skipped', () => {
  let s = game(true, 4);
  s.players[0].cash = 0;
  phase(s, 'debt', { debtor: 0, creditor: 1, amount: 5000, after: 'end' });
  s = command(s, { type: 'bankrupt' });
  assert.equal(s.phase, 'end');
  assert.throws(() => command(s, { type: 'alliance', target: 1 }), /增强管理/);
  s = command(s, { type: 'end' });
  assert.equal(s.turn, 1);
});
