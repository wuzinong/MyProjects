/** 输入归一化：键盘与虚拟摇杆输出相同的移动意图向量。 */
export interface MoveIntent {
  x: number;
  y: number;
}

/** 键盘状态 → 归一化意图。 */
export class KeyboardAdapter {
  private keys = new Set<string>();

  keyDown(code: string): void {
    this.keys.add(code);
  }

  keyUp(code: string): void {
    this.keys.delete(code);
  }

  clear(): void {
    this.keys.clear();
  }

  get intent(): MoveIntent {
    let x = 0;
    let y = 0;
    if (this.keys.has('KeyA') || this.keys.has('ArrowLeft')) x -= 1;
    if (this.keys.has('KeyD') || this.keys.has('ArrowRight')) x += 1;
    if (this.keys.has('KeyW') || this.keys.has('ArrowUp')) y -= 1;
    if (this.keys.has('KeyS') || this.keys.has('ArrowDown')) y += 1;
    const len = Math.hypot(x, y);
    return len > 0 ? { x: x / len, y: y / len } : { x: 0, y: 0 };
  }
}

/** 虚拟摇杆：起点 + 当前触点 → 归一化意图（带死区与最大半径）。 */
export class JoystickAdapter {
  private originX = 0;
  private originY = 0;
  private currentX = 0;
  private currentY = 0;
  private active = false;

  constructor(
    private readonly maxRadius = 64,
    private readonly deadZone = 8,
  ) {}

  press(x: number, y: number): void {
    this.originX = x;
    this.originY = y;
    this.currentX = x;
    this.currentY = y;
    this.active = true;
  }

  move(x: number, y: number): void {
    if (!this.active) return;
    this.currentX = x;
    this.currentY = y;
  }

  release(): void {
    this.active = false;
  }

  get intent(): MoveIntent {
    if (!this.active) return { x: 0, y: 0 };
    const dx = this.currentX - this.originX;
    const dy = this.currentY - this.originY;
    const len = Math.hypot(dx, dy);
    if (len < this.deadZone) return { x: 0, y: 0 };
    const clamped = Math.min(len, this.maxRadius);
    const scale = clamped / this.maxRadius;
    return { x: (dx / len) * scale, y: (dy / len) * scale };
  }
}

/** 合并输入源：摇杆优先（激活时），否则键盘。 */
export function mergeIntents(keyboard: MoveIntent, joystick: MoveIntent): MoveIntent {
  if (Math.hypot(joystick.x, joystick.y) > 1e-6) return joystick;
  return keyboard;
}
