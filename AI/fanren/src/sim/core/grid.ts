/** 均匀网格空间索引：插入/移动/删除/圆域查询，无热路径分配。 */
export class SpatialGrid {
  private readonly cellSize: number;
  private readonly cols: number;
  private cells: Map<number, number[]> = new Map();
  private positions: Map<number, { x: number; y: number; cell: number }> = new Map();

  constructor(cellSize: number, worldSize: number) {
    this.cellSize = cellSize;
    this.cols = Math.max(1, Math.ceil(worldSize / cellSize));
  }

  private cellKey(x: number, y: number): number {
    const cx = Math.max(0, Math.floor(x / this.cellSize));
    const cy = Math.max(0, Math.floor(y / this.cellSize));
    return cy * this.cols + cx;
  }

  insert(id: number, x: number, y: number): void {
    const key = this.cellKey(x, y);
    let bucket = this.cells.get(key);
    if (!bucket) {
      bucket = [];
      this.cells.set(key, bucket);
    }
    bucket.push(id);
    this.positions.set(id, { x, y, cell: key });
  }

  update(id: number, x: number, y: number): void {
    const pos = this.positions.get(id);
    if (!pos) {
      this.insert(id, x, y);
      return;
    }
    const key = this.cellKey(x, y);
    if (key !== pos.cell) {
      this.removeFromCell(id, pos.cell);
      let bucket = this.cells.get(key);
      if (!bucket) {
        bucket = [];
        this.cells.set(key, bucket);
      }
      bucket.push(id);
      pos.cell = key;
    }
    pos.x = x;
    pos.y = y;
  }

  remove(id: number): void {
    const pos = this.positions.get(id);
    if (!pos) return;
    this.removeFromCell(id, pos.cell);
    this.positions.delete(id);
  }

  private removeFromCell(id: number, cell: number): void {
    const bucket = this.cells.get(cell);
    if (!bucket) return;
    const idx = bucket.indexOf(id);
    if (idx >= 0) {
      bucket[idx] = bucket[bucket.length - 1] as number;
      bucket.pop();
    }
  }

  queryCircle(x: number, y: number, radius: number, fn: (id: number) => void): void {
    const minCx = Math.max(0, Math.floor((x - radius) / this.cellSize));
    const maxCx = Math.floor((x + radius) / this.cellSize);
    const minCy = Math.max(0, Math.floor((y - radius) / this.cellSize));
    const maxCy = Math.floor((y + radius) / this.cellSize);
    const r2 = radius * radius;
    for (let cy = minCy; cy <= maxCy; cy++) {
      for (let cx = minCx; cx <= maxCx; cx++) {
        const bucket = this.cells.get(cy * this.cols + cx);
        if (!bucket) continue;
        for (let i = 0; i < bucket.length; i++) {
          const id = bucket[i] as number;
          const pos = this.positions.get(id);
          if (!pos) continue;
          const dx = pos.x - x;
          const dy = pos.y - y;
          if (dx * dx + dy * dy <= r2) fn(id);
        }
      }
    }
  }
}
