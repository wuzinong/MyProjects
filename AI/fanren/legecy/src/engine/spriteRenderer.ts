// Custom Sprite Renderer for Xianxia Game Entities
// Renders detailed character models, monsters, pets, flying swords, and items using real images
import { EnemyEntity, Pet, DropItem, RootType, ElementType } from '../types/game';
import { getResourceImage, getAiImageMap, resolveAssetUrl, getItemExactImage, getBossImage } from '../utils/aiImageStore';

// Image cache for preloaded & dynamically loaded artwork
export const gameImageAssets: Record<string, HTMLImageElement> = {};
const canvasImageCache: Record<string, HTMLImageElement> = {};

export function getCachedImage(url?: string): HTMLImageElement | null {
  if (!url) return null;
  const resolved = resolveAssetUrl(url);
  if (canvasImageCache[resolved]) {
    const img = canvasImageCache[resolved];
    return img.complete && img.naturalWidth > 0 ? img : null;
  }
  const img = new Image();
  img.src = resolved;
  canvasImageCache[resolved] = img;
  return null;
}

export function preloadGameAssets() {
  const imagePaths: Record<string, string> = {
    han_li: new URL('../assets/images/han_li_avatar_1785138199866.jpg', import.meta.url).href,
    blood_spider: new URL('../assets/images/enemy_blood_spider_1785143409326.jpg', import.meta.url).href,
    human_face_spider: new URL('../assets/images/enemy_human_face_spider_1785143421439.jpg', import.meta.url).href,
    master_zenith: new URL('../assets/images/enemy_master_zenith_1785143377081.jpg', import.meta.url).href,
    mo_da_fu: new URL('../assets/images/enemy_mo_da_fu_1785143392441.jpg', import.meta.url).href,
    fire_toad: new URL('../assets/images/enemy_fire_toad_1785143437074.jpg', import.meta.url).href,
    silver_python: new URL('../assets/images/enemy_silver_python_1785143449478.jpg', import.meta.url).href,
    two_headed_wolf: new URL('../assets/images/enemy_two_headed_wolf_1785143462471.jpg', import.meta.url).href,
    demon_hooded: new URL('../assets/images/enemy_demon_hooded_1785143480424.jpg', import.meta.url).href,
    ink_dragon: new URL('../assets/images/ink_dragon_boss_1785138244397.jpg', import.meta.url).href,
    green_vial: new URL('../assets/images/green_vial_item_1785138256906.jpg', import.meta.url).href,
    gold_beetle: new URL('../assets/images/gold_beetle_pet_1785138282406.jpg', import.meta.url).href,
    weeping_soul: new URL('../assets/images/weeping_soul_beast_1785138297386.jpg', import.meta.url).href,
    xuantian_sword: new URL('../assets/images/xuantian_sword_1785143501489.jpg', import.meta.url).href,
    xutian_ding: new URL('../assets/images/xutian_ding_1785143511602.jpg', import.meta.url).href,
    seven_flame_fan: new URL('../assets/images/seven_flame_fan_1785143523631.jpg', import.meta.url).href,
    six_winged_centipede: new URL('../assets/images/six_winged_centipede_1785143536605.jpg', import.meta.url).href,
    fa_bao: new URL('../assets/images/xianxia_fa_bao_1785139383923.jpg', import.meta.url).href,
    pets_art: new URL('../assets/images/xianxia_pets_art_1785140369380.jpg', import.meta.url).href,
    spells_art: new URL('../assets/images/xianxia_spells_art_1785140386497.jpg', import.meta.url).href,
    sect_art: new URL('../assets/images/xianxia_sect_art_1785140406211.jpg', import.meta.url).href,
    cuizhu_bamboo: new URL('../assets/images/xuanqing_cuizhu_bamboo_1785403739205.jpg', import.meta.url).href,
    xianling_gusong: new URL('../assets/images/xianling_gusong_1785397465154.jpg', import.meta.url).href,
    xuanfu_lingdao: new URL('../assets/images/xuanfu_lingdao_map_1785398454777.jpg', import.meta.url).href,
    jinji_shan: new URL('../assets/images/jinji_shan_1785397522790.jpg', import.meta.url).href,
    jiuqu_ginseng: new URL('../assets/images/jiuqu_ginseng_sprite_1785398296504.jpg', import.meta.url).href,
    wanyan_lingxi: new URL('../assets/images/wanyan_lingxi_1785397677330.jpg', import.meta.url).href,
    qiankun_ta: new URL('../assets/images/qiankun_ta_1785397640338.jpg', import.meta.url).href,
  };

  Object.entries(imagePaths).forEach(([key, src]) => {
    const img = new Image();
    img.src = src;
    gameImageAssets[key] = img;
    canvasImageCache[src] = img;
  });
}

export interface PlayerDrawOptions {
  realmId?: string;
  playerRoot?: RootType | string;
  playerElements?: ElementType[];
  swordElement?: string;
  weaponCategory?: string;
  equippedWeapon?: any;
  breakthroughCount?: number;
  effectFx?: string;
}

// Draw Standing Spiritual Root Aura based on Five Elements Root (五行灵根常驻环绕光环)
export function drawSpiritualRootAura(
  ctx: CanvasRenderingContext2D,
  rootStr: string,
  elements: ElementType[],
  time: number,
  baseRadius: number = 32
) {
  ctx.save();
  ctx.translate(0, -4);

  const str = rootStr || '金';
  const elemList = elements || [];

  const isTianGold = str.includes('天灵根') || str.includes('天金') || str.includes('金灵根') || elemList.includes('金');
  const isWood = str.includes('木') || elemList.includes('木');
  const isWaterIce = str.includes('水') || str.includes('冰') || elemList.includes('水') || elemList.includes('冰');
  const isFire = str.includes('火') || elemList.includes('火');
  const isEarth = str.includes('土') || elemList.includes('土');
  const isThunder = str.includes('雷') || elemList.includes('雷');

  // 1. 【天灵根 / 金灵根】耀眼金光 (Radiant Golden Light Halo & Beams)
  if (isTianGold) {
    const rayCount = 10;
    ctx.save();
    ctx.rotate(time * 0.9);
    for (let r = 0; r < rayCount; r++) {
      const rayAngle = (r * Math.PI * 2) / rayCount;
      const rayLen = baseRadius + 14 + Math.sin(time * 5 + r) * 5;
      ctx.beginPath();
      ctx.moveTo(Math.cos(rayAngle) * (baseRadius + 2), Math.sin(rayAngle) * (baseRadius + 2));
      ctx.lineTo(Math.cos(rayAngle) * rayLen, Math.sin(rayAngle) * rayLen);
      ctx.strokeStyle = r % 2 === 0 ? 'rgba(250, 204, 21, 0.9)' : 'rgba(254, 240, 138, 0.75)';
      ctx.lineWidth = r % 2 === 0 ? 2.5 : 1.5;
      ctx.shadowColor = '#eab308';
      ctx.shadowBlur = 12;
      ctx.stroke();
    }
    ctx.restore();

    ctx.beginPath();
    ctx.arc(0, 0, baseRadius + 10, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(234, 179, 8, 0.95)';
    ctx.lineWidth = 2.2;
    ctx.shadowColor = '#fde047';
    ctx.shadowBlur = 16;
    ctx.stroke();

    for (let s = 0; s < 5; s++) {
      const sang = time * 2.2 + (s * Math.PI * 2) / 5;
      const sx = Math.cos(sang) * (baseRadius + 16);
      const sy = Math.sin(sang) * (baseRadius + 16);
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#fef08a';
      ctx.fillText('✨', sx, sy);
    }
  }

  // 2. 【木灵根】缠绕的翠绿藤蔓 (Encurling Emerald Green Vines & Leaves)
  if (isWood) {
    ctx.save();
    const vinePoints = 32;
    ctx.beginPath();
    for (let i = 0; i <= vinePoints; i++) {
      const ang = (i * Math.PI * 2) / vinePoints;
      const wave = Math.sin(ang * 5 + time * 3.5) * 5;
      const vx = Math.cos(ang) * (baseRadius + 8 + wave);
      const vy = Math.sin(ang) * (baseRadius + 8 + wave);
      if (i === 0) ctx.moveTo(vx, vy);
      else ctx.lineTo(vx, vy);
    }
    ctx.closePath();
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 3;
    ctx.shadowColor = '#34d399';
    ctx.shadowBlur = 14;
    ctx.stroke();

    for (let l = 0; l < 8; l++) {
      const lang = time * 1.4 + (l * Math.PI * 2) / 8;
      const lx = Math.cos(lang) * (baseRadius + 10);
      const ly = Math.sin(lang) * (baseRadius + 10);
      ctx.save();
      ctx.translate(lx, ly);
      ctx.rotate(lang + Math.PI / 4);
      ctx.beginPath();
      ctx.ellipse(0, 0, 7, 3.5, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#a7f3d0';
      ctx.fill();
      ctx.strokeStyle = '#059669';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();
    }
    ctx.restore();
  }

  // 3. 【水灵根 / 冰灵根】流动的水波 (Flowing Liquid Water Waves & Ripples)
  if (isWaterIce) {
    ctx.save();
    for (let w = 0; w < 2; w++) {
      const wavePhase = time * (3 + w * 1.5) + w * Math.PI;
      ctx.beginPath();
      const numPts = 36;
      for (let p = 0; p <= numPts; p++) {
        const ang = (p * Math.PI * 2) / numPts;
        const waveRadius = baseRadius + (w === 0 ? 6 : 14) + Math.sin(ang * 6 + wavePhase) * (4 + w * 2);
        const wx = Math.cos(ang) * waveRadius;
        const wy = Math.sin(ang) * waveRadius;
        if (p === 0) ctx.moveTo(wx, wy);
        else ctx.lineTo(wx, wy);
      }
      ctx.closePath();
      ctx.strokeStyle = w === 0 ? 'rgba(56, 189, 248, 0.9)' : 'rgba(125, 211, 252, 0.7)';
      ctx.lineWidth = 2.2;
      ctx.shadowColor = '#0284c7';
      ctx.shadowBlur = 12;
      ctx.stroke();
    }

    for (let d = 0; d < 6; d++) {
      const dang = time * 2.5 + (d * Math.PI * 2) / 6;
      const dx = Math.cos(dang) * (baseRadius + 12);
      const dy = Math.sin(dang) * (baseRadius + 12);
      ctx.beginPath();
      ctx.arc(dx, dy, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = '#bae6fd';
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 10;
      ctx.fill();
    }
    ctx.restore();
  }

  // 4. 【火灵根】烈焰升腾 (Blazing Crimson Flame Aura)
  if (isFire) {
    ctx.save();
    const flameCount = 10;
    for (let f = 0; f < flameCount; f++) {
      const fang = (f * Math.PI * 2) / flameCount;
      const flameH = 8 + Math.sin(time * 8 + f * 2) * 5;
      const fx = Math.cos(fang) * baseRadius;
      const fy = Math.sin(fang) * baseRadius;

      ctx.beginPath();
      ctx.moveTo(fx, fy);
      ctx.lineTo(fx + Math.cos(fang) * flameH, fy + Math.sin(fang) * flameH - 3);
      ctx.strokeStyle = f % 2 === 0 ? '#ef4444' : '#f97316';
      ctx.lineWidth = 3;
      ctx.shadowColor = '#b91c1c';
      ctx.shadowBlur = 12;
      ctx.stroke();
    }
    ctx.restore();
  }

  // 5. 【土灵根】厚德重土 (Floating Stone Runes)
  if (isEarth) {
    ctx.save();
    ctx.shadowColor = '#b45309';
    ctx.shadowBlur = 12;
    for (let i = 0; i < 4; i++) {
      const sang = time * 1.5 + (i * Math.PI) / 2;
      const sx = Math.cos(sang) * (baseRadius + 8);
      const sy = Math.sin(sang) * (baseRadius + 8);
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(sx - 3, sy - 3, 6, 6);
    }
    ctx.restore();
  }

  // 6. 【雷灵根】九天紫雷 (Sparks emitting outward, no heavy outer ring)
  if (isThunder) {
    ctx.save();
    ctx.shadowColor = '#a855f7';
    ctx.shadowBlur = 15;
    for (let k = 0; k < 5; k++) {
      const sang = time * 4 + (k * Math.PI * 2) / 5;
      const innerR = baseRadius * 0.4;
      const outerR = baseRadius + 8 + (Math.random() - 0.5) * 4;
      ctx.beginPath();
      ctx.moveTo(Math.cos(sang) * innerR, Math.sin(sang) * innerR);
      ctx.lineTo(Math.cos(sang) * outerR, Math.sin(sang) * outerR);
      ctx.strokeStyle = k % 2 === 0 ? '#c084fc' : '#e9d5ff';
      ctx.lineWidth = 1.8;
      ctx.stroke();
    }
    ctx.restore();
  }

  ctx.restore();
}

// 1. Draw Player Character - Han Li (韩立) with Dynamic Aura & Fancy Upgrades
export function drawPlayerSprite(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  name: string,
  title: string,
  moveAngle: number,
  isMoving: boolean,
  time: number,
  options?: PlayerDrawOptions
) {
  ctx.save();
  ctx.translate(x, y);

  const element = options?.swordElement || '金';
  const realmId = options?.realmId || 'realm_1';
  const btCount = options?.breakthroughCount || 0;

  // Determine realm tier (1..9)
  const realmTier = parseInt(realmId.replace('realm_', ''), 10) || 1;

  // Element Color Scheme Mapping for Aura
  const auraColorsMap: Record<string, { main: string; glow: string; secondary: string }> = {
    '金': { main: '#facc15', glow: '#eab308', secondary: '#fef08a' },
    '木': { main: '#34d399', glow: '#059669', secondary: '#a7f3d0' },
    '水': { main: '#38bdf8', glow: '#0284c7', secondary: '#bae6fd' },
    '冰': { main: '#7dd3fc', glow: '#0284c7', secondary: '#f0f9ff' },
    '火': { main: '#ef4444', glow: '#b91c1c', secondary: '#fca5a5' },
    '土': { main: '#fbbf24', glow: '#b45309', secondary: '#fde68a' },
    '雷': { main: '#c084fc', glow: '#7e22ce', secondary: '#f5d0fe' },
    '辟邪神雷': { main: '#e879f9', glow: '#a855f7', secondary: '#fef08a' },
    '风': { main: '#2dd4bf', glow: '#0f766e', secondary: '#99f6e4' },
    '暗': { main: '#a855f7', glow: '#581c87', secondary: '#cbd5e1' },
    '光': { main: '#fef08a', glow: '#ca8a04', secondary: '#ffffff' },
    '时间': { main: '#34d399', glow: '#047857', secondary: '#a7f3d0' },
    '空间': { main: '#ec4899', glow: '#be185d', secondary: '#fbcfe8' },
    '毒': { main: '#84cc16', glow: '#4d7c0f', secondary: '#d9f99d' },
    '血': { main: '#dc2626', glow: '#991b1b', secondary: '#fca5a5' },
    '玄天': { main: '#e879f9', glow: '#a855f7', secondary: '#38bdf8' },
  };

  const colors = auraColorsMap[element] || auraColorsMap['金'];

  // 1. Outer Floating Lotus Pedestal (九品金莲/青莲) for Higher Realms or Post-Tribulation
  if (realmTier >= 2 || btCount > 0) {
    ctx.save();
    ctx.translate(0, 16);
    const lotusPetals = 8 + Math.min(8, btCount * 2);
    const lotusRadius = 28 + Math.min(22, realmTier * 3 + btCount * 4);
    for (let p = 0; p < lotusPetals; p++) {
      const pAng = (p * Math.PI * 2) / lotusPetals + time * (0.8 + btCount * 0.2);
      const px = Math.cos(pAng) * lotusRadius;
      const py = Math.sin(pAng) * (lotusRadius * 0.4);

      ctx.beginPath();
      ctx.ellipse(px, py, 11, 6, pAng, 0, Math.PI * 2);
      ctx.fillStyle = btCount > 0 ? `${colors.main}50` : realmTier >= 5 ? 'rgba(234, 179, 8, 0.45)' : 'rgba(52, 211, 153, 0.4)';
      ctx.fill();
      ctx.strokeStyle = colors.main;
      ctx.lineWidth = 1.2;
      ctx.stroke();
    }
    ctx.restore();
  }

  // 2. Dynamic Multi-Layered Rotating 8-Trigram Rune Ring (八卦道纹光圈与九天飞剑环绕)
  const auraBaseRadius = 28 + Math.min(26, realmTier * 4 + btCount * 5);
  const auraPulse = Math.sin(time * 4) * 3.5;
  const currentRadius = auraBaseRadius + auraPulse;

  // Outer Secondary Ambient Glow Ring
  ctx.beginPath();
  ctx.arc(0, -4, currentRadius + 6, 0, Math.PI * 2);
  ctx.strokeStyle = `${colors.secondary}60`;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Primary Outer Glowing Aura Ring
  ctx.beginPath();
  ctx.arc(0, -4, currentRadius, 0, Math.PI * 2);
  ctx.fillStyle = `${colors.glow}25`;
  ctx.fill();
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = colors.main;
  ctx.shadowColor = colors.glow;
  ctx.shadowBlur = 18 + realmTier * 2 + btCount * 4;
  ctx.stroke();
  ctx.shadowBlur = 0;

  // 2.5 Permanent Standing Five Elements Root Aura Effect (常驻五行灵根环绕光环)
  drawSpiritualRootAura(
    ctx,
    options?.playerRoot ? options.playerRoot.toString() : '',
    options?.playerElements || [],
    time,
    currentRadius
  );

  // Orbiting Mini Flying Swords on Aura Ring if player has weapons or btCount > 0
  const swordOrbitCount = Math.min(8, 3 + btCount * 2);
  for (let s = 0; s < swordOrbitCount; s++) {
    const sAng = time * 2.2 + (s * Math.PI * 2) / swordOrbitCount;
    const sx = Math.cos(sAng) * (currentRadius + 2);
    const sy = Math.sin(sAng) * (currentRadius + 2) - 4;

    ctx.save();
    ctx.translate(sx, sy);
    ctx.rotate(sAng + Math.PI / 2);
    ctx.beginPath();
    ctx.moveTo(0, -7);
    ctx.lineTo(3, 5);
    ctx.lineTo(0, 3);
    ctx.lineTo(-3, 5);
    ctx.closePath();
    ctx.fillStyle = colors.secondary;
    ctx.fill();
    ctx.strokeStyle = colors.main;
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();
  }

  // Rotating Trigram Symbols on Outer Ring for Higher Realms
  if (realmTier >= 2) {
    ctx.save();
    ctx.translate(0, -4);
    ctx.rotate(time * 1.2);
    const trigrams = ['☰', '☱', '☲', '☳', '☴', '☵', '☶', '☷'];
    ctx.font = '9px serif';
    ctx.fillStyle = colors.main;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    trigrams.forEach((tri, idx) => {
      const ang = (idx * Math.PI * 2) / 8;
      const tx = Math.cos(ang) * (currentRadius + 4);
      const ty = Math.sin(ang) * (currentRadius + 4);
      ctx.fillText(tri, tx, ty);
    });
    ctx.restore();
  }

  // 3. Swirling Qi Particles around Body (灵气飘拂)
  const particleCount = 4 + Math.min(6, realmTier);
  for (let i = 0; i < particleCount; i++) {
    const pAng = time * (2 + (i % 2) * 1.5) + (i * Math.PI * 2) / particleCount;
    const px = Math.cos(pAng) * (currentRadius - 6);
    const py = Math.sin(pAng) * (currentRadius - 6) - 4;

    ctx.beginPath();
    ctx.arc(px, py, 2.5 + (i % 2), 0, Math.PI * 2);
    ctx.fillStyle = i % 2 === 0 ? colors.main : colors.secondary;
    ctx.shadowColor = colors.glow;
    ctx.shadowBlur = 8;
    ctx.fill();
  }
  ctx.shadowBlur = 0;

  // 4. Immortal Wings (仙道翎羽) for High Realm / Post-Breakthrough
  if (realmTier >= 4 || btCount > 0) {
    ctx.save();
    ctx.translate(0, -10);

    // Left & Right Glowing Wing Arcs
    [-1, 1].forEach((dir) => {
      ctx.beginPath();
      ctx.moveTo(0, 0);
      const wingFlap = Math.sin(time * 3) * 6;
      ctx.quadraticCurveTo(dir * 35, -25 + wingFlap, dir * 45, 5 + wingFlap);
      ctx.quadraticCurveTo(dir * 25, 10, 0, 0);

      ctx.fillStyle = realmTier >= 6 ? 'rgba(232, 121, 249, 0.35)' : 'rgba(250, 204, 21, 0.35)';
      ctx.fill();
      ctx.strokeStyle = colors.main;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });

    ctx.restore();
  }

  // 5. Select Character Image (Fancy Ascended Artwork on High Realms / BT)
  let imgUrl = getResourceImage('char_han_li') || '/src/assets/images/han_li_avatar_1785138199866.jpg';

  if (realmTier >= 5 || btCount >= 2) {
    // Switch to fancy ascended immortal avatar image
    imgUrl = gameImageAssets['xuantian_sword']?.src || gameImageAssets['master_zenith']?.src || imgUrl;
  }

  const img = getCachedImage(imgUrl) || gameImageAssets['han_li'];

  if (img) {
    // Round portrait token with glowing double border
    ctx.save();
    ctx.beginPath();
    ctx.arc(0, -4, 22, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(img, -22, -26, 44, 44);
    ctx.restore();

    // Golden & Elemental double ring frame
    ctx.beginPath();
    ctx.arc(0, -4, 22, 0, Math.PI * 2);
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = colors.main;
    ctx.shadowColor = colors.glow;
    ctx.shadowBlur = 12;
    ctx.stroke();

    // Immortal Crown Emblem above head
    if (realmTier >= 4) {
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('👑', 0, -30);
    }
  } else {
    // Vector Model Fallback
    const legOffset = isMoving ? Math.sin(time * 12) * 5 : 0;
    ctx.fillStyle = '#1e3a2b';
    ctx.beginPath();
    ctx.moveTo(-10, 2);
    ctx.lineTo(10, 2);
    ctx.lineTo(14, 16 + legOffset);
    ctx.lineTo(-14, 16 - legOffset);
    ctx.closePath();
    ctx.fill();
  }

  // 4.5. Draw Equipped Weapon in Hand
  if (options?.equippedWeapon) {
    const w = options.equippedWeapon;
    const wImgUrl = getResourceImage(w.id, w.icon, w.name, w.category);
    const wImg = getCachedImage(wImgUrl);
    ctx.save();
    const bob = isMoving ? Math.sin(time * 12) * 4 : Math.sin(time * 3) * 2;
    // Position on the right hand side
    ctx.translate(18, -4 + bob);
    // Add a slight rotation that rocks back and forth
    ctx.rotate(Math.PI / 6 + Math.sin(time * 2) * 0.15);
    
    // Add an elemental weapon glow
    ctx.shadowColor = colors.glow;
    ctx.shadowBlur = 15;

    if (wImg) {
      // Draw weapon sprite
      ctx.drawImage(wImg, -12, -20, 24, 24);
      
      // Draw an extra highlight ring on the weapon
      ctx.beginPath();
      ctx.arc(0, -8, 14, 0, Math.PI * 2);
      ctx.strokeStyle = `${colors.main}60`;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    } else {
      ctx.fillStyle = colors.main;
      ctx.fillRect(-2, -20, 4, 30);
    }
    ctx.restore();
  }

  // Name & Title Labels with High-Contrast Xianxia Styling
  ctx.fillStyle = colors.main;
  ctx.font = 'bold 12px serif';
  ctx.textAlign = 'center';
  ctx.shadowColor = '#000000';
  ctx.shadowBlur = 4;
  ctx.fillText(name, 0, -36);

  ctx.fillStyle = colors.secondary;
  ctx.font = '10px sans-serif';
  ctx.fillText(`【${title}】`, 0, -49);

  ctx.restore();
}

// 2. Draw Detailed Monster Sprites (Using Real Image Assets with Boss Mechanics)
export function drawMonsterSprite(
  ctx: CanvasRenderingContext2D,
  enemy: EnemyEntity,
  time: number
) {
  ctx.save();
  ctx.translate(enemy.x, enemy.y);

  // Look up image using Boss image resolver or general image registry
  let imgUrl = enemy.isBoss ? getBossImage(enemy.name) : getResourceImage(enemy.id, enemy.icon);
  if (!imgUrl || imgUrl === '/src/assets/images/xianxia_fa_bao_1785139383923.jpg' || imgUrl === '/src/assets/images/xianxia_pets_art_1785140369380.jpg') {
    if (enemy.name.includes('六道极圣')) imgUrl = '/src/assets/images/liudao_jisheng_boss_1785398436630.jpg';
    else if (enemy.name.includes('骷髅若王')) imgUrl = '/src/assets/images/kuluo_ruo_wang_boss_1785398284033.jpg';
    else if (enemy.name.includes('尸皇') || enemy.name.includes('大晋尸皇')) imgUrl = '/src/assets/images/dajin_shihuang_1785397654328.jpg';
    else if (enemy.name.includes('石老魔')) imgUrl = '/src/assets/images/shi_laomo_1785397547867.jpg';
    else if (enemy.name.includes('青阳门少主')) imgUrl = '/src/assets/images/qingyangmen_shaozhu_1785397478445.jpg';
    else if (enemy.name.includes('墨大夫')) imgUrl = '/src/assets/images/enemy_mo_da_fu_1785143396823.jpg';
    else if (enemy.name.includes('金光上人')) imgUrl = '/src/assets/images/enemy_master_zenith_1785143449339.jpg';
    else if (enemy.name.includes('蛛') || enemy.name.includes('血玉')) imgUrl = '/src/assets/images/enemy_blood_spider_1785143409326.jpg';
    else if (enemy.name.includes('蛟') || enemy.name.includes('墨蛟')) imgUrl = '/src/assets/images/ink_dragon_boss_1785138244397.jpg';
    else imgUrl = enemy.isBoss ? '/src/assets/images/liudao_jisheng_boss_1785398436630.jpg' : '/src/assets/images/enemy_demon_hooded_1785143480424.jpg';
  }

  const monsterImg = getCachedImage(imgUrl);
  const hpRatio = Math.max(0, enemy.hp / enemy.maxHp);
  const isRaged = enemy.isRaged || (enemy.isBoss && hpRatio < 0.5);

  // Ground Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.45)';
  ctx.beginPath();
  ctx.ellipse(0, enemy.radius * 0.85, enemy.radius * 0.95, enemy.radius * 0.45, 0, 0, Math.PI * 2);
  ctx.fill();

  if (enemy.isBoss) {
    // 1. Grand Boss Multi-Ring Celestial Aura
    const auraPulse = Math.sin(time * 6) * 4;
    const auraRadius = enemy.radius + 12 + auraPulse;

    // Outer Raged Flame Aura (Crimson Red / Fiery Violet)
    ctx.beginPath();
    ctx.arc(0, 0, auraRadius + 8, 0, Math.PI * 2);
    ctx.fillStyle = isRaged ? 'rgba(239, 68, 68, 0.35)' : 'rgba(234, 179, 8, 0.2)';
    ctx.fill();
    ctx.lineWidth = isRaged ? 3.5 : 2;
    ctx.strokeStyle = isRaged ? '#ef4444' : '#facc15';
    ctx.shadowColor = isRaged ? '#dc2626' : '#eab308';
    ctx.shadowBlur = 20;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Orbiting Boss Energy Runes
    ctx.save();
    ctx.rotate(time * (isRaged ? 3 : 1.5));
    for (let i = 0; i < 6; i++) {
      const ang = (i * Math.PI) / 3;
      const rx = Math.cos(ang) * (auraRadius + 2);
      const ry = Math.sin(ang) * (auraRadius + 2);
      ctx.beginPath();
      ctx.arc(rx, ry, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = isRaged ? '#fca5a5' : '#fef08a';
      ctx.fill();
    }
    ctx.restore();
  } else {
    // Standard Threat Aura
    const auraPulse = Math.sin(time * 5) * 2;
    ctx.beginPath();
    ctx.arc(0, 0, enemy.radius + 4 + auraPulse, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(168, 85, 247, 0.15)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(168, 85, 247, 0.6)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  // 2. Boss Shield Barrier Overlay (If Shield > 0)
  if (enemy.shield && enemy.shield > 0) {
    ctx.beginPath();
    ctx.arc(0, 0, enemy.radius + 8, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(56, 189, 248, 0.25)';
    ctx.fill();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#38bdf8';
    ctx.stroke();
  }

  // 3. Render Monster Image Avatar
  if (monsterImg) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(0, 0, enemy.radius, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(monsterImg, -enemy.radius, -enemy.radius, enemy.radius * 2, enemy.radius * 2);
    ctx.restore();

    // Border Frame
    ctx.beginPath();
    ctx.arc(0, 0, enemy.radius, 0, Math.PI * 2);
    ctx.lineWidth = enemy.isBoss ? 3.5 : 2;
    ctx.strokeStyle = enemy.isBoss ? (isRaged ? '#ef4444' : '#facc15') : '#a855f7';
    ctx.stroke();
  } else {
    ctx.fillStyle = enemy.color || '#475569';
    ctx.beginPath();
    ctx.arc(0, 0, enemy.radius, 0, Math.PI * 2);
    ctx.fill();
  }

  // 4. Boss Name, Title & Health Bar HUD
  if (enemy.isBoss) {
    // Boss Enraged Mode Banner
    if (isRaged) {
      ctx.fillStyle = '#ef4444';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.shadowColor = '#000';
      ctx.shadowBlur = 6;
      ctx.fillText('⚡ 狂暴印记 ⚡', 0, -enemy.radius - 30);
    }

    // Boss Name Label
    ctx.fillStyle = '#facc15';
    ctx.font = 'bold 13px serif';
    ctx.textAlign = 'center';
    ctx.shadowColor = '#000000';
    ctx.shadowBlur = 6;
    ctx.fillText(`【至尊 Boss】${enemy.name}`, 0, -enemy.radius - 14);

    // Boss HP Bar
    const barW = enemy.radius * 2.4;
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.fillRect(-barW / 2, -enemy.radius - 10, barW, 6);
    ctx.fillStyle = isRaged ? '#dc2626' : '#f59e0b';
    ctx.fillRect(-barW / 2, -enemy.radius - 10, barW * hpRatio, 6);
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 1;
    ctx.strokeRect(-barW / 2, -enemy.radius - 10, barW, 6);
  } else {
    // Mob HP Bar & Name
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(-enemy.radius, -enemy.radius - 10, enemy.radius * 2, 4);
    ctx.fillStyle = '#22c55e';
    ctx.fillRect(-enemy.radius, -enemy.radius - 10, enemy.radius * 2 * hpRatio, 4);

    ctx.fillStyle = '#e2e8f0';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(enemy.name, 0, -enemy.radius - 14);
  }

  ctx.restore();
}

// 3. Draw Active Pet (Using Real Image Assets)
export function drawPetSprite(
  ctx: CanvasRenderingContext2D,
  pet: Pet,
  x: number,
  y: number,
  time: number
) {
  ctx.save();
  ctx.translate(x, y);

  const floatY = Math.sin(time * 4) * 3;
  ctx.translate(0, floatY);

  let imgUrl = getResourceImage(pet.id, pet.icon);
  if (!imgUrl || imgUrl === '/src/assets/images/xianxia_fa_bao_1785139383923.jpg') {
    if (pet.name.includes('啼魂')) {
      imgUrl = '/src/assets/images/weeping_soul_beast_1785138297386.jpg';
    } else if (pet.name.includes('噬金虫')) {
      imgUrl = '/src/assets/images/gold_beetle_pet_1785138282406.jpg';
    } else {
      imgUrl = '/src/assets/images/xianxia_pets_art_1785140369380.jpg';
    }
  }

  const petImg = getCachedImage(imgUrl);

  // Divine Pet Aura Ring
  ctx.beginPath();
  ctx.arc(0, 0, 20, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(52, 211, 153, 0.2)';
  ctx.fill();
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = '#34d399';
  ctx.stroke();

  if (petImg) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(0, 0, 16, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(petImg, -16, -16, 32, 32);
    ctx.restore();

    ctx.beginPath();
    ctx.arc(0, 0, 16, 0, Math.PI * 2);
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#facc15';
    ctx.stroke();
  } else {
    ctx.fillStyle = '#34d399';
    ctx.beginPath();
    ctx.arc(0, 0, 14, 0, Math.PI * 2);
    ctx.fill();
  }

  // Label
  ctx.fillStyle = '#f8fafc';
  ctx.font = 'bold 10px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(pet.name, 0, -22);

  ctx.restore();
}

// 4. Draw 20 Custom High-Impact Xianxia Attack FX
export function drawAttackFx(
  ctx: CanvasRenderingContext2D,
  fxType: string,
  x: number,
  y: number,
  radius: number,
  time: number,
  colorOverride?: string
) {
  ctx.save();
  ctx.translate(x, y);

  const glowColor = colorOverride || '#facc15';

  // Helper function to resolve element colors for sword formations and sword beams
  const getElemColors = (col?: string) => {
    if (col === '#facc15' || col === '金' || col === 'gold' || col === '#eab308') {
      return { main: '#facc15', glow: '#eab308', blade: '#fef08a', trail: 'rgba(250, 204, 21, 0.7)', border: '#ca8a04' };
    }
    if (col === '#10b981' || col === '木' || col === 'wood' || col === '#059669') {
      return { main: '#10b981', glow: '#059669', blade: '#a7f3d0', trail: 'rgba(16, 185, 129, 0.7)', border: '#047857' };
    }
    if (col === '#06b6d4' || col === '水' || col === 'water' || col === '#38bdf8') {
      return { main: '#38bdf8', glow: '#0284c7', blade: '#e0f2fe', trail: 'rgba(56, 189, 248, 0.7)', border: '#0369a1' };
    }
    if (col === '#f43f5e' || col === '火' || col === 'fire' || col === '#ef4444') {
      return { main: '#f43f5e', glow: '#dc2626', blade: '#fecdd3', trail: 'rgba(244, 63, 94, 0.7)', border: '#b91c1c' };
    }
    if (col === '#d97706' || col === '土' || col === 'earth' || col === '#f59e0b') {
      return { main: '#f59e0b', glow: '#d97706', blade: '#fef3c7', trail: 'rgba(245, 158, 11, 0.7)', border: '#b45309' };
    }
    if (col === '#14b8a6' || col === '风' || col === 'wind' || col === '#2dd4bf') {
      return { main: '#2dd4bf', glow: '#0d9488', blade: '#ccfbf1', trail: 'rgba(45, 212, 191, 0.7)', border: '#0f766e' };
    }
    // Default Thunder / Emerald Cyan
    return { main: col || '#34d399', glow: '#059669', blade: '#fef08a', trail: 'rgba(52, 211, 153, 0.7)', border: '#047857' };
  };

  const elemColors = getElemColors(colorOverride);

  switch (fxType) {
    case 'pixie_gold_thunder': {
      // 辟邪神雷 - 耀眼金雷电弧爆发与金光法阵
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 3.5;
      ctx.shadowColor = '#facc15';
      ctx.shadowBlur = 18;

      // Rotating inner thunder star
      ctx.save();
      ctx.rotate(time * 6);
      ctx.beginPath();
      for (let i = 0; i < 8; i++) {
        const ang = (i * Math.PI) / 4;
        const r = i % 2 === 0 ? radius * 0.9 : radius * 0.3;
        ctx.lineTo(Math.cos(ang) * r, Math.sin(ang) * r);
      }
      ctx.closePath();
      ctx.fillStyle = 'rgba(254, 240, 138, 0.35)';
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      // Jagged lightning arcs
      for (let k = 0; k < 4; k++) {
        const rot = (k * Math.PI) / 2 + Math.sin(time * 10) * 0.2;
        ctx.save();
        ctx.rotate(rot);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(radius * 0.3, -radius * 0.4);
        ctx.lineTo(radius * 0.5, radius * 0.1);
        ctx.lineTo(radius * 0.8, -radius * 0.3);
        ctx.lineTo(radius * 1.1, 0);
        ctx.stroke();
        ctx.restore();
      }
      break;
    }

    case 'flying_sword_beam': {
      // 飞剑剑芒 - 凌厉飞剑长虹贯日 (根据元素变色)
      ctx.shadowColor = elemColors.main;
      ctx.shadowBlur = 15;

      // Long Sword Light Trail
      ctx.beginPath();
      ctx.moveTo(-radius * 1.5, 0);
      ctx.lineTo(0, 0);
      ctx.strokeStyle = elemColors.main;
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(-radius * 1.2, 0);
      ctx.lineTo(0, 0);
      ctx.strokeStyle = elemColors.blade;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Sharp Flying Sword Blade
      ctx.save();
      ctx.rotate(Math.PI / 2);
      ctx.beginPath();
      ctx.moveTo(0, -16);
      ctx.lineTo(4, 4);
      ctx.lineTo(0, 2);
      ctx.lineTo(-4, 4);
      ctx.closePath();
      ctx.fillStyle = elemColors.blade;
      ctx.fill();
      ctx.strokeStyle = elemColors.border;
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();
      break;
    }

    // --- 1. 七系飞剑专属独立攻击特效 ---
    case 'sword_beam_jin': {
      // 金系飞剑 - 庚金霹雳长虹 (金色闪电裹剑 + 庚金金光流星)
      ctx.shadowColor = '#facc15';
      ctx.shadowBlur = 22;

      // Golden Lightning trail behind sword
      for (let k = 0; k < 3; k++) {
        const offsetY = (k - 1) * 4;
        ctx.beginPath();
        ctx.moveTo(-radius * 1.8, offsetY);
        ctx.lineTo(-radius * 1.2, offsetY + (Math.random() - 0.5) * 6);
        ctx.lineTo(-radius * 0.5, offsetY + (Math.random() - 0.5) * 6);
        ctx.lineTo(0, offsetY);
        ctx.strokeStyle = k === 1 ? '#ffffff' : '#fef08a';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Golden Sword Blade Head
      ctx.save();
      ctx.rotate(Math.PI / 2);
      ctx.beginPath();
      ctx.moveTo(0, -18);
      ctx.lineTo(5, 6);
      ctx.lineTo(0, 3);
      ctx.lineTo(-5, 6);
      ctx.closePath();
      ctx.fillStyle = '#fef08a';
      ctx.fill();
      ctx.strokeStyle = '#ca8a04';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();
      break;
    }

    case 'sword_beam_mu': {
      // 木系飞剑 - 万木乙木苍藤鞭 (绿色盘旋藤蔓 + 蔓延枝叶 + 翡翠灵叶)
      ctx.shadowColor = '#10b981';
      ctx.shadowBlur = 22;

      // Double-Helix Twisting Green Vines
      for (let v = 0; v < 2; v++) {
        const vineSign = v === 0 ? 1 : -1;
        ctx.beginPath();
        ctx.moveTo(-radius * 1.5, 0);
        for (let x = -radius * 1.5; x <= radius * 0.8; x += 6) {
          const y = Math.sin((x / radius) * 4 + time * 8) * radius * 0.35 * vineSign;
          ctx.lineTo(x, y);
        }
        ctx.strokeStyle = v === 0 ? '#10b981' : '#34d399';
        ctx.lineWidth = 3;
        ctx.stroke();
      }

      // Sprouting Leaves along vine
      for (let i = 0; i < 4; i++) {
        const leafPos = -radius * 1.0 + i * radius * 0.5;
        const leafY = Math.sin((leafPos / radius) * 4 + time * 8) * radius * 0.35;
        ctx.save();
        ctx.translate(leafPos, leafY);
        ctx.rotate(time * 4 + i);
        ctx.beginPath();
        ctx.ellipse(0, 0, 6, 3, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#a7f3d0';
        ctx.fill();
        ctx.strokeStyle = '#047857';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.restore();
      }
      break;
    }

    case 'sword_beam_shui': {
      // 水系飞剑 - 碧海潮生水波斩 (波澜水纹 + 浪涌涟漪 + 水滴点点)
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 22;

      // Concentric Flowing Water Wave Ripples
      const waveCount = 3;
      for (let w = 0; w < waveCount; w++) {
        const waveR = ((time * 25 + w * 12) % 30) + 6;
        ctx.beginPath();
        ctx.arc(0, 0, waveR, -Math.PI * 0.45, Math.PI * 0.45);
        ctx.strokeStyle = `rgba(125, 211, 252, ${1 - waveR / 36})`;
        ctx.lineWidth = 3;
        ctx.stroke();
      }

      // Undulating Water Surge Crescent
      ctx.beginPath();
      ctx.arc(0, 0, radius * 1.0, -Math.PI * 0.4, Math.PI * 0.4);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 4;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(0, 0, radius * 0.75, -Math.PI * 0.35, Math.PI * 0.35);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Splashing Water Droplets
      for (let i = 0; i < 5; i++) {
        const ang = time * 6 + i * 1.25;
        const dx = Math.cos(ang) * radius * 0.65;
        const dy = Math.sin(ang) * radius * 0.45;
        ctx.beginPath();
        ctx.arc(dx, dy, 3, 0, Math.PI * 2);
        ctx.fillStyle = '#e0f2fe';
        ctx.fill();
      }
      break;
    }

    case 'sword_beam_huo': {
      // 火系飞剑 - 丙火红莲神火刺 (炽烈熊熊火焰 + 烈焰舌卷 + 余烬喷涌)
      ctx.shadowColor = '#f97316';
      ctx.shadowBlur = 26;

      // Outer Blazing Flame Aura
      ctx.beginPath();
      ctx.arc(0, 0, radius * 0.8, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(239, 68, 68, 0.35)';
      ctx.fill();

      // Flickering Flame Tongues
      ctx.save();
      for (let f = 0; f < 5; f++) {
        const flameAng = (f * Math.PI * 2) / 5 + Math.sin(time * 12 + f) * 0.2;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(
          Math.cos(flameAng) * radius * 0.8,
          Math.sin(flameAng) * radius * 0.8,
          Math.cos(flameAng + 0.3) * radius * 1.2,
          Math.sin(flameAng + 0.3) * radius * 1.2
        );
        ctx.strokeStyle = f % 2 === 0 ? '#f97316' : '#fef08a';
        ctx.lineWidth = 2.5;
        ctx.stroke();
      }
      ctx.restore();

      // White-hot Blazing Core
      ctx.beginPath();
      ctx.arc(0, 0, radius * 0.35, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 2;
      ctx.stroke();
      break;
    }

    case 'sword_beam_tu': {
      // 土系飞剑 - 泰山陨石巨岩击 (飞天巨石 + 崩山裂石 + 石块飞溅)
      ctx.shadowColor = '#f59e0b';
      ctx.shadowBlur = 20;

      // Tumbling Rock Boulder
      ctx.save();
      ctx.rotate(time * 6); // Tumbling rock rotation

      // Angular Stone Polygon
      ctx.beginPath();
      const numPoints = 6;
      for (let i = 0; i < numPoints; i++) {
        const ang = (i * Math.PI * 2) / numPoints;
        // Irregular rock radius
        const r = radius * (0.65 + (i % 2 === 0 ? 0.25 : -0.15));
        const rx = Math.cos(ang) * r;
        const ry = Math.sin(ang) * r;
        if (i === 0) ctx.moveTo(rx, ry);
        else ctx.lineTo(rx, ry);
      }
      ctx.closePath();
      ctx.fillStyle = '#78350f';
      ctx.fill();
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Stone Crack Lines
      ctx.beginPath();
      ctx.moveTo(-radius * 0.4, -radius * 0.2);
      ctx.lineTo(0, 0);
      ctx.lineTo(radius * 0.4, radius * 0.3);
      ctx.strokeStyle = '#fef3c7';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.restore();

      // Flying Stone Shards around boulder
      for (let s = 0; s < 4; s++) {
        const sang = time * 8 + (s * Math.PI) / 2;
        const sx = Math.cos(sang) * radius * 0.95;
        const sy = Math.sin(sang) * radius * 0.95;
        ctx.fillStyle = '#d97706';
        ctx.fillRect(sx - 2.5, sy - 2.5, 5, 5);
      }
      break;
    }

    case 'sword_beam_lei': {
      // 雷系飞剑 - 九天紫极狂雷剑 (紫色奔雷电光 + 暴风电网)
      ctx.shadowColor = '#c084fc';
      ctx.shadowBlur = 25;

      ctx.rotate(time * 6);
      for (let i = 0; i < 4; i++) {
        const ang = (i * Math.PI) / 2;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(ang) * radius * 1.1, Math.sin(ang) * radius * 1.1);
        ctx.strokeStyle = i % 2 === 0 ? '#e879f9' : '#ffffff';
        ctx.lineWidth = 2.5;
        ctx.stroke();
      }
      break;
    }

    case 'sword_beam_feng': {
      // 风系飞剑 - 九天风刃狂旋 (青色风刃龙卷 + 气流切割)
      ctx.shadowColor = '#2dd4bf';
      ctx.shadowBlur = 20;

      ctx.rotate(-time * 8);
      for (let i = 0; i < 3; i++) {
        const ang = (i * Math.PI * 2) / 3;
        ctx.beginPath();
        ctx.arc(Math.cos(ang) * radius * 0.4, Math.sin(ang) * radius * 0.4, radius * 0.6, ang, ang + Math.PI * 0.8);
        ctx.strokeStyle = '#99f6e4';
        ctx.lineWidth = 3;
        ctx.stroke();
      }
      break;
    }

    // --- 2. 门派与功法专属独立攻击特效 ---
    case 'sect_huangfeng_fx': {
      // 黄枫谷 / 青元剑诀 - 青金剑芒轰击
      ctx.shadowColor = '#34d399';
      ctx.shadowBlur = 20;

      ctx.beginPath();
      ctx.arc(0, 0, radius * 0.85, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(52, 211, 153, 0.2)';
      ctx.fill();

      // Cross Slashes
      ctx.beginPath();
      ctx.moveTo(-radius * 1.1, -radius * 1.1);
      ctx.lineTo(radius * 1.1, radius * 1.1);
      ctx.moveTo(radius * 1.1, -radius * 1.1);
      ctx.lineTo(-radius * 1.1, radius * 1.1);
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 3;
      ctx.stroke();
      break;
    }

    case 'sect_luoyun_fx': {
      // 落云宗 / 冰魄玄功 - 苍蓝冷焰冰晶暴
      ctx.shadowColor = '#0284c7';
      ctx.shadowBlur = 22;

      ctx.rotate(time * 3);
      for (let i = 0; i < 5; i++) {
        const ang = (i * Math.PI * 2) / 5;
        ctx.beginPath();
        ctx.arc(Math.cos(ang) * radius * 0.6, Math.sin(ang) * radius * 0.6, 5, 0, Math.PI * 2);
        ctx.fillStyle = '#e0f2fe';
        ctx.fill();
      }

      ctx.beginPath();
      ctx.arc(0, 0, radius * 0.9, 0, Math.PI * 2);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2.5;
      ctx.stroke();
      break;
    }

    case 'sect_jiyin_fx': {
      // 乱星海 / 极阴岛 - 紫黑鬼火玄煞漩涡
      ctx.shadowColor = '#a855f7';
      ctx.shadowBlur = 24;

      ctx.rotate(-time * 5);
      ctx.beginPath();
      ctx.arc(0, 0, radius * 0.85, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(88, 28, 135, 0.45)';
      ctx.fill();
      ctx.strokeStyle = '#e9d5ff';
      ctx.lineWidth = 2;
      ctx.stroke();
      break;
    }

    case 'sect_moyan_fx': {
      // 魔焰门 / 托天魔功 - 赤黑地狱魔火爆裂
      ctx.shadowColor = '#dc2626';
      ctx.shadowBlur = 24;

      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(185, 28, 28, 0.35)';
      ctx.fill();

      ctx.beginPath();
      ctx.arc(0, 0, radius * 0.5, 0, Math.PI * 2);
      ctx.fillStyle = '#fef08a';
      ctx.fill();
      break;
    }

    case 'sect_wanfa_fx': {
      // 万法门 / 浩然正气功 - 金色天罗棋局与星光直射
      ctx.shadowColor = '#facc15';
      ctx.shadowBlur = 20;

      // Draw Grid
      const s = radius * 0.7;
      ctx.strokeStyle = 'rgba(250, 204, 21, 0.8)';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(-s, -s, s * 2, s * 2);
      ctx.beginPath();
      ctx.moveTo(0, -s); ctx.lineTo(0, s);
      ctx.moveTo(-s, 0); ctx.lineTo(s, 0);
      ctx.stroke();
      break;
    }

    case 'sect_miaoyin_fx': {
      // 妙音门 / 天籁心法 - 七彩音符律动波纹
      const synthColors = ['#ec4899', '#a855f7', '#3b82f6', '#10b981', '#f59e0b'];
      for (let i = 0; i < 4; i++) {
        const r = radius * (0.3 + i * 0.22);
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.strokeStyle = synthColors[i % synthColors.length];
        ctx.lineWidth = 2;
        ctx.stroke();
      }
      break;
    }

    case 'sect_yanyue_fx': {
      // 掩月宗 / 掩月月华诀 - 粉红银月光浪
      ctx.shadowColor = '#f472b6';
      ctx.shadowBlur = 20;

      ctx.beginPath();
      ctx.arc(0, 0, radius * 0.9, -Math.PI * 0.5, Math.PI * 0.5);
      ctx.fillStyle = 'rgba(244, 114, 182, 0.35)';
      ctx.fill();
      ctx.strokeStyle = '#fbcfe8';
      ctx.lineWidth = 2.5;
      ctx.stroke();
      break;
    }

    case 'sect_tianji_fx': {
      // 天极门 / 梵圣真魔功 - 金色梵文大字与三头六臂法印
      ctx.shadowColor = '#fde047';
      ctx.shadowBlur = 22;

      ctx.rotate(time * 2);
      ctx.beginPath();
      ctx.arc(0, 0, radius * 0.8, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(234, 179, 8, 0.3)';
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 16px serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('卍', 0, 0);
      break;
    }

    // --- 3. 灵宠独立专属攻击特效 ---
    case 'pet_gold_beetle_fx': {
      // 噬金虫群狂暴 - 金璀璨庚金虫群轰炸与金酸冲击波
      ctx.shadowColor = '#eab308';
      ctx.shadowBlur = 22;

      // Golden beetles flying in triangle formation
      for (let i = 0; i < 6; i++) {
        const ang = time * 9 + i * 1.05;
        const bx = Math.cos(ang) * radius * 0.7;
        const by = Math.sin(ang) * radius * 0.7;

        ctx.beginPath();
        ctx.ellipse(bx, by, 4.5, 3, ang, 0, Math.PI * 2);
        ctx.fillStyle = '#fef08a';
        ctx.fill();
        ctx.strokeStyle = '#ca8a04';
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }

      ctx.beginPath();
      ctx.arc(0, 0, radius * 0.4, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(250, 204, 21, 0.4)';
      ctx.fill();
      break;
    }

    case 'pet_weeping_soul_fx': {
      // 啼魂兽 / 啼魂王 - 吸魂死光与墨绿鬼啸波
      ctx.shadowColor = '#10b981';
      ctx.shadowBlur = 24;

      ctx.beginPath();
      ctx.arc(0, 0, radius * 0.9, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(5, 150, 105, 0.35)';
      ctx.fill();

      // Inner soul wisp
      ctx.rotate(-time * 4);
      ctx.beginPath();
      ctx.arc(radius * 0.3, 0, 6, 0, Math.PI * 2);
      ctx.fillStyle = '#a7f3d0';
      ctx.fill();
      break;
    }

    case 'pet_ice_phoenix_fx': {
      // 冰凤 - 天蓝冰凤极寒吐息 + 冰晶雪花
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 22;

      ctx.beginPath();
      ctx.arc(0, 0, radius * 0.9, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(56, 189, 248, 0.25)';
      ctx.fill();

      // Snowflake rays
      ctx.rotate(time * 3);
      for (let i = 0; i < 6; i++) {
        const ang = (i * Math.PI) / 3;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(ang) * radius, Math.sin(ang) * radius);
        ctx.strokeStyle = '#e0f2fe';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
      break;
    }

    case 'pet_ink_dragon_fx': {
      // 墨蛟 - 赤黑龙炎烈击 + 暗红蛟龙利爪
      ctx.shadowColor = '#dc2626';
      ctx.shadowBlur = 24;

      ctx.beginPath();
      ctx.arc(0, 0, radius * 0.85, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(153, 27, 27, 0.5)';
      ctx.fill();

      // Dragon claws slashes
      ctx.beginPath();
      ctx.moveTo(-radius * 0.6, -radius * 0.6);
      ctx.lineTo(radius * 0.6, radius * 0.6);
      ctx.moveTo(-radius * 0.6, -radius * 0.2);
      ctx.lineTo(radius * 0.6, radius * 1.0);
      ctx.strokeStyle = '#fca5a5';
      ctx.lineWidth = 3;
      ctx.stroke();
      break;
    }

    case 'pet_purple_python_fx': {
      // 飞天紫纹蟠 - 深紫剧毒雾波
      ctx.shadowColor = '#c084fc';
      ctx.shadowBlur = 22;

      ctx.beginPath();
      ctx.arc(0, 0, radius * 0.9, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(147, 51, 234, 0.4)';
      ctx.fill();
      ctx.strokeStyle = '#f3e8ff';
      ctx.lineWidth = 2;
      ctx.stroke();
      break;
    }

    case 'pet_ginseng_fx': {
      // 九曲灵参 - 纯绿金光生机参气
      ctx.shadowColor = '#34d399';
      ctx.shadowBlur = 20;

      ctx.beginPath();
      ctx.arc(0, 0, radius * 0.8, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(52, 211, 153, 0.35)';
      ctx.fill();
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 2.5;
      ctx.stroke();
      break;
    }

    case 'pet_silver_python_fx': {
      // 双头银蟒 - 双道银白霹雳光束
      ctx.shadowColor = '#e2e8f0';
      ctx.shadowBlur = 22;

      ctx.beginPath();
      ctx.moveTo(-radius * 1.5, -4);
      ctx.lineTo(radius * 1.5, -4);
      ctx.moveTo(-radius * 1.5, 4);
      ctx.lineTo(radius * 1.5, 4);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.stroke();
      break;
    }

    case 'pet_blood_spider_fx': {
      // 血玉蜘蛛 - 赤红血毒蛛网针
      ctx.shadowColor = '#ef4444';
      ctx.shadowBlur = 20;

      ctx.strokeStyle = '#fca5a5';
      ctx.lineWidth = 2;
      for (let r = 0.3; r <= 0.9; r += 0.3) {
        ctx.beginPath();
        ctx.arc(0, 0, radius * r, 0, Math.PI * 2);
        ctx.stroke();
      }
      break;
    }

    case 'qingzhu_sword_array': {
      // 青竹蜂云剑阵 - 稀疏、凌厉、多属性各异之飞剑绝杀剑阵
      ctx.shadowColor = elemColors.main;
      ctx.shadowBlur = 20;

      // 1. 稀疏交错的元素绝杀剑气 (2 Cross Slashes)
      ctx.save();
      for (let s = 0; s < 2; s++) {
        const sang = (s * Math.PI) / 2 + Math.sin(time * 2) * 0.1;
        ctx.save();
        ctx.rotate(sang);
        ctx.beginPath();
        ctx.moveTo(-radius * 1.05, 0);
        ctx.lineTo(radius * 1.05, 0);
        ctx.strokeStyle = elemColors.trail;
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(-radius * 0.7, 0);
        ctx.lineTo(radius * 0.7, 0);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.restore();
      }
      ctx.restore();

      // 2. 外层顺时针盘旋的6柄凌厉飞剑 (Outer Orbiting Swords - 6 Count for perfect breathing room)
      for (let i = 0; i < 6; i++) {
        const ang = time * 4 + (i * Math.PI * 2) / 6;
        const sx = Math.cos(ang) * radius * 0.9;
        const sy = Math.sin(ang) * radius * 0.9;
        ctx.save();
        ctx.translate(sx, sy);
        ctx.rotate(ang + Math.PI / 2);

        // Sword blade
        ctx.beginPath();
        ctx.moveTo(0, -14);
        ctx.lineTo(3.5, 5);
        ctx.lineTo(0, 2.5);
        ctx.lineTo(-3.5, 5);
        ctx.closePath();
        ctx.fillStyle = elemColors.blade;
        ctx.fill();
        ctx.strokeStyle = elemColors.border;
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // Sword light trail
        ctx.beginPath();
        ctx.moveTo(0, 5);
        ctx.lineTo(0, 16);
        ctx.strokeStyle = elemColors.trail;
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.restore();
      }

      // 3. 内层逆时针绞杀的3柄核心飞剑 (Inner Counter-rotating Swords - 3 Count)
      for (let j = 0; j < 3; j++) {
        const jang = -time * 5.5 + (j * Math.PI * 2) / 3;
        const ix = Math.cos(jang) * radius * 0.45;
        const iy = Math.sin(jang) * radius * 0.45;
        ctx.save();
        ctx.translate(ix, iy);
        ctx.rotate(jang + Math.PI); // Pointing towards center

        ctx.beginPath();
        ctx.moveTo(0, -12);
        ctx.lineTo(3, 4);
        ctx.lineTo(0, 2);
        ctx.lineTo(-3, 4);
        ctx.closePath();
        ctx.fillStyle = elemColors.main;
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.restore();
      }
      break;
    }

    case 'qingyuan_sword_slash': {
      // 青元剑诀 / 大庚剑阵 - 巨大的金绿月牙剑气撕裂与冲击波 (干净月牙剑气，无丑圆环)
      ctx.shadowColor = '#10b981';
      ctx.shadowBlur = 22;

      ctx.save();
      ctx.rotate(time * 3);
      // Crescent sword wave
      ctx.beginPath();
      ctx.arc(0, 0, radius * 0.95, -Math.PI * 0.5, Math.PI * 0.5);
      ctx.quadraticCurveTo(radius * 0.15, 0, 0, -radius * 0.95);
      ctx.fillStyle = 'rgba(52, 211, 153, 0.7)';
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#fef08a';
      ctx.stroke();

      // Sharp central slash
      ctx.beginPath();
      ctx.moveTo(-radius * 0.7, -radius * 0.7);
      ctx.lineTo(radius * 0.7, radius * 0.7);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();
      break;
    }

    case 'zhangtian_green_vial': {
      // 掌天瓶灵液 - 绿色流光催熟法阵与点点绿光液滴
      ctx.shadowColor = '#34d399';
      ctx.shadowBlur = 18;

      ctx.beginPath();
      ctx.arc(0, 0, radius * 0.8, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(16, 185, 129, 0.25)';
      ctx.fill();

      // Pulsing green rays
      for (let i = 0; i < 8; i++) {
        const ang = (i * Math.PI) / 4 + time * 2;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(ang) * radius, Math.sin(ang) * radius);
        ctx.strokeStyle = 'rgba(167, 243, 208, 0.7)';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
      break;
    }

    case 'xuantian_spatial_cut': {
      // 玄天斩灵剑 / 虚空斩 - 苍蓝虚空裂缝与天道星光爆裂
      ctx.shadowColor = '#3b82f6';
      ctx.shadowBlur = 25;

      ctx.save();
      ctx.rotate(time * 2);
      // Spatial rift line
      ctx.beginPath();
      ctx.moveTo(-radius * 1.2, 0);
      ctx.lineTo(radius * 1.2, 0);
      ctx.strokeStyle = '#93c5fd';
      ctx.lineWidth = 5;
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(-radius * 1.2, 0);
      ctx.lineTo(radius * 1.2, 0);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Cross rift
      ctx.beginPath();
      ctx.moveTo(0, -radius * 0.7);
      ctx.lineTo(0, radius * 0.7);
      ctx.strokeStyle = '#60a5fa';
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.restore();
      break;
    }

    case 'xutian_cold_flame': {
      // 虚天鼎乾蓝冰焰 - 冰蓝色冷焰环绕与旋转青铜符文
      ctx.shadowColor = '#06b6d4';
      ctx.shadowBlur = 20;

      // Rotating lotus cold flame
      for (let i = 0; i < 5; i++) {
        const ang = time * 4 + (i * Math.PI * 2) / 5;
        ctx.beginPath();
        ctx.arc(Math.cos(ang) * radius * 0.5, Math.sin(ang) * radius * 0.5, radius * 0.35, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(6, 182, 212, 0.4)';
        ctx.fill();
        ctx.strokeStyle = '#67e8f9';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
      break;
    }

    case 'seven_flame_wave': {
      // 七焰扇七彩火海 - 绚丽七彩烈焰波纹
      const colors = ['#ef4444', '#f97316', '#facc15', '#10b981', '#06b6d4', '#6366f1', '#a855f7'];
      ctx.shadowBlur = 15;

      for (let i = 0; i < colors.length; i++) {
        const r = radius * (0.3 + (i / colors.length) * 0.7);
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.strokeStyle = colors[i];
        ctx.lineWidth = 2.5;
        ctx.shadowColor = colors[i];
        ctx.stroke();
      }
      break;
    }

    case 'ziji_divine_light': {
      // 紫极神光 - 穿透万物的紫金极光长虹 (凝束光线，非粗圆环)
      ctx.shadowColor = '#c084fc';
      ctx.shadowBlur = 22;

      // Laser Beam Shaft
      ctx.beginPath();
      ctx.moveTo(-radius * 1.5, 0);
      ctx.lineTo(radius * 1.5, 0);
      ctx.strokeStyle = '#a855f7';
      ctx.lineWidth = 6;
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(-radius * 1.5, 0);
      ctx.lineTo(radius * 1.5, 0);
      ctx.strokeStyle = '#f3e8ff';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Sharp Beam Tip Star Burst
      ctx.beginPath();
      ctx.arc(radius * 1.2, 0, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      break;
    }

    case 'ice_storm_shard': {
      // 极寒冰暴 / 冰晶风暴 - 六角冰晶雪花与冰霜震波
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 18;

      ctx.rotate(time * 2);
      for (let i = 0; i < 6; i++) {
        const ang = (i * Math.PI) / 3;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(ang) * radius, Math.sin(ang) * radius);
        ctx.strokeStyle = '#e0f2fe';
        ctx.lineWidth = 2.5;
        ctx.stroke();
      }
      break;
    }

    case 'blood_spider_web': {
      // 血玉蛛丝 - 晶莹红芒蛛网缠绕
      ctx.shadowColor = '#ef4444';
      ctx.shadowBlur = 16;

      ctx.strokeStyle = '#fca5a5';
      ctx.lineWidth = 2;
      for (let r = 0.3; r <= 0.9; r += 0.3) {
        ctx.beginPath();
        ctx.arc(0, 0, radius * r, 0, Math.PI * 2);
        ctx.stroke();
      }
      for (let i = 0; i < 8; i++) {
        const ang = (i * Math.PI) / 4;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(ang) * radius, Math.sin(ang) * radius);
        ctx.stroke();
      }
      break;
    }

    case 'demon_soul_wisp': {
      // 阴煞魔气 - 盘旋紫黑鬼影与幽魂漩涡
      ctx.shadowColor = '#a855f7';
      ctx.shadowBlur = 20;

      ctx.rotate(-time * 4);
      for (let i = 0; i < 3; i++) {
        const ang = (i * Math.PI * 2) / 3;
        const offset = Math.sin(time * 5 + i) * 8;
        ctx.beginPath();
        ctx.arc(Math.cos(ang) * (radius * 0.5 + offset), Math.sin(ang) * (radius * 0.5 + offset), radius * 0.3, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(88, 28, 135, 0.6)';
        ctx.fill();
        ctx.strokeStyle = '#d8b4fe';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
      break;
    }

    case 'fire_lotus_bullet': {
      // 爆裂赤莲 - 赤红红莲火球与翻滚余烬
      ctx.shadowColor = '#f97316';
      ctx.shadowBlur = 20;

      // Flame lotus core
      ctx.beginPath();
      ctx.arc(0, 0, radius * 0.65, 0, Math.PI * 2);
      ctx.fillStyle = '#ea580c';
      ctx.fill();

      // Outer petals
      ctx.rotate(time * 5);
      for (let i = 0; i < 8; i++) {
        const ang = (i * Math.PI) / 4;
        ctx.beginPath();
        ctx.arc(Math.cos(ang) * radius * 0.6, Math.sin(ang) * radius * 0.6, radius * 0.25, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(251, 146, 60, 0.7)';
        ctx.fill();
      }
      break;
    }

    case 'golden_beetle_swarm': {
      // 噬金虫群狂暴 - 金灿灿金甲蜂群高速盘旋
      ctx.shadowColor = '#eab308';
      ctx.shadowBlur = 18;

      for (let i = 0; i < 7; i++) {
        const ang = time * 8 + i * 1.1;
        const dist = (i / 7) * radius * 0.8;
        const bx = Math.cos(ang) * dist;
        const by = Math.sin(ang) * dist;

        ctx.beginPath();
        ctx.arc(bx, by, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = '#fef08a';
        ctx.fill();
        ctx.strokeStyle = '#ca8a04';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      break;
    }

    case 'nine_sky_thunder': {
      // 九天神雷 / 劫雷 - 蓝紫双色九天霹雳 (去掉外围丑陋圆圈)
      ctx.shadowColor = '#60a5fa';
      ctx.shadowBlur = 24;

      // Bolt
      ctx.beginPath();
      ctx.moveTo(-radius * 0.5, -radius * 0.8);
      ctx.lineTo(0, -radius * 0.1);
      ctx.lineTo(-radius * 0.2, 0);
      ctx.lineTo(radius * 0.5, radius * 0.8);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 4;
      ctx.stroke();
      break;
    }

    case 'xuan_yin_ghost': {
      // 玄阴百鬼 - 漆黑鬼气百鬼幡阴风
      ctx.shadowColor = '#475569';
      ctx.shadowBlur = 15;

      ctx.beginPath();
      ctx.arc(0, 0, radius * 0.8, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
      ctx.fill();
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 2;
      ctx.stroke();
      break;
    }

    default: {
      // Generic high-grade spell aura with image / fallback
      const spellArtImg = getCachedImage('/src/assets/images/xianxia_spells_art_1785140386497.jpg');
      ctx.shadowColor = glowColor;
      ctx.shadowBlur = 15;

      if (spellArtImg) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(spellArtImg, -radius, -radius, radius * 2, radius * 2);
        ctx.restore();

        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.lineWidth = 2;
        ctx.strokeStyle = glowColor;
        ctx.stroke();
      } else {
        ctx.fillStyle = glowColor;
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }
  }

  ctx.restore();
}


// 5. Renders high-definition Xianxia item drop cards using real image assets
export function drawDropItemSprite(ctx: CanvasRenderingContext2D, drop: any, time: number) {
  ctx.save();
  ctx.translate(drop.x, drop.y);
  
  const floatY = Math.sin(time * 5 + drop.x) * 5;

  let itemTitle = '神秘宝物';
  let rarityColor = '#facc15';
  let beamColorStart = 'rgba(250, 204, 21, 0.45)';
  let beamColorEnd = 'rgba(250, 204, 21, 0)';
  let imgUrl = '';

  const itemObj = drop.itemData || drop.item;

  if (itemObj) {
    itemTitle = itemObj.name || '珍稀宝物';
    imgUrl = getItemExactImage(itemObj.name, itemObj.category, itemObj.icon);
    const r = itemObj.rarity || '';
    if (r.includes('混沌') || r.includes('玄天')) {
      rarityColor = '#f43f5e';
      beamColorStart = 'rgba(244, 63, 94, 0.6)';
    } else if (r.includes('通天') || r.includes('古宝')) {
      rarityColor = '#f59e0b';
      beamColorStart = 'rgba(245, 158, 11, 0.55)';
    } else if (r.includes('极品')) {
      rarityColor = '#eab308';
      beamColorStart = 'rgba(234, 179, 8, 0.5)';
    } else if (r.includes('上品')) {
      rarityColor = '#c084fc';
      beamColorStart = 'rgba(192, 132, 252, 0.45)';
    } else {
      rarityColor = '#60a5fa';
      beamColorStart = 'rgba(96, 165, 250, 0.4)';
    }
  } else if (drop.type === 'stone') {
    itemTitle = `晶石 +${drop.amount || 500}`;
    rarityColor = '#facc15';
    beamColorStart = 'rgba(250, 204, 21, 0.5)';
    imgUrl = getItemExactImage('晶石', 'stone');
  } else if (drop.type === 'core') {
    itemTitle = `妖丹 +${drop.amount || 1}`;
    rarityColor = '#c084fc';
    beamColorStart = 'rgba(192, 132, 252, 0.5)';
    imgUrl = getItemExactImage('独角银蟒精魂', 'material');
  } else if (drop.type === 'exp') {
    itemTitle = `经验 +${drop.amount || 1000}`;
    rarityColor = '#34d399';
    beamColorStart = 'rgba(52, 211, 153, 0.5)';
    imgUrl = getItemExactImage('长春功', 'manual');
  } else {
    itemTitle = '掌天绿液';
    rarityColor = '#22c55e';
    beamColorStart = 'rgba(34, 197, 94, 0.5)';
    imgUrl = getItemExactImage('掌天瓶', 'pill');
  }

  const dropImg = getCachedImage(imgUrl) || gameImageAssets['fa_bao'];

  // 1. Vertical Light Pillar shooting upward to the sky
  const beamGrad = ctx.createLinearGradient(0, 0, 0, -55);
  beamGrad.addColorStop(0, beamColorStart);
  beamGrad.addColorStop(1, beamColorEnd);

  ctx.fillStyle = beamGrad;
  ctx.beginPath();
  ctx.moveTo(-10, 0);
  ctx.lineTo(10, 0);
  ctx.lineTo(16, -55);
  ctx.lineTo(-16, -55);
  ctx.closePath();
  ctx.fill();

  // Ground Magic Circle Base
  ctx.beginPath();
  ctx.ellipse(0, 4, 16, 6, 0, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
  ctx.fill();
  ctx.strokeStyle = rarityColor;
  ctx.lineWidth = 1.2;
  ctx.stroke();

  // Floating Drop Item Avatar Container
  ctx.translate(0, floatY);

  // Outer Glowing Aura
  ctx.beginPath();
  ctx.arc(0, 0, 14, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = rarityColor;
  ctx.shadowColor = rarityColor;
  ctx.shadowBlur = 12;
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Render Image
  if (dropImg) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(0, 0, 12, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(dropImg, -12, -12, 24, 24);
    ctx.restore();
  }

  // Floating Text Badge above drop
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 10px sans-serif';
  ctx.textAlign = 'center';
  ctx.shadowColor = '#000000';
  ctx.shadowBlur = 5;
  ctx.fillText(itemTitle, 0, -20);

  ctx.restore();
}


