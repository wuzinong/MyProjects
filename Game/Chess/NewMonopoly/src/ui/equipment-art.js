import { ITEMS, QUALITY, QUALITY_COLORS } from '../data/game.js';

export const EQUIPMENT_DETAILS = [
  '分瓣铁盔、眉箍与下垂护颊，覆住头顶和两侧。',
  '熟革包裹手背与腕部，交叉系带收紧，边缘缝线加固。',
  '单刃直刀，狭长刀身配圆环刀首，缠柄便于握持，附贴身刀鞘。',
  '小片甲札逐行穿缀，肩甲与垂裙相接，腰带束紧甲衣。',
  '成对弧形护胫覆盖小腿前侧，以皮带束紧。',
  '成对短筒革靴，包裹足踝，厚底与前翘靴头清晰可辨。',
];
const finishes = [
  ['#87908f', '#394548', '#7f715b'],
  ['#9aa9a5', '#394b48', '#aaa084'],
  ['#b2c0c7', '#354858', '#bfa878'],
  ['#c5c3ce', '#454253', '#d5ba85'],
  ['#dde1dc', '#424c51', '#e3c886'],
];
let serial = 0;

export function equipmentArt(slot, quality = 0, empty = false) {
  if (!Number.isInteger(slot) || slot < 0 || slot > 5 || !finishes[quality]) throw Error('军械图形参数无效');
  const id = `armory-${serial++}`,
    [light, dark, trim] = finishes[quality];
  const rivet = (x, y) =>
    `<circle cx="${x}" cy="${y}" r="2.2" fill="${trim}" stroke="#342c24" stroke-width=".7"/>`;
  const stitch = (x, y, n) =>
    Array.from(
      { length: n },
      (_, i) => `<path d="M${x + i * 8} ${y}l3 4" stroke="${trim}" stroke-width="1.3"/>`,
    ).join('');
  const plate = (x, y, w = 17, h = 18) =>
    `<path d="M${x} ${y}h${w}v${h - 3}q-${w / 2} 6 -${w} 0Z" fill="url(#${id}-steel)" stroke="${trim}" stroke-width=".7"/>${rivet(x + 4, y + 4)}${rivet(x + w - 4, y + 4)}`;
  const laces = (x, y, n) =>
    Array.from(
      { length: n },
      (_, i) =>
        `<path d="M${x} ${y + i * 9}l29 9m-29 0l29 -9" stroke="${trim}" stroke-width="2" fill="none"/>`,
    ).join('');
  const shapes = [
    () => `<path d="M65 140L68 82Q73 40 120 37Q167 40 172 82L175 140L150 155L147 112H93L90 155Z" fill="url(#${id}-steel)" stroke="${trim}" stroke-width="3"/>
      <path d="M87 102Q82 66 120 39Q157 67 153 102M120 38V104" fill="none" stroke="${trim}" stroke-width="3"/>
      <path d="M67 99Q120 83 173 99L171 111Q120 99 69 111Z" fill="#3b4549" stroke="${trim}" stroke-width="2"/>
      <path d="M74 117L79 145L88 139L88 113M166 117L161 145L152 139L152 113" fill="#79868a" stroke="${trim}"/>
      ${Array.from({ length: 9 }, (_, i) => rivet(76 + i * 11, 102 - Math.sin((i / 8) * Math.PI) * 9)).join('')}
      <path d="M94 130L110 167L127 164L146 130" fill="none" stroke="#775541" stroke-width="5"/>
      ${quality >= 2 ? `<path d="M107 48L120 30L133 48L120 64Z" fill="${trim}"/><path d="M116 38v18m8-18v18" stroke="${dark}" stroke-width="2"/>` : ''}`,
    () => `<g transform="rotate(-12 120 100)"><path d="M76 151L79 85L67 66Q65 56 72 55Q78 56 86 73L88 42Q91 35 96 43L99 66L103 33Q108 25 112 35L114 65L119 31Q125 24 129 34L130 66L138 41Q145 36 147 46L142 79Q157 78 160 85L141 110L139 154Z" fill="url(#${id}-leather)" stroke="${trim}" stroke-width="2"/>
      <path d="M82 86Q105 72 139 84L134 113L87 112Z" fill="#76523c" stroke="${trim}" stroke-width="1.5"/>
      <path d="M78 118H140V145H77Z" fill="#352e2c" stroke="${trim}" stroke-width="2"/>
      ${laces(92, 120, 2)}${stitch(88, 91, 6)}
      ${quality >= 2 ? Array.from({ length: quality }, (_, i) => plate(91 + i * 10, 97, 9, 12)).join('') : ''}
      </g>`,
    () => `<g transform="rotate(31 120 100)"><path d="M113 119L113 39L128 13L130 119Z" fill="url(#${id}-steel)" stroke="${trim}" stroke-width="1.4"/>
      <path d="M126 25V117" stroke="#f1f2db" stroke-width="2"/><path d="M113 43L117 38V117" fill="none" stroke="${dark}" stroke-width="2"/>
      <path d="M110 118H133V124H110Z" fill="${trim}"/><rect x="115" y="124" width="13" height="29" rx="2" fill="#49382f" stroke="${trim}"/>
      ${Array.from({ length: 5 }, (_, i) => `<path d="M115 ${126 + i * 5}l13 4" stroke="#b49774" stroke-width="2"/>`).join('')}
      <circle cx="121.5" cy="165" r="11" fill="none" stroke="${trim}" stroke-width="${quality >= 3 ? 5 : 4}"/>
      ${quality >= 2 ? `<path d="M119 53v38m4-35v27" stroke="${trim}" stroke-width="1"/>` : ''}
      </g><g transform="rotate(31 72 107)"><path d="M65 39h15v111l-7 12-8-12Z" fill="url(#${id}-leather)" stroke="${trim}" stroke-width="2"/><path d="M65 54h15M65 132h15" stroke="${trim}" stroke-width="5"/></g>`,
    () => `<path d="M91 34L65 44L48 77L66 89L74 77L67 155Q120 177 173 155L166 77L175 89L193 77L176 44L149 34L137 50H104Z" fill="#413c36" stroke="${trim}" stroke-width="2"/>
      ${Array.from({ length: 6 }, (_, row) => Array.from({ length: 6 }, (_, col) => plate(72 + col * 16, 55 + row * 16, 15, 17)).join('')).join('')}
      ${[0, 1].map((side) => `<g transform="translate(${side ? 126 : 0} 0)">${Array.from({ length: 3 }, (_, row) => plate(51, 50 + row * 12, 25, 14)).join('')}</g>`).join('')}
      <path d="M72 122H169V133H71Z" fill="#503b2b" stroke="${trim}" stroke-width="2"/><rect x="111" y="121" width="20" height="14" rx="2" fill="${trim}"/><path d="M115 125h12v6h-12Z" fill="${dark}"/>
      ${quality >= 3 ? `<path d="M108 63L120 56L132 63L120 86Z" fill="none" stroke="${trim}" stroke-width="2"/>` : ''}`,
    () =>
      [0, 1]
        .map(
          (
            side,
          ) => `<g transform="translate(${side ? 77 : 0} 0) rotate(${side ? 6 : -6} 83 99)"><path d="M59 38Q82 29 105 38L100 151Q82 170 64 151Z" fill="url(#${id}-steel)" stroke="${trim}" stroke-width="2.5"/>
      <path d="M82 38V157M66 44l5 97M98 44l-5 97" stroke="${trim}" stroke-width="1.5" fill="none"/>
      <path d="M55 66H108V76H55ZM58 126H103V136H58Z" fill="#684635" stroke="#c0a175" stroke-width="1"/>
      ${rivet(69, 49)}${rivet(95, 49)}${rivet(71, 145)}${rivet(93, 145)}
      ${quality >= 2 ? `<path d="M75 92l7-8 7 8-7 20Z" fill="none" stroke="${trim}" stroke-width="2"/>` : ''}</g>`,
        )
        .join(''),
    () =>
      [0, 1]
        .map(
          (
            side,
          ) => `<g transform="translate(${side ? 89 : 5} ${side ? -8 : 4})"><path d="M49 51L89 54L85 116Q94 135 112 140L114 152Q73 164 37 151L41 131L44 99Z" fill="url(#${id}-leather)" stroke="${trim}" stroke-width="2.5"/>
      <path d="M39 149Q78 160 114 147L113 158Q73 171 36 157Z" fill="#252b2a" stroke="${trim}" stroke-width="1.5"/>
      <path d="M48 54L46 70L88 73L89 55Z" fill="#362e2a" stroke="${trim}"/>
      ${laces(52, 80, 3)}<path d="M46 121Q65 117 83 121M82 133Q91 145 107 145" stroke="${trim}" fill="none" stroke-width="1.5"/>
      ${quality >= 3 ? `<path d="M47 115l18-7 17 8v9H45Z" fill="url(#${id}-steel)" stroke="${trim}"/>` : ''}</g>`,
        )
        .join(''),
  ];
  return `<svg class="equipment-art ${empty ? 'equipment-empty' : ''}" data-equipment-art="${slot}-${quality}" viewBox="0 0 240 200" role="img" aria-label="${QUALITY[quality]}${ITEMS[slot]}">
    <defs><linearGradient id="${id}-steel" x1="0" y1="0" x2="1" y2=".65"><stop stop-color="${dark}"/><stop offset=".35" stop-color="${light}"/><stop offset=".5" stop-color="${dark}"/><stop offset=".8" stop-color="${light}"/><stop offset="1" stop-color="${dark}"/></linearGradient><linearGradient id="${id}-leather" x2=".9" y2="1"><stop stop-color="#a27b55"/><stop offset=".55" stop-color="#684635"/><stop offset="1" stop-color="#342a26"/></linearGradient></defs>
    <ellipse cx="120" cy="178" rx="73" ry="10" fill="#000" opacity=".25"/>
    <g stroke-linejoin="round" stroke-linecap="round">${shapes[slot]()}</g>
    ${quality === 4 ? `<path d="M32 54l3 7 7 3-7 3-3 7-3-7-7-3 7-3ZM198 121l2 5 5 2-5 2-2 5-2-5-5-2 5-2Z" fill="${QUALITY_COLORS[quality]}" opacity=".7"/>` : ''}
  </svg>`;
}
