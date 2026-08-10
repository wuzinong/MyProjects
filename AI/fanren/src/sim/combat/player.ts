/** 玩家状态：移动、生命/法力/神识、无敌帧与死亡。 */
export interface PlayerConfig {
  maxHealth: number;
  maxMana: number;
  manaRegenPerSecond: number;
  maxSpiritualSense: number;
  moveSpeed: number;
  worldSize: number;
}

export type PlayerDamageKind = 'contact' | 'projectile' | 'fog' | 'boss';

const INVULN_SECONDS = 0.8;
/** 无敌帧只保护普通接触/弹幕；毒雾与首领大招不可闪避。 */
const INVULN_BYPASS: ReadonlySet<PlayerDamageKind> = new Set(['fog', 'boss']);

export class PlayerState {
  x: number;
  y: number;
  health: number;
  mana: number;
  dead = false;
  onDeath: (() => void) | null = null;

  private moveX = 0;
  private moveY = 0;
  private invulnRemaining = 0;
  private senseUsers: Map<string, number> = new Map();

  constructor(readonly config: PlayerConfig) {
    this.x = config.worldSize / 2;
    this.y = config.worldSize / 2;
    this.health = config.maxHealth;
    this.mana = config.maxMana;
  }

  setMoveIntent(x: number, y: number): void {
    const len = Math.hypot(x, y);
    if (len > 1e-6) {
      this.moveX = x / Math.max(1, len);
      this.moveY = y / Math.max(1, len);
    } else {
      this.moveX = 0;
      this.moveY = 0;
    }
  }

  step(dt: number): void {
    if (this.dead) return;
    this.x = Math.min(this.config.worldSize, Math.max(0, this.x + this.moveX * this.config.moveSpeed * dt));
    this.y = Math.min(this.config.worldSize, Math.max(0, this.y + this.moveY * this.config.moveSpeed * dt));
    this.mana = Math.min(this.config.maxMana, this.mana + this.config.manaRegenPerSecond * dt);
    this.invulnRemaining = Math.max(0, this.invulnRemaining - dt);
  }

  spendMana(amount: number): boolean {
    if (this.mana < amount) return false;
    this.mana -= amount;
    return true;
  }

  gainMana(amount: number): void {
    this.mana = Math.min(this.config.maxMana, this.mana + amount);
  }

  get senseUsed(): number {
    let total = 0;
    for (const v of this.senseUsers.values()) total += v;
    return total;
  }

  get senseAvailable(): number {
    return this.config.maxSpiritualSense - this.senseUsed;
  }

  occupySense(amount: number, userId: string): boolean {
    if (amount > this.senseAvailable) return false;
    this.senseUsers.set(userId, (this.senseUsers.get(userId) ?? 0) + amount);
    return true;
  }

  releaseSense(userId: string): void {
    this.senseUsers.delete(userId);
  }

  applyDamage(amount: number, kind: PlayerDamageKind): boolean {
    if (this.dead) return false;
    if (this.invulnRemaining > 0 && !INVULN_BYPASS.has(kind)) return false;
    this.health = Math.max(0, this.health - amount);
    if (!INVULN_BYPASS.has(kind)) this.invulnRemaining = INVULN_SECONDS;
    if (this.health === 0) {
      this.dead = true;
      this.onDeath?.();
    }
    return true;
  }

  heal(amount: number): void {
    if (this.dead) return;
    this.health = Math.min(this.config.maxHealth, this.health + amount);
  }
}
