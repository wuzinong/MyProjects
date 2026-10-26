import { STATUS_NAMES } from '../data/skills.js';

export function skillTargets(b, u, skill) {
  if (skill.target === 'self') return [u];
  const friendly = ['ally', 'allies'].includes(skill.target);
  return b.units.filter(
    (x) =>
      x.hp > 0 &&
      (friendly ? x.side === u.side : x.side !== u.side) &&
      (x.gid !== -2 || (!friendly && skill.target === 'enemy' && skill.power > 0)),
  );
}
export function addStatus(u, status) {
  if (u.gid === -2 || u.hp <= 0) return;
  const old = u.statuses.find((x) => x.kind === status.kind);
  u.statuses = u.statuses.filter((x) => x.kind !== status.kind);
  u.statuses.push({
    ...status,
    power: Math.max(old?.power || 0, status.power),
    turns: Math.max(old?.turns || 0, status.turns),
  });
}
export function damage(target, amount) {
  const shield = Math.min(target.shield, amount);
  target.shield -= shield;
  const lost = Math.min(target.hp, amount - shield);
  target.hp -= lost;
  return lost;
}
export function hit(b, u, target, roll, power = 1, pierce = 0, execute = 0, wallMultiplier = 1) {
  if (target.hp <= 0) return 0;
  const beats = { 步: '骑', 骑: '弓', 弓: '步' };
  const adv = beats[u.troop] === target.troop ? 1.3 : beats[target.troop] === u.troop ? 0.8 : 1;
  const wall = b.units.find((x) => x.gid === -2);
  const armor = target.side === 1 && target.gid !== -2 && wall?.hp > 0 ? 6 : 0;
  const attack = Math.max(5, u.atk - (u.statuses.find((x) => x.kind === 'weaken')?.power || 0));
  const vulnerable = target.statuses.find((x) => x.kind === 'vulnerable')?.power || 0;
  const bonus =
    (execute && target.hp / target.max < execute ? 1.6 : 1) * (target.gid === -2 ? wallMultiplier : 1);
  const amount = Math.max(
    5,
    Math.round(
      (attack * power * adv * (0.9 + roll() * 0.2) - (target.def + armor) * (1 - pierce) + vulnerable) *
        bonus,
    ),
  );
  const lost = damage(target, amount);
  b.log.push(`${u.name}命中${target.name}：${lost}生命伤害${amount > lost ? '（含护盾抵挡或溢出）' : ''}。`);
  return lost;
}
function heal(u, value) {
  if (u.hp > 0) u.hp = Math.min(u.max, u.hp + Math.round(value));
}
function shield(u, value) {
  if (u.hp > 0) u.shield = Math.min(u.max * 2, u.shield + value);
}
export function resolveSkill(b, u, target, skill, roll) {
  const available = skillTargets(b, u, skill);
  if (['enemy', 'ally'].includes(skill.target) && !available.includes(target))
    throw Error('请选择技能允许的存活目标');
  const targets = ['enemy', 'ally'].includes(skill.target) ? [target] : available;
  u.hp = Math.max(1, u.hp - skill.cost);
  let stolen = 0;
  for (const t of targets) {
    if (skill.breakShield) t.shield = 0;
    for (let i = 0; i < skill.hits && skill.power && t.hp > 0; i++)
      stolen += hit(b, u, t, roll, skill.power, skill.pierce, skill.execute, skill.wall);
    if (t.hp <= 0) continue;
    if (skill.cleanse) t.statuses = [];
    heal(t, skill.heal + (t.max - t.hp) * skill.healMissing);
    shield(t, skill.shield);
    t.def += skill.defense;
    t.atk += skill.attack;
    t.cooldown = Math.max(0, t.cooldown - skill.reduceCooldown);
    skill.statuses.forEach((status) => addStatus(t, status));
  }
  if (skill.splash)
    b.units
      .filter((t) => t.side !== u.side && t.hp > 0 && t.gid !== -2 && !targets.includes(t))
      .forEach((t) => hit(b, u, t, roll, skill.splash));
  heal(u, skill.selfHeal + stolen * skill.drain);
  shield(u, skill.selfShield);
  u.atk += skill.selfAttack;
  u.def += skill.selfDefense;
  const allies = b.units.filter((t) => t.side === u.side && t.hp > 0 && t.gid !== -2);
  allies.forEach((t) => {
    heal(t, skill.teamHeal);
    shield(t, skill.teamShield);
  });
  if (skill.lowestHeal) heal(allies.slice().sort((a, b) => a.hp / a.max - b.hp / b.max)[0], skill.lowestHeal);
  if (skill.selfVulnerable) addStatus(u, { kind: 'vulnerable', power: skill.selfVulnerable, turns: 2 });
  b.log.push(`${u.name}施展「${skill.name}」。`);
}
export function tickStatuses(b, u, ticking) {
  for (const status of ticking) {
    if (!u.statuses.includes(status)) continue;
    if (['burn', 'poison'].includes(status.kind) && u.hp > 0) {
      const lost = damage(u, status.power);
      b.log.push(`${u.name}受到${STATUS_NAMES[status.kind]}，损失${lost}生命。`);
    }
    status.turns--;
  }
  u.statuses = u.statuses.filter((x) => x.turns > 0);
}
