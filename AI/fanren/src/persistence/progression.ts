/** 洞府成长：掌天瓶、催熟、炼丹、突破与秘境奖励结算。 */
import { HEAVEN_VIAL, HERBS, PILL_RECIPES, REALM_TABLE, SHOP_ITEMS } from '@/content/progression';
import type { SaveData } from '@/persistence/save';
import type { SeededRng } from '@/sim/core/rng';
import type { RunResult } from '@/sim/trial/run';

export interface OfflineSettlement {
  drops: number;
  cappedHours: number;
  clockRollback: boolean;
}

/** 离线绿液结算：上限 12 小时、容量 12 滴、时钟倒退零收益。 */
export function settleOffline(save: SaveData, now: number): OfflineSettlement {
  if (now < save.lastTrustedTimestamp) {
    save.lastTrustedTimestamp = now;
    return { drops: 0, cappedHours: 0, clockRollback: true };
  }
  const elapsedHours = (now - save.lastTrustedTimestamp) / 3_600_000;
  const cappedHours = Math.min(HEAVEN_VIAL.maxOfflineHours, elapsedHours);
  const earned = Math.floor(cappedHours * HEAVEN_VIAL.dropsPerHour);
  const space = HEAVEN_VIAL.capacity - save.greenLiquid;
  const drops = Math.max(0, Math.min(space, earned));
  save.greenLiquid += drops;
  if (earned > 0) save.lastTrustedTimestamp = now;
  return { drops, cappedHours, clockRollback: false };
}

/** 催熟灵草：原子扣绿液 + 入库。 */
export function matureHerb(save: SaveData, herbId: string): { ok: boolean; reason?: string } {
  const herb = HERBS.find((h) => h.id === herbId);
  if (!herb) return { ok: false, reason: '未知灵草' };
  if (save.greenLiquid < herb.greenLiquidCost) {
    return { ok: false, reason: `绿液不足：需要 ${herb.greenLiquidCost}，现有 ${save.greenLiquid}` };
  }
  save.greenLiquid -= herb.greenLiquidCost;
  save.inventory[herbId] = (save.inventory[herbId] ?? 0) + 1;
  return { ok: true };
}

export interface AlchemyOutcome {
  ok: boolean;
  produced?: string;
  reason?: string;
}

/** 炼丹：检查并原子消耗材料，按概率产出丹药或废丹。 */
export function refinePill(save: SaveData, recipeId: string, rng: SeededRng): AlchemyOutcome {
  const recipe = PILL_RECIPES.find((r) => r.id === recipeId);
  if (!recipe) return { ok: false, reason: '未知丹方' };
  for (const [material, needed] of Object.entries(recipe.materials)) {
    if ((save.inventory[material] ?? 0) < needed) {
      return { ok: false, reason: `材料不足：${material}` };
    }
  }
  for (const [material, needed] of Object.entries(recipe.materials)) {
    save.inventory[material] = (save.inventory[material] ?? 0) - needed;
  }
  const produced = rng.chance(recipe.successChance) ? recipe.id : recipe.wastePillId;
  save.inventory[produced] = (save.inventory[produced] ?? 0) + 1;
  return { ok: true, produced };
}

/** 境界突破：消耗对应丹药，应用永久解锁。 */
export function breakthrough(save: SaveData): { ok: boolean; reason?: string } {
  const next = REALM_TABLE[save.realmIndex + 1];
  if (!next) return { ok: false, reason: '已是最高境界' };
  const pill = next.breakthroughPillId;
  if (pill && (save.inventory[pill] ?? 0) < 1) {
    return { ok: false, reason: `需要 ${pill}` };
  }
  if (pill) save.inventory[pill] = (save.inventory[pill] ?? 0) - 1;
  save.realmIndex = next.realmIndex;
  if (next.unlocksTrialId && !save.unlockedTrials.includes(next.unlocksTrialId)) {
    save.unlockedTrials.push(next.unlocksTrialId);
  }
  return { ok: true };
}

/** 当前境界的局内初始加成。 */
export function realmBonuses(save: SaveData) {
  const realm = REALM_TABLE[save.realmIndex] ?? REALM_TABLE[0];
  if (!realm) throw new Error('境界表为空');
  return realm;
}

/** 秘境奖励入库：runId 幂等。 */
export function claimRunRewards(save: SaveData, result: RunResult): boolean {
  if (save.claimedRunIds.includes(result.runId)) return false;
  for (const [item, amount] of Object.entries(result.rewards)) {
    save.inventory[item] = (save.inventory[item] ?? 0) + amount;
  }
  save.claimedRunIds.push(result.runId);
  if (save.claimedRunIds.length > 200) save.claimedRunIds.splice(0, save.claimedRunIds.length - 200);
  return true;
}

/** 坊市购买：灵石原子扣款 + 入库。 */
export function buyShopItem(save: SaveData, itemId: string): { ok: boolean; reason?: string } {
  const item = SHOP_ITEMS.find((i) => i.id === itemId);
  if (!item) return { ok: false, reason: '未知商品' };
  const stones = save.inventory['spirit-stone-low'] ?? 0;
  if (stones < item.price) {
    return { ok: false, reason: `灵石不足：需要 ${item.price}，现有 ${stones}` };
  }
  save.inventory['spirit-stone-low'] = stones - item.price;
  save.inventory[itemId] = (save.inventory[itemId] ?? 0) + 1;
  return { ok: true };
}
