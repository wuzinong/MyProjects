/** 应用入口：能力检测 → 存档 → 洞府 → 血色禁地 → 结算闭环。 */
import { checkCapabilities } from '@/app/capabilities';
import { AppStateMachine } from '@/app/state';
import { JoystickAdapter, KeyboardAdapter, mergeIntents } from '@/app/input';
import { FixedClock } from '@/sim/core/clock';
import { TrialRun } from '@/sim/trial/run';
import { SkillExecutor } from '@/sim/builds/executor';
import { BLOOD_TRIAL } from '@/content/trial';
import { SaveStore, type SaveData, type Settings } from '@/persistence/save';
import {
  breakthrough, buyShopItem, claimRunRewards, matureHerb, realmBonuses, refinePill, settleOffline,
} from '@/persistence/progression';
import { SeededRng } from '@/sim/core/rng';
import { TrialRenderer } from '@/render/trial-renderer';
import { sound } from '@/render/sound';
import { UiRoot, announce } from '@/ui/panels';

const machine = new AppStateMachine();
const ui = new UiRoot();
const saveStore = new SaveStore(window.localStorage);
let save: SaveData;
let renderer: TrialRenderer | null = null;
let run: TrialRun | null = null;
let executor: SkillExecutor | null = null;
let offlineMessage: string | null = null;
let phaseLabel = '阶段：探索';
let dismissOverlay: (() => void) | null = null;

// 首次用户手势后初始化音频（浏览器策略要求）
window.addEventListener('pointerdown', () => {
  sound.init();
  sound.setMuted(save?.settings.muted ?? false);
}, { once: true });

function persist(): void {
  saveStore.persist(save);
}

function applySettings(patch: Partial<Settings>): void {
  save.settings = { ...save.settings, ...patch };
  persist();
  if (renderer && patch.quality) renderer.setQuality(patch.quality);
  if (patch.muted !== undefined) sound.setMuted(patch.muted);
}

function boot(): void {
  const capabilities = checkCapabilities();
  if (!capabilities.ok) {
    machine.transition('fatal-error');
    ui.showFatalError(capabilities.failures, () => {
      machine.transition('boot');
      boot();
    });
    return;
  }
  const loaded = saveStore.load();
  if (loaded.status === 'newer-version') {
    machine.transition('fatal-error');
    ui.showFatalError(
      [`检测到更高版本的存档（v${loaded.heldVersion}），当前客户端不支持。请使用更新版本，存档不会被覆盖。`],
      () => window.location.reload(),
    );
    return;
  }
  save = loaded.save;
  const settlement = settleOffline(save, Date.now());
  offlineMessage = settlement.clockRollback
    ? '检测到设备时间倒退，本次未发放离线绿液。'
    : settlement.drops > 0
      ? `离线期间瓶灵凝聚了 ${settlement.drops} 滴绿液。`
      : null;
  persist();
  machine.transition('cave');
  showCave();
}

function showCave(): void {
  ui.showCave({
    save,
    offlineMessage,
    onStartTrial: () => void startTrial(),
    onMature: (herbId) => {
      const result = matureHerb(save, herbId);
      announce(result.ok ? '催熟成功' : result.reason ?? '催熟失败');
      if (result.ok) persist();
      showCave();
    },
    onRefine: (recipeId) => {
      const outcome = refinePill(save, recipeId, new SeededRng(Date.now() >>> 0));
      announce(outcome.ok ? `炼制完成：${outcome.produced}` : outcome.reason ?? '炼制失败');
      if (outcome.ok) persist();
      showCave();
    },
    onBreakthrough: () => {
      const result = breakthrough(save);
      announce(result.ok ? '突破成功！' : result.reason ?? '突破失败');
      if (result.ok) persist();
      showCave();
    },
    onBuy: (itemId) => {
      const result = buyShopItem(save, itemId);
      announce(result.ok ? '购买成功' : result.reason ?? '购买失败');
      if (result.ok) persist();
      showCave();
    },
    onSettings: () => {
      dismissOverlay = ui.showPauseMenu({
        settings: save.settings,
        onResume: () => {
          dismissOverlay?.();
          dismissOverlay = null;
          showCave();
        },
        onQuit: () => {
          dismissOverlay?.();
          dismissOverlay = null;
          showCave();
        },
        onSettingsChange: (patch) => {
          applySettings(patch);
          dismissOverlay?.();
          dismissOverlay = null;
          showCave();
        },
      });
    },
  });
  offlineMessage = null;
}

async function startTrial(): Promise<void> {
  if (!machine.transition('trial-loading')) return;
  ui.clear();
  announce('正在进入血色禁地…');

  const host = document.getElementById('game-canvas-host');
  if (!host) throw new Error('缺少画布宿主');
  host.replaceChildren();
  renderer?.destroy();
  renderer = new TrialRenderer();
  try {
    await renderer.init(host, save.settings.quality);
  } catch {
    machine.transition('fatal-error');
    ui.showFatalError(['初始化 WebGL 渲染失败。请检查显卡驱动或更换浏览器。'], () => window.location.reload());
    return;
  }

  const seed = Date.now() >>> 0;
  const bonuses = realmBonuses(save);
  run = new TrialRun(BLOOD_TRIAL, seed, {
    maxHealth: 100 + bonuses.startingHealthBonus,
    maxMana: 60 + bonuses.startingManaBonus,
  }, {
    onPhaseChange: (id) => {
      phaseLabel = `阶段：${{ opening: '初潮', pressure: '虫潮', elite: '精英+毒雾', frenzy: '疯狂妖兽潮' }[id] ?? id}`;
      announce(phaseLabel);
    },
    onFogStep: () => announce('禁地腥气逼近，安全区缩小！'),
    onBossSpawn: () => {
      run?.fx.push({ kind: 'boss-spawn' });
      announce('关卡领主墨蛟现身！');
    },
    onResult: () => {},
  });
  executor = new SkillExecutor(run, seed);
  // 起手技能：火弹术
  const fireball = (await import('@/content/builds')).BUILD_CATALOG.find((o) => o.id === 'fireball');
  if (fireball) executor.builds.select(fireball);

  await renderer.prepare(run);

  const hud = ui.showHud();
  const keyboard = new KeyboardAdapter();
  const joystick = new JoystickAdapter();
  window.addEventListener('keydown', (e) => {
    keyboard.keyDown(e.code);
    if (e.code === 'Escape') togglePause(hud);
    if (e.code === 'Space' && run) {
      if (run.useTalisman(0)) {
        run.fx.push({ kind: 'talisman', x: run.player.x, y: run.player.y });
      }
    }
  });
  window.addEventListener('keyup', (e) => keyboard.keyUp(e.code));
  hud.joystickElement.addEventListener('pointerdown', (e) => {
    hud.joystickElement.setPointerCapture(e.pointerId);
    joystick.press(e.clientX, e.clientY);
  });
  hud.joystickElement.addEventListener('pointermove', (e) => joystick.move(e.clientX, e.clientY));
  hud.joystickElement.addEventListener('pointerup', () => joystick.release());
  hud.pauseButton.addEventListener('click', () => togglePause(hud));

  renderer.onContextLost = () => {
    if (machine.state === 'combat') machine.transition('paused');
    announce('渲染上下文丢失，游戏已暂停，正在尝试恢复…');
  };
  renderer.onContextRestored = () => {
    announce('渲染已恢复，继续战斗。');
    if (machine.state === 'paused') machine.transition('combat');
  };

  machine.transition('combat');
  const clock = new FixedClock();

  const frame = (last: number) => (now: number) => {
    if (!run || !renderer) return;
    const dt = Math.min(0.25, (now - last) / 1000);
    clock.paused = !machine.simulationRunning;
    if (machine.simulationRunning) {
      const intent = mergeIntents(keyboard.intent, joystick.intent);
      const speedMult = executor?.builds.passives.moveSpeedMultiplier ?? 1;
      run.player.setMoveIntent(intent.x * speedMult, intent.y * speedMult);
      clock.advance(dt, () => {
        run?.step();
        executor?.step();
      });
      if (run.pendingLevelUps > 0 && machine.state === 'combat') {
        openLevelUpChoices();
      }
      if ((run.phase === 'victory' || run.phase === 'defeat') && machine.state === 'combat') {
        finishRun();
        return;
      }
    }
    hud.update(run, phaseLabel);
    renderer.screenShakeEnabled = save.settings.screenShake;
    renderer.floatingTextEnabled = save.settings.floatingTextDensity !== 'off';
    renderer.sync(run, dt, executor?.builds.swordMilestones.swordCount ?? 0);
    requestAnimationFrame(frame(now));
  };
  requestAnimationFrame((t) => frame(t)(t));
}

function togglePause(hud: { update: (run: TrialRun, label: string) => void }): void {
  void hud;
  if (machine.state === 'combat') {
    machine.transition('paused');
    dismissOverlay = ui.showPauseMenu({
      settings: save.settings,
      onResume: () => {
        dismissOverlay?.();
        dismissOverlay = null;
        machine.transition('combat');
      },
      onQuit: () => {
        dismissOverlay?.();
        dismissOverlay = null;
        machine.transition('cave');
        teardownTrial();
        showCave();
      },
      onSettingsChange: (patch) => applySettings(patch),
    });
  } else if (machine.state === 'paused') {
    dismissOverlay?.();
    dismissOverlay = null;
    machine.transition('combat');
  }
}

function openLevelUpChoices(): void {
  if (!run || !executor) return;
  if (!machine.transition('level-up')) return;
  run.pendingLevelUps--;
  sound.play('levelup');
  const choices = executor.builds.generateChoices(new SeededRng((run.seed ^ (run.level * 7919)) >>> 0));
  const dismiss = ui.showLevelUpChoices(choices, (index) => {
    const choice = choices[index];
    if (!choice) return;
    if (choice.kind === 'option' && choice.option) {
      executor?.builds.select(choice.option);
      announce(`已选择 ${choice.option.name}`);
    } else if (choice.fallbackExperience) {
      run?.gainExperience(choice.fallbackExperience);
    }
    dismiss();
    machine.transition('combat');
  });
}

function finishRun(): void {
  if (!run?.result) return;
  machine.transition('result');
  const result = run.result;
  sound.play(result.outcome === 'victory' ? 'victory' : 'gameover');
  const claimed = claimRunRewards(save, result);
  if (claimed) persist();
  ui.showResult({
    outcome: result.outcome,
    kills: result.kills,
    level: result.level,
    rewards: result.rewards,
    onReturn: () => {
      machine.transition('cave');
      teardownTrial();
      showCave();
    },
  });
}

function teardownTrial(): void {
  renderer?.destroy();
  renderer = null;
  run = null;
  executor = null;
  const host = document.getElementById('game-canvas-host');
  host?.replaceChildren();
}

boot();
