/** 血色禁地内容配置：Zod 校验的敌人、波次、毒雾、首领与奖励数据。 */
import { z } from 'zod';

export const ElementSchema = z.enum(['none', 'metal', 'wood', 'water', 'fire', 'earth', 'wind', 'lightning', 'ice']);

export const EnemyConfigSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  name: z.string().min(1),
  assetId: z.string().min(1),
  maxHealth: z.number().positive(),
  moveSpeed: z.number().positive(),
  contactDamage: z.number().nonnegative(),
  element: ElementSchema,
  tags: z.array(z.string()),
  experience: z.number().nonnegative(),
  physicalDefense: z.number().nonnegative().default(0),
  magicalDefense: z.number().nonnegative().default(0),
  spiritualDefense: z.number().nonnegative().default(0),
  elite: z.boolean().default(false),
  dropsTreasureBox: z.boolean().default(false),
  behavior: z.enum(['chase', 'charge', 'swarm', 'web-spitter']).default('chase'),
});

export const WavePhaseSchema = z.object({
  id: z.string(),
  startSeconds: z.number().nonnegative(),
  endSeconds: z.number().positive(),
  enemyIds: z.array(z.string()).min(1),
  spawnsPerSecond: z.number().positive(),
  maxAlive: z.number().int().positive(),
});

export const FogStepSchema = z.object({
  atSeconds: z.number().nonnegative(),
  safeRadiusFraction: z.number().min(0.1).max(1),
});

export const BossConfigSchema = z.object({
  enemyId: z.string(),
  spawnAtSeconds: z.number().positive(),
  poisonBreath: z.object({
    damage: z.number().positive(),
    telegraphSeconds: z.number().positive(),
    cooldownSeconds: z.number().positive(),
    range: z.number().positive(),
  }),
  tailSweep: z.object({
    damage: z.number().positive(),
    armorBreak: z.number().positive(),
    armorBreakSeconds: z.number().positive(),
    telegraphSeconds: z.number().positive(),
    cooldownSeconds: z.number().positive(),
    range: z.number().positive(),
  }),
});

export const TrialConfigSchema = z.object({
  id: z.string(),
  name: z.string(),
  durationSeconds: z.number().positive(),
  worldSize: z.number().positive(),
  fogDamagePerTick: z.number().positive(),
  fogTickSeconds: z.number().positive(),
  enemies: z.array(EnemyConfigSchema).min(1),
  phases: z.array(WavePhaseSchema).min(1),
  fogSteps: z.array(FogStepSchema),
  boss: BossConfigSchema,
  victoryRewards: z.record(z.string(), z.number()),
  defeatRewardFraction: z.number().min(0).max(1),
});

export type EnemyConfig = z.infer<typeof EnemyConfigSchema>;
export type TrialConfig = z.infer<typeof TrialConfigSchema>;

/** 血色禁地（10 分钟单局）。 */
export const BLOOD_TRIAL: TrialConfig = TrialConfigSchema.parse({
  id: 'blood-trial',
  name: '血色禁地',
  durationSeconds: 600,
  worldSize: 2048,
  fogDamagePerTick: 8,
  fogTickSeconds: 1,
  enemies: [
    {
      id: 'poison-toad', name: '低阶毒蟾', assetId: 'enemy-fire-toad',
      maxHealth: 20, moveSpeed: 40, contactDamage: 6, element: 'water',
      tags: ['beast'], experience: 2, behavior: 'chase',
    },
    {
      id: 'black-wind-wolf', name: '黑风狼', assetId: 'enemy-silver-serpent',
      maxHealth: 28, moveSpeed: 55, contactDamage: 8, element: 'wind',
      tags: ['beast'], experience: 3, behavior: 'chase',
    },
    {
      id: 'flying-centipede', name: '飞天蜈蚣', assetId: 'enemy-frost-centipede',
      maxHealth: 40, moveSpeed: 90, contactDamage: 12, element: 'wood',
      tags: ['beast', 'flying'], experience: 5, behavior: 'charge',
    },
    {
      id: 'gold-ant-swarm', name: '噬金蚁群', assetId: 'enemy-xing-beast',
      maxHealth: 12, moveSpeed: 70, contactDamage: 4, element: 'metal',
      tags: ['beast', 'swarm'], experience: 1, behavior: 'swarm',
    },
    {
      id: 'blood-jade-spider', name: '精英血玉蜘蛛', assetId: 'enemy-blood-jade-spider',
      maxHealth: 600, moveSpeed: 45, contactDamage: 20, element: 'fire',
      tags: ['beast', 'elite'], experience: 50, physicalDefense: 10,
      elite: true, dropsTreasureBox: true, behavior: 'web-spitter',
    },
    {
      id: 'ink-flood-dragon', name: '墨蛟', assetId: 'enemy-deep-whale',
      maxHealth: 6000, moveSpeed: 35, contactDamage: 30, element: 'water',
      tags: ['beast', 'boss', 'demonic'], experience: 500, physicalDefense: 25,
      magicalDefense: 15, behavior: 'chase',
    },
  ],
  phases: [
    { id: 'opening', startSeconds: 0, endSeconds: 120, enemyIds: ['poison-toad', 'black-wind-wolf'], spawnsPerSecond: 2, maxAlive: 80 },
    { id: 'pressure', startSeconds: 120, endSeconds: 300, enemyIds: ['flying-centipede', 'gold-ant-swarm'], spawnsPerSecond: 4, maxAlive: 200 },
    { id: 'elite', startSeconds: 300, endSeconds: 480, enemyIds: ['gold-ant-swarm', 'flying-centipede', 'blood-jade-spider'], spawnsPerSecond: 4, maxAlive: 260 },
    { id: 'frenzy', startSeconds: 480, endSeconds: 590, enemyIds: ['poison-toad', 'black-wind-wolf', 'flying-centipede', 'gold-ant-swarm'], spawnsPerSecond: 8, maxAlive: 500 },
  ],
  fogSteps: [
    { atSeconds: 300, safeRadiusFraction: 0.7 },
    { atSeconds: 420, safeRadiusFraction: 0.5 },
    { atSeconds: 480, safeRadiusFraction: 0.35 },
  ],
  boss: {
    enemyId: 'ink-flood-dragon',
    spawnAtSeconds: 590,
    poisonBreath: { damage: 25, telegraphSeconds: 1.2, cooldownSeconds: 6, range: 260 },
    tailSweep: { damage: 40, armorBreak: 20, armorBreakSeconds: 4, telegraphSeconds: 1.5, cooldownSeconds: 10, range: 180 },
  },
  victoryRewards: { 'spirit-stone-low': 60, 'herb-blood-spirit': 3, 'material-thunder-bamboo': 1 },
  defeatRewardFraction: 0.3,
});
