import { MAP, CARDS } from '../data/game.js';
import { skillFor } from '../data/skills.js';
import { skillTargets } from '../core/combat.js';
import { fighters, unlockedSkills } from '../core/progression.js';
import {
  actorId,
  active,
  owned,
  complete,
  groupTiles,
  buildCost,
  readyGenerals,
  stats,
  siegeReason,
  currentUnit,
  liquidationValue,
  canAlly,
} from '../core/engine.js';

function building(s, p) {
  return owned(s, p.id).find((t) => {
    const a = s.assets[t.id],
      group = groupTiles(t.id);
    return (
      t.kind === 'city' &&
      complete(s, t.id, p.id) &&
      a.level < 5 &&
      !group.some((x) => s.assets[x.id].mortgaged) &&
      group.every((x) => s.assets[x.id].level >= a.level) &&
      p.cash > buildCost(s, p, t.id) + 160 &&
      (a.level === 4 ? s.palaces > 0 : s.houses > 0)
    );
  });
}
function tradeValue(s, p, id) {
  if (id < 0) return 0;
  const t = MAP[id],
    a = s.assets[id],
    peers = groupTiles(id);
  const multiplier =
    peers.length && peers.filter((x) => x.id !== id).every((x) => s.assets[x.id].owner === p.id) ? 2.4 : 1.05;
  return t.price * multiplier * (a.mortgaged ? 0.55 : 1);
}
function findTrade(s, p) {
  if (p.tradeRound === s.round) return null;
  for (const t of MAP) {
    const owner = s.assets[t.id].owner,
      group = groupTiles(t.id),
      held = group.filter((x) => s.assets[x.id].owner === p.id).length;
    if (
      owner < 0 ||
      owner === p.id ||
      !group.length ||
      group.some((x) => s.assets[x.id].level) ||
      held < 2 ||
      s.players.some((peer) => {
        if (peer.id === p.id || peer.out) return false;
        const count = group.filter((x) => s.assets[x.id].owner === peer.id).length;
        return count > held || (count === held && peer.id < p.id);
      })
    )
      continue;
    const peer = s.players[owner];
    const swap = owned(s, p.id).find(
      (x) =>
        x.group >= 0 &&
        x.group !== t.group &&
        groupTiles(x.id).every(
          (y) => !s.assets[y.id].level && (y.id === x.id || s.assets[y.id].owner === owner),
        ),
    );
    const giveCash = swap
      ? Math.max(0, Math.ceil(tradeValue(s, peer, t.id) - tradeValue(s, peer, swap.id) + 30))
      : Math.ceil(t.price * 1.4);
    if (p.cash - giveCash < 150) continue;
    return {
      type: 'trade',
      offer: {
        to: owner,
        give: swap ? swap.id : -1,
        take: t.id,
        giveCash,
        takeCash: 0,
        giveEscape: 0,
        takeEscape: 0,
      },
    };
  }
  return null;
}
export function chooseBattle(s) {
  const b = s.battle,
    u = currentUnit(s),
    p = s.players[actorId(s)];
  const targets = b.units.filter((x) => x.side !== u.side && x.hp > 0).sort((a, b) => a.hp - b.hp);
  const target = targets[0];
  if (!b.cardUsed) {
    const index = p.cards.findIndex((id) => {
      const c = CARDS[id];
      if (c.timing !== 'battle') return false;
      if (c.effect === 'wall') return u.side === 0 && b.units.find((x) => x.gid === -2).hp > 0;
      if (['heal', 'teamheal'].includes(c.effect)) return u.hp < u.max - 25;
      return true;
    });
    if (index >= 0) return { type: 'battleCard', index, target: target.id };
  }
  const choices = [];
  if (!u.statuses.some((x) => x.kind === 'silence'))
    for (const [slot, id] of u.skills.entries()) {
      if ((slot === 0 ? u.cooldown : u.cooldowns[slot]) > 0) continue;
      const skill = skillFor(u, id),
        available = skillTargets(b, u, skill);
      const choice = available.sort((a, b) => {
        if (skill.target === 'ally')
          return a.hp / a.max - a.cooldown * 0.12 - (b.hp / b.max - b.cooldown * 0.12);
        if (skill.wall > 1) return (a.gid === -2 ? -1 : 0) - (b.gid === -2 ? -1 : 0) || a.hp - b.hp;
        return a.hp - b.hp;
      })[0];
      if (choice) {
        const affected = ['enemy', 'ally'].includes(skill.target) ? [choice] : available;
        const score =
          affected.reduce(
            (n, t) =>
              n +
              (t.side !== u.side
                ? skill.power * skill.hits * u.atk + skill.statuses.length * 12
                : Math.min(t.max - t.hp, skill.heal + (t.max - t.hp) * skill.healMissing) +
                  Math.max(0, skill.shield - t.shield) * 0.5 +
                  skill.attack * 3 +
                  skill.defense * 2),
            0,
          ) +
          Math.max(0, skill.selfShield - u.shield) * 0.3 +
          skill.selfAttack * 3;
        choices.push({ id, target: choice.id, score });
      }
    }
  choices.sort((a, b) => b.score - a.score);
  if (choices[0]?.score > u.atk * 0.6)
    return { type: 'skill', skill: choices[0].id, target: choices[0].target };
  return { type: 'attack', target: target.id };
}
export function choose(s) {
  const p = s.players[actorId(s)];
  if (p.out && s.phase === 'end') return { type: 'end' };
  switch (s.phase) {
    case 'over':
      return null;
    case 'battle':
      return chooseBattle(s);
    case 'discard': {
      let index = p.cards.findIndex((id) => CARDS[id].timing === 'battle');
      if (index < 0) index = 0;
      return { type: 'discard', index };
    }
    case 'buy': {
      const t = MAP[s.decision.tile];
      return { type: p.cash >= t.price + 70 ? 'buy' : 'auction' };
    }
    case 'develop': {
      const id = s.decision.tile,
        a = s.assets[id];
      const affordable = p.cash > buildCost(s, p, id) + 180;
      const inventory = a.level === 4 ? s.palaces > 0 : s.houses > 0;
      // Scattered buildings lock region trades and exhaust the shared housing stock.
      return { type: 'develop', choice: affordable && inventory && complete(s, id, p.id) ? 'build' : 'skip' };
    }
    case 'shop': {
      const index = s.decision.offers.findIndex(
        (o) =>
          !o.sold &&
          p.cash > o.price + 450 &&
          !p.items.some((i) => i.slot === o.item.slot && i.quality >= o.item.quality),
      );
      return index >= 0 ? { type: 'shopBuy', index } : { type: 'shopLeave' };
    }
    case 'auction': {
      const value = tradeValue(s, p, s.decision.tile),
        bid = s.decision.bid + 10;
      return bid <= Math.min(p.cash - 50, value) ? { type: 'bid', amount: bid } : { type: 'pass' };
    }
    case 'rent': {
      if (s.enhanced && !siegeReason(s, p, s.decision.tile)) {
        const troops = readyGenerals(p)
          .sort((a, b) => stats(p, b).hp + stats(p, b).atk * 4 - (stats(p, a).hp + stats(p, a).atk * 4))
          .slice(0, 3);
        const a = s.assets[s.decision.tile],
          enemy = s.players[a.owner],
          guards = enemy.generals.filter((g) => g.guard === s.decision.tile && g.injury === 0);
        const hero = p.hero.injury === 0;
        const power = [...troops, ...(hero ? [p.hero] : [])].reduce(
          (n, g) => n + stats(p, g).hp + stats(p, g).atk * 4,
          0,
        );
        const defense =
          (guards.reduce((n, g) => n + stats(enemy, g).hp + stats(enemy, g).atk * 4, 0) ||
            200 + a.level * 45) +
          (enemy.pos === s.decision.tile && enemy.hero.injury === 0
            ? stats(enemy, enemy.hero).hp + stats(enemy, enemy.hero).atk * 4
            : 0);
        const completesRegion = groupTiles(s.decision.tile)
          .filter((t) => t.id !== s.decision.tile)
          .every((t) => s.assets[t.id].owner === p.id);
        const protectsSolvency = s.decision.amount > liquidationValue(s, p);
        if ((completesRegion || protectsSolvency) && power > defense + 90 + a.level * 30)
          return { type: 'siege', hero, generals: troops.map((g) => g.id) };
      }
      return { type: 'pay' };
    }
    case 'debt': {
      if (p.cash >= s.decision.amount) return { type: 'pay' };
      const buildings = owned(s, p.id).find((t) => s.assets[t.id].level > 0);
      if (buildings) return { type: 'asset', action: 'demolish', tile: buildings.id };
      const asset = owned(s, p.id).find(
        (t) => !s.assets[t.id].mortgaged && groupTiles(t.id).every((x) => !s.assets[x.id].level),
      );
      if (asset) return { type: 'asset', action: 'mortgage', tile: asset.id };
      if (liquidationValue(s, p) < s.decision.amount) return { type: 'bankrupt' };
      throw Error('AI偿债决策无法继续，请导出存档');
    }
    case 'event':
      return {
        type: 'event',
        choice: [2, 22].includes(s.decision.tile)
          ? 'recruit'
          : s.decision.tile === 33
            ? 'gear'
            : s.decision.tile === 7 && p.food < 30 && p.cash > 80
              ? 'food'
              : 'card',
      };
    case 'trade': {
      const o = s.decision.offer;
      const gain = tradeValue(s, p, o.give) + o.giveCash + o.giveEscape * 30;
      const loss = tradeValue(s, p, o.take) + o.takeCash + o.takeEscape * 30;
      return { type: gain >= loss && p.cash >= o.takeCash ? 'accept' : 'reject' };
    }
    case 'alliance':
      return { type: 'accept' };
    default:
      break;
  }
  // Captures split developed regions; reclaim capital so their land can be traded again.
  const stranded = owned(s, p.id).find((t) => s.assets[t.id].level > 0 && !complete(s, t.id, p.id));
  if (stranded) return { type: 'asset', action: 'demolish', tile: stranded.id };
  const build = building(s, p);
  if (build) return { type: 'asset', action: 'build', tile: build.id };
  const redeemed = owned(s, p.id).find((t) => s.assets[t.id].mortgaged && p.cash > t.price * 0.55 + 300);
  if (redeemed) return { type: 'asset', action: 'redeem', tile: redeemed.id };
  const trade = findTrade(s, p);
  if (trade) return trade;
  if (s.enhanced) {
    if (p.usedCards < 2) {
      const index = p.cards.findIndex(
        (id) => CARDS[id].timing === 'board' && !['move', 'home'].includes(CARDS[id].effect),
      );
      if (index >= 0) return { type: 'card', index };
    }
    for (const g of fighters(p)) {
      for (let slot = 0; slot < 6; slot++) {
        const best = p.items
          .filter((x) => x.slot === slot && !fighters(p).some((y) => y.gear.includes(x.id)))
          .sort((a, b) => b.quality - a.quality)[0];
        const current = p.items.find((x) => x.id === g.gear[slot]);
        if (best && (!current || best.quality > current.quality))
          return { type: 'equip', general: g.id, slot, item: best.id };
      }
      if (g.manual < 0 && p.manuals.length) return { type: 'manual', general: g.id, index: p.manuals[0] };
      if (g.relic === null) {
        const relic = p.relics.find((x) => !fighters(p).some((f) => f.relic === x.id));
        if (relic) return { type: 'relic', general: g.id, item: relic.id };
      }
      const learned = unlockedSkills(p, g);
      if (learned.length > 1 && !g.loadout.includes(learned.at(-1)))
        return { type: 'loadSkill', general: g.id, slot: 1, skill: learned.at(-1) };
    }
    if ((p.generals.length < 3 && p.cash > 700) || (p.generals.length < 6 && p.cash > 1500))
      return { type: 'recruit' };
    const train = fighters(p).find(
      (g) =>
        g.level < Math.min(50, Math.max(6, p.hero.level)) &&
        p.material >= g.level &&
        p.cash > g.level * 30 + 500,
    );
    if (train) return { type: 'train', general: train.id };
    if (p.pos === 7 && p.food < 60 && p.cash > 200) return { type: 'food' };
    const undefended = owned(s, p.id)
      .filter(
        (t) =>
          t.kind === 'city' &&
          complete(s, t.id, p.id) &&
          p.generals.filter((g) => g.guard === t.id).length < 3,
      )
      .sort((a, b) => s.assets[b.id].level - s.assets[a.id].level)[0];
    if (undefended && readyGenerals(p).length > 1) {
      const defender = readyGenerals(p).sort(
        (a, b) => stats(p, b).hp + stats(p, b).atk * 4 - stats(p, a).hp - stats(p, a).atk * 4,
      )[0];
      return { type: 'guard', general: defender.id, tile: undefended.id };
    }
    if (p.allianceRound !== s.round && p.cash < 400) {
      const peer = s.players.find((x) => canAlly(s, p.id, x.id) && x.cash >= p.cash);
      if (peer) return { type: 'alliance', target: peer.id };
    }
  }
  if (s.phase === 'roll') {
    if (p.jail >= 0 && (p.escape > 0 || p.cash > 400)) return { type: 'release', card: p.escape > 0 };
    return { type: 'roll' };
  }
  if (s.phase === 'end') return { type: 'end' };
  throw Error(`AI不认识阶段：${s.phase} / ${active(s).name}`);
}
