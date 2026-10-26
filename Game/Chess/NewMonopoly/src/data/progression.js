export const MAX_LEVEL = 50;
export const UNLOCK_LEVELS = [1, 5, 15, 25, 35, 45];
export const ROLES = ['vanguard', 'rider', 'archer', 'strategist', 'support'];
export const ROLE_NAMES = ['先锋', '骁骑', '神射', '谋略', '辅佐'];
export const LORD_ROLES = ['support', 'vanguard', 'strategist', 'archer', 'strategist', 'vanguard', 'rider'];
export const LORD_TROOPS = ['步', '骑', '弓', '弓', '弓', '步', '骑'];
export const TITLES = [
  ['侍中', '侍', '#83c8bd'],
  ['中郎将', '郎', '#7fbbdf'],
  ['偏将军', '偏', '#8da4e8'],
  ['安国将军', '安', '#a99ad9'],
  ['镇东将军', '镇', '#c492d6'],
  ['征西将军', '征', '#d99db2'],
  ['车骑将军', '车', '#e6b382'],
  ['骠骑将军', '骠', '#e2cb76'],
  ['大将军', '将', '#f0d68e'],
  ['丞相', '相', '#b2ead9'],
].map(([name, seal, color], id) => ({
  id,
  name,
  seal,
  color,
  level: (id + 1) * 5,
  hp: 6 + id * 2,
  atk: 1 + Math.floor(id / 3),
  def: 1 + Math.floor(id / 4),
  speed: id % 3,
}));
export const RELICS = [
  { name: '错金虎符', description: '攻击+6；开战获得12护盾。', atk: 6, shield: 12 },
  { name: '青玉佩', description: '生命+28；每次普攻或技能行动后恢复4生命。', hp: 28, regen: 4 },
  { name: '七弦琴', description: '防御+3；每次普攻或技能行动后恢复8生命。', def: 3, regen: 8 },
  { name: '兵书残卷', description: '速度+4，攻击+3。', speed: 4, atk: 3 },
  { name: '鎏金印', description: '生命+18，攻击+5。', hp: 18, atk: 5 },
  { name: '兽纹铜镜', description: '防御+5；开战获得20护盾。', def: 5, shield: 20 },
  { name: '双龙玉璧', description: '生命+36，防御+3。', hp: 36, def: 3 },
  { name: '羽纹铜铃', description: '速度+3；每次普攻或技能行动后恢复5生命。', speed: 3, regen: 5 },
];
export const LOOT_RATES = {
  victory: { chance: 0.65, manual: 0.25, gear: 0.45, relic: 0.3 },
  encounter: { chance: 0.3, manual: 0.25, gear: 0.45, relic: 0.3 },
};
export const xpNeeded = (level) => 80 + level * 30;
export const trainingExperience = (level) => Math.ceil(xpNeeded(level) * 0.6);
