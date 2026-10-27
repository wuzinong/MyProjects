import { SKILLS } from './skills.js';
import { NEW_PEOPLE, BIOGRAPHIES } from './people.js';
export const VERSION = 6;
// Four seats can each develop a six-city region through four ordinary levels.
export const HOUSE_SUPPLY = 96;
export const PALACE_SUPPLY = 24;
export const BUILDING_NAMES = ['空地', '民居', '里坊', '商署', '城楼', '都督府'];
export const SHOP_CHANCE = 0.25;
export const SHOP_PRICES = [70, 120, 210, 350, 550];
export const COLORS = ['#5aa98c', '#689dcc', '#ce7558', '#bb92cd'];
export const REGIONS = [
  { name: '凉州', color: '#ca9b66', band: '#edb45c', style: '夯土烽燧 · 河西商旅' },
  { name: '关中', color: '#ad7560', band: '#de774a', style: '台榭重垣 · 秦汉故都' },
  { name: '河洛', color: '#ccaf62', band: '#d4d86d', style: '双阙深院 · 帝京气象' },
  { name: '河北', color: '#799aa8', band: '#7c9ee4', style: '楼橹坚垒 · 沃野连营' },
  { name: '兖豫', color: '#a28eaf', band: '#b58ada', style: '仓廪院落 · 中原阡陌' },
  { name: '荆襄', color: '#6b9d85', band: '#68b785', style: '临水高台 · 江汉舟楫' },
  { name: '江东', color: '#67afb4', band: '#5acbd5', style: '水岸木构 · 吴越帆影' },
  { name: '巴蜀', color: '#c88674', band: '#df88ac', style: '山麓层台 · 川蜀竹木' },
];
export const LORDS = [
  {
    name: '刘备',
    word: '玄德',
    seal: '蜀',
    title: '仁德济世',
    skill: '每次招募便宜20金；起点多得20粮。',
    quote: '以人为本，聚义成业。',
    color: '#5aa98c',
    starter: 0,
  },
  {
    name: '曹操',
    word: '孟德',
    seal: '魏',
    title: '屯田令',
    skill: '经过起点额外获得80金。',
    quote: '运筹天下，唯才是举。',
    color: '#689dcc',
    starter: 13,
  },
  {
    name: '司马懿',
    word: '仲达',
    seal: '晋',
    title: '深谋远虑',
    skill: '建设费用减少15%。',
    quote: '藏锋守势，静待天时。',
    color: '#bb92cd',
    starter: 22,
  },
  {
    name: '孙权',
    word: '仲谋',
    seal: '吴',
    title: '江东基业',
    skill: '驿站与漕运收益提高25%。',
    quote: '江流不尽，守土开疆。',
    color: '#ce7558',
    starter: 26,
  },
  {
    name: '张角',
    word: '大贤良师',
    seal: '道',
    title: '太平道',
    skill: '每次回到起点获得1张功能卡。',
    quote: '黄天之下，众志成城。',
    color: '#d4ad63',
    starter: 38,
  },
  {
    name: '董卓',
    word: '仲颖',
    seal: '凉',
    title: '据地聚财',
    skill: '起始多300金，承担的税金减少20%。',
    quote: '雄踞关中，威临四方。',
    color: '#b76868',
    starter: 35,
  },
  {
    name: '吕布',
    word: '奉先',
    seal: '武',
    title: '骁勇无双',
    skill: '麾下武将战斗攻击提高15%。',
    quote: '纵马驰骋，一往无前。',
    color: '#d19b67',
    starter: 36,
  },
];
export const LANDMARKS = {
  1: '烽燧高台',
  3: '商旅帐棚',
  6: '重阙宫院',
  8: '关隘门楼',
  9: '夯土坞堡',
  11: '三台礼院',
  13: '山谷望楼',
  14: '驿道长桥',
  16: '台榭广场',
  18: '双仓廪院',
  19: '阡陌井田',
  21: '宫署回廊',
  23: '商市彩棚',
  24: '居里围院',
  26: '江岸城门',
  27: '连船码头',
  29: '高台木楼',
  31: '临江石垣',
  32: '水巷小桥',
  34: '山麓竹院',
  37: '锦坊院落',
  39: '层城石阶',
};
const layout = [
  ['誓师', 'start'],
  ['武威', 0, 60],
  ['招贤', 'event'],
  ['张掖', 0, 60],
  ['田赋', 'tax', 200],
  ['函谷驿', 'station', 200],
  ['长安', 1, 100],
  ['集市', 'event'],
  ['陈仓', 1, 100],
  ['槐里', 1, 120],
  ['拘押', 'jail'],
  ['洛阳', 2, 140],
  ['黄河漕运', 'utility', 150],
  ['弘农', 2, 140],
  ['新安', 2, 160],
  ['官渡驿', 'station', 200],
  ['邺', 3, 180],
  ['谋略', 'event'],
  ['南皮', 3, 180],
  ['平原', 3, 200],
  ['休整', 'rest'],
  ['许', 4, 220],
  ['招贤', 'event'],
  ['陈留', 4, 220],
  ['谯', 4, 240],
  ['白马驿', 'station', 200],
  ['襄阳', 5, 260],
  ['江陵', 5, 260],
  ['长江漕运', 'utility', 150],
  ['长沙', 5, 280],
  ['押送', 'gojail'],
  ['建业', 6, 300],
  ['吴', 6, 300],
  ['军械', 'event'],
  ['会稽', 6, 320],
  ['阳平驿', 'station', 200],
  ['奇遇', 'event'],
  ['成都', 7, 350],
  ['军赋', 'tax', 100],
  ['江州', 7, 400],
];
const rents = [
  [2, 10, 30, 90, 160, 250],
  [4, 20, 60, 180, 320, 450],
  [6, 30, 90, 270, 400, 550],
  [6, 30, 90, 270, 400, 550],
  [8, 40, 100, 300, 450, 600],
  [10, 50, 150, 450, 625, 750],
  [10, 50, 150, 450, 625, 750],
  [12, 60, 180, 500, 700, 900],
  [14, 70, 200, 550, 750, 950],
  [14, 70, 200, 550, 750, 950],
  [16, 80, 220, 600, 800, 1000],
  [18, 90, 250, 700, 875, 1050],
  [18, 90, 250, 700, 875, 1050],
  [20, 100, 300, 750, 925, 1100],
  [22, 110, 330, 800, 975, 1150],
  [22, 110, 330, 800, 975, 1150],
  [24, 120, 360, 850, 1025, 1200],
  [26, 130, 390, 900, 1100, 1275],
  [26, 130, 390, 900, 1100, 1275],
  [28, 150, 450, 1000, 1200, 1400],
  [35, 175, 500, 1100, 1300, 1500],
  [50, 200, 600, 1400, 1700, 2000],
];
let cityIndex = 0;
export const MAP = layout.map(([name, kind, price], id) => {
  const city = typeof kind === 'number';
  return {
    id,
    name: String(name),
    landmark: LANDMARKS[id] || '',
    source: 0,
    kind: city ? 'city' : String(kind),
    group: city ? Number(kind) : -1,
    price: Number(price || 0),
    rent: city ? rents[cityIndex++] : [],
    build: city ? 50 * (1 + Math.floor(Number(kind) / 2)) : 0,
  };
});
// Preserve the original entity IDs: route order is independent of save references.
const additions = [
  ['酒泉', '绿洲商亭', 113],
  ['敦煌', '沙门驿院', 113],
  ['令居', '河谷烽台', 113],
  ['武功', '山口台榭', 109],
  ['美阳', '原野宫苑', 109],
  ['郿', '夯土重坞', 109],
  ['偃师', '洛水台院', 109],
  ['巩', '河津仓亭', 109],
  ['缑氏', '山关望亭', 109],
  ['蓟', '北地楼橹', 113],
  ['邯郸', '丛台城苑', 110],
  ['安平', '平畴坞院', 110],
  ['阳翟', '钧台庭院', 110],
  ['颍阴', '颍水市亭', 110],
  ['平舆', '田畴聚落', 110],
  ['宛', '南阳城阙', 112],
  ['新野', '水岸村营', 112],
  ['零陵', '湘水山亭', 112],
  ['丹徒', '江津船埠', 112],
  ['柴桑', '湖岸军港', 112],
  ['曲阿', '水乡庭院', 112],
  ['绵竹', '竹麓关院', 113],
  ['雒', '山前城阙', 113],
  ['涪', '江谷层台', 113],
];
additions.forEach(([name, landmark, source], index) => {
  const group = Math.floor(index / 3);
  const peers = MAP.slice(0, 40).filter((t) => t.group === group);
  const model = peers[index % peers.length];
  MAP.push({
    ...model,
    id: 40 + index,
    name: String(name),
    landmark: String(landmark),
    source: Number(source),
    rent: [...model.rent],
  });
});
const insertAfter = [3, 9, 14, 19, 24, 29, 34, 39];
export const ROUTE = layout.flatMap((_, id) => {
  const region = insertAfter.indexOf(id);
  return region < 0 ? [id] : [id, ...Array.from({ length: 3 }, (_, i) => 40 + region * 3 + i)];
});
export const ROUTE_INDEX = MAP.map((t) => ROUTE.indexOf(t.id));
export function advanceTile(id, steps) {
  const index = ROUTE_INDEX[id] + steps;
  return ROUTE[((index % ROUTE.length) + ROUTE.length) % ROUTE.length];
}
// Names and biographical groupings follow the cited primary-source volumes; stats are game design.
const people = [
  ['关羽', '蜀', '骑', 3, 36],
  ['张飞', '蜀', '步', 3, 36],
  ['赵云', '蜀', '骑', 3, 36],
  ['马超', '蜀', '骑', 3, 36],
  ['黄忠', '蜀', '弓', 3, 36],
  ['诸葛亮', '蜀', '弓', 3, 35],
  ['庞统', '蜀', '弓', 2, 37],
  ['法正', '蜀', '弓', 2, 37],
  ['魏延', '蜀', '步', 2, 40],
  ['姜维', '蜀', '步', 2, 44],
  ['马岱', '蜀', '骑', 1, 36],
  ['王平', '蜀', '步', 1, 43],
  ['廖化', '蜀', '步', 1, 45],
  ['张辽', '魏', '骑', 3, 17],
  ['徐晃', '魏', '步', 2, 17],
  ['张郃', '魏', '弓', 2, 17],
  ['于禁', '魏', '步', 1, 17],
  ['乐进', '魏', '步', 1, 17],
  ['夏侯惇', '魏', '骑', 2, 9],
  ['夏侯渊', '魏', '弓', 2, 9],
  ['曹仁', '魏', '步', 2, 9],
  ['许褚', '魏', '步', 2, 18],
  ['郭嘉', '魏', '弓', 3, 14],
  ['荀彧', '魏', '弓', 2, 10],
  ['荀攸', '魏', '弓', 2, 10],
  ['贾诩', '魏', '弓', 3, 10],
  ['周瑜', '吴', '弓', 3, 54],
  ['鲁肃', '吴', '步', 2, 54],
  ['吕蒙', '吴', '步', 2, 54],
  ['陆逊', '吴', '弓', 3, 58],
  ['甘宁', '吴', '弓', 2, 55],
  ['太史慈', '吴', '弓', 2, 49],
  ['周泰', '吴', '步', 1, 55],
  ['黄盖', '吴', '步', 1, 55],
  ['程普', '吴', '骑', 1, 55],
  ['华雄', '群', '骑', 1, 46],
  ['高顺', '群', '步', 2, 7],
  ['陈宫', '群', '弓', 2, 7],
  ['张宝', '群', '弓', 1, 0],
  ['张梁', '群', '步', 1, 0],
];
export const GENERALS = people.map(([name, faction, troop, rarity, volume], id) => ({
  id,
  name: String(name),
  faction: String(faction),
  troop: String(troop),
  rarity: Number(rarity),
  role: [5, 6, 22, 25, 26, 29, 38, 39].includes(id)
    ? 'strategist'
    : [7, 23, 24, 27, 34, 37].includes(id)
      ? 'support'
      : troop === '骑'
        ? 'rider'
        : troop === '弓'
          ? 'archer'
          : 'vanguard',
  hp: 105 + Number(rarity) * 16 + (id % 4) * 7,
  atk: 27 + Number(rarity) * 4 + (id % 5),
  def: 9 + (id % 6) * 2,
  speed: 12 + (id % 9),
  ability: SKILLS[id].name,
  abilityDescription: SKILLS[id].description,
  source: BIOGRAPHIES[String(name)]?.source || (volume ? `三国志·卷${volume}` : '后汉书·卷71'),
}));
GENERALS.push(
  ...NEW_PEOPLE.map((p, index) => {
    const id = index + 40;
    return {
      id,
      name: p.name,
      faction: p.faction,
      troop: p.troop,
      rarity: p.rarity,
      role: p.role,
      hp: 105 + p.rarity * 16 + (id % 4) * 7,
      atk: 27 + p.rarity * 4 + (id % 5),
      def: 9 + (id % 6) * 2,
      speed: 12 + (id % 9),
      ability: SKILLS[id].name,
      abilityDescription: SKILLS[id].description,
      source: BIOGRAPHIES[p.name].source,
    };
  }),
);
export const SLOTS = ['头', '手', '武器', '铠甲', '护腿', '脚'];
export const ITEMS = ['铁胄', '革护手', '环首刀', '札甲', '胫甲', '革靴'];
export const QUALITY = ['素品', '良品', '上品', '珍品', '绝品'];
export const QUALITY_COLORS = ['#b4b8af', '#63bf99', '#6ab2ed', '#bc8cde', '#f3c967'];
export const BONDS = [
  { name: '关张并驱', members: [0, 1], effect: 'atk', value: 8 },
  { name: '卧龙凤雏', members: [5, 6], effect: 'hp', value: 25 },
  { name: '五子良将', members: [13, 14, 15, 16, 17], effect: 'def', value: 6 },
  { name: '江东都督', members: [26, 27, 28, 29], effect: 'atk', value: 6 },
];
const cards = [
  ['劝农', 'board', 'cash', 100, '获得100金。'],
  ['军需调拨', 'board', 'supply', 30, '获得30粮。'],
  ['举荐贤才', 'board', 'recruit', 1, '免费招募1次。'],
  ['开府授甲', 'board', 'gear', 1, '获得随机装备。'],
  ['休养生息', 'board', 'heal', 1, '解除全部武将负伤。'],
  ['工匠云集', 'board', 'discount', 1, '下一次建设费用减半。'],
  ['通行文书', 'board', 'shield', 1, '免除下一次敌城租金。'],
  ['急行军', 'board', 'move', 3, '向前移动3格并结算。'],
  ['轻骑探路', 'board', 'move', 1, '向前移动1格并结算。'],
  ['回师整备', 'board', 'home', 1, '返回起点，不领起点收入。'],
  ['粮车护送', 'board', 'supply', 50, '获得50粮。'],
  ['传习兵法', 'board', 'material', 4, '获得4份培养材料。'],
  ['市易兴利', 'board', 'cash', 150, '获得150金。'],
  ['招徕流民', 'board', 'cash', 80, '获得80金。'],
  ['赏赐三军', 'board', 'material', 2, '获得2份培养材料。'],
  ['军械入库', 'board', 'gear', 1, '获得随机装备。'],
  ['火攻', 'battle', 'damage', 45, '对选中敌人造成45伤害。'],
  ['破城锤', 'battle', 'wall', 65, '对城墙造成65伤害。'],
  ['金疮药', 'battle', 'heal', 50, '恢复当前武将50生命。'],
  ['坚壁', 'battle', 'defend', 12, '当前武将本场防御+12。'],
  ['奋勇', 'battle', 'attack', 12, '当前武将本场攻击+12。'],
  ['箭雨', 'battle', 'all', 22, '所有敌军受到22伤害。'],
  ['鼓舞', 'battle', 'teamheal', 22, '己方所有存活武将恢复22生命。'],
  ['陷阵', 'battle', 'damage', 60, '对选中敌人造成60伤害。'],
];
export const CARDS = cards.map(([name, timing, effect, value, description], id) => ({
  id,
  name: String(name),
  timing: String(timing),
  effect: String(effect),
  value: Number(value),
  description: String(description),
}));
export const EVENTS = [
  { name: '商路畅通', cash: 100 },
  { name: '修葺桥梁', cash: -80 },
  { name: '丰岁入仓', cash: 150 },
  { name: '赈济乡里', cash: -100 },
  { name: '朝廷赏赐', cash: 200 },
  { name: '行商获利', cash: 50 },
  { name: '押送问讯', jail: true },
  { name: '奉诏归营', home: true },
  { name: '通关赦令', escape: true },
  { name: '退避三舍', back: 3 },
  { name: '整修城防', repair: true },
  { name: '缴纳杂赋', cash: -50 },
];
export const SOURCES = [
  ['人物总目与传记', 'https://zh.wikisource.org/wiki/三國志'],
  ['刘备、荆襄与入蜀', 'https://zh.wikisource.org/wiki/三國志/卷32'],
  ['孙权、吴与建业沿革', 'https://zh.wikisource.org/wiki/三國志/卷47'],
  ['曹操与中原地名', 'https://zh.wikisource.org/wiki/三國志/卷01'],
  ['张角、张宝、张梁与关中', 'https://zh.wikisource.org/wiki/後漢書/卷71'],
  ['司马懿', 'https://zh.wikisource.org/wiki/晉書/卷001'],
  ['地名参照：郡国志', 'https://zh.wikisource.org/wiki/後漢書'],
  ['关中与河洛地名：郡国一', 'https://zh.wikisource.org/wiki/後漢書/卷109'],
  ['中原与河北地名：郡国二', 'https://zh.wikisource.org/wiki/後漢書/卷110'],
  ['荆襄与江东地名：郡国四', 'https://zh.wikisource.org/wiki/後漢書/卷112'],
  ['凉州、巴蜀与蓟：郡国五', 'https://zh.wikisource.org/wiki/後漢書/卷113'],
];
export function validateData() {
  if (
    MAP.length !== 64 ||
    MAP.filter((t) => t.kind === 'city').length !== 46 ||
    GENERALS.length !== 90 ||
    CARDS.length !== 24
  )
    throw Error('内容数量不符');
  if (REGIONS.some((_, i) => MAP.filter((t) => t.group === i).length !== ([0, 7].includes(i) ? 5 : 6)))
    throw Error('区域数量不符');
  if (ROUTE.length !== MAP.length || new Set(ROUTE).size !== MAP.length || ROUTE.some((id) => !MAP[id]))
    throw Error('行军路线未完整覆盖地图');
  if (new Set(MAP.filter((t) => t.kind === 'city').map((t) => t.name)).size !== 46) throw Error('城池重名');
  if (new Set(GENERALS.map((g) => g.name)).size !== GENERALS.length) throw Error('武将重名');
  return true;
}
