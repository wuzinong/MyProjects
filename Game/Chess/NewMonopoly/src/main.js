import {
  MAP,
  ROUTE,
  ROUTE_INDEX,
  HOUSE_SUPPLY,
  PALACE_SUPPLY,
  LORDS,
  REGIONS,
  GENERALS,
  COLORS,
  CARDS,
  SLOTS,
  ITEMS,
  QUALITY,
  QUALITY_COLORS,
  BONDS,
  SOURCES,
  BUILDING_NAMES,
} from './data/game.js';
import {
  createGame,
  command,
  actorId,
  active,
  owned,
  rent,
  worth,
  stats,
  readyGenerals,
  siegeReason,
  currentUnit,
  canAlly,
  buildCost,
  liquidationValue,
} from './core/engine.js';
import { serialize, deserialize } from './core/save.js';
import { choose, chooseBattle } from './ai/strategy.js';
import { GameScene } from './render/scene.js';
import { SKILLS, skillFor, STATUS_NAMES } from './data/skills.js';
import { skillTargets } from './core/combat.js';
import { combatPresentation } from './render/combat-effects.js';

const $ = (selector) => document.querySelector(selector);
const esc = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c],
  );
const money = (n) => Math.floor(n).toLocaleString('zh-CN');
const btn = (text, cmd, style = '', disabled = false) =>
  `<button type="button" class="${style}" data-cmd="${esc(JSON.stringify(cmd))}" ${disabled ? 'disabled' : ''}>${text}</button>`;
const action = (text, name, style = '') =>
  `<button type="button" class="${style}" data-action="${name}" ${text === '⚙' ? 'aria-label="画质与声音设置"' : ''}>${text}</button>`;
const icons = ['◆', '◇', '△', '○'];
const STORE = 'dingli-save-v1';
let state = null,
  scene = null,
  selected = 0,
  timer = null,
  autoBattle = false,
  fast = false,
  handoff = false,
  shownActor = -1,
  modalName = '',
  selectedGeneral = 0,
  paused = false;
let low = false,
  reduced = matchMedia('(prefers-reduced-motion: reduce)').matches,
  sound = false,
  audio = null,
  toastTimer;
let saved = null,
  storageWarning = '',
  lastFocus = null,
  lastBattle = false,
  reveal = null;
let animating = false;
try {
  saved = localStorage.getItem(STORE);
} catch (error) {
  storageWarning = `本地自动存档不可用：${error.message}。可手动导出存档。`;
}

export function portrait(id, color = '#d4ad63', lord = false) {
  const v = lord ? id * 5 : id,
    nose = 12 + (v % 3),
    beard = v % 3 !== 1;
  return `<svg viewBox="0 0 160 190" class="portrait" aria-hidden="true">
    <defs><linearGradient id="p${lord ? 'l' : ''}${id}" x2="0" y2="1"><stop stop-color="${color}" stop-opacity=".35"/><stop offset="1" stop-color="#101416"/></linearGradient></defs>
    <rect width="160" height="190" rx="5" fill="url(#p${lord ? 'l' : ''}${id})"/>
    <circle cx="80" cy="75" r="57" fill="none" stroke="${color}" stroke-opacity=".3"/>
    <path d="M12 190Q20 137 51 133L80 146L109 133Q145 138 150 190" fill="${color}"/>
    <path d="M48 135L80 162L111 135L104 188H56Z" fill="#303e43"/>
    <path d="M60 112V142L80 157L100 142V112" fill="#bd9776"/>
    <path d="M48 58Q48 30 80 30Q113 30 113 58L108 104Q101 130 80 136Q57 130 51 105Z" fill="#d1ad89"/>
    <path d="M48 79L43 46Q48 20 80 22Q111 20 118 46L112 85L102 51Q72 64 54 50Z" fill="#252829"/>
    <path d="M42 45L50 22L69 18L73 6H89L93 18L111 23L119 45Z" fill="${lord ? color : '#59646a'}"/>
    <rect x="74" y="15" width="12" height="27" rx="3" fill="#d8bd76"/>
    <path d="M57 77L72 74M89 74L104 78" fill="none" stroke="#30302c" stroke-width="4"/>
    <path d="M61 83L69 82M92 82L100 83" stroke="#272827" stroke-width="3"/>
    <path d="M80 80L${80 - nose / 3} 102L86 103" fill="none" stroke="#ad8267" stroke-width="3"/>
    <path d="M67 113Q80 108 94 113" fill="none" stroke="#433732" stroke-width="3"/>
    ${beard ? '<path d="M60 115Q80 126 101 115Q96 147 80 160Q64 146 60 115Z" fill="#343432"/>' : ''}
    <path d="M40 147L28 180M120 147L133 180" stroke="#e2cc9a" stroke-width="3" opacity=".7"/>
  </svg>`;
}
function toast(text) {
  const el = $('#toast');
  el.textContent = text;
  el.style.display = 'block';
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    el.style.display = 'none';
  }, 5500);
}
function tone() {
  if (!sound) return;
  audio ||= new AudioContext();
  if (audio.state === 'suspended') audio.resume();
  const osc = audio.createOscillator(),
    gain = audio.createGain();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(280, audio.currentTime);
  osc.frequency.exponentialRampToValueAtTime(110, audio.currentTime + 0.18);
  gain.gain.setValueAtTime(0.05, audio.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + 0.25);
  osc.connect(gain);
  gain.connect(audio.destination);
  osc.start();
  osc.stop(audio.currentTime + 0.25);
}
function persist() {
  try {
    localStorage.setItem(STORE, serialize(state));
    saved = serialize(state);
    storageWarning = '';
  } catch (error) {
    storageWarning = `自动保存失败：${error.message}。请手动导出存档。`;
    toast(storageWarning);
  }
}
function exportSave() {
  if (!state) {
    toast('还没有可导出的对局。');
    return;
  }
  const blob = new Blob([serialize(state)], { type: 'application/json' }),
    url = URL.createObjectURL(blob),
    a = document.createElement('a');
  a.href = url;
  a.download = `鼎立-第${state.round}轮.json`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  toast('存档已导出。');
}
function importSave() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json,application/json';
  input.onchange = async () => {
    try {
      const file = input.files?.[0];
      if (!file) return;
      if (file.size > 2 * 1024 * 1024) throw Error('存档不能超过2MB');
      const loaded = deserialize(await file.text());
      state = loaded;
      selected = active(state).pos;
      shownActor = -1;
      paused = false;
      autoBattle = false;
      reveal = null;
      closeModal();
      persist();
      render();
      toast('存档恢复成功。');
    } catch (error) {
      toast(`导入失败，原对局已保留：${error.message}`);
      console.error(error);
    }
  };
  input.click();
}
function home() {
  document.body.classList.remove('playing', 'fighting');
  $('#app').innerHTML = `
    <header class="home-top"><div class="wordmark">鼎立<span>三国大富翁</span></div><span class="offline-dot">完全离线 · 真正 3D</span></header>
    <section class="hero">
      <p class="eyebrow">群雄逐鹿　/　以天下为棋</p><h1>山河入局<br><span>由你鼎立。</span></h1>
      <p class="hero-copy">从一座城池，到一方霸业。<br>置业经商，招贤纳士，在三国沙盘上争一席天下。</p>
      <div class="hero-actions">${action('执棋入局 <span>↗</span>', 'setup', 'primary large')}${saved ? action('续写征程', 'resume', 'large') : ''}</div>
      <div class="hero-secondary">${action('导入存档', 'import', 'text-button')}${action('玩法与史料', 'help', 'text-button')}${action('画质设置', 'settings', 'text-button')}</div>
      <div class="hero-facts"><div><strong>2—4</strong><span>同机真人 / AI</span></div><div><strong>${MAP.length}</strong><span>山水环线 · 城池与机遇</span></div><div><strong>双模式</strong><span>经典商道 / 群雄逐鹿</span></div></div>
    </section>
    <div class="hero-seal"><span>汉末风云</span><b>群<br>雄<br>逐<br>鹿</b><small>建筑与人物均为<br>原创艺术化表现</small></div>
    <footer class="home-bottom"><span>无需安装 · 无需网络 · 双击即玩</span><span>拖动沙盘旋转视角　/　滚轮缩放</span></footer>`;
  if (storageWarning) toast(storageWarning);
}
function playerRows() {
  return state.players
    .map(
      (
        p,
      ) => `<div class="player-row ${p.id === state.turn ? 'current' : ''} ${p.out ? 'out' : ''}" style="--player:${COLORS[p.id]}">
    <span class="player-seal">${LORDS[p.lord].seal}</span><div><strong>${p.name}</strong><small>${p.out ? '已退场' : p.ai ? '谋士执棋 · AI' : '真人执棋'} ${p.jail >= 0 ? '· 拘押' : ''}</small></div>
    <div class="player-money">${money(p.cash)}<small>${owned(state, p.id).length}处产业</small></div></div>`,
    )
    .join('');
}
function tilePanel() {
  const t = MAP[selected],
    a = state.assets[selected],
    p = state.players[actorId(state) ?? state.turn],
    owner = a.owner >= 0 ? state.players[a.owner] : null;
  return `<div class="tile-heading"><small>${t.group >= 0 ? REGIONS[t.group].name : '天下行旅'} · 第${ROUTE_INDEX[selected] + 1}格</small><h2>${t.name}</h2><p>${t.group >= 0 ? REGIONS[t.group].style : tileDescription(t)}${t.landmark ? '<br>城建意象 · ' + t.landmark : ''}</p></div>
    <div class="tile-stats"><div><small>归属</small><b style="color:${owner ? COLORS[owner.id] : 'var(--gold)'}">${owner ? owner.name : '官库'}</b></div><div><small>${a.mortgaged ? '已抵押' : '当前租金'}</small><b>${a.owner >= 0 ? money(rent(state, selected)) : '—'}<em> 金</em></b></div></div>
    ${t.price && t.kind !== 'tax' ? `<div class="stat-line"><span>购入价格</span><b>${t.price} 金</b></div><div class="stat-line"><span>抵押 / 赎回</span><b>${t.price / 2} / ${Math.ceil(t.price * 0.55)} 金</b></div>` : ''}
    ${t.kind === 'city' ? `<div class="stat-line"><span>${BUILDING_NAMES[a.level]}</span><b>${'◆'.repeat(a.level)}${'◇'.repeat(5 - a.level)}</b></div><p class="muted tiny">租金 ${t.rent.join(' / ')}<br>集齐区域：无建筑租金翻倍</p>` : ''}
    ${a.owner === p.id ? `<div class="tile-buttons">${assetButtons(p, t)}</div>` : ''}
    <div class="region-mini">${
      t.group >= 0
        ? MAP.filter((x) => x.group === t.group)
            .map(
              (x) =>
                `<button data-tile="${x.id}" class="${x.id === selected ? 'selected' : ''}"><i style="background:${state.assets[x.id].owner >= 0 ? COLORS[state.assets[x.id].owner] : '#52605d'}"></i>${x.name}</button>`,
            )
            .join('')
        : ''
    }</div>`;
}
function tileDescription(t) {
  return (
    {
      start: '经过领取200金 · 增强模式补给粮草',
      station: '联通商道 · 同类产业越多，租金越高',
      utility: '水路漕运 · 租金由骰点与持有数量决定',
      event: '时局流转 · 机遇藏于前路',
      tax: '履行赋税 · 保持现金储备',
      jail: '停留探监，或等待重获自由',
      rest: '暂歇兵马 · 增强模式解除负伤',
      gojail: '奉命押送 · 移至拘押格',
    }[t.kind] || ''
  );
}
function assetButtons(p, t) {
  const usable = ['roll', 'end', 'debt'].includes(state.phase) && p.id === actorId(state);
  if (!usable) return '<p class="tiny muted">完成当前决策后可管理产业。</p>';
  const a = state.assets[t.id],
    debt = state.phase === 'debt';
  return `${t.kind === 'city' ? `${!debt ? btn(`建设 · ${buildCost(state, p, t.id)}金`, { type: 'asset', action: 'build', tile: t.id }, 'small', a.level === 5) : ''}${btn('拆售一级', { type: 'asset', action: 'sell', tile: t.id }, 'small', !a.level)}${btn('整区拆售', { type: 'asset', action: 'demolish', tile: t.id }, 'small')}` : ''}
    ${a.mortgaged ? (!debt ? btn('赎回产业', { type: 'asset', action: 'redeem', tile: t.id }, 'small') : '') : btn('抵押筹资', { type: 'asset', action: 'mortgage', tile: t.id }, 'small')}`;
}
function prompt() {
  const p = active(state),
    d = state.decision,
    actor = state.players[actorId(state) ?? state.turn],
    ai = actor.ai;
  const heading = (label, title, body, buttons) =>
    `<div class="decision"><div><small class="eyebrow">${label}</small><h2>${title}</h2><p>${body}</p></div><div class="decision-actions">${buttons}</div></div>`;
  switch (state.phase) {
    case 'roll':
      return heading(
        `${p.name} · 行军阶段`,
        p.jail >= 0 ? '暂居拘押，静候转机' : '掷下双骰，前路由此展开',
        p.jail >= 0 ? '双骰相同可获释；第三次失败需支付50金。' : '可以先建设、交易或整备，再掷骰行军。',
        `${p.jail >= 0 ? btn('缴纳50金', { type: 'release', card: false }, '', ai || p.cash < 50) + (p.escape ? btn('使用通关赦令', { type: 'release', card: true }, '', ai) : '') : ''}${btn(ai ? '谋士正在运筹…' : '掷骰行军　⚄', { type: 'roll' }, 'primary roll-button', ai)}`,
      );
    case 'buy':
      return heading(
        '无主产业',
        `${MAP[d.tile].name} · 可纳入版图`,
        `购入 ${MAP[d.tile].price} 金；放弃后全员公开竞价。`,
        btn('购入城池', { type: 'buy' }, 'primary', ai || p.cash < MAP[d.tile].price) +
          btn('放弃并拍卖', { type: 'auction' }, '', ai),
      );
    case 'develop': {
      const level = state.assets[d.tile].level,
        cost = buildCost(state, p, d.tile);
      return heading(
        '自有城池 · 落点建设',
        `${MAP[d.tile].name} · ${BUILDING_NAMES[level]} → ${BUILDING_NAMES[level + 1]}`,
        `本次落点可升级一次，无需集齐区域。费用${cost}金；租金${rent(state, d.tile)} → ${MAP[d.tile].rent[level + 1]}金。`,
        btn(
          `建设${BUILDING_NAMES[level + 1]}`,
          { type: 'develop', choice: 'build' },
          'primary',
          ai || p.cash < cost || (level === 4 ? state.palaces === 0 : state.houses === 0),
        ) + btn('暂不建设', { type: 'develop', choice: 'skip' }, '', ai),
      );
    }
    case 'shop':
      return heading(
        '隐市奇遇 · 秘密商店',
        `${MAP[d.tile].name} · 三件军械限量出售`,
        '每次抵达事件格有25%几率出现。明码标价，离开即收摊；随后继续原格机遇。',
        action('查看秘密商店', 'shop', 'primary') + btn('离开商店，继续机遇', { type: 'shopLeave' }, '', ai),
      );
    case 'rent':
      return heading(
        '抵达敌方产业',
        `${MAP[d.tile].name} · 应付 ${d.amount} 金`,
        state.enhanced
          ? siegeReason(state, p, d.tile) || '可选择交租，或出征夺城；失败仍需交租。'
          : '向领主支付租金，现金不足时可先筹资。',
        btn('交纳租金', { type: 'pay' }, 'primary', ai) +
          (state.enhanced
            ? `<button data-action="siege" ${ai || siegeReason(state, p, d.tile) ? 'disabled' : ''}>点将攻城 · 20粮</button>`
            : ''),
      );
    case 'end':
      return heading(
        `${p.name} · 整备阶段`,
        state.extra ? '双骰相同，再行一步' : '此行已定，整军待发',
        '现在可以管理产业、武将与卡牌。',
        btn(state.extra ? '继续掷骰' : '结束回合', { type: 'end' }, 'primary', ai),
      );
    case 'event':
      return heading(
        '时局际会',
        `${MAP[d.tile].name} · 选择你的机遇`,
        '招贤/军械奖励仅本次落点可领，其他管理操作在整备时进行。',
        ([2, 22].includes(d.tile)
          ? btn('免费招募武将', { type: 'event', choice: 'recruit' }, 'primary', ai)
          : '') +
          (d.tile === 33 ? btn('领取装备', { type: 'event', choice: 'gear' }, 'primary', ai) : '') +
          (d.tile === 7
            ? btn('采购30粮 · 40金', { type: 'event', choice: 'food' }, '', ai || p.cash < 40)
            : '') +
          btn('抽取功能 / 战术卡', { type: 'event', choice: 'card' }, '', ai) +
          btn('探索经典奇遇', { type: 'event', choice: 'classic' }, '', ai),
      );
    case 'auction':
      return heading(
        '公开拍卖',
        `${MAP[d.tile].name} · ${actor.name}应价`,
        `最高价 ${d.bid} 金${d.bidder >= 0 ? ' · ' + state.players[d.bidder].name : ' · 暂无人出价'}；退出后不能重新加入。`,
        `<label class="inline-input">出价<input id="bid" type="number" min="${d.bid + 10}" max="${actor.cash}" value="${d.bid + 10}" step="10"></label><button data-action="bid" class="primary" ${ai ? 'disabled' : ''}>举牌竞价</button>${btn('退出竞价', { type: 'pass' }, '', ai)}`,
      );
    case 'debt':
      return heading(
        '债务清偿',
        `${actor.name} · 尚需 ${Math.max(0, d.amount - actor.cash)} 金`,
        `应付 ${d.amount} 金。可拆售、抵押或交易；无法筹足时破产。`,
        action('管理产业', 'assets') +
          action('协商交易', 'trade') +
          btn('付清债务', { type: 'pay' }, 'primary', ai || actor.cash < d.amount) +
          btn('确认破产', { type: 'bankrupt' }, 'danger', ai || liquidationValue(state, actor) >= d.amount),
      );
    case 'trade':
      return heading(
        '交易提案',
        `${state.players[d.from].name} → ${actor.name}`,
        tradeSummary(d.offer),
        btn('同意交易', { type: 'accept' }, 'primary', ai) + btn('拒绝', { type: 'reject' }, '', ai),
      );
    case 'alliance':
      return heading(
        '盟约提案',
        `${state.players[d.from].name}邀${actor.name}结盟`,
        '持续3轮 · 互免租金 · 互不攻城 · 剩2人自动解盟',
        btn('缔结盟约', { type: 'accept' }, 'primary', ai) + btn('婉拒', { type: 'reject' }, '', ai),
      );
    case 'discard':
      return heading(
        '行囊已满',
        '手牌上限8张，请选择弃牌',
        '弃牌后恢复原来的决策，不影响已经获得的奖励。',
        action('选择要弃的卡', 'cards', 'primary'),
      );
    case 'battle':
      return battlePrompt();
    case 'over': {
      const winner = state.players.find((x) => !x.out);
      return heading(
        '山河一统',
        `${winner.name} · 天下归心`,
        `最终资产 ${money(worth(state, winner))} 金，历经 ${state.round} 轮，拥有 ${owned(state, winner.id).length} 处产业。`,
        action('查看终局', 'victory', 'primary') + action('再启征程', 'restart'),
      );
    }
    default:
      return '';
  }
}
function tradeSummary(o) {
  const item = (id) => (id >= 0 ? MAP[id].name : '无地产');
  return `提案方付出：${item(o.give)}、${o.giveCash}金、${o.giveEscape}张赦令；希望获得：${item(o.take)}、${o.takeCash}金、${o.takeEscape}张赦令。抵押受让方另付本金10%利息。`;
}
function battlePrompt() {
  const b = state.battle,
    u = currentUnit(state),
    actor = state.players[actorId(state)],
    targets = b.units.filter((x) => x.side !== u.side && x.hp > 0),
    skill = skillFor(u),
    options = skillTargets(b, u, skill),
    single = ['enemy', 'ally'].includes(skill.target);
  return `<div class="decision combat-decision"><div><small class="eyebrow">攻城 ${b.round} / 10 回合 · ${actor.name}</small><h2>${u.name}行动 <span class="troop">${u.troop}</span></h2><p>护盾 ${u.shield} · ${u.statuses.map((x) => `${STATUS_NAMES[x.kind]}${x.turns}次`).join(' / ') || '无减益'}</p><p class="combat-description"><b style="color:${skill.color}">${skill.name}</b>：${skill.description}<br>冷却${skill.cooldown}次普攻；当前剩余${u.cooldown}。</p></div><div class="decision-actions">
    <label class="inline-input">普攻目标<select id="battle-target">${targets.map((t) => `<option value="${t.id}">${t.name} · ${t.hp}/${t.max}</option>`).join('')}</select></label>
    <button data-action="attack" ${actor.ai || autoBattle ? 'disabled' : ''}>普攻</button>
    ${single ? `<label class="inline-input">技能目标<select id="skill-target">${options.map((t) => `<option value="${t.id}">${t.name} · ${t.hp}/${t.max}</option>`).join('')}</select></label>` : `<span class="skill-range">${{ self: '自身', allies: '全部友军', enemies: '全部敌军' }[skill.target]}</span>`}
    <button data-action="skill" class="primary" ${actor.ai || autoBattle || u.cooldown || u.statuses.some((x) => x.kind === 'silence') || !options.length ? 'disabled' : ''}>${skill.name}</button>
    ${action('战术卡', 'cards')}${action(autoBattle ? '停止自动' : '自动战斗', 'autoBattle')}</div></div>`;
}
function render() {
  clearTimeout(timer);
  if (animating) return;
  if (!state) {
    home();
    scene?.update(null);
    return;
  }
  document.body.classList.add('playing');
  document.body.classList.toggle('fighting', state.phase === 'battle');
  const id = actorId(state) ?? state.turn,
    actor = state.players[id],
    p = active(state);
  if (shownActor !== id && !actor.ai && state.phase !== 'over' && !(state.phase === 'battle' && autoBattle)) {
    handoff = true;
    shownActor = id;
  }
  if (actor.ai || (state.phase === 'battle' && autoBattle)) shownActor = id;
  const management = ['roll', 'end', 'debt'].includes(state.phase);
  const privateAllowed = !handoff && !actor.ai;
  $('#app').innerHTML = `
    <header class="game-top"><div class="wordmark">鼎立<span>${state.enhanced ? '群雄逐鹿' : '经典商道'}</span></div>
      <div class="turn-label"><small>第 ${state.round} 轮</small><b style="color:${COLORS[p.id]}">${p.name}执棋</b></div>
      <div class="header-resource"><span>金 <b>${money(p.cash)}</b></span>${state.enhanced ? `<span>粮 <b>${p.food}</b></span><span>材 <b>${p.material}</b></span>` : ''}<span class="dice-result" aria-label="最近骰点">${state.dice.map((n) => `<i>${['', '⚀', '⚁', '⚂', '⚃', '⚄', '⚅'][n]}</i>`).join('')}</span></div>
      <div class="header-tools">${action('存档', 'save-menu')}${action('规则', 'help')}${action('⚙', 'settings')}</div>
    </header>
    <aside class="left-hud"><div class="hud-label">天下形势 <span>${state.players.filter((x) => !x.out).length} 位主公</span></div>${playerRows()}
      <div class="chronicle"><div class="hud-label">军情纪事 <span>实时</span></div>${state.log
        .slice(-5)
        .reverse()
        .map((l, i) => `<p class="${i === 0 ? 'latest' : ''}">${esc(l)}</p>`)
        .join('')}</div>
      <div class="inventory-note">官库：${state.houses}民居 / ${state.palaces}都督府</div>
    </aside>
    <aside class="right-hud"><section class="land-panel">${tilePanel()}</section>${
      state.battle
        ? `<section class="battle-roster" aria-label="双方战况">${[0, 1]
            .map(
              (side) =>
                `<h3>${side === 0 ? '攻方阵列' : '守方阵列'}</h3>${state.battle.units
                  .filter((u) => u.side === side)
                  .map(
                    (u) =>
                      `<div class="battle-unit ${u.hp <= 0 ? 'fallen' : ''}"><div><b>${u.name}</b><span>${u.hp}/${u.max}${u.shield ? ' · 盾' + u.shield : ''}</span></div><progress aria-label="${u.name}生命" value="${u.hp}" max="${u.max}"></progress>${u.statuses.length ? `<small>${u.statuses.map((x) => `${STATUS_NAMES[x.kind]}${x.power || ''} · ${x.turns}次`).join(' / ')}</small>` : ''}</div>`,
                  )
                  .join('')}`,
            )
            .join('')}</section><section class="battle-log">${state.battle.log
            .slice(-4)
            .map((t) => `<p>${esc(t)}</p>`)
            .join('')}</section>`
        : ''
    }</aside>
    ${!state.battle ? `<div class="center-banner"><span class="eyebrow">行至${REGIONS[p.region].name} · 山河随行</span><strong>${MAP[p.pos].group >= 0 ? `${MAP[p.pos].name} · ${MAP[p.pos].landmark}` : REGIONS[p.region].style}</strong>${state.enhanced ? `<nav aria-label="中央设施"><button data-facility="roster" ${!privateAllowed ? 'disabled' : ''}>将台 · 点将</button><button data-facility="cards" ${!privateAllowed ? 'disabled' : ''}>锦囊台 · 览策</button><button data-facility="recruit" ${!privateAllowed ? 'disabled' : ''}>军械铺 · 铸装</button></nav>` : ''}</div>` : ''}
    <div class="view-tools">${action('⌂ 复位视角', 'camera')}${!state.battle ? action('跟随主公', 'follow-camera') + action('近看中央', 'center-camera') : ''}${action(fast ? '正常节奏' : '快速 / 跳过动画', 'fast')}${action(paused ? '继续对局' : '暂停', 'pause')}<span>左拖旋转 · 右拖平移 · 滚轮缩放</span></div>
    <section class="bottom-hud"><nav class="game-nav">
      ${action('疆域 / 资产', 'assets')}${action('天下地图', 'map')}
      <button data-action="trade" ${!management || !privateAllowed ? 'disabled' : ''}>交易</button>
      ${state.enhanced ? `<button data-action="roster" ${!privateAllowed ? 'disabled' : ''}>武将 / 装备</button><button data-action="cards" ${!privateAllowed ? 'disabled' : ''}>卡牌${privateAllowed ? ' · ' + actor.cards.length : ''}</button><button data-action="recruit" ${!management || !privateAllowed || state.phase === 'debt' ? 'disabled' : ''}>招贤 / 军械</button><button data-action="diplomacy" ${!privateAllowed ? 'disabled' : ''}>外交 / 补给</button>` : ''}
    </nav>${prompt()}</section>
    ${handoff ? `<div class="handoff"><div class="handoff-card"><div class="seal large-seal" style="--player:${COLORS[id]}">${LORDS[actor.lord].seal}</div><p class="eyebrow">请将操作权交给</p><h1>${actor.name}</h1><p>确认后显示本席手牌与军备。<br>其他玩家请暂时回避屏幕。</p>${action('我已就位，继续', 'handoff', 'primary large')}</div></div>` : ''}
    ${paused ? '<div class="pause-banner">对局已暂停 · 再次点击“继续对局”恢复</div>' : ''}`;
  scene?.update(state);
  scene?.select(selected);
  if (lastBattle && !state.battle) {
    autoBattle = false;
    lastBattle = false;
  } else lastBattle = Boolean(state.battle);
  if (modalName) fillModal(modalName, false);
  if (
    !handoff &&
    !paused &&
    !modalName &&
    !reveal &&
    state.phase !== 'over' &&
    (actor.ai || (state.phase === 'battle' && autoBattle))
  ) {
    timer = setTimeout(
      () => {
        try {
          const c = state.phase === 'battle' && autoBattle ? chooseBattle(state) : choose(state);
          if (c) apply(c, true);
        } catch (error) {
          paused = true;
          toast(`自动决策停止：${error.message}。请导出存档。`);
          console.error(error);
          render();
        }
      },
      fast ? 50 : state.phase === 'battle' ? 650 : 650,
    );
  }
}
function apply(c, automatic = false) {
  if (animating) return;
  if (!state || paused) {
    toast('请先继续对局。');
    return;
  }
  const id = actorId(state);
  if (!automatic && (handoff || state.players[id].ai)) {
    toast('请等待当前主公完成操作。');
    return;
  }
  try {
    const old = state,
      oldItems = active(state).items.length,
      oldGenerals = active(state).generals.length;
    state = command(state, c);
    selected = active(state).pos;
    tone();
    if (c.type === 'roll') {
      scene?.roll(state.dice, fast || reduced);
      if (!reduced) {
        $('#scene').classList.add('dice-flash');
        setTimeout(() => $('#scene').classList.remove('dice-flash'), 600);
      }
    }
    if (
      [
        'siege',
        'accept',
        'reject',
        'alliance',
        'trade',
        'event',
        'discard',
        'bankrupt',
        'shopLeave',
        'develop',
        'battleCard',
      ].includes(c.type) ||
      (c.type === 'card' && state.phase !== old.phase)
    )
      closeModal(false);
    if (
      !automatic &&
      state.enhanced &&
      old.turn === state.turn &&
      ['recruit', 'gear', 'event', 'card', 'shopBuy'].includes(c.type) &&
      (active(state).items.length > oldItems || active(state).generals.length > oldGenerals)
    ) {
      closeModal(false);
      reveal =
        active(state).items.length > oldItems
          ? { kind: 'gear', item: active(state).items.at(-1) }
          : { kind: 'general', general: active(state).generals.at(-1).id };
    }
    persist();
    clearTimeout(timer);
    const played = scene?.playCombat(c, old, state, fast || reduced, () => {
      animating = false;
      document.body.classList.remove('animating');
      $('#combat-banner')?.remove();
      render();
      (
        $('#app .handoff button') ||
        $('#app [data-action="attack"]:not(:disabled)') ||
        $('#app .decision-actions button:not(:disabled)')
      )?.focus();
      if (old.phase !== 'over' && state.phase === 'over') fillModal('victory');
    });
    if (played) {
      animating = true;
      const presentation = combatPresentation(c, old);
      document.body.classList.add('animating');
      document.querySelectorAll('#app button, #app select').forEach((el) => {
        if (el.dataset.action !== 'fast') el.disabled = true;
      });
      const banner = document.createElement('div');
      banner.id = 'combat-banner';
      banner.setAttribute('role', 'status');
      banner.style.setProperty('--skill-color', presentation.color);
      banner.innerHTML = `<small>战意已决 · 招式演出</small><strong>${presentation.name}</strong><span>结果已保存 · 演出不重复结算</span>${action('跳过本次演出', 'skip-combat', 'text-button')}`;
      document.body.append(banner);
      banner.querySelector('button').focus();
      return;
    }
    render();
    scene?.actionEffect(c, old, state, fast || reduced);
    if (reveal) fillModal('reveal');
    if (old.phase !== 'over' && state.phase === 'over') fillModal('victory');
  } catch (error) {
    toast(error.message);
    console.error(error);
  }
}
function openFacility(name) {
  if (!state || !state.enhanced) {
    toast('中央军备设施在增强对局中开放。');
    return;
  }
  if (handoff || state.players[actorId(state) ?? state.turn].ai || animating) {
    toast('请等待当前主公完成操作。');
    return;
  }
  fillModal(name);
}
function ensureDialog() {
  let dialog = $('#dialog');
  if (!dialog) {
    dialog = document.createElement('dialog');
    dialog.id = 'dialog';
    dialog.setAttribute('aria-labelledby', 'dialog-title');
    document.body.append(dialog);
    dialog.addEventListener('cancel', (e) => {
      e.preventDefault();
      closeModal();
    });
    dialog.addEventListener('click', (e) => {
      if (e.target === dialog) closeModal();
    });
  }
  return dialog;
}
function closeModal(reschedule = true) {
  const dialog = $('#dialog');
  if (dialog?.open) dialog.close();
  modalName = '';
  reveal = null;
  if (reschedule) {
    render();
    lastFocus?.focus?.();
  }
}
function fillModal(name, open = true) {
  clearTimeout(timer);
  const dialog = ensureDialog();
  if (open) {
    modalName = name;
    lastFocus = document.activeElement;
  }
  const { title, body } = modalContent(name);
  dialog.innerHTML = `<div class="modal-header"><div><p class="eyebrow">鼎立 · 三国大富翁</p><h2 id="dialog-title">${title}</h2></div><button data-action="close" class="icon-button" aria-label="关闭面板">×</button></div><div class="modal-body">${body}</div>`;
  if (open && !dialog.open) dialog.showModal();
}
function modalContent(name) {
  const p = state ? state.players[actorId(state) ?? state.turn] : null,
    manage = state && ['roll', 'end'].includes(state.phase);
  if (name === 'setup') {
    return {
      title: '择主公，定天下',
      body: `<p class="muted">同机轮流执棋，2–4人真人与AI混合。主公不可重复；主公技能仅增强模式生效。</p>
      <div class="setup-options"><label>入局人数<select id="seat-count"><option value="2">2位主公</option><option value="3" selected>3位主公</option><option value="4">4位主公</option></select></label><label class="toggle"><input id="enhanced" type="checkbox" checked><span>增强玩法 <small>攻城 · 武将 · 六槽装备 · 外交</small></span></label></div>
      <div class="seats">${Array.from({ length: 4 }, (_, i) => `<div class="seat" data-seat="${i}" ${i === 3 ? 'hidden' : ''}><small style="color:${COLORS[i]}">${icons[i]} 第${i + 1}席</small><select aria-label="第${i + 1}席主公" id="lord-${i}">${LORDS.map((l, j) => `<option value="${j}" ${i === j ? 'selected' : ''}>${l.name} · ${l.word}</option>`).join('')}</select><select aria-label="第${i + 1}席类型" id="type-${i}"><option value="human">真人</option><option value="ai" ${i ? 'selected' : ''}>AI谋士</option></select></div>`).join('')}</div>
      <div class="lords-grid">${LORDS.map((l, i) => `<button class="lord-card" data-lord="${i}" style="--lord:${l.color}">${portrait(i, l.color, true)}<div><small>${l.word}</small><h3>${l.name}</h3><b>${l.title}</b><p>${l.skill}</p></div></button>`).join('')}</div>
      <div class="modal-footer"><span class="muted">点击主公卡可为第一席选将。无联网、无付费抽卡。</span>${action('举兵入局　→', 'start', 'primary large')}</div>`,
    };
  }
  if (name === 'assets') {
    const owner = state.phase === 'debt' ? p : active(state),
      tiles = owned(state, owner.id);
    return {
      title: `${owner.name} · 疆域产业`,
      body: `<div class="resource-strip"><span>现金 <b>${money(owner.cash)}</b></span><span>总资产 <b>${money(worth(state, owner))}</b></span><span>产业 <b>${tiles.length}</b></span></div><p class="muted">整备建设需集齐同色区域并均匀升级。${state.enhanced ? '增强模式还可在停到自有城池时单独升级一次，无需集齐区域。' : ''}抵押前需清空区域建筑；整区拆售可直接拆除自有建筑，包括都督府。</p>
      <div class="asset-grid">${tiles.map((t) => `<article class="asset-card" style="--region:${t.group >= 0 ? REGIONS[t.group].color : '#d4ad63'}"><small>${t.group >= 0 ? REGIONS[t.group].name : t.kind === 'station' ? '驿站' : '漕运'}</small><h3>${t.name}</h3><p>${state.assets[t.id].mortgaged ? '已抵押' : `${state.assets[t.id].level}级 · 租金${rent(state, t.id)}金`}</p><div class="wrap">${assetButtons(owner, t)}</div></article>`).join('') || '<div class="empty">尚无产业。行军抵达无主城池后即可购买，或在公开拍卖中竞得。</div>'}</div>`,
    };
  }
  if (name === 'map') {
    return {
      title: '四十格 · 天下图录',
      body: `<p class="muted">64格山水环线，下列编号即行军顺序。城池间的山林、花草与溪桥不计步数；点击可近看该地，复位视角返回全图。古地名跨汉末至三国使用，路线与地形不代表真实地理比例。</p><div class="map-grid">${ROUTE.map(
        (id, index) => {
          const t = MAP[id];
          return `<button data-tile="${t.id}" style="--region:${t.group >= 0 ? REGIONS[t.group].color : '#859a94'}"><small>${String(index + 1).padStart(2, '0')} · ${t.group >= 0 ? REGIONS[t.group].name : '行旅'}</small><strong>${t.name}</strong><span>${state.assets[t.id].owner >= 0 ? state.players[state.assets[t.id].owner].name : t.price ? t.price + '金' : '机遇'}</span></button>`;
        },
      ).join('')}</div>`,
    };
  }
  if (name === 'trade') {
    const available = state.players.filter((x) => !x.out && x.id !== p.id);
    return {
      title: '互通有无 · 协商交易',
      body: `<p class="muted">交易需对方同意。区域存在建筑时不能交易其中地产；抵押受让方额外缴纳抵押本金10%的费用，原抵押保持。</p><form id="trade-form"><div class="trade-columns"><section><h3>你的付出</h3><label>产业<select name="give"><option value="-1">不提供地产</option>${owned(
        state,
        p.id,
      )
        .map((t) => `<option value="${t.id}">${t.name}</option>`)
        .join(
          '',
        )}</select></label><label>金币<input name="giveCash" type="number" min="0" value="0"></label><label>通关赦令<input name="giveEscape" type="number" min="0" max="${p.escape}" value="0"></label></section>
      <section><h3>希望换得</h3><label>对方主公<select name="to" id="trade-to">${available.map((x) => `<option value="${x.id}">${x.name}</option>`).join('')}</select></label><label>产业<select name="take" id="trade-take"><option value="-1">不索要地产</option>${owned(
        state,
        available[0].id,
      )
        .map((t) => `<option value="${t.id}">${t.name}</option>`)
        .join(
          '',
        )}</select></label><label>金币<input name="takeCash" type="number" min="0" value="0"></label><label>通关赦令<input name="takeEscape" type="number" min="0" value="0"></label></section></div><div class="modal-footer">${action('递交提案', 'send-trade', 'primary')}</div></form>`,
    };
  }
  if (name === 'roster') {
    const g = p.generals.find((x) => x.id === selectedGeneral) || p.generals[0];
    selectedGeneral = g.id;
    const d = GENERALS[g.id],
      stat = stats(p, g),
      bonds = BONDS.filter((b) => b.members.includes(g.id));
    return {
      title: `${p.name} · 将府军备`,
      body: `<div class="roster-layout"><div class="general-list">${p.generals.map((x) => `<button data-general="${x.id}" class="${x.id === g.id ? 'selected' : ''}"><span>${GENERALS[x.id].name}</span><small>${GENERALS[x.id].troop} · Lv.${x.level}${x.injury ? ' · 负伤' : x.guard >= 0 ? ' · 驻守' : ''}</small></button>`).join('')}</div>
      <div class="general-detail"><div class="general-hero">${portrait(g.id, QUALITY_COLORS[d.rarity + 1])}<div><small>${d.faction} · ${['', '良将', '英杰', '名将'][d.rarity]}</small><h1>${d.name}</h1><p>${d.troop}兵 · Lv.${g.level} · ${g.injury ? '负伤，待下次正常回合结束恢复' : g.guard >= 0 ? '驻守' + MAP[g.guard].name : '可出征'}</p><div class="numbers"><span>生命 <b>${stat.hp}</b></span><span>攻击 <b>${stat.atk}</b></span><span>防御 <b>${stat.def}</b></span><span>速度 <b>${stat.speed}</b></span></div><p class="muted">技能：${d.ability} · ${d.abilityDescription}<br>冷却：${SKILLS[g.id].cooldown}次普攻后可再次施放。${bonds.length ? '<br>羁绊：' + bonds.map((b) => b.name + '（出阵至少2名）').join('、') : ''}</p>${btn(`培养 · ${g.level * 30}金 / ${g.level}材料`, { type: 'train', general: g.id }, 'primary small', !manage || g.level >= 10)}</div></div>
      <div class="equipment-grid">${SLOTS.map((slot, i) => {
        const item = p.items.find((x) => x.id === g.gear[i]),
          color = item ? QUALITY_COLORS[item.quality] : '#75817a';
        const options = p.items.filter((x) => x.slot === i && !p.generals.some((y) => y.gear.includes(x.id)));
        return `<section class="equipment-slot q${item?.quality ?? 0}" style="--quality:${color}"><small>${slot}</small><div class="equip-glyph">${['♜', '✦', '⚔', '◇', '║', '↟'][i]}</div><h3>${item ? ITEMS[i] : '空置'}</h3><p>${item ? QUALITY[item.quality] : '尚未装备'}</p><select aria-label="${slot}装备" data-equip="${i}" ${!manage ? 'disabled' : ''}><option value="">选择可用装备</option>${options.map((x) => `<option value="${x.id}">${QUALITY[x.quality]} ${ITEMS[i]} #${x.id}</option>`).join('')}</select>${item ? btn('卸下', { type: 'equip', general: g.id, slot: i, item: null }, 'text-button', !manage) : ''}</section>`;
      }).join(
        '',
      )}</div><div class="guard-control"><label>驻守城池<select id="guard-tile" ${!manage ? 'disabled' : ''}><option value="-1">空闲 · 可出征</option>${owned(
        state,
        p.id,
      )
        .filter((t) => t.kind === 'city')
        .map((t) => `<option value="${t.id}" ${g.guard === t.id ? 'selected' : ''}>${t.name}</option>`)
        .join(
          '',
        )}</select></label><button data-action="guard" ${!manage || g.injury ? 'disabled' : ''}>调动驻守</button><span class="muted tiny">每城最多3将；驻守武将不可同时出征。</span></div><p class="tiny muted">人物来源：${d.source}。属性、技能和品质均为游戏设计。</p></div></div>`,
    };
  }
  if (name === 'cards') {
    const battle = state.phase === 'battle',
      discard = state.phase === 'discard';
    return {
      title: discard ? '选择弃牌 · 行囊上限8张' : battle ? '战术锦囊' : '行军锦囊',
      body: `<p class="muted">${battle ? '每名武将每次行动可先用1张战术卡，再普攻或施放技能。' : discard ? '选择一张卡丢弃，随后继续原来的流程。' : '每个正常回合最多主动使用2张功能卡。战术卡只能在战斗中使用。'}</p>
      ${
        battle
          ? `<label>战术目标<select id="card-target">${state.battle.units
              .filter((u) => u.side !== currentUnit(state).side && u.hp > 0)
              .map((u) => `<option value="${u.id}">${u.name} · ${u.hp}生命</option>`)
              .join('')}</select></label>`
          : ''
      }
      <div class="cards-grid">${
        p.cards
          .map((id, index) => {
            const card = CARDS[id];
            return `<article class="tactic-card"><small>${card.timing === 'board' ? '行军 · 功能卡' : '攻城 · 战术卡'}</small><div class="card-symbol">${card.timing === 'board' ? '令' : '策'}</div><h3>${card.name}</h3><p>${card.description}</p>${discard ? btn('弃置此卡', { type: 'discard', index }) : battle ? `<button data-card="${index}" ${card.timing !== 'battle' || state.battle.cardUsed ? 'disabled' : ''}>使用战术</button>` : btn('施用此计', { type: 'card', index }, '', !manage || card.timing !== 'board' || p.usedCards >= 2)}</article>`;
          })
          .join('') || '<div class="empty">暂无锦囊。抵达机遇格可以抽取功能卡与战术卡。</div>'
      }</div>`,
    };
  }
  if (name === 'recruit') {
    return {
      title: '广纳英杰 · 整备三军',
      body: `<div class="recruit-banner"><span class="seal">贤</span><div><p class="eyebrow">四十英杰　等待知遇</p><h1>英雄，不问来处。</h1><p>全部使用游戏内金币，无付费内容。相同武将转为稀有度×2份培养材料。</p></div></div><div class="trade-columns"><article class="recruit-box"><h3>招贤榜</h3><p>良将 65% · 英杰 30% · 名将 5%</p><p>连续19次未出名将，第20次必出；当前 <b>${p.pity} / 19</b>。</p>${btn(`招募一将 · ${p.lord === 0 ? 80 : 100}金`, { type: 'recruit' }, 'primary', !manage)}</article><article class="recruit-box"><h3>军械坊</h3><p>六个装备部位等概率；品质概率：</p><p>素品45% / 良品30% / 上品16% / 珍品7% / 绝品2%</p>${btn('铸取装备 · 80金', { type: 'gear' }, 'primary', !manage)}</article></div><p class="tiny muted">装备品质影响属性、轮廓微光及战场部位光效。背包内装备可在“武将 / 装备”中分配。</p>`,
    };
  }
  if (name === 'shop' && state.phase === 'shop') {
    return {
      title: '隐市 · 灯火中的珍藏',
      body: `<div class="shop-intro"><div class="seal">隐</div><div><p class="eyebrow">仅此一次的相逢</p><h1>识货者，自有所得。</h1><p>库存已固定，读档不会刷新。每件仅售一次，收摊后不可返回。</p></div></div>
      <div class="shop-offers">${state.decision.offers.map((o, index) => `<article class="equipment-slot q${o.item.quality} ${o.sold ? 'sold' : ''}" style="--quality:${QUALITY_COLORS[o.item.quality]}"><small>${SLOTS[o.item.slot]} · ${QUALITY[o.item.quality]}</small><div class="equip-glyph">${['♜', '✦', '⚔', '◇', '║', '↟'][o.item.slot]}</div><h3>${ITEMS[o.item.slot]}</h3><p>${o.price} 金</p>${btn(o.sold ? '已售出' : '购买装备', { type: 'shopBuy', index }, 'primary', o.sold || p.ai || p.cash < o.price)}</article>`).join('')}</div>
      <div class="modal-footer"><span>现有 ${money(p.cash)} 金 · 装备可在将台中穿戴</span>${btn('收摊离开', { type: 'shopLeave' }, '', p.ai)}</div>`,
    };
  }
  if (name === 'siege') {
    const ready = readyGenerals(p),
      id = state.decision.tile,
      def = state.players[state.assets[id].owner],
      guards = def.generals.filter((g) => g.guard === id && g.injury === 0);
    return {
      title: `点将出征 · ${MAP[id].name}`,
      body: `<div class="resource-strip"><span>出征 <b>20粮</b></span><span>失败需交 <b>${state.decision.amount}金</b></span><span>守军 <b>${guards.length || 1}队 + 城墙</b></span></div><p class="muted">攻胜夺城免租，攻败武将负伤至下一正常回合结束，不永久死亡、不丢装备；10个战斗回合未攻克则守方胜。城墙提供6点守军防御。</p><p>敌方驻军：${guards.map((g) => GENERALS[g.id].name).join('、') || '基础守城军'}；城墙耐久 ${65 + state.assets[id].level * 30}。</p><h3>选择1–3名武将</h3><div class="siege-picks">${ready.map((g, i) => `<label class="siege-pick"><input type="checkbox" name="siege-general" value="${g.id}" ${i < 3 ? 'checked' : ''}>${portrait(g.id)}<strong>${GENERALS[g.id].name}</strong><span>${GENERALS[g.id].troop}兵 · Lv.${g.level}</span></label>`).join('')}</div><div class="modal-footer">${action('鸣鼓攻城', 'begin-siege', 'primary large')}</div>`,
    };
  }
  if (name === 'diplomacy') {
    return {
      title: '纵横捭阖 · 粮草军需',
      body: `<p class="muted">两人临时结盟持续3轮，每人最多1名盟友；互免租金、互不攻城。最后2人时解盟，最终仅一名胜者。</p><div class="diplomacy-grid">${state.players
        .filter((x) => !x.out && x.id !== p.id)
        .map((x) => {
          const pact = state.alliances.find((a) => [a.a, a.b].includes(p.id) && [a.a, a.b].includes(x.id));
          return `<article class="recruit-box"><div class="seal" style="--player:${COLORS[x.id]}">${LORDS[x.lord].seal}</div><h3>${x.name}</h3><p>${pact ? '盟约至第' + pact.expires + '轮' : '暂无盟约'}</p>${btn('提议结盟', { type: 'alliance', target: x.id }, '', !manage || !canAlly(state, p.id, x.id))}</article>`;
        })
        .join(
          '',
        )}</div><div class="resource-strip"><span>现有粮草 <b>${p.food}</b></span><span>每次出征 <b>20粮</b></span><span>经过起点 <b>+${p.lord === 0 ? 50 : 30}粮</b></span></div><p class="muted">粮草不随日常回合消耗。集市采购需要当前位置为集市格；资金不足时不能购入。</p>${btn('集市采购 · 40金换30粮', { type: 'food' }, 'primary', !manage || p.pos !== 7 || p.cash < 40)}`,
    };
  }
  if (name === 'reveal' && reveal) {
    const gear = reveal.kind === 'gear',
      item = reveal.item,
      name = gear ? ITEMS[item.slot] : GENERALS[reveal.general].name,
      color = gear ? QUALITY_COLORS[item.quality] : QUALITY_COLORS[GENERALS[reveal.general].rarity + 1];
    return {
      title: gear ? '军械入库' : '英杰来归',
      body: `<div class="reveal-stage" style="--quality:${color}"><div class="reveal-rays"></div><div class="reveal-card">${gear ? `<div class="revealed-item">${['♜', '✦', '⚔', '◇', '║', '↟'][item.slot]}</div><p>${SLOTS[item.slot]} · ${QUALITY[item.quality]}</p>` : portrait(reveal.general, color)}<h1>${name}</h1><p>${gear ? '可前往将府，为武将穿戴。' : GENERALS[reveal.general].faction + ' · ' + GENERALS[reveal.general].troop + '兵'}</p></div>${action('收入麾下 · 继续', 'close', 'primary')}</div>`,
    };
  }
  if (name === 'victory') {
    const winner = state.players.find((x) => !x.out);
    return {
      title: '尘埃落定 · 山河归一',
      body: `<div class="victory">${portrait(winner.lord, LORDS[winner.lord].color, true)}<p class="eyebrow">天下归心</p><h1>${winner.name} · 胜</h1><p>${LORDS[winner.lord].quote}</p><div class="resource-strip"><span>总资产 <b>${money(worth(state, winner))}</b></span><span>拥有产业 <b>${owned(state, winner.id).length}</b></span><span>对局轮次 <b>${state.round}</b></span></div>${action('再启征程', 'restart', 'primary large')}</div>`,
    };
  }
  if (name === 'save-menu') {
    return {
      title: '封存兵符 · 存档',
      body: `<div class="note-box">${storageWarning || '每次有效行动后自动保存至此浏览器。文件移动或浏览器改变后，请通过JSON文件恢复。'}</div><div class="modal-footer">${action('手动保存', 'save', 'primary')}${action('导出JSON存档', 'export')}${action('导入JSON存档', 'import')}${action('返回主菜单', 'menu', 'danger')}</div><p class="tiny muted">导入失败不会覆盖当前对局。单文件离线模式下，本地存储行为取决于浏览器；建议定期导出。</p>`,
    };
  }
  if (name === 'settings') {
    return {
      title: '画面与声音',
      body: `<div class="settings-list"><label><input type="checkbox" id="low" ${low ? 'checked' : ''}><span>低画质<small>关闭实时阴影、环境粒子，降低渲染分辨率</small></span></label><label><input type="checkbox" id="reduced" ${reduced ? 'checked' : ''}><span>减少动态效果<small>减少漂浮、抽卡光效和棋子移动动画</small></span></label><label><input type="checkbox" id="sound" ${sound ? 'checked' : ''}><span>启用音效<small>本地合成，不加载外部声音</small></span></label><label><input type="checkbox" id="fast" ${fast ? 'checked' : ''}><span>快速节奏<small>加快AI与自动战斗，不改变结算结果</small></span></label></div>${action('保存设置', 'apply-settings', 'primary')}`,
    };
  }
  if (name === 'restart') {
    return {
      title: '开启新征程',
      body: `<p>新开局会替换浏览器内的自动存档。可先导出当前对局。</p><div class="modal-footer">${action('导出当前存档', 'export')}${action('确认新开局', 'new-game', 'primary')}${action('继续当前对局', 'close')}</div>`,
    };
  }
  return {
    title: '行棋有道 · 玩法与史料',
    body: `<div class="help-content">
    <section><h3>一 · 置业与胜负</h3><p>2–4位主公轮流掷双骰，经过誓师台获得200金。购买无主产业，向过路对手收租；不购买则公开拍卖。只有最后一位未破产的主公获胜，没有隐藏的回合判胜。</p><p>双骰相同可再掷一次，连续三次被拘押。拘押后可付50金、使用通关赦令，或尝试双骰；第三次失败必须付费并继续移动。</p></section>
    <section><h3>二 · 建设、抵押与交易</h3><p>集齐同色区域后，无建筑租金翻倍，可在整备阶段均匀建设。增强模式额外允许停在自有、未抵押城池时升级一次，不必集齐区域；路过不触发。经典模式保留整区均匀建设。</p><p>建筑由空地升级为民居、里坊、商署、城楼、都督府，模型逐阶变化。1—4级每级占用1份民居配额；升都督府返还4份。64格地图的官库有${HOUSE_SUPPLY}份民居配额、${PALACE_SUPPLY}座都督府，租金表可点击城池查看。旧档迁移保留全部原资产与建筑，补充官库容量；新增24城初始无主，集齐区域需包括新城。</p><p>拆售回收基础造价的一半。抵押前需清空该区域建筑；抵押获得地价的一半，赎回需地价55%。抵押资产不收租，转让受让人另缴地价5%的利息。驿站按持有数量收租；漕运按骰点×4或×10收租。</p><p>债务阶段可以拆售、抵押或协商交易，仍无法偿还才能破产。向玩家破产则资产交债权人；向官库破产则资产公开拍卖。</p></section>
    <section><h3>三 · 群雄逐鹿（默认开启）</h3><p>招贤格可免费招募武将，军械格可领装备，机遇格可抽功能/战术卡；整备时也可用金币招募和铸取装备。武将65%良将、30%英杰、5%名将，连续19次未出名将则第20次必出。重复武将转换材料。</p><p>六槽为头、手、武器、铠甲、护腿、脚。五档品质有独立属性与部位光效；背包中同一件装备不能同时被两人穿戴。武将最高10级，升级消耗当前等级×30金和等量材料。</p><p>每回合最多主动使用2张功能卡，手牌上限8张。羁绊要求对应组合至少2名武将同时出阵，最多触发2组。</p></section>
    <section><h3>四 · 攻城与纵横</h3><p>落到未抵押敌城，可选择交租或攻城。每人每轮最多出征一次，耗20粮，最多派3将。城墙为守军提供6防御；攻克城墙和全部守军即夺城免租。10回合内未攻下则守方胜，败方交租、参战武将暂时负伤；装备不丢。</p><p>步克骑、骑克弓、弓克步；克制×1.3、被克×0.8。40名武将各有独立技能，详情见将台及战斗行动栏。技能包含连击、群攻、破甲、吸血、治疗、护盾和减益，冷却2—4次普攻；每次武将行动可先用一张战术卡。</p><p>护盾优先吸收伤害，上限为自身生命上限的2倍。灼烧、中毒在受影响单位行动结束时结算；虚弱减攻击、易伤增加每次攻击伤害、封技禁用技能，仍可普攻。状态按自身行动次数到期，同类状态取较强效果与较长剩余时长；城墙不受减益，群体武将技能不包含城墙。技能属性提升仅持续本场战斗。</p><p>攻击有起手、出击、命中和归位；自动战斗等待演出，随时可跳过本次或开启快速节奏，均不改变已保存结果。</p><p>粮草仅出征消耗，经过起点补给30粮，集市可40金购买30粮。两人结盟3轮，互免租金、互不攻城；每人最多一位盟友，剩两名玩家即解盟。</p></section>
    <section><h3>隐市与中央沙盘</h3><p>增强模式每次抵达事件格有25%概率出现秘密商店，固定展示3件随机装备。五档售价依次为70、120、210、350、550金，每件限购一次，读档不刷新；离开后继续原事件奖励。通常军械抽取仍然保留。</p><p>中央将台展示至多3名可出征武将，点击查看全体阵容；锦囊台打开手牌，军械铺打开招募与装备抽取（整备时可操作）。上方同名按钮可用键盘操作。地域景观跟随当前执棋主公的落点，在特殊格沿用其最近地域。</p></section>
    <section><h3>五 · 七位主公</h3>${LORDS.map((l) => `<p><b>${l.name} · ${l.title}</b>　${l.skill}</p>`).join('')}<p>关闭增强模式后，上述技能、攻城、养成和抽卡全部关闭，所有主公仅为外观身份。</p></section>
    <section><h3>六 · 史实边界与参考</h3><p>人物、城池名称取自汉末三国相关记载，允许跨年代同场。建业采用建安十七年更名后的称呼，“许”采用汉末称呼，“吴”“会稽”等为当时地名。区域是玩法与视觉分组，不等同某一年的行政区；驿站冠以真实地点名，经营设施与建筑为原创艺术化设计，不是考古复原。技能、数值、五档品质及羁绊为游戏规则。</p><p>人物依据《三国志》相关传记，张角兄弟参考《后汉书》卷71，司马懿参考《晋书》卷1。人物详情标明对应卷次。游戏本身不需要访问以下资料链接：</p>${SOURCES.map(([label, url]) => `<p><a href="${url}" target="_blank" rel="noopener noreferrer">${label} ↗</a></p>`).join('')}<p>Three.js 使用 MIT 许可，完整许可随本HTML内嵌。所有人物头像、几何建筑、棋子及音效由程序生成。</p></section>
  </div>`,
  };
}
function start() {
  const count = Number($('#seat-count').value),
    seats = Array.from({ length: count }, (_, i) => ({
      lord: Number($(`#lord-${i}`).value),
      ai: $(`#type-${i}`).value === 'ai',
    }));
  if (seats.every((p) => p.ai)) {
    toast('正式对局至少需要一位真人。');
    return;
  }
  try {
    state = createGame(seats, $('#enhanced').checked);
    selected = 0;
    shownActor = -1;
    paused = false;
    autoBattle = false;
    closeModal(false);
    persist();
    render();
    scene?.reset();
  } catch (error) {
    toast(error.message);
  }
}
function submitTrade() {
  const form = new FormData($('#trade-form')),
    offer = Object.fromEntries([...form].map(([k, v]) => [k, Number(v)]));
  closeModal(false);
  apply({ type: 'trade', offer });
}
document.addEventListener('submit', (event) => {
  if (event.target.id === 'trade-form') {
    event.preventDefault();
    submitTrade();
  }
});
document.addEventListener('click', (event) => {
  const button = event.target.closest('button');
  if (!button || button.disabled) return;
  event.preventDefault();
  if (button.dataset.cmd) {
    apply(JSON.parse(button.dataset.cmd));
    return;
  }
  if (button.dataset.tile !== undefined) {
    selected = Number(button.dataset.tile);
    closeModal(false);
    render();
    scene?.focusTile(selected);
    return;
  }
  if (button.dataset.general !== undefined) {
    selectedGeneral = Number(button.dataset.general);
    fillModal('roster', false);
    return;
  }
  if (button.dataset.lord !== undefined) {
    $('#lord-0').value = button.dataset.lord;
    document.querySelectorAll('.lord-card').forEach((x) => x.classList.toggle('selected', x === button));
    return;
  }
  if (button.dataset.card !== undefined) {
    apply({
      type: 'battleCard',
      index: Number(button.dataset.card),
      target: Number($('#card-target').value),
    });
    return;
  }
  const name = button.dataset.action;
  if (animating) {
    if (name === 'skip-combat' || name === 'fast') {
      if (name === 'fast') fast = true;
      scene?.finishCombat();
    }
    return;
  }
  if (button.dataset.facility) {
    openFacility(button.dataset.facility);
    return;
  }
  if (!name) return;
  if (name === 'close') {
    closeModal();
    return;
  }
  if (name === 'start') {
    start();
    return;
  }
  if (name === 'new-game') {
    closeModal(false);
    fillModal('setup');
    return;
  }
  if (name === 'resume') {
    try {
      state = deserialize(saved);
      shownActor = -1;
      selected = active(state).pos;
      render();
    } catch (error) {
      toast(`无法续玩：${error.message}。可导入其他存档。`);
    }
    return;
  }
  if (name === 'handoff') {
    handoff = false;
    render();
    return;
  }
  if (name === 'camera') {
    scene?.reset();
    return;
  }
  if (name === 'follow-camera') {
    scene?.focusTile(active(state).pos, true);
    return;
  }
  if (name === 'center-camera') {
    scene?.focusCenter();
    return;
  }
  if (name === 'fast') {
    fast = !fast;
    render();
    return;
  }
  if (name === 'pause') {
    paused = !paused;
    render();
    return;
  }
  if (name === 'autoBattle') {
    autoBattle = !autoBattle;
    render();
    return;
  }
  if (name === 'save') {
    persist();
    toast(storageWarning || '当前对局已保存。');
    return;
  }
  if (name === 'export') {
    exportSave();
    return;
  }
  if (name === 'import') {
    importSave();
    return;
  }
  if (name === 'menu') {
    closeModal(false);
    state = null;
    shownActor = -1;
    handoff = false;
    paused = false;
    render();
    return;
  }
  if (name === 'bid') {
    apply({ type: 'bid', amount: Number($('#bid').value) });
    return;
  }
  if (name === 'attack' || name === 'skill') {
    const u = currentUnit(state);
    const target =
      name === 'attack'
        ? Number($('#battle-target').value)
        : $('#skill-target')
          ? Number($('#skill-target').value)
          : skillTargets(state.battle, u, skillFor(u))[0].id;
    apply({ type: name, target });
    return;
  }
  if (name === 'begin-siege') {
    apply({
      type: 'siege',
      generals: [...document.querySelectorAll('[name="siege-general"]:checked')].map((x) => Number(x.value)),
    });
    return;
  }
  if (name === 'guard') {
    apply({ type: 'guard', general: selectedGeneral, tile: Number($('#guard-tile').value) });
    return;
  }
  if (name === 'send-trade') {
    submitTrade();
    return;
  }
  if (name === 'apply-settings') {
    low = $('#low').checked;
    reduced = $('#reduced').checked;
    sound = $('#sound').checked;
    fast = $('#fast').checked;
    document.body.classList.toggle('reduced', reduced);
    scene?.settings(low, reduced);
    tone();
    closeModal();
    return;
  }
  fillModal(name);
});
document.addEventListener('change', (event) => {
  const input = event.target;
  if (input.id === 'seat-count')
    document.querySelectorAll('[data-seat]').forEach((el) => {
      el.hidden = Number(el.dataset.seat) >= Number(input.value);
    });
  if (input.id === 'trade-to')
    $('#trade-take').innerHTML =
      '<option value="-1">不索要地产</option>' +
      owned(state, Number(input.value))
        .map((t) => `<option value="${t.id}">${t.name}</option>`)
        .join('');
  if (input.dataset.equip !== undefined && input.value)
    apply({
      type: 'equip',
      general: selectedGeneral,
      slot: Number(input.dataset.equip),
      item: Number(input.value),
    });
});
try {
  scene = new GameScene(
    $('#scene'),
    (id) => {
      selected = id;
      if (state && !handoff) render();
    },
    toast,
    openFacility,
  );
} catch (error) {
  const warning = document.createElement('div');
  warning.className = 'graphics-error';
  warning.textContent = `无法启动3D画面：${error.message}。请启用硬件加速并使用支持WebGL2的新版Edge或Chrome，然后刷新。`;
  document.body.append(warning);
  console.error(error);
}
render();
