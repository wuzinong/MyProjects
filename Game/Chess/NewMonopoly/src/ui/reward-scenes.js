import { CARDS, GENERALS, EVENTS, ITEMS, QUALITY, QUALITY_COLORS } from '../data/game.js';
import { SKILLS, MANUAL_SKILLS } from '../data/skills.js';
import { RELICS } from '../data/progression.js';
import { equipmentArt, EQUIPMENT_DETAILS } from './equipment-art.js';

// Theme, foreground action, supporting motif, composition and arrival direction.
export const CARD_SCENES = [
  ['春耕入画', 'wheat', 'grow', 'coin', 'field', 'rise'],
  ['粮车出营', 'cart', 'march', 'wheat', 'road', 'left'],
  ['拜帖展卷', 'scroll', 'unroll', 'banner', 'court', 'rise'],
  ['炉火授甲', 'anvil', 'strike', 'spark', 'forge', 'fall'],
  ['药香归营', 'herb', 'sway', 'drop', 'garden', 'rise'],
  ['梁架起立', 'beam', 'build', 'hammer', 'workshop', 'right'],
  ['验符开关', 'permit', 'stamp', 'gate', 'gate', 'split'],
  ['三驿疾驰', 'horse', 'charge', 'arrow', 'road', 'left'],
  ['前哨探路', 'compass', 'orbit', 'horse', 'map', 'right'],
  ['旌旗回营', 'banner', 'sway', 'gate', 'camp', 'fall'],
  ['双车护粮', 'cart', 'escort', 'shield', 'road', 'right'],
  ['兵书传习', 'scroll', 'unroll', 'star', 'study', 'split'],
  ['市桥通商', 'coin', 'trade', 'bridge', 'market', 'left'],
  ['流民安居', 'house', 'build', 'wheat', 'village', 'rise'],
  ['犒军开匣', 'chest', 'open', 'banner', 'camp', 'split'],
  ['军械点验', 'sword', 'draw', 'chest', 'armory', 'fall'],
  ['烈焰焚阵', 'flame', 'burn', 'arrow', 'battle', 'rise'],
  ['重锤破门', 'hammer', 'strike', 'gate', 'gate', 'left'],
  ['金疮敷药', 'bottle', 'pour', 'herb', 'garden', 'right'],
  ['盾列成壁', 'shield', 'wall', 'beam', 'battle', 'rise'],
  ['战刃奋起', 'sword', 'slash', 'banner', 'battle', 'split'],
  ['弦响箭落', 'arrow', 'rain', 'bow', 'battle', 'fall'],
  ['鼓声振军', 'drum', 'pulse', 'banner', 'camp', 'rise'],
  ['锐锋陷阵', 'spear', 'pierce', 'shield', 'battle', 'right'],
];
export const EVENT_SCENES = [
  ['商路畅通', 'cart', 'march', 'coin', 'road', 'left'],
  ['修葺桥梁', 'bridge', 'build', 'hammer', 'river', 'rise'],
  ['丰岁入仓', 'wheat', 'harvest', 'house', 'field', 'fall'],
  ['赈济乡里', 'bowl', 'pour', 'wheat', 'village', 'right'],
  ['朝廷赏赐', 'chest', 'open', 'seal', 'court', 'split'],
  ['行商获利', 'coin', 'trade', 'cart', 'market', 'rise'],
  ['押送问讯', 'gate', 'close', 'chain', 'prison', 'split'],
  ['奉诏归营', 'scroll', 'unroll', 'banner', 'camp', 'left'],
  ['通关赦令', 'permit', 'stamp', 'key', 'gate', 'rise'],
  ['退避三舍', 'horse', 'retreat', 'arrow', 'map', 'right'],
  ['整修城防', 'wall', 'build', 'beam', 'workshop', 'fall'],
  ['缴纳杂赋', 'coin', 'collect', 'chest', 'court', 'fall'],
];
const SPECIAL_SCENES = [
  ['重返誓师台', 'banner', 'sway', 'coin', 'camp', 'rise'],
  ['押送拘押', 'gate', 'close', 'chain', 'prison', 'split'],
  ['官府征赋', 'seal', 'stamp', 'coin', 'court', 'fall'],
  ['隐市灯火', 'lantern', 'sway', 'chest', 'market', 'split'],
  ['军营休整', 'herb', 'grow', 'tent', 'garden', 'rise'],
];
const EFFECT_MOTIFS = {
  slash: ['sword', 'slash'],
  crescent: ['sword', 'orbit'],
  axe: ['axe', 'strike'],
  blades: ['sword', 'rain'],
  arrows: ['arrow', 'rain'],
  charge: ['horse', 'charge'],
  lance: ['spear', 'pierce'],
  dash: ['horse', 'march'],
  ambush: ['horse', 'retreat'],
  fire: ['flame', 'burn'],
  storm: ['bolt', 'strike'],
  ice: ['crystal', 'grow'],
  wind: ['wind', 'orbit'],
  quake: ['rock', 'strike'],
  formation: ['compass', 'orbit'],
  scroll: ['scroll', 'unroll'],
  talisman: ['permit', 'stamp'],
  chains: ['chain', 'wall'],
  shield: ['shield', 'wall'],
  barrier: ['shield', 'pulse'],
  heal: ['herb', 'grow'],
  tide: ['wave', 'pour'],
  banner: ['banner', 'sway'],
  poison: ['bottle', 'pour'],
  mist: ['cloud', 'sway'],
  tiger: ['tiger', 'charge'],
};
const motifs = {
  wheat:
    '<path d="M0 35V-28M0 3Q-29 0-22-20Q-3-15 0 3M0-9Q25-13 22-31Q3-26 0-9M0 19Q-27 18-23-2Q-7 2 0 19" fill="currentColor"/><path d="M-22 31H23" fill="none"/>',
  cart: '<path d="M-35-12H24L36 17H-30ZM24-12L41-30M-28-20H18V-10H-28Z" fill="currentColor"/><circle cx="-19" cy="24" r="11"/><circle cx="27" cy="24" r="11"/><path d="M-19 15v18m-9-9h18M27 15v18m-9-9h18"/>',
  coin: '<circle r="30" fill="currentColor"/><circle r="24"/><path d="M-7-7H7V7H-7Z" fill="#172229"/><path d="M-17-10v20M17-10v20M-10-17h20M-10 17h20"/>',
  scroll:
    '<path d="M-31-30H30V31H-30Z" fill="#c8b98e"/><path d="M-32-32v65M32-32v65" stroke-width="7"/><path d="M-19-18H17M-19-6H13M-19 6H18M-19 18H4"/>',
  banner:
    '<path d="M-27 38V-38M-25-34L30-29L18-12L30 4L-25-1Z" fill="currentColor"/><path d="M-7-21l10 7-10 8" stroke="#172229"/>',
  anvil:
    '<path d="M-38-20H38L24-6H11V9L25 22H-23L-9 8V-7H-24Z" fill="currentColor"/><path d="M-30 29H31" stroke-width="6"/>',
  spark: '<path d="M0-31L6-5L32 0L6 5L0 31L-6 5L-32 0L-6-5Z" fill="currentColor"/>',
  herb: '<path d="M-4 36Q-2 4 19-25M-1 17Q-37 15-27-7Q-2-5-1 17M7 0Q9-36 30-33Q37-8 7 0" fill="currentColor"/><path d="M-15 31H22"/>',
  drop: '<path d="M0-37Q-40 8-19 28Q0 45 21 27Q39 5 0-37Z" fill="currentColor"/><path d="M-13 5Q-24 23-7 26"/>',
  beam: '<path d="M-30 36V-16H30V36M-41-16L0-38L41-16M-33 1H33M0-30V36" fill="none" stroke-width="6"/>',
  hammer:
    '<path d="M-3-4H6V38H-3Z" fill="#947153"/><path d="M-30-27H30V-5H-30Z" fill="currentColor"/><path d="M-20-24v15M22-24v15"/>',
  permit:
    '<path d="M-26-36H26V35H-26Z" fill="#bfae80"/><path d="M-15-24H15M-15-13H15M-15-2H1"/><path d="M-8 8H17V29H-8Z" fill="#a8543e"/><path d="M0 12v13m9-13v13M-4 18h18" stroke="#ebd7a1"/>',
  gate: '<path d="M-36 34V-22H36V34M-44-23L0-42L44-23M-24 33V-13H24V33" fill="none" stroke-width="7"/><path d="M-20-10H-2V33H-20ZM2-10H20V33H2Z" fill="currentColor"/>',
  horse:
    '<path d="M-42 4L-26-10H5L17-35L32-30L42-9L26-5L16-12L12 7L23 27L16 33L2 13H-14L-24 33L-31 30L-26 9L-38 13Z" fill="currentColor"/><path d="M18-32l-3-10 12 7M-29-5L-43-16" fill="none"/><circle cx="29" cy="-23" r="2" fill="#172229"/>',
  arrow:
    '<path d="M-40 26L33-25M23-27L40-31L31-15M-27 16L-39 15M-24 20L-27 32" fill="none" stroke-width="4"/>',
  compass:
    '<circle r="32"/><circle r="20"/><path d="M0-39V39M-39 0H39M-26-26L26 26M-26 26L26-26"/><path d="M0-28L9 5L0 17L-9-5Z" fill="currentColor"/>',
  shield:
    '<path d="M-30-25L0-38L30-25L25 16L0 38L-25 16Z" fill="currentColor"/><path d="M-22-18L0-28L22-18L17 11L0 27L-17 11ZM0-27V25" stroke="#172229"/>',
  star: '<path d="M0-37L8-10L34-10L14 7L21 35L0 18L-22 35L-15 7L-35-10L-9-10Z" fill="currentColor"/>',
  bridge:
    '<path d="M-43 24Q0-30 43 24M-43 36Q0-17 43 36M-38 17V1M-20 0V-17M0-7V-25M20 0V-17M38 17V1" fill="none" stroke-width="5"/><path d="M-44 40q12-8 23 0t23 0t23 0t23 0"/>',
  house:
    '<path d="M-29 34V-9H29V34ZM-40-10L0-37L40-10Z" fill="currentColor"/><path d="M-8 33V10H8V33M-23 3h10v10h-10M14 3h10v10H14" fill="#172229"/>',
  chest:
    '<path d="M-35-7H35V30H-35ZM-35-13L-26-32H27L35-13Z" fill="currentColor"/><path d="M-17-7V29M18-7V29M-28-26H28"/><path d="M-6-6H6V8H-6Z" fill="#172229"/>',
  sword:
    '<path d="M-4 14V-27L5-40L8 14ZM-14 14H17M2 16V33" fill="currentColor" stroke-width="4"/><circle cx="2" cy="40" r="6"/>',
  flame:
    '<path d="M0-41Q8-9 22-15Q50 18 14 35Q23 8 2 0Q6 22-12 35Q-44 19-20-12Q-20 3-12 6Q-15-23 0-41Z" fill="currentColor"/>',
  bottle:
    '<path d="M-10-34H10V-16L24-3Q38 34 0 37Q-38 34-24-3L-10-16Z" fill="currentColor"/><path d="M-14-35H14M-8 4H8V20H-8Z" fill="#172229"/><path d="M0 5V19M-6 12H6" stroke="#c5d7ac"/>',
  bow: '<path d="M-14-38Q45 0-14 38L-14-38" fill="none" stroke-width="3"/><path d="M-30 0H35L25-9M35 0L25 9" stroke-width="3"/>',
  drum: '<ellipse cy="-18" rx="30" ry="13" fill="currentColor"/><path d="M-30-18V23Q0 45 30 23V-18M-30 23Q0 9 30 23M-18-12L-7 20L5-12L18 20" fill="none"/><path d="M-38-32L-12-9M38-32L12-9" stroke-width="5"/>',
  spear: '<path d="M0 40V-18" stroke-width="5"/><path d="M0-44L12-16L0-5L-12-16Z" fill="currentColor"/>',
  bowl: '<path d="M-35-5H35Q29 27 0 30Q-29 27-35-5Z" fill="currentColor"/><path d="M-22-12q3-8 8-3m2-6q5-8 9 0m3 2q4-8 11 2M-14 34H14"/>',
  seal: '<path d="M-28 1H28V32H-28Z" fill="currentColor"/><path d="M-14 0V-20Q0-44 14-20V0" fill="#947153"/><path d="M-20 21H20M-20 12H20"/>',
  chain:
    '<g transform="rotate(-32)"><rect x="-12" y="-40" width="24" height="30" rx="11"/><rect x="-12" y="-16" width="24" height="30" rx="11"/><rect x="-12" y="8" width="24" height="30" rx="11"/></g>',
  key: '<circle cy="-19" r="17"/><path d="M0-2V40H13V30H0M0 21H12" stroke-width="6"/>',
  wall: '<path d="M-39 33V-30H-25V-16H-9V-30H9V-16H25V-30H39V33Z" fill="currentColor"/><path d="M-37 0H37M-37 17H37M-17 0V17M17 0V17M0 17V32"/>',
  lantern:
    '<path d="M-15-28H15L25-17V18L15 28H-15L-25 18V-17Z" fill="currentColor"/><path d="M-15-28Q0-45 15-28M-14-23V24M0-25V27M14-23V24M0 28V42"/>',
  tent: '<path d="M-43 31L0-38L43 31ZM-17 31L0-8L17 31" fill="currentColor"/><path d="M0-38V-48M0-45H23L15-36H0"/>',
  bolt: '<path d="M10-43L-25 5H-3L-14 43L28-12H6Z" fill="currentColor"/>',
  crystal:
    '<path d="M0-41L18-14L11 32L0 42L-12 30L-18-14Z" fill="currentColor"/><path d="M0-40V41M-18-14H18M-11 30L0 15L11 30"/>',
  wind: '<path d="M-40-15H14Q43-17 25-35Q14-44 8-30M-35 2H33Q52 3 41 18M-29 19H8Q35 23 16 36Q6 43 2 31" fill="none" stroke-width="5"/>',
  rock: '<path d="M-37 21L-26-16L-6-34L18-27L37 1L24 30L-9 38Z" fill="currentColor"/><path d="M-6-34L-12 6L-37 21M-12 6L24 30M-12 6L37 1"/>',
  wave: '<path d="M-42 23Q-13 9-15-17Q2-44 28-23Q9-29 10-8Q25 9 43 7Q23 35-6 33Z" fill="currentColor"/><path d="M-24 25Q5 9-1-11" fill="none"/>',
  cloud: '<path d="M-31 19Q-55 6-31-10Q-31-37-7-28Q17-43 28-13Q54-8 37 16Z" fill="currentColor"/>',
  axe: '<path d="M-2 39V-37" stroke-width="6"/><path d="M2-30Q32-39 40-12Q22 8 2-5Z" fill="currentColor"/>',
  tiger:
    '<path d="M-33-22L-28-38L-12-25Q0-29 12-25L28-38L34-21L28 20L0 39L-28 20Z" fill="currentColor"/><path d="M-25-10L-9-4M25-10L9-4M-26 3L-13 9M26 3L13 9M-7 15H7L0 23ZM0-26V-8" stroke="#172229" stroke-width="4"/>',
};
export function motifArt(name) {
  if (!motifs[name]) throw Error(`缺少演出图形：${name}`);
  const lineArt = ['beam', 'arrow', 'bridge', 'bow', 'drum', 'chain', 'key', 'wind', 'compass', 'gate'];
  return `<g fill="none" stroke="${lineArt.includes(name) ? 'currentColor' : '#293a40'}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${motifs[name]}</g>`;
}
function scenicBackdrop(theme) {
  if (['river', 'garden'].includes(theme))
    return '<path d="M0 230Q150 165 300 245T640 222M0 253Q160 205 320 263T640 250" fill="none" stroke="currentColor" stroke-width="3"/><path d="M0 180L90 80L165 176L260 95L373 208L510 100L640 190V320H0Z" fill="currentColor" opacity=".2"/>';
  if (['road', 'map', 'field', 'village'].includes(theme))
    return '<path d="M-30 320L246 140H373L690 320M-30 320L340 169L690 320" stroke="currentColor" fill="none"/><path d="M0 179Q70 67 160 180Q260 38 370 176Q499 70 640 165V230H0Z" fill="currentColor" opacity=".16"/>';
  if (['gate', 'prison', 'court'].includes(theme))
    return '<path d="M95 270V98H545V270M70 103L320 17L570 103M218 268V121H422V268M240 121V268M280 121V268M360 121V268M400 121V268" fill="none" stroke="currentColor" stroke-width="8"/>';
  if (['forge', 'workshop', 'armory'].includes(theme))
    return '<path d="M60 273V61H580V273M60 92H580M60 185H580M143 61V273M495 61V273" stroke="currentColor" stroke-width="6" fill="none"/><path d="M194 273L218 195H417L444 273Z" fill="currentColor" opacity=".2"/>';
  return '<path d="M0 279L135 64L261 279M380 279L501 79L640 279M129 65V27H216L194 61H129M501 80V36H570L552 65H501" fill="none" stroke="currentColor" stroke-width="3"/>';
}
export function sceneArt(recipe, seed = 0) {
  const [, motif, motion, support, theme, arrival] = recipe;
  const count = 3 + (seed % 4),
    direction = seed % 2 ? -1 : 1;
  return `<svg class="reward-scenery" viewBox="0 0 640 320" aria-hidden="true" data-motion="${motion}" data-theme="${theme}">
    <g class="scene-backdrop">${scenicBackdrop(theme)}</g>
    <g class="scene-trail"><path d="M${seed % 2 ? 620 : 20} ${220 - (seed % 61)} Q${130 + (seed % 80)} ${30 + (seed % 50)} 320 164 T${600 - (seed % 90)} 230" fill="none" stroke="currentColor" stroke-width="2" stroke-dasharray="7 13"/></g>
    ${Array.from({ length: count }, (_, i) => {
      const x = 74 + i * (490 / Math.max(1, count - 1)),
        y = 228 - Math.sin((i + (seed % 5)) * 1.1) * 32;
      return `<g transform="translate(${x} ${y}) scale(.55)"><g class="scene-support motion-${motion}" style="--delay:${i * 0.14}s;--direction:${direction}">${motifArt(support)}</g></g>`;
    }).join('')}
    <g transform="translate(320 145) scale(1.65)"><g class="scene-main motion-${motion}" style="--delay:.15s;--direction:${direction}" data-arrival="${arrival}">${motifArt(motif)}</g></g>
    ${Array.from({ length: 5 + (seed % 7) }, (_, i) => `<g transform="translate(${58 + ((i * 83 + seed * 7) % 528)} ${35 + ((i * 43 + seed * 13) % 210)}) scale(.12)"><g class="scene-spark" style="--delay:${i * 0.12}s">${motifArt('spark')}</g></g>`).join('')}
  </svg>`;
}
export function cardArt(id) {
  const card = CARDS[id],
    recipe = CARD_SCENES[id];
  if (!card || !recipe) throw Error('功能卡图形不存在');
  return `<svg class="card-art" viewBox="0 0 240 150" aria-hidden="true"><path d="M10 15H230V135H10Z" fill="#172229" stroke="currentColor" opacity=".6"/><g transform="translate(72 81) scale(.65)">${motifArt(recipe[3])}</g><g transform="translate(147 73)">${motifArt(recipe[1])}</g></svg>`;
}
export function rewardPresentation(event, state) {
  const p = state.players[event.owner];
  if (!p) throw Error('演出所属玩家不存在');
  let name,
    description,
    recipe,
    color = '#d4ad63',
    art = '',
    general = null;
  if (event.kind === 'general') {
    const g = GENERALS[event.id],
      skill = SKILLS[event.id],
      effect = EFFECT_MOTIFS[skill.effect];
    if (!effect) throw Error(`缺少武将演出：${skill.effect}`);
    general = g.id;
    name = g.name;
    color = skill.color;
    description = event.duplicate
      ? `已拥有${g.name}，本次转为${g.rarity * 2}份培养材料。`
      : `${g.faction} · ${g.troop}兵 · ${skill.name}：${skill.description}`;
    recipe = [
      skill.name,
      ...effect,
      g.troop === '骑' ? 'horse' : g.troop === '弓' ? 'scroll' : 'banner',
      ['camp', 'river', 'court', 'battle'][g.id % 4],
      ['left', 'rise', 'right', 'split', 'fall'][g.id % 5],
    ];
  } else if (event.kind === 'gear') {
    const item = p.items.find((i) => i.id === event.id);
    if (!item) throw Error('获得的军械不存在');
    name = `${QUALITY[item.quality]}·${ITEMS[item.slot]}`;
    color = QUALITY_COLORS[item.quality];
    description = EQUIPMENT_DETAILS[item.slot];
    art = equipmentArt(item.slot, item.quality);
    recipe = [
      '锻火凝锋',
      ['shield', 'permit', 'sword', 'wall', 'shield', 'horse'][item.slot],
      ['pulse', 'unroll', 'draw', 'build', 'wall', 'march'][item.slot],
      'spark',
      'forge',
      'rise',
    ];
  } else if (event.kind === 'card') {
    name = CARDS[event.id].name;
    description = CARDS[event.id].description;
    recipe = CARD_SCENES[event.id];
    color = CARDS[event.id].timing === 'board' ? '#91c6a2' : '#dba384';
    art = cardArt(event.id);
  } else if (event.kind === 'event') {
    name = EVENTS[event.id].name;
    recipe = EVENT_SCENES[event.id];
    description = {
      6: '已被押往拘押格。缴金、出狱卡或掷出双骰均可获释。',
      7: '奉诏返回誓师台，领取起点收入；增强模式同时获得粮草补给。',
      8: '领取通关赦令；若场上已有持有者，则改得30金。',
      9: '沿行军路线后退3格，并结算到达的格子，不领取起点收入。',
      10: '每级普通建筑缴纳25金，每座都督府缴纳100金；资金不足时请继续处理债务。',
    }[event.id];
    if (EVENTS[event.id].cash)
      description =
        EVENTS[event.id].cash > 0
          ? `获得${EVENTS[event.id].cash}金，收入已经入账。`
          : `应付${Math.abs(EVENTS[event.id].cash)}金，资金不足时继续处理债务。`;
  } else if (event.kind === 'special') {
    recipe = SPECIAL_SCENES[event.id];
    name = recipe[0];
    description = [
      state.enhanced ? '起点收入与主公粮草补给已结算。' : '起点收入已经入账。',
      '已进入拘押状态，后续可缴金、用赦令或掷双骰获释。',
      '税金已结算，资金不足时请处理债务。',
      '三件军械等待鉴赏；离店后仍可继续本格机遇。',
      '主公和麾下武将已解除负伤。',
    ][event.id];
  } else if (event.kind === 'manual' || event.kind === 'material') {
    const s = MANUAL_SKILLS[event.id],
      effect = EFFECT_MOTIFS[s.effect];
    name = s.name;
    description = event.kind === 'material' ? '已学会此秘法，重复获得转为5份培养材料。' : s.description;
    color = s.color;
    recipe = ['秘卷启封', ...effect, 'scroll', 'study', 'split'];
  } else if (event.kind === 'relic') {
    const item = p.relics.find((r) => r.id === event.id),
      relic = RELICS[item.type];
    name = relic.name;
    description = relic.description;
    color = '#baa5dc';
    recipe = [
      '奇珍现世',
      ['tiger', 'drop', 'scroll', 'scroll', 'seal', 'compass', 'coin', 'lantern'][item.type],
      'orbit',
      'star',
      'court',
      'rise',
    ];
  } else throw Error(`未知演出类型：${event.kind}`);
  return { key: `${event.kind}-${event.id}`, name, description, recipe, color, art, general, seed: event.id };
}
export function rewardContent(reveal, state, ui, quiet, low = false) {
  const { esc, portrait } = ui,
    r = rewardPresentation(reveal.event, state);
  const eventScene = ['event', 'special'].includes(reveal.event.kind);
  return {
    title:
      reveal.event.kind === 'gear'
        ? '军械入库'
        : reveal.event.kind === 'general'
          ? '英杰来归'
          : reveal.event.kind === 'card'
            ? '锦囊入手'
            : '时局纪事',
    body: `<section class="reveal-stage reward-stage ${quiet ? 'reward-still' : ''} ${low ? 'reward-low' : ''}" style="--reward-color:${r.color}" data-reward="${r.key}" data-reward-arrival="${r.recipe[5]}">
      <div class="reward-theater"><div class="reward-caption"><span>${esc(state.players[reveal.event.owner].name)} · ${esc(r.recipe[0])}</span><small>演出仅作展示 · 结果已结算</small></div>${sceneArt(r.recipe, r.seed)}
      <div class="reward-result">${r.general !== null ? `<button class="reveal-card reward-general" data-bio="${esc(r.name)}">${portrait(r.general, r.color)}<span>查看生平 ↗</span></button>` : `<div class="reveal-card reward-object">${r.art || `<svg viewBox="0 0 120 120" aria-hidden="true"><g transform="translate(60 60)">${motifArt(r.recipe[1])}</g></svg>`}</div>`}
      <div class="reward-copy"><p class="eyebrow">${reveal.event.duplicate ? '故人重逢 · 材料已入库' : '此刻入史'}</p><h1>${esc(r.name)}</h1><p>${esc(r.description)}</p></div></div></div>
      <div class="reward-controls"><button type="button" data-action="skip-reward" ${quiet ? 'disabled' : ''}>跳过动画</button><button type="button" data-action="close" class="primary">${eventScene ? '知悉时局' : reveal.event.kind === 'general' ? '收入麾下' : '收下奖励'} · 继续</button></div>
    </section>`,
  };
}
