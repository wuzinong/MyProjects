import React, { useRef, useEffect, useState } from 'react';
import { PlayerStats, EnemyEntity, ProjectileEntity, ParticleEntity, DropItem, MapZone, Spell, FlyingSword, Pet, GameItem, BossChestEntity, BossLootItem } from '../types/game';
import { BossChestModal } from '../components/BossChestModal';
import { ELEMENT_COUNTERS } from '../data/gameData';
import { sound } from './sound';
import { WeatherOverlay } from '../components/WeatherOverlay';
import { preloadGameAssets, drawPlayerSprite, drawMonsterSprite, drawPetSprite, drawDropItemSprite, drawAttackFx, getCachedImage } from './spriteRenderer';
import { getResourceImage } from '../utils/aiImageStore';
import { Play, Pause, Zap, Compass, Sparkles, Navigation } from 'lucide-react';
import { resolveAssetUrl } from '../utils/aiImageStore';
import { getElementsFromRoot, getMonsterElement, getDamageMultiplier } from '../utils/elementUtils';

interface GameCanvasProps {
  player: PlayerStats;
  spells: Spell[];
  flyingSwords: FlyingSword[];
  pets: Pet[];
  currentMap: MapZone;
  onUpdatePlayer: (updater: (prev: PlayerStats) => PlayerStats) => void;
  onEnemyKilled: (enemyName: string, exp: number, stones: number, cores: number) => void;
  onItemCollected: (item: GameItem) => void;
  onBossDefeated: (mapId: string) => void;
  onEncounterBuilding?: (building: { type: number, name: string }) => void;
  isModalOpen?: boolean;
}

export function getBuildingName(type: number): string {
  switch (type) {
    case 1: return '太一宗门仙宫';
    case 2: return '仙灵万年古松';
    case 3: return '玄青辟邪翠竹';
    case 4: return '庚金万丈仙山';
    case 5: return '灵霄九曲仙草';
    case 6: return '悬浮修仙灵岛';
    case 7: return '云雾深壑灵溪';
    case 8: return '乾坤镇魔神塔';
    default: return '辟邪雷光竹海';
  }
}

// Helper to draw Xianxia World Landscape Objects & Monuments using Real Image Assets
function drawWorldObject(ctx: CanvasRenderingContext2D, type: number, x: number, y: number, time: number, worldX: number, worldY: number) {
  ctx.save();
  ctx.translate(x, y);

  let imgUrl = '';
  let label = '';
  let radius = 38;
  let shadowColor = 'rgba(234, 179, 8, 0.4)';
  let floatOffset = 0;

  switch (type) {
    case 1:
      imgUrl = '/src/assets/images/xianxia_sect_art_1785140406211.jpg';
      label = '🏛️ 太一宗门仙宫';
      radius = 200;
      shadowColor = '#facc15';
      break;
    case 2:
      imgUrl = '/src/assets/images/xianling_gusong_1785397465154.jpg';
      label = '🌲 仙灵万年古松';
      radius = 100;
      shadowColor = '#10b981';
      break;
    case 3:
      imgUrl = '/src/assets/images/xuanqing_cuizhu_bamboo_1785403739205.jpg';
      label = '🎋 玄青辟邪翠竹';
      radius = 90;
      shadowColor = '#34d399';
      break;
    case 4:
      imgUrl = '/src/assets/images/jinji_shan_1785397522790.jpg';
      label = '⛰️ 庚金万丈仙山 (极品灵脉)';
      radius = 240;
      shadowColor = '#eab308';
      break;
    case 5:
      imgUrl = '/src/assets/images/jiuqu_ginseng_sprite_1785398296504.jpg';
      label = '🌸 灵霄九曲仙草';
      radius = 80;
      shadowColor = '#f472b6';
      break;
    case 6:
      imgUrl = '/src/assets/images/xuanfu_lingdao_map_1785398454777.jpg';
      label = '☁️ 悬浮修仙灵岛';
      radius = 180;
      shadowColor = '#a855f7';
      floatOffset = Math.sin(time / 450 + worldX) * 6;
      break;
    case 7:
      imgUrl = '/src/assets/images/wanyan_lingxi_1785397677330.jpg';
      label = '🌫️ 云雾深壑灵溪 (古老灵脉)';
      radius = 160;
      shadowColor = '#38bdf8';
      floatOffset = Math.cos(time / 550 + worldY) * 4;
      break;
    case 8:
      imgUrl = '/src/assets/images/qiankun_ta_1785397640338.jpg';
      label = '⛩️ 乾坤镇魔神塔';
      radius = 150;
      shadowColor = '#a78bfa';
      break;
    default:
      imgUrl = '/src/assets/images/xuanqing_cuizhu_bamboo_1785403739205.jpg';
      label = '🎋 辟邪雷光竹海';
      radius = 100;
      shadowColor = '#22c55e';
      break;
  }

  const objImg = getCachedImage(imgUrl);

  if (objImg) {
    ctx.save();
    ctx.translate(0, floatOffset);
    
    // Check if we already cached this specific type + image to avoid rebuilding
    const cacheKey = `${type}_${imgUrl}_${radius}`;
    if (!(window as any).__worldObjCache) (window as any).__worldObjCache = {};
    
    let offCanvas = (window as any).__worldObjCache[cacheKey];
    const size = radius * 4;
    
    if (!offCanvas && objImg.complete && objImg.naturalWidth > 0) {
      offCanvas = document.createElement('canvas');
      offCanvas.width = size;
      offCanvas.height = size;
      const octx = offCanvas.getContext('2d');
      
      if (octx) {
        octx.translate(size / 2, size / 2);
        
        // Draw the images onto the off-screen canvas
        if (type === 3 || type > 8) {
          const drawTree = (dx, dy, r) => {
             octx.drawImage(objImg, dx - r, dy - r, r * 2, r * 2);
          };
          drawTree(0, -radius * 0.3, radius * 0.8);
          drawTree(-radius * 0.6, radius * 0.2, radius * 0.7);
          drawTree(radius * 0.5, radius * 0.3, radius * 0.65);
        } else if (type === 2) {
          const drawPine = (dx, dy, r) => {
             octx.drawImage(objImg, dx - r, dy - r, r * 2, r * 2);
          };
          drawPine(-radius * 0.3, -radius * 0.1, radius * 0.9);
          drawPine(radius * 0.4, radius * 0.2, radius * 0.7);
        } else {
          octx.drawImage(objImg, -radius, -radius, radius * 2, radius * 2);
        }
        
        // Apply the radial gradient mask (fade out at edges)
        octx.globalCompositeOperation = 'destination-in';
        const gradient = octx.createRadialGradient(0, 0, radius * 0.4, 0, 0, radius);
        gradient.addColorStop(0, 'rgba(0, 0, 0, 1)');
        gradient.addColorStop(0.7, 'rgba(0, 0, 0, 0.8)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        octx.fillStyle = gradient;
        octx.beginPath();
        octx.arc(0, 0, radius * 1.5, 0, Math.PI * 2);
        octx.fill();
        
        (window as any).__worldObjCache[cacheKey] = offCanvas;
      }
    }
    
    if (offCanvas) {
      // Draw the masked result back to main canvas with glow
      ctx.shadowColor = shadowColor;
      
      let currentBlur = 20;
      let alpha = 1;
      let scale = 1;

      // Add breathing glow filter and double size for 灵脉 (type 4, 7)
      if (type === 4 || type === 7) {
        currentBlur = 30 + Math.sin(time / 300) * 20; // Breathing shadow
        alpha = 0.85 + Math.sin(time / 300) * 0.15; // Breathing alpha
        scale = 2.0; // Double the size
      }
      
      // We also need to scale the label position down since we scaled the canvas up
      const labelYOffset = -size / 2 * scale - 15;
      
      ctx.shadowBlur = currentBlur;
      ctx.globalAlpha = alpha;
      
      // Slightly mix screen to blend dark backgrounds better
      ctx.globalCompositeOperation = 'screen';
      
      if (scale !== 1) {
        ctx.scale(scale, scale);
      }
      
      ctx.drawImage(offCanvas, -size / 2, -size / 2);
      
      ctx.globalAlpha = 1; // restore alpha
      ctx.globalCompositeOperation = 'source-over'; // restore
    }
    
    ctx.restore();
  }

  // Determine scale for label offset
  let labelScale = 1;
  if (type === 4 || type === 7) labelScale = 2.0;

  // Label text above landscape object
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 11px sans-serif';
  ctx.textAlign = 'center';
  ctx.shadowColor = '#000000';
  ctx.shadowBlur = 6;
  ctx.fillText(label, 0, -radius * labelScale - 12 + floatOffset);

  ctx.restore();
}

// Helper to get Realm Strike Title based on player's realm
export function getRealmStrikeTitle(realmId: string): string {
  switch (realmId) {
    case 'REALM001': return '✨ 炼气游龙';
    case 'REALM002': return '🗡️ 筑基剑气';
    case 'REALM003': return '🔮 金丹法力';
    case 'REALM004': return '⚡ 元婴神威';
    case 'REALM005': return '🌌 化神一击!';
    case 'REALM006': return '✨ 炼虚归元!';
    case 'REALM007': return '🌟 天人合一!';
    case 'REALM008': return '💥 大乘至尊!';
    case 'REALM009': return '⚡ 渡劫仙威!';
    default: return '☀️ 仙帝降世!';
  }
}

// Helper to draw Boss Chest object with divine golden light beam
export function drawBossChestSprite(ctx: CanvasRenderingContext2D, chest: BossChestEntity, time: number) {
  ctx.save();
  ctx.translate(chest.x, chest.y);

  // 1. Divine Beam of Light Shooting into the Sky
  if (!chest.opened) {
    const beamWidth = 36 + Math.sin(time * 0.005) * 8;
    const gradient = ctx.createLinearGradient(0, 0, 0, -320);
    gradient.addColorStop(0, 'rgba(250, 204, 21, 0.85)');
    gradient.addColorStop(0.5, 'rgba(234, 179, 8, 0.35)');
    gradient.addColorStop(1, 'rgba(250, 204, 21, 0)');

    ctx.fillStyle = gradient;
    ctx.fillRect(-beamWidth / 2, -320, beamWidth, 320);

    ctx.strokeStyle = '#fde047';
    ctx.lineWidth = 2;
    ctx.shadowColor = '#facc15';
    ctx.shadowBlur = 15;
    ctx.strokeRect(-beamWidth / 2, -320, beamWidth, 320);
  }

  // 2. Chest Ground Shadow / Pulsing Light
  ctx.beginPath();
  ctx.ellipse(0, 10, 30, 12, 0, 0, Math.PI * 2);
  ctx.fillStyle = chest.opened ? 'rgba(120, 53, 15, 0.3)' : 'rgba(234, 179, 8, 0.5)';
  ctx.shadowColor = '#facc15';
  ctx.shadowBlur = chest.opened ? 5 : 20;
  ctx.fill();
  ctx.shadowBlur = 0;

  // 3. Ornate Chest Body
  const hoverY = Math.sin(time * 0.004) * 3;
  ctx.translate(0, hoverY);

  ctx.fillStyle = chest.opened ? '#92400e' : '#78350f';
  ctx.fillRect(-22, -14, 44, 26);
  ctx.strokeStyle = '#facc15';
  ctx.lineWidth = 2.5;
  ctx.strokeRect(-22, -14, 44, 26);

  // Golden Trim Details
  ctx.fillStyle = '#f59e0b';
  ctx.fillRect(-22, -6, 44, 4);

  // Lid
  if (chest.opened) {
    // Open Lid tilted
    ctx.fillRect(-24, -28, 48, 10);
    ctx.strokeStyle = '#fde047';
    ctx.strokeRect(-24, -28, 48, 10);

    // Overflowing golden rays
    ctx.fillStyle = 'rgba(254, 240, 138, 0.9)';
    ctx.beginPath();
    ctx.arc(0, -16, 8, 0, Math.PI * 2);
    ctx.shadowColor = '#facc15';
    ctx.shadowBlur = 20;
    ctx.fill();
    ctx.shadowBlur = 0;
  } else {
    // Closed Lid
    ctx.fillRect(-24, -22, 48, 10);
    ctx.strokeStyle = '#fde047';
    ctx.strokeRect(-24, -22, 48, 10);

    // Ruby Lock
    ctx.beginPath();
    ctx.arc(0, -2, 4.5, 0, Math.PI * 2);
    ctx.fillStyle = '#ef4444';
    ctx.fill();
  }

  // 4. Floating Title Banner
  ctx.font = 'bold 12px "PingFang SC", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#fef08a';
  ctx.strokeStyle = '#451a03';
  ctx.lineWidth = 3;

  const label = chest.opened ? '🎁 秘境仙宝箱 (已开启)' : '🎁 秘境仙宝箱 (点击 / 靠近开启)';
  ctx.strokeText(label, 0, -36);
  ctx.fillText(label, 0, -36);

  ctx.restore();
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  player,
  spells,
  flyingSwords,
  pets,
  currentMap,
  onUpdatePlayer,
  onEnemyKilled,
  onItemCollected,
  onBossDefeated,
  onEncounterBuilding,
  isModalOpen,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const bgRef = useRef<HTMLDivElement | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [isAutoBattle, setIsAutoBattle] = useState(true);
  const [bossSpawned, setBossSpawned] = useState(false);
  const [killCount, setKillCount] = useState(0);
  const [nearChest, setNearChest] = useState<BossChestEntity | null>(null);
  const [activeBossChestModal, setActiveBossChestModal] = useState<{ bossName: string; lootItems: BossLootItem[]; chestId?: string } | null>(null);

  // Helper to spawn floating combat text in state.particles
  const spawnCombatText = (
    x: number,
    y: number,
    text: string,
    color: string = '#ffffff',
    size: number = 16,
    options?: {
      isCombatText?: boolean;
      strokeColor?: string;
      glowColor?: string;
      vy?: number;
      vx?: number;
      life?: number;
    }
  ) => {
    gameStateRef.current.particles.push({
      id: `cbt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      x: x + (Math.random() - 0.5) * 16,
      y: y + (Math.random() - 0.5) * 10 - 10,
      vx: options?.vx ?? (Math.random() - 0.5) * 1.6,
      vy: options?.vy ?? (-1.8 - Math.random() * 0.8),
      size,
      color,
      life: options?.life ?? 0.9,
      maxLife: options?.life ?? 0.9,
      text,
      isCombatText: options?.isCombatText ?? true,
      strokeColor: options?.strokeColor ?? 'rgba(10, 15, 25, 0.95)',
      glowColor: options?.glowColor,
    });
  };

  // Entities state refs for smooth 60fps canvas loop
  
  const playerElements = React.useMemo(() => getElementsFromRoot(player.root), [player.root]);

  const gameStateRef = useRef({
    playerPos: { x: 2000, y: 2000 }, // Infinite world coordinates
    keys: { w: false, a: false, s: false, d: false },
    touchDir: { x: 0, y: 0 },
    enemies: [] as EnemyEntity[],
    projectiles: [] as ProjectileEntity[],
    particles: [] as ParticleEntity[],
    drops: [] as DropItem[],
    chests: [] as BossChestEntity[],
    lastSpawnTime: 0,
    lastAutoSpellTime: 0,
    lastSwordAttackTime: 0,
    lastGreenLiquidTime: 0,
    lastEncounterTime: 0,
    swordAngle: 0,
    petAngle: 0,
    spawnCount: 0,
  });

  const spawnGoldenExplosion = (x: number, y: number) => {
    sound.playLevelUp();

    for (let i = 0; i < 60; i++) {
      const angle = (i * Math.PI * 2) / 60 + Math.random() * 0.2;
      const speed = 3.5 + Math.random() * 7.5;
      gameStateRef.current.particles.push({
        id: `gold_exp_${Date.now()}_${i}`,
        x,
        y: y - 10,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.5,
        size: Math.random() * 8 + 6,
        color: i % 3 === 0 ? '#fde047' : i % 3 === 1 ? '#f59e0b' : '#ffffff',
        life: 1.6,
        maxLife: 1.6,
        glowColor: '#facc15',
        strokeColor: '#78350f',
      });
    }

    spawnCombatText(
      x,
      y - 45,
      '💥 开启宝箱！金光迸射 · 上古道韵爆发！',
      '#fef08a',
      24,
      { isCombatText: true, strokeColor: '#451a03', glowColor: '#fde047', vy: -2.5, life: 2.2 }
    );
  };

  // Helper function to spawn rich elemental particle bursts based on Water, Fire, Earth, Wood, etc.
  const spawnElementalHitParticles = (
    particles: ParticleEntity[],
    x: number,
    y: number,
    element: any = '火',
    countMult: number = 1.0
  ) => {
    const now = Date.now();

    if (element === '水') {
      // 水系 (Water) - Concentric Water Waves (水波波动) & Splashing Droplets
      for (let w = 0; w < 3; w++) {
        particles.push({
          id: `water_wave_${now}_${Math.random()}`,
          x,
          y,
          vx: 0,
          vy: 0,
          size: 6,
          radius: 8 + w * 12,
          maxRadius: 36 + w * 18,
          color: w % 2 === 0 ? '#38bdf8' : '#7dd3fc',
          strokeColor: '#0284c7',
          glowColor: '#bae6fd',
          life: 0.55 + w * 0.15,
          maxLife: 0.55 + w * 0.15,
          type: 'water_wave',
          element: '水',
        });
      }

      const dropCount = Math.round(10 * countMult);
      for (let i = 0; i < dropCount; i++) {
        const ang = (i * Math.PI * 2) / dropCount + (Math.random() - 0.5) * 0.4;
        const spd = 2.5 + Math.random() * 3.5;
        particles.push({
          id: `water_drop_${now}_${Math.random()}`,
          x: x + Math.cos(ang) * 6,
          y: y + Math.sin(ang) * 6,
          vx: Math.cos(ang) * spd,
          vy: Math.sin(ang) * spd,
          size: 4 + Math.random() * 4,
          color: Math.random() > 0.4 ? '#38bdf8' : '#e0f2fe',
          glowColor: '#bae6fd',
          life: 0.45 + Math.random() * 0.35,
          maxLife: 0.8,
          type: 'water_drop',
          element: '水',
          waveFreq: 12 + Math.random() * 6,
          waveAmp: 1.5 + Math.random() * 1.5,
        });
      }
    } else if (element === '火') {
      // 火系 (Fire) - Leaping Flames (火焰跳跃) & Buoyant Embers
      const flameCount = Math.round(14 * countMult);
      for (let i = 0; i < flameCount; i++) {
        const ang = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.4;
        const spd = 2.2 + Math.random() * 4.8;
        const colors = ['#ffffff', '#fef08a', '#f97316', '#ef4444', '#dc2626'];
        particles.push({
          id: `flame_leap_${now}_${Math.random()}`,
          x: x + (Math.random() - 0.5) * 12,
          y: y + (Math.random() - 0.5) * 12,
          vx: Math.cos(ang) * spd,
          vy: Math.sin(ang) * spd - 1.5,
          accelY: -0.16,
          size: 5 + Math.random() * 7,
          color: colors[Math.floor(Math.random() * colors.length)],
          glowColor: '#fef08a',
          life: 0.4 + Math.random() * 0.35,
          maxLife: 0.75,
          type: 'flame_leap',
          element: '火',
        });
      }

      for (let e = 0; e < 6; e++) {
        particles.push({
          id: `ember_${now}_${Math.random()}`,
          x: x + (Math.random() - 0.5) * 20,
          y: y + (Math.random() - 0.5) * 20,
          vx: (Math.random() - 0.5) * 2.0,
          vy: -1.5 - Math.random() * 2.2,
          size: 3 + Math.random() * 3,
          color: '#fb923c',
          glowColor: '#fdba74',
          life: 0.5 + Math.random() * 0.4,
          maxLife: 0.9,
          type: 'ember_flicker',
          element: '火',
        });
      }
    } else if (element === '土') {
      // 土系 (Earth) - Shattering Rocks (岩石迸裂) & Tumbling Stone Chunks
      const rockCount = Math.round(10 * countMult);
      for (let i = 0; i < rockCount; i++) {
        const ang = Math.random() * Math.PI * 2;
        const spd = 3.0 + Math.random() * 4.5;
        particles.push({
          id: `rock_shatter_${now}_${Math.random()}`,
          x: x + Math.cos(ang) * 6,
          y: y + Math.sin(ang) * 6,
          vx: Math.cos(ang) * spd,
          vy: Math.sin(ang) * spd - 0.8,
          accelY: +0.22,
          size: 6 + Math.random() * 8,
          color: '#f59e0b',
          strokeColor: '#78350f',
          glowColor: '#fef3c7',
          life: 0.45 + Math.random() * 0.3,
          maxLife: 0.75,
          angle: Math.random() * Math.PI * 2,
          omega: (Math.random() - 0.5) * 0.4,
          type: 'rock_shatter',
          element: '土',
        });
      }

      for (let d = 0; d < 6; d++) {
        particles.push({
          id: `stone_dust_${now}_${Math.random()}`,
          x: x + (Math.random() - 0.5) * 16,
          y: y + (Math.random() - 0.5) * 16,
          vx: (Math.random() - 0.5) * 1.5,
          vy: (Math.random() - 0.5) * 1.5,
          size: 10 + Math.random() * 10,
          color: 'rgba(217, 119, 6, 0.4)',
          life: 0.5 + Math.random() * 0.3,
          maxLife: 0.8,
          type: 'stone_chunk',
          element: '土',
        });
      }
    } else if (element === '木') {
      // 木系 (Wood) - Winding Vines (藤蔓缠绕) & Swirling Emerald Leaves
      const vineCount = Math.round(6 * countMult);
      for (let v = 0; v < vineCount; v++) {
        const startAng = (v * Math.PI * 2) / vineCount;
        particles.push({
          id: `vine_coil_${now}_${Math.random()}`,
          x,
          y,
          vx: 0,
          vy: 0,
          centerPos: { x, y },
          spiralRadius: 8 + Math.random() * 6,
          spiralAngle: startAng,
          size: 5 + Math.random() * 3,
          color: '#10b981',
          strokeColor: '#047857',
          glowColor: '#a7f3d0',
          life: 0.6 + Math.random() * 0.3,
          maxLife: 0.9,
          type: 'vine_coil',
          element: '木',
        });
      }

      const leafCount = Math.round(10 * countMult);
      for (let l = 0; l < leafCount; l++) {
        const ang = (l * Math.PI * 2) / leafCount;
        const spd = 2.0 + Math.random() * 3.5;
        particles.push({
          id: `leaf_swirl_${now}_${Math.random()}`,
          x: x + Math.cos(ang) * 8,
          y: y + Math.sin(ang) * 8,
          vx: Math.cos(ang) * spd,
          vy: Math.sin(ang) * spd,
          size: 6 + Math.random() * 5,
          color: l % 2 === 0 ? '#34d399' : '#6ee7b7',
          glowColor: '#a7f3d0',
          life: 0.5 + Math.random() * 0.3,
          maxLife: 0.8,
          angle: Math.random() * Math.PI * 2,
          omega: (Math.random() - 0.5) * 0.3,
          type: 'leaf_swirl',
          element: '木',
        });
      }
    } else if (element === '雷') {
      // 雷系 (Nine Heavens Purple Thunder)
      for (let i = 0; i < 10; i++) {
        const ang = Math.random() * Math.PI * 2;
        const spd = 4 + Math.random() * 4;
        particles.push({
          id: `thunder_spark_${now}_${Math.random()}`,
          x,
          y,
          vx: Math.cos(ang) * spd,
          vy: Math.sin(ang) * spd,
          size: 5 + Math.random() * 5,
          color: '#c084fc',
          glowColor: '#f3e8ff',
          life: 0.35 + Math.random() * 0.25,
          maxLife: 0.6,
          type: 'lightning_spark',
          element: '雷',
        });
      }
    } else {
      // 金 / 风 / Default Burst
      for (let i = 0; i < 8; i++) {
        const ang = Math.random() * Math.PI * 2;
        const spd = 3 + Math.random() * 4;
        particles.push({
          id: `gen_shard_${now}_${Math.random()}`,
          x,
          y,
          vx: Math.cos(ang) * spd,
          vy: Math.sin(ang) * spd,
          size: 5 + Math.random() * 4,
          color: element === '金' ? '#facc15' : '#2dd4bf',
          glowColor: '#ffffff',
          life: 0.35 + Math.random() * 0.25,
          maxLife: 0.6,
          type: 'sand',
          element: element,
        });
      }
    }
  };

  const handleOpenChest = (chest: BossChestEntity) => {
    if (chest.opened) return;
    chest.opened = true;
    spawnGoldenExplosion(chest.x, chest.y);
    setActiveBossChestModal({
      chestId: chest.id,
      bossName: chest.bossName,
      lootItems: chest.lootItems,
    });
  };

  // Touch Virtual Joystick
  const joystickTouchId = useRef<number | null>(null);
  const joystickBase = useRef<{ x: number | null, y: number | null }>({ x: null, y: null });

  // Key event listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (['w', 'a', 's', 'd', 'arrowup', 'arrowleft', 'arrowdown', 'arrowright'].includes(k)) {
        if (k === 'w' || k === 'arrowup') gameStateRef.current.keys.w = true;
        if (k === 'a' || k === 'arrowleft') gameStateRef.current.keys.a = true;
        if (k === 's' || k === 'arrowdown') gameStateRef.current.keys.s = true;
        if (k === 'd' || k === 'arrowright') gameStateRef.current.keys.d = true;
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === 'w' || k === 'arrowup') gameStateRef.current.keys.w = false;
      if (k === 'a' || k === 'arrowleft') gameStateRef.current.keys.a = false;
      if (k === 's' || k === 'arrowdown') gameStateRef.current.keys.s = false;
      if (k === 'd' || k === 'arrowright') gameStateRef.current.keys.d = false;
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Handle Fubao trigger effect
  useEffect(() => {
    if (player.selectedEffectFx === 'fubao_press_stamp' || player.selectedEffectFx === 'talisman_burst_ring') {
      sound.playThunder();
      const isFubao = player.selectedEffectFx === 'fubao_press_stamp';
      
      // Banner combat text above player
      const bannerText = isFubao ? '📜 符宝真威 · 镇压八荒!' : '⚡ 符箓通灵 · 破法强杀!';
      spawnCombatText(
        gameStateRef.current.playerPos.x,
        gameStateRef.current.playerPos.y - 65,
        bannerText,
        '#f59e0b',
        25,
        { isCombatText: true, strokeColor: '#451a03', glowColor: '#fde047', vy: -2.2, life: 1.4 }
      );
      
      // Damage all enemies on screen
      gameStateRef.current.enemies.forEach(enemy => {
        const rootMult = getDamageMultiplier(playerElements, enemy.element!);
        const fubaoDmg = player.atk * 10 * rootMult;
        enemy.hp -= fubaoDmg;
        
        // Floating combat text over each enemy
        spawnCombatText(
          enemy.x,
          enemy.y,
          `💥 符宝轰杀 -${Math.round(fubaoDmg)}`,
          '#f97316',
          22,
          { isCombatText: true, strokeColor: '#7c2d12', glowColor: '#fb923c', vy: -2.5, life: 1.2 }
        );
      });
    }
  }, [player.selectedEffectFx, player.atk]);
  // Main Canvas Loop
  useEffect(() => {
    preloadGameAssets();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const handleResize = () => {
      if (canvas.parentElement) {
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = canvas.parentElement.clientHeight;
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    // Spawn regular enemy wave relative to infinite player position
    const spawnEnemyWave = (now: number, canvasWidth: number, canvasHeight: number) => {
      const state = gameStateRef.current;
      const activeEnemies = state.enemies.length;
      const maxEnemies = 30 + Math.min(100, Math.floor(player.level * 2));

      if (activeEnemies < maxEnemies && now - state.lastSpawnTime > 700) {
        state.lastSpawnTime = now;
        state.spawnCount += 1;

        const isBossTime = state.spawnCount > 0 && state.spawnCount % 45 === 0 && !bossSpawned;

        const spawnAngle = Math.random() * Math.PI * 2;
        const spawnDist = Math.max(canvasWidth, canvasHeight) * 0.6 + 60;
        const spawnX = state.playerPos.x + Math.cos(spawnAngle) * spawnDist;
        const spawnY = state.playerPos.y + Math.sin(spawnAngle) * spawnDist;

        if (isBossTime) {
          setBossSpawned(true);
          let bossIcon = currentMap.bossIcon;
          if (!bossIcon) {
            if (currentMap.bossName.includes('墨大夫')) bossIcon = '/src/assets/images/enemy_mo_da_fu_1785143392441.jpg';
            else if (currentMap.bossName.includes('蜘蛛') || currentMap.bossName.includes('蛛')) bossIcon = '/src/assets/images/enemy_blood_spider_1785143409326.jpg';
            else if (currentMap.bossName.includes('墨蛟') || currentMap.bossName.includes('龙')) bossIcon = '/src/assets/images/ink_dragon_boss_1785138244397.jpg';
            else if (currentMap.bossName.includes('六道极圣')) bossIcon = '/src/assets/images/liudao_jisheng_boss_1785398436630.jpg';
            else bossIcon = '/src/assets/images/dajin_shihuang_1785397654328.jpg';
          }

          const scaledBossHp = currentMap.bossHp * 8;
          const scaledBossAtk = currentMap.bossAtk * 3.5;

          state.enemies.push({
            id: `boss_${Date.now()}`,
            name: currentMap.bossName,
            x: spawnX,
            y: spawnY,
            vx: 0,
            vy: 0,
            hp: scaledBossHp,
            maxHp: scaledBossHp,
            atk: scaledBossAtk,
            speed: 1.4,
            radius: 46,
            color: '#ef4444',
            isBoss: true,
            element: '血',
            icon: bossIcon,
            shield: Math.round(scaledBossHp * 0.25),
            maxShield: Math.round(scaledBossHp * 0.25),
            lastSkillTime: Date.now(),
            isRaged: false,
          });

          state.particles.push({
            id: `alert_${Date.now()}`,
            x: state.playerPos.x,
            y: state.playerPos.y - 60,
            vx: 0,
            vy: -0.5,
            size: 26,
            color: '#ef4444',
            life: 3,
            maxLife: 3,
            text: `⚠️ 绝世噩梦！上古巨魔【${currentMap.bossName}】携灭世威压降临！`,
          });
        } else {
          const mobTypeIndex = Math.floor(Math.random() * currentMap.monsterTypes.length);
          const mobName = currentMap.monsterTypes[mobTypeIndex] || '野生妖兽';

          let mobIcon: string | undefined = undefined;
          if (mobName.includes('人面')) mobIcon = '/src/assets/images/enemy_human_face_spider_1785143421439.jpg';
          else if (mobName.includes('蛛')) mobIcon = '/src/assets/images/enemy_blood_spider_1785143409326.jpg';
          else if (mobName.includes('蟾')) mobIcon = '/src/assets/images/enemy_fire_toad_1785143437074.jpg';
          else if (mobName.includes('蟒') || mobName.includes('蛇')) mobIcon = '/src/assets/images/enemy_silver_python_1785143449478.jpg';
          else if (mobName.includes('狼')) mobIcon = '/src/assets/images/enemy_two_headed_wolf_1785143462471.jpg';
          else if (mobName.includes('修') || mobName.includes('贼') || mobName.includes('魔') || mobName.includes('鬼')) mobIcon = '/src/assets/images/enemy_demon_hooded_1785143480424.jpg';

          state.enemies.push({
            id: `mob_${Date.now()}_${Math.random()}`,
            name: mobName,
            x: spawnX,
            y: spawnY,
            vx: 0,
            vy: 0,
            hp: 50 * player.level * 0.8,
            maxHp: 50 * player.level * 0.8,
            atk: 8 * player.level * 0.7,
            speed: 1.5 + Math.random() * 0.8,
            radius: 14 + Math.random() * 4,
            color: mobTypeIndex === 0 ? '#10b981' : mobTypeIndex === 1 ? '#3b82f6' : mobTypeIndex === 2 ? '#f59e0b' : '#8b5cf6',
            icon: mobIcon,
          });
        }
      }
    };

    // Auto cast unlocked spells
    const handleAutoSpells = (now: number) => {
      const state = gameStateRef.current;
      if (now - state.lastAutoSpellTime < 500) return;
      state.lastAutoSpellTime = now;

      let nearestEnemy: EnemyEntity | null = null;
      let minDst = Infinity;
      state.enemies.forEach((enemy) => {
        const dx = enemy.x - state.playerPos.x;
        const dy = enemy.y - state.playerPos.y;
        const dst = Math.sqrt(dx * dx + dy * dy);
        if (dst < minDst) {
          minDst = dst;
          nearestEnemy = enemy;
        }
      });

      if (!nearestEnemy && !isAutoBattle) return;

      const targetAngle = nearestEnemy
        ? Math.atan2((nearestEnemy as EnemyEntity).y - state.playerPos.y, (nearestEnemy as EnemyEntity).x - state.playerPos.x)
        : Math.random() * Math.PI * 2;

      spells.forEach((spell) => {
        if (!spell.unlocked) return;
        const effectFx = spell.effectFxKey || player.selectedEffectFx || 'flame_lotus_bullet';

        if (spell.name.includes('剑') || spell.name.includes('大庚') || spell.name.includes('青竹')) {
          sound.playSwordSlash();
          for (let i = -1; i <= 1; i++) {
            const spreadAngle = targetAngle + (i * Math.PI) / 12;
            state.projectiles.push({
              id: `p_sword_${Date.now()}_${i}`,
              x: state.playerPos.x,
              y: state.playerPos.y,
              vx: Math.cos(spreadAngle) * 11,
              vy: Math.sin(spreadAngle) * 11,
              radius: 14,
              damage: spell.damage * (player.atk / 40),
              life: 1.2,
              color: '#34d399',
              isSword: true,
              swordAngle: spreadAngle,
              element: spell.element,
              owner: 'player',
              effectFxKey: effectFx,
            });
          }
        } else if (spell.name.includes('雷') || spell.name.includes('神光')) {
          sound.playThunder();
          state.projectiles.push({
            id: `p_fx_${Date.now()}_${Math.random()}`,
            x: nearestEnemy ? nearestEnemy.x : state.playerPos.x + Math.cos(targetAngle) * 120,
            y: nearestEnemy ? nearestEnemy.y : state.playerPos.y + Math.sin(targetAngle) * 120,
            vx: 0,
            vy: 0,
            radius: spell.area || 45,
            damage: spell.damage * (player.atk / 30),
            life: 0.6,
            color: '#facc15',
            element: spell.element,
            owner: 'player',
            effectFxKey: effectFx,
          });
        } else {
          sound.playFireball();
          state.projectiles.push({
            id: `p_sp_${Date.now()}_${Math.random()}`,
            x: state.playerPos.x,
            y: state.playerPos.y,
            vx: Math.cos(targetAngle) * 7.2,
            vy: Math.sin(targetAngle) * 7.2,
            radius: 14,
            damage: spell.damage * (player.atk / 45),
            life: 1.8,
            color: '#f97316',
            element: spell.element,
            owner: 'player',
            effectFxKey: effectFx,
          });
        }
      });

      if (player.equippedWeapon) {
        const wpName = player.equippedWeapon.name;
        const isSword = wpName.includes('剑') || wpName.includes('刀') || wpName.includes('刃') || wpName.includes('斩');
        const isFire = wpName.includes('火') || wpName.includes('炎');
        let aura = player.selectedEffectFx;
        if (wpName.includes('玄天斩灵剑')) aura = 'xuantian_sword_aura';
        
        state.projectiles.push({
          id: `p_equip_wp_${Date.now()}_${Math.random()}`,
          x: state.playerPos.x,
          y: state.playerPos.y,
          vx: Math.cos(targetAngle) * (isSword ? 8.5 : 7.5),
          vy: Math.sin(targetAngle) * (isSword ? 8.5 : 7.5),
          radius: isSword ? 18 : 22,
          damage: player.atk * 1.5,
          life: 1.8,
          color: isFire ? '#ef4444' : (isSword ? '#a7f3d0' : '#fde047'),
          isSword: isSword,
          swordAngle: targetAngle,
          owner: 'player',
          effectFxKey: aura || (isSword ? 'flying_sword_beam' : 'taiyi_divine_beam'),
        });
      }

      // 1. Equipped Flying Swords Burst Attacks (Distinct for each selected sword element)
      const eqElems = player.equippedSwordElements !== undefined 
        ? player.equippedSwordElements 
        : ['雷', '金', '木', '水', '火', '土', '风'];

      if (eqElems.length > 0) {
        eqElems.forEach((elem, idx) => {
          const spread = targetAngle + (idx - (eqElems.length - 1) / 2) * 0.18;
          const fxMap: Record<string, { fx: string; color: string }> = {
            '金': { fx: 'sword_beam_jin', color: '#facc15' },
            '木': { fx: 'sword_beam_mu', color: '#10b981' },
            '水': { fx: 'sword_beam_shui', color: '#38bdf8' },
            '火': { fx: 'sword_beam_huo', color: '#ef4444' },
            '土': { fx: 'sword_beam_tu', color: '#f59e0b' },
            '雷': { fx: 'sword_beam_lei', color: '#c084fc' },
            '风': { fx: 'sword_beam_feng', color: '#2dd4bf' },
          };
          const info = fxMap[elem] || { fx: 'flying_sword_beam', color: '#34d399' };
          state.projectiles.push({
            id: `p_sw_burst_${elem}_${Date.now()}_${Math.random()}`,
            x: state.playerPos.x,
            y: state.playerPos.y,
            vx: Math.cos(spread) * 7.8,
            vy: Math.sin(spread) * 7.8,
            radius: 16,
            damage: player.atk * 1.2,
            life: 1.8,
            color: info.color,
            isSword: true,
            swordAngle: spread,
            element: elem as any,
            owner: 'player',
            effectFxKey: info.fx as any,
          });
        });
      }

      // 2. Synchronized Active Pet Ranged Spell Attack with Pet-Specific FX
      const activePet = pets.find((p) => p.isActive);
      if (activePet && nearestEnemy) {
        const petWorldX = state.playerPos.x + Math.cos(state.petAngle) * 50;
        const petWorldY = state.playerPos.y + Math.sin(state.petAngle) * 50;
        const petAngleToEnemy = Math.atan2((nearestEnemy as EnemyEntity).y - petWorldY, (nearestEnemy as EnemyEntity).x - petWorldX);

        let petFxKey = 'seven_flame_wave';
        let petColor = '#38bdf8';
        const pName = activePet.name;
        if (pName.includes('噬金虫')) {
          petFxKey = 'pet_gold_beetle_fx';
          petColor = '#fef08a';
        } else if (pName.includes('啼魂')) {
          petFxKey = 'pet_weeping_soul_fx';
          petColor = '#34d399';
        } else if (pName.includes('冰凤')) {
          petFxKey = 'pet_ice_phoenix_fx';
          petColor = '#38bdf8';
        } else if (pName.includes('墨蛟')) {
          petFxKey = 'pet_ink_dragon_fx';
          petColor = '#ef4444';
        } else if (pName.includes('紫纹') || pName.includes('蟠')) {
          petFxKey = 'pet_purple_python_fx';
          petColor = '#c084fc';
        } else if (pName.includes('灵参')) {
          petFxKey = 'pet_ginseng_fx';
          petColor = '#34d399';
        } else if (pName.includes('银蟒')) {
          petFxKey = 'pet_silver_python_fx';
          petColor = '#e2e8f0';
        } else if (pName.includes('蜘蛛')) {
          petFxKey = 'pet_blood_spider_fx';
          petColor = '#ef4444';
        }

        state.projectiles.push({
          id: `pet_synced_${Date.now()}_${Math.random()}`,
          x: petWorldX,
          y: petWorldY,
          vx: Math.cos(petAngleToEnemy) * 11,
          vy: Math.sin(petAngleToEnemy) * 11,
          radius: 16,
          damage: activePet.atk * 1.8,
          life: 1.2,
          color: petColor,
          element: activePet.element,
          owner: 'pet',
          effectFxKey: petFxKey as any,
        });

        state.particles.push({
          id: `pet_txt_${Date.now()}`,
          x: petWorldX,
          y: petWorldY - 20,
          vx: 0,
          vy: -1.5,
          size: 13,
          color: petColor,
          life: 0.8,
          maxLife: 0.8,
          text: `⚡【${activePet.name}·本命神通】`,
        });
      }
    };

    let lastFpsTime = performance.now();
    let fpsFrames = 0;
    let currentFps = 0;

    // Main Game Render & Physics Loop
    const render = (time: number) => {
      const now = time / 1000;
      
      const performanceNow = performance.now();
      if (performanceNow - lastFpsTime >= 1000) {
        currentFps = Math.round((fpsFrames * 1000) / (performanceNow - lastFpsTime));
        fpsFrames = 0;
        lastFpsTime = performanceNow;
      }
      fpsFrames++;

      const state = gameStateRef.current;

      // 1. Calculate Camera Center (Smooth tracking of infinite player coords)
      const camX = state.playerPos.x - canvas.width / 2;
      const camY = state.playerPos.y - canvas.height / 2;

      // Clear Canvas Background
      ctx.fillStyle = currentMap.bgColor || '#121410';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 2. Draw Infinite Map Ground Grid & Procedural Xianxia Tiles
      const tileSize = 120;
      const startTileX = Math.floor(camX / tileSize) - 1;
      const endTileX = Math.ceil((camX + canvas.width) / tileSize) + 1;
      const startTileY = Math.floor(camY / tileSize) - 1;
      const endTileY = Math.ceil((camY + canvas.height) / tileSize) + 1;

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.lineWidth = 1;

      for (let tx = startTileX; tx <= endTileX; tx++) {
        for (let ty = startTileY; ty <= endTileY; ty++) {
          const worldTileX = tx * tileSize;
          const worldTileY = ty * tileSize;
          const screenTileX = worldTileX - camX;
          const screenTileY = worldTileY - camY;

          ctx.strokeRect(screenTileX, screenTileY, tileSize, tileSize);

          // Seeded variation for ground details
          const hash = Math.abs((tx * 73856093) ^ (ty * 19349663));
          if (hash % 7 === 0) {
            ctx.fillStyle = 'rgba(52, 211, 153, 0.08)';
            ctx.beginPath();
            ctx.arc(screenTileX + 30, screenTileY + 40, 12, 0, Math.PI * 2);
            ctx.fill();
          } else if (hash % 11 === 0) {
            ctx.fillStyle = 'rgba(234, 179, 8, 0.06)';
            ctx.fillRect(screenTileX + 10, screenTileY + 10, 40, 3);
          }
        }
      }

      // 3. Draw Infinite Procedural World Monuments / Buildings in Chunks
      const chunkSize = 800; // Massively increased chunk size, only for rare monuments
      const startChunkX = Math.floor(camX / chunkSize) - 1;
      const endChunkX = Math.ceil((camX + canvas.width) / chunkSize) + 1;
      const startChunkY = Math.floor(camY / chunkSize) - 1;
      const endChunkY = Math.ceil((camY + canvas.height) / chunkSize) + 1;

      for (let cx = startChunkX; cx <= endChunkX; cx++) {
        for (let cy = startChunkY; cy <= endChunkY; cy++) {
          const chunkHash = Math.abs((cx * 15485863) ^ (cy * 32452843));
          if (chunkHash % 2 === 0) { 
            const objTypeRaw = chunkHash % 100;
            let objType = 1;
            // Only rare monuments now (1, 4, 6, 7, 8)
            if (objTypeRaw < 30) objType = 1; // Sect
            else if (objTypeRaw < 50) objType = 8; // Tower
            else if (objTypeRaw < 70) objType = 6; // Floating Island
            else if (objTypeRaw < 90) objType = 7; // River
            else objType = 4; // Mountain
            
            const worldObjX = cx * chunkSize + (chunkHash % 300) + 150;
            const worldObjY = cy * chunkSize + ((chunkHash * 7) % 300) + 150;
            // Math.floor to eliminate subpixel jitter!
            const screenObjX = Math.floor(worldObjX - camX);
            const screenObjY = Math.floor(worldObjY - camY);

            drawWorldObject(ctx, objType, screenObjX, screenObjY, now, worldObjX, worldObjY);
            
            // Check collision with player
            if (onEncounterBuilding && now - state.lastEncounterTime > 5) {
              const dist = Math.hypot(state.playerPos.x - worldObjX, state.playerPos.y - worldObjY);
              if (dist < 50) {
                state.lastEncounterTime = now;
                onEncounterBuilding({ type: objType, name: getBuildingName(objType) });
              }
            }
          }
        }
      }

      if (!isPaused && !isModalOpen) {
        // 4. Infinite Player Movement (NO BOUNDS CLAMPING!)
        let moveX = 0;
        let moveY = 0;

        if (state.keys.w) moveY -= 1;
        if (state.keys.s) moveY += 1;
        if (state.keys.a) moveX -= 1;
        if (state.keys.d) moveX += 1;

        if (state.touchDir.x !== 0 || state.touchDir.y !== 0) {
          moveX = state.touchDir.x;
          moveY = state.touchDir.y;
        }

        if (isAutoBattle && moveX === 0 && moveY === 0 && state.enemies.length > 0) {
          let nearestMob = state.enemies[0];
          let minD = Infinity;
          state.enemies.forEach((m) => {
            const d = Math.hypot(m.x - state.playerPos.x, m.y - state.playerPos.y);
            if (d < minD) {
              minD = d;
              nearestMob = m;
            }
          });
          if (minD > 100) {
            const ang = Math.atan2(nearestMob.y - state.playerPos.y, nearestMob.x - state.playerPos.x);
            moveX = Math.cos(ang);
            moveY = Math.sin(ang);
          }
        }

        const mag = Math.hypot(moveX, moveY);
        if (mag > 0) {
          const speed = player.moveSpeed * 1.8;
          state.playerPos.x += (moveX / mag) * speed;
          state.playerPos.y += (moveY / mag) * speed;
        }

        // 5. Spawn enemies and handle auto spells
        spawnEnemyWave(time, canvas.width, canvas.height);
        handleAutoSpells(time);

        // 6. Update Flying Swords Orbit (青竹蜂云剑)
        state.swordAngle += 0.05;
        const equippedElements = player.equippedSwordElements !== undefined 
          ? player.equippedSwordElements 
          : ['雷', '金', '木', '水', '火', '土', '风'];

        const totalSwords = equippedElements.length > 0 ? (equippedElements.length === 1 ? 3 : equippedElements.length * 2) : 0;
        const swordOrbitRadius = 70 + Math.min(60, totalSwords * 2);

        for (let i = 0; i < totalSwords; i++) {
          const currentElem = equippedElements[i % equippedElements.length];
          const angle = state.swordAngle + (i * Math.PI * 2) / totalSwords;
          const swordWorldX = state.playerPos.x + Math.cos(angle) * swordOrbitRadius;
          const swordWorldY = state.playerPos.y + Math.sin(angle) * swordOrbitRadius;

          state.enemies.forEach((enemy) => {
            const dst = Math.hypot(enemy.x - swordWorldX, enemy.y - swordWorldY);
            if (dst < enemy.radius + 15) {
              const rootMult = getDamageMultiplier([currentElem], enemy.element!);
              const dmg = 25 * (player.atk / 30) * rootMult;
              enemy.hp -= dmg;

              // Spawn elemental attack particles on impact
              spawnElementalHitParticles(state.particles, enemy.x, enemy.y, currentElem, 0.9);

              const isCounter = rootMult > 1.1;
              const txt = isCounter ? `⚔️ ${currentElem}系克制 -${Math.round(dmg)}` : `⚔️ -${Math.round(dmg)}`;
              const col = currentElem === '金' ? '#facc15' : currentElem === '火' ? '#ef4444' : currentElem === '水' ? '#38bdf8' : currentElem === '木' ? '#10b981' : currentElem === '土' ? '#f59e0b' : currentElem === '雷' ? '#c084fc' : '#2dd4bf';

              spawnCombatText(
                enemy.x,
                enemy.y,
                txt,
                col,
                isCounter ? 17 : 14,
                { isCombatText: true, strokeColor: '#064e3b', glowColor: isCounter ? '#99f6e4' : undefined, vy: -1.8, life: 0.7 }
              );
            }
          });
        }

        // 7. Active Pet Attack Logic
        state.petAngle -= 0.03;
        const activePet = pets.find((p) => p.isActive);
        const petWorldX = state.playerPos.x + Math.cos(state.petAngle) * 50;
        const petWorldY = state.playerPos.y + Math.sin(state.petAngle) * 50;

        if (activePet && Math.random() < 0.08 && state.enemies.length > 0) {
          const target = state.enemies[Math.floor(Math.random() * state.enemies.length)];
          state.projectiles.push({
            id: `pet_proj_${Date.now()}`,
            x: petWorldX,
            y: petWorldY,
            vx: (target.x - petWorldX) * 0.05,
            vy: (target.y - petWorldY) * 0.05,
            radius: 10,
            damage: activePet.atk * (player.atk / 50),
            life: 1.0,
            color: activePet.name.includes('噬金虫') ? '#fef08a' : '#a7f3d0',
            element: activePet.element,
            owner: 'pet',
          });
        }

        // 8. Update Projectiles
        for (let i = state.projectiles.length - 1; i >= 0; i--) {
          const p = state.projectiles[i];

          // Gentle sinusoidal wave offset for organic flight trajectory (fluid wave / vine weave / wind gust)
          let waveOffsetX = 0;
          let waveOffsetY = 0;
          if (p.element === '水' || p.element === '木' || p.element === '风') {
            const pSpeed = Math.hypot(p.vx, p.vy) || 1;
            const perpX = -p.vy / pSpeed;
            const perpY = p.vx / pSpeed;
            const waveAmp = p.element === '水' ? 1.6 : (p.element === '木' ? 1.3 : 0.9);
            waveOffsetX = perpX * Math.cos(p.life * 14) * waveAmp;
            waveOffsetY = perpY * Math.cos(p.life * 14) * waveAmp;
          }

          p.x += p.vx + waveOffsetX;
          p.y += p.vy + waveOffsetY;
          p.life -= 0.016;

          if (Math.random() < 0.6) {
            let trailText = '•';
            let trailColor = p.color || '#facc15';
            if (p.element === '水') { trailText = '💧'; trailColor = '#38bdf8'; }
            else if (p.element === '火') { trailText = '🔥'; trailColor = '#f97316'; }
            else if (p.element === '土') { trailText = '🪨'; trailColor = '#f59e0b'; }
            else if (p.element === '木') { trailText = '🍃'; trailColor = '#34d399'; }
            else if (p.element === '雷') { trailText = '⚡'; trailColor = '#c084fc'; }

            state.particles.push({
              id: `trail_${Date.now()}_${Math.random()}`,
              x: p.x + (Math.random() - 0.5) * 8,
              y: p.y + (Math.random() - 0.5) * 8,
              vx: -p.vx * 0.08 + (Math.random() - 0.5) * 0.4,
              vy: -p.vy * 0.08 + (Math.random() - 0.5) * 0.4,
              size: Math.max(3, p.radius * 0.4),
              color: trailColor,
              life: 0.3,
              maxLife: 0.3,
              text: trailText,
            });
          }

          if (p.owner === 'player' || p.owner === 'pet') {
            for (let j = state.enemies.length - 1; j >= 0; j--) {
              const enemy = state.enemies[j];
              const dist = Math.hypot(enemy.x - p.x, enemy.y - p.y);
              if (dist < enemy.radius + p.radius) {
                let elementMult = 1.0;
                if (p.element && enemy.element) {
                  elementMult = ELEMENT_COUNTERS[p.element]?.[enemy.element] || 1.0;
                }
                const rootMult = (p.owner === 'player') ? getDamageMultiplier(playerElements, enemy.element!) : 1.0;

                const isCrit = Math.random() < player.critRate;
                const finalDamage = p.damage * elementMult * rootMult * (isCrit ? player.critDamage : 1.0);

                enemy.hp -= finalDamage;

                // Trigger elemental attack particles on impact
                spawnElementalHitParticles(state.particles, enemy.x, enemy.y, p.element || '火', isCrit ? 1.5 : 1.1);

                const isElementCounter = elementMult > 1.05 || rootMult > 1.15;

                if (isCrit) {
                  // Critical hit floating text
                  spawnCombatText(
                    enemy.x,
                    enemy.y - 15,
                    `💥 暴击 -${Math.round(finalDamage)}`,
                    '#facc15',
                    21,
                    { isCombatText: true, strokeColor: '#78350f', glowColor: '#fef08a', vy: -2.4, life: 1.0 }
                  );

                  // Extra 五行克制 overlay if element countered
                  if (isElementCounter) {
                    spawnCombatText(
                      enemy.x,
                      enemy.y - 36,
                      `⚡ 五行相克!`,
                      '#38bdf8',
                      16,
                      { isCombatText: true, strokeColor: '#0369a1', glowColor: '#bae6fd', vy: -2.8, life: 1.0 }
                    );
                  }

                  // Realm strike title banner
                  if (Math.random() < 0.35 || enemy.isBoss) {
                    const realmTitle = getRealmStrikeTitle(player.realmId);
                    spawnCombatText(
                      enemy.x,
                      enemy.y - (isElementCounter ? 54 : 36),
                      realmTitle,
                      '#e0e7ff',
                      18,
                      { isCombatText: true, strokeColor: '#3730a3', glowColor: '#c7d2fe', vy: -2.0, life: 1.1 }
                    );
                  }
                } else if (isElementCounter) {
                  // Element counter floating text
                  spawnCombatText(
                    enemy.x,
                    enemy.y - 15,
                    `⚡ 五行克制 -${Math.round(finalDamage)}`,
                    '#2dd4bf',
                    18,
                    { isCombatText: true, strokeColor: '#0f766e', glowColor: '#99f6e4', vy: -2.0, life: 0.9 }
                  );
                } else {
                  // Normal hit damage text
                  spawnCombatText(
                    enemy.x,
                    enemy.y - 10,
                    `-${Math.round(finalDamage)}`,
                    '#ffffff',
                    14,
                    { isCombatText: true, strokeColor: '#0f172a', vy: -1.8, life: 0.7 }
                  );
                }

                if (!p.isSword) {
                  p.life = 0;
                }
                break;
              }
            }
          }

          if (p.life <= 0) {
            state.projectiles.splice(i, 1);
          }
        }

        // 9. Update Enemies & AI Pursuit + Purge Faraway Enemies
        for (let i = state.enemies.length - 1; i >= 0; i--) {
          const enemy = state.enemies[i];
          const dx = state.playerPos.x - enemy.x;
          const dy = state.playerPos.y - enemy.y;
          const dist = Math.hypot(dx, dy);

          // Purge enemies that wander too far away (> 2500px)
          if (dist > 2500) {
            state.enemies.splice(i, 1);
            continue;
          }

          // Boss Special Skill AI Logic
          if (enemy.isBoss) {
            const nowTime = Date.now();
            const hpRatio = enemy.hp / enemy.maxHp;

            // Trigger Enrage Mode below 50% HP
            if (hpRatio < 0.5 && !enemy.isRaged) {
              enemy.isRaged = true;
              enemy.speed = 2.2;
              enemy.atk *= 1.8;
              state.particles.push({
                id: `rage_${nowTime}`,
                x: enemy.x,
                y: enemy.y - 45,
                vx: 0,
                vy: -1,
                size: 22,
                color: '#ef4444',
                life: 2.5,
                maxLife: 2.5,
                text: '⚡【狂暴形态】全属性暴涨！⚡',
              });
            }

            // Periodic Boss Skill Cast (every 2.8s)
            if (!enemy.lastSkillTime || nowTime - enemy.lastSkillTime > 2800) {
              enemy.lastSkillTime = nowTime;
              const skillChoice = Math.floor(Math.random() * 3);

              if (skillChoice === 0) {
                // Skill 1: 360° Ring Burst Projectiles
                for (let a = 0; a < 10; a++) {
                  const rad = (a * Math.PI * 2) / 10;
                  state.projectiles.push({
                    id: `b_proj_${nowTime}_${a}`,
                    x: enemy.x,
                    y: enemy.y,
                    vx: Math.cos(rad) * 4.5,
                    vy: Math.sin(rad) * 4.5,
                    radius: 8,
                    damage: enemy.atk * 0.4,
                    life: 2.5,
                    color: '#ef4444',
                    owner: 'enemy',
                  });
                }
                state.particles.push({
                  id: `bskill_${nowTime}`,
                  x: enemy.x,
                  y: enemy.y - 35,
                  vx: 0,
                  vy: -1,
                  size: 16,
                  color: '#facc15',
                  life: 1.5,
                  maxLife: 1.5,
                  text: '💥【灭世煞波】',
                });
              } else if (skillChoice === 1) {
                // Skill 2: Spawn Elite Minions
                for (let m = 0; m < 2; m++) {
                  state.enemies.push({
                    id: `b_minion_${nowTime}_${m}`,
                    name: '黑风死煞',
                    x: enemy.x + (m === 0 ? 40 : -40),
                    y: enemy.y + (m === 0 ? 40 : -40),
                    vx: 0,
                    vy: 0,
                    hp: 300 * player.level,
                    maxHp: 300 * player.level,
                    atk: 15 * player.level,
                    speed: 1.8,
                    radius: 16,
                    color: '#a855f7',
                    icon: '/src/assets/images/enemy_demon_hooded_1785143480424.jpg',
                  });
                }
                state.particles.push({
                  id: `bskill_${nowTime}`,
                  x: enemy.x,
                  y: enemy.y - 35,
                  vx: 0,
                  vy: -1,
                  size: 16,
                  color: '#c084fc',
                  life: 1.5,
                  maxLife: 1.5,
                  text: '👻【召魔禁术】',
                });
              } else {
                // Skill 3: Shield Barrier Gain
                enemy.shield = Math.round(enemy.maxHp * 0.2);
                state.particles.push({
                  id: `bskill_${nowTime}`,
                  x: enemy.x,
                  y: enemy.y - 35,
                  vx: 0,
                  vy: -1,
                  size: 16,
                  color: '#38bdf8',
                  life: 1.5,
                  maxLife: 1.5,
                  text: '🛡️【玄阴结界】',
                });
              }
            }
          }

          if (dist > 5) {
            enemy.x += (dx / dist) * enemy.speed;
            enemy.y += (dy / dist) * enemy.speed;
          }

          if (dist < enemy.radius + 20) {
            const playerDmg = Math.max(1, enemy.atk - player.def * 0.3);
            onUpdatePlayer((prev) => ({
              ...prev,
              hp: Math.max(0, prev.hp - playerDmg * 0.05),
            }));
          }

          if (enemy.hp <= 0) {
            sound.playPickup();
            setKillCount((k) => k + 1);

            const expGained = Math.round(15 * player.level * (enemy.isBoss ? 25 : 1));
            const stonesGained = Math.round(5 * (enemy.isBoss ? 80 : 1));
            const coresGained = enemy.isBoss ? 8 : Math.random() < 0.2 ? 1 : 0;

            onEnemyKilled(enemy.name, expGained, stonesGained, coresGained);

            // Generate rich drops
            const dropChance = Math.random();
            if (enemy.isBoss) {
              // Boss explosive legendary loot drops (10+ items scattering in a circle!)
              const bossLootList = [
                { name: '黑风旗', rarity: '通天灵宝' as const, category: 'weapon' as const, desc: '召唤滔天玄阴黑风风暴，大幅降低敌人防御与速度。' },
                { name: '虚天鼎', rarity: '通天灵宝' as const, category: 'weapon' as const, desc: '乱星海第一至宝，镇压天地洪荒风云。' },
                { name: '玄天斩灵剑', rarity: '混沌至宝' as const, category: 'weapon' as const, desc: '斩断法则天道之绝世神剑。' },
                { name: '五色扇', rarity: '古宝' as const, category: 'weapon' as const, desc: '五行神光交织，可扇出滔天五行毁灭仙光。' },
                { name: '金极山', rarity: '古宝' as const, category: 'weapon' as const, desc: '庚金精气凝聚，掷出可镇压万丈山岳。' },
                { name: '斩灵刀', rarity: '极品法器' as const, category: 'weapon' as const, desc: '无坚不摧之斩灵快刀。' },
                { name: '玄天果', rarity: '混沌至宝' as const, category: 'pill' as const, desc: '玄天藤万载结果，服之突破天道桎梏。' },
                { name: '避劫符', rarity: '极品法器' as const, category: 'talisman' as const, desc: '抵御天劫雷霆核心保命神符。' },
                { name: '六丁六甲符', rarity: '极品法器' as const, category: 'talisman' as const, desc: '召唤六丁六甲天神降临护体。' },
                { name: '火龙符', rarity: '上品法器' as const, category: 'talisman' as const, desc: '封印三条飞天烈焰火龙之神符。' },
                { name: '黄龙丹', rarity: '上品法器' as const, category: 'pill' as const, desc: '增进修为金丹大能必备圣药。' },
              ];

              // 1. Large Spirit Stone burst
              state.drops.push({
                id: `drop_bstone_${Date.now()}`,
                x: enemy.x + 25,
                y: enemy.y - 20,
                type: 'stone',
                amount: 3500,
                life: 30,
              });

              // 2. Large Demon Core burst
              state.drops.push({
                id: `drop_bcore_${Date.now()}`,
                x: enemy.x - 25,
                y: enemy.y + 20,
                type: 'core',
                amount: 8,
                life: 30,
              });

              // 3. Scatter 8+ Legendary Equipments, Pills & Talismans
              bossLootList.slice(0, 8).forEach((item, index) => {
                const ang = (index * Math.PI * 2) / 8;
                const dist = 35 + index * 5;
                state.drops.push({
                  id: `drop_boss_item_${Date.now()}_${index}`,
                  x: enemy.x + Math.cos(ang) * dist,
                  y: enemy.y + Math.sin(ang) * dist,
                  type: 'item',
                  life: 35,
                  itemData: {
                    id: `boss_item_${Date.now()}_${index}`,
                    name: item.name,
                    rarity: item.rarity,
                    category: item.category,
                    description: item.desc,
                    quantity: 1,
                  },
                });
              });

              // 4. Spawn Divine Boss Treasure Chest object
              const chestLoot: BossLootItem[] = [
                { id: `loot_stone_${Date.now()}`, name: '极品灵石袋', type: 'stone', amount: 5000, rarity: '通天灵宝' },
                { id: `loot_core_${Date.now()}`, name: '万年妖丹礼匣', type: 'core', amount: 10, rarity: '古宝' },
                {
                  id: `loot_wp1_${Date.now()}`,
                  name: '虚天鼎',
                  type: 'item',
                  rarity: '通天灵宝',
                  itemData: {
                    id: `chest_wp1_${Date.now()}`,
                    name: '虚天鼎',
                    rarity: '通天灵宝',
                    category: 'weapon',
                    description: '乱星海第一至宝，镇压天地洪荒风云。',
                    quantity: 1,
                  }
                },
                {
                  id: `loot_wp2_${Date.now()}`,
                  name: '黑风旗',
                  type: 'item',
                  rarity: '通天灵宝',
                  itemData: {
                    id: `chest_wp2_${Date.now()}`,
                    name: '黑风旗',
                    rarity: '通天灵宝',
                    category: 'weapon',
                    description: '召唤滔天玄阴黑风风暴，大幅降低敌人防御与速度。',
                    quantity: 1,
                  }
                },
                {
                  id: `loot_pill_${Date.now()}`,
                  name: '洗髓补天仙丹',
                  type: 'item',
                  rarity: '混沌至宝',
                  itemData: {
                    id: `chest_pill_${Date.now()}`,
                    name: '洗髓补天仙丹',
                    rarity: '混沌至宝',
                    category: 'pill',
                    description: '洗炼全身筋骨灵根，极大提升修仙潜能与血量上限。',
                    quantity: 2,
                  }
                },
              ];

              state.chests.push({
                id: `boss_chest_${Date.now()}`,
                x: enemy.x,
                y: enemy.y,
                bossName: enemy.name,
                opened: false,
                spawnTime: Date.now(),
                rarity: enemy.name.includes('龙') || enemy.name.includes('祖') ? '混沌秘宝箱' : '仙阶仙箱',
                lootItems: chestLoot,
              });

              state.particles.push({
                id: `boss_dead_${Date.now()}`,
                x: enemy.x,
                y: enemy.y - 50,
                vx: 0,
                vy: -1,
                size: 26,
                color: '#facc15',
                life: 4,
                maxLife: 4,
                text: `🏆 成功击杀 Boss【${enemy.name}】！爆发满屏上古神物！`,
              });
            } else if (dropChance < 0.60) {
              // Spirit Stone Drop
              state.drops.push({
                id: `drop_${Date.now()}_${Math.random()}`,
                x: enemy.x,
                y: enemy.y,
                type: 'stone',
                amount: Math.random() < 0.2 ? 100 : Math.random() < 0.5 ? 50 : 15,
                life: 15,
              });
            } else if (dropChance < 0.90) {
              // Weapon Drop
              const weapons = [
                { name: '玄天斩灵剑', rarity: '混沌至宝' as const, category: 'weapon' as const, desc: '斩断法则天道之绝世神剑。', stats: { atk: 500, critRate: 0.2 } },
                { name: '青竹蜂云剑', rarity: '通天灵宝' as const, category: 'weapon' as const, desc: '七十二口飞剑组成剑阵，威力无穷。', stats: { atk: 300, speed: 50 } },
                { name: '斩灵刀', rarity: '极品法器' as const, category: 'weapon' as const, desc: '无坚不摧之斩灵快刀。', stats: { atk: 150, critRate: 0.1 } },
                { name: '虚天鼎', rarity: '通天灵宝' as const, category: 'weapon' as const, desc: '乱星海第一至宝，镇压天地洪荒风云。', stats: { def: 500, hp: 2000 } },
                { name: '黑风旗', rarity: '通天灵宝' as const, category: 'weapon' as const, desc: '召唤滔天玄阴黑风风暴，大幅降低敌人防御与速度。', stats: { atk: 250, def: 100 } },
                { name: '金极山', rarity: '古宝' as const, category: 'weapon' as const, desc: '庚金精气凝聚，掷出可镇压万丈山岳。', stats: { atk: 350, speed: -20 } },
                { name: '五色扇', rarity: '古宝' as const, category: 'weapon' as const, desc: '五行神光交织，可扇出滔天五行毁灭仙光。', stats: { atk: 400, critRate: 0.15 } },
              ];
              const wp = weapons[Math.floor(Math.random() * weapons.length)];
              state.drops.push({
                id: `drop_wp_${Date.now()}_${Math.random()}`,
                x: enemy.x,
                y: enemy.y,
                type: 'item',
                life: 15,
                itemData: {
                  id: `wp_${Date.now()}_${Math.random()}`,
                  name: wp.name,
                  rarity: wp.rarity,
                  category: wp.category,
                  description: wp.desc,
                  stats: wp.stats,
                  quantity: 1,
                },
              });
            } else {
              // EXP Orb
              state.drops.push({
                id: `drop_${Date.now()}_${Math.random()}`,
                x: enemy.x,
                y: enemy.y,
                type: 'exp',
                amount: 15 * player.level,
                life: 15,
              });
            }

            if (enemy.isBoss) {
              setBossSpawned(false);
              onBossDefeated(currentMap.id);
            }

            state.enemies.splice(i, 1);
          }
        }

        // 10. Update Drops & Magnetize (With Range Auto-Magnet Toggle)
        const isAutoMagnet = player.isAutoMagnetEnabled !== false; // Default enabled
        const magneticRadius = isAutoMagnet ? 550 : 130 + player.divineSense * 10;

        let gatheredStones = 0;
        let gatheredCores = 0;
        let gatheredExp = 0;
        let itemsCollected: any[] = [];

        for (let i = state.drops.length - 1; i >= 0; i--) {
          const drop = state.drops[i];
          const dist = Math.hypot(state.playerPos.x - drop.x, state.playerPos.y - drop.y);

          if (dist < magneticRadius) {
            const magnetSpeed = isAutoMagnet ? 0.18 : 0.12;
            drop.x += (state.playerPos.x - drop.x) * magnetSpeed;
            drop.y += (state.playerPos.y - drop.y) * magnetSpeed;
          }

          if (dist < 28) {
            sound.playPickup();
            if (drop.type === 'stone') {
              gatheredStones += drop.amount!;
            } else if (drop.type === 'core') {
              gatheredCores += 1;
            } else if (drop.type === 'exp') {
              gatheredExp += drop.amount!;
            } else if (drop.type === 'item' && drop.itemData) {
              itemsCollected.push(drop.itemData);
            }
            state.drops.splice(i, 1);
          }
        }

        if (gatheredStones > 0 || gatheredCores > 0 || gatheredExp > 0) {
          onUpdatePlayer((prev) => ({
            ...prev,
            spiritStones: prev.spiritStones + gatheredStones,
            demonCores: prev.demonCores + gatheredCores,
            exp: prev.exp + gatheredExp,
          }));
        }
        itemsCollected.forEach(item => onItemCollected(item));

        // Cap array sizes for performance optimization
        if (state.particles.length > 250) state.particles.splice(0, state.particles.length - 250);
        if (state.drops.length > 50) state.drops.splice(0, state.drops.length - 50);
        if (state.projectiles.length > 60) state.projectiles.splice(0, state.projectiles.length - 60);

        // 11. Update Particles
        for (let i = state.particles.length - 1; i >= 0; i--) {
          const pt = state.particles[i];

          if (pt.accelX) pt.vx += pt.accelX;
          if (pt.accelY) pt.vy += pt.accelY;

          if (pt.type === 'vine_coil' && pt.centerPos && pt.spiralAngle !== undefined) {
            pt.spiralAngle += 0.22;
            pt.spiralRadius = (pt.spiralRadius || 8) + 0.9;
            pt.x = pt.centerPos.x + Math.cos(pt.spiralAngle) * pt.spiralRadius;
            pt.y = pt.centerPos.y + Math.sin(pt.spiralAngle) * pt.spiralRadius;
          } else {
            pt.x += pt.vx;
            pt.y += pt.vy;
          }

          if (pt.angle !== undefined && pt.omega !== undefined) {
            pt.angle += pt.omega;
          }

          if (pt.type === 'water_wave') {
            pt.radius = (pt.radius || 8) + 2.2;
          } else if (pt.type === 'water_drop') {
            pt.vx += Math.cos(pt.life * (pt.waveFreq || 12)) * (pt.waveAmp || 1.5) * 0.12;
          } else if (pt.type === 'flame_leap' || pt.type === 'ember_flicker') {
            pt.vx += (Math.random() - 0.5) * 0.35;
          } else if (pt.type === 'leaf_swirl' || pt.type === 'leaf') {
            pt.vx += Math.sin(now / 200 + pt.id.length) * 0.15;
          } else if (pt.type === 'sand') {
            pt.vx += 0.05;
          }

          pt.life -= 0.016;
          if (pt.life <= 0) {
            state.particles.splice(i, 1);
          }
        }
        
        // Spawn Environmental Particles
        // MP Regen / Aura Particles when standing still
        const isPlayerStill = !(state.keys.w || state.keys.a || state.keys.s || state.keys.d || state.touchDir.x !== 0 || state.touchDir.y !== 0);
        if (isPlayerStill && player.mp < player.maxMp && Math.random() < 0.15) {
           state.particles.push({
             id: `aura_${Date.now()}_${Math.random()}`,
             x: state.playerPos.x + (Math.random() - 0.5) * 60,
             y: state.playerPos.y + 30, // from feet
             vx: (Math.random() - 0.5) * 0.5,
             vy: -1 - Math.random() * 2,
             life: 2 + Math.random(),
             maxLife: 3,
             size: 3 + Math.random() * 4,
             color: '#6ee7b7', // Cyan/Emerald aura
             type: 'sand' // Sand draws as simple circle, but we will add glow in rendering
           });
           
           // Optionally add +1 MP text particle occasionally to reinforce the feeling
           if (Math.random() < 0.05) {
             state.particles.push({
               id: `mp_text_${Date.now()}_${Math.random()}`,
               x: state.playerPos.x + (Math.random() - 0.5) * 40,
               y: state.playerPos.y - 40,
               vx: 0,
               vy: -1,
               life: 1.5,
               maxLife: 1.5,
               size: 14,
               color: '#6ee7b7',
               text: '+灵气'
             });
           }
        }

        if (Math.random() < 0.3) {
           let type = null;
           let color = '';
           let vx = 0;
           let vy = 0;
           let size = 0;
           if (currentMap.name.includes('竹') || currentMap.name.includes('林') || currentMap.name.includes('谷') || currentMap.name.includes('门')) {
               type = 'leaf';
               color = Math.random() > 0.5 ? '#4ade80' : '#15803d'; 
               vx = (Math.random() - 0.5) * 2;
               vy = 0.5 + Math.random() * 1.5;
               size = 4 + Math.random() * 6;
           } else if (currentMap.name.includes('沙') || currentMap.name.includes('漠') || currentMap.name.includes('荒') || currentMap.name.includes('星海')) {
               type = 'sand';
               color = '#fcd34d'; 
               vx = 2 + Math.random() * 3;
               vy = (Math.random() - 0.5) * 1;
               size = 2 + Math.random() * 3;
           } else if (currentMap.name.includes('渊') || currentMap.name.includes('魔') || currentMap.name.includes('血') || currentMap.name.includes('火') || currentMap.name.includes('秘境')) {
               type = 'ash';
               color = currentMap.name.includes('血') ? '#ef4444' : '#71717a';
               vx = (Math.random() - 0.5) * 2;
               vy = -1 - Math.random() * 1.5; 
               size = 2 + Math.random() * 4;
           }

           if (type) {
               // spawn slightly outside camera bounds depending on movement direction
               // for simplicity, just spawn around the camera with a large margin
               const spawnX = camX + (Math.random() * 1.5 - 0.25) * canvas.width;
               const spawnY = camY + (Math.random() * 1.5 - 0.25) * canvas.height;
               state.particles.push({
                  id: `env_${Date.now()}_${Math.random()}`,
                  x: spawnX,
                  y: spawnY,
                  vx, vy,
                  life: 6 + Math.random() * 4, 
                  maxLife: 10,
                  size, color,
                  type: type,
                  angle: Math.random() * Math.PI * 2,
                  omega: (Math.random() - 0.5) * 0.1
               });
           }
        }
        // Check proximity to uncollected boss chests
        const nearbyChest = state.chests.find(
          (c) => !c.opened && Math.hypot(state.playerPos.x - c.x, state.playerPos.y - c.y) < 70
        );
        if (nearbyChest) {
          if (!nearChest || nearChest.id !== nearbyChest.id) {
            setNearChest(nearbyChest);
          }
        } else if (nearChest) {
          setNearChest(null);
        }

      }

      // --- RENDERING LAYER (Transform World Coords to Screen Coords) ---

      // A. Draw Drops
      state.drops.forEach((drop) => {
        const screenX = drop.x - camX;
        const screenY = drop.y - camY;
        drawDropItemSprite(ctx, { ...drop, x: screenX, y: screenY }, now);
      });

      // A2. Draw Boss Chests
      state.chests.forEach((chest) => {
        const screenX = chest.x - camX;
        const screenY = chest.y - camY;
        drawBossChestSprite(ctx, { ...chest, x: screenX, y: screenY }, now);
      });

      // B. Draw Enemies
      state.enemies.forEach((enemy) => {
        const screenX = enemy.x - camX;
        const screenY = enemy.y - camY;
        drawMonsterSprite(ctx, { ...enemy, x: screenX, y: screenY }, now);
      });

      // C. Draw Projectiles & Attack FX
      state.projectiles.forEach((p) => {
        const screenX = p.x - camX;
        const screenY = p.y - camY;

        if (p.effectFxKey) {
          drawAttackFx(ctx, p.effectFxKey, screenX, screenY, p.radius, now, p.color);
        } else {
          ctx.save();
          ctx.beginPath();
          if (p.isSword) {
            ctx.translate(screenX, screenY);
            ctx.rotate(p.swordAngle || 0);
            ctx.fillStyle = p.color;
            ctx.fillRect(-15, -3, 30, 6);
          } else {
            ctx.arc(screenX, screenY, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.shadowColor = p.color;
            ctx.shadowBlur = 10;
            ctx.fill();
          }
          ctx.restore();
        }
      });

      // D. Draw Orbiting Flying Swords with Elemental Sword Aura (剑芒)
      const primarySword = flyingSwords[0];
      const swordElement = primarySword?.element || '雷';
      const playerScreenX = canvas.width / 2;
      const playerScreenY = canvas.height / 2;

      const equippedElements = player.equippedSwordElements !== undefined 
        ? player.equippedSwordElements 
        : ['雷', '金', '木', '水', '火', '土', '风'];

      const totalSwords = equippedElements.length > 0 ? (equippedElements.length === 1 ? 3 : equippedElements.length * 2) : 0;

      if (totalSwords > 0) {
        const swordOrbitRadius = 70 + Math.min(60, totalSwords * 2);

        const elementGlowMap: Record<string, { main: string; glow: string; blade: string; trail: string }> = {
          '金': { main: '#facc15', glow: '#eab308', blade: '#fef08a', trail: 'rgba(250, 204, 21, 0.75)' },
          '木': { main: '#10b981', glow: '#059669', blade: '#a7f3d0', trail: 'rgba(16, 185, 129, 0.75)' },
          '水': { main: '#38bdf8', glow: '#0284c7', blade: '#e0f2fe', trail: 'rgba(56, 189, 248, 0.75)' },
          '火': { main: '#f43f5e', glow: '#dc2626', blade: '#fecdd3', trail: 'rgba(244, 63, 94, 0.75)' },
          '土': { main: '#f59e0b', glow: '#d97706', blade: '#fef3c7', trail: 'rgba(245, 158, 11, 0.75)' },
          '雷': { main: '#c084fc', glow: '#a855f7', blade: '#f3e8ff', trail: 'rgba(192, 132, 252, 0.75)' },
          '风': { main: '#2dd4bf', glow: '#0d9488', blade: '#ccfbf1', trail: 'rgba(45, 212, 191, 0.75)' },
        };

        const animTime = Date.now() / 1000;

        ctx.save();
        for (let i = 0; i < totalSwords; i++) {
          const currentElem = equippedElements[i % equippedElements.length];
          const swordColors = elementGlowMap[currentElem] || elementGlowMap['雷'];

          const angle = state.swordAngle + (i * Math.PI * 2) / totalSwords;
          const swordSx = playerScreenX + Math.cos(angle) * swordOrbitRadius;
          const swordSy = playerScreenY + Math.sin(angle) * swordOrbitRadius;

          ctx.save();
          ctx.translate(swordSx, swordSy);
          ctx.rotate(angle + Math.PI / 2);

          // Draw Sharp Flying Sword Blade & Glowing Sword Aura (剑芒)
          ctx.shadowColor = swordColors.main;
          ctx.shadowBlur = 14;

          // Long Sword Light Trail
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(0, 26);
          ctx.strokeStyle = swordColors.trail;
          ctx.lineWidth = 2.5;
          ctx.stroke();

          // Sharp Metallic Sword Blade
          ctx.beginPath();
          ctx.moveTo(0, -18);
          ctx.lineTo(4, 2);
          ctx.lineTo(0, 0);
          ctx.lineTo(-4, 2);
          ctx.closePath();
          ctx.fillStyle = swordColors.blade;
          ctx.fill();

          // Inner Blade Spine
          ctx.beginPath();
          ctx.moveTo(0, -18);
          ctx.lineTo(0, 10);
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1;
          ctx.stroke();

          // Crossguard
          ctx.beginPath();
          ctx.moveTo(-6, 2);
          ctx.lineTo(6, 2);
          ctx.strokeStyle = swordColors.main;
          ctx.lineWidth = 2;
          ctx.stroke();

          // ELEMENTAL SPECIAL EFFECTS ON SWORD BODY
          if (currentElem === '金') {
            // Golden Lightning Sparks wrapping sword body
            ctx.beginPath();
            ctx.moveTo(-2, -14);
            ctx.lineTo(3, -8);
            ctx.lineTo(-3, -2);
            ctx.lineTo(3, 4);
            ctx.strokeStyle = '#fef08a';
            ctx.lineWidth = 1.2;
            ctx.stroke();

            ctx.fillStyle = '#facc15';
            const sparkX = Math.sin(animTime * 12 + i) * 5;
            ctx.fillRect(sparkX, -8, 2, 2);
          } else if (currentElem === '火') {
            // Crimson Flame Ember & Flame Tongue
            ctx.beginPath();
            ctx.moveTo(-3, -8);
            ctx.quadraticCurveTo(0, -22 + Math.sin(animTime * 10 + i) * 3, 3, -8);
            ctx.fillStyle = '#f97316';
            ctx.fill();

            ctx.beginPath();
            ctx.arc(Math.sin(animTime * 8 + i) * 4, -12, 2.5, 0, Math.PI * 2);
            ctx.fillStyle = '#ef4444';
            ctx.fill();
          } else if (currentElem === '水') {
            // Translucent Pale Blue Water Wave & Mist
            ctx.beginPath();
            ctx.ellipse(0, -4, 9, 4.5, animTime * 3, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(56, 189, 248, 0.7)';
            ctx.lineWidth = 1.2;
            ctx.stroke();

            ctx.beginPath();
            ctx.arc(0, -6, 5, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(224, 242, 254, 0.35)';
            ctx.fill();
          } else if (currentElem === '木') {
            // Swirling Emerald Leaf Spirits
            const leafX = Math.cos(animTime * 5 + i) * 7;
            const leafY = Math.sin(animTime * 5 + i) * 7 - 4;
            ctx.beginPath();
            ctx.arc(leafX, leafY, 2.5, 0, Math.PI * 2);
            ctx.fillStyle = '#34d399';
            ctx.fill();

            ctx.beginPath();
            ctx.arc(-leafX, -leafY, 2, 0, Math.PI * 2);
            ctx.fillStyle = '#6ee7b7';
            ctx.fill();
          } else if (currentElem === '土') {
            // Ancient Stone Rune Square Shield
            ctx.save();
            ctx.rotate(animTime * 2 + i);
            ctx.strokeStyle = 'rgba(245, 158, 11, 0.8)';
            ctx.lineWidth = 1.2;
            ctx.strokeRect(-6, -6, 12, 12);
            ctx.restore();
          } else if (currentElem === '雷') {
            // Purple Thunder Electrical Discharge
            ctx.beginPath();
            ctx.moveTo(0, -16);
            ctx.lineTo(-4, -8);
            ctx.lineTo(4, -2);
            ctx.lineTo(-4, 4);
            ctx.lineTo(2, 10);
            ctx.strokeStyle = '#c084fc';
            ctx.lineWidth = 1.5;
            ctx.stroke();
          } else if (currentElem === '风') {
            // Razor Wind Crescent Blade
            ctx.beginPath();
            ctx.arc(0, -4, 9, -Math.PI * 0.4, Math.PI * 0.4);
            ctx.strokeStyle = 'rgba(45, 212, 191, 0.85)';
            ctx.lineWidth = 1.8;
            ctx.stroke();
          }

          ctx.restore();
        }
        ctx.restore();
      }

      // E. Draw Active Pet & Orbiting Ring
      const activePet = pets.find((p) => p.isActive);
      if (activePet) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(playerScreenX, playerScreenY, 50, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(52, 211, 153, 0.35)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        ctx.stroke();
        ctx.restore();

        const petSx = playerScreenX + Math.cos(state.petAngle) * 50;
        const petSy = playerScreenY + Math.sin(state.petAngle) * 50;
        drawPetSprite(ctx, activePet, petSx, petSy, now);
      }

      // F. Draw Player Character (Centered in Screen with Dynamic Aura & Options)
      const isPlayerMoving = state.keys.w || state.keys.a || state.keys.s || state.keys.d || state.touchDir.x !== 0 || state.touchDir.y !== 0;

      drawPlayerSprite(
        ctx,
        playerScreenX,
        playerScreenY,
        player.name,
        player.title,
        0,
        isPlayerMoving,
        now,
        {
          realmId: player.realmId,
          playerRoot: player.root,
          playerElements: playerElements,
          swordElement: swordElement,
          effectFx: player.selectedEffectFx,
          equippedWeapon: player.equippedWeapon,
        }
      );

      // F2. 【天劫雷云】(Tribulation Lightning Cloud Particle Effect) when isBottleneck is true
      if (player.isBottleneck) {
        ctx.save();

        // 1. Dark swirling storm sky overlay
        const cloudGradient = ctx.createLinearGradient(0, 0, 0, canvas.height * 0.45);
        cloudGradient.addColorStop(0, 'rgba(15, 7, 32, 0.85)');
        cloudGradient.addColorStop(0.5, 'rgba(23, 10, 48, 0.55)');
        cloudGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = cloudGradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height * 0.45);

        // 2. Swirling storm clouds
        ctx.fillStyle = 'rgba(30, 20, 50, 0.4)';
        for (let c = 0; c < 8; c++) {
          const cx = (canvas.width / 7) * c + Math.sin(now * 0.5 + c) * 30;
          const cy = 20 + Math.cos(now * 0.3 + c) * 15;
          ctx.beginPath();
          ctx.arc(cx, cy, 60 + Math.sin(now + c) * 15, 0, Math.PI * 2);
          ctx.fill();
        }

        // 3. Dynamic Lightning Bolts
        if (Math.random() < 0.3) {
          const lx = Math.random() * canvas.width;
          const lyEnd = 80 + Math.random() * (canvas.height * 0.5);

          ctx.beginPath();
          ctx.moveTo(lx, 0);
          ctx.lineTo(lx + (Math.random() - 0.5) * 40, lyEnd * 0.3);
          ctx.lineTo(lx + (Math.random() - 0.5) * 60, lyEnd * 0.6);
          ctx.lineTo(playerScreenX + (Math.random() - 0.5) * 80, playerScreenY - 20);

          ctx.strokeStyle = Math.random() > 0.5 ? '#e879f9' : '#38bdf8';
          ctx.lineWidth = 2.5 + Math.random() * 2;
          ctx.shadowColor = '#c084fc';
          ctx.shadowBlur = 25;
          ctx.stroke();
        }

        // 4. Electric Tribulation Aura around Player
        ctx.beginPath();
        ctx.arc(playerScreenX, playerScreenY, 35 + Math.sin(now * 8) * 5, 0, Math.PI * 2);
        ctx.strokeStyle = '#c084fc';
        ctx.lineWidth = 2;
        ctx.shadowColor = '#e879f9';
        ctx.shadowBlur = 20;
        ctx.stroke();

        // 5. Sky Tribulation Warning Banner
        ctx.fillStyle = 'rgba(24, 9, 41, 0.85)';
        ctx.strokeStyle = '#c084fc';
        ctx.lineWidth = 1.5;
        const bannerW = Math.min(380, canvas.width - 40);
        const bannerX = (canvas.width - bannerW) / 2;
        ctx.fillRect(bannerX, 12, bannerW, 30);
        ctx.strokeRect(bannerX, 12, bannerW, 30);

        ctx.fillStyle = '#f5d0fe';
        ctx.font = 'bold 12px serif';
        ctx.textAlign = 'center';
        ctx.fillText('⚡ 【天劫临界 · 雷云密布】境界至瓶颈！请点击[打坐突破]渡劫升仙！', canvas.width / 2, 31);

        ctx.restore();
      }

      // G. Draw Particles & Damage Numbers
      state.particles.forEach((pt) => {
        const screenX = pt.x - camX;
        const screenY = pt.y - camY;

        // Culling: if entirely outside screen, don't draw (environmental particles can be off-screen)
        if (screenX < -50 || screenX > canvas.width + 50 || screenY < -50 || screenY > canvas.height + 50) {
            return;
        }

        ctx.save();
        ctx.globalAlpha = Math.max(0, pt.life / pt.maxLife);
        ctx.fillStyle = pt.color;
        
        if (pt.type === 'water_wave') {
          // 水波波动 - Concentric Expanding Water Wave Ripple Rings
          const r = pt.radius || 10;
          ctx.beginPath();
          ctx.arc(screenX, screenY, r, 0, Math.PI * 2);
          ctx.strokeStyle = pt.color;
          ctx.lineWidth = 2.5;
          ctx.shadowColor = pt.glowColor || '#38bdf8';
          ctx.shadowBlur = 10;
          ctx.stroke();

          ctx.beginPath();
          ctx.arc(screenX, screenY, Math.max(1, r - 5), 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
          ctx.lineWidth = 1.2;
          ctx.stroke();
        } else if (pt.type === 'water_drop') {
          // 水滴 - Splashing Water Droplet
          ctx.beginPath();
          ctx.arc(screenX, screenY, pt.size / 2, 0, Math.PI * 2);
          ctx.fillStyle = pt.color;
          ctx.shadowColor = pt.glowColor || '#38bdf8';
          ctx.shadowBlur = 8;
          ctx.fill();

          ctx.beginPath();
          ctx.arc(screenX - pt.size * 0.15, screenY - pt.size * 0.15, pt.size * 0.2, 0, Math.PI * 2);
          ctx.fillStyle = '#ffffff';
          ctx.fill();
        } else if (pt.type === 'flame_leap') {
          // 火焰跳跃 - Leaping Flame Tongue
          ctx.translate(screenX, screenY);
          const flameAng = Math.atan2(pt.vy, pt.vx) + Math.PI / 2;
          ctx.rotate(flameAng);
          ctx.beginPath();
          ctx.moveTo(0, -pt.size * 1.3);
          ctx.quadraticCurveTo(pt.size * 0.6, -pt.size * 0.2, pt.size * 0.4, pt.size * 0.8);
          ctx.lineTo(-pt.size * 0.4, pt.size * 0.8);
          ctx.quadraticCurveTo(-pt.size * 0.6, -pt.size * 0.2, 0, -pt.size * 1.3);
          ctx.fillStyle = pt.color;
          ctx.shadowColor = pt.glowColor || pt.color;
          ctx.shadowBlur = 12;
          ctx.fill();
        } else if (pt.type === 'ember_flicker') {
          // 余烬喷涌 - Flickering Buoyant Embers
          ctx.beginPath();
          ctx.arc(screenX, screenY, pt.size / 2, 0, Math.PI * 2);
          ctx.fillStyle = pt.color;
          ctx.shadowColor = pt.glowColor || '#fef08a';
          ctx.shadowBlur = 10;
          ctx.fill();
        } else if (pt.type === 'rock_shatter') {
          // 岩石迸裂 - Tumbling Irregular Stone Polygon
          ctx.translate(screenX, screenY);
          if (pt.angle) ctx.rotate(pt.angle);
          ctx.beginPath();
          ctx.moveTo(0, -pt.size);
          ctx.lineTo(pt.size * 0.85, -pt.size * 0.3);
          ctx.lineTo(pt.size * 0.65, pt.size * 0.75);
          ctx.lineTo(-pt.size * 0.7, pt.size * 0.6);
          ctx.lineTo(-pt.size * 0.85, -pt.size * 0.35);
          ctx.closePath();
          ctx.fillStyle = '#78350f';
          ctx.fill();
          ctx.strokeStyle = pt.color;
          ctx.lineWidth = 2;
          ctx.shadowColor = pt.glowColor || '#f59e0b';
          ctx.shadowBlur = 8;
          ctx.stroke();
        } else if (pt.type === 'stone_chunk') {
          // 石块粉尘 - Dust Cloud or Square Rock
          ctx.translate(screenX, screenY);
          if (pt.angle) ctx.rotate(pt.angle);
          ctx.fillStyle = pt.color;
          ctx.fillRect(-pt.size / 2, -pt.size / 2, pt.size, pt.size);
        } else if (pt.type === 'vine_coil') {
          // 藤蔓缠绕 - Coiling Green Tendril Node
          ctx.translate(screenX, screenY);
          ctx.beginPath();
          ctx.arc(0, 0, pt.size / 2, 0, Math.PI * 2);
          ctx.fillStyle = pt.color;
          ctx.shadowColor = pt.glowColor || '#10b981';
          ctx.shadowBlur = 10;
          ctx.fill();

          ctx.beginPath();
          ctx.ellipse(pt.size * 0.5, 0, pt.size * 0.8, pt.size * 0.35, Math.PI / 4, 0, Math.PI * 2);
          ctx.fillStyle = '#6ee7b7';
          ctx.fill();
        } else if (pt.type === 'leaf_swirl' || pt.type === 'leaf') {
          // 翡翠灵叶 - Swirling Leaf with Midrib Vein
          ctx.translate(screenX, screenY);
          if (pt.angle) ctx.rotate(pt.angle);
          ctx.beginPath();
          ctx.ellipse(0, 0, pt.size, pt.size * 0.45, 0, 0, Math.PI * 2);
          ctx.fillStyle = pt.color;
          ctx.shadowColor = pt.glowColor || '#34d399';
          ctx.shadowBlur = 8;
          ctx.fill();

          ctx.beginPath();
          ctx.moveTo(-pt.size * 0.8, 0);
          ctx.lineTo(pt.size * 0.8, 0);
          ctx.strokeStyle = '#047857';
          ctx.lineWidth = 1;
          ctx.stroke();
        } else if (pt.type === 'lightning_spark') {
          // 九天紫雷 - Lightning Bolt Spark
          ctx.translate(screenX, screenY);
          ctx.beginPath();
          ctx.moveTo(-pt.size, -pt.size);
          ctx.lineTo(0, -pt.size * 0.2);
          ctx.lineTo(-pt.size * 0.3, pt.size * 0.3);
          ctx.lineTo(pt.size, pt.size);
          ctx.strokeStyle = pt.color;
          ctx.lineWidth = 2.2;
          ctx.shadowColor = pt.glowColor || '#f3e8ff';
          ctx.shadowBlur = 12;
          ctx.stroke();
        } else if (pt.type === 'ash' || pt.type === 'sand') {
            if (pt.color === '#6ee7b7') { // Aura particle
                ctx.shadowBlur = 10;
                ctx.shadowColor = pt.color;
            }
            ctx.beginPath();
            ctx.arc(screenX, screenY, pt.size / 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
        } else if (pt.text) {
            ctx.translate(screenX, screenY);

            // Pop & Bounce scale animation for floating combat text
            const progress = 1 - Math.max(0, pt.life / pt.maxLife);
            let scale = 1.0;
            if (pt.isCombatText || pt.size >= 16) {
              if (progress < 0.18) {
                scale = 0.4 + (progress / 0.18) * 0.95; // pop up from 0.4 to 1.35
              } else if (progress < 0.35) {
                scale = 1.35 - ((progress - 0.18) / 0.17) * 0.35; // bounce back to 1.0
              }
            }
            ctx.scale(scale, scale);

            ctx.font = `italic bold ${pt.size}px "PingFang SC", "Microsoft YaHei", sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            // High Contrast Outline / Stroke
            ctx.lineWidth = pt.isCombatText ? 4 : 2.5;
            ctx.strokeStyle = pt.strokeColor || 'rgba(10, 15, 25, 0.95)';
            ctx.strokeText(pt.text, 0, 0);

            // Glow Effect
            if (pt.glowColor) {
              ctx.shadowBlur = 12;
              ctx.shadowColor = pt.glowColor;
            }

            // Fill Text
            ctx.fillStyle = pt.color;
            ctx.fillText(pt.text, 0, 0);
            ctx.shadowBlur = 0;
        } else {
            // generic dot
            ctx.beginPath();
            ctx.arc(screenX, screenY, pt.size / 2, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
      });

      // G. Draw FPS Counter (Top-Left)
      ctx.save();
      ctx.font = 'bold 14px "PingFang SC", sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillStyle = currentFps >= 45 ? '#34d399' : currentFps >= 30 ? '#facc15' : '#ef4444';
      ctx.fillText(`FPS: ${currentFps}`, 15, 15);
      
      // Also show entity count to help debug
      ctx.fillStyle = '#a1d1b4';
      ctx.fillText(`Entities: ${state.enemies.length} | Projectiles: ${state.projectiles.length} | Particles: ${state.particles.length}`, 15, 35);
      ctx.restore();

      // H. Draw Mini-Map Radar HUD (Top-Right)
      const radarRadius = 50;
      const radarCx = canvas.width - 70;
      const radarCy = 70;

      ctx.save();
      ctx.beginPath();
      ctx.arc(radarCx, radarCy, radarRadius, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#e9c176';
      ctx.stroke();

      // Radar Grid Ring
      ctx.beginPath();
      ctx.arc(radarCx, radarCy, radarRadius * 0.5, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(233, 193, 118, 0.3)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Player Blip
      ctx.beginPath();
      ctx.arc(radarCx, radarCy, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = '#34d399';
      ctx.fill();

      // Enemies on Radar
      state.enemies.forEach((enemy) => {
        const edx = (enemy.x - state.playerPos.x) * 0.05;
        const edy = (enemy.y - state.playerPos.y) * 0.05;
        const dist = Math.hypot(edx, edy);

        if (dist < radarRadius - 4) {
          ctx.beginPath();
          ctx.arc(radarCx + edx, radarCy + edy, enemy.isBoss ? 4 : 2, 0, Math.PI * 2);
          ctx.fillStyle = enemy.isBoss ? '#ef4444' : '#f59e0b';
          ctx.fill();
        }
      });
      ctx.restore();

      // Restore from screen shake
    if (player.selectedEffectFx === 'fubao_press_stamp' || player.selectedEffectFx === 'talisman_burst_ring') {
      ctx.restore();
    }
    
    animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [player, spells, flyingSwords, pets, currentMap, isPaused, isAutoBattle, bossSpawned, isModalOpen, onEncounterBuilding]);

  // Touch handlers for Virtual Joystick
  const handleTouchStart = (e: React.TouchEvent) => {
    if (joystickTouchId.current !== null) return;
    const touch = e.changedTouches[0];
    joystickTouchId.current = touch.identifier;
    joystickBase.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (joystickTouchId.current === null || !joystickBase.current) return;
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === joystickTouchId.current) {
        const dx = touch.clientX - joystickBase.current.x;
        const dy = touch.clientY - joystickBase.current.y;
        const dist = Math.hypot(dx, dy);
        const maxRadius = 50;

        if (dist > 0) {
          gameStateRef.current.touchDir = {
            x: (dx / Math.max(dist, maxRadius)),
            y: (dy / Math.max(dist, maxRadius)),
          };
        }
      }
    }
  };

  const handleTouchEnd = () => {
    joystickTouchId.current = null;
    joystickBase.current = null;
    gameStateRef.current.touchDir = { x: 0, y: 0 };
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const camX = gameStateRef.current.playerPos.x - rect.width / 2;
    const camY = gameStateRef.current.playerPos.y - rect.height / 2;

    const clickWorldX = clickX + camX;
    const clickWorldY = clickY + camY;

    // Check if user clicked on any chest
    const clickedChest = gameStateRef.current.chests.find((c) => {
      const dist = Math.hypot(clickWorldX - c.x, clickWorldY - c.y);
      return dist < 65;
    });

    if (clickedChest && !clickedChest.opened) {
      handleOpenChest(clickedChest);
    }
  };

  return (
    <div
      className="relative w-full h-full overflow-hidden select-none touch-none bg-[#121410]"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
            {/* CSS Hardware Accelerated Background Layer */}
      <div 
        ref={bgRef}
        className="absolute inset-0 pointer-events-none z-0 transition-none"
        style={{
          backgroundImage: `
            url(${resolveAssetUrl('/src/assets/images/xuanqing_cuizhu_bamboo_1785403739205.jpg')}), 
            url(${resolveAssetUrl('/src/assets/images/xianling_gusong_1785397465154.jpg')}),
            url(${resolveAssetUrl('/src/assets/images/jiuqu_ginseng_sprite_1785398296504.jpg')})
          `,
          backgroundSize: '250px 250px, 400px 400px, 600px 600px',
          backgroundPosition: '0px 0px, 0px 0px, 0px 0px',
          backgroundRepeat: 'repeat, repeat, repeat',
          opacity: 0.15,
          mixBlendMode: 'screen',
          willChange: 'background-position',
          transform: 'translateZ(0)'
        }}
      />
      <canvas ref={canvasRef} onClick={handleCanvasClick} className="absolute inset-0 w-full h-full block bg-transparent z-10 cursor-pointer" />
      <WeatherOverlay mapId={currentMap.id} />

      {/* Top Center Main Battle Control Panel - Perfectly centered, unblocked by HUD */}
      <div className="absolute top-2 sm:top-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 sm:gap-2 bg-[#181a17]/95 border-2 border-[#e9c176]/80 px-3 py-1.5 rounded-2xl shadow-2xl backdrop-blur-md pointer-events-auto max-w-[95vw] overflow-x-auto custom-scrollbar">
        {/* Map Name & Coordinates Badge */}
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-xl bg-[#232620] border border-[#444a41] text-[10px] sm:text-xs shrink-0">
          <Compass className="w-3.5 h-3.5 text-[#a1d1b4] animate-spin-slow" />
          <span className="text-[#8b938c] hidden xs:inline">{currentMap.name}</span>
          <span className="font-bold text-[#e9c176]">
            📍 X:{Math.floor(gameStateRef.current.playerPos.x)} Y:{Math.floor(gameStateRef.current.playerPos.y)}
          </span>
        </div>

        {/* Kill Count Badge */}
        <div className="hidden md:flex items-center gap-1.5 px-2 py-1 rounded-xl bg-[#232620] border border-[#444a41] text-[10px] sm:text-xs shrink-0 text-[#e3e3dc]">
          <Zap className="w-3.5 h-3.5 text-[#e9c176]" />
          <span>斩妖:<strong className="text-[#a1d1b4] ml-0.5">{killCount}</strong></span>
        </div>

        {/* Auto Battle Toggle Button */}
        <button
          onClick={() => {
            setIsAutoBattle(!isAutoBattle);
            sound.playPickup();
          }}
          title={isAutoBattle ? "点击取消挂机，切换为手动操纵" : "点击开启挂机，自动寻找怪物并施法"}
          className={`px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-xl text-[10px] sm:text-xs font-black border transition-all flex items-center gap-1.5 shrink-0 cursor-pointer shadow-md active:scale-95 ${
            isAutoBattle
              ? 'bg-gradient-to-r from-emerald-800 via-green-700 to-emerald-800 text-emerald-100 border-emerald-400 shadow-emerald-500/30'
              : 'bg-[#252822] text-amber-200 border-amber-500/60 hover:border-amber-400'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>{isAutoBattle ? '⚔️ 挂机自动[开]' : '✋ 手动操控[关]'}</span>
        </button>

        {/* Auto Magnet Collect Toggle Button */}
        <button
          onClick={() => {
            const current = player.isAutoMagnetEnabled !== false;
            onUpdatePlayer((prev) => ({ ...prev, isAutoMagnetEnabled: !current }));
            sound.playPickup();
          }}
          title={player.isAutoMagnetEnabled !== false ? "点击关闭自动吸宝" : "点击开启自动磁力吸宝"}
          className={`px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl text-[10px] sm:text-xs font-black border transition-all flex items-center gap-1.5 shrink-0 cursor-pointer shadow-md active:scale-95 ${
            player.isAutoMagnetEnabled !== false
              ? 'bg-gradient-to-r from-amber-700 via-yellow-600 to-amber-700 text-amber-100 border-amber-300 shadow-amber-500/30'
              : 'bg-[#252822] text-[#8b938c] border-[#444a41]'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>{player.isAutoMagnetEnabled !== false ? '🧲 磁力吸宝[开]' : '🧲 磁力吸宝[关]'}</span>
        </button>

        {/* Instant Magnet Collect Pull Button */}
        <button
          onClick={() => {
            if (gameStateRef.current && gameStateRef.current.drops.length > 0) {
              gameStateRef.current.drops.forEach((d) => {
                d.x = gameStateRef.current.playerPos.x;
                d.y = gameStateRef.current.playerPos.y;
              });
              sound.playPickup();
            }
          }}
          title="强吸全场散落的灵石与宝物"
          className="px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-xl bg-[#282a25] hover:bg-[#343830] text-amber-300 border border-amber-500/40 text-[10px] sm:text-xs font-bold transition-all flex items-center gap-1 shrink-0 cursor-pointer active:scale-95"
        >
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline">一键吸宝</span>
        </button>

        {/* Pause Toggle Button */}
        <button
          onClick={() => setIsPaused(!isPaused)}
          className="p-1.5 sm:p-2 rounded-xl bg-[#252822] border border-[#444a41] text-[#e9c176] hover:text-white transition-colors shrink-0 cursor-pointer"
          title={isPaused ? "继续游戏" : "暂停游戏"}
        >
          {isPaused ? <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Pause className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
        </button>
      </div>

      {/* On Screen Controls / Joystick Indicator */}
      <div className="absolute bottom-6 left-6 pointer-events-none opacity-40 md:opacity-0">
        <div className="w-20 h-20 rounded-full border-2 border-dashed border-[#a1d1b4] flex items-center justify-center">
          <Navigation className="w-5 h-5 text-[#a1d1b4]" />
        </div>
      </div>

      {/* Floating Action Button for Nearby Boss Chest */}
      {nearChest && !nearChest.opened && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-30 pointer-events-auto">
          <button
            onClick={() => handleOpenChest(nearChest)}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 text-[#121410] font-black text-sm border-2 border-amber-200 shadow-2xl shadow-amber-500/50 flex items-center gap-2 hover:scale-105 active:scale-95 transition-all animate-bounce"
          >
            <Sparkles className="w-5 h-5 text-amber-950 animate-spin-slow" />
            <span>靠近【{nearChest.bossName}】宝箱 · 点击 / 按 [E] 开启</span>
          </button>
        </div>
      )}

      {/* Boss Chest Modal */}
      {activeBossChestModal && (
        <BossChestModal
          bossName={activeBossChestModal.bossName}
          lootItems={activeBossChestModal.lootItems}
          onClose={() => {
            const chestId = activeBossChestModal?.chestId;
            if (chestId && gameStateRef.current) {
              gameStateRef.current.chests = gameStateRef.current.chests.filter((c) => c.id !== chestId);
            }
            setActiveBossChestModal(null);
          }}
          onCollectAll={(lootList) => {
            const chestId = activeBossChestModal?.chestId;
            lootList.forEach((loot) => {
              if (loot.type === 'stone' && loot.amount) {
                onUpdatePlayer((prev) => ({ ...prev, spiritStones: prev.spiritStones + loot.amount! }));
              } else if (loot.type === 'core' && loot.amount) {
                onUpdatePlayer((prev) => ({ ...prev, demonCores: prev.demonCores + loot.amount! }));
              } else if (loot.itemData) {
                onItemCollected(loot.itemData);
              }
            });
            if (chestId && gameStateRef.current) {
              gameStateRef.current.chests = gameStateRef.current.chests.filter((c) => c.id !== chestId);
            }
            setActiveBossChestModal(null);
          }}
        />
      )}
    </div>
  );
};
