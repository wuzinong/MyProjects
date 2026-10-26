import { assertState } from './engine.js';
import { VERSION, GENERALS, LORDS, MAP, SHOP_PRICES, HOUSE_SUPPLY, PALACE_SUPPLY } from '../data/game.js';
import { STATUS_NAMES, skillById } from '../data/skills.js';
import { makeFighter, fighter, equippedSkills, fighterTroop } from './progression.js';

const MAX_BYTES = 2 * 1024 * 1024;
function record(x) {
  return x !== null && typeof x === 'object' && !Array.isArray(x);
}
function requireKeys(value, keys, label) {
  if (!record(value) || keys.some((k) => !Object.hasOwn(value, k))) throw Error(`${label}字段不完整`);
}
export function serialize(state) {
  assertState(state);
  return JSON.stringify({ format: 'dingli-save', version: VERSION, state });
}
export function deserialize(text) {
  if (typeof text !== 'string' || text.length > MAX_BYTES) throw Error('存档超过2MB或不是文本');
  let root;
  try {
    root = JSON.parse(text);
  } catch {
    throw Error('无法解析存档：不是有效JSON');
  }
  requireKeys(root, ['format', 'version', 'state'], '存档');
  if (
    root.format !== 'dingli-save' ||
    ![1, 2, 3, VERSION].includes(root.version) ||
    root.state?.version !== root.version
  )
    throw Error('存档版本不兼容，支持版本1、2、3迁移与版本4');
  const s = root.state;
  requireKeys(
    s,
    [
      'version',
      'seed',
      'enhanced',
      'players',
      'assets',
      'turn',
      'round',
      'phase',
      'decision',
      'dice',
      'doubles',
      'extra',
      'log',
      'sequence',
      'houses',
      'palaces',
      'alliances',
      'battle',
      'nextItem',
      'auctionQueue',
      'auctionReturn',
      'eventDeck',
      'eventCursor',
    ],
    '游戏',
  );
  if (
    typeof s.enhanced !== 'boolean' ||
    !Array.isArray(s.players) ||
    !Array.isArray(s.assets) ||
    !Array.isArray(s.log) ||
    s.log.length > 160 ||
    s.log.some((x) => typeof x !== 'string' || x.length > 1000)
  )
    throw Error('游戏结构或日志不合法');
  for (const p of s.players) {
    requireKeys(
      p,
      [
        'id',
        'lord',
        'ai',
        'name',
        'cash',
        'pos',
        'out',
        'jail',
        'escape',
        'food',
        'material',
        'pity',
        'generals',
        'items',
        'cards',
        'siegeRound',
        'shield',
        'discount',
        'usedCards',
        'completed',
        'tradeRound',
        'allianceRound',
      ],
      '玩家',
    );
    if (
      !Array.isArray(p.generals) ||
      p.generals.length > (root.version < 4 ? 40 : GENERALS.length) ||
      !Array.isArray(p.items) ||
      p.items.length > 3000 ||
      !Array.isArray(p.cards) ||
      p.cards.length > 10
    )
      throw Error('武将、背包或手牌数量不合法');
  }
  if (root.version === 1) {
    s.combatEvent = null;
    if (s.battle) {
      if (!Array.isArray(s.battle.units)) throw Error('旧档战斗单位结构无效');
      s.battle.units.forEach((u) => {
        requireKeys(u, ['id', 'hp'], '旧档单位');
        u.shield = 0;
        u.statuses = [];
      });
    }
    for (const p of s.players) {
      num(p.pos, 0, 39);
      let tile = p.pos;
      while (tile > 0 && MAP[tile].group < 0) tile--;
      p.region = MAP[tile].group >= 0 ? MAP[tile].group : 0;
    }
  }
  const legacy = root.version < 3;
  if (legacy) {
    if (s.assets.length !== 40) throw Error('旧版存档必须是40格地图');
    num(s.houses, 0, 32);
    num(s.palaces, 0, 12);
    s.houses += HOUSE_SUPPLY - 32;
    s.palaces += PALACE_SUPPLY - 12;
    s.players.forEach((p) => {
      num(p.pos, 0, 39);
      p.generals.forEach((g) => num(g.guard, -1, 39));
    });
    s.assets.push(...MAP.slice(40).map(() => ({ owner: -1, level: 0, mortgaged: false })));
    s.version = VERSION;
  }
  if (root.version < 4) {
    for (const p of s.players) {
      num(p.lord, 0, 6);
      p.hero = s.enhanced ? makeFighter(-1, 1, p.lord) : null;
      p.manuals = [];
      p.relics = [];
      p.loot = [];
      p.generals = p.generals.map((g) => {
        requireKeys(g, ['id', 'level', 'injury', 'guard', 'gear'], '旧武将');
        num(g.id, 0, 39);
        num(g.level, 1, 10);
        const fresh = makeFighter(g.id, g.level);
        return { ...fresh, injury: g.injury, guard: g.guard, gear: g.gear };
      });
    }
    if (s.battle) {
      if (!Array.isArray(s.battle.units)) throw Error('旧档战斗单位结构无效');
      for (const u of s.battle.units) {
        num(u.gid, -2, 39);
        u.skills = u.gid === -2 ? [] : [u.gid >= 0 ? u.gid : -1];
        u.cooldowns = u.skills.map(() => u.cooldown);
        u.regen = 0;
      }
    }
    s.reports = [];
    s.version = VERSION;
    s.log.push('已迁移群英成长：原武将等级和装备保留，经验从该等级起计；主公1级加入，旧战斗不增补参战者。');
    if (s.log.length > 160) s.log.shift();
  }
  for (const p of s.players) {
    requireKeys(p, ['hero', 'manuals', 'relics', 'loot'], '人物成长');
    if (s.enhanced)
      requireKeys(p.hero, ['id', 'level', 'xp', 'gear', 'loadout', 'manual', 'relic', 'title'], '主公');
  }
  requireKeys(s, ['combatEvent'], '游戏');
  if (
    !record(s.decision) ||
    !Array.isArray(s.alliances) ||
    s.alliances.length > 2 ||
    !Array.isArray(s.auctionQueue) ||
    s.auctionQueue.length > (legacy ? 40 : MAP.length)
  )
    throw Error('决策或盟约结构不合法');
  assertState(s);
  validatePending(s, legacy ? 40 : MAP.length);
  if (legacy) {
    s.log.push('旧档已迁移至64格山水地图：原资产与建筑保留，24座新城无主；集齐区域需包括新城。');
    if (s.log.length > 160) s.log.shift();
  }
  return s;
}
function num(n, min, max) {
  if (!Number.isInteger(n) || n < min || n > max) throw Error('存档数值超出范围');
}
function validatePending(s, tileCount) {
  const player = (id) => num(id, 0, s.players.length - 1),
    tile = (id) => num(id, 0, tileCount - 1);
  const decisions = new Set([
    'roll',
    'buy',
    'rent',
    'end',
    'event',
    'shop',
    'develop',
    'auction',
    'debt',
    'trade',
    'alliance',
    'battle',
    'discard',
    'over',
  ]);
  function pending(name, d, depth = 0) {
    if (depth > 5 || !record(d)) throw Error('存档决策层级不合法');
    if (['buy', 'rent', 'auction', 'event', 'shop', 'develop'].includes(name)) tile(d.tile);
    if (name === 'develop') {
      const a = s.assets[d.tile];
      if (
        !s.enhanced ||
        s.players[s.turn].pos !== d.tile ||
        a.owner !== s.turn ||
        a.mortgaged ||
        a.level >= 5 ||
        MAP[d.tile].kind !== 'city'
      )
        throw Error('落点建设状态无效');
    }
    if (name === 'shop') {
      if (
        !s.enhanced ||
        MAP[d.tile].kind !== 'event' ||
        s.players[s.turn].pos !== d.tile ||
        !Array.isArray(d.offers) ||
        d.offers.length !== 3
      )
        throw Error('秘密商店状态无效');
      const ids = [];
      d.offers.forEach((o) => {
        requireKeys(o, ['item', 'price', 'sold'], '商店报价');
        requireKeys(o.item, ['id', 'slot', 'quality'], '商店装备');
        num(o.item.id, 1, s.nextItem - 1);
        num(o.item.slot, 0, 5);
        num(o.item.quality, 0, 4);
        if (typeof o.sold !== 'boolean' || o.price !== SHOP_PRICES[o.item.quality])
          throw Error('秘密商店价格或库存异常');
        const owners = s.players.filter((p) => p.items.some((x) => x.id === o.item.id));
        if (o.sold ? owners.length !== 1 || owners[0].id !== s.turn : owners.length !== 0)
          throw Error('商店装备归属异常');
        if (o.sold) {
          const item = owners[0].items.find((i) => i.id === o.item.id);
          if (item.slot !== o.item.slot || item.quality !== o.item.quality)
            throw Error('已售装备与商店记录不符');
        }
        ids.push(o.item.id);
      });
      if (new Set(ids).size !== 3) throw Error('商店装备重复');
    }
    if (name === 'rent') {
      player(d.creditor);
      num(d.amount, 0, 10000000);
    }
    if (name === 'auction') {
      player(d.actor);
      num(d.bidder, -1, s.players.length - 1);
      num(d.bid, 0, 10000000);
      if (!Array.isArray(d.passed) || d.passed.length > s.players.length) throw Error('拍卖数据不合法');
      d.passed.forEach(player);
    }
    if (name === 'debt') {
      player(d.debtor);
      num(d.creditor, -1, s.players.length - 1);
      num(d.amount, 0, 10000000);
      if (!decisions.has(d.after) && d.after !== 'move') throw Error('偿债后续阶段不合法');
      if (d.after === 'move') num(d.data?.steps, 1, 12);
      else pending(d.after, d.data || {}, depth + 1);
    }
    if (name === 'trade' || name === 'alliance') {
      player(d.from);
      player(d.target);
      if (!decisions.has(d.resume)) throw Error('提案恢复阶段不合法');
      pending(d.resume, d.data || {}, depth + 1);
      if (name === 'trade') {
        requireKeys(
          d.offer,
          ['to', 'give', 'take', 'giveCash', 'takeCash', 'giveEscape', 'takeEscape'],
          '交易',
        );
        player(d.offer.to);
        num(d.offer.give, -1, tileCount - 1);
        num(d.offer.take, -1, tileCount - 1);
        ['giveCash', 'takeCash', 'giveEscape', 'takeEscape'].forEach((k) => num(d.offer[k], 0, 10000000));
      }
    }
    if (name === 'discard') {
      if (!decisions.has(d.resume)) throw Error('弃牌恢复阶段不合法');
      pending(d.resume, d.data, depth + 1);
    }
  }
  pending(s.phase, s.decision);
  if (s.phase === 'battle' || s.battle) {
    requireKeys(
      s.battle,
      ['city', 'attacker', 'defender', 'round', 'units', 'order', 'cursor', 'cardUsed', 'log'],
      '战斗',
    );
    const b = s.battle;
    tile(b.city);
    player(b.attacker);
    player(b.defender);
    num(b.round, 1, 10);
    if (
      !Array.isArray(b.units) ||
      b.units.length < 3 ||
      b.units.length > 9 ||
      !Array.isArray(b.order) ||
      b.order.length < 2
    )
      throw Error('战斗单位不合法');
    const ids = new Set();
    b.units.forEach((u) => {
      requireKeys(
        u,
        [
          'id',
          'side',
          'gid',
          'name',
          'troop',
          'hp',
          'max',
          'atk',
          'def',
          'speed',
          'cooldown',
          'shield',
          'statuses',
        ],
        '单位',
      );
      num(u.id, 0, 19);
      num(u.side, 0, 1);
      num(u.gid, -3, GENERALS.length - 1);
      ['max', 'atk', 'def', 'speed', 'cooldown'].forEach((k) => num(u[k], 0, 100000));
      num(u.hp, 0, u.max);
      num(u.shield, 0, u.max * 2);
      if (
        !Array.isArray(u.statuses) ||
        u.statuses.length > 5 ||
        new Set(u.statuses.map((x) => x?.kind)).size !== u.statuses.length
      )
        throw Error('战斗状态异常');
      u.statuses.forEach((x) => {
        requireKeys(x, ['kind', 'power', 'turns'], '状态');
        if (!Object.hasOwn(STATUS_NAMES, x.kind)) throw Error('未知战斗状态');
        num(x.power, 0, 100);
        num(x.turns, 1, 3);
      });
      const owner = s.players[u.side === 0 ? b.attacker : b.defender];
      const character = u.gid === -3 || u.gid >= 0 ? fighter(owner, u.gid === -3 ? -1 : u.gid) : null;
      if ((u.gid === -3 || u.gid >= 0) && !character) throw Error('战斗人物不属于该玩家');
      const expected =
        u.gid >= 0
          ? GENERALS[u.gid].name
          : u.gid === -3
            ? LORDS[owner.lord].name
            : u.gid === -1
              ? '守城军'
              : '城墙';
      const troop = character ? fighterTroop(owner, character) : u.gid === -1 ? '步' : '墙';
      if (u.name !== expected || u.troop !== troop) throw Error('战斗单位身份异常');
      const allowed = character ? equippedSkills(character) : u.gid === -1 ? [-1] : [];
      if (
        !Array.isArray(u.skills) ||
        u.skills.length > 3 ||
        (u.gid !== -2 && !u.skills.length) ||
        new Set(u.skills).size !== u.skills.length ||
        u.skills.some((id) => !allowed.includes(id)) ||
        !Array.isArray(u.cooldowns) ||
        u.cooldowns.length !== u.skills.length
      )
        throw Error('战斗技能配装异常');
      u.cooldowns.forEach((n) => num(n, 0, 10));
      num(u.regen, 0, 20);
      if (u.gid === -2 ? u.id !== 19 || u.side !== 1 : Math.floor(u.id / 10) !== u.side || u.id % 10 > 3)
        throw Error('战斗单位编号与阵营不符');
      if (u.gid === -1 && u.side !== 1) throw Error('基础守军阵营异常');
      ids.add(u.id);
    });
    if (
      ids.size !== b.units.length ||
      b.order.some((id) => !ids.has(id)) ||
      new Set(b.order).size !== b.order.length ||
      b.order.includes(19) ||
      b.order.length !== b.units.filter((u) => u.gid !== -2).length ||
      b.units.filter((u) => u.gid === -2).length !== 1 ||
      new Set(b.units.map((u) => `${u.side}:${u.gid}`)).size !== b.units.length
    )
      throw Error('战斗行动顺序异常');
    num(b.cursor, 0, b.order.length - 1);
    if (b.units.find((u) => u.id === b.order[b.cursor]).hp <= 0) throw Error('当前单位已经退场');
    if (
      b.attacker !== s.turn ||
      b.defender === b.attacker ||
      MAP[b.city].kind !== 'city' ||
      s.assets[b.city].owner !== b.defender
    )
      throw Error('战斗产权关系异常');
    if (
      !Array.isArray(b.log) ||
      b.log.length > 30 ||
      b.log.some((x) => typeof x !== 'string' || x.length > 300)
    )
      throw Error('战斗日志异常');
    if (s.phase !== 'battle' && !(s.phase === 'discard' && s.decision.resume === 'battle'))
      throw Error('战斗阶段不一致');
  }
  if (s.combatEvent !== null) {
    const e = s.combatEvent;
    requireKeys(e, ['actor', 'kind', 'skillId', 'units'], '战斗演出');
    num(e.actor, 0, 19);
    if (!Number.isInteger(e.skillId) || !skillById(e.skillId)) throw Error('战斗演出技能异常');
    if (!['attack', 'skill', 'battleCard'].includes(e.kind) || !Array.isArray(e.units) || e.units.length > 9)
      throw Error('战斗演出数据异常');
    e.units.forEach((u) => {
      requireKeys(u, ['id', 'hp', 'shield'], '演出单位');
      num(u.id, 0, 19);
      num(u.hp, 0, 100000);
      num(u.shield, 0, 200000);
    });
  }
  const allies = [];
  s.alliances.forEach((a) => {
    player(a.a);
    player(a.b);
    num(a.expires, s.round + 1, 10000000);
    allies.push(a.a, a.b);
    if (a.a === a.b || s.players[a.a].out || s.players[a.b].out) throw Error('盟约对象异常');
  });
  if (new Set(allies).size !== allies.length) throw Error('同一玩家不能有多个盟友');
  if (!Array.isArray(s.reports) || s.reports.length > 20 || (!s.enhanced && s.reports.length))
    throw Error('战报列表异常');
  for (const r of s.reports) {
    requireKeys(r, ['round', 'city', 'attacker', 'defender', 'win', 'entries', 'loot'], '战报');
    num(r.round, 1, s.round);
    tile(r.city);
    player(r.attacker);
    player(r.defender);
    if (
      typeof r.win !== 'boolean' ||
      !Array.isArray(r.entries) ||
      r.entries.length > 8 ||
      !Array.isArray(r.loot) ||
      r.loot.length > 1 ||
      r.loot.some((x) => typeof x !== 'string' || x.length > 200)
    )
      throw Error('战报内容异常');
    for (const e of r.entries) {
      player(e.owner);
      num(e.gid, -1, GENERALS.length - 1);
      num(e.xp, 0, 1000);
      num(e.from, 1, 50);
      num(e.to, e.from, 50);
      const name = e.gid === -1 ? LORDS[s.players[e.owner].lord].name : GENERALS[e.gid].name;
      if (
        e.name !== name ||
        !Array.isArray(e.unlocked) ||
        e.unlocked.length > 15 ||
        e.unlocked.some((x) => typeof x !== 'string' || x.length > 40)
      )
        throw Error('战报人物异常');
    }
  }
  const items = s.players.flatMap((p) => [...p.items, ...p.relics].map((x) => x.id));
  if (new Set(items).size !== items.length || items.some((id) => id >= s.nextItem))
    throw Error('装备实例序号异常');
  if (!Array.isArray(s.eventDeck) || s.eventDeck.length !== 12 || new Set(s.eventDeck).size !== 12)
    throw Error('事件牌堆异常');
  s.eventDeck.forEach((id) => num(id, 0, 11));
  num(s.eventCursor, 0, 10000000);
  if (!Array.isArray(s.dice) || s.dice.length !== 2) throw Error('骰子数据异常');
  s.dice.forEach((d) => num(d, 1, 6));
}
