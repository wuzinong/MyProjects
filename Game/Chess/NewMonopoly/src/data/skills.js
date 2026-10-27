import { NEW_PEOPLE } from './people.js';

/** Skills are game fiction, not historical claims. */
function skill(name, description, target, effect, color, options = {}) {
  return {
    id: -1,
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
    selfStatuses: [],
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
const newStyles = {
  vanguard: ['slash', 'axe', 'quake', 'blades', 'lance'],
  rider: ['charge', 'dash', 'lance', 'ambush', 'crescent'],
  archer: ['arrows', 'ice', 'fire', 'wind', 'storm'],
  strategist: ['formation', 'storm', 'fire', 'ice', 'scroll'],
  support: ['heal', 'barrier', 'banner', 'wind', 'talisman'],
};
SKILLS.push(
  ...NEW_PEOPLE.map((p, i) => {
    const role = p.role,
      color = ['#84dbc0', '#e8b68c', '#a8dafa', '#cfb3ee', '#ead385'][i % 5];
    const effect = newStyles[role][i % 5];
    const power = 1.35 + (i % 6) * 0.08;
    if (role === 'support') {
      const heal = 22 + (i % 7) * 3,
        shield = 12 + (i % 5) * 3;
      return skill(
        p.skillName,
        `全部友军恢复${heal}生命、获得${shield}护盾；自身防御提升3。`,
        'allies',
        effect,
        color,
        { heal, shield, selfDefense: 3, cooldown: 3 + (i % 2) },
      );
    }
    if (role === 'strategist') {
      const kinds = ['burn', 'weaken', 'poison', 'vulnerable', 'silence'],
        kind = kinds[i % 5];
      const power = 0.65 + (i % 6) * 0.06,
        value = kind === 'silence' ? 0 : 6 + (i % 4) * 2;
      return skill(
        p.skillName,
        `全部敌军${Math.round(power * 100)}%攻击，附加${{ burn: '灼烧', weaken: '虚弱', poison: '中毒', vulnerable: '易伤', silence: '封技' }[kind]}${value || ''}持续${kind === 'silence' ? 1 : 2}次行动；自身获得${14 + (i % 9)}护盾。`,
        'enemies',
        effect,
        color,
        {
          power,
          statuses: [status(kind, value, kind === 'silence' ? 1 : 2)],
          selfShield: 14 + (i % 9),
          cooldown: 3 + (i % 2),
        },
      );
    }
    const hits = role === 'archer' ? 2 : 1,
      strike = hits === 2 ? power * 0.6 : power;
    const pierce = 0.15 + (i % 4) * 0.1,
      shield = 10 + (i % 13);
    return skill(
      p.skillName,
      `单体${hits}次${Math.round(strike * 100)}%攻击，穿透${Math.round(pierce * 100)}%防御；自身获得${shield}护盾。`,
      'enemy',
      effect,
      color,
      { power: strike, hits, pierce, selfShield: shield, cooldown: 2 + (i % 3) },
    );
  }),
);
export const LORD_SKILLS = [
  skill('昭烈仁风', '全体友军恢复32生命、清除减益并获得18护盾。', 'allies', 'heal', '#8ff0c1', {
    heal: 32,
    cleanse: true,
    shield: 18,
  }),
  skill('魏武挥鞭', '单体180%攻击；全体友军获得16护盾，自身攻击提升5。', 'enemy', 'blades', '#8bbdff', {
    power: 1.8,
    teamShield: 16,
    selfAttack: 5,
  }),
  skill(
    '鹰视天枢',
    '全部敌军80%攻击、虚弱10持续2次行动；自身获得30护盾。',
    'enemies',
    'formation',
    '#c6a4ff',
    { power: 0.8, statuses: [status('weaken', 10, 2)], selfShield: 30 },
  ),
  skill('江东惊涛', '全部敌军95%攻击；全队恢复18生命。', 'enemies', 'wind', '#8de3ee', {
    power: 0.95,
    teamHeal: 18,
  }),
  skill('太平天雷', '全部敌军110%攻击、易伤8持续2次行动。', 'enemies', 'storm', '#ffe29b', {
    power: 1.1,
    statuses: [status('vulnerable', 8, 2)],
    cooldown: 4,
  }),
  skill('西凉霸阵', '单体160%攻击，穿透30%防御；自身获得40护盾。', 'enemy', 'quake', '#ef9f81', {
    power: 1.6,
    pierce: 0.3,
    selfShield: 40,
  }),
  skill(
    '无双破军',
    '单体连续3次85%攻击，穿透25%防御；自身易伤8持续2次行动。',
    'enemy',
    'crescent',
    '#ffd39a',
    { power: 0.85, hits: 3, pierce: 0.25, selfVulnerable: 8, cooldown: 4 },
  ),
];
export const ADVANCED_SKILLS = [
  skill('横刀立阵', '单体140%攻击，自身获得24护盾。', 'enemy', 'slash', '#eeb584', {
    power: 1.4,
    selfShield: 24,
  }),
  skill('裂甲重击', '单体170%攻击，穿透60%防御。', 'enemy', 'axe', '#ffbe91', { power: 1.7, pierce: 0.6 }),
  skill('震地八方', '全部敌军105%攻击、虚弱8持续2次行动。', 'enemies', 'quake', '#ecc382', {
    power: 1.05,
    statuses: [status('weaken', 8, 2)],
  }),
  skill('百战不屈', '自身恢复70生命、获得60护盾并清除减益。', 'self', 'barrier', '#efdfac', {
    heal: 70,
    shield: 60,
    cleanse: true,
    cooldown: 4,
  }),
  skill('万军辟易', '单体3次90%攻击，溅射其他敌人60%攻击。', 'enemy', 'blades', '#ffe1ad', {
    power: 0.9,
    hits: 3,
    splash: 0.6,
    cooldown: 5,
  }),
  skill('疾风突进', '单体155%攻击，穿透25%防御。', 'enemy', 'dash', '#97e6df', { power: 1.55, pierce: 0.25 }),
  skill('铁骑踏阵', '全部敌军90%攻击，自身获得28护盾。', 'enemies', 'charge', '#d5ca9b', {
    power: 0.9,
    selfShield: 28,
  }),
  skill('回马破锋', '单体2次100%攻击，吸取伤害的25%恢复自身。', 'enemy', 'lance', '#aedbea', {
    power: 1,
    hits: 2,
    drain: 0.25,
  }),
  skill('奔雷贯甲', '单体210%攻击，穿透75%防御。', 'enemy', 'storm', '#b9c9ff', {
    power: 2.1,
    pierce: 0.75,
    cooldown: 4,
  }),
  skill('千骑绝尘', '全部敌军150%攻击，自身获得65护盾。', 'enemies', 'charge', '#ffe1b3', {
    power: 1.5,
    selfShield: 65,
    cooldown: 5,
  }),
  skill('穿云二矢', '单体2次90%攻击，穿透20%防御。', 'enemy', 'arrows', '#b7e4f2', {
    power: 0.9,
    hits: 2,
    pierce: 0.2,
  }),
  skill('火羽连营', '全部敌军80%攻击，灼烧10持续2次行动。', 'enemies', 'fire', '#ffad88', {
    power: 0.8,
    statuses: [status('burn', 10, 2)],
  }),
  skill('霜箭封锋', '单体180%攻击，封技1次行动。', 'enemy', 'ice', '#a4e8ff', {
    power: 1.8,
    statuses: [status('silence', 0, 1)],
  }),
  skill('追风贯日', '单体3次85%攻击，穿透40%防御。', 'enemy', 'wind', '#9ff5df', {
    power: 0.85,
    hits: 3,
    pierce: 0.4,
    cooldown: 4,
  }),
  skill('万箭星落', '全部敌军2次90%攻击，易伤10持续2次行动。', 'enemies', 'arrows', '#f7dba5', {
    power: 0.9,
    hits: 2,
    statuses: [status('vulnerable', 10, 2)],
    cooldown: 5,
  }),
  skill('迷阵惑军', '全部敌军70%攻击，虚弱8持续2次行动。', 'enemies', 'formation', '#c6b8e8', {
    power: 0.7,
    statuses: [status('weaken', 8, 2)],
  }),
  skill('雷火交征', '全部敌军95%攻击，灼烧12持续2次行动。', 'enemies', 'storm', '#ded195', {
    power: 0.95,
    statuses: [status('burn', 12, 2)],
  }),
  skill('寒川禁咒', '单体190%攻击，封技2次行动。', 'enemy', 'ice', '#a5d9fb', {
    power: 1.9,
    statuses: [status('silence', 0, 2)],
    cooldown: 4,
  }),
  skill('风卷残阵', '全部敌军110%攻击，清除其护盾。', 'enemies', 'wind', '#c5f5da', {
    power: 1.1,
    breakShield: true,
    cooldown: 4,
  }),
  skill(
    '星河天策',
    '全部敌军145%攻击、易伤12持续2次行动；全队获得35护盾。',
    'enemies',
    'formation',
    '#d7bdff',
    { power: 1.45, statuses: [status('vulnerable', 12, 2)], teamShield: 35, cooldown: 5 },
  ),
  skill('抚军安阵', '全体友军恢复26生命、获得20护盾。', 'allies', 'heal', '#a4e1c6', {
    heal: 26,
    shield: 20,
  }),
  skill('清心解厄', '一名友军清除减益，恢复55生命及已损失生命的25%。', 'ally', 'talisman', '#c5edc6', {
    heal: 55,
    healMissing: 0.25,
    cleanse: true,
  }),
  skill('坚壁护军', '全体友军获得55护盾、防御提升4。', 'allies', 'barrier', '#acd9ef', {
    shield: 55,
    defense: 4,
    cooldown: 4,
  }),
  skill('旌旗振旅', '全体友军攻击提升7、恢复35生命。', 'allies', 'banner', '#eddaaa', {
    attack: 7,
    heal: 35,
    cooldown: 4,
  }),
  skill('长歌济世', '全体友军恢复75生命、获得45护盾并清除减益。', 'allies', 'heal', '#b7f5de', {
    heal: 75,
    shield: 45,
    cleanse: true,
    cooldown: 5,
  }),
];
export const MANUAL_SKILLS = [
  skill('秘法·雷泽', '全部敌军100%攻击、易伤8持续2次行动。', 'enemies', 'storm', '#ddc2ff', {
    power: 1,
    statuses: [status('vulnerable', 8, 2)],
    cooldown: 4,
  }),
  skill('秘法·焚阵', '全部敌军80%攻击、灼烧16持续2次行动。', 'enemies', 'fire', '#ffb894', {
    power: 0.8,
    statuses: [status('burn', 16, 2)],
    cooldown: 4,
  }),
  skill('秘法·凝霜', '单体180%攻击，封技1次行动。', 'enemy', 'ice', '#a6e5ff', {
    power: 1.8,
    statuses: [status('silence', 0, 1)],
  }),
  skill('秘法·回春', '全体友军恢复45生命，清除减益。', 'allies', 'heal', '#a8efd3', {
    heal: 45,
    cleanse: true,
    cooldown: 4,
  }),
  skill('秘法·金城', '全体友军获得45护盾、防御提升3。', 'allies', 'barrier', '#efd698', {
    shield: 45,
    defense: 3,
    cooldown: 4,
  }),
  skill('秘法·御风', '单体2次100%攻击、穿透40%防御。', 'enemy', 'wind', '#a6f3df', {
    power: 1,
    hits: 2,
    pierce: 0.4,
  }),
];
export const TACTICAL_SKILLS = [
  skill('截锋缚刃', '单体115%攻击，缴械1次行动（不能普攻，但可施法或整息）。', 'enemy', 'chains', '#b6c8e0', {
    power: 1.15,
    statuses: [status('disarm', 0, 1)],
    cooldown: 4,
  }),
  skill(
    '横刀反震',
    '自身获得45护盾与反击姿态：2次自身行动内，首次受到直接攻击后以75%攻击反击一次。',
    'self',
    'counter',
    '#db9163',
    { shield: 45, statuses: [status('counter', 75, 2)], cooldown: 4 },
  ),
  skill('踏阵惊敌', '单体105%攻击，眩晕1次行动（只能整息，仍结算持续伤害）。', 'enemy', 'quake', '#e6bb7b', {
    power: 1.05,
    statuses: [status('stun', 0, 1)],
    cooldown: 5,
  }),
  skill(
    '回马邀击',
    '单体140%攻击，自身进入65%攻击反击姿态，持续2次自身行动，仅反击一次。',
    'enemy',
    'lance',
    '#db9163',
    { power: 1.4, selfStatuses: [status('counter', 65, 2)], cooldown: 4 },
  ),
  skill('锁弦缚手', '单体2次65%攻击，缴械1次行动。', 'enemy', 'arrows', '#8ed9ed', {
    power: 0.65,
    hits: 2,
    statuses: [status('disarm', 0, 1)],
    cooldown: 4,
  }),
  skill(
    '回弦伏射',
    '自身获得35护盾与90%攻击反击姿态，持续2次自身行动，仅反击一次。',
    'self',
    'counter',
    '#a5d8ee',
    { shield: 35, statuses: [status('counter', 90, 2)], cooldown: 4 },
  ),
  skill('定军雷印', '单体95%攻击，眩晕1次行动；城墙不受控制。', 'enemy', 'storm', '#a99adf', {
    power: 0.95,
    statuses: [status('stun', 0, 1)],
    cooldown: 5,
  }),
  skill(
    '镜阵返锋',
    '一名友军获得40护盾及80%攻击反击姿态，持续2次自身行动，仅反击一次。',
    'ally',
    'counter',
    '#b4b5ee',
    { shield: 40, statuses: [status('counter', 80, 2)], cooldown: 4 },
  ),
  skill('清音解缚', '一名友军恢复35生命并清除所有负面状态，保留反击姿态。', 'ally', 'talisman', '#9dddbb', {
    heal: 35,
    cleanse: true,
    cooldown: 3,
  }),
  skill(
    '护军还锋',
    '全体友军获得25护盾及50%攻击反击姿态，持续2次自身行动，每人仅反击一次。',
    'allies',
    'counter',
    '#dfc597',
    { shield: 25, statuses: [status('counter', 50, 2)], cooldown: 5 },
  ),
];
TACTICAL_SKILLS.forEach((s, i) => {
  s.id = 400 + i;
});
SKILLS.forEach((s, i) => {
  s.id = i;
});
LORD_SKILLS.forEach((s, i) => {
  s.id = 100 + i;
});
ADVANCED_SKILLS.forEach((s, i) => {
  s.id = 200 + i;
});
MANUAL_SKILLS.forEach((s, i) => {
  s.id = 300 + i;
});
export const GUARD_SKILL = skill('守军反击', '单体150%攻击，自身获得10护盾。', 'enemy', 'slash', '#dbb994', {
  power: 1.5,
  selfShield: 10,
});
export const skillById = (id) =>
  SKILLS[id] ||
  LORD_SKILLS[id - 100] ||
  ADVANCED_SKILLS[id - 200] ||
  MANUAL_SKILLS[id - 300] ||
  TACTICAL_SKILLS[id - 400] ||
  (id === -1 ? GUARD_SKILL : undefined);
export const skillFor = (u, id = u.skills?.[0]) =>
  id === undefined ? (u.gid >= 0 ? SKILLS[u.gid] : GUARD_SKILL) : skillById(id);
export const STATUS_NAMES = {
  burn: '灼烧',
  poison: '中毒',
  weaken: '虚弱',
  vulnerable: '易伤',
  silence: '封技',
  stun: '眩晕',
  disarm: '缴械',
  counter: '反击',
};
export const NEGATIVE_STATUSES = ['burn', 'poison', 'weaken', 'vulnerable', 'silence', 'stun', 'disarm'];
