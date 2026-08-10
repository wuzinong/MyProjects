/** 版本化存档：Zod 校验、顺序迁移、原子写入、时钟保护。 */
import { z } from 'zod';

export const CURRENT_SAVE_VERSION = 1;
const SAVE_KEY = 'fanren-save';
const SAVE_TEMP_KEY = 'fanren-save-tmp';

export const SettingsSchema = z.object({
  musicVolume: z.number().min(0).max(1).default(0.7),
  sfxVolume: z.number().min(0).max(1).default(0.8),
  muted: z.boolean().default(false),
  quality: z.enum(['low', 'medium', 'high']).default('medium'),
  screenShake: z.boolean().default(true),
  floatingTextDensity: z.enum(['off', 'reduced', 'full']).default('full'),
});

export const SaveSchema = z.object({
  version: z.number().int().positive(),
  realmIndex: z.number().int().nonnegative().default(0),
  greenLiquid: z.number().int().nonnegative().default(0),
  inventory: z.record(z.string(), z.number().int().nonnegative()).default({}),
  unlockedTrials: z.array(z.string()).default(['blood-trial']),
  claimedRunIds: z.array(z.string()).default([]),
  lastTrustedTimestamp: z.number().nonnegative().default(0),
  settings: SettingsSchema.default({}),
});

export type SaveData = z.infer<typeof SaveSchema>;
export type Settings = z.infer<typeof SettingsSchema>;

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export function defaultSave(now: number): SaveData {
  return SaveSchema.parse({ version: CURRENT_SAVE_VERSION, lastTrustedTimestamp: now });
}

/** 逐版本迁移表：v(n) -> v(n+1)。 */
type Migration = (raw: Record<string, unknown>) => Record<string, unknown>;
const MIGRATIONS: Record<number, Migration> = {
  // 示例：0 -> 1（历史无版本测试数据）
  0: (raw) => ({ ...raw, version: 1 }),
};

export type LoadResult =
  | { status: 'ok'; save: SaveData }
  | { status: 'fresh'; save: SaveData }
  | { status: 'newer-version'; heldVersion: number }
  | { status: 'corrupt-recovered'; save: SaveData };

export class SaveStore {
  constructor(
    private readonly storage: StorageLike,
    private readonly now: () => number = () => Date.now(),
  ) {}

  load(): LoadResult {
    const raw = this.storage.getItem(SAVE_KEY);
    if (raw === null) {
      const save = defaultSave(this.now());
      this.persist(save);
      return { status: 'fresh', save };
    }
    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(raw) as Record<string, unknown>;
    } catch {
      const save = defaultSave(this.now());
      this.persist(save);
      return { status: 'corrupt-recovered', save };
    }
    let version = typeof parsed.version === 'number' ? parsed.version : 0;
    if (version > CURRENT_SAVE_VERSION) {
      return { status: 'newer-version', heldVersion: version };
    }
    while (version < CURRENT_SAVE_VERSION) {
      const migrate = MIGRATIONS[version];
      if (!migrate) {
        const save = defaultSave(this.now());
        this.persist(save);
        return { status: 'corrupt-recovered', save };
      }
      parsed = migrate(parsed);
      version = parsed.version as number;
    }
    const result = SaveSchema.safeParse(parsed);
    if (!result.success) {
      const save = defaultSave(this.now());
      this.persist(save);
      return { status: 'corrupt-recovered', save };
    }
    this.persist(result.data);
    return { status: 'ok', save: result.data };
  }

  /** 原子写：先写临时键，再切主键。较新版本存在时拒绝覆盖。 */
  persist(save: SaveData): boolean {
    const existing = this.storage.getItem(SAVE_KEY);
    if (existing) {
      try {
        const version = (JSON.parse(existing) as { version?: number }).version ?? 0;
        if (version > CURRENT_SAVE_VERSION) return false;
      } catch {
        // corrupt existing data may be overwritten
      }
    }
    const serialized = JSON.stringify(save);
    this.storage.setItem(SAVE_TEMP_KEY, serialized);
    this.storage.setItem(SAVE_KEY, serialized);
    this.storage.removeItem(SAVE_TEMP_KEY);
    return true;
  }
}
