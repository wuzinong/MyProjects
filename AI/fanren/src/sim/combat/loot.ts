/** 掉落场：经验珠与道具宝盒，幂等拾取。 */
interface LootEntry {
  id: number;
  x: number;
  y: number;
  kind: 'experience' | 'item';
  value: number;
  item: string | null;
}

export interface LootCollector {
  onExperience: (amount: number) => void;
  onItem: (item: string) => void;
}

export class LootField {
  private entries: Map<number, LootEntry> = new Map();
  private nextId = 1;

  dropExperience(x: number, y: number, amount: number): number {
    const id = this.nextId++;
    this.entries.set(id, { id, x, y, kind: 'experience', value: amount, item: null });
    return id;
  }

  dropItem(x: number, y: number, item: string): number {
    const id = this.nextId++;
    this.entries.set(id, { id, x, y, kind: 'item', value: 0, item });
    return id;
  }

  has(id: number): boolean {
    return this.entries.has(id);
  }

  get size(): number {
    return this.entries.size;
  }

  /** 收集半径内的掉落；条目在回调前移除，保证只结算一次。 */
  collect(x: number, y: number, radius: number, collector: LootCollector): void {
    const r2 = radius * radius;
    const collected: LootEntry[] = [];
    for (const entry of this.entries.values()) {
      const dx = entry.x - x;
      const dy = entry.y - y;
      if (dx * dx + dy * dy <= r2) collected.push(entry);
    }
    for (const entry of collected) {
      this.entries.delete(entry.id);
      if (entry.kind === 'experience') collector.onExperience(entry.value);
      else if (entry.item) collector.onItem(entry.item);
    }
  }
}
