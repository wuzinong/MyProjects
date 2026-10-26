import {
  VERSION,
  HOUSE_SUPPLY,
  PALACE_SUPPLY,
  MAP,
  ROUTE_INDEX,
  advanceTile,
  LORDS,
  GENERALS,
  CARDS,
  BONDS,
  EVENTS,
  BUILDING_NAMES,
  SHOP_CHANCE,
  SHOP_PRICES,
  ITEMS,
  QUALITY,
} from '../data/game.js';
import { skillFor, skillById } from '../data/skills.js';
import { MAX_LEVEL, TITLES, RELICS, LOOT_RATES, trainingExperience } from '../data/progression.js';
import {
  fighters,
  fighter,
  fighterName,
  fighterTroop,
  makeFighter,
  equippedSkills,
  unlockedSkills,
  gainExperience,
  relicFor,
  validateProgression,
} from './progression.js';
import { damage, hit, resolveSkill, tickStatuses } from './combat.js';

/** @typedef {{id:number, level:number, xp:number, injury:number, guard:number, gear:(number|null)[],loadout:number[],manual:number,relic:number|null,title:number}} General */
/** @typedef {{id:number, slot:number, quality:number}} Gear */
/** @typedef {{id:number,lord:number,ai:boolean,name:string,cash:number,pos:number,out:boolean,jail:number,escape:number,
 * food:number,material:number,pity:number,generals:General[],items:Gear[],cards:number[],siegeRound:number,
 * shield:number,discount:boolean,usedCards:number,completed:number,tradeRound:number,allianceRound:number,region:number,
 * hero:General|null,manuals:number[],relics:{id:number,type:number}[],loot:{round:number,source:string,kind:string,name:string,id:number}[]}} Player */
/** @typedef {{owner:number,level:number,mortgaged:boolean}} Asset */
/** @typedef {{kind:string,power:number,turns:number}} Status */
/** @typedef {{id:number,side:number,gid:number,name:string,troop:string,hp:number,max:number,atk:number,def:number,speed:number,cooldown:number,shield:number,statuses:Status[],skills:number[],cooldowns:number[],regen:number}} Unit */
/** @typedef {{actor:number,kind:string,skillId:number,units:{id:number,hp:number,shield:number}[]}} CombatEvent */
/** @typedef {{city:number,attacker:number,defender:number,round:number,units:Unit[],order:number[],cursor:number,cardUsed:boolean,log:string[]}} Battle */
/** @typedef {{debtor?:number,creditor?:number,amount?:number,after?:string,data?:Decision,tile?:number,
 * actor?:number,bid?:number,bidder?:number,passed?:number[],offer?:Trade,target?:number,from?:number,
 * resume?:string,steps?:number,event?:number,offers?:{item:Gear,price:number,sold:boolean}[]}} Decision */
/** @typedef {{to:number,give:number,take:number,giveCash:number,takeCash:number,giveEscape:number,takeEscape:number}} Trade */
/** @typedef {{version:number,seed:number,enhanced:boolean,players:Player[],assets:Asset[],turn:number,round:number,
 * phase:string,decision:Decision,dice:number[],doubles:number,extra:boolean,log:string[],sequence:number,
 * houses:number,palaces:number,alliances:{a:number,b:number,expires:number}[],battle:Battle|null,
 * nextItem:number,auctionQueue:number[],auctionReturn:string,eventDeck:number[],eventCursor:number,combatEvent:CombatEvent|null,
 * reports:{round:number,city:number,attacker:number,defender:number,win:boolean,entries:{owner:number,gid:number,name:string,xp:number,from:number,to:number,unlocked:string[]}[],loot:string[]}[]}} State */

export function ensure(condition, text) {
  if (!condition) throw Error(text);
}
export function random(s) {
  s.seed = (Math.imul(s.seed, 1664525) + 1013904223) >>> 0;
  return s.seed / 4294967296;
}
export function note(s, text) {
  s.log.push(text);
  if (s.log.length > 160) s.log.shift();
}
export const active = (s) => s.players[s.turn];
export const owned = (s, id) => MAP.filter((t) => s.assets[t.id].owner === id);
export const groupTiles = (id) => MAP.filter((t) => t.group === MAP[id].group && t.group >= 0);
export const allies = (s, a, b) =>
  s.enhanced &&
  s.alliances.some((x) => x.expires > s.round && ((x.a === a && x.b === b) || (x.a === b && x.b === a)));
export const complete = (s, id, owner) =>
  groupTiles(id).length > 0 && groupTiles(id).every((t) => s.assets[t.id].owner === owner);
export function phase(s, name, decision = {}) {
  s.phase = name;
  s.decision = decision;
}
function integer(n, min = 0, max = 10000000) {
  ensure(Number.isSafeInteger(n) && n >= min && n <= max, '数值不合法');
  return n;
}
function makeGeneral(id) {
  return makeFighter(id);
}

/** @param {{lord:number,ai:boolean}[]} seats
 * @returns {State}
 */
export function createGame(seats, enhanced = true, seed = Date.now() >>> 0) {
  ensure(seats.length >= 2 && seats.length <= 4, '需要2–4个席位');
  ensure(new Set(seats.map((p) => p.lord)).size === seats.length, '同局不能重复选择主公');
  seats.forEach((p) => integer(p.lord, 0, LORDS.length - 1));
  const players = seats.map((p, id) => ({
    id,
    lord: p.lord,
    ai: Boolean(p.ai),
    name: LORDS[p.lord].name,
    cash: 1500 + (enhanced && p.lord === 5 ? 300 : 0),
    pos: 0,
    out: false,
    jail: -1,
    escape: 0,
    food: enhanced ? 60 : 0,
    material: enhanced ? 4 : 0,
    pity: 0,
    generals: enhanced ? [makeGeneral(LORDS[p.lord].starter)] : [],
    items: [],
    cards: [],
    siegeRound: 0,
    shield: 0,
    discount: false,
    usedCards: 0,
    completed: 0,
    tradeRound: 0,
    allianceRound: 0,
    region: 0,
    hero: enhanced ? makeFighter(-1, 1, p.lord) : null,
    manuals: [],
    relics: [],
    loot: [],
  }));
  const s = {
    version: VERSION,
    seed: seed >>> 0,
    enhanced,
    players,
    assets: MAP.map(() => ({ owner: -1, level: 0, mortgaged: false })),
    turn: 0,
    round: 1,
    phase: 'roll',
    decision: {},
    dice: [1, 1],
    doubles: 0,
    extra: false,
    log: [],
    sequence: 0,
    houses: HOUSE_SUPPLY,
    palaces: PALACE_SUPPLY,
    alliances: [],
    battle: null,
    combatEvent: null,
    reports: [],
    nextItem: 1,
    auctionQueue: [],
    auctionReturn: 'end',
    eventDeck: EVENTS.map((_, i) => i),
    eventCursor: 0,
  };
  for (let i = s.eventDeck.length - 1; i > 0; i--) {
    const j = Math.floor(random(s) * (i + 1));
    [s.eventDeck[i], s.eventDeck[j]] = [s.eventDeck[j], s.eventDeck[i]];
  }
  if (enhanced)
    players.forEach((p) => {
      gainGear(s, p);
      gainCard(s, p);
    });
  note(s, `${enhanced ? '群雄逐鹿' : '经典商道'}开局，${players[0].name}先行。`);
  return s;
}
export function actorId(s) {
  if (s.phase === 'auction') return s.decision.actor;
  if (s.phase === 'debt') return s.decision.debtor;
  if (['trade', 'alliance'].includes(s.phase)) return s.decision.target;
  if (s.phase === 'battle') return currentUnit(s).side === 0 ? s.battle.attacker : s.battle.defender;
  return s.turn;
}
export function rent(s, id) {
  const t = MAP[id],
    a = s.assets[id];
  if (a.owner < 0 || a.mortgaged) return 0;
  if (t.kind === 'city') return t.rent[a.level] * (a.level === 0 && complete(s, id, a.owner) ? 2 : 1);
  const count = owned(s, a.owner).filter((x) => x.kind === t.kind).length;
  const raw =
    t.kind === 'station' ? 25 * 2 ** (count - 1) : s.dice.reduce((x, y) => x + y) * (count === 2 ? 10 : 4);
  return Math.ceil(raw * (s.enhanced && s.players[a.owner].lord === 3 ? 1.25 : 1));
}
export function buildCost(s, p, id) {
  return Math.ceil(MAP[id].build * (s.enhanced && p.lord === 2 ? 0.85 : 1) * (p.discount ? 0.5 : 1));
}
export function worth(s, p) {
  return (
    p.cash +
    owned(s, p.id).reduce(
      (n, t) => n + (s.assets[t.id].mortgaged ? t.price / 2 : t.price) + (s.assets[t.id].level * t.build) / 2,
      0,
    )
  );
}
function continueAt(s, next, data) {
  if (next === 'move') {
    move(s, data.steps);
    return;
  }
  phase(s, next, data || {});
}
function charge(s, debtor, creditor, amount, after = 'end', data = {}) {
  amount = Math.ceil(amount);
  const p = s.players[debtor];
  if (p.cash < amount) {
    phase(s, 'debt', { debtor, creditor, amount, after, data });
    return;
  }
  p.cash -= amount;
  if (creditor >= 0) s.players[creditor].cash += amount;
  note(s, `${p.name}支付${amount}金${creditor >= 0 ? `给${s.players[creditor].name}` : '入官库'}。`);
  continueAt(s, after, data);
}
function startIncome(s, p) {
  const cash = 200 + (s.enhanced && p.lord === 1 ? 80 : 0);
  p.cash += cash;
  if (s.enhanced) {
    p.food += 30 + (p.lord === 0 ? 20 : 0);
    if (p.lord === 4) gainCard(s, p);
  }
  note(s, `${p.name}经过誓师台，获得${cash}金${s.enhanced ? '与粮草' : ''}。`);
}
function jail(s) {
  const p = active(s);
  p.pos = 10;
  p.jail = 0;
  s.extra = false;
  s.doubles = 0;
  note(s, `${p.name}被拘押。可用赦令、缴纳50金，或掷出双骰获释。`);
  phase(s, 'end');
}
function move(s, steps) {
  const p = active(s),
    raw = ROUTE_INDEX[p.pos] + steps;
  p.pos = advanceTile(p.pos, steps);
  if (raw >= MAP.length) startIncome(s, p);
  land(s);
}
function land(s) {
  const p = active(s),
    t = MAP[p.pos],
    a = s.assets[t.id];
  note(s, `${p.name}抵达${t.name}。`);
  if (t.group >= 0) p.region = t.group;
  phase(s, 'end');
  if (['city', 'station', 'utility'].includes(t.kind)) {
    if (a.owner < 0) phase(s, 'buy', { tile: t.id });
    else if (s.enhanced && a.owner === p.id && t.kind === 'city' && !a.mortgaged && a.level < 5) {
      phase(s, 'develop', { tile: t.id });
    } else if (a.owner !== p.id && !a.mortgaged && !allies(s, p.id, a.owner)) {
      if (p.shield) {
        p.shield--;
        note(s, '通行文书生效，免除本次租金。');
      } else phase(s, 'rent', { tile: t.id, amount: rent(s, t.id), creditor: a.owner });
    }
  } else if (t.kind === 'tax') {
    charge(s, p.id, -1, t.price * (s.enhanced && p.lord === 5 ? 0.8 : 1));
  } else if (t.kind === 'gojail') jail(s);
  else if (t.kind === 'event') {
    if (s.enhanced) {
      if (random(s) < SHOP_CHANCE) {
        const offers = Array.from({ length: 3 }, () => {
          const item = makeGear(s);
          return { item, price: SHOP_PRICES[item.quality], sold: false };
        });
        phase(s, 'shop', { tile: t.id, offers });
        note(s, '隐市灯火亮起：秘密商店出现，三件军械限量出售。');
      } else phase(s, 'event', { tile: t.id });
    } else classicEvent(s);
  } else if (t.kind === 'rest' && s.enhanced) {
    fighters(p).forEach((g) => {
      g.injury = 0;
    });
    note(s, '休整：麾下武将全部恢复。');
  }
}
function classicEvent(s) {
  const p = active(s),
    e = EVENTS[s.eventDeck[s.eventCursor++ % s.eventDeck.length]];
  note(s, `时局：${e.name}。`);
  if (e.cash > 0) p.cash += e.cash;
  else if (e.cash < 0) charge(s, p.id, -1, -e.cash);
  else if (e.jail) jail(s);
  else if (e.home) {
    p.pos = 0;
    startIncome(s, p);
  } else if (e.escape) {
    if (!s.players.some((x) => x.escape)) p.escape++;
    else p.cash += 30;
  } else if (e.back) move(s, -e.back);
  else if (e.repair)
    charge(
      s,
      p.id,
      -1,
      owned(s, p.id).reduce((n, t) => n + (s.assets[t.id].level === 5 ? 100 : s.assets[t.id].level * 25), 0),
    );
}
function nextTurn(s) {
  const p = active(s);
  if (s.extra && !p.out && p.jail < 0) {
    s.extra = false;
    phase(s, 'roll');
    return;
  }
  p.completed++;
  fighters(p).forEach((g) => {
    if (g.injury > 0) g.injury--;
  });
  let next = s.turn;
  do {
    next = (next + 1) % s.players.length;
  } while (s.players[next].out);
  if (next <= s.turn) {
    s.round++;
    const expired = s.alliances.filter((a) => a.expires <= s.round);
    s.alliances = s.alliances.filter((a) => a.expires > s.round);
    expired.forEach((a) => note(s, `${s.players[a.a].name}与${s.players[a.b].name}盟约到期。`));
  }
  s.turn = next;
  s.doubles = 0;
  s.extra = false;
  active(s).usedCards = 0;
  phase(s, 'roll');
}
function startAuction(s, tile, returnPhase = 'end') {
  s.auctionReturn = returnPhase;
  const first = s.players.find((p) => !p.out && p.cash >= 10);
  if (!first) {
    finishAuction(s, { tile, bid: 0, bidder: -1 });
    return;
  }
  phase(s, 'auction', {
    tile,
    bid: 0,
    bidder: -1,
    passed: s.players.filter((p) => p.out || p.cash < 10).map((p) => p.id),
    actor: first.id,
  });
}
function finishAuction(s, d) {
  if (d.bidder >= 0) {
    s.players[d.bidder].cash -= d.bid;
    s.assets[d.tile].owner = d.bidder;
    note(s, `${s.players[d.bidder].name}以${d.bid}金竞得${MAP[d.tile].name}。`);
  } else note(s, `${MAP[d.tile].name}流拍。`);
  if (s.auctionQueue.length) startAuction(s, s.auctionQueue.shift(), s.auctionReturn);
  else phase(s, s.auctionReturn);
}
function auctionAction(s, c) {
  const d = s.decision,
    p = s.players[d.actor];
  if (c.type === 'bid') {
    const value = integer(c.amount, d.bid + 10);
    ensure(value <= p.cash, '竞价超过现金');
    d.bid = value;
    d.bidder = p.id;
  } else d.passed.push(p.id);
  const candidates = s.players.filter(
    (x) => !x.out && !d.passed.includes(x.id) && x.id !== d.bidder && x.cash >= d.bid + 10,
  );
  if (!candidates.length) {
    finishAuction(s, d);
    return;
  }
  for (let i = 1; i <= s.players.length; i++) {
    const id = (p.id + i) % s.players.length;
    if (candidates.some((x) => x.id === id)) {
      d.actor = id;
      break;
    }
  }
}
export function assetAction(s, p, id, action) {
  integer(id, 0, MAP.length - 1);
  const a = s.assets[id],
    t = MAP[id],
    group = groupTiles(id);
  ensure(a.owner === p.id, '只能管理自己的资产');
  if (action === 'build') {
    const landing = s.enhanced && s.phase === 'develop' && s.decision.tile === id && p.pos === id;
    ensure(
      t.kind === 'city' && !a.mortgaged && (landing || complete(s, id, p.id)),
      '需集齐区域且城池未抵押；增强模式可在自有城落点升级',
    );
    ensure(landing || group.every((x) => !s.assets[x.id].mortgaged), '区域存在抵押');
    ensure(a.level < 5 && (landing || group.every((x) => s.assets[x.id].level >= a.level)), '必须均匀建设');
    const cost = buildCost(s, p, id);
    ensure(p.cash >= cost, '金币不足');
    ensure(a.level === 4 ? s.palaces > 0 : s.houses > 0, '官库建筑库存不足');
    p.cash -= cost;
    p.discount = false;
    if (a.level === 4) {
      s.houses += 4;
      s.palaces--;
    } else s.houses--;
    a.level++;
    note(s, `${p.name}将${t.name}升级为${BUILDING_NAMES[a.level]}（${a.level}级）。`);
  } else if (action === 'sell') {
    ensure(
      a.level > 0 &&
        group.filter((x) => s.assets[x.id].owner === p.id).every((x) => s.assets[x.id].level <= a.level),
      '需从最高级建筑开始拆售',
    );
    if (a.level === 5) {
      ensure(s.houses >= 4, '官库不足4座普通建筑，暂不能拆换都督府');
      s.houses -= 4;
      s.palaces++;
    } else s.houses++;
    a.level--;
    p.cash += t.build / 2;
    note(s, `${p.name}拆售${t.name}一级建筑。`);
  } else if (action === 'demolish') {
    const mine = group.filter((x) => s.assets[x.id].owner === p.id);
    ensure(
      mine.some((x) => s.assets[x.id].level > 0),
      '本区域没有可拆建筑',
    );
    mine.forEach((x) => {
      p.cash += (s.assets[x.id].level * x.build) / 2;
      freeBuildings(s, x.id);
    });
    note(s, `${p.name}拆售${MAP[id].name}所在区域的全部自有建筑。`);
  } else if (action === 'mortgage') {
    ensure(!a.mortgaged && group.every((x) => s.assets[x.id].level === 0), '抵押前需拆除本区域所有建筑');
    a.mortgaged = true;
    p.cash += t.price / 2;
    note(s, `${p.name}抵押${t.name}，获得${t.price / 2}金。`);
  } else if (action === 'redeem') {
    const cost = Math.ceil(t.price * 0.55);
    ensure(a.mortgaged && p.cash >= cost, '未抵押或赎回金币不足');
    a.mortgaged = false;
    p.cash -= cost;
    note(s, `${p.name}赎回${t.name}。`);
  } else throw Error('未知资产操作');
}
function freeBuildings(s, id) {
  const a = s.assets[id];
  if (a.level === 5) s.palaces++;
  else s.houses += a.level;
  a.level = 0;
}
function bankrupt(s) {
  const d = s.decision,
    p = s.players[d.debtor];
  ensure(p.cash < d.amount, '能够付清债务时不能破产');
  ensure(liquidationValue(s, p) < d.amount, '尚可通过拆售或抵押偿债，不能直接破产');
  p.out = true;
  const creditor = d.creditor >= 0 ? s.players[d.creditor] : null;
  if (creditor) {
    creditor.cash += p.cash;
    creditor.escape += p.escape;
  }
  p.cash = 0;
  p.escape = 0;
  let interest = 0;
  owned(s, p.id).forEach((t) => {
    const a = s.assets[t.id];
    if (creditor) {
      a.owner = creditor.id;
      if (a.mortgaged) interest += Math.ceil(t.price * 0.05);
    } else {
      freeBuildings(s, t.id);
      a.owner = -1;
      a.mortgaged = false;
      s.auctionQueue.push(t.id);
    }
  });
  p.generals.forEach((g) => {
    g.guard = -1;
  });
  s.alliances = s.alliances.filter((x) => x.a !== p.id && x.b !== p.id);
  note(s, `${p.name}破产退场。`);
  const survivors = s.players.filter((x) => !x.out);
  if (survivors.length <= 2) s.alliances = [];
  if (survivors.length === 1) {
    phase(s, 'over');
    note(s, `${survivors[0].name}一统山河！`);
    return;
  }
  if (s.auctionQueue.length) startAuction(s, s.auctionQueue.shift());
  else if (interest) charge(s, creditor.id, -1, interest);
  else phase(s, 'end');
}
export function liquidationValue(s, p) {
  return (
    p.cash +
    owned(s, p.id).reduce((sum, t) => {
      const blocked = groupTiles(t.id).some((x) => s.assets[x.id].owner !== p.id && s.assets[x.id].level > 0);
      return (
        sum + (s.assets[t.id].mortgaged || blocked ? 0 : t.price / 2) + (s.assets[t.id].level * t.build) / 2
      );
    }, 0)
  );
}
function validTransfer(s, from, id) {
  if (id === -1) return;
  integer(id, 0, MAP.length - 1);
  ensure(s.assets[id].owner === from, '交易资产不属于出让者');
  ensure(
    groupTiles(id).every((t) => s.assets[t.id].level === 0),
    '有建筑的区域不能转让',
  );
}
function validateTrade(s, from, o) {
  integer(o.to, 0, s.players.length - 1);
  ensure(o.to !== from && !s.players[o.to].out, '交易对象无效');
  ['giveCash', 'takeCash', 'giveEscape', 'takeEscape'].forEach((k) => integer(o[k]));
  validTransfer(s, from, o.give);
  validTransfer(s, o.to, o.take);
  const a = s.players[from],
    b = s.players[o.to];
  const feeA = o.take >= 0 && s.assets[o.take].mortgaged ? Math.ceil(MAP[o.take].price * 0.05) : 0;
  const feeB = o.give >= 0 && s.assets[o.give].mortgaged ? Math.ceil(MAP[o.give].price * 0.05) : 0;
  ensure(a.cash >= o.giveCash && b.cash >= o.takeCash, '交易金币不足');
  ensure(
    a.cash - o.giveCash + o.takeCash >= feeA && b.cash - o.takeCash + o.giveCash >= feeB,
    '无法支付抵押转让利息',
  );
  ensure(a.escape >= o.giveEscape && b.escape >= o.takeEscape, '出狱卡数量不足');
  ensure(
    o.give >= 0 || o.take >= 0 || o.giveCash || o.takeCash || o.giveEscape || o.takeEscape,
    '交易内容为空',
  );
  return [feeA, feeB];
}
function acceptTrade(s) {
  const d = s.decision,
    o = d.offer,
    [feeA, feeB] = validateTrade(s, d.from, o),
    a = s.players[d.from],
    b = s.players[o.to];
  a.cash += o.takeCash - o.giveCash - feeA;
  b.cash += o.giveCash - o.takeCash - feeB;
  a.escape += o.takeEscape - o.giveEscape;
  b.escape += o.giveEscape - o.takeEscape;
  if (o.give >= 0) s.assets[o.give].owner = b.id;
  if (o.take >= 0) s.assets[o.take].owner = a.id;
  a.generals.forEach((g) => {
    if (g.guard === o.give) g.guard = -1;
  });
  b.generals.forEach((g) => {
    if (g.guard === o.take) g.guard = -1;
  });
  note(s, `${a.name}与${b.name}完成交易。`);
  phase(s, d.resume, d.data || {});
}

export function gainCard(s, p) {
  const id = Math.floor(random(s) * CARDS.length);
  p.cards.push(id);
  note(s, `${p.name}获得1张锦囊，内容仅持有者可见。`);
  return id;
}
function makeGear(s) {
  const roll = random(s),
    quality = roll < 0.45 ? 0 : roll < 0.75 ? 1 : roll < 0.91 ? 2 : roll < 0.98 ? 3 : 4;
  return { id: s.nextItem++, slot: Math.floor(random(s) * 6), quality };
}
export function gainGear(s, p) {
  const item = makeGear(s);
  p.items.push(item);
  return item;
}
export function awardLoot(s, p, kind, source) {
  ensure(s.enhanced && Object.hasOwn(LOOT_RATES, kind), '当前不能结算战利品');
  const rates = LOOT_RATES[kind];
  if (random(s) >= rates.chance) return null;
  const roll = random(s);
  let reward;
  if (roll < rates.manual) {
    const id = Math.floor(random(s) * 6),
      name = skillById(300 + id).name;
    if (p.manuals.includes(id)) {
      p.material += 5;
      reward = { kind: 'material', id, name: `${name}已学习，转为5份材料` };
    } else {
      p.manuals.push(id);
      reward = { kind: 'manual', id, name: `${name}（已学习）` };
    }
  } else if (roll < rates.manual + rates.gear) {
    const item = gainGear(s, p);
    reward = { kind: 'gear', id: item.id, name: `${QUALITY[item.quality]}·${ITEMS[item.slot]}` };
  } else {
    const item = { id: s.nextItem++, type: Math.floor(random(s) * RELICS.length) };
    p.relics.push(item);
    reward = { kind: 'relic', id: item.id, name: RELICS[item.type].name };
  }
  const record = { round: s.round, source, ...reward };
  p.loot.push(record);
  if (p.loot.length > 80) p.loot.shift();
  note(s, `${p.name}在${source}获得${reward.name}。`);
  return record;
}
export function recruit(s, p, free = false) {
  const cost = p.lord === 0 ? 80 : 100;
  ensure(free || p.cash >= cost, '招募金币不足');
  if (!free) p.cash -= cost;
  const roll = random(s),
    rarity = p.pity >= 19 || roll >= 0.95 ? 3 : roll >= 0.65 ? 2 : 1;
  p.pity = rarity === 3 ? 0 : p.pity + 1;
  const pool = GENERALS.filter((g) => g.rarity === rarity),
    g = pool[Math.floor(random(s) * pool.length)];
  if (p.generals.some((x) => x.id === g.id)) {
    p.material += rarity * 2;
    note(s, `重复招募${g.name}，转为${rarity * 2}份培养材料。`);
  } else {
    p.generals.push(makeGeneral(g.id));
    note(s, `${p.name}招募到${g.name}！`);
  }
  return g.id;
}
export function stats(p, g) {
  const base = g.id === -1 ? { hp: 155, atk: 39, def: 16, speed: 15 + (p.lord % 4) } : GENERALS[g.id],
    result = {
      hp: base.hp + (g.level - 1) * 14,
      atk: base.atk + (g.level - 1) * 3,
      def: base.def + (g.level - 1) * 2,
      speed: base.speed,
    };
  g.gear.forEach((id, slot) => {
    const item = p.items.find((x) => x.id === id);
    if (!item) return;
    const n = item.quality + 1;
    if (slot === 2) result.atk += n * 4;
    else if (slot === 0 || slot === 3) result.hp += n * 13;
    else if (slot === 5) result.speed += n * 2;
    else result.def += n * 3;
  });
  for (const extra of [TITLES[g.title], relicFor(p, g)]) {
    if (!extra) continue;
    for (const key of ['hp', 'atk', 'def', 'speed']) result[key] += extra[key] || 0;
  }
  return result;
}
export function readyGenerals(p) {
  return p.generals.filter((g) => g.injury === 0 && g.guard < 0);
}
export function siegeReason(s, p, id) {
  const a = s.assets[id];
  if (!s.enhanced) return '经典模式不允许攻城';
  if (MAP[id].kind !== 'city' || a.owner < 0 || a.owner === p.id) return '只能攻打敌方城池';
  if (a.mortgaged) return '抵押城池不可攻打';
  if (allies(s, p.id, a.owner)) return '盟约期间不得攻城';
  if (p.siegeRound === s.round) return '本轮已出征';
  if (p.food < 20) return '至少需要20粮';
  if (!readyGenerals(p).length && (!p.hero || p.hero.injury)) return '没有可出征的主公或武将';
  return '';
}
function makeUnits(p, generals, side) {
  const bonds = BONDS.filter(
    (b) => b.members.filter((id) => generals.some((g) => g.id === id)).length >= 2,
  ).slice(0, 2);
  return generals.map((g, index) => {
    const stat = stats(p, g);
    bonds.forEach((b) => {
      stat[b.effect] += b.value;
    });
    if (p.lord === 6) stat.atk = Math.ceil(stat.atk * 1.15);
    return {
      id: side * 10 + index,
      side,
      gid: g.id === -1 ? -3 : g.id,
      name: fighterName(p, g),
      troop: fighterTroop(p, g),
      hp: stat.hp,
      max: stat.hp,
      atk: stat.atk,
      def: stat.def,
      speed: stat.speed,
      cooldown: 0,
      shield: relicFor(p, g)?.shield || 0,
      statuses: [],
      skills: equippedSkills(g),
      cooldowns: equippedSkills(g).map(() => 0),
      regen: relicFor(p, g)?.regen || 0,
    };
  });
}
function beginBattle(s, ids, withHero = false) {
  const p = active(s),
    id = s.decision.tile,
    a = s.assets[id];
  ensure(!siegeReason(s, p, id), siegeReason(s, p, id));
  ensure(
    typeof withHero === 'boolean' &&
      Array.isArray(ids) &&
      ids.length >= (withHero ? 0 : 1) &&
      ids.length <= 3 &&
      new Set(ids).size === ids.length,
    '出征需选择主公或1–3名不同武将',
  );
  ensure(!withHero || (p.hero && p.hero.injury === 0), '主公正在负伤，不能亲征');
  const generals = ids.map((id) => p.generals.find((g) => g.id === id));
  ensure(
    generals.every((g) => g && g.injury === 0 && g.guard < 0),
    '出征武将不可用',
  );
  const defender = s.players[a.owner],
    guards = defender.generals.filter((g) => g.guard === id && g.injury === 0).slice(0, 3);
  const units = makeUnits(p, generals, 0).concat(makeUnits(defender, guards, 1));
  if (!guards.length)
    units.push({
      id: 10,
      side: 1,
      gid: -1,
      name: '守城军',
      troop: '步',
      hp: 100 + a.level * 18,
      max: 100 + a.level * 18,
      atk: 24 + a.level * 4,
      def: 10 + a.level * 2,
      speed: 10,
      cooldown: 0,
      shield: 0,
      statuses: [],
      skills: [-1],
      cooldowns: [0],
      regen: 0,
    });
  const addHero = (owner, side) => {
    const unit = makeUnits(owner, [owner.hero], side)[0];
    unit.id = side * 10 + 3;
    units.push(unit);
  };
  if (withHero) addHero(p, 0);
  if (defender.pos === id && defender.hero?.injury === 0) addHero(defender, 1);
  units.push({
    id: 19,
    side: 1,
    gid: -2,
    name: '城墙',
    troop: '墙',
    hp: 65 + a.level * 30,
    max: 65 + a.level * 30,
    atk: 0,
    def: 5,
    speed: 0,
    cooldown: 0,
    shield: 0,
    statuses: [],
    skills: [],
    cooldowns: [],
    regen: 0,
  });
  p.food -= 20;
  p.siegeRound = s.round;
  s.battle = {
    city: id,
    attacker: p.id,
    defender: defender.id,
    round: 1,
    units,
    order: units
      .filter((u) => u.gid !== -2)
      .sort((a, b) => b.speed - a.speed || a.id - b.id)
      .map((u) => u.id),
    cursor: 0,
    cardUsed: false,
    log: ['战鼓起，城门闭。'],
  };
  phase(s, 'battle');
  note(s, `${p.name}消耗20粮，攻打${MAP[id].name}！`);
}
export const currentUnit = (s) => s.battle.units.find((u) => u.id === s.battle.order[s.battle.cursor]);
function finishBattle(s, win) {
  const b = s.battle,
    att = s.players[b.attacker],
    def = s.players[b.defender],
    loser = win ? def : att;
  b.units
    .filter((u) => u.side === (win ? 1 : 0) && (u.gid >= 0 || u.gid === -3))
    .forEach((u) => {
      const g = fighter(loser, u.gid === -3 ? -1 : u.gid);
      g.injury = loser.id === s.turn ? 2 : 1;
      g.guard = -1;
    });
  const report = {
    round: s.round,
    city: b.city,
    attacker: att.id,
    defender: def.id,
    win,
    entries: [],
    loot: [],
  };
  for (const u of b.units) {
    if (u.gid < 0 && u.gid !== -3) continue;
    const owner = u.side === 0 ? att : def;
    const g = fighter(owner, u.gid === -3 ? -1 : u.gid);
    const won = u.side === (win ? 0 : 1);
    const reward = (won ? 120 : 65) + s.assets[b.city].level * (won ? 25 : 15);
    const entry = gainExperience(owner, g, reward);
    report.entries.push(entry);
    note(
      s,
      `${entry.name}获得${entry.xp}经验${entry.to > entry.from ? `，升至${entry.to}级` : ''}${entry.unlocked.length ? `，解锁${entry.unlocked.join('、')}` : ''}。`,
    );
  }
  s.reports.push(report);
  if (s.reports.length > 20) s.reports.shift();
  const winner = win ? att : def;
  const loot = awardLoot(s, winner, 'victory', `${MAP[b.city].name}·${win ? '攻城' : '守城'}胜利`);
  if (loot) report.loot.push(`${winner.name}：${loot.name}`);
  if (win) {
    s.assets[b.city].owner = att.id;
    def.generals
      .filter((g) => g.guard === b.city)
      .forEach((g) => {
        g.guard = -1;
      });
    att.material += 2;
    note(s, `${att.name}攻克${MAP[b.city].name}，夺得城池与2份材料，免交本次租金。`);
    phase(s, 'end');
  } else {
    note(s, `${att.name}攻城未克，武将暂时负伤，按原租金交纳。`);
    charge(s, att.id, def.id, rent(s, b.city));
  }
  s.battle = null;
}
function checkBattle(s) {
  const b = s.battle;
  if (!b.units.some((u) => u.side === 0 && u.hp > 0)) {
    finishBattle(s, false);
    return true;
  }
  if (!b.units.some((u) => u.side === 1 && u.hp > 0)) {
    finishBattle(s, true);
    return true;
  }
  return false;
}
function battleAction(s, c) {
  const b = s.battle,
    u = currentUnit(s),
    p = s.players[u.side === 0 ? b.attacker : b.defender];
  const target = b.units.find((x) => x.id === c.target);
  const ticking = u.statuses.slice();
  if (c.type === 'battleCard') {
    integer(c.index, 0, p.cards.length - 1);
    const card = CARDS[p.cards[c.index]];
    ensure(card.timing === 'battle' && !b.cardUsed, '每次行动限一张战术卡');
    if (['damage'].includes(card.effect))
      ensure(target && target.hp > 0 && target.side !== u.side, '请选择存活敌军');
    if (card.effect === 'wall')
      ensure(u.side === 0 && b.units.find((x) => x.gid === -2).hp > 0, '当前没有可攻击的敌方城墙');
    p.cards.splice(c.index, 1);
    b.cardUsed = true;
    if (card.effect === 'damage') damage(target, card.value);
    if (card.effect === 'wall') {
      const wall = b.units.find((x) => x.gid === -2);
      damage(wall, card.value);
    }
    if (card.effect === 'heal') u.hp = Math.min(u.max, u.hp + card.value);
    if (card.effect === 'defend') u.def += card.value;
    if (card.effect === 'attack') u.atk += card.value;
    if (card.effect === 'all')
      b.units
        .filter((x) => x.side !== u.side)
        .forEach((x) => {
          damage(x, card.value);
        });
    if (card.effect === 'teamheal')
      b.units
        .filter((x) => x.side === u.side && x.hp > 0)
        .forEach((x) => {
          x.hp = Math.min(x.max, x.hp + card.value);
        });
    b.log.push(`${u.name}使用${card.name}。`);
    checkBattle(s);
    return;
  }
  const selectedSkill = c.skill ?? u.skills[0],
    ability = skillFor(u, selectedSkill),
    special = c.type === 'skill';
  const slot = u.skills.indexOf(selectedSkill);
  ensure(!special || (slot >= 0 && ability), '未装备此技能');
  ensure(!special || (slot === 0 ? u.cooldown : u.cooldowns[slot]) === 0, '技能尚在冷却');
  ensure(!special || !u.statuses.some((x) => x.kind === 'silence'), '封技期间不能施放技能');
  if (special) {
    resolveSkill(b, u, target, ability, () => random(s));
  } else {
    ensure(target && target.hp > 0 && target.side !== u.side, '请选择存活敌军');
    hit(b, u, target, () => random(s));
  }
  u.cooldowns[0] = u.cooldown;
  u.cooldowns = u.cooldowns.map((n, i) => (special && i === slot ? ability.cooldown : Math.max(0, n - 1)));
  u.cooldown = u.cooldowns[0];
  tickStatuses(b, u, ticking);
  if (u.hp > 0) u.hp = Math.min(u.max, u.hp + u.regen);
  if (checkBattle(s)) return;
  do {
    b.cursor++;
    if (b.cursor >= b.order.length) {
      b.cursor = 0;
      b.round++;
      if (b.round > 10) {
        finishBattle(s, false);
        return;
      }
    }
  } while (currentUnit(s).hp <= 0);
  b.cardUsed = false;
  if (b.log.length > 30) b.log.splice(0, b.log.length - 30);
}
function useCard(s, c) {
  const p = active(s);
  integer(c.index, 0, p.cards.length - 1);
  const card = CARDS[p.cards[c.index]];
  ensure(card.timing === 'board' && p.usedCards < 2, '每正常回合限两张功能卡，战术卡只能在战斗使用');
  p.cards.splice(c.index, 1);
  p.usedCards++;
  const effect = card.effect;
  if (effect === 'cash') p.cash += card.value;
  if (effect === 'supply') p.food += card.value;
  if (effect === 'material') p.material += card.value;
  if (effect === 'recruit') recruit(s, p, true);
  if (effect === 'gear') gainGear(s, p);
  if (effect === 'heal')
    fighters(p).forEach((g) => {
      g.injury = 0;
    });
  if (effect === 'discount') p.discount = true;
  if (effect === 'shield') p.shield++;
  if (effect === 'move') move(s, card.value);
  if (effect === 'home') {
    p.pos = 0;
    phase(s, 'end');
  }
  note(s, `${p.name}使用「${card.name}」。`);
}
function guard(s, p, c) {
  const g = p.generals.find((g) => g.id === c.general);
  ensure(g && g.injury === 0, '武将不存在或正在负伤');
  if (c.tile !== -1) {
    integer(c.tile, 0, MAP.length - 1);
    ensure(MAP[c.tile].kind === 'city' && s.assets[c.tile].owner === p.id, '只能驻守自己的城池');
    ensure(p.generals.filter((x) => x.guard === c.tile && x.id !== g.id).length < 3, '每城最多驻守三将');
  }
  g.guard = c.tile;
}

/** Apply a command atomically. Rejected commands never mutate the caller's state.
 * @param {State} original
 * @param {{type:string,action?:string,tile?:number,amount?:number,card?:boolean,index?:number,
 * offer?:Trade,target?:number,choice?:string,generals?:number[],general?:number,slot?:number,item?:number|null,hero?:boolean,skill?:number}} c
 * @returns {State}
 */
export function command(original, c) {
  const s = structuredClone(original);
  s.combatEvent = null;
  ensure(s.phase !== 'over', '对局已经结束');
  const p = active(s),
    management = ['roll', 'end'].includes(s.phase),
    economic = management || s.phase === 'debt';
  if (c.type === 'asset') {
    ensure(economic, '当前阶段不能管理资产');
    const owner = s.players[s.phase === 'debt' ? s.decision.debtor : s.turn];
    ensure(!owner.out, '已退场的主公不能管理产业');
    ensure(
      s.phase !== 'debt' || ['sell', 'demolish', 'mortgage'].includes(c.action),
      '偿债期间只能拆售或抵押',
    );
    assetAction(s, owner, c.tile, c.action);
  } else if (c.type === 'roll') {
    ensure(s.phase === 'roll', '现在不能掷骰');
    s.dice = [1 + Math.floor(random(s) * 6), 1 + Math.floor(random(s) * 6)];
    const same = s.dice[0] === s.dice[1],
      steps = s.dice[0] + s.dice[1];
    note(s, `${p.name}掷出 ${s.dice[0]} + ${s.dice[1]}。`);
    if (p.jail >= 0) {
      if (same) {
        p.jail = -1;
        move(s, steps);
      } else if (++p.jail >= 3) {
        p.jail = -1;
        charge(s, p.id, -1, 50, 'move', { steps });
      } else phase(s, 'end');
    } else {
      s.doubles = same ? s.doubles + 1 : 0;
      s.extra = same;
      if (s.doubles === 3) jail(s);
      else move(s, steps);
    }
  } else if (c.type === 'release') {
    ensure(s.phase === 'roll' && p.jail >= 0, '未处于拘押');
    if (c.card) {
      ensure(p.escape > 0, '没有通关赦令');
      p.escape--;
    } else {
      ensure(p.cash >= 50, '需要50金');
      p.cash -= 50;
    }
    p.jail = -1;
    note(s, `${p.name}获释。`);
  } else if (c.type === 'buy') {
    ensure(s.phase === 'buy', '当前无可购买资产');
    const id = s.decision.tile,
      cost = MAP[id].price;
    ensure(p.cash >= cost, '金币不足，可放弃并进入拍卖');
    p.cash -= cost;
    s.assets[id].owner = p.id;
    phase(s, 'end');
    note(s, `${p.name}以${cost}金购入${MAP[id].name}。`);
  } else if (c.type === 'develop') {
    ensure(s.enhanced && s.phase === 'develop', '当前没有落点建设机会');
    if (c.choice === 'build') assetAction(s, p, s.decision.tile, 'build');
    else ensure(c.choice === 'skip', '未知建造选项');
    phase(s, 'end');
  } else if (c.type === 'shopBuy') {
    ensure(s.enhanced && s.phase === 'shop', '秘密商店已关闭');
    integer(c.index, 0, 2);
    const offer = s.decision.offers[c.index];
    ensure(!offer.sold, '这件装备已经售出');
    ensure(p.cash >= offer.price, '金币不足，无法购买');
    p.cash -= offer.price;
    p.items.push({ ...offer.item });
    offer.sold = true;
    note(s, `${p.name}在秘密商店花费${offer.price}金购入军械。`);
  } else if (c.type === 'shopLeave') {
    ensure(s.phase === 'shop', '当前没有秘密商店');
    note(s, '秘密商店收摊，继续处理当前格子的机遇。');
    phase(s, 'event', { tile: s.decision.tile });
  } else if (c.type === 'auction') {
    ensure(s.phase === 'buy', '当前不能发起拍卖');
    startAuction(s, s.decision.tile);
  } else if (c.type === 'bid' || c.type === 'pass') {
    ensure(s.phase === 'auction', '当前不在拍卖');
    auctionAction(s, c);
  } else if (c.type === 'pay') {
    ensure(['rent', 'debt'].includes(s.phase), '当前没有应付款');
    const d = s.decision;
    if (s.phase === 'rent') charge(s, p.id, d.creditor, d.amount);
    else {
      ensure(s.players[d.debtor].cash >= d.amount, '尚未筹足金币');
      charge(s, d.debtor, d.creditor, d.amount, d.after, d.data);
    }
  } else if (c.type === 'bankrupt') {
    ensure(s.phase === 'debt', '只有无法偿债时才能破产');
    bankrupt(s);
  } else if (c.type === 'end') {
    ensure(s.phase === 'end', '请先完成当前决策');
    nextTurn(s);
  } else if (c.type === 'trade') {
    ensure(economic, '当前不能交易');
    const from = s.phase === 'debt' ? s.decision.debtor : s.turn;
    ensure(!s.players[from].out, '已退场的主公不能交易');
    validateTrade(s, from, c.offer);
    s.players[from].tradeRound = s.round;
    phase(s, 'trade', { from, target: c.offer.to, offer: c.offer, resume: s.phase, data: s.decision });
  } else if (c.type === 'accept') {
    ensure(['trade', 'alliance'].includes(s.phase), '当前没有提案');
    if (s.phase === 'trade') acceptTrade(s);
    else {
      const d = s.decision;
      ensure(canAlly(s, d.from, d.target), '结盟条件已变化');
      s.alliances.push({ a: d.from, b: d.target, expires: s.round + 3 });
      note(s, `${s.players[d.from].name}与${s.players[d.target].name}结盟，至第${s.round + 3}轮。`);
      phase(s, d.resume);
    }
  } else if (c.type === 'reject') {
    ensure(['trade', 'alliance'].includes(s.phase), '当前没有提案');
    const d = s.decision;
    note(s, '提案被拒绝。');
    phase(s, d.resume, d.data || {});
  } else if (c.type === 'event') {
    ensure(s.phase === 'event', '当前无格子事件');
    const tile = s.decision.tile;
    phase(s, 'end');
    if (c.choice === 'card') gainCard(s, p);
    else if (c.choice === 'recruit') {
      ensure([2, 22].includes(tile), '此处不可招募');
      recruit(s, p, true);
    } else if (c.choice === 'gear') {
      ensure(tile === 33, '此处不可领装备');
      gainGear(s, p);
    } else if (c.choice === 'food') {
      ensure(tile === 7 && p.cash >= 40, '需在集市支付40金');
      p.cash -= 40;
      p.food += 30;
    } else if (c.choice === 'classic') classicEvent(s);
    else throw Error('未知事件选项');
    if (s.enhanced) awardLoot(s, p, 'encounter', `${MAP[tile].name}·奇遇`);
  } else if (c.type === 'discard') {
    ensure(s.phase === 'discard', '无需弃牌');
    integer(c.index, 0, p.cards.length - 1);
    p.cards.splice(c.index, 1);
    if (p.cards.length <= 8) phase(s, s.decision.resume, s.decision.data);
  } else if (c.type === 'siege') {
    ensure(s.phase === 'rent', '只有抵达敌城时可攻城');
    beginBattle(s, c.generals, c.hero);
  } else if (['attack', 'skill', 'battleCard'].includes(c.type)) {
    ensure(s.phase === 'battle', '当前不在战斗');
    const resolved = s.battle,
      unit = currentUnit(s);
    battleAction(s, c);
    s.combatEvent = {
      actor: unit.id,
      kind: c.type,
      skillId: c.type === 'skill' ? (c.skill ?? unit.skills[0]) : unit.skills[0],
      units: resolved.units.map((u) => ({ id: u.id, hp: u.hp, shield: u.shield })),
    };
    if (resolved.log.length > 30) resolved.log.splice(0, resolved.log.length - 30);
  } else {
    ensure(s.enhanced && management && !p.out, '当前阶段不可进行增强管理');
    if (c.type === 'recruit') recruit(s, p);
    else if (c.type === 'gear') {
      ensure(p.cash >= 80, '需要80金');
      p.cash -= 80;
      gainGear(s, p);
    } else if (c.type === 'food') {
      ensure(p.pos === 7 && p.cash >= 40, '仅在集市可花费40金购买30粮');
      p.cash -= 40;
      p.food += 30;
    } else if (c.type === 'train') {
      const g = fighter(p, c.general);
      ensure(
        g && g.level < MAX_LEVEL && p.material >= g.level && p.cash >= g.level * 30,
        '需等级未满，材料≥当前等级，金币≥等级×30',
      );
      p.material -= g.level;
      p.cash -= g.level * 30;
      const result = gainExperience(p, g, trainingExperience(g.level));
      note(
        s,
        `${result.name}训练获得${result.xp}经验${result.to > result.from ? `，升至${result.to}级` : ''}。`,
      );
    } else if (c.type === 'equip') {
      const g = fighter(p, c.general);
      ensure(g, '武将不存在');
      integer(c.slot, 0, 5);
      if (c.item !== null) {
        const item = p.items.find((x) => x.id === c.item);
        ensure(item && item.slot === c.slot, '装备部位不符');
        ensure(!fighters(p).some((x) => x.gear.includes(c.item)), '装备已被穿戴，请先卸下');
      }
      g.gear[c.slot] = c.item;
    } else if (['loadSkill', 'title', 'manual', 'relic'].includes(c.type)) {
      const g = fighter(p, c.general);
      ensure(g, '人物不存在');
      if (c.type === 'loadSkill') {
        integer(c.slot, 0, 1);
        ensure(c.slot <= g.loadout.length, '请先装备前一技能槽');
        ensure(unlockedSkills(p, g).includes(c.skill), '技能尚未解锁');
        ensure(!g.loadout.some((id, i) => i !== c.slot && id === c.skill), '不能重复装备同一技能');
        g.loadout[c.slot] = c.skill;
      } else if (c.type === 'title') {
        integer(c.index, -1, TITLES.length - 1);
        ensure(c.index < 0 || g.level >= TITLES[c.index].level, '称号尚未解锁');
        g.title = c.index;
      } else if (c.type === 'manual') {
        integer(c.index, -1, 5);
        ensure(c.index < 0 || p.manuals.includes(c.index), '尚未学习此秘法');
        g.manual = c.index;
      } else {
        ensure(c.item === null || p.relics.some((x) => x.id === c.item), '没有这件宝物');
        ensure(c.item === null || !fighters(p).some((x) => x.relic === c.item), '宝物已被装备，请先卸下');
        g.relic = c.item;
      }
    } else if (c.type === 'guard') guard(s, p, c);
    else if (c.type === 'card') useCard(s, c);
    else if (c.type === 'alliance') {
      ensure(canAlly(s, p.id, c.target), '需至少三人存活，双方无盟友且不是同一人');
      p.allianceRound = s.round;
      phase(s, 'alliance', { from: p.id, target: c.target, resume: s.phase });
    } else throw Error('未知操作');
  }
  if (p.cards.length > 8 && s.phase !== 'discard' && s.phase !== 'over')
    phase(s, 'discard', { resume: s.phase, data: s.decision });
  s.sequence++;
  assertState(s);
  return s;
}
export function canAlly(s, a, b) {
  return (
    s.enhanced &&
    s.players[a] &&
    !s.players[a].out &&
    Number.isInteger(b) &&
    b >= 0 &&
    b < s.players.length &&
    a !== b &&
    !s.players[b].out &&
    s.players.filter((p) => !p.out).length > 2 &&
    !s.alliances.some((x) => [x.a, x.b].includes(a) || [x.a, x.b].includes(b))
  );
}
export function assertState(s) {
  ensure(s.version === VERSION, '存档版本不兼容');
  ensure(s.players.length >= 2 && s.players.length <= 4 && s.assets.length === MAP.length, '存档结构异常');
  ensure(
    [
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
    ].includes(s.phase),
    '存档阶段异常',
  );
  integer(s.turn, 0, s.players.length - 1);
  integer(s.round, 1);
  integer(s.seed, 0, 4294967295);
  integer(s.houses, 0, HOUSE_SUPPLY);
  integer(s.palaces, 0, PALACE_SUPPLY);
  integer(s.sequence);
  integer(s.nextItem, 1);
  integer(s.doubles, 0, 3);
  ensure(typeof s.extra === 'boolean', '追加掷骰标记异常');
  let houses = 0,
    palaces = 0;
  s.assets.forEach((a, id) => {
    integer(a.owner, -1, s.players.length - 1);
    integer(a.level, 0, 5);
    ensure(typeof a.mortgaged === 'boolean', '抵押标记异常');
    ensure(a.owner >= 0 || (!a.level && !a.mortgaged), '无主资产不能有建筑或抵押');
    ensure(a.owner < 0 || ['city', 'station', 'utility'].includes(MAP[id].kind), '事件格不可拥有');
    ensure(a.level === 0 || MAP[id].kind === 'city', '非城池不能建设');
    ensure(a.owner < 0 || !s.players[a.owner].out, '资产所有者已出局');
    if (a.level === 5) palaces++;
    else houses += a.level;
  });
  ensure(s.houses + houses === HOUSE_SUPPLY && s.palaces + palaces === PALACE_SUPPLY, '建筑库存不一致');
  s.players.forEach((p, id) => {
    ensure(p.id === id, '玩家编号不一致');
    integer(p.lord, 0, 6);
    integer(p.cash);
    integer(p.food);
    integer(p.material);
    integer(p.pos, 0, MAP.length - 1);
    integer(p.region, 0, 7);
    ensure(typeof p.ai === 'boolean' && p.name === LORDS[p.lord].name, '玩家资料不合法');
    ensure(typeof p.out === 'boolean' && typeof p.discount === 'boolean', '玩家状态标记异常');
    ['escape', 'siegeRound', 'shield', 'usedCards', 'completed', 'tradeRound', 'allianceRound'].forEach((k) =>
      integer(p[k]),
    );
    ensure(p.usedCards <= 2, '回合用卡次数异常');
    integer(p.pity, 0, 19);
    integer(p.jail, -1, 2);
    ensure(new Set(p.generals.map((g) => g.id)).size === p.generals.length, '武将重复');
    const used = [];
    ensure(s.enhanced ? p.hero?.id === -1 : p.hero === null, '主公成长状态异常');
    ensure(
      Array.isArray(p.manuals) && p.manuals.length <= 6 && new Set(p.manuals).size === p.manuals.length,
      '秘法列表异常',
    );
    p.manuals.forEach((id) => integer(id, 0, 5));
    ensure(Array.isArray(p.relics) && p.relics.length <= 3000, '宝物列表异常');
    p.relics.forEach((x) => {
      integer(x.id, 1);
      integer(x.type, 0, RELICS.length - 1);
    });
    ensure(new Set(p.relics.map((x) => x.id)).size === p.relics.length, '宝物实例重复');
    ensure(Array.isArray(p.loot) && p.loot.length <= 80, '掉落记录异常');
    p.loot.forEach((x) => {
      integer(x.round, 1, s.round);
      integer(x.id, 0);
      ensure(
        ['manual', 'material', 'gear', 'relic'].includes(x.kind) &&
          typeof x.source === 'string' &&
          x.source.length <= 100 &&
          typeof x.name === 'string' &&
          x.name.length <= 150,
        '掉落记录内容异常',
      );
    });
    const relics = fighters(p)
      .map((g) => g.relic)
      .filter((id) => id !== null);
    ensure(new Set(relics).size === relics.length, '宝物重复装备');
    fighters(p).forEach((g) => {
      integer(g.id, g === p.hero ? -1 : 0, g === p.hero ? -1 : GENERALS.length - 1);
      validateProgression(p, g);
      integer(g.injury, 0, 2);
      integer(g.guard, -1, MAP.length - 1);
      ensure(g !== p.hero || g.guard === -1, '主公不能远程驻守');
      ensure(g.guard < 0 || s.assets[g.guard].owner === p.id, '驻守产权错误');
      ensure(g.gear.length === 6, '装备槽数量错误');
      g.gear.forEach((id, slot) => {
        if (id !== null) {
          ensure(
            p.items.some((x) => x.id === id && x.slot === slot),
            '装备引用失效',
          );
          used.push(id);
        }
      });
    });
    ensure(new Set(used).size === used.length, '装备重复穿戴');
    p.items.forEach((x) => {
      integer(x.id, 1);
      integer(x.slot, 0, 5);
      integer(x.quality, 0, 4);
    });
    ensure(new Set(p.items.map((x) => x.id)).size === p.items.length, '装备实例编号重复');
    for (const t of owned(s, p.id))
      ensure(p.generals.filter((g) => g.guard === t.id).length <= 3, '驻将数量超限');
    p.cards.forEach((id) => integer(id, 0, 23));
    if (!s.enhanced)
      ensure(
        !p.generals.length &&
          !p.cards.length &&
          !p.items.length &&
          p.food === 0 &&
          !p.manuals.length &&
          !p.relics.length &&
          !p.loot.length,
        '经典模式含增强数据',
      );
  });
  ensure(new Set(s.players.map((p) => p.lord)).size === s.players.length, '主公重复');
  return true;
}
