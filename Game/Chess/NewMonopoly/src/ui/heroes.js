import { GENERALS, LORDS, MAP, SLOTS, ITEMS, QUALITY, QUALITY_COLORS, BONDS } from '../data/game.js';
import { BIOGRAPHIES } from '../data/people.js';
import { skillById, MANUAL_SKILLS } from '../data/skills.js';
import {
  TITLES,
  RELICS,
  MAX_LEVEL,
  UNLOCK_LEVELS,
  xpNeeded,
  trainingExperience,
} from '../data/progression.js';
import { fighters, fighter, fighterName, fighterTroop, skillPath } from '../core/progression.js';
import { stats, owned } from '../core/engine.js';

export function rosterContent(state, p, selected, ui) {
  const { esc, btn, portrait } = ui,
    g = fighter(p, selected) || p.generals[0] || p.hero;
  const lord = g.id === -1,
    name = fighterName(p, g),
    title = TITLES[g.title],
    stat = stats(p, g);
  const manage = ['roll', 'end'].includes(state.phase) && !p.ai;
  const path = skillPath(p, g);
  const choices = (slot) =>
    path
      .filter((_, i) => g.level >= UNLOCK_LEVELS[i])
      .map(
        (id) =>
          `<option value="${id}" ${g.loadout[slot] === id ? 'selected' : ''}>${skillById(id).name}</option>`,
      )
      .join('');
  return {
    title: `${p.name} · 将府军备`,
    body: `<div class="roster-layout"><div class="general-list">${fighters(p)
      .map(
        (x) =>
          `<button data-general="${x.id}" class="${x.id === g.id ? 'selected' : ''}"><span>${x.id === -1 ? '主公 · ' : ''}${fighterName(p, x)}</span><small>Lv.${x.level} · ${TITLES[x.title]?.name || '初出茅庐'}${x.injury ? ' · 负伤' : ''}</small></button>`,
      )
      .join('')}</div>
    <div class="general-detail"><div class="general-hero"><button class="portrait-button" data-bio="${esc(name)}" aria-label="查看${name}生平事迹">${portrait(lord ? p.lord : g.id, lord ? LORDS[p.lord].color : QUALITY_COLORS[GENERALS[g.id].rarity + 1], lord)}</button>
    <div><small>${lord ? '主公 · 独立参战位' : GENERALS[g.id].faction}</small><h1>${name}</h1><span class="rank-seal" style="--rank:${title?.color || '#a9b5a6'}">${title?.name || '初出茅庐'}</span><p>${fighterTroop(p, g)}兵 · Lv.${g.level} · ${g.injury ? '负伤，待正常回合结束恢复' : g.guard >= 0 ? '驻守' + MAP[g.guard].name : '可出征'}</p>
    <label class="experience-label">经验 ${g.level === MAX_LEVEL ? '已满级' : `${g.xp} / ${xpNeeded(g.level)}`}<progress class="experience-bar" value="${g.level === MAX_LEVEL ? 1 : g.xp}" max="${g.level === MAX_LEVEL ? 1 : xpNeeded(g.level)}"></progress></label>
    <div class="numbers"><span>生命 <b>${stat.hp}</b></span><span>攻击 <b>${stat.atk}</b></span><span>防御 <b>${stat.def}</b></span><span>速度 <b>${stat.speed}</b></span></div>
    <div class="wrap">${btn(`训练 +${trainingExperience(g.level)}经验 · ${g.level * 30}金 / ${g.level}材料`, { type: 'train', general: g.id }, 'primary small', !manage || g.level >= MAX_LEVEL)}<button data-bio="${esc(name)}">生平事迹</button></div></div></div>
    <section class="growth-panel"><h3>军功称号</h3><label>当前称号<select data-hero-choice="title" ${!manage ? 'disabled' : ''}><option value="-1" ${g.title < 0 ? 'selected' : ''}>不佩戴称号</option>${TITLES.map((t) => `<option value="${t.id}" ${g.title === t.id ? 'selected' : ''} ${g.level < t.level ? 'disabled' : ''}>Lv.${t.level} ${t.name} · 生命+${t.hp} 攻+${t.atk} 防+${t.def} 速+${t.speed}</option>`).join('')}</select></label><p class="tiny muted">每5级解锁，仅佩戴的称号生效。文武官职作为游戏荣誉序列，并非史实晋升顺序。</p></section>
    <section class="growth-panel"><h3>出战技能</h3><div class="skill-loadout">${[0, 1].map((slot) => `<label>常规技能${slot + 1}<select data-skill-slot="${slot}" ${!manage || (slot === 1 && g.level < 5) ? 'disabled' : ''}>${slot === 1 && g.loadout[1] === undefined ? '<option value="">5级解锁第二技能槽</option>' : ''}${choices(slot)}</select></label>`).join('')}</div>
    <div class="skill-path">${path
      .map((id, i) => {
        const s = skillById(id);
        return `<article class="${g.level < UNLOCK_LEVELS[i] ? 'locked-skill' : ''}"><small>Lv.${UNLOCK_LEVELS[i]} ${g.level >= UNLOCK_LEVELS[i] ? '已解锁' : '未解锁'}</small><h4 style="color:${s.color}">${s.name}</h4><p>${s.description}</p><small>冷却${s.cooldown}次行动</small></article>`;
      })
      .join('')}</div></section>
    <section class="growth-panel"><h3>秘法与宝物</h3><div class="skill-loadout"><label>秘法槽<select data-hero-choice="manual" ${!manage ? 'disabled' : ''}><option value="-1">不携带秘法</option>${p.manuals.map((id) => `<option value="${id}" ${g.manual === id ? 'selected' : ''}>${MANUAL_SKILLS[id].name}</option>`).join('')}</select><small>${g.manual >= 0 ? MANUAL_SKILLS[g.manual].description : '奇遇与战斗胜利可能获得秘法，重复转材料。'}</small></label>
    <label>独立宝物槽<select data-hero-choice="relic" ${!manage ? 'disabled' : ''}><option value="">不装备宝物</option>${p.relics
      .filter((x) => x.id === g.relic || !fighters(p).some((y) => y.relic === x.id))
      .map(
        (x) =>
          `<option value="${x.id}" ${x.id === g.relic ? 'selected' : ''}>${RELICS[x.type].name} #${x.id}</option>`,
      )
      .join(
        '',
      )}</select><small>${g.relic === null ? '同一件宝物只能由一人装备。' : RELICS[p.relics.find((x) => x.id === g.relic).type].description}</small></label></div></section>
    <h3>六槽军械</h3><div class="equipment-grid">${SLOTS.map((slot, i) => {
      const item = p.items.find((x) => x.id === g.gear[i]),
        color = item ? QUALITY_COLORS[item.quality] : '#75817a';
      const available = p.items.filter(
        (x) => x.slot === i && !fighters(p).some((y) => y.gear.includes(x.id)),
      );
      return `<section class="equipment-slot q${item?.quality ?? 0}" style="--quality:${color}"><small>${slot}</small><div class="equip-glyph">${['♜', '✦', '⚔', '◇', '║', '↟'][i]}</div><h3>${item ? ITEMS[i] : '空置'}</h3><p>${item ? QUALITY[item.quality] : '尚未装备'}</p><select aria-label="${slot}装备" data-equip="${i}" ${!manage ? 'disabled' : ''}><option value="">选择可用装备</option>${available.map((x) => `<option value="${x.id}">${QUALITY[x.quality]} ${ITEMS[i]} #${x.id}</option>`).join('')}</select>${item ? btn('卸下', { type: 'equip', general: g.id, slot: i, item: null }, 'text-button', !manage) : ''}</section>`;
    }).join('')}</div>
    ${
      lord
        ? '<p class="note-box">主公可独自亲征，或与最多3名武将同行。仅在本人停留的自有城池参与防守，不可远程驻守。</p>'
        : `<div class="guard-control"><label>驻守城池<select id="guard-tile" ${!manage ? 'disabled' : ''}><option value="-1">空闲 · 可出征</option>${owned(
            state,
            p.id,
          )
            .filter((t) => t.kind === 'city')
            .map((t) => `<option value="${t.id}" ${g.guard === t.id ? 'selected' : ''}>${t.name}</option>`)
            .join(
              '',
            )}</select></label><button data-action="guard" ${!manage || g.injury ? 'disabled' : ''}>调动驻守</button></div>`
    }
    ${
      BONDS.some((b) => b.members.includes(g.id))
        ? `<p class="muted">羁绊：${BONDS.filter((b) => b.members.includes(g.id))
            .map((b) => b.name)
            .join('、')}；对应组合至少2名武将同时出阵，最多生效2组。</p>`
        : ''
    }
    <p class="tiny muted">人物史实见生平事迹；技能、秘法、品质与宝物效果为游戏创作。</p></div></div>`,
  };
}

export function biographyContent(name, ui) {
  const { esc, action } = ui,
    bio = BIOGRAPHIES[name];
  if (!bio) throw Error('人物资料不存在');
  return {
    title: `${name} · 生平事迹`,
    body: `<article class="biography"><p class="eyebrow">${esc(bio.era)} · 人物志</p><h1>${esc(name)}</h1><p class="biography-summary">${esc(bio.summary)}</p><h3>生平要事</h3><ol>${bio.deeds.map((d) => `<li>${esc(d)}</li>`).join('')}</ol><p class="tiny muted">史料：${esc(bio.source)}</p><a href="${esc(bio.url)}" target="_blank" rel="noopener noreferrer">主动联网查阅原文 ↗</a><p class="note-box">人物可跨时代同场；战斗技能、装备特效、属性与游戏称号不属于史实描述。</p>${action('返回人物卡', 'bio-back', 'primary')}</article>`,
  };
}
export function codexContent(query, era, ui) {
  const { esc } = ui;
  const eras = [...new Set(Object.values(BIOGRAPHIES).map((b) => b.era))];
  const entries = Object.entries(BIOGRAPHIES).filter(
    ([name, b]) => (!era || b.era === era) && `${name}${b.summary}`.includes(query.trim()),
  );
  return {
    title: '群英图鉴 · 九十七人志',
    body: `<p class="muted">90位可招募武将与7位主公。未招募也能查阅史实，图鉴不展示其他玩家的私有阵容。</p><form id="codex-search" class="codex-filters"><label>人物或事迹<input name="query" value="${esc(query)}" placeholder="输入姓名或关键词"></label><label>所属时期<select name="era"><option value="">全部时期</option>${eras.map((e) => `<option value="${esc(e)}" ${e === era ? 'selected' : ''}>${esc(e)}</option>`).join('')}</select></label><button type="submit">查找人物</button></form><p>${entries.length} 位人物</p><div class="codex-grid">${entries.map(([name, bio]) => `<button data-bio="${esc(name)}" class="codex-card"><small>${esc(bio.era)}</small><strong>${esc(name)}</strong><span>${esc(bio.summary.slice(0, 42))}…</span></button>`).join('') || '<p class="empty">没有符合条件的人物，请换一个关键词。</p>'}</div>`,
  };
}
export function reportsContent(state, p, ui) {
  const { esc } = ui;
  const reports = state.reports
    .filter((r) => [r.attacker, r.defender].includes(p.id))
    .slice()
    .reverse();
  return {
    title: `${p.name} · 军功簿`,
    body: `<p class="muted">经验与战利品已入库，重看或读档不会重复领取。保留最近20场战报及本席最近80条掉落记录。</p>
    ${reports.map((r) => `<article class="campaign-report"><div class="report-heading"><span class="rank-seal">${r.win ? '城破' : '守成'}</span><div><small>第${r.round}轮 · ${MAP[r.city].name}</small><h3>${state.players[r.attacker].name}攻城${r.win ? '获胜' : '未克'}</h3></div></div>${r.entries.map((e) => `<div class="report-row"><b>${esc(e.name)}</b><span>+${e.xp}经验</span><strong>${e.from === e.to ? `Lv.${e.to}` : `Lv.${e.from} → ${e.to}`}</strong>${e.unlocked.length ? `<p>新解锁：${e.unlocked.map(esc).join(' · ')}</p>` : ''}</div>`).join('')}<p class="report-loot">${r.loot.length ? r.loot.map(esc).join('；') : '本次未发现额外战利品。'}</p></article>`).join('') || '<div class="empty">尚无战报。主公和实际参战武将无论胜败均获得经验。</div>'}
    <h3>奇珍入库</h3><div class="loot-history">${
      p.loot
        .slice()
        .reverse()
        .map((x) => `<p><small>第${x.round}轮 · ${esc(x.source)}</small><strong>${esc(x.name)}</strong></p>`)
        .join('') || '<p class="muted">暂无奇遇或战斗掉落。</p>'
    }</div>`,
  };
}
