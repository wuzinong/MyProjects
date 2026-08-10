/** 元素配色（参照 legacy 元素粒子配色）。 */
import type { Element } from '@/sim/combat/damage';

export const ELEMENT_COLORS: Record<Element, number> = {
  none: 0xd8d8d8,
  metal: 0xffe28a,
  wood: 0x7ddb7d,
  water: 0x6db7ff,
  fire: 0xff7a45,
  earth: 0xcda162,
  wind: 0x9fe8dc,
  lightning: 0xbf8bff,
  ice: 0xaee4ff,
};
