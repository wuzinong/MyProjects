import test from 'node:test';
import assert from 'node:assert/strict';
import { createGame, command, stats, phase, currentUnit, awardLoot } from '../src/core/engine.js';
import { choose, chooseBattle } from '../src/ai/strategy.js';
import { skillFor, ADVANCED_SKILLS, LORD_SKILLS, MANUAL_SKILLS } from '../src/data/skills.js';
import { skillTargets } from '../src/core/combat.js';
import { makeFighter, gainExperience, skillPath } from '../src/core/progression.js';
import { xpNeeded, MAX_LEVEL } from '../src/data/progression.js';
import { serialize, deserialize } from '../src/core/save.js';

const game = (enhanced = true) =>
  createGame(
    [
      { lord: 0, ai: false },
      { lord: 1, ai: true },
    ],
    enhanced,
    42,
  );

test('experience thresholds unlock skills and titles, retain excess, and cap at 50', () => {
  const p = game().players[0],
    g = p.hero;
  gainExperience(p, g, xpNeeded(1) - 1);
  assert.equal(g.level, 1);
  gainExperience(p, g, 1);
  assert.equal(g.level, 2);
  assert.equal(g.xp, 0);
  const amount = [2, 3, 4].reduce((n, level) => n + xpNeeded(level), 0) + 9;
  const report = gainExperience(p, g, amount);
  assert.equal(g.level, 5);
  assert.equal(g.xp, 9);
  assert.equal(g.title, 0);
  assert.ok(g.loadout.includes(skillPath(p, g)[1]));
  assert.ok(report.unlocked.includes('侍中'));
  gainExperience(p, g, 1000000);
  assert.equal(g.level, MAX_LEVEL);
  assert.equal(g.xp, 0);
  assert.equal(g.title, 9);
  assert.equal(gainExperience(p, g, 100).xp, 0);
  assert.throws(() => gainExperience(p, g, -1), /经验/);
});
test('locked skills and titles reject atomically, unlocked choices do not stack', () => {
  let s = game();
  const path = skillPath(s.players[0], s.players[0].hero);
  const before = structuredClone(s);
  assert.throws(() => command(s, { type: 'loadSkill', general: -1, slot: 1, skill: path[1] }), /解锁/);
  assert.throws(() => command(s, { type: 'title', general: -1, index: 0 }), /解锁/);
  assert.deepEqual(s, before);
  gainExperience(s.players[0], s.players[0].hero, 10000);
  s = command(s, { type: 'loadSkill', general: -1, slot: 1, skill: path[2] });
  assert.throws(() => command(s, { type: 'loadSkill', general: -1, slot: 0, skill: path[2] }), /重复/);
  const noTitle = command(s, { type: 'title', general: -1, index: -1 });
  const base = stats(noTitle.players[0], noTitle.players[0].hero);
  s = command(s, { type: 'title', general: -1, index: 0 });
  assert.ok(stats(s.players[0], s.players[0].hero).hp > base.hp);
  s = command(s, { type: 'title', general: -1, index: -1 });
  assert.deepEqual(stats(s.players[0], s.players[0].hero), base);
});
test('training grants experience rather than bypassing levels, and max level training is rejected', () => {
  let s = game();
  const cash = s.players[0].cash;
  s = command(s, { type: 'train', general: -1 });
  assert.equal(s.players[0].hero.level, 1);
  assert.ok(s.players[0].hero.xp > 0);
  assert.equal(s.players[0].cash, cash - 30);
  s.players[0].hero = makeFighter(-1, 50, 0);
  assert.throws(() => command(s, { type: 'train', general: -1 }), /等级未满/);
});
test('lord and generals cannot share the same equipment or relic instance', () => {
  let s = game();
  const p = s.players[0],
    item = p.items[0];
  s = command(s, { type: 'equip', general: -1, slot: item.slot, item: item.id });
  assert.throws(() => command(s, { type: 'equip', general: 0, slot: item.slot, item: item.id }), /已被穿戴/);
  s.players[0].relics.push({ id: s.nextItem++, type: 0 });
  const relic = s.players[0].relics[0].id;
  s = command(s, { type: 'relic', general: -1, item: relic });
  assert.throws(() => command(s, { type: 'relic', general: 0, item: relic }), /已被装备/);
});
test('classic mode rejects hero progression and enhanced equipment management', () => {
  const s = game(false);
  assert.equal(s.players[0].hero, null);
  for (const type of ['train', 'title', 'manual', 'relic', 'loadSkill'])
    assert.throws(() => command(s, { type, general: -1, index: 0 }), /增强/);
});

function siege(hero = true, generals = []) {
  const s = game();
  s.assets[1].owner = 1;
  s.players[0].pos = 1;
  phase(s, 'rent', { tile: 1, creditor: 1, amount: 2 });
  return command(s, { type: 'siege', hero, generals });
}
test('lord can fight alone with a distinct skill and no remote defending lord', () => {
  const s = siege();
  const lord = s.battle.units.find((u) => u.gid === -3);
  assert.equal(lord.name, '刘备');
  assert.deepEqual(lord.skills, [100]);
  assert.equal(s.battle.units.filter((u) => u.side === 0).length, 1);
  assert.equal(s.battle.units.filter((u) => u.gid === -3).length, 1);
  assert.equal(s.players[0].food, 40);
});
test('lord defense is local, and four-person formation uses unique unit IDs', () => {
  let s = game();
  s.players[0].generals = [0, 1, 2].map((id) => makeFighter(id));
  s.players[1].generals = [13, 14, 15].map((id) => ({ ...makeFighter(id), guard: 1 }));
  s.players[1].pos = 1;
  s.players[0].pos = 1;
  s.assets[1].owner = 1;
  phase(s, 'rent', { tile: 1, creditor: 1, amount: 2 });
  s = command(s, { type: 'siege', hero: true, generals: [0, 1, 2] });
  assert.equal(s.battle.units.length, 9);
  assert.equal(new Set(s.battle.units.map((u) => u.id)).size, 9);
  assert.equal(s.battle.units.filter((u) => u.gid === -3).length, 2);
});
test('all participants including defeated lord receive experience exactly once', () => {
  let s = siege(true, [0]);
  const before = s.players[0].hero.xp;
  for (let steps = 0; s.phase === 'battle' && steps < 200; steps++) s = command(s, chooseBattle(s));
  assert.notEqual(s.phase, 'battle');
  assert.equal(s.reports.length, 1);
  assert.equal(s.reports[0].entries.filter((e) => e.owner === 0).length, 2);
  assert.ok(s.players[0].hero.xp !== before || s.players[0].hero.level > 1);
  assert.equal(s.players[0].out, false);
  const xp = s.players[0].hero.xp;
  assert.throws(() => command(s, { type: 'attack', target: 10 }), /不在战斗/);
  assert.equal(s.players[0].hero.xp, xp);
});
test('equipped advanced skills have independent cooldowns and reject unowned choices', () => {
  let s = game();
  s.players[0].hero = makeFighter(-1, 5, 0);
  s.assets[1].owner = 1;
  phase(s, 'rent', { tile: 1, creditor: 1, amount: 2 });
  s = command(s, { type: 'siege', hero: true, generals: [] });
  s.battle.cursor = s.battle.order.indexOf(3);
  assert.throws(() => command(s, { type: 'skill', skill: 300, target: 3 }), /未装备/);
  const first = currentUnit(s).skills[0],
    second = currentUnit(s).skills[1];
  s = command(s, { type: 'skill', skill: first, target: 3 });
  s.battle.cursor = s.battle.order.indexOf(3);
  assert.ok(currentUnit(s).cooldown > 0);
  assert.equal(currentUnit(s).cooldowns[1], 0);
  s = command(s, { type: 'skill', skill: second, target: 3 });
  const u = s.battle.units.find((u) => u.id === 3);
  assert.ok(u.cooldowns[1] > 0);
  assert.equal(u.cooldown, u.cooldowns[0]);
});
test('seeded loot covers each reward, duplicate manuals convert, and event reward cannot repeat', () => {
  const observed = new Set();
  for (let seed = 0; seed < 2000 && observed.size < 5; seed++) {
    const s = game(),
      p = s.players[0];
    s.seed = seed;
    const before = structuredClone(s);
    const loot = awardLoot(s, p, 'victory', '测试攻城');
    const clone = structuredClone(before);
    assert.deepEqual(awardLoot(clone, clone.players[0], 'victory', '测试攻城'), loot);
    if (!loot) {
      observed.add('none');
      continue;
    }
    observed.add(loot.kind);
    if (loot.kind === 'manual') {
      assert.ok(p.manuals.includes(loot.id));
      const material = p.material;
      s.seed = seed;
      const repeat = awardLoot(s, p, 'victory', '测试攻城');
      assert.equal(repeat.kind, 'material');
      assert.equal(p.material, material + 5);
      observed.add(repeat.kind);
    } else if (loot.kind === 'gear') assert.ok(p.items.some((i) => i.id === loot.id));
    else if (loot.kind === 'relic') assert.ok(p.relics.some((i) => i.id === loot.id));
  }
  assert.deepEqual([...observed].sort(), ['gear', 'manual', 'material', 'none', 'relic']);
  let s = game();
  phase(s, 'event', { tile: 2 });
  s = command(s, { type: 'event', choice: 'recruit' });
  assert.throws(() => command(s, { type: 'event', choice: 'recruit' }), /无格子事件/);
});
test('v3 64-cell saves retain levels, gear and old battle participants without adding a lord', () => {
  let s = siege(false, [0]);
  s.players[0].generals[0].level = 8;
  const root = JSON.parse(serialize(s));
  root.version = root.state.version = 3;
  for (const p of root.state.players) {
    delete p.hero;
    delete p.manuals;
    delete p.relics;
    delete p.loot;
    for (const g of p.generals)
      for (const key of ['xp', 'loadout', 'manual', 'relic', 'title']) delete g[key];
  }
  delete root.state.reports;
  for (const u of root.state.battle.units) for (const key of ['skills', 'cooldowns', 'regen']) delete u[key];
  const migrated = deserialize(JSON.stringify(root));
  assert.equal(migrated.version, 4);
  assert.equal(migrated.assets.length, 64);
  assert.equal(migrated.players[0].generals[0].level, 8);
  assert.equal(migrated.players[0].hero.level, 1);
  assert.deepEqual(
    migrated.battle.units.map((u) => u.gid),
    s.battle.units.map((u) => u.gid),
  );
  assert.deepEqual(deserialize(serialize(migrated)), migrated);
});
test('new battle, report and loot survive reload without repeating rewards; forged skills reject', () => {
  let s = siege(true, [0]);
  assert.deepEqual(deserialize(serialize(s)), s);
  const invalid = JSON.parse(serialize(s));
  invalid.state.battle.units.find((u) => u.gid === -3).skills = [300];
  assert.throws(() => deserialize(JSON.stringify(invalid)), /配装/);
  for (let i = 0; s.phase === 'battle' && i < 200; i++) s = command(s, chooseBattle(s));
  const seed = s.seed,
    report = structuredClone(s.reports),
    loot = structuredClone(s.players.map((p) => p.loot));
  const restored = deserialize(serialize(s));
  assert.equal(restored.seed, seed);
  assert.deepEqual(restored.reports, report);
  assert.deepEqual(
    restored.players.map((p) => p.loot),
    loot,
  );
});
test('striking a surviving wall does not invent a wall skill cooldown slot', () => {
  let s = siege(false, [0]);
  s.battle.cursor = s.battle.order.indexOf(0);
  const wall = s.battle.units.find((u) => u.gid === -2);
  wall.hp = wall.max = 1000;
  s = command(s, { type: 'skill', target: 19 });
  assert.deepEqual(s.battle.units.find((u) => u.gid === -2).cooldowns, []);
  assert.deepEqual(deserialize(serialize(s)), s);
});
for (const ability of [...LORD_SKILLS, ...ADVANCED_SKILLS, ...MANUAL_SKILLS]) {
  test(`unlocked skill ${ability.name} has a real effect and survives recovery`, () => {
    const lord = ability.id >= 100 && ability.id < 107;
    let s = createGame(
      [
        { lord: lord ? ability.id - 100 : 0, ai: false },
        { lord: lord && ability.id === 101 ? 0 : 1, ai: false },
      ],
      true,
      77,
    );
    const p = s.players[0];
    p.hero = makeFighter(-1, 50, p.lord);
    const gid =
      ability.id >= 200 && ability.id < 225 ? [1, 0, 4, 5, 7][Math.floor((ability.id - 200) / 5)] : 0;
    p.generals = [makeFighter(gid, 50)];
    if (!lord && ability.id < 300) p.generals[0].loadout = [ability.id];
    if (ability.id >= 300) {
      p.manuals = [ability.id - 300];
      p.generals[0].manual = ability.id - 300;
    }
    s.players[1].generals = [13, 14, 15].map((id) => ({ ...makeFighter(id, 50), guard: 1 }));
    s.assets[1].owner = 1;
    phase(s, 'rent', { tile: 1, creditor: 1, amount: 2 });
    s = command(s, { type: 'siege', hero: lord, generals: lord ? [] : [gid] });
    const u = s.battle.units.find((u) => u.side === 0);
    s.battle.cursor = s.battle.order.indexOf(u.id);
    s.battle.units.forEach((u) => {
      u.hp = Math.ceil(u.max * 0.6);
    });
    const target = skillTargets(s.battle, u, skillFor(u, ability.id))[0];
    const before = s.battle.units.map(({ id, hp, shield }) => ({ id, hp, shield }));
    s = command(s, { type: 'skill', skill: ability.id, target: target.id });
    assert.notDeepEqual(s.combatEvent.units, before);
    assert.deepEqual(deserialize(serialize(s)), s);
  });
}
test('AI pays affordable rent rather than starting endless rent-avoidance wars', () => {
  const s = game();
  s.players[0].hero = makeFighter(-1, 50, 0);
  s.players[0].cash = 1000;
  s.assets[11].owner = 1;
  phase(s, 'rent', { tile: 11, creditor: 1, amount: 950 });
  assert.equal(choose(s).type, 'pay');
});
test('AI releases captured fragments for trade even while the building bank has stock', () => {
  const s = game();
  s.assets[1] = { owner: 0, level: 1, mortgaged: false };
  s.houses--;
  phase(s, 'end');
  assert.deepEqual(choose(s), { type: 'asset', action: 'demolish', tile: 1 });
});
