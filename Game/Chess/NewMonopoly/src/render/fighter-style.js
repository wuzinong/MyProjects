import { GENERALS, LORDS } from '../data/game.js';
import { LORD_ROLES } from '../data/progression.js';
import { skillById } from '../data/skills.js';

const motifs = {
  crescent: '月',
  slash: '锋',
  axe: '斧',
  blades: '刃',
  lance: '龙',
  charge: '骑',
  dash: '疾',
  ambush: '影',
  arrows: '羽',
  fire: '焰',
  storm: '雷',
  ice: '霜',
  wind: '风',
  quake: '岳',
  formation: '阵',
  chains: '锁',
  scroll: '策',
  talisman: '符',
  barrier: '壁',
  shield: '盾',
  heal: '生',
  tide: '涛',
  banner: '旌',
  poison: '鸩',
  mist: '雾',
  tiger: '虎',
};
const weaponColors = ['#aebdc4', '#98cbb9', '#91bede', '#c8a5df', '#edcf8b'];
export function fighterStyle(unit, owner) {
  const lord = unit.gid === -3,
    id = lord ? 90 + owner.lord : unit.gid >= 0 ? unit.gid : 97,
    person = lord ? LORDS[owner.lord] : GENERALS[unit.gid],
    g = lord ? owner.hero : owner.generals.find((g) => g.id === unit.gid),
    weapon = g && owner.items.find((i) => i.id === g.gear[2]),
    base = skillById(lord ? 100 + owner.lord : unit.gid),
    role = lord ? LORD_ROLES[owner.lord] : person?.role;
  const casting = role === 'strategist' || role === 'support';
  return {
    id,
    name: person?.name || unit.name,
    motif: motifs[base?.effect] || '军',
    color: base?.color || '#d4ad63',
    weaponQuality: weapon?.quality ?? -1,
    weaponColor: weaponColors[weapon?.quality ?? 0],
    effect: ['heal', 'shield', 'barrier', 'banner', 'tide'].includes(base?.effect)
      ? ['talisman', 'scroll', 'arrows'][id % 3]
      : base?.effect || (unit.troop === '弓' ? 'arrows' : 'slash'),
    attackName: (casting
      ? ['引符破阵', '流光穿锋', '飞印击敌', '回风断势']
      : unit.troop === '骑'
        ? ['策马冲阵', '回马挑锋', '疾驰破阵', '侧翼突击']
        : unit.troop === '弓'
          ? ['穿云一矢', '飞羽追敌', '引弓破锋', '回弦贯阵']
          : ['横刃斩击', '破甲重击', '跃步劈斩', '回身连锋'])[id % 4],
    casting,
    stance: id % 4,
    path: Math.floor(id / 4) % 4,
    arc: 0.6 + (id % 7) * 0.31,
    sweep: (id % 2 ? -1 : 1) * (0.35 + (id % 5) * 0.18),
    marks: 3 + (id % 6),
    tilt: (((id * 37) % 180) * Math.PI) / 180,
    tempo: 0.88 + (id % 6) * 0.05,
    seal: person?.name?.slice(-1) || '军',
  };
}
