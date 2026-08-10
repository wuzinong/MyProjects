/** 境界与洞府内容配置。 */
import { z } from 'zod';

export const REALMS = ['炼气', '筑基', '结丹', '元婴', '化神'] as const;

export const RealmBonusSchema = z.object({
  realmIndex: z.number().int().nonnegative(),
  name: z.string(),
  startingHealthBonus: z.number().nonnegative(),
  startingManaBonus: z.number().nonnegative(),
  startingSkillSlots: z.number().int().nonnegative(),
  breakthroughPillId: z.string().nullable(),
  unlocksTrialId: z.string().nullable(),
});

export type RealmBonus = z.infer<typeof RealmBonusSchema>;

export const REALM_TABLE: RealmBonus[] = REALMS.map((name, i) =>
  RealmBonusSchema.parse({
    realmIndex: i,
    name,
    startingHealthBonus: i * 40,
    startingManaBonus: i * 20,
    startingSkillSlots: 1 + i,
    breakthroughPillId: i === 0 ? null : ['pill-zhuji', 'pill-jiedan', 'pill-yuanying', 'pill-huashen'][i - 1] ?? null,
    unlocksTrialId: i >= 1 ? ['blood-trial', 'chaos-star-sea', 'xutian-hall', 'spirit-void'][i - 1] ?? null : 'blood-trial',
  }),
);

export const HerbSchema = z.object({
  id: z.string(),
  name: z.string(),
  assetId: z.string(),
  greenLiquidCost: z.number().int().positive(),
});

export type Herb = z.infer<typeof HerbSchema>;

export const HERBS: Herb[] = [
  { id: 'herb-blood-spirit', name: '血灵草', assetId: 'herb-blood-spirit', greenLiquidCost: 2 },
  { id: 'herb-jiuqu-ginseng', name: '九曲灵参', assetId: 'herb-jiuqu-ginseng', greenLiquidCost: 4 },
  { id: 'herb-wannian', name: '万年灵草', assetId: 'herb-wannian', greenLiquidCost: 6 },
].map((h) => HerbSchema.parse(h));

export const PillRecipeSchema = z.object({
  id: z.string(),
  name: z.string(),
  assetId: z.string(),
  materials: z.record(z.string(), z.number().int().positive()),
  successChance: z.number().min(0).max(1),
  wastePillId: z.string(),
});

export type PillRecipe = z.infer<typeof PillRecipeSchema>;

export const PILL_RECIPES: PillRecipe[] = [
  {
    id: 'pill-zhuji', name: '筑基丹', assetId: 'pill-zhuji',
    materials: { 'herb-blood-spirit': 2, 'herb-jiuqu-ginseng': 1 },
    successChance: 0.8, wastePillId: 'pill-waste',
  },
  {
    id: 'pill-jiedan', name: '结丹丹', assetId: 'pill-juling',
    materials: { 'herb-jiuqu-ginseng': 2, 'herb-wannian': 1 },
    successChance: 0.6, wastePillId: 'pill-waste',
  },
].map((r) => PillRecipeSchema.parse(r));

export const HEAVEN_VIAL = {
  dropsPerHour: 1,
  capacity: 12,
  maxOfflineHours: 12,
};

export const ShopItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  price: z.number().int().positive(),
  description: z.string(),
});

export type ShopItem = z.infer<typeof ShopItemSchema>;

/** 坊市商品（灵石计价，参照 legacy 商店条目）。 */
export const SHOP_ITEMS: ShopItem[] = [
  { id: 'herb-blood-spirit', name: '血灵草', price: 20, description: '炼制筑基丹的基础灵草' },
  { id: 'herb-jiuqu-ginseng', name: '九曲灵参', price: 60, description: '稀有灵材，筑基/结丹丹方所需' },
  { id: 'herb-wannian', name: '万年灵草', price: 150, description: '结丹丹方核心灵材' },
  { id: 'pill-zhuji', name: '筑基丹', price: 300, description: '突破筑基期所需丹药' },
].map((i) => ShopItemSchema.parse(i));
