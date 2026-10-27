import { GENERALS, LORDS } from '../data/game.js';
import { skillById } from '../data/skills.js';
import {
  MAX_LEVEL,
  UNLOCK_LEVELS,
  ROLES,
  LORD_ROLES,
  LORD_TROOPS,
  TITLES,
  RELICS,
  xpNeeded,
} from '../data/progression.js';

export const fighters = (p) => (p.hero ? [p.hero, ...p.generals] : p.generals);
export const fighter = (p, id) => (id === -1 ? p.hero : p.generals.find((g) => g.id === id));
export const fighterName = (p, g) => (g.id === -1 ? LORDS[p.lord].name : GENERALS[g.id].name);
export const fighterRole = (p, g) => (g.id === -1 ? LORD_ROLES[p.lord] : GENERALS[g.id].role);
export const fighterTroop = (p, g) => (g.id === -1 ? LORD_TROOPS[p.lord] : GENERALS[g.id].troop);
export const baseSkill = (p, g) => (g.id === -1 ? 100 + p.lord : g.id);
export function skillPath(p, g) {
  const start = 200 + ROLES.indexOf(fighterRole(p, g)) * 5;
  const tactical = 400 + ROLES.indexOf(fighterRole(p, g)) * 2;
  return [baseSkill(p, g), start, tactical, start + 1, start + 2, tactical + 1, start + 3, start + 4];
}
export const unlockedSkills = (p, g) => skillPath(p, g).filter((_, i) => g.level >= UNLOCK_LEVELS[i]);
export const equippedSkills = (g) => [...g.loadout, ...(g.manual >= 0 ? [300 + g.manual] : [])];
export function makeFighter(id, level = 1, lord = 0) {
  const g = {
    id,
    level,
    xp: 0,
    injury: 0,
    guard: -1,
    gear: Array(6).fill(null),
    loadout: [],
    manual: -1,
    relic: null,
    title: Math.floor(level / 5) - 1,
  };
  g.loadout = unlockedSkills({ lord }, g).slice(0, 2);
  return g;
}
export function gainExperience(p, g, amount) {
  if (!Number.isSafeInteger(amount) || amount < 0) throw Error('经验奖励不合法');
  const from = g.level,
    previous = unlockedSkills(p, g),
    oldTitle = Math.floor(from / 5) - 1;
  if (g.level < MAX_LEVEL) g.xp += amount;
  while (g.level < MAX_LEVEL && g.xp >= xpNeeded(g.level)) {
    g.xp -= xpNeeded(g.level);
    g.level++;
  }
  if (g.level === MAX_LEVEL) g.xp = 0;
  const fresh = unlockedSkills(p, g).filter((id) => !previous.includes(id));
  for (const id of fresh) if (g.loadout.length < 2) g.loadout.push(id);
  const newTitle = Math.floor(g.level / 5) - 1;
  if (g.title === oldTitle) g.title = newTitle;
  return {
    owner: p.id,
    gid: g.id,
    name: fighterName(p, g),
    xp: from === MAX_LEVEL ? 0 : amount,
    from,
    to: g.level,
    unlocked: [
      ...fresh.map((id) => skillById(id).name),
      ...TITLES.filter((t) => t.level > from && t.level <= g.level).map((t) => t.name),
    ],
  };
}
export function relicFor(p, g) {
  const item = p.relics.find((x) => x.id === g.relic);
  return item ? RELICS[item.type] : null;
}
export function validateProgression(p, g) {
  const integer = (n, min, max) => Number.isSafeInteger(n) && n >= min && n <= max;
  if (!integer(g.level, 1, MAX_LEVEL) || !integer(g.xp, 0, g.level === MAX_LEVEL ? 0 : xpNeeded(g.level) - 1))
    throw Error('人物等级或经验异常');
  const available = unlockedSkills(p, g);
  if (
    !Array.isArray(g.loadout) ||
    !g.loadout.length ||
    g.loadout.length > 2 ||
    new Set(g.loadout).size !== g.loadout.length ||
    g.loadout.some((id) => !available.includes(id))
  )
    throw Error('人物技能未解锁或配装异常');
  if (!integer(g.title, -1, TITLES.length - 1) || (g.title >= 0 && TITLES[g.title].level > g.level))
    throw Error('称号尚未解锁');
  if (!integer(g.manual, -1, 5) || (g.manual >= 0 && !p.manuals.includes(g.manual)))
    throw Error('秘法未学习');
  if (g.relic !== null && !p.relics.some((x) => x.id === g.relic)) throw Error('宝物引用失效');
}
