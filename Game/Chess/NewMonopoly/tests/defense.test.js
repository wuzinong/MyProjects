import test from 'node:test';
import assert from 'node:assert/strict';
import { createGame, command, phase, actorId, chooseDefense, currentUnit } from '../src/core/engine.js';
import { makeFighter, unlockedSkills } from '../src/core/progression.js';
import { serialize, deserialize } from '../src/core/save.js';
import { choose, chooseBattle } from '../src/ai/strategy.js';
import { hit, resolveSkill, addStatus } from '../src/core/combat.js';
import { skillById, TACTICAL_SKILLS } from '../src/data/skills.js';

function declaration() {
  const s = createGame(
    [
      { lord: 0, ai: false },
      { lord: 1, ai: false },
    ],
    true,
    91,
  );
  s.assets[1].owner = 1;
  s.players[0].pos = 1;
  s.players[0].generals = [makeFighter(0, 30)];
  s.players[1].generals = [13, 14, 15, 16].map((id) => makeFighter(id, 10));
  phase(s, 'rent', { tile: 1, creditor: 1, amount: 2 });
  return command(s, { type: 'siege', generals: [0], hero: true });
}
function battle() {
  const s = declaration();
  return command(s, chooseDefense(s));
}
test('declaration hands control to defender and persists the locked attackers without charging twice', () => {
  const s = declaration();
  assert.equal(s.phase, 'defense');
  assert.equal(actorId(s), 1);
  assert.equal(s.battle, null);
  assert.equal(s.players[0].food, 40);
  const restored = deserialize(serialize(s));
  assert.deepEqual(restored, s);
  assert.throws(() => command(s, { type: 'siege', generals: [0] }), /抵达/);
  assert.throws(() => command(s, { type: 'pay' }), /应付款/);
  const result = command(restored, { type: 'defend', generals: [14, 16], hero: true });
  assert.equal(result.players[0].food, 40);
  assert.equal(result.battle.units.filter((u) => u.side === 1 && u.gid >= 0).length, 2);
  assert.equal(result.battle.units.find((u) => u.side === 1 && u.gid === -3).name, '曹操');
  assert.equal(result.players[1].pos, 0);
  assert.equal(result.players[1].generals.find((g) => g.id === 14).guard, -1);
  assert.throws(() => command(result, chooseDefense(s)), /无需/);
});
test('local garrison is retained; injured and other-city soldiers cannot reinforce', () => {
  const s = declaration();
  s.players[1].generals[0].guard = 1;
  s.players[1].generals[1].injury = 1;
  s.assets[3].owner = 1;
  s.players[1].generals[2].guard = 3;
  for (const ids of [[13], [14], [15], [16, 16]])
    assert.throws(() => command(s, { type: 'defend', generals: ids, hero: false }), /援军/);
  const result = command(s, { type: 'defend', generals: [16], hero: false });
  assert.deepEqual(
    result.battle.units.filter((u) => u.side === 1 && u.gid >= 0).map((u) => u.gid),
    [13, 16],
  );
  assert.equal(result.players[1].generals[2].guard, 3);
});
test('available defenders must fight; basic guard is only a fallback when nobody can deploy', () => {
  const s = declaration();
  assert.throws(() => command(s, { type: 'defend', generals: [], hero: false }), /至少/);
  s.players[1].generals.forEach((g) => {
    g.injury = 1;
  });
  s.players[1].hero.injury = 1;
  const result = command(s, chooseDefense(s));
  assert.deepEqual(
    result.battle.units.filter((u) => u.side === 1).map((u) => u.gid),
    [-1, -2],
  );
});
test('AI reinforces with strongest available generals and shares the defense command', () => {
  const s = declaration();
  s.players[1].ai = true;
  s.players[1].generals[3] = makeFighter(16, 40);
  const action = choose(s);
  assert.equal(action.type, 'defend');
  assert.equal(action.hero, true);
  assert.equal(action.generals.length, 3);
  assert.equal(action.generals[0], 16);
  assert.equal(command(s, action).battle.units.length, 7);
});
test('pending defense rejects tampered references and v5 battle migration does not add defenders', () => {
  const raw = JSON.parse(serialize(declaration()));
  raw.state.decision.generals = [89];
  assert.throws(() => deserialize(JSON.stringify(raw)), /武将/);
  const old = battle();
  old.version = 5;
  const migrated = deserialize(JSON.stringify({ format: 'dingli-save', version: 5, state: old }));
  assert.deepEqual(migrated.battle, old.battle);
  assert.equal(migrated.freeBuild, old.freeBuild);
});
test('five role paths unlock new tactical skills without changing original skill IDs', () => {
  const s = declaration();
  for (const id of [0, 3, 4, 5, 7]) {
    const g = makeFighter(id, 30);
    const available = unlockedSkills(s.players[0], g);
    assert.equal(available.filter((n) => n >= 400).length, 2);
    assert.ok(available.includes(id));
  }
});
test('all new skills produce real control, shield, healing or counter effects', () => {
  for (const skill of TACTICAL_SKILLS) {
    const s = battle(),
      b = s.battle,
      u = b.units[0];
    b.units.forEach((t) => {
      t.hp = Math.ceil(t.hp * 0.6);
    });
    addStatus(u, { kind: 'disarm', power: 0, turns: 1 });
    const target = ['ally', 'self', 'allies'].includes(skill.target) ? u : b.units.find((t) => t.side === 1);
    const before = structuredClone(b.units);
    resolveSkill(b, u, target, skill, () => 0.5);
    assert.notDeepEqual(b.units, before, skill.name);
  }
});
test('stun has an explicit recovery action that ticks damage and cooldowns and can be saved', () => {
  let s = battle();
  const u = currentUnit(s);
  u.cooldown = u.cooldowns[0] = 2;
  addStatus(u, { kind: 'stun', power: 0, turns: 1 });
  addStatus(u, { kind: 'burn', power: 10, turns: 2 });
  const hp = u.hp;
  assert.throws(() => command(s, { type: 'attack', target: 10 }), /眩晕/);
  assert.deepEqual(chooseBattle(s), { type: 'recover' });
  s = command(deserialize(serialize(s)), { type: 'recover' });
  const result = s.battle.units.find((x) => x.id === u.id);
  assert.equal(result.hp, hp - 10 + result.regen);
  assert.equal(result.cooldown, 1);
  assert.ok(!result.statuses.some((x) => x.kind === 'stun'));
  assert.deepEqual(deserialize(serialize(s)), s);
});
test('disarm blocks basic attacks but permits skills; cleanse preserves positive counter stance', () => {
  let s = battle();
  const u = currentUnit(s);
  addStatus(u, { kind: 'disarm', power: 0, turns: 1 });
  addStatus(u, { kind: 'counter', power: 50, turns: 2 });
  assert.throws(() => command(s, { type: 'attack', target: 10 }), /缴械/);
  const target = s.battle.units.find((t) => t.side !== u.side);
  s = command(s, { type: 'skill', skill: u.skills[0], target: target.id });
  assert.ok(s.combatEvent);
  const b = battle().battle,
    ally = b.units[0];
  addStatus(ally, { kind: 'stun', power: 0, turns: 1 });
  addStatus(ally, { kind: 'counter', power: 50, turns: 2 });
  resolveSkill(b, ally, ally, skillById(408), () => 0.5);
  assert.deepEqual(
    ally.statuses.map((x) => x.kind),
    ['counter'],
  );
});
test('counter fires only once, cannot recurse, and stops multi-hit skills when attacker dies', () => {
  const b = battle().battle,
    u = b.units[0],
    target = b.units.find((t) => t.side === 1);
  u.hp = 1;
  u.shield = 0;
  target.hp = target.max = 10000;
  target.atk = 1000;
  addStatus(u, { kind: 'counter', power: 50, turns: 2 });
  addStatus(target, { kind: 'counter', power: 75, turns: 2 });
  const reactions = [];
  resolveSkill(b, u, target, skillById(2), () => 0.5, reactions);
  assert.equal(u.hp, 0);
  assert.equal(reactions.length, 1);
  assert.ok(u.statuses.some((x) => x.kind === 'counter'));
  assert.ok(!target.statuses.some((x) => x.kind === 'counter'));
  assert.equal(b.log.filter((x) => x.includes(`${u.name}命中`)).length, 1);
});
test('dead or stunned defenders cannot counter, and the wall is immune to character control', () => {
  for (const stunned of [false, true]) {
    const b = battle().battle,
      u = b.units[0],
      target = b.units.find((t) => t.side === 1),
      reactions = [];
    addStatus(target, { kind: 'counter', power: 75, turns: 2 });
    if (stunned) addStatus(target, { kind: 'stun', power: 0, turns: 1 });
    else {
      target.hp = 1;
      target.shield = 0;
    }
    hit(b, u, target, () => 0.5, 1, 0, 0, 1, reactions);
    assert.deepEqual(reactions, []);
    const wall = b.units.find((t) => t.gid === -2);
    addStatus(wall, { kind: 'stun', power: 0, turns: 1 });
    assert.deepEqual(wall.statuses, []);
  }
});
test('a lethal counter settles defense victory and participant experience once, including recovery from save', () => {
  let s = declaration();
  s.decision.hero = false;
  s = command(s, chooseDefense(s));
  s.battle.cursor = s.battle.order.indexOf(0);
  const u = currentUnit(s),
    target = s.battle.units.find((t) => t.id === 10);
  u.hp = 1;
  u.shield = 0;
  target.atk = 1000;
  target.hp = target.max = 2000;
  addStatus(target, { kind: 'counter', power: 75, turns: 2 });
  const result = command(deserialize(serialize(s)), { type: 'attack', target: 10 });
  assert.equal(result.battle, null);
  assert.equal(result.assets[1].owner, 1);
  assert.equal(result.reports.length, 1);
  assert.equal(result.reports[0].win, false);
  assert.equal(result.reports[0].entries.filter((e) => e.owner === 1).length, 4);
  assert.equal(result.players[0].generals[0].injury, 2);
  assert.equal(result.combatEvent.reactions.length, 1);
  assert.deepEqual(deserialize(serialize(result)), result);
  assert.throws(() => command(result, { type: 'attack', target: 10 }), /不在战斗/);
});
