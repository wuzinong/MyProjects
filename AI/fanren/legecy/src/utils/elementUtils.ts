import { RootType, ElementType } from '../types/game';
import { ELEMENT_COUNTERS } from '../data/gameData';

export function getElementsFromRoot(root: RootType): ElementType[] {
  if (!root) return [];
  const str = root.toString();
  
  if (str.includes('混沌')) return ['混沌'];
  if (str.includes('五灵根')) return ['金', '木', '水', '火', '土'];
  if (str.includes('双灵根')) {
    const elements: ElementType[] = [];
    if (str.includes('金')) elements.push('金');
    if (str.includes('木')) elements.push('木');
    if (str.includes('水')) elements.push('水');
    if (str.includes('火')) elements.push('火');
    if (str.includes('土')) elements.push('土');
    if (elements.length > 0) return elements;
    return ['水', '火']; // fallback
  }
  if (str.includes('天灵根')) {
    if (str.includes('金')) return ['金'];
    if (str.includes('木')) return ['木'];
    if (str.includes('水')) return ['水'];
    if (str.includes('火')) return ['火'];
    if (str.includes('土')) return ['土'];
    return ['木']; // fallback
  }
  if (str.includes('变异')) {
    if (str.includes('雷')) return ['雷'];
    if (str.includes('冰')) return ['冰'];
    if (str.includes('风')) return ['风'];
    if (str.includes('金')) return ['金'];
    if (str.includes('火')) return ['火'];
    return ['雷'];
  }
  if (str.includes('真龙')) return ['水', '雷'];
  if (str.includes('真凤')) return ['火', '风'];
  
  // default parse by chars
  const elements: ElementType[] = [];
  const baseElements: ElementType[] = ['金', '木', '水', '火', '土', '雷', '冰', '风', '毒', '血', '魂', '暗', '光', '空间', '时间'];
  baseElements.forEach(e => {
    if (str.includes(e)) elements.push(e);
  });
  
  return elements.length > 0 ? elements : ['金']; // absolute fallback
}

export function getMonsterElement(name: string): ElementType {
  if (name.includes('火') || name.includes('炎') || name.includes('焰')) return '火';
  if (name.includes('水') || name.includes('冰') || name.includes('寒')) return '水';
  if (name.includes('雷') || name.includes('电') || name.includes('霆')) return '雷';
  if (name.includes('木') || name.includes('林') || name.includes('藤') || name.includes('妖树')) return '木';
  if (name.includes('金') || name.includes('铁') || name.includes('钢') || name.includes('剑')) return '金';
  if (name.includes('土') || name.includes('石') || name.includes('岩') || name.includes('沙')) return '土';
  if (name.includes('毒') || name.includes('蛛') || name.includes('蟾') || name.includes('蛇') || name.includes('蟒')) return '毒';
  if (name.includes('血')) return '血';
  if (name.includes('魂') || name.includes('灵') || name.includes('幻')) return '魂';
  if (name.includes('魔') || name.includes('鬼') || name.includes('煞') || name.includes('幽')) return '暗';
  if (name.includes('光') || name.includes('圣') || name.includes('明')) return '光';
  if (name.includes('风') || name.includes('狼') || name.includes('鸟') || name.includes('鹰')) return '风';
  
  // Hash fallback
  const hash = name.length;
  const defaults: ElementType[] = ['金', '木', '水', '火', '土'];
  return defaults[hash % defaults.length];
}

export function getDamageMultiplier(attackerElements: ElementType[], defenderElement: ElementType): number {
  if (!attackerElements || attackerElements.length === 0 || !defenderElement) return 1.0;
  
  let maxMultiplier = 1.0;
  attackerElements.forEach(atkElem => {
    const table = ELEMENT_COUNTERS[atkElem];
    if (table && table[defenderElement]) {
      const val = table[defenderElement];
      if (val > maxMultiplier) {
        maxMultiplier = val;
      }
    }
  });
  
  // The requirement says: "如果玩家的灵根属性克制当前地图怪物属性，则造成的伤害增加 20%"
  // We can just add +0.2 to the multiplier if it's > 1.0 according to ELEMENT_COUNTERS.
  // Actually, standard counters in ELEMENT_COUNTERS are like 1.5, 1.2, 1.3, etc.
  // If the user specifically wants "增加 20%", we can return 1.2 for ANY counter > 1.0, 
  // or return `Math.max(val, 1.2)` etc.
  // Let's implement literally: if any attacker element counters the defender (val > 1.0), we add 0.2, OR we just replace > 1.0 with 1.2.
  if (maxMultiplier > 1.0) {
    return 1.2;
  }
  if (maxMultiplier < 1.0) {
    return 0.8;
  }
  
  return 1.0;
}
