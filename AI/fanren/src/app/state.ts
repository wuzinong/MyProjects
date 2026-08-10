/** 应用场景状态机：显式状态 + 合法迁移表；暂停类状态冻结模拟。 */
export type AppState =
  | 'boot'
  | 'cave'
  | 'trial-loading'
  | 'combat'
  | 'paused'
  | 'level-up'
  | 'result'
  | 'fatal-error';

const TRANSITIONS: Record<AppState, readonly AppState[]> = {
  boot: ['cave', 'fatal-error'],
  cave: ['trial-loading', 'fatal-error'],
  'trial-loading': ['combat', 'cave', 'fatal-error'],
  combat: ['paused', 'level-up', 'result', 'fatal-error'],
  paused: ['combat', 'cave', 'fatal-error'],
  'level-up': ['combat', 'fatal-error'],
  result: ['cave', 'fatal-error'],
  'fatal-error': ['boot'],
};

/** 这些状态下战斗模拟必须冻结。 */
const SIM_FROZEN: ReadonlySet<AppState> = new Set([
  'boot', 'cave', 'trial-loading', 'paused', 'level-up', 'result', 'fatal-error',
]);

export class AppStateMachine {
  private current: AppState = 'boot';
  onChange: ((from: AppState, to: AppState) => void) | null = null;

  get state(): AppState {
    return this.current;
  }

  get simulationRunning(): boolean {
    return !SIM_FROZEN.has(this.current);
  }

  canTransition(to: AppState): boolean {
    return TRANSITIONS[this.current].includes(to);
  }

  transition(to: AppState): boolean {
    if (!this.canTransition(to)) return false;
    const from = this.current;
    this.current = to;
    this.onChange?.(from, to);
    return true;
  }
}
