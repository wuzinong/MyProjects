/** 实体池：数值 ID + 世代校验 + 延迟销毁队列。 */
export class EntityPool {
  private freeIds: number[] = [];
  private liveFlags: Uint8Array;
  private nextId = 0;
  private despawnQueue: number[] = [];
  count = 0;

  constructor(initialCapacity = 256) {
    this.liveFlags = new Uint8Array(initialCapacity);
  }

  spawn(): number {
    const id = this.freeIds.length > 0 ? (this.freeIds.pop() as number) : this.nextId++;
    if (id >= this.liveFlags.length) {
      const grown = new Uint8Array(this.liveFlags.length * 2);
      grown.set(this.liveFlags);
      this.liveFlags = grown;
    }
    this.liveFlags[id] = 1;
    this.count++;
    return id;
  }

  alive(id: number): boolean {
    return this.liveFlags[id] === 1;
  }

  despawn(id: number): void {
    if (this.liveFlags[id] !== 1) return;
    this.liveFlags[id] = 0;
    this.freeIds.push(id);
    this.count--;
  }

  queueDespawn(id: number): void {
    this.despawnQueue.push(id);
  }

  flushDespawns(): void {
    for (let i = 0; i < this.despawnQueue.length; i++) {
      this.despawn(this.despawnQueue[i] as number);
    }
    this.despawnQueue.length = 0;
  }

  forEach(fn: (id: number) => void): void {
    for (let id = 0; id < this.nextId; id++) {
      if (this.liveFlags[id] === 1) fn(id);
    }
  }

  get capacity(): number {
    return this.liveFlags.length;
  }
}
