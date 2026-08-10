/** 画质档位：只影响视觉预算，不影响模拟。 */
export type Quality = 'low' | 'medium' | 'high';

export interface VisualBudget {
  maxParticles: number;
  maxFloatingTexts: number;
  resolutionScale: number;
  filtersEnabled: boolean;
  maxVisibleSprites: number;
}

export const VISUAL_BUDGETS: Record<Quality, VisualBudget> = {
  low: { maxParticles: 100, maxFloatingTexts: 12, resolutionScale: 0.75, filtersEnabled: false, maxVisibleSprites: 700 },
  medium: { maxParticles: 400, maxFloatingTexts: 30, resolutionScale: 1, filtersEnabled: true, maxVisibleSprites: 1200 },
  high: { maxParticles: 1000, maxFloatingTexts: 60, resolutionScale: 1, filtersEnabled: true, maxVisibleSprites: 1800 },
};

export const MAX_DEVICE_PIXEL_RATIO = 2;

export function effectivePixelRatio(devicePixelRatio: number, quality: Quality): number {
  const capped = Math.min(devicePixelRatio, MAX_DEVICE_PIXEL_RATIO);
  return capped * VISUAL_BUDGETS[quality].resolutionScale;
}
