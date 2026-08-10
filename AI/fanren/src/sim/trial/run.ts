/**
 * 血色禁地整局模拟：确定性时间线、刷怪、毒雾、精英掉落、首领与结算。
 * 纯 TypeScript，可加速运行用于集成测试。
 */
import { SIM_DT } from '@/sim/core/clock';
import { SeededRng } from '@/sim/core/rng';
import { PlayerState, type PlayerConfig } from '@/sim/combat/player';
import { StatusTracker } from '@/sim/combat/status';
import { LootField } from '@/sim/combat/loot';
import { FxQueue } from '@/sim/combat/fx';
import type { EnemyConfig, TrialConfig } from '@/content/trial';

export interface EnemyInstance {
  id: number;
  config: EnemyConfig;
  x: number;
  y: number;
  health: number;
  alive: boolean;
  status: StatusTracker;
  attackCooldown: number;
  get tags(): string[];
}

export interface Telegraph {
  kind: 'poison-breath' | 'tail-sweep';
  x: number;
  y: number;
  range: number;
  remainingSeconds: number;
}

export type RunPhase = 'running' | 'boss' | 'victory' | 'defeat';

export interface RunResult {
  runId: string;
  outcome: 'victory' | 'defeat';
  survivedSeconds: number;
  kills: number;
  level: number;
  rewards: Record<string, number>;
}

export interface TrialEvents {
  onLevelUp?: (level: number) => void;
  onPhaseChange?: (phaseId: string) => void;
  onFogStep?: (safeRadius: number) => void;
  onBossSpawn?: () => void;
  onTelegraph?: (telegraph: Telegraph) => void;
  onResult?: (result: RunResult) => void;
}

const XP_BASE = 10;
const XP_GROWTH = 1.35;
const PICKUP_RADIUS = 60;

export class TrialRun {
  readonly player: PlayerState;
  readonly loot = new LootField();
  readonly fx = new FxQueue();
  readonly enemies: EnemyInstance[] = [];
  elapsedSeconds = 0;
  phase: RunPhase = 'running';
  level = 1;
  experience = 0;
  kills = 0;
  spiritStones = 0;
  safeRadius: number;
  pendingLevelUps = 0;
  talismans: string[] = [];
  boss: EnemyInstance | null = null;
  telegraphs: Telegraph[] = [];
  result: RunResult | null = null;

  private rng: SeededRng;
  private spawnAccumulator = 0;
  private fogTickAccumulator = 0;
  private currentPhaseId = '';
  private nextEnemyId = 1;
  private fogStepIndex = 0;
  private bossBreathCooldown = 0;
  private bossSweepCooldown = 0;
  private resultEmitted = false;

  constructor(
    readonly config: TrialConfig,
    readonly seed: number,
    playerOverrides: Partial<PlayerConfig> = {},
    private readonly events: TrialEvents = {},
  ) {
    this.rng = new SeededRng(seed);
    this.safeRadius = config.worldSize / 2;
    this.player = new PlayerState({
      maxHealth: 100,
      maxMana: 60,
      manaRegenPerSecond: 6,
      maxSpiritualSense: 10,
      moveSpeed: 140,
      worldSize: config.worldSize,
      ...playerOverrides,
    });
    this.player.onDeath = () => this.finish('defeat');
  }

  get runId(): string {
    return `${this.config.id}-${this.seed}`;
  }

  xpForLevel(level: number): number {
    return Math.floor(XP_BASE * Math.pow(XP_GROWTH, level - 1));
  }

  /** 推进一个 60Hz 固定步。 */
  step(): void {
    if (this.phase === 'victory' || this.phase === 'defeat') return;
    this.elapsedSeconds += SIM_DT;
    this.player.step(SIM_DT);
    this.updatePhaseSpawns();
    this.updateFog();
    this.updateEnemies();
    this.updateBoss();
    this.collectLoot();
    if (this.phase === 'running' && this.elapsedSeconds >= this.config.boss.spawnAtSeconds) {
      this.spawnBoss();
    }
  }

  /** 测试辅助：一次推进 N 秒。 */
  advanceSeconds(seconds: number): void {
    const steps = Math.round(seconds / SIM_DT);
    for (let i = 0; i < steps; i++) this.step();
  }

  private updatePhaseSpawns(): void {
    if (this.phase !== 'running') return;
    const phase = this.config.phases.find(
      (p) => this.elapsedSeconds >= p.startSeconds && this.elapsedSeconds < p.endSeconds,
    );
    if (!phase) return;
    if (phase.id !== this.currentPhaseId) {
      this.currentPhaseId = phase.id;
      this.events.onPhaseChange?.(phase.id);
    }
    const aliveCount = this.enemies.filter((e) => e.alive).length;
    if (aliveCount >= phase.maxAlive) return;
    this.spawnAccumulator += phase.spawnsPerSecond * SIM_DT;
    while (this.spawnAccumulator >= 1) {
      this.spawnAccumulator -= 1;
      const enemyId = this.rng.pick(phase.enemyIds);
      const config = this.config.enemies.find((e) => e.id === enemyId);
      if (config) this.spawnEnemy(config);
    }
  }

  private spawnEnemy(config: EnemyConfig): EnemyInstance {
    const angle = this.rng.float(0, Math.PI * 2);
    const dist = this.rng.float(400, this.config.worldSize / 2);
    const cx = this.config.worldSize / 2;
    const enemy: EnemyInstance = {
      id: this.nextEnemyId++,
      config,
      x: Math.min(this.config.worldSize, Math.max(0, cx + Math.cos(angle) * dist)),
      y: Math.min(this.config.worldSize, Math.max(0, cx + Math.sin(angle) * dist)),
      health: config.maxHealth,
      alive: true,
      status: new StatusTracker(config.tags.includes('boss') ? ['paralyze'] : []),
      attackCooldown: 0,
      get tags() {
        return this.config.tags;
      },
    };
    this.enemies.push(enemy);
    return enemy;
  }

  private updateFog(): void {
    const nextStep = this.config.fogSteps[this.fogStepIndex];
    if (nextStep && this.elapsedSeconds >= nextStep.atSeconds) {
      this.safeRadius = (this.config.worldSize / 2) * nextStep.safeRadiusFraction;
      this.fogStepIndex++;
      this.events.onFogStep?.(this.safeRadius);
    }
    const cx = this.config.worldSize / 2;
    const dx = this.player.x - cx;
    const dy = this.player.y - cy(this.config.worldSize);
    const outside = dx * dx + dy * dy > this.safeRadius * this.safeRadius;
    if (!outside) {
      this.fogTickAccumulator = 0;
      return;
    }
    this.fogTickAccumulator += SIM_DT;
    if (this.fogTickAccumulator >= this.config.fogTickSeconds) {
      this.fogTickAccumulator -= this.config.fogTickSeconds;
      this.player.applyDamage(this.config.fogDamagePerTick, 'fog');
    }
  }

  private updateEnemies(): void {
    for (const enemy of this.enemies) {
      if (!enemy.alive) continue;
      enemy.status.step(SIM_DT);
      const speed = enemy.config.moveSpeed * enemy.status.speedMultiplier;
      const dx = this.player.x - enemy.x;
      const dy = this.player.y - enemy.y;
      const dist = Math.hypot(dx, dy);
      if (dist > 1) {
        enemy.x += (dx / dist) * speed * SIM_DT;
        enemy.y += (dy / dist) * speed * SIM_DT;
      }
      enemy.attackCooldown = Math.max(0, enemy.attackCooldown - SIM_DT);
      if (dist < 24 && enemy.attackCooldown === 0) {
        if (this.player.applyDamage(enemy.config.contactDamage, 'contact')) {
          this.fx.push({ kind: 'player-hurt', amount: enemy.config.contactDamage });
        }
        enemy.attackCooldown = 1;
      }
    }
  }

  /** 对敌人造成伤害（由技能系统调用）；返回是否击杀。 */
  damageEnemy(enemy: EnemyInstance, amount: number): boolean {
    if (!enemy.alive) return false;
    const remaining = enemy.status.absorbDamage(amount);
    enemy.health -= remaining;
    if (enemy.health <= 0) {
      enemy.alive = false;
      this.kills++;
      this.loot.dropExperience(enemy.x, enemy.y, enemy.config.experience);
      // 灵石掉落（参照 legacy：普通怪概率掉落，精英/首领大额）
      if (enemy.config.tags.includes('boss')) this.spiritStones += 500;
      else if (enemy.config.elite) this.spiritStones += 50;
      else if (this.rng.chance(0.35)) this.spiritStones += this.rng.int(1, 3);
      if (enemy.config.dropsTreasureBox) {
        this.loot.dropItem(enemy.x, enemy.y, 'talisman-golden-brick');
      }
      this.fx.push({
        kind: 'kill', x: enemy.x, y: enemy.y,
        element: enemy.config.element, elite: enemy.config.elite || enemy.config.tags.includes('boss'),
      });
      if (enemy === this.boss) this.finish('victory');
      return true;
    }
    return false;
  }

  private collectLoot(): void {
    this.loot.collect(this.player.x, this.player.y, PICKUP_RADIUS, {
      onExperience: (amount) => {
        this.gainExperience(amount);
        this.fx.push({ kind: 'pickup', x: this.player.x, y: this.player.y, what: 'experience' });
      },
      onItem: (item) => {
        this.talismans.push(item);
        this.fx.push({ kind: 'pickup', x: this.player.x, y: this.player.y, what: 'item' });
      },
    });
  }

  gainExperience(amount: number): void {
    this.experience += amount;
    while (this.experience >= this.xpForLevel(this.level)) {
      this.experience -= this.xpForLevel(this.level);
      this.level++;
      this.pendingLevelUps++;
      this.events.onLevelUp?.(this.level);
    }
  }

  /** 使用符宝：全屏震波，一次性。 */
  useTalisman(index: number): boolean {
    const talisman = this.talismans[index];
    if (!talisman) return false;
    this.talismans.splice(index, 1);
    if (talisman === 'talisman-golden-brick') {
      for (const enemy of this.enemies) {
        if (enemy.alive && !enemy.config.tags.includes('boss')) {
          this.damageEnemy(enemy, 500);
        } else if (enemy.alive) {
          this.damageEnemy(enemy, 800);
        }
      }
    }
    return true;
  }

  private spawnBoss(): void {
    this.phase = 'boss';
    const config = this.config.enemies.find((e) => e.id === this.config.boss.enemyId);
    if (!config) throw new Error(`未知首领: ${this.config.boss.enemyId}`);
    this.boss = this.spawnEnemy(config);
    this.bossBreathCooldown = 3;
    this.bossSweepCooldown = 6;
    this.events.onBossSpawn?.();
  }

  private updateBoss(): void {
    if (!this.boss || !this.boss.alive) return;
    for (let i = this.telegraphs.length - 1; i >= 0; i--) {
      const t = this.telegraphs[i] as Telegraph;
      t.remainingSeconds -= SIM_DT;
      if (t.remainingSeconds <= 0) {
        this.resolveTelegraph(t);
        this.telegraphs.splice(i, 1);
      }
    }
    this.bossBreathCooldown -= SIM_DT;
    this.bossSweepCooldown -= SIM_DT;
    const breath = this.config.boss.poisonBreath;
    const sweep = this.config.boss.tailSweep;
    if (this.bossBreathCooldown <= 0) {
      this.bossBreathCooldown = breath.cooldownSeconds;
      const t: Telegraph = {
        kind: 'poison-breath', x: this.boss.x, y: this.boss.y,
        range: breath.range, remainingSeconds: breath.telegraphSeconds,
      };
      this.telegraphs.push(t);
      this.events.onTelegraph?.(t);
    }
    if (this.bossSweepCooldown <= 0) {
      this.bossSweepCooldown = sweep.cooldownSeconds;
      const t: Telegraph = {
        kind: 'tail-sweep', x: this.boss.x, y: this.boss.y,
        range: sweep.range, remainingSeconds: sweep.telegraphSeconds,
      };
      this.telegraphs.push(t);
      this.events.onTelegraph?.(t);
    }
  }

  private resolveTelegraph(t: Telegraph): void {
    const dx = this.player.x - t.x;
    const dy = this.player.y - t.y;
    if (dx * dx + dy * dy > t.range * t.range) return; // 生效时不在范围内则不受伤
    if (t.kind === 'poison-breath') {
      this.player.applyDamage(this.config.boss.poisonBreath.damage, 'boss');
    } else {
      this.player.applyDamage(this.config.boss.tailSweep.damage, 'boss');
      // 破甲状态由玩家侧防御建模时应用；首版直接记录易伤
    }
  }

  private finish(outcome: 'victory' | 'defeat'): void {
    if (this.resultEmitted) return;
    this.resultEmitted = true;
    this.phase = outcome;
    const rewards: Record<string, number> = {};
    const fraction = outcome === 'victory' ? 1 : this.config.defeatRewardFraction;
    for (const [item, amount] of Object.entries(this.config.victoryRewards)) {
      const value = Math.floor(amount * fraction);
      if (value > 0) rewards[item] = value;
    }
    const stones = Math.floor(this.spiritStones * fraction);
    if (stones > 0) rewards['spirit-stone-low'] = (rewards['spirit-stone-low'] ?? 0) + stones;
    this.result = {
      runId: this.runId,
      outcome,
      survivedSeconds: this.elapsedSeconds,
      kills: this.kills,
      level: this.level,
      rewards,
    };
    this.events.onResult?.(this.result);
  }
}

function cy(worldSize: number): number {
  return worldSize / 2;
}
