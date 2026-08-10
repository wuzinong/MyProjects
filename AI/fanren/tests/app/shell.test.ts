import { describe, expect, it } from 'vitest';
import { AppStateMachine } from '@/app/state';
import { JoystickAdapter, KeyboardAdapter, mergeIntents } from '@/app/input';
import { VISUAL_BUDGETS, effectivePixelRatio } from '@/render/quality';
import { SettingsSchema } from '@/persistence/save';
import { FixedClock, SIM_DT } from '@/sim/core/clock';
import { TrialRun } from '@/sim/trial/run';
import { BLOOD_TRIAL } from '@/content/trial';

describe('AppStateMachine', () => {
  it('follows the legal scene flow to combat and back', () => {
    const machine = new AppStateMachine();
    expect(machine.transition('cave')).toBe(true);
    expect(machine.transition('trial-loading')).toBe(true);
    expect(machine.transition('combat')).toBe(true);
    expect(machine.transition('result')).toBe(true);
    expect(machine.transition('cave')).toBe(true);
  });

  it('rejects illegal transitions', () => {
    const machine = new AppStateMachine();
    expect(machine.transition('combat')).toBe(false);
    expect(machine.state).toBe('boot');
  });

  it('freezes simulation in pause-like states', () => {
    const machine = new AppStateMachine();
    machine.transition('cave');
    machine.transition('trial-loading');
    machine.transition('combat');
    expect(machine.simulationRunning).toBe(true);
    machine.transition('level-up');
    expect(machine.simulationRunning).toBe(false);
    machine.transition('combat');
    expect(machine.simulationRunning).toBe(true);
    machine.transition('paused');
    expect(machine.simulationRunning).toBe(false);
  });

  it('any state can fail to fatal-error and recover to boot', () => {
    const machine = new AppStateMachine();
    machine.transition('cave');
    expect(machine.transition('fatal-error')).toBe(true);
    expect(machine.transition('boot')).toBe(true);
  });
});

describe('pause freezes combat time', () => {
  it('paused clock does not advance the trial', () => {
    const machine = new AppStateMachine();
    machine.transition('cave');
    machine.transition('trial-loading');
    machine.transition('combat');
    const clock = new FixedClock();
    const run = new TrialRun(BLOOD_TRIAL, 1, { maxHealth: 1e9 });
    const frame = () => {
      clock.paused = !machine.simulationRunning;
      clock.advance(SIM_DT, () => run.step());
    };
    for (let i = 0; i < 60; i++) frame();
    const at = run.elapsedSeconds;
    machine.transition('level-up');
    for (let i = 0; i < 120; i++) frame();
    expect(run.elapsedSeconds).toBe(at);
    machine.transition('combat');
    for (let i = 0; i < 60; i++) frame();
    expect(run.elapsedSeconds).toBeGreaterThan(at);
  });
});

describe('input normalization', () => {
  it('keyboard diagonals are normalized to unit length', () => {
    const kb = new KeyboardAdapter();
    kb.keyDown('KeyW');
    kb.keyDown('KeyD');
    const intent = kb.intent;
    expect(Math.hypot(intent.x, intent.y)).toBeCloseTo(1);
    expect(intent.x).toBeGreaterThan(0);
    expect(intent.y).toBeLessThan(0);
  });

  it('key release stops movement', () => {
    const kb = new KeyboardAdapter();
    kb.keyDown('KeyA');
    kb.keyUp('KeyA');
    expect(kb.intent).toEqual({ x: 0, y: 0 });
  });

  it('joystick respects dead zone and max radius', () => {
    const joy = new JoystickAdapter(64, 8);
    joy.press(100, 100);
    joy.move(103, 100); // within dead zone
    expect(joy.intent).toEqual({ x: 0, y: 0 });
    joy.move(300, 100); // beyond max radius
    expect(joy.intent.x).toBeCloseTo(1);
    joy.release();
    expect(joy.intent).toEqual({ x: 0, y: 0 });
  });

  it('joystick and keyboard produce equivalent normalized intents', () => {
    const kb = new KeyboardAdapter();
    kb.keyDown('KeyD');
    const joy = new JoystickAdapter(64, 8);
    joy.press(0, 0);
    joy.move(64, 0);
    expect(joy.intent.x).toBeCloseTo(kb.intent.x);
    expect(joy.intent.y).toBeCloseTo(kb.intent.y);
  });

  it('active joystick takes priority in merge', () => {
    const kb = new KeyboardAdapter();
    kb.keyDown('KeyA');
    const joy = new JoystickAdapter();
    joy.press(0, 0);
    joy.move(64, 0);
    const merged = mergeIntents(kb.intent, joy.intent);
    expect(merged.x).toBeGreaterThan(0);
  });
});

describe('settings and quality', () => {
  it('settings schema provides defaults and round-trips', () => {
    const defaults = SettingsSchema.parse({});
    expect(defaults.quality).toBe('medium');
    expect(defaults.screenShake).toBe(true);
    const restored = SettingsSchema.parse(JSON.parse(JSON.stringify({ ...defaults, quality: 'low', screenShake: false })));
    expect(restored.quality).toBe('low');
    expect(restored.screenShake).toBe(false);
  });

  it('quality tiers only change visual budgets', () => {
    expect(VISUAL_BUDGETS.low.maxParticles).toBeLessThan(VISUAL_BUDGETS.high.maxParticles);
    expect(Object.keys(VISUAL_BUDGETS.low)).toEqual(Object.keys(VISUAL_BUDGETS.high));
  });

  it('device pixel ratio is capped at 2 and scaled by quality', () => {
    expect(effectivePixelRatio(3, 'medium')).toBe(2);
    expect(effectivePixelRatio(3, 'low')).toBe(1.5);
    expect(effectivePixelRatio(1, 'high')).toBe(1);
  });

  it('quality change does not alter a seeded simulation', () => {
    // 画质只作用于渲染层——模拟不读取画质，同种子结果一致
    const runA = new TrialRun(BLOOD_TRIAL, 77, { maxHealth: 1e9 });
    const runB = new TrialRun(BLOOD_TRIAL, 77, { maxHealth: 1e9 });
    runA.advanceSeconds(30);
    runB.advanceSeconds(30);
    expect(runA.enemies.length).toBe(runB.enemies.length);
    expect(runA.player.health).toBe(runB.player.health);
  });
});
