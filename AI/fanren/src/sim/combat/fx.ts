/** 战斗视觉事件队列：模拟层产生、渲染层消费（每帧 drain）。 */
import type { Element } from '@/sim/combat/damage';

export type FxEvent =
  | { kind: 'projectile'; fromX: number; fromY: number; toX: number; toY: number; element: Element; speed: number }
  | { kind: 'hit'; x: number; y: number; element: Element; amount: number; crit: boolean }
  | { kind: 'kill'; x: number; y: number; element: Element; elite: boolean }
  | { kind: 'aoe'; x: number; y: number; radius: number; element: Element }
  | { kind: 'ultimate-start' }
  | { kind: 'player-hurt'; amount: number }
  | { kind: 'pickup'; x: number; y: number; what: 'experience' | 'stone' | 'item' }
  | { kind: 'boss-spawn' }
  | { kind: 'talisman'; x: number; y: number };

export class FxQueue {
  private events: FxEvent[] = [];

  push(event: FxEvent): void {
    // 上限保护：渲染跟不上时丢弃最旧事件
    if (this.events.length > 512) this.events.shift();
    this.events.push(event);
  }

  drain(): FxEvent[] {
    const out = this.events;
    this.events = [];
    return out;
  }
}
