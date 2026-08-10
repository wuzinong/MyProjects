/** 构筑选项配置：神通/法宝/心法/灵宠，Zod 校验 + effect 注册表。 */
import { z } from 'zod';
import { ElementSchema } from './trial';

export const EFFECT_TYPES = [
  'projectile', 'aoe-burst', 'orbiting-swords', 'passive-stats',
  'summon-insects', 'chain-lightning', 'ultimate-domain',
] as const;

export const BuildCategorySchema = z.enum(['spell', 'artifact', 'art', 'pet']);

export const BuildLevelSchema = z.object({
  level: z.number().int().positive(),
  damage: z.number().nonnegative().optional(),
  cooldownSeconds: z.number().positive().optional(),
  manaCost: z.number().nonnegative().optional(),
  range: z.number().positive().optional(),
  magnitude: z.number().optional(),
  description: z.string(),
});

export const BuildOptionSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  name: z.string().min(1),
  category: BuildCategorySchema,
  assetId: z.string().min(1),
  element: ElementSchema,
  effectType: z.enum(EFFECT_TYPES),
  senseCost: z.number().nonnegative().default(0),
  weight: z.number().positive().default(10),
  maxLevel: z.number().int().positive(),
  requiresRealmIndex: z.number().int().nonnegative().default(0),
  levels: z.array(BuildLevelSchema).min(1),
  tagBonuses: z.array(z.object({ targetTag: z.string(), multiplier: z.number().positive() })).default([]),
});

export type BuildOption = z.infer<typeof BuildOptionSchema>;

export const BuildCatalogSchema = z.array(BuildOptionSchema).superRefine((options, ctx) => {
  const ids = new Set<string>();
  for (const option of options) {
    if (ids.has(option.id)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: `重复构筑 ID: ${option.id}` });
    }
    ids.add(option.id);
    if (option.levels.length !== option.maxLevel) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: `${option.id}: levels 数量必须等于 maxLevel` });
    }
    option.levels.forEach((lvl, i) => {
      if (lvl.level !== i + 1) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: `${option.id}: 等级必须从 1 连续递增` });
      }
    });
  }
});

function levels(count: number, make: (level: number) => Omit<z.infer<typeof BuildLevelSchema>, 'level'>) {
  return Array.from({ length: count }, (_, i) => ({ level: i + 1, ...make(i + 1) }));
}

export const BUILD_CATALOG: BuildOption[] = BuildCatalogSchema.parse([
  {
    id: 'fireball', name: '火弹术', category: 'spell', assetId: 'talisman-fireball',
    element: 'fire', effectType: 'projectile', maxLevel: 5,
    levels: levels(5, (l) => ({
      damage: 18 + l * 6, cooldownSeconds: Math.max(0.4, 1.1 - l * 0.12),
      manaCost: 4, range: 300, description: `瞬发火弹，伤害 ${18 + l * 6}`,
    })),
  },
  {
    id: 'ice-spike', name: '冰锥术', category: 'spell', assetId: 'skill-qianlan-ice-flame',
    element: 'water', effectType: 'projectile', maxLevel: 5,
    levels: levels(5, (l) => ({
      damage: 14 + l * 5, cooldownSeconds: 1.2, manaCost: 5, range: 280,
      magnitude: 0.5, description: `冰锥减速 50%，伤害 ${14 + l * 5}`,
    })),
  },
  {
    id: 'wind-blade', name: '风刃术', category: 'spell', assetId: 'skill-windthunder-dash',
    element: 'wind', effectType: 'projectile', maxLevel: 5,
    levels: levels(5, (l) => ({
      damage: 10 + l * 4, cooldownSeconds: 0.7, manaCost: 3, range: 340,
      description: `连发风刃，伤害 ${10 + l * 4}`,
    })),
  },
  {
    id: 'earth-spike', name: '地刺术', category: 'spell', assetId: 'skill-jingzhe-finger-a',
    element: 'earth', effectType: 'aoe-burst', maxLevel: 5,
    levels: levels(5, (l) => ({
      damage: 22 + l * 8, cooldownSeconds: 2.2, manaCost: 8, range: 160,
      description: `范围地刺，伤害 ${22 + l * 8}`,
    })),
  },
  {
    id: 'azure-swords', name: '青竹蜂云剑', category: 'artifact', assetId: 'talisman-qingyuan-sword',
    element: 'lightning', effectType: 'orbiting-swords', senseCost: 3, maxLevel: 6,
    tagBonuses: [{ targetTag: 'demonic', multiplier: 1.5 }, { targetTag: 'ghost', multiplier: 1.5 }],
    levels: [
      { level: 1, damage: 24, cooldownSeconds: 0.9, range: 220, magnitude: 3, description: '3 口飞剑绕身刺击' },
      { level: 2, damage: 30, cooldownSeconds: 0.8, range: 240, magnitude: 6, description: '6 口飞剑' },
      { level: 3, damage: 38, cooldownSeconds: 0.7, range: 260, magnitude: 12, description: '12 口：辟邪雷域，防近身 +20%' },
      { level: 4, damage: 46, cooldownSeconds: 0.6, range: 280, magnitude: 24, description: '24 口剑气长河' },
      { level: 5, damage: 56, cooldownSeconds: 0.5, range: 300, magnitude: 36, description: '36 口：连锁雷电弹射 5 次' },
      { level: 6, damage: 68, cooldownSeconds: 0.5, range: 320, magnitude: 72, description: '72 口：解锁大庚剑阵' },
    ],
  },
  {
    id: 'spring-art', name: '长春功', category: 'art', assetId: 'skill-azure-sword-art',
    element: 'wood', effectType: 'passive-stats', maxLevel: 4,
    levels: levels(4, (l) => ({
      magnitude: l, description: `每秒回复 ${l} 点生命`,
    })),
  },
  {
    id: 'misty-steps', name: '罗烟步', category: 'art', assetId: 'skill-blood-shadow-flash',
    element: 'none', effectType: 'passive-stats', maxLevel: 4,
    levels: levels(4, (l) => ({
      magnitude: 0.08 * l, description: `移速 +${8 * l}%，受击无敌帧 +${4 * l}%`,
    })),
  },
  {
    id: 'great-development', name: '太一诀', category: 'art', assetId: 'skill-dayan-art',
    element: 'none', effectType: 'passive-stats', maxLevel: 4,
    levels: levels(4, (l) => ({
      magnitude: 0.06 * l, description: `全技能冷却 -${6 * l}%`,
    })),
  },
  {
    id: 'gold-insects', name: '噬金虫', category: 'pet', assetId: 'fx-insect-swarm',
    element: 'metal', effectType: 'summon-insects', senseCost: 4, maxLevel: 4,
    levels: levels(4, (l) => ({
      damage: 8 + l * 5, cooldownSeconds: 0.5, range: 400,
      magnitude: 0.1 + 0.05 * l,
      description: `虫群附着精英啃噬，${10 + 5 * l}% 概率吞噬护盾/弹幕转化法力`,
    })),
  },
]);
