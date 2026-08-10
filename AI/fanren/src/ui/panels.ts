/** DOM UI：HUD、洞府面板、三选一、结算、错误页与设置。全部中文，pointer/touch/键盘可用。 */
import type { TrialRun } from '@/sim/trial/run';
import type { BuildChoice } from '@/sim/builds/state';
import type { SaveData, Settings } from '@/persistence/save';
import { HERBS, PILL_RECIPES, REALM_TABLE, SHOP_ITEMS } from '@/content/progression';

function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className: string,
  text?: string,
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  node.className = className;
  if (text) node.textContent = text;
  return node;
}

export function announce(text: string): void {
  const region = document.getElementById('a11y-status');
  if (region) region.textContent = text;
}

export class UiRoot {
  readonly root: HTMLElement;

  constructor(rootId = 'ui-root') {
    const root = document.getElementById(rootId);
    if (!root) throw new Error('缺少 UI 根节点');
    this.root = root;
    this.injectStyles();
  }

  clear(): void {
    this.root.replaceChildren();
  }

  private injectStyles(): void {
    if (document.getElementById('fanren-ui-styles')) return;
    const style = document.createElement('style');
    style.id = 'fanren-ui-styles';
    style.textContent = `
.panel { position: absolute; background: rgba(16,19,26,.92); border: 1px solid #3a4152; border-radius: 10px; padding: 16px; color: #e8e2d0; }
.panel h1, .panel h2 { margin: 0 0 10px; font-size: 18px; }
.panel button { background: #2c3446; color: #e8e2d0; border: 1px solid #4a5468; border-radius: 6px; padding: 10px 14px; margin: 4px; cursor: pointer; font-size: 14px; min-height: 44px; }
.panel button:focus-visible { outline: 2px solid #7fc7ff; }
.panel button:disabled { opacity: .45; cursor: default; }
.center { left: 50%; top: 50%; transform: translate(-50%, -50%); max-width: min(92vw, 560px); max-height: 86vh; overflow: auto; }
.hud-top { left: env(safe-area-inset-left, 8px); top: env(safe-area-inset-top, 8px); right: env(safe-area-inset-right, 8px); background: transparent; border: none; pointer-events: none; display: flex; gap: 12px; flex-wrap: wrap; font-size: 13px; }
.hud-top .bar { background: rgba(0,0,0,.55); border-radius: 6px; padding: 6px 10px; }
.hud-boss { left: 50%; transform: translateX(-50%); top: calc(env(safe-area-inset-top, 8px) + 44px); background: rgba(60,10,10,.8); border-color: #a33; }
.choice-list { display: flex; flex-direction: column; gap: 8px; }
.choice-list button { text-align: left; }
.joystick { position: absolute; left: 24px; bottom: max(24px, env(safe-area-inset-bottom)); width: 128px; height: 128px; border-radius: 50%; background: rgba(255,255,255,.08); border: 2px solid rgba(255,255,255,.2); touch-action: none; pointer-events: auto; }
.joystick .stick { position: absolute; left: 50%; top: 50%; width: 48px; height: 48px; border-radius: 50%; background: rgba(255,255,255,.3); transform: translate(-50%, -50%); }
.row { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; margin: 6px 0; }
`;
    document.head.appendChild(style);
  }

  /** 致命错误页。 */
  showFatalError(messages: string[], onRetry: () => void): void {
    this.clear();
    const panel = el('div', 'panel center');
    panel.setAttribute('role', 'alert');
    panel.appendChild(el('h1', '', '无法进入游戏'));
    for (const msg of messages) panel.appendChild(el('p', '', msg));
    const retry = el('button', '', '重试');
    retry.addEventListener('click', onRetry);
    panel.appendChild(retry);
    this.root.appendChild(panel);
    announce('发生错误：' + messages.join('；'));
  }

  /** 洞府面板。 */
  showCave(options: {
    save: SaveData;
    offlineMessage: string | null;
    onStartTrial: () => void;
    onMature: (herbId: string) => void;
    onRefine: (recipeId: string) => void;
    onBreakthrough: () => void;
    onSettings: () => void;
    onBuy: (itemId: string) => void;
  }): void {
    this.clear();
    const { save } = options;
    const realm = REALM_TABLE[save.realmIndex];
    const panel = el('div', 'panel center');
    panel.appendChild(el('h1', '', `洞府 · ${realm?.name ?? '炼气'}期`));
    if (options.offlineMessage) panel.appendChild(el('p', '', options.offlineMessage));
    panel.appendChild(el('p', '', `瓶灵绿液：${save.greenLiquid} / 12　灵石：${save.inventory['spirit-stone-low'] ?? 0}`));

    const inv = el('div', 'row');
    const entries = Object.entries(save.inventory).filter(([, v]) => v > 0);
    inv.appendChild(el('span', '', entries.length === 0 ? '库存：空' : '库存：'));
    for (const [item, count] of entries.slice(0, 12)) {
      inv.appendChild(el('span', 'bar', `${item} ×${count}`));
    }
    panel.appendChild(inv);

    const herbRow = el('div', 'row');
    herbRow.appendChild(el('span', '', '药园催熟：'));
    for (const herb of HERBS) {
      const btn = el('button', '', `${herb.name}（${herb.greenLiquidCost} 滴）`);
      btn.disabled = save.greenLiquid < herb.greenLiquidCost;
      btn.addEventListener('click', () => options.onMature(herb.id));
      herbRow.appendChild(btn);
    }
    panel.appendChild(herbRow);

    const pillRow = el('div', 'row');
    pillRow.appendChild(el('span', '', '炼丹：'));
    for (const recipe of PILL_RECIPES) {
      const btn = el('button', '', `炼制${recipe.name}`);
      btn.addEventListener('click', () => options.onRefine(recipe.id));
      pillRow.appendChild(btn);
    }
    panel.appendChild(pillRow);

    const shopRow = el('div', 'row');
    shopRow.appendChild(el('span', '', '坊市：'));
    const stones = save.inventory['spirit-stone-low'] ?? 0;
    for (const item of SHOP_ITEMS) {
      const btn = el('button', '', `${item.name}（${item.price} 灵石）`);
      btn.title = item.description;
      btn.disabled = stones < item.price;
      btn.addEventListener('click', () => options.onBuy(item.id));
      shopRow.appendChild(btn);
    }
    panel.appendChild(shopRow);

    const actions = el('div', 'row');
    const breakthroughBtn = el('button', '', '突破境界');
    breakthroughBtn.addEventListener('click', options.onBreakthrough);
    actions.appendChild(breakthroughBtn);
    const settingsBtn = el('button', '', '设置');
    settingsBtn.addEventListener('click', options.onSettings);
    actions.appendChild(settingsBtn);
    const start = el('button', '', '进入血色禁地');
    start.addEventListener('click', options.onStartTrial);
    actions.appendChild(start);
    panel.appendChild(actions);

    this.root.appendChild(panel);
    start.focus();
  }

  /** 战斗 HUD（每帧 update）。 */
  showHud(): {
    update: (run: TrialRun, phaseLabel: string) => void;
    joystickElement: HTMLElement;
    pauseButton: HTMLElement;
  } {
    this.clear();
    const hud = el('div', 'panel hud-top');
    const health = el('span', 'bar');
    const mana = el('span', 'bar');
    const sense = el('span', 'bar');
    const level = el('span', 'bar');
    const timer = el('span', 'bar');
    const fog = el('span', 'bar');
    const stones = el('span', 'bar');
    const talismans = el('span', 'bar');
    hud.append(health, mana, sense, level, timer, fog, stones, talismans);
    const pauseButton = el('button', '', '暂停');
    pauseButton.style.pointerEvents = 'auto';
    hud.appendChild(pauseButton);
    this.root.appendChild(hud);

    const bossBar = el('div', 'panel hud-boss');
    bossBar.style.display = 'none';
    const bossLabel = el('div', '', '墨蛟');
    const bossHealth = el('div', '');
    bossBar.append(bossLabel, bossHealth);
    this.root.appendChild(bossBar);

    const joystick = el('div', 'joystick');
    joystick.appendChild(el('div', 'stick'));
    this.root.appendChild(joystick);

    const update = (run: TrialRun, phaseLabel: string) => {
      health.textContent = `生命 ${Math.ceil(run.player.health)}/${run.player.config.maxHealth}`;
      mana.textContent = `法力 ${Math.floor(run.player.mana)}/${run.player.config.maxMana}`;
      sense.textContent = `神识 ${run.player.senseAvailable}/${run.player.config.maxSpiritualSense}`;
      level.textContent = `等级 ${run.level}（${run.experience}/${run.xpForLevel(run.level)}）`;
      const total = Math.floor(run.elapsedSeconds);
      timer.textContent = `时间 ${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
      fog.textContent = phaseLabel;
      stones.textContent = `灵石 ${run.spiritStones}`;
      talismans.textContent = `符宝 ×${run.talismans.length}`;
      if (run.boss && run.boss.alive) {
        bossBar.style.display = '';
        bossHealth.textContent = `${Math.max(0, Math.ceil(run.boss.health))} / ${run.boss.config.maxHealth}`;
      } else {
        bossBar.style.display = 'none';
      }
    };
    return { update, joystickElement: joystick, pauseButton };
  }

  /** 三选一（键盘 1/2/3、pointer、touch）。返回清理函数。 */
  showLevelUpChoices(choices: BuildChoice[], onPick: (index: number) => void): () => void {
    const panel = el('div', 'panel center');
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', '升阶选择');
    panel.appendChild(el('h2', '', '升阶：三选一'));
    const list = el('div', 'choice-list');
    choices.forEach((choice, i) => {
      const label = choice.kind === 'option' && choice.option
        ? `${i + 1}. ${choice.option.name} — ${choice.option.levels[0]?.description ?? ''}`
        : `${i + 1}. 灵气补偿 +${choice.fallbackExperience}`;
      const btn = el('button', '', label);
      btn.addEventListener('click', () => onPick(i));
      list.appendChild(btn);
      if (i === 0) queueMicrotask(() => btn.focus());
    });
    panel.appendChild(list);
    this.root.appendChild(panel);
    announce('升阶选择已出现');

    const keyHandler = (e: KeyboardEvent) => {
      const index = ['Digit1', 'Digit2', 'Digit3'].indexOf(e.code);
      if (index >= 0 && index < choices.length) onPick(index);
    };
    window.addEventListener('keydown', keyHandler);
    return () => {
      window.removeEventListener('keydown', keyHandler);
      panel.remove();
    };
  }

  /** 暂停菜单。 */
  showPauseMenu(options: {
    settings: Settings;
    onResume: () => void;
    onQuit: () => void;
    onSettingsChange: (patch: Partial<Settings>) => void;
  }): () => void {
    const panel = el('div', 'panel center');
    panel.setAttribute('role', 'dialog');
    panel.appendChild(el('h2', '', '已暂停'));

    const qualityRow = el('div', 'row');
    qualityRow.appendChild(el('span', '', '画质：'));
    for (const q of ['low', 'medium', 'high'] as const) {
      const btn = el('button', '', { low: '低', medium: '中', high: '高' }[q]);
      if (options.settings.quality === q) btn.disabled = true;
      btn.addEventListener('click', () => options.onSettingsChange({ quality: q }));
      qualityRow.appendChild(btn);
    }
    panel.appendChild(qualityRow);

    const toggles = el('div', 'row');
    const shake = el('button', '', options.settings.screenShake ? '屏幕震动：开' : '屏幕震动：关');
    shake.addEventListener('click', () => options.onSettingsChange({ screenShake: !options.settings.screenShake }));
    const mute = el('button', '', options.settings.muted ? '声音：关' : '声音：开');
    mute.addEventListener('click', () => options.onSettingsChange({ muted: !options.settings.muted }));
    toggles.append(shake, mute);
    panel.appendChild(toggles);

    const actions = el('div', 'row');
    const resume = el('button', '', '继续战斗');
    resume.addEventListener('click', options.onResume);
    const quit = el('button', '', '放弃并返回洞府');
    quit.addEventListener('click', options.onQuit);
    actions.append(resume, quit);
    panel.appendChild(actions);

    this.root.appendChild(panel);
    resume.focus();
    return () => panel.remove();
  }

  /** 结算页。 */
  showResult(options: {
    outcome: 'victory' | 'defeat';
    kills: number;
    level: number;
    rewards: Record<string, number>;
    onReturn: () => void;
  }): void {
    this.clear();
    const panel = el('div', 'panel center');
    panel.appendChild(el('h1', '', options.outcome === 'victory' ? '通关！墨蛟已被斩杀' : '陨落于血色禁地'));
    panel.appendChild(el('p', '', `击杀 ${options.kills} · 等级 ${options.level}`));
    const rewards = el('div', 'row');
    rewards.appendChild(el('span', '', '带回洞府：'));
    for (const [item, amount] of Object.entries(options.rewards)) {
      rewards.appendChild(el('span', 'bar', `${item} ×${amount}`));
    }
    panel.appendChild(rewards);
    const back = el('button', '', '返回洞府');
    back.addEventListener('click', options.onReturn);
    panel.appendChild(back);
    this.root.appendChild(panel);
    back.focus();
    announce(options.outcome === 'victory' ? '战斗胜利' : '战斗失败');
  }
}
