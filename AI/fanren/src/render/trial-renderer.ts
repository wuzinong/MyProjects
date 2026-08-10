/**
 * 战斗渲染器：Pixi 场景、摄像机跟随、程序化地面、弹道/拖尾、环绕飞剑、
 * 伤害飘字、击杀粒子、血条、屏幕震动、画质预算与上下文丢失处理。
 * 表现参照 legacy/GameCanvas + spriteRenderer。
 */
import {
  Application, Assets, Container, Graphics, Sprite, Text, TextStyle, Texture, TilingSprite,
} from 'pixi.js';
import type { TrialRun } from '@/sim/trial/run';
import type { FxEvent } from '@/sim/combat/fx';
import { assetUrl, hasAsset } from '@/assets/manifest';
import { VISUAL_BUDGETS, effectivePixelRatio, type Quality } from '@/render/quality';
import { ELEMENT_COLORS } from '@/render/colors';
import { sound } from '@/render/sound';

interface VisualProjectile {
  gfx: Graphics;
  x: number; y: number;
  vx: number; vy: number;
  life: number;
  color: number;
  wavePhase: number;
  waveAmp: number;
}

interface Particle {
  gfx: Graphics;
  x: number; y: number;
  vx: number; vy: number;
  life: number;
  maxLife: number;
}

interface FloatingText {
  node: Text;
  vy: number;
  life: number;
}

const DAMAGE_STYLE = new TextStyle({
  fontFamily: 'system-ui, Microsoft YaHei, sans-serif',
  fontSize: 18, fontWeight: 'bold', fill: 0xffe9a0,
  stroke: { color: 0x201505, width: 3 },
});
const CRIT_STYLE = new TextStyle({
  fontFamily: 'system-ui, Microsoft YaHei, sans-serif',
  fontSize: 26, fontWeight: 'bold', fill: 0xff5533,
  stroke: { color: 0x2a0a05, width: 4 },
});

export class TrialRenderer {
  readonly app = new Application();
  private world = new Container();
  private groundLayer = new Container();
  private ground: TilingSprite | null = null;
  private fogOverlay = new Graphics();
  private ultimateOverlay = new Graphics();
  private enemySprites = new Map<number, Container>();
  private enemyHpBars = new Map<number, Graphics>();
  private containerPool: Container[] = [];
  private playerSprite: Sprite | null = null;
  private playerAura = new Graphics();
  private orbitSwords: Graphics[] = [];
  private orbitAngle = 0;
  private telegraphGfx = new Graphics();
  private projectiles: VisualProjectile[] = [];
  private projectilePool: Graphics[] = [];
  private particles: Particle[] = [];
  private particlePool: Graphics[] = [];
  private floatingTexts: FloatingText[] = [];
  private textures = new Map<string, Texture>();
  private quality: Quality = 'medium';
  private initialized = false;
  private shakeRemaining = 0;
  private shakeIntensity = 0;
  private ultimateFlash = 0;
  private lastPickupSound = 0;
  screenShakeEnabled = true;
  floatingTextEnabled = true;
  onContextLost: (() => void) | null = null;
  onContextRestored: (() => void) | null = null;

  async init(host: HTMLElement, quality: Quality): Promise<void> {
    this.quality = quality;
    await this.app.init({
      background: '#0d1410',
      resizeTo: host,
      resolution: effectivePixelRatio(window.devicePixelRatio || 1, quality),
      autoDensity: true,
      antialias: false,
    });
    host.appendChild(this.app.canvas);
    this.app.stage.addChild(this.world);
    this.world.addChild(this.groundLayer);
    this.world.addChild(this.telegraphGfx);
    this.app.stage.addChild(this.fogOverlay);
    this.app.stage.addChild(this.ultimateOverlay);
    const canvas = this.app.canvas;
    canvas.addEventListener('webglcontextlost', (e) => {
      e.preventDefault();
      this.onContextLost?.();
    });
    canvas.addEventListener('webglcontextrestored', () => {
      this.onContextRestored?.();
    });
    this.initialized = true;
  }

  setQuality(quality: Quality): void {
    this.quality = quality;
    this.app.renderer.resolution = effectivePixelRatio(window.devicePixelRatio || 1, quality);
  }

  async loadTexture(logicalId: string): Promise<Texture> {
    const cached = this.textures.get(logicalId);
    if (cached) return cached;
    const texture = hasAsset(logicalId)
      ? await Assets.load<Texture>(assetUrl(logicalId))
      : Texture.WHITE;
    this.textures.set(logicalId, texture);
    return texture;
  }

  /** 程序化地面：暗色苔原网格 + 灵脉点缀（参照 legacy 120px tile grid）。 */
  private buildGround(worldSize: number): void {
    const tile = new Graphics();
    const size = 120;
    tile.rect(0, 0, size, size).fill(0x111a13);
    tile.rect(0, 0, size, 1).fill(0x1b2a1d);
    tile.rect(0, 0, 1, size).fill(0x1b2a1d);
    tile.circle(size * 0.3, size * 0.7, 2).fill(0x1f3322);
    tile.circle(size * 0.75, size * 0.25, 1.5).fill(0x203726);
    const texture = this.app.renderer.generateTexture(tile);
    tile.destroy();
    this.ground = new TilingSprite({ texture, width: worldSize + 1200, height: worldSize + 1200 });
    this.ground.x = -600;
    this.ground.y = -600;
    this.groundLayer.addChild(this.ground);
  }

  /** 世界装饰：环境素材点缀（古松、灵石、断柱等）。 */
  private async buildDecorations(worldSize: number, seedish: number): Promise<void> {
    const decoIds = [
      'env-ancient-pine', 'env-spirit-stone-vein', 'env-broken-pillar-a',
      'env-demon-bamboo', 'env-rocky-peaks', 'env-corrupt-bamboo',
    ].filter((id) => hasAsset(id));
    let n = seedish >>> 0;
    const next = () => {
      n = (n * 1664525 + 1013904223) >>> 0;
      return n / 4294967296;
    };
    for (let i = 0; i < 14 && decoIds.length > 0; i++) {
      const id = decoIds[Math.floor(next() * decoIds.length)] as string;
      const texture = await this.loadTexture(id);
      const sprite = new Sprite(texture);
      sprite.anchor.set(0.5, 0.85);
      const scale = 0.35 + next() * 0.3;
      sprite.scale.set(scale);
      sprite.alpha = 0.85;
      sprite.x = next() * worldSize;
      sprite.y = next() * worldSize;
      this.groundLayer.addChild(sprite);
    }
  }

  async prepare(run: TrialRun): Promise<void> {
    this.buildGround(run.config.worldSize);
    await this.buildDecorations(run.config.worldSize, run.seed);
    const heroTexture = await this.loadTexture('hero-hanli');
    this.world.addChild(this.playerAura);
    this.playerSprite = new Sprite(heroTexture);
    this.playerSprite.anchor.set(0.5, 0.6);
    this.playerSprite.width = 84;
    this.playerSprite.height = 84;
    this.world.addChild(this.playerSprite);
    const ids = new Set(run.config.enemies.map((e) => e.assetId));
    await Promise.all([...ids].map((id) => this.loadTexture(id)));
  }

  /** 更新环绕飞剑数量（视觉上限 12 口，legacy 同样限制视觉数量）。 */
  private setOrbitSwordCount(count: number): void {
    const visualCount = Math.min(12, count);
    while (this.orbitSwords.length < visualCount) {
      const sword = new Graphics();
      sword.moveTo(0, -14).lineTo(4, 6).lineTo(0, 10).lineTo(-4, 6).closePath()
        .fill(0xbfffc8).stroke({ color: 0x2a8f4a, width: 1 });
      this.world.addChild(sword);
      this.orbitSwords.push(sword);
    }
    while (this.orbitSwords.length > visualCount) {
      const sword = this.orbitSwords.pop();
      sword?.destroy();
    }
  }

  private acquireContainer(): Container {
    return this.containerPool.pop() ?? new Container();
  }

  private releaseContainer(node: Container): void {
    node.visible = false;
    node.removeChildren();
    if (node.parent) node.parent.removeChild(node);
    this.containerPool.push(node);
  }

  private spawnEnemyVisual(run: TrialRun, enemyId: number): Container | undefined {
    const enemy = run.enemies.find((e) => e.id === enemyId);
    if (!enemy) return undefined;
    const node = this.acquireContainer();
    node.visible = true;
    const texture = this.textures.get(enemy.config.assetId) ?? Texture.WHITE;
    const sprite = new Sprite(texture);
    sprite.anchor.set(0.5);
    const size = enemy.config.tags.includes('boss') ? 220 : enemy.config.elite ? 120 : 60;
    sprite.width = size;
    sprite.height = size;
    node.addChild(sprite);
    if (enemy.config.elite || enemy.config.tags.includes('boss')) {
      const bar = new Graphics();
      bar.y = -size / 2 - 12;
      node.addChild(bar);
      this.enemyHpBars.set(enemyId, bar);
    }
    this.world.addChild(node);
    this.enemySprites.set(enemyId, node);
    return node;
  }

  private handleFx(events: FxEvent[]): void {
    const budget = VISUAL_BUDGETS[this.quality];
    for (const fx of events) {
      switch (fx.kind) {
        case 'projectile': {
          if (this.projectiles.length > budget.maxParticles / 4) break;
          const dx = fx.toX - fx.fromX;
          const dy = fx.toY - fx.fromY;
          const dist = Math.max(1, Math.hypot(dx, dy));
          const color = ELEMENT_COLORS[fx.element];
          const gfx = this.projectilePool.pop() ?? new Graphics();
          gfx.clear();
          gfx.circle(0, 0, 6).fill(color).circle(0, 0, 10).stroke({ color, width: 1, alpha: 0.5 });
          gfx.visible = true;
          this.world.addChild(gfx);
          const wavy = fx.element === 'water' || fx.element === 'wood' || fx.element === 'wind';
          this.projectiles.push({
            gfx, x: fx.fromX, y: fx.fromY,
            vx: (dx / dist) * fx.speed, vy: (dy / dist) * fx.speed,
            life: dist / fx.speed, color,
            wavePhase: Math.random() * Math.PI * 2,
            waveAmp: wavy ? 14 : 0,
          });
          if (fx.element === 'fire') sound.play('fireball');
          else if (fx.element === 'lightning') sound.play('sword');
          break;
        }
        case 'hit': {
          this.spawnParticles(fx.x, fx.y, ELEMENT_COLORS[fx.element], 4);
          if (this.floatingTextEnabled && this.floatingTexts.length < budget.maxFloatingTexts) {
            const node = new Text({
              text: fx.crit ? `暴击 ${fx.amount}` : `${fx.amount}`,
              style: fx.crit ? CRIT_STYLE : DAMAGE_STYLE,
            });
            node.anchor.set(0.5);
            node.x = fx.x + (Math.random() - 0.5) * 24;
            node.y = fx.y - 30;
            this.world.addChild(node);
            this.floatingTexts.push({ node, vy: -55, life: 0.8 });
          }
          break;
        }
        case 'kill':
          this.spawnParticles(fx.x, fx.y, ELEMENT_COLORS[fx.element], fx.elite ? 24 : 8);
          if (fx.elite) this.shake(6, 0.35);
          break;
        case 'aoe': {
          const gfx = this.projectilePool.pop() ?? new Graphics();
          gfx.clear();
          gfx.circle(0, 0, fx.radius).stroke({ color: ELEMENT_COLORS[fx.element], width: 4, alpha: 0.8 });
          gfx.visible = true;
          gfx.x = fx.x;
          gfx.y = fx.y;
          this.world.addChild(gfx);
          this.projectiles.push({ gfx, x: fx.x, y: fx.y, vx: 0, vy: 0, life: 0.35, color: 0, wavePhase: 0, waveAmp: -1 });
          break;
        }
        case 'ultimate-start':
          this.ultimateFlash = 1;
          this.shake(10, 0.6);
          sound.play('ultimate');
          break;
        case 'player-hurt':
          this.shake(4, 0.25);
          sound.play('hurt');
          break;
        case 'pickup': {
          const now = performance.now();
          if (now - this.lastPickupSound > 150) {
            this.lastPickupSound = now;
            sound.play('pickup');
          }
          break;
        }
        case 'boss-spawn':
          this.shake(12, 1);
          sound.play('thunder');
          break;
        case 'talisman':
          this.shake(14, 0.8);
          sound.play('talisman');
          this.spawnParticles(fx.x, fx.y, 0xffd700, 40);
          break;
      }
    }
  }

  private spawnParticles(x: number, y: number, color: number, count: number): void {
    const budget = VISUAL_BUDGETS[this.quality];
    for (let i = 0; i < count; i++) {
      if (this.particles.length >= budget.maxParticles) return;
      const gfx = this.particlePool.pop() ?? new Graphics();
      gfx.clear();
      gfx.circle(0, 0, 2 + Math.random() * 3).fill(color);
      gfx.visible = true;
      this.world.addChild(gfx);
      const angle = Math.random() * Math.PI * 2;
      const speed = 40 + Math.random() * 140;
      const life = 0.3 + Math.random() * 0.4;
      this.particles.push({
        gfx, x, y,
        vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
        life, maxLife: life,
      });
    }
  }

  private shake(intensity: number, duration: number): void {
    if (!this.screenShakeEnabled) return;
    this.shakeIntensity = Math.max(this.shakeIntensity, intensity);
    this.shakeRemaining = Math.max(this.shakeRemaining, duration);
  }

  /** 每帧同步模拟状态到显示层（只读模拟）。dt 为真实帧秒。 */
  sync(run: TrialRun, dt: number, orbitSwordCount = 0): void {
    if (!this.initialized || !this.playerSprite) return;
    const budget = VISUAL_BUDGETS[this.quality];
    const screenW = this.app.renderer.width / this.app.renderer.resolution;
    const screenH = this.app.renderer.height / this.app.renderer.resolution;

    this.handleFx(run.fx.drain());

    // 摄像机 + 屏幕震动
    let shakeX = 0;
    let shakeY = 0;
    if (this.shakeRemaining > 0) {
      this.shakeRemaining -= dt;
      const f = this.shakeIntensity * Math.max(0, this.shakeRemaining);
      shakeX = (Math.random() - 0.5) * f * 2;
      shakeY = (Math.random() - 0.5) * f * 2;
      if (this.shakeRemaining <= 0) this.shakeIntensity = 0;
    }
    this.world.x = screenW / 2 - run.player.x + shakeX;
    this.world.y = screenH / 2 - run.player.y + shakeY;
    this.playerSprite.x = run.player.x;
    this.playerSprite.y = run.player.y;

    // 玩家灵气光环
    this.playerAura.clear();
    this.playerAura
      .circle(run.player.x, run.player.y + 18, 30)
      .fill({ color: 0x3fbf6f, alpha: 0.18 })
      .circle(run.player.x, run.player.y + 18, 30)
      .stroke({ color: 0x6fe89f, width: 1.5, alpha: 0.5 });

    // 环绕飞剑
    this.setOrbitSwordCount(orbitSwordCount);
    if (this.orbitSwords.length > 0) {
      this.orbitAngle += dt * 2.4;
      const radius = 70 + Math.min(60, orbitSwordCount * 2);
      for (let i = 0; i < this.orbitSwords.length; i++) {
        const sword = this.orbitSwords[i] as Graphics;
        const angle = this.orbitAngle + (i / this.orbitSwords.length) * Math.PI * 2;
        sword.x = run.player.x + Math.cos(angle) * radius;
        sword.y = run.player.y + Math.sin(angle) * radius;
        sword.rotation = angle + Math.PI / 2;
      }
    }

    // 敌人精灵（视锥剔除 + 池化）
    let visible = 0;
    const seen = new Set<number>();
    for (const enemy of run.enemies) {
      if (!enemy.alive) continue;
      const dx = enemy.x - run.player.x;
      const dy = enemy.y - run.player.y;
      if (Math.abs(dx) > screenW / 2 + 120 || Math.abs(dy) > screenH / 2 + 120) continue;
      if (visible >= budget.maxVisibleSprites) break;
      visible++;
      seen.add(enemy.id);
      let node = this.enemySprites.get(enemy.id);
      if (!node) node = this.spawnEnemyVisual(run, enemy.id);
      if (!node) continue;
      node.x = enemy.x;
      node.y = enemy.y;
      const bar = this.enemyHpBars.get(enemy.id);
      if (bar) {
        const w = enemy.config.tags.includes('boss') ? 180 : 90;
        const frac = Math.max(0, enemy.health / enemy.config.maxHealth);
        bar.clear();
        bar.rect(-w / 2, 0, w, 6).fill(0x33121a);
        bar.rect(-w / 2, 0, w * frac, 6).fill(enemy.config.tags.includes('boss') ? 0xff3344 : 0xffaa33);
      }
    }
    for (const [id, node] of this.enemySprites) {
      if (!seen.has(id)) {
        this.releaseContainer(node);
        this.enemySprites.delete(id);
        this.enemyHpBars.delete(id);
      }
    }

    // 弹道（waveAmp = -1 表示 AoE 圈，只做淡出）
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const proj = this.projectiles[i] as VisualProjectile;
      proj.life -= dt;
      if (proj.life <= 0) {
        proj.gfx.visible = false;
        if (proj.gfx.parent) proj.gfx.parent.removeChild(proj.gfx);
        this.projectilePool.push(proj.gfx);
        this.projectiles[i] = this.projectiles[this.projectiles.length - 1] as VisualProjectile;
        this.projectiles.pop();
        continue;
      }
      if (proj.waveAmp < 0) {
        proj.gfx.alpha = proj.life / 0.35;
        continue;
      }
      proj.x += proj.vx * dt;
      proj.y += proj.vy * dt;
      proj.wavePhase += dt * 12;
      const perp = proj.waveAmp * Math.sin(proj.wavePhase);
      const len = Math.max(1, Math.hypot(proj.vx, proj.vy));
      proj.gfx.x = proj.x + (-proj.vy / len) * perp;
      proj.gfx.y = proj.y + (proj.vx / len) * perp;
      if (this.quality !== 'low' && Math.random() < 0.5) {
        this.spawnParticles(proj.gfx.x, proj.gfx.y, proj.color, 1);
      }
    }

    // 粒子
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const particle = this.particles[i] as Particle;
      particle.life -= dt;
      if (particle.life <= 0) {
        particle.gfx.visible = false;
        if (particle.gfx.parent) particle.gfx.parent.removeChild(particle.gfx);
        this.particlePool.push(particle.gfx);
        this.particles[i] = this.particles[this.particles.length - 1] as Particle;
        this.particles.pop();
        continue;
      }
      particle.x += particle.vx * dt;
      particle.y += particle.vy * dt;
      particle.gfx.x = particle.x;
      particle.gfx.y = particle.y;
      particle.gfx.alpha = particle.life / particle.maxLife;
    }

    // 飘字
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i] as FloatingText;
      ft.life -= dt;
      if (ft.life <= 0) {
        ft.node.destroy();
        this.floatingTexts[i] = this.floatingTexts[this.floatingTexts.length - 1] as FloatingText;
        this.floatingTexts.pop();
        continue;
      }
      ft.node.y += ft.vy * dt;
      ft.node.alpha = Math.min(1, ft.life / 0.4);
    }

    // 首领预警圈（呼吸闪烁）
    this.telegraphGfx.clear();
    const pulse = 0.18 + 0.12 * Math.sin(performance.now() / 120);
    for (const t of run.telegraphs) {
      this.telegraphGfx.circle(t.x, t.y, t.range).fill({ color: 0xcc2222, alpha: pulse });
      this.telegraphGfx.circle(t.x, t.y, t.range).stroke({ color: 0xff5544, width: 3, alpha: 0.9 });
    }

    // 毒雾安全区
    this.fogOverlay.clear();
    const fogCx = run.config.worldSize / 2 + this.world.x;
    const fogCy = run.config.worldSize / 2 + this.world.y;
    this.fogOverlay
      .circle(fogCx, fogCy, run.safeRadius)
      .stroke({ color: 0x66ff66, width: 3, alpha: 0.55 });
    const pdx = run.player.x - run.config.worldSize / 2;
    const pdy = run.player.y - run.config.worldSize / 2;
    if (pdx * pdx + pdy * pdy > run.safeRadius * run.safeRadius) {
      this.fogOverlay.rect(0, 0, screenW, screenH).fill({ color: 0x2c7a3a, alpha: 0.22 });
    }

    // 大庚剑阵全屏金光
    this.ultimateOverlay.clear();
    if (this.ultimateFlash > 0) {
      this.ultimateFlash = Math.max(0, this.ultimateFlash - dt * 1.2);
      this.ultimateOverlay.rect(0, 0, screenW, screenH).fill({ color: 0xffd700, alpha: this.ultimateFlash * 0.28 });
    }
  }

  destroy(): void {
    if (!this.initialized) return;
    this.app.destroy(true, { children: true, texture: false });
    this.initialized = false;
  }
}
