import {
  MAP,
  ROUTE,
  ROUTE_INDEX,
  LORDS,
  GENERALS,
  CARDS,
  EVENTS,
  REGIONS,
  SLOTS,
  ITEMS,
  QUALITY,
  QUALITY_COLORS,
  BUILDING_NAMES,
  HOUSE_SUPPLY,
  PALACE_SUPPLY,
  SHOP_PRICES,
  BONDS,
} from '../data/game.js';
import { BIOGRAPHIES } from '../data/people.js';
import { CITY_LORE, citySource } from '../data/places.js';
import {
  TITLES,
  RELICS,
  UNLOCK_LEVELS,
  MAX_LEVEL,
  LOOT_RATES,
  ROLE_NAMES,
  ROLES,
} from '../data/progression.js';
import { MANUAL_SKILLS, skillById } from '../data/skills.js';
import { makeFighter, skillPath, fighterRole, fighterTroop } from '../core/progression.js';
import { stats } from '../core/engine.js';

export const LIBRARY_CATEGORIES = [
  ['people', '人物卡牌', '将'],
  ['cards', '功能卡牌', '策'],
  ['treasures', '秘法宝物', '珍'],
  ['equipment', '武器装备', '甲'],
  ['buildings', '建筑', '筑'],
  ['places', '城池与行旅', '城'],
  ['titles', '军功称号', '印'],
  ['events', '经典奇遇', '遇'],
];
const buildingDescriptions = [
  '尚未建造房屋的城池地块，购买后即可按规则收取基础租金。',
  '第一阶民居，以小型居所和院落建立最初的产业。',
  '第二阶里坊，聚居院落增多，城内街巷与生活空间逐渐展开。',
  '第三阶商署，贸易与管理设施扩展，城池的经营收益继续提高。',
  '第四阶城楼，门楼与高台成为城防轮廓，属于普通建设的最高一级。',
  '第五阶都督府，以大型院落与主楼构成最高阶城池建筑。',
];
const travelDescriptions = {
  start:
    '誓师台是环线起点。正常经过或抵达可领取200金，增强模式另有粮草和主公特性奖励；部分传送卡明确不发起点收入。',
  jail: '拘押格兼有探访与囚禁状态。正常走到这里不会被关押；已被拘押者可缴50金、使用赦令或掷双骰获释。',
  gojail: '立即押送到拘押格，结束本次行动，不因押送领取起点收入。',
  rest: '休整格在增强模式解除主公及麾下武将负伤。经典模式在此平安停留，没有免费停车奖池。',
  tax: '向官府缴纳本格税金；不足时进入债务清偿。增强模式董卓的承担税金减少20%。',
  utility: '可购买的河道运输产业，租金与本次骰点及同一玩家拥有的漕运数量相关，不能建设房屋。',
};
const stationDescriptions = {
  函谷驿: '以函谷关一带的关中东向通道为背景，作为连接商路的游戏驿站；名称不代表考证过的具体汉代驿署。',
  官渡驿: '以汉末官渡地区为背景的游戏驿站，表现中原道路与军旅运输，并非对古代驿署的实景复原。',
  白马驿: '以黄河白马津一带为背景的游戏驿站，突出津渡与陆路转运的联系；驿站经营规则为游戏设计。',
  阳平驿: '以汉中阳平关通道为背景的游戏驿站，表现山地交通与补给；并非河北同名地区的阳平。',
};
function placeSummary(t) {
  if (t.kind === 'city') {
    if (!CITY_LORE[t.name]) throw Error(`缺少城池介绍：${t.name}`);
    return String(CITY_LORE[t.name][0]);
  }
  if (t.kind === 'station') return stationDescriptions[t.name];
  if (t.kind === 'event')
    return `${t.name}格提供一次落点机遇。经典模式触发事件牌；增强模式可抽取功能／战术卡或探索经典奇遇，并可能遇见秘密商店。`;
  return travelDescriptions[t.kind];
}
function eventSummary(e) {
  if (e.cash) return `${e.cash > 0 ? '获得' : '支付'}${Math.abs(e.cash)}金。`;
  if (e.jail) return '被押送至拘押格，按拘押规则继续后续回合。';
  if (e.home) return '返回誓师台，并领取起点收入。';
  if (e.escape) return '获得通关赦令；若赦令已被玩家持有，则获得30金。';
  if (e.back) return `后退${e.back}格，并结算新的落点，不领取起点收入。`;
  if (e.repair) return '按自有建筑情况缴纳维修费用，资金不足时进入债务清偿。';
  throw Error(`未知奇遇效果：${e.name}`);
}
const entry = (category, index, name, tag, summary, color = '#d4ad63') => ({
  id: `${category}-${index}`,
  category,
  index,
  name,
  tag,
  summary,
  color,
});
export const LIBRARY_ENTRIES = [
  ...LORDS.map((l, i) =>
    entry('people', -i - 1, l.name, `主公 · ${l.word}`, BIOGRAPHIES[l.name].summary, l.color),
  ),
  ...GENERALS.map((g) =>
    entry(
      'people',
      g.id,
      g.name,
      `${['', '良将', '英杰', '名将'][g.rarity]} · ${g.faction} · ${g.troop}兵`,
      BIOGRAPHIES[g.name].summary,
      QUALITY_COLORS[g.rarity + 1],
    ),
  ),
  ...CARDS.map((c) =>
    entry(
      'cards',
      c.id,
      c.name,
      c.timing === 'board' ? '棋盘功能卡' : '战斗战术卡',
      c.description,
      c.timing === 'board' ? '#70c6ab' : '#d99c80',
    ),
  ),
  ...MANUAL_SKILLS.map((s, i) => entry('treasures', i, s.name, '秘法 · 独立技能槽', s.description, s.color)),
  ...RELICS.map((r, i) =>
    entry('treasures', i + MANUAL_SKILLS.length, r.name, '宝物 · 独立被动槽', r.description, '#a899e5'),
  ),
  ...QUALITY.flatMap((q, quality) =>
    SLOTS.map((slot, i) =>
      entry(
        'equipment',
        quality * SLOTS.length + i,
        `${q}·${ITEMS[i]}`,
        `${slot}部位 · ${q}`,
        '主公与武将均可穿戴。品质影响属性增益和部位光效，同一实例不能多人共用。',
        QUALITY_COLORS[quality],
      ),
    ),
  ),
  ...BUILDING_NAMES.map((name, i) =>
    entry('buildings', i, name, i ? `第${i}阶建筑` : '未建设', buildingDescriptions[i]),
  ),
  ...ROUTE.map((id) => {
    const t = MAP[id];
    return entry(
      'places',
      id,
      t.name,
      `环线第${ROUTE_INDEX[id] + 1}格 · ${t.group >= 0 ? REGIONS[t.group].name : '行旅'}`,
      placeSummary(t),
      t.group >= 0 ? REGIONS[t.group].color : '#85a7ad',
    );
  }),
  ...TITLES.map((t) =>
    entry(
      'titles',
      t.id,
      t.name,
      `Lv.${t.level}解锁`,
      '佩戴后获得印绶、光环及小幅属性加成，仅当前佩戴的称号生效。',
      t.color,
    ),
  ),
  ...EVENTS.map((e, i) => entry('events', i, e.name, '经典事件牌', eventSummary(e), '#85a7ad')),
];

export function filterLibrary(category, query = '') {
  if (!LIBRARY_CATEGORIES.some(([id]) => id === category)) throw Error('资料分类不存在');
  const text = query.trim().toLocaleLowerCase();
  return LIBRARY_ENTRIES.filter(
    (e) => e.category === category && `${e.name} ${e.tag} ${e.summary}`.toLocaleLowerCase().includes(text),
  );
}

const statNames = {
  hp: '生命',
  atk: '攻击',
  def: '防御',
  speed: '速度',
  shield: '开战护盾',
  regen: '行动回血',
};
export function equipmentStats(slot, quality) {
  const g = makeFighter(-1),
    p = { lord: 0, items: [], relics: [] },
    base = stats(p, g);
  p.items.push({ id: 0, slot, quality });
  g.gear[slot] = 0;
  const equipped = stats(p, g);
  return Object.entries(base)
    .filter(([key, value]) => equipped[key] !== value)
    .map(([key, value]) => [statNames[key], `+${equipped[key] - value}`]);
}
function detail(e, ui) {
  const { esc } = ui;
  const facts = (rows) =>
    `<dl class="library-facts">${rows.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>`;
  const note = (text) => `<p class="note-box">${esc(text)}</p>`;
  const source = (label, url) =>
    `<p class="tiny muted">史料：${esc(label)} · <a href="${esc(url)}" target="_blank" rel="noopener noreferrer">主动联网查阅原文 ↗</a></p>`;
  const table = (heading, rows) =>
    `<div class="library-table"><table><thead><tr>${heading.map((h) => `<th scope="col">${esc(h)}</th>`).join('')}</tr></thead><tbody>${rows.map((row) => `<tr>${row.map((v, i) => (i ? `<td>${esc(v)}</td>` : `<th scope="row">${esc(v)}</th>`)).join('')}</tr>`).join('')}</tbody></table></div>`;
  if (e.category === 'people') {
    const lord = e.index < 0,
      p = { lord: lord ? -e.index - 1 : 0, items: [], relics: [] };
    const g = makeFighter(lord ? -1 : e.index, 1, p.lord),
      bio = BIOGRAPHIES[e.name];
    const bonds = lord ? [] : BONDS.filter((b) => b.members.includes(g.id));
    return (
      facts([
        ['时代', bio.era],
        ['兵种', `${fighterTroop(p, g)}兵`],
        ['定位', ROLE_NAMES[ROLES.indexOf(fighterRole(p, g))]],
        ...Object.entries(stats(p, g)).map(([k, v]) => [statNames[k], v]),
      ]) +
      note(
        `以上为1级、无装备与称号的基础数值，不含阵容增益。成长上限${MAX_LEVEL}级，每级生命+14、攻击+3、防御+2。`,
      ) +
      (lord
        ? `<h3>主公经营特性</h3><p>${esc(LORDS[p.lord].title)}：${esc(LORDS[p.lord].skill)}</p>`
        : note(
            '获取：招贤格奖励、招贤榜花费游戏金币或招募功能卡。良将65%、英杰30%、名将5%；第20次招募保底名将，重复武将转培养材料。',
          )) +
      `<h3>技能成长</h3><div class="library-skills">${skillPath(p, g)
        .map((id, i) => {
          const s = skillById(id);
          return `<section><small>Lv.${UNLOCK_LEVELS[i]} · 冷却${s.cooldown}次行动</small><h4>${esc(s.name)}</h4><p>${esc(s.description)}</p></section>`;
        })
        .join('')}</div>` +
      (bonds.length
        ? '<h3>羁绊</h3>' +
          bonds
            .map(
              (b) =>
                `<p>${esc(b.name)}：${b.members.map((id) => esc(GENERALS[id].name)).join('、')}中至少2人同时出阵，${statNames[b.effect]}+${b.value}。</p>`,
            )
            .join('') +
          '<p class="tiny muted">最多生效2组羁绊。</p>'
        : '') +
      `<h3>生平要事</h3><ol>${bio.deeds.map((d) => `<li>${esc(d)}</li>`).join('')}</ol>` +
      source(bio.source, bio.url)
    );
  }
  if (e.category === 'cards')
    return (
      facts([
        [
          '使用阶段',
          CARDS[e.index].timing === 'board' ? '掷骰前／行动完成后的整备阶段' : '攻城战当前人物出手前',
        ],
        ['获取', '事件格抽卡、增强模式补给奖励及主公特性'],
      ]) +
      note(
        CARDS[e.index].timing === 'board'
          ? '每回合最多主动使用2张棋盘功能卡；手牌上限8张。资料库只能阅读，使用卡牌请前往对局的卡牌菜单。'
          : '每次人物行动前最多使用1张战术卡；战术卡不推进技能冷却。具体目标以战斗卡牌菜单中的合法选项为准。',
      )
    );
  if (e.category === 'treasures') {
    const manual = e.index < MANUAL_SKILLS.length,
      r = RELICS[e.index - MANUAL_SKILLS.length];
    return (
      (manual
        ? facts([
            ['冷却', `${MANUAL_SKILLS[e.index].cooldown}次行动`],
            ['配装', '2项常规技能之外，可再携带1项秘法'],
          ])
        : facts(
            Object.entries(statNames)
              .filter(([key]) => r[key])
              .map(([key, name]) => [name, `+${r[key]}`]),
          )) +
      note(
        `获取：攻城胜方${LOOT_RATES.victory.chance * 100}%、增强奇遇${LOOT_RATES.encounter.chance * 100}%概率额外掉落；触发后秘法25%、装备45%、宝物30%。`,
      ) +
      note(
        manual
          ? '秘法按玩家学习，可供多名己方人物选装；重复获得转5份培养材料。战斗中不能更换秘法。'
          : '宝物使用独立槽，不占六槽装备。同一宝物实例只能装备给一名主公或武将；战斗中不能换装。',
      )
    );
  }
  if (e.category === 'equipment') {
    const slot = e.index % SLOTS.length,
      quality = Math.floor(e.index / SLOTS.length);
    return (
      facts([
        ...equipmentStats(slot, quality),
        ['秘密商店售价', `${SHOP_PRICES[quality]}金`],
        ['部位', SLOTS[slot]],
      ]) +
      note(
        '获取：军械坊铸取、军械格奖励、装备功能卡、秘密商店，以及奇遇／攻城胜利掉落。铸取一次80金；秘密商店每次固定3件，购买后不补货。',
      ) +
      '<h3>同部位品质对照</h3>' +
      table(
        ['品质', '属性加成', '隐市售价'],
        QUALITY.map((q, i) => [
          q,
          equipmentStats(slot, i)
            .map(([k, v]) => k + v)
            .join('，'),
          `${SHOP_PRICES[i]}金`,
        ]),
      ) +
      note(
        '普通铸取品质概率：素品45%、良品30%、上品16%、珍品7%、绝品2%。现有装备共六种部位、五档品质；这里不是额外增加的新物品。',
      )
    );
  }
  if (e.category === 'buildings')
    return (
      `<ol class="library-building-path">${BUILDING_NAMES.map((n, i) => `<li class="${i === e.index ? 'current' : ''}">${i} · ${n}</li>`).join('')}</ol>` +
      facts([
        ['等级', e.index],
        ['普通建设库存', `${HOUSE_SUPPLY}份`],
        ['都督府库存', `${PALACE_SUPPLY}座`],
      ]) +
      note(
        '整备建设需要集齐同色区域并均匀升级；增强模式停到自己的未抵押城池，还可单独建设一次，无需集齐区域。驿站和漕运不能建设。',
      ) +
      note(
        '每级费用按城池配置，主公特性或工匠卡可折扣。4级升都督府交回4份普通库存、消耗1座都督府；最高5级。造型随区域变化，建筑阶序为游戏设计。',
      ) +
      '<h3>各区该等级基础租金</h3>' +
      table(
        ['游戏区域', '城池租金范围'],
        REGIONS.map((r, group) => {
          const values = MAP.filter((t) => t.group === group).map((t) => t.rent[e.index]);
          return [r.name, `${Math.min(...values)}—${Math.max(...values)}金`];
        }),
      ) +
      note('表内未计算空地集齐区域时的翻倍，具体城池可在“城池与行旅”查看。')
    );
  if (e.category === 'places') {
    const t = MAP[e.index];
    if (t.kind === 'city') {
      const ref = citySource(t.name);
      return (
        source(ref.label, ref.url) +
        facts([
          ['游戏区域', REGIONS[t.group].name],
          ['区域风格', REGIONS[t.group].style],
          ['景观地标', t.landmark],
          ['购置价格', `${t.price}金`],
          ['每级基础建设费', `${t.build}金`],
          ['抵押本金', `${t.price / 2}金`],
        ]) +
        '<h3>建筑与基础租金</h3>' +
        table(
          ['建筑', '租金'],
          BUILDING_NAMES.map((name, i) => [name, `${t.rent[i]}金`]),
        ) +
        note('同色区域全部持有且无抵押时，未建设城池租金翻倍。表内不显示当前对局产权或他人私有信息。') +
        note(
          '古名跨汉末至三国使用，部分采用郡名代表区域；游戏色组、环线路线、地标造型与地形均经过艺术化处理，不代表真实行政区划或比例。',
        )
      );
    }
    if (t.kind === 'station' || t.kind === 'utility')
      return (
        facts([
          ['购置价格', `${t.price}金`],
          ['抵押本金', `${t.price / 2}金`],
          ['房屋建设', '不可建设'],
        ]) +
        note(
          t.kind === 'station'
            ? '同一主公拥有1／2／3／4座驿站时，基础租金为25／50／100／200金。'
            : '同一主公拥有1处漕运时，租金为骰点总和×4；拥有2处时为骰点总和×10。',
        ) +
        note('增强模式孙权的驿站、漕运收益额外提高25%，向上取整；抵押后不收租。')
      );
    if (t.kind === 'tax') return facts([['基础税额', `${t.price}金`]]);
    if (t.kind === 'event')
      return (
        note(
          `${[2, 22].includes(t.id) ? '此格可选免费招募武将。' : t.id === 33 ? '此格可选领取随机装备。' : t.id === 7 ? '此格可花40金采购30粮。' : '此格可选择抽卡或探索经典奇遇。'}上述选项与抽卡／经典奇遇择一领取。`,
        ) +
        note('增强事件格有25%概率先出现秘密商店；离店后继续原事件选择。事件结算还可能获得秘法、装备或宝物。')
      );
    return note('行旅格是棋盘规则节点，不可购买或建设。可在“规则”中查看完整回合、起点与拘押处理。');
  }
  if (e.category === 'titles') {
    const t = TITLES[e.index];
    return (
      facts([
        ['解锁等级', t.level],
        ...['hp', 'atk', 'def', 'speed'].map((key) => [statNames[key], `+${t[key]}`]),
      ]) +
      note(
        '主公与武将每5级解锁一种称号，在将府选择佩戴；可以选用已解锁的低阶称号，不叠加历次加成。官职序列是游戏荣誉设计，不代表史实晋升路线或人物真实履历。',
      )
    );
  }
  return note(
    '经典模式走到事件格时触发事件牌；增强模式选择“探索经典奇遇”也可触发。事件按对局牌序结算，资料库阅读不会抽取或消耗事件。',
  );
}

export function libraryContent(category, query, selected, ui) {
  const { esc, portrait } = ui,
    entries = filterLibrary(category, query);
  const current = LIBRARY_CATEGORIES.find(([id]) => id === category);
  const chosen = selected ? LIBRARY_ENTRIES.find((e) => e.id === selected && e.category === category) : null;
  if (selected && !chosen) throw Error('资料条目不存在');
  const mark = (e) =>
    e.category === 'people'
      ? portrait(e.index < 0 ? -e.index - 1 : e.index, e.color, e.index < 0)
      : `<span class="library-seal" aria-hidden="true">${esc(e.category === 'titles' ? TITLES[e.index].seal : LIBRARY_CATEGORIES.find(([id]) => id === e.category)[2])}</span>`;
  const nav = `<nav class="library-tabs" aria-label="资料分类">${LIBRARY_CATEGORIES.map(([id, name, seal]) => `<button type="button" data-library-category="${id}" aria-pressed="${id === category}"><span aria-hidden="true">${seal}</span>${name}<small>${LIBRARY_ENTRIES.filter((e) => e.category === id).length}</small></button>`).join('')}</nav>`;
  return {
    title: '资料 · 天下藏书阁',
    body: `<section class="reference-library"><p class="muted">收录全部公开资料，无需先获得。这里只供查阅，不会消耗资源或改变对局；秘法、宝物与人物成长等玩法仅在增强模式生效。</p>${nav}${
      chosen
        ? `<button type="button" class="text-button library-back" data-library-back>← 返回${current[1]}</button><article class="library-detail" tabindex="-1"><div class="library-detail-heading" style="--library-color:${chosen.color}">${mark(chosen)}<div><p class="eyebrow">${esc(chosen.tag)}</p><h1>${esc(chosen.name)}</h1></div></div><p class="library-intro">${esc(chosen.summary)}</p>${detail(chosen, ui)}</article>`
        : `<form id="library-search" class="library-search"><label>搜索${current[1]}<input name="query" value="${esc(query)}" placeholder="输入名称、地区或介绍关键词"></label><button type="submit">查找资料</button><button type="button" data-library-clear>清空</button></form><p class="tiny muted" role="status">找到 ${entries.length} 条${current[1]}资料</p><div class="library-grid">${entries.map((e) => `<button type="button" class="library-card" data-library-entry="${e.id}" style="--library-color:${e.color}">${mark(e)}<span class="library-card-copy"><small>${esc(e.tag)}</small><strong>${esc(e.name)}</strong><span>${esc(e.summary)}</span><em>查看详情 ↗</em></span></button>`).join('') || '<p class="empty">没有符合条件的资料，请换一个关键词或清空搜索。</p>'}</div>`
    }</section>`,
  };
}
