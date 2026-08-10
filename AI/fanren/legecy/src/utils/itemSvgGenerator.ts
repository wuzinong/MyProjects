import { resolveAssetUrl } from './aiImageStore';

// Dynamic Xianxia Item Image Resolver - strictly returns real JPG image paths for all items
// Banned vector SVGs per user request

export const REAL_IMAGE_MAP: Record<string, string> = {
  // Batch 1 User Images:
  '九曲灵参': '/src/assets/images/jiuqu_ginseng_1785397409414.jpg',
  '器灵·血灵': '/src/assets/images/qiling_xueling_1785397436637.jpg',
  '器灵血灵': '/src/assets/images/qiling_xueling_1785397436637.jpg',
  '黑风旗': '/src/assets/images/heifeng_qi_1785397451793.jpg',
  '仙灵古松': '/src/assets/images/xianling_gusong_1785397465154.jpg',
  '青阳门少主': '/src/assets/images/qingyangmen_shaozhu_1785397478445.jpg',
  '落尘符': '/src/assets/images/luochen_fu_1785397490406.jpg',
  '火龙符': '/src/assets/images/huolong_fu_1785397502526.jpg',
  '金极山': '/src/assets/images/jinji_shan_1785397522790.jpg',
  '玄天果': '/src/assets/images/xuantian_guo_1785397537133.jpg',
  '石老魔': '/src/assets/images/shi_laomo_1785397547867.jpg',

  // Batch 2 User Images:
  '南宫婉': '/src/assets/images/nangong_wan_1785397564763.jpg',
  '筑基丹': '/src/assets/images/zhuji_dan_1785397582587.jpg',
  '孙二狗': '/src/assets/images/sun_ergou_1785397596390.jpg',
  '金蝉胜天刀': '/src/assets/images/jinchan_dao_1785397613743.jpg',
  '降魔果': '/src/assets/images/jiangmo_guo_1785397628377.jpg',
  '乾坤塔': '/src/assets/images/qiankun_ta_1785397640338.jpg',
  '大晋尸皇': '/src/assets/images/dajin_shihuang_1785397654328.jpg',
  '蜿蜒灵溪': '/src/assets/images/wanyan_lingxi_1785397677330.jpg',
  '天戈符': '/src/assets/images/tiange_fu_1785397689253.jpg',
  '五色扇': '/src/assets/images/wuse_shan_1785397704233.jpg',

  // Batch 3 User Images:
  '洛虹': '/src/assets/images/luo_hong_char_1785398263864.jpg',
  '骷髅若王': '/src/assets/images/kuluo_ruo_wang_boss_1785398284033.jpg',
  '金蝉子母刀符宝': '/src/assets/images/jinchan_zimu_fubao_1785398322737.jpg',
  '器灵·鼎灵': '/src/assets/images/qiling_dingling_1785398335836.jpg',
  '鼎灵': '/src/assets/images/qiling_dingling_1785398335836.jpg',
  '真言化轮功': '/src/assets/images/zhenyan_hualun_gong_1785398351089.jpg',
  '独角银蟒': '/src/assets/images/dujiao_yinmang_1785398363748.jpg',
  '避雷丹': '/src/assets/images/bilei_dan_pill_1785398420674.jpg',
  '六道极圣': '/src/assets/images/liudao_jisheng_boss_1785398436630.jpg',
  '悬浮灵岛': '/src/assets/images/xuanfu_lingdao_map_1785398454777.jpg',

  // Character portraits
  '韩立': '/src/assets/images/han_li_green_robe_1785287057657.jpg',
  '厉飞雨': '/src/assets/images/han_li_avatar_1785138199866.jpg',
  '墨大夫': '/src/assets/images/enemy_mo_da_fu_1785143392441.jpg',
  '金光上人': '/src/assets/images/enemy_master_zenith_1785143377081.jpg',
  '极阴祖师': '/src/assets/images/enemy_master_zenith_1785143377081.jpg',
  '乌丑': '/src/assets/images/enemy_demon_hooded_1785143480424.jpg',

  // Key treasures and pets
  '黄龙丹': '/src/assets/images/huang_long_pill_1785287074674.jpg',
  '掌天瓶': '/src/assets/images/green_vial_item_1785138256906.jpg',
  '瓶灵': '/src/assets/images/green_vial_item_1785138256906.jpg',
  '啼魂兽': '/src/assets/images/weeping_soul_beast_1785138297386.jpg',
  '噬金虫': '/src/assets/images/gold_beetle_pet_1785138282406.jpg',
  '玄天斩灵剑': '/src/assets/images/xuantian_sword_1785143501489.jpg',
  '虚天鼎': '/src/assets/images/xutian_ding_1785143511602.jpg',
  '七皇霸焰扇': '/src/assets/images/seven_flame_fan_1785143523631.jpg',
  '六翼霜蝉': '/src/assets/images/six_winged_centipede_1785143536605.jpg',
  '金瞳火蟾': '/src/assets/images/enemy_fire_toad_1785143437074.jpg',
  '血玉蜘蛛': '/src/assets/images/enemy_blood_spider_1785143409326.jpg',
  '人面蛟蛛': '/src/assets/images/enemy_human_face_spider_1785143421439.jpg',
  '银角玄蟒': '/src/assets/images/enemy_silver_python_1785143449478.jpg',
  '双头魔狼': '/src/assets/images/enemy_two_headed_wolf_1785143462471.jpg',
};

export function getItemSvgDataUrl(name: string, category: string, rarity: string = '法器', element: string = '金'): string {
  let targetPath = '';

  // Check direct matches first
  for (const [key, path] of Object.entries(REAL_IMAGE_MAP)) {
    if (name.includes(key) || key.includes(name)) {
      targetPath = path;
      break;
    }
  }

  if (!targetPath) {
    // Category fallback real images
    if (category === 'talisman' || name.includes('符')) {
      targetPath = '/src/assets/images/xianxia_fu_bao_1785139403887.jpg';
    } else if (category === 'pet' || name.includes('兽') || name.includes('虫')) {
      targetPath = '/src/assets/images/xianxia_pets_art_1785140369380.jpg';
    } else if (category === 'pill' || name.includes('丹')) {
      targetPath = '/src/assets/images/huang_long_pill_1785287074674.jpg';
    } else if (category === 'spell' || name.includes('法')) {
      targetPath = '/src/assets/images/xianxia_spells_art_1785140386497.jpg';
    } else if (category === 'sect') {
      targetPath = '/src/assets/images/xianxia_sect_art_1785140406211.jpg';
    } else {
      targetPath = '/src/assets/images/xianxia_fa_bao_1785139383923.jpg';
    }
  }

  return resolveAssetUrl(targetPath);
}
