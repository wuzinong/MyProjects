export type ElementType = 
  | '金' | '木' | '水' | '火' | '土' 
  | '雷' | '冰' | '风' | '毒' | '血' 
  | '魂' | '暗' | '光' | '空间' | '时间'
  | '庚金' | '辟邪神雷' | '乾蓝冰焰' | '紫极神光' | '混沌';

export type RootType = 
  | '天灵根' | '变异雷灵根' | '变异冰灵根' | '变异风灵根' | '变异金灵根' | '变异火灵根' | '水木双灵根'
  | '双灵根' | '五灵根' | '真凤血脉' | '真龙血脉' | '混沌神根' | string;

export type RealmId = 
  | 'REALM001' // 炼气
  | 'REALM002' // 筑基
  | 'REALM003' // 结丹
  | 'REALM004' // 元婴
  | 'REALM005' // 化神
  | 'REALM006' // 炼虚
  | 'REALM007' // 合体
  | 'REALM008' // 大乘
  | 'REALM009' // 渡劫
  | 'REALM010' // 飞升
  | 'REALM011' // 真仙
  | 'REALM012' // 金仙
  | 'REALM013' // 太乙
  | 'REALM014' // 大罗
  | 'REALM015';// 道祖

export type ItemRarity = '凡器' | '下品法器' | '中品法器' | '上品法器' | '法器' | '极品法器' | '古宝' | '法宝' | '通天灵宝' | '玄天灵宝' | '仙器' | '混沌至宝';

export type ItemCategory = 
  | 'weapon' 
  | 'armor' 
  | 'accessory' 
  | 'pill' 
  | 'herb' 
  | 'material' 
  | 'talisman'  // 符箓
  | 'fubao'     // 符宝
  | 'sword'     // 飞剑
  | 'formula'   // 丹方
  | 'manual';   // 功法

export interface GameItem {
  id: string;
  name: string;
  rarity: ItemRarity;
  category: ItemCategory;
  description: string;
  icon?: string;
  element?: ElementType;
  stats?: {
    atk?: number;
    def?: number;
    hp?: number;
    mp?: number;
    critRate?: number;
    speed?: number;
    qiRegen?: number;
  };
  effect?: string;
  price?: number;
  quantity?: number;
  ripenYears?: number;
}

// 1. Character Option Interface (人物 20种)
export interface CharacterOption {
  id: string;
  name: string;
  title: string;
  root: RootType;
  identity: string; // e.g. "韩跑路 / 掌天瓶之主"
  description: string;
  specialTrait: string;
  atkBonus: number;
  speedBonus: number;
  avatarKey: string;
  defaultWeapon: string;
  icon?: string;
}

// 2. Flying Sword / Magic Treasure Interface (法器/法宝 20种)
export interface FlyingSword {
  id: string;
  name: string;
  rarity: ItemRarity;
  count: number;
  element: ElementType;
  material: string;
  atk: number;
  speed: number;
  specialSkill: string;
  description: string;
  backgroundStory?: string;
  isFormationUnlocked: boolean;
  icon?: string;
  category?: '法器' | '法宝';
  statBoost?: { atk?: number; def?: number; speed?: number; hp?: number; mp?: number; critRate?: number };
}

// 3. Spell / Divine Ability Interface (法术/神通 20种)
export interface Spell {
  id: string;
  name: string;
  type: '法术' | '神通' | '功法';
  element: ElementType;
  level: number;
  maxLevel: number;
  mpCost: number;
  cooldown: number;
  lastCastTime: number;
  damage: number;
  area: number;
  description: string;
  unlocked: boolean;
  reqRealm: RealmId;
  effectFxKey: AttackEffectType;
  rarity?: ItemRarity;
  backgroundStory?: string;
  statBoost?: { atk?: number; def?: number; speed?: number; hp?: number; mp?: number; critRate?: number };
  icon?: string;
}

// 4. Element Definition (五行 20种)
export interface ElementInfo {
  name: ElementType;
  color: string;
  counterTarget: string;
  description: string;
  damageMultiplier: number;
  icon?: string;
}

// 5. Spirit Pet / Beast Interface (灵宠 20种)
export interface Pet {
  id: string;
  name: string;
  type: '灵兽' | '灵虫' | '真灵' | '古兽';
  level: number;
  exp: number;
  maxExp: number;
  atk: number;
  hp: number;
  maxHp: number;
  element: ElementType;
  skills: string[];
  description: string;
  evolutionStage: string;
  isActive: boolean;
  rarity?: ItemRarity;
  backgroundStory?: string;
  statBoost?: { atk?: number; def?: number; speed?: number; hp?: number; mp?: number; critRate?: number };
  icon?: string;
}

// 6. Talisman Interface (符箓 20种)
export interface Talisman {
  id: string;
  name: string;
  grade: '初级' | '中级' | '高级' | '太乙级' | '玄天级';
  element: ElementType;
  effect: string;
  duration: number; // in seconds
  statBoost: { atk?: number; def?: number; speed?: number; hpRegen?: number; hp?: number; mp?: number; critRate?: number };
  description: string;
  backgroundStory?: string;
  quantity: number;
  rarity?: ItemRarity;
  icon?: string;
}

// 7. Fu Bao / Talisman Treasure Interface (符宝 20种)
export interface FuBao {
  id: string;
  name: string;
  sourceTreasure: string; // e.g. "平天尺"
  charges: number; // e.g. 5/5
  maxCharges: number;
  element: ElementType;
  burstDamage: number;
  specialEffect: string;
  description: string;
  backgroundStory?: string;
  grade?: string;
  rarity?: ItemRarity;
  statBoost?: { atk?: number; def?: number; speed?: number; hp?: number; mp?: number; critRate?: number };
  icon?: string;
}

// 8. Cultivation Manual Interface (功法 20种)
export interface CultivationManual {
  id: string;
  name: string;
  creator: string;
  grade: '天阶' | '地阶' | '玄阶' | '仙阶';
  element: ElementType;
  layer: number;
  maxLayer: number;
  passiveAtk: number;
  passiveDef: number;
  passiveQiRegen: number;
  description: string;
  unlocked: boolean;
  rarity?: ItemRarity;
  backgroundStory?: string;
  statBoost?: { atk?: number; def?: number; speed?: number; hp?: number; mp?: number; critRate?: number };
  icon?: string;
}

// 9. Attack Visual FX Type (攻击特效 20种)
export type AttackEffectType = 
  | 'pixie_gold_thunder'      // 1. 辟邪金雷-金光霹雳
  | 'qingzhu_sword_array'    // 2. 青竹剑阵-万剑归宗
  | 'ice_storm_shard'        // 3. 冰锥暴风-极寒冰晶
  | 'flame_lotus_bullet'     // 4. 烈焰火弹-爆裂红莲
  | 'wind_blade_cyclone'     // 5. 风刃狂飙-青光旋风
  | 'ziji_divine_light'      // 6. 紫极神光-紫霞贯日
  | 'soul_pierce_shock'      // 7. 惊神刺-灵魂震爆
  | 'gold_beetle_swarm'      // 8. 噬金虫群-金光风暴
  | 'weeping_soul_breath'    // 9. 啼魂绿光-吸魂吐息
  | 'ink_dragon_breath'      // 10. 墨蛟吐息-黑炎龙息
  | 'dageng_gold_grid'       // 11. 大庚剑阵-金光剑网
  | 'tuotian_black_fire'     // 12. 托天魔火-幽冥黑炎
  | 'fubao_press_stamp'      // 13. 符宝镇压-金光大印
  | 'talisman_burst_ring'    // 14. 符箓爆破-符文光环
  | 'taiyi_divine_beam'      // 15. 太乙神光-七彩霞光
  | 'qianlan_ice_flame'      // 16. 乾蓝冰焰-蓝白冷焰
  | 'blood_slash_strike'     // 17. 碎魂一击-红煞血光
  | 'xuantian_sword_aura'    // 18. 玄天剑气-划破虚空
  | 'green_vial_aura'        // 19. 掌天瓶韵-绿色道韵
  | 'tribulation_purple_bolt';// 20. 渡劫天雷-九天紫雷

export interface Sect {
  id: string;
  name: string;
  region: string;
  leader: string;
  description: string;
  reputation: number;
  contributionPoints: number;
  techniques: string[];
  shopItems: GameItem[];
}

export interface Quest {
  id: string;
  title: string;
  chapter: string;
  description: string;
  type: 'main' | 'side' | 'sect' | 'secret';
  targetEnemy?: string;
  targetCount?: number;
  currentCount?: number;
  targetItem?: string;
  rewardExp: number;
  rewardStones: number;
  rewardItems: GameItem[];
  completed: boolean;
  active: boolean;
}

export interface RealmInfo {
  id: RealmId;
  name: string;
  english: string;
  lifespan: string;
  qiCapacity: number;
  flight: boolean;
  divineSenseStars: number;
  pills: string[];
  breakthroughRequirement: string;
  breakthroughPillNeeded?: string;
  statMultiplier: number;
  levelRange: string;
}

export interface MapZone {
  id: string;
  name: string;
  recommendedRealm: string;
  description: string;
  bgColor: string;
  monsterTypes: string[];
  bossName: string;
  bossHp: number;
  bossAtk: number;
  drops: string[];
  unlocked: boolean;
  isSecretRealm?: boolean;
}

export interface PlayerStats {
  name: string;
  title: string;
  root: RootType;
  sectId: string;
  sectName: string;
  realmId: RealmId;
  level: number;
  
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  exp: number;
  maxExp: number;
  divineSense: number;
  
  atk: number;
  def: number;
  critRate: number;
  critDamage: number;
  moveSpeed: number;
  qiRegen: number;
  
  spiritStones: number;
  demonCores: number;
  greenVialLiquids: number;
  equippedSwordElements?: string[];
  equippedWeapon?: GameItem;
  isAutoMagnetEnabled?: boolean;
  killCount?: number;
  
  age: number;
  maxAge: number;

  isBottleneck: boolean;
  tribulationProgress: number;
  selectedEffectFx: AttackEffectType;
}

export interface DropItem {
  id: string;
  x: number;
  y: number;
  type: 'exp' | 'stone' | 'core' | 'liquid' | 'item';
  item?: GameItem;
  amount?: number;
  life: number;
}

export interface EnemyEntity {
  id: string;
  name: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  hp: number;
  maxHp: number;
  atk: number;
  speed: number;
  radius: number;
  color: string;
  isBoss?: boolean;
  element?: ElementType;
  icon?: string;
  title?: string;
  isRaged?: boolean;
  shield?: number;
  maxShield?: number;
  lastSkillTime?: number;
  bossPhase?: number;
}

export interface ProjectileEntity {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  damage: number;
  life: number;
  color: string;
  isSword?: boolean;
  swordAngle?: number;
  element?: ElementType;
  owner: 'player' | 'pet' | 'enemy';
  effectFxKey?: AttackEffectType;
}

export interface ParticleEntity {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  life: number;
  maxLife: number;
  text?: string;
  effectType?: AttackEffectType;
  type?: 'leaf' | 'ash' | 'sand' | 'water_wave' | 'water_drop' | 'flame_leap' | 'ember_flicker' | 'rock_shatter' | 'stone_chunk' | 'vine_coil' | 'leaf_swirl' | 'lightning_spark';
  angle?: number;
  omega?: number;
  isCombatText?: boolean;
  strokeColor?: string;
  glowColor?: string;
  element?: ElementType;
  accelX?: number;
  accelY?: number;
  radius?: number;
  maxRadius?: number;
  waveFreq?: number;
  waveAmp?: number;
  spiralRadius?: number;
  spiralAngle?: number;
  centerPos?: { x: number; y: number };
}

export interface DropItem {
  id: string;
  x: number;
  y: number;
  type: 'stone' | 'core' | 'exp' | 'liquid' | 'item';
  amount?: number;
  life: number;
  itemData?: GameItem;
}

export interface BossLootItem {
  id: string;
  name: string;
  type: 'stone' | 'core' | 'item';
  amount?: number;
  itemData?: GameItem;
  rarity?: string;
  icon?: string;
  category?: string;
  description?: string;
}

export interface BossChestEntity {
  id: string;
  x: number;
  y: number;
  bossName: string;
  opened: boolean;
  spawnTime: number;
  rarity: '天阶宝箱' | '仙阶仙箱' | '混沌秘宝箱';
  lootItems: BossLootItem[];
}

export interface GardenSlot {
  id: string;
  itemId: string; // empty string if empty
  itemName: string;
  plantedAt: number;
  lastHarvestedAt: number;
}
