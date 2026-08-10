import type React from 'react';
import defaultFallbackAsset from '../assets/images/xianxia_fa_bao_1785139383923.jpg';
import { getItemSvgDataUrl } from './itemSvgGenerator';
import { 
  FLYING_SWORDS_20, MAGIC_INSTRUMENTS_20, INITIAL_INVENTORY, FUBAO_20, TALISMANS_20, 
  SPELLS_20, PETS_20, MANUALS_20, ELEMENTS_20, 
  ATTACK_FX_20, SECTS, MAP_ZONES, CHARACTERS_20 
} from '../data/gameData';

const CACHE_KEY = 'xianxia_ai_resource_images_v1';

export const DEFAULT_FALLBACK_IMAGE = defaultFallbackAsset;

// Dynamic image glob imports for Vite bundling (both relative and root-relative paths)
const globImagesRel = import.meta.glob('../assets/images/*', { eager: true, import: 'default' }) as Record<string, string>;
const globImagesAbs = import.meta.glob('/src/assets/images/*', { eager: true, import: 'default' }) as Record<string, string>;

const BUNDLED_IMAGE_MAP: Record<string, string> = {};

function addGlobEntry(path: string, url: string) {
  if (!path || !url) return;
  BUNDLED_IMAGE_MAP[path] = url;
  
  const filenameWithQuery = path.split('/').pop();
  if (!filenameWithQuery) return;
  const filename = filenameWithQuery.split('?')[0];

  BUNDLED_IMAGE_MAP[filename] = url;
  BUNDLED_IMAGE_MAP[`/src/assets/images/${filename}`] = url;
  BUNDLED_IMAGE_MAP[`src/assets/images/${filename}`] = url;
  BUNDLED_IMAGE_MAP[`./assets/images/${filename}`] = url;
  BUNDLED_IMAGE_MAP[`../assets/images/${filename}`] = url;
  BUNDLED_IMAGE_MAP[`assets/images/${filename}`] = url;

  const dotIdx = filename.lastIndexOf('.');
  if (dotIdx > 0) {
    const nameWithoutExt = filename.substring(0, dotIdx);
    BUNDLED_IMAGE_MAP[nameWithoutExt] = url;
  }
}

for (const [path, url] of Object.entries(globImagesRel)) {
  addGlobEntry(path, url);
}
for (const [path, url] of Object.entries(globImagesAbs)) {
  addGlobEntry(path, url);
}

export function resolveAssetUrl(url: string | undefined): string {
  if (!url) return DEFAULT_FALLBACK_IMAGE;
  if (url.startsWith('data:') || url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  if (BUNDLED_IMAGE_MAP[url]) {
    return BUNDLED_IMAGE_MAP[url];
  }

  const cleanUrl = url.split('?')[0];
  if (BUNDLED_IMAGE_MAP[cleanUrl]) {
    return BUNDLED_IMAGE_MAP[cleanUrl];
  }

  const filename = cleanUrl.split('/').pop();
  if (filename && BUNDLED_IMAGE_MAP[filename]) {
    return BUNDLED_IMAGE_MAP[filename];
  }

  if (filename) {
    const dotIdx = filename.lastIndexOf('.');
    if (dotIdx > 0) {
      const nameNoExt = filename.substring(0, dotIdx);
      if (BUNDLED_IMAGE_MAP[nameNoExt]) {
        return BUNDLED_IMAGE_MAP[nameNoExt];
      }
    }
  }

  if (filename) {
    for (const [key, mapUrl] of Object.entries(BUNDLED_IMAGE_MAP)) {
      if (key.length > 5 && (key.includes(filename) || filename.includes(key))) {
        return mapUrl;
      }
    }
  }

  // CRITICAL FAILSAFE: Never return un-bundled raw strings that cause 404s
  return DEFAULT_FALLBACK_IMAGE;
}

// Universal Image onError Handler with dynamic SVG fallback
export function handleImageError(e: React.SyntheticEvent<HTMLImageElement, Event>, itemName?: string, category?: string) {
  e.currentTarget.onerror = null;
  if (itemName) {
    e.currentTarget.src = getItemExactImage(itemName, category);
  } else {
    e.currentTarget.src = DEFAULT_FALLBACK_IMAGE;
  }
}

// Get precise real image path from assets based on item name and category
export function getItemExactImage(name: string = '', category: string = '', defaultIcon?: string): string {
  if (defaultIcon && !defaultIcon.includes('xianxia_fa_bao_1785139383923.jpg')) {
    return resolveAssetUrl(defaultIcon);
  }

  const n = name.trim();
  const cat = category.toLowerCase();
  let rawPath = '';

  if (cat === 'zone') {
    if (n.includes('神仙谷') || n.includes('灵溪')) rawPath = '/src/assets/images/wanyan_lingxi_1785397677330.jpg';
    else if (n.includes('太南谷') || n.includes('宗门')) rawPath = '/src/assets/images/xianxia_sect_art_1785140406211.jpg';
    else if (n.includes('血色禁地') || n.includes('古松')) rawPath = '/src/assets/images/xianling_gusong_1785397465154.jpg';
    else if (n.includes('虚天殿') || n.includes('庚金')) rawPath = '/src/assets/images/jinji_shan_1785397522790.jpg';
    else if (n.includes('天渊城') || n.includes('镇魔')) rawPath = '/src/assets/images/qiankun_ta_1785397640338.jpg';
    else if (n.includes('青阳门') || n.includes('悬浮')) rawPath = '/src/assets/images/xuanfu_lingdao_map_1785398454777.jpg';
    else if (n.includes('黑风') || n.includes('九曲')) rawPath = '/src/assets/images/jiuqu_ginseng_sprite_1785398296504.jpg';
    else if (n.includes('竹')) rawPath = '/src/assets/images/xuanqing_cuizhu_bamboo_1785403739205.jpg';
    else rawPath = '/src/assets/images/xianxia_fa_bao_1785139383923.jpg';
    return resolveAssetUrl(rawPath);
  }


  // 1. Specific Talismans (符箓)
  if (n.includes('火龙符')) rawPath = '/src/assets/images/huolong_fu_1785397502526.jpg';
  else if (n.includes('落尘符')) rawPath = '/src/assets/images/luochen_fu_1785397490406.jpg';
  else if (n.includes('太乙避劫') || n.includes('天合符') || n.includes('六丁六甲')) rawPath = '/src/assets/images/tiange_fu_1785397689253.jpg';

  // 2. Specific Fubao (符宝)
  else if (n.includes('金蟾') || n.includes('子母符宝')) rawPath = '/src/assets/images/jinchan_zimu_fubao_1785398322737.jpg';

  // 3. Specific Pills & Herbs (丹药 / 灵草)
  else if (n.includes('黄龙丹')) rawPath = '/src/assets/images/huang_long_pill_1785287074674.jpg';
  else if (n.includes('筑基丹')) rawPath = '/src/assets/images/zhuji_dan_1785397582587.jpg';
  else if (n.includes('避雷丹')) rawPath = '/src/assets/images/bilei_dan_pill_1785398420674.jpg';
  else if (n.includes('掌天瓶') || n.includes('绿液')) rawPath = '/src/assets/images/green_vial_item_1785138256906.jpg';
  else if (n.includes('灵参') || n.includes('九曲')) rawPath = '/src/assets/images/jiuqu_ginseng_1785397409414.jpg';
  else if (n.includes('玄天果')) rawPath = '/src/assets/images/xuantian_guo_1785397537133.jpg';
  else if (n.includes('降魔果')) rawPath = '/src/assets/images/jiangmo_guo_1785397628377.jpg';
  else if (n.includes('仙灵古松') || n.includes('松')) rawPath = '/src/assets/images/xianling_gusong_1785397465154.jpg';
  else if (n.includes('雪灵草') || n.includes('芝')) rawPath = '/src/assets/images/qiling_xueling_1785397436637.jpg';

  // 4. Weapons, Magic Treasures & Instruments (法宝 / 飞剑 / 法器)
  else if (n.includes('黑风旗')) rawPath = '/src/assets/images/heifeng_qi_1785397451793.jpg';
  else if (n.includes('金极山') || n.includes('金山')) rawPath = '/src/assets/images/jinji_shan_1785397522790.jpg';
  else if (n.includes('乾坤塔') || n.includes('琉璃塔')) rawPath = '/src/assets/images/qiankun_ta_1785397640338.jpg';
  else if (n.includes('金蝉刀') || n.includes('金蟾刀') || n.includes('斩灵刀')) rawPath = '/src/assets/images/jinchan_dao_1785397613743.jpg';
  else if (n.includes('五色扇') || n.includes('疾风九天扇')) rawPath = '/src/assets/images/wuse_shan_1785397704233.jpg';
  else if (n.includes('七焰扇')) rawPath = '/src/assets/images/seven_flame_fan_1785143523631.jpg';
  else if (n.includes('玄天斩灵剑')) rawPath = '/src/assets/images/xuantian_zhanling_sword_1785398310509.jpg';
  else if (n.includes('玄天剑') || n.includes('青竹') || n.includes('飞剑')) rawPath = '/src/assets/images/xuantian_sword_1785143501489.jpg';
  else if (n.includes('虚天鼎') || n.includes('鼎')) rawPath = '/src/assets/images/xutian_ding_1785143511602.jpg';

  // 5. Cultivation Manuals (功法)
  else if (n.includes('真言化轮') || n.includes('真言')) rawPath = '/src/assets/images/zhenyan_hualun_gong_1785398351089.jpg';
  else if (n.includes('功法') || n.includes('诀') || n.includes('经')) rawPath = '/src/assets/images/xianxia_spells_art_1785140386497.jpg';

  // 6. Pets & Beast Monsters & Bosses
  else if (n.includes('六道极圣')) rawPath = '/src/assets/images/liudao_jisheng_boss_1785398436630.jpg';
  else if (n.includes('骷髅若王')) rawPath = '/src/assets/images/kuluo_ruo_wang_boss_1785398284033.jpg';
  else if (n.includes('尸皇') || n.includes('大晋尸皇')) rawPath = '/src/assets/images/dajin_shihuang_1785397654328.jpg';
  else if (n.includes('石老魔')) rawPath = '/src/assets/images/shi_laomo_1785397547867.jpg';
  else if (n.includes('青阳门少主')) rawPath = '/src/assets/images/qingyangmen_shaozhu_1785397478445.jpg';
  else if (n.includes('墨大夫')) rawPath = '/src/assets/images/enemy_mo_da_fu_1785143396823.jpg';
  else if (n.includes('金光上人')) rawPath = '/src/assets/images/enemy_master_zenith_1785143449339.jpg';
  else if (n.includes('啼魂') || n.includes('血灵')) rawPath = '/src/assets/images/weeping_soul_beast_1785138297386.jpg';
  else if (n.includes('噬金虫')) rawPath = '/src/assets/images/gold_beetle_pet_1785138282406.jpg';
  else if (n.includes('六翼霜蚣') || n.includes('蜈蚣')) rawPath = '/src/assets/images/six_winged_centipede_1785143536605.jpg';
  else if (n.includes('蜘蛛') || n.includes('蛛')) rawPath = '/src/assets/images/enemy_blood_spider_1785143409326.jpg';
  else if (n.includes('墨蛟') || n.includes('蛟')) rawPath = '/src/assets/images/ink_dragon_boss_1785138244397.jpg';
  else if (n.includes('阴蟒') || n.includes('蟒')) rawPath = '/src/assets/images/dujiao_yinmang_1785398363748.jpg';
  else if (n.includes('火蟾') || n.includes('蟾')) rawPath = '/src/assets/images/enemy_fire_toad_1785143437074.jpg';

  // Category fallback
  else if (cat.includes('talisman') || n.includes('符')) rawPath = '/src/assets/images/xianxia_talisman_paper_1785287089444.jpg';
  else if (cat.includes('fubao')) rawPath = '/src/assets/images/xianxia_fu_bao_1785139403887.jpg';
  else if (cat.includes('pill') || n.includes('丹')) rawPath = '/src/assets/images/huang_long_pill_1785287074674.jpg';
  else if (cat.includes('manual') || cat.includes('spell')) rawPath = '/src/assets/images/xianxia_spells_art_1785140386497.jpg';

  if (!rawPath) {
    rawPath = defaultIcon || '/src/assets/images/xianxia_fa_bao_1785139383923.jpg';
  }

  return resolveAssetUrl(rawPath);
}

// Dedicated Boss Image resolver
export function getBossImage(bossName: string = ''): string {
  const n = bossName.trim();
  if (n.includes('马良')) return resolveAssetUrl('/src/assets/images/boss_maliang_1785818130196.jpg');
  if (n.includes('六道极圣')) return resolveAssetUrl('/src/assets/images/liudao_jisheng_boss_1785398436630.jpg');
  if (n.includes('大晋尸皇') || n.includes('尸皇')) return resolveAssetUrl('/src/assets/images/dajin_shihuang_1785397654328.jpg');
  if (n.includes('骷髅若王')) return resolveAssetUrl('/src/assets/images/kuluo_ruo_wang_boss_1785398284033.jpg');
  if (n.includes('乾老魔')) return resolveAssetUrl('/src/assets/images/boss_qian_laomo_1785818117431.jpg');
  if (n.includes('极阴祖师') || n.includes('极阴')) return resolveAssetUrl('/src/assets/images/boss_jiyin_zushi_1785818099587.jpg');
  if (n.includes('风希') || n.includes('裂风')) return resolveAssetUrl('/src/assets/images/boss_fengxi_1785818143269.jpg');
  if (n.includes('雷火甲')) return resolveAssetUrl('/src/assets/images/boss_leihuo_jia_1785818064330.jpg');
  if (n.includes('青阳门少主') || n.includes('青阳')) return resolveAssetUrl('/src/assets/images/qingyangmen_shaozhu_1785397478445.jpg');
  if (n.includes('曲魂')) return resolveAssetUrl('/src/assets/images/boss_qu_hun_1785818076628.jpg');
  if (n.includes('墨大夫') && (n.includes('尸化') || n.includes('煞'))) return resolveAssetUrl('/src/assets/images/boss_mo_da_fu_shihua_1785818089554.jpg');
  if (n.includes('墨大夫')) return resolveAssetUrl('/src/assets/images/enemy_mo_da_fu_1785143392441.jpg');
  if (n.includes('金光上人')) return resolveAssetUrl('/src/assets/images/enemy_master_zenith_1785143377081.jpg');
  if (n.includes('石老魔')) return resolveAssetUrl('/src/assets/images/shi_laomo_1785397547867.jpg');
  if (n.includes('蜘蛛') || n.includes('蛛')) return resolveAssetUrl('/src/assets/images/enemy_blood_spider_1785143409326.jpg');
  if (n.includes('墨蛟') || n.includes('蛟')) return resolveAssetUrl('/src/assets/images/ink_dragon_boss_1785138244397.jpg');
  return getItemExactImage(bossName, 'boss');
}

// Get cached image map from localStorage
export function getAiImageMap(): Record<string, string> {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

// Save image map to localStorage
export function setAiImageMap(map: Record<string, string>) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(map));
  } catch (e) {
    console.error("Failed to save image map", e);
  }
}

// Get image for a specific resource ID
export function getResourceImage(id: string, defaultIcon?: string, name?: string, category?: string): string {
  const map = getAiImageMap();
  if (map[id]) {
    return resolveAssetUrl(map[id]);
  }
  if (name) {
    return getItemExactImage(name, category || '', defaultIcon);
  }
  return resolveAssetUrl(defaultIcon || '/src/assets/images/xianxia_fa_bao_1785139383923.jpg');
}

// Save image for a specific resource
export function setResourceImage(id: string, imageUrl: string) {
  const map = getAiImageMap();
  map[id] = imageUrl;
  setAiImageMap(map);
}

export interface ResourceInfo {
  id: string;
  category: string;
  categoryLabel: string;
  name: string;
  rarity?: string;
  element?: string;
  description: string;
  backgroundStory?: string;
  icon?: string;
}

// Gather ALL resources across all game data definitions
export function getAllGameResources(): ResourceInfo[] {
  const list: ResourceInfo[] = [];
  const seenIds = new Set<string>();

  const addResource = (res: ResourceInfo) => {
    if (!res.id || seenIds.has(res.id)) return;
    seenIds.add(res.id);
    list.push(res);
  };

  // 1. 本命法宝 / 飞剑 / 法器 (FLYING_SWORDS_20 includes MAGIC_TREASURES_20 and MAGIC_INSTRUMENTS_20)
  FLYING_SWORDS_20.forEach(s => {
    addResource({
      id: s.id,
      category: 'swords',
      categoryLabel: '本命法宝/飞剑',
      name: s.name,
      rarity: s.rarity,
      element: s.element,
      description: s.description,
      backgroundStory: s.backgroundStory,
      icon: s.icon,
    });
  });

  // 2. 灵宝 / 装备 / 丹药 (20)
  INITIAL_INVENTORY.forEach(i => {
    addResource({
      id: i.id,
      category: 'items',
      categoryLabel: '灵物丹药/法具',
      name: i.name,
      rarity: i.rarity,
      element: i.element,
      description: i.description,
      icon: i.icon,
    });
  });

  // 3. 符宝 (20)
  FUBAO_20.forEach(f => {
    addResource({
      id: f.id,
      category: 'fubao',
      categoryLabel: '上古符宝',
      name: f.name,
      rarity: f.rarity || '极品法器',
      element: f.element,
      description: f.description,
      backgroundStory: f.backgroundStory,
      icon: f.icon,
    });
  });

  // 4. 符箓 (20)
  TALISMANS_20.forEach(t => {
    addResource({
      id: t.id,
      category: 'talisman',
      categoryLabel: '神仙符箓',
      name: t.name,
      rarity: t.rarity || t.grade,
      element: t.element,
      description: t.description,
      backgroundStory: t.backgroundStory,
      icon: t.icon,
    });
  });

  // 5. 法术 / 神通 (20)
  SPELLS_20.forEach(s => {
    addResource({
      id: s.id,
      category: 'spells',
      categoryLabel: '法术/神通',
      name: s.name,
      rarity: s.rarity || s.type,
      element: s.element,
      description: s.description,
      backgroundStory: s.backgroundStory,
      icon: s.icon,
    });
  });

  // 6. 灵宠 / 灵兽 (20)
  PETS_20.forEach(p => {
    addResource({
      id: p.id,
      category: 'pets',
      categoryLabel: '灵兽/真灵',
      name: p.name,
      rarity: p.rarity || p.type,
      element: p.element,
      description: p.description,
      backgroundStory: p.backgroundStory,
      icon: p.icon,
    });
  });

  // 7. 功法 / 典籍 (20)
  MANUALS_20.forEach(m => {
    addResource({
      id: m.id,
      category: 'manuals',
      categoryLabel: '功法/典籍',
      name: m.name,
      rarity: m.rarity || m.grade,
      element: m.element,
      description: m.description,
      backgroundStory: m.backgroundStory,
      icon: m.icon,
    });
  });

  // 8. 五行 / 属性 (20)
  ELEMENTS_20.forEach((e, index) => {
    addResource({
      id: `elem_${index}_${e.name}`,
      category: 'elements',
      categoryLabel: '五行/法则',
      name: `${e.name}系法则`,
      rarity: '玄天灵宝',
      element: e.name,
      description: e.description,
      icon: e.icon,
    });
  });

  // 9. 攻击特效 (20)
  ATTACK_FX_20.forEach(fx => {
    addResource({
      id: `fx_${fx.key}`,
      category: 'fx',
      categoryLabel: '神通特效',
      name: fx.name,
      rarity: fx.rarity,
      element: fx.element,
      description: fx.description,
      backgroundStory: fx.backgroundStory,
      icon: fx.icon,
    });
  });

  // 10. 宗门
  SECTS.forEach(sec => {
    addResource({
      id: sec.id,
      category: 'sects',
      categoryLabel: '仙门宗派',
      name: sec.name,
      rarity: '天阶',
      description: sec.description,
      backgroundStory: `宗主：${sec.leader} | 地域：${sec.region}`,
      icon: '/src/assets/images/xianxia_sect_art_1785140406211.jpg',
    });
  });

  // 11. 秘境
  const mapZoneImages: Record<string, string> = {
    'MAP001': '/src/assets/images/wanyan_lingxi_1785397677330.jpg',
    'MAP002': '/src/assets/images/xianxia_sect_art_1785140406211.jpg',
    'MAP003': '/src/assets/images/xianling_gusong_1785397465154.jpg',
    'MAP004': '/src/assets/images/jinji_shan_1785397522790.jpg',
    'MAP005': '/src/assets/images/qiankun_ta_1785397640338.jpg',
    'MAP006': '/src/assets/images/xuanfu_lingdao_map_1785398454777.jpg',
    'MAP007': '/src/assets/images/jiuqu_ginseng_sprite_1785398296504.jpg',
  };

  MAP_ZONES.forEach(z => {
    addResource({
      id: z.id,
      category: 'zones',
      categoryLabel: '秘境古迹',
      name: z.name,
      rarity: z.recommendedRealm,
      description: z.description,
      backgroundStory: `守卫领主：${z.bossName} | 产出：${z.drops.join('、')}`,
      icon: mapZoneImages[z.id] || '/src/assets/images/xianxia_fa_bao_1785139383923.jpg',
    });
  });

  // 12. 经典人物 (20)
  CHARACTERS_20.forEach(c => {
    addResource({
      id: c.id,
      category: 'characters',
      categoryLabel: '经典主角人物',
      name: `${c.name} (${c.title})`,
      rarity: '仙阶',
      element: '木',
      description: c.description,
      backgroundStory: `灵根：${c.root} | 特质：${c.specialTrait}`,
      icon: '/src/assets/images/han_li_avatar_1785138199866.jpg',
    });
  });

  return list;
}

// Single Call to Google AI backend to generate image for a resource
export async function generateImageForResource(resource: ResourceInfo, customPrompt?: string): Promise<string> {
  const response = await fetch('/api/generate-resource-image', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: resource.name,
      description: resource.description,
      category: resource.categoryLabel,
      rarity: resource.rarity,
      element: resource.element,
      backgroundStory: resource.backgroundStory,
      customPrompt: customPrompt || '',
    }),
  });

  const data = await response.json();
  if (data.success && data.imageUrl) {
    setResourceImage(resource.id, data.imageUrl);
    return data.imageUrl;
  }
  throw new Error(data.error || 'Google AI 图像生成未返回有效数据');
}
