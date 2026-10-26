/** Skills are game fiction, not historical claims. */
function skill(name, description, target, effect, color, options = {}) {
  return {
    name,
    description,
    target,
    effect,
    color,
    cooldown: 3,
    power: 0,
    hits: 1,
    pierce: 0,
    execute: 0,
    wall: 1,
    splash: 0,
    drain: 0,
    heal: 0,
    healMissing: 0,
    shield: 0,
    defense: 0,
    attack: 0,
    cleanse: false,
    reduceCooldown: 0,
    breakShield: false,
    selfHeal: 0,
    selfShield: 0,
    selfAttack: 0,
    selfDefense: 0,
    teamHeal: 0,
    teamShield: 0,
    lowestHeal: 0,
    cost: 0,
    selfVulnerable: 0,
    statuses: [],
    ...options,
  };
}
const status = (kind, power, turns) => ({ kind, power, turns });
export const SKILLS = [
  skill(
    '青龙断岳',
    '单体170%攻击，穿透30%防御；目标生命低于35%时伤害再乘1.6。',
    'enemy',
    'crescent',
    '#52ecc3',
    { power: 1.7, pierce: 0.3, execute: 0.35 },
  ),
  skill('当阳震喝', '震击全部敌军100%攻击，并降低8攻击，持续其2次行动。', 'enemies', 'quake', '#ffae66', {
    power: 1,
    statuses: [status('weaken', 8, 2)],
  }),
  skill('七进七出', '单体连续3次65%攻击，并获得18护盾。', 'enemy', 'lance', '#c5f5ff', {
    power: 0.65,
    hits: 3,
    selfShield: 18,
  }),
  skill('西凉铁骑', '单体160%攻击，穿透55%防御，自身攻击提升4至战斗结束。', 'enemy', 'charge', '#e7d29b', {
    power: 1.6,
    pierce: 0.55,
    selfAttack: 4,
  }),
  skill('百步穿杨', '连射2次150%攻击；目标生命低于40%时每箭伤害再乘1.6。', 'enemy', 'arrows', '#ffd97e', {
    power: 1.5,
    hits: 2,
    execute: 0.4,
    cooldown: 4,
  }),
  skill(
    '八阵天枢',
    '全部敌军70%攻击，易伤8持续2次行动；全队获得12护盾。',
    'enemies',
    'formation',
    '#86f6da',
    { power: 0.7, statuses: [status('vulnerable', 8, 2)], teamShield: 12 },
  ),
  skill('凤雏连环', '全部敌军60%攻击，灼烧9持续2次行动；全队恢复10生命。', 'enemies', 'chains', '#f6b97e', {
    power: 0.6,
    statuses: [status('burn', 9, 2)],
    teamHeal: 10,
  }),
  skill('奇谋护阵', '为一名友军清除减益、添加32护盾；自身攻击提升5。', 'ally', 'formation', '#ced9ff', {
    shield: 32,
    cleanse: true,
    selfAttack: 5,
  }),
  skill('子午奇袭', '单体145%攻击，吸取实际生命伤害的45%治疗自身。', 'enemy', 'dash', '#c995ff', {
    power: 1.45,
    drain: 0.45,
    cooldown: 2,
  }),
  skill('北伐锋芒', '单体110%攻击，封技1次行动；自身获得16护盾。', 'enemy', 'lance', '#8dd6f8', {
    power: 1.1,
    statuses: [status('silence', 0, 1)],
    selfShield: 16,
  }),
  skill('伏兵截道', '单体125%攻击，并以50%攻击溅射其余敌军。', 'enemy', 'ambush', '#dccb9e', {
    power: 1.25,
    splash: 0.5,
  }),
  skill('无当军阵', '全部友军防御提升3至战斗结束，并获得18护盾。', 'allies', 'shield', '#87c5a0', {
    defense: 3,
    shield: 18,
  }),
  skill('老骥奋战', '恢复自身已损生命的55%，并获得24护盾。', 'self', 'heal', '#e3d797', {
    healMissing: 0.55,
    shield: 24,
  }),
  skill('逍遥破阵', '单体150%攻击，降低7攻击持续2次行动；自身攻击提升4。', 'enemy', 'charge', '#86b8ff', {
    power: 1.5,
    statuses: [status('weaken', 7, 2)],
    selfAttack: 4,
  }),
  skill('长驱破垒', '单体135%攻击，穿透50%防御，对城墙伤害再乘2。', 'enemy', 'axe', '#ddbf8b', {
    power: 1.35,
    pierce: 0.5,
    wall: 2,
  }),
  skill('巧变双锋', '单体2次80%攻击，并使目标易伤7，持续2次行动。', 'enemy', 'blades', '#adbcff', {
    power: 0.8,
    hits: 2,
    statuses: [status('vulnerable', 7, 2)],
  }),
  skill('严整守备', '一名友军获得48护盾，防御提升4至战斗结束。', 'ally', 'shield', '#86c8f4', {
    shield: 48,
    defense: 4,
  }),
  skill('先登奋击', '单体2次115%攻击；自身恢复15生命。', 'enemy', 'lance', '#f8cb89', {
    power: 1.15,
    hits: 2,
    selfHeal: 15,
  }),
  skill('独目决战', '牺牲15生命（至少留1），单体170%攻击，自身获得35护盾。', 'enemy', 'axe', '#ff986e', {
    power: 1.7,
    cost: 15,
    selfShield: 35,
  }),
  skill('疾行箭阵', '以95%攻击扫射全部敌军，穿透40%防御。', 'enemies', 'arrows', '#adc8ff', {
    power: 0.95,
    pierce: 0.4,
  }),
  skill('金城铁壁', '为全部友军清除减益，并各添加35护盾。', 'allies', 'barrier', '#c7d8ed', {
    shield: 35,
    cleanse: true,
    cooldown: 4,
  }),
  skill('虎痴镇军', '自身攻击提升12、防御提升6至战斗结束，并恢复20生命。', 'self', 'tiger', '#f4c06f', {
    attack: 12,
    defense: 6,
    heal: 20,
    cooldown: 4,
  }),
  skill('遗计惊雷', '全部敌军70%攻击，并封技1次行动。', 'enemies', 'storm', '#aab9ff', {
    power: 0.7,
    statuses: [status('silence', 0, 1)],
  }),
  skill('王佐清风', '全部友军恢复24生命，并清除所有减益。', 'allies', 'heal', '#b7efdb', {
    heal: 24,
    cleanse: true,
  }),
  skill('十二奇策', '一名友军技能冷却减少2，恢复25生命，攻击提升5。', 'ally', 'scroll', '#e2d1ff', {
    reduceCooldown: 2,
    heal: 25,
    attack: 5,
  }),
  skill('帷幄毒计', '单体中毒18、易伤6，均持续其3次行动；不造成直接伤害。', 'enemy', 'poison', '#b3df80', {
    statuses: [status('poison', 18, 3), status('vulnerable', 6, 3)],
  }),
  skill('赤壁业火', '全部敌军100%攻击，灼烧14持续其2次行动。', 'enemies', 'fire', '#ff8f57', {
    power: 1,
    statuses: [status('burn', 14, 2)],
    cooldown: 4,
  }),
  skill('济军同舟', '全部友军恢复15生命并获得20护盾；自身防御提升4。', 'allies', 'tide', '#7bdfd6', {
    heal: 15,
    shield: 20,
    selfDefense: 4,
  }),
  skill('白衣渡江', '先破除目标护盾，再造成140%攻击，并封技1次行动。', 'enemy', 'mist', '#d8f3ed', {
    power: 1.4,
    breakShield: true,
    statuses: [status('silence', 0, 1)],
  }),
  skill(
    '火烧连营',
    '单体120%攻击、灼烧16持续3次行动；其余敌军受到45%攻击溅射。',
    'enemy',
    'fire',
    '#ffc36f',
    { power: 1.2, statuses: [status('burn', 16, 3)], splash: 0.45, cooldown: 4 },
  ),
  skill('锦帆夜袭', '单体连续4次50%攻击，每次穿透20%防御。', 'enemy', 'dash', '#73d4fa', {
    power: 0.5,
    hits: 4,
    pierce: 0.2,
  }),
  skill('双戟贯阵', '单体2次100%攻击，吸取实际伤害的20%；全队获得10护盾。', 'enemy', 'blades', '#88d9d5', {
    power: 1,
    hits: 2,
    drain: 0.2,
    teamShield: 10,
  }),
  skill('不屈铁躯', '恢复自身已损生命的65%，获得20护盾，攻击提升5。', 'self', 'barrier', '#efb6a0', {
    healMissing: 0.65,
    shield: 20,
    attack: 5,
    cooldown: 4,
  }),
  skill(
    '苦肉焚舟',
    '牺牲30生命（至少留1），全部敌军160%攻击，灼烧8持续2次行动。',
    'enemies',
    'fire',
    '#ff6859',
    { power: 1.6, cost: 30, statuses: [status('burn', 8, 2)], cooldown: 4 },
  ),
  skill('宿将督阵', '全部友军防御提升4、恢复18生命、技能冷却减少1。', 'allies', 'banner', '#d2d6b1', {
    defense: 4,
    heal: 18,
    reduceCooldown: 1,
    cooldown: 4,
  }),
  skill('关前骁威', '单体210%攻击；自身随后易伤8，持续2次行动。', 'enemy', 'axe', '#ed8d99', {
    power: 2.1,
    selfVulnerable: 8,
    cooldown: 2,
  }),
  skill('陷阵摧城', '单体110%攻击，对城墙伤害再乘2.8；全队获得18护盾。', 'enemy', 'charge', '#b4c4df', {
    power: 1.1,
    wall: 2.8,
    teamShield: 18,
  }),
  skill(
    '明策断谋',
    '单体降低10攻击持续3次行动、封技2次；治疗生命比例最低友军25。',
    'enemy',
    'scroll',
    '#dcbdf4',
    { statuses: [status('weaken', 10, 3), status('silence', 0, 2)], lowestHeal: 25 },
  ),
  skill(
    '地公妖风',
    '全部敌军65%攻击、中毒10持续2次行动；自身获得22护盾。',
    'enemies',
    'talisman',
    '#c0e778',
    { power: 0.65, statuses: [status('poison', 10, 2)], selfShield: 22 },
  ),
  skill(
    '人公雷符',
    '牺牲10生命（至少留1），全部敌军120%攻击、易伤10持续1次行动。',
    'enemies',
    'storm',
    '#ffdb6e',
    { power: 1.2, cost: 10, statuses: [status('vulnerable', 10, 1)] },
  ),
];
export const GUARD_SKILL = skill('守军反击', '单体150%攻击，自身获得10护盾。', 'enemy', 'slash', '#dbb994', {
  power: 1.5,
  selfShield: 10,
});
export const skillFor = (u) => (u.gid >= 0 ? SKILLS[u.gid] : GUARD_SKILL);
export const STATUS_NAMES = {
  burn: '灼烧',
  poison: '中毒',
  weaken: '虚弱',
  vulnerable: '易伤',
  silence: '封技',
};
