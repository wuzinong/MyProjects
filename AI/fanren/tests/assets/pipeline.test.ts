import { describe, expect, it } from 'vitest';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, readFileSync, cpSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

function runValidate(cwd: string): { code: number; output: string } {
  try {
    const output = execFileSync('node', [path.join(rootDir, 'tools', 'assets', 'validate-manifest.mjs')], {
      cwd,
      encoding: 'utf8',
      env: { ...process.env },
    });
    return { code: 0, output };
  } catch (error) {
    const e = error as { status?: number; stdout?: string; stderr?: string };
    return { code: e.status ?? 1, output: `${e.stdout ?? ''}${e.stderr ?? ''}` };
  }
}

/** 构造一个最小项目 fixture：inventory + manifest + public 资产。 */
function makeFixture(options: {
  approval?: string;
  manifestPath?: string;
  missingFile?: boolean;
  badSourceRef?: boolean;
}): string {
  const dir = mkdtempSync(path.join(tmpdir(), 'asset-fixture-'));
  const assetRel = options.manifestPath ?? 'assets/item/pill-test.png';
  mkdirSync(path.join(dir, 'src', 'assets'), { recursive: true });
  if (!options.missingFile) {
    mkdirSync(path.join(dir, 'public', path.dirname(assetRel)), { recursive: true });
    writeFileSync(path.join(dir, 'public', assetRel), 'fake-png');
  }
  writeFileSync(
    path.join(dir, 'asset-inventory.json'),
    JSON.stringify({
      version: 1,
      records: [
        {
          path: 'assets/images/source_test.png',
          sha256: 'x',
          mediaType: 'image/png',
          review: { approval: options.approval ?? 'approved' },
        },
      ],
    }),
  );
  writeFileSync(
    path.join(dir, 'src', 'assets', 'manifest.json'),
    JSON.stringify({
      version: 1,
      assets: {
        'pill-test': {
          path: assetRel,
          category: 'item',
          cn: '测试丹',
          source: options.badSourceRef ? 'assets/images/not_in_inventory.png' : 'assets/images/source_test.png',
          sha256: 'x',
        },
      },
    }),
  );
  return dir;
}

// validate-manifest.mjs 从自身位置解析 rootDir，因此对 fixture 的测试通过复制脚本实现
function runValidateInFixture(fixtureDir: string): { code: number; output: string } {
  const toolsDir = path.join(fixtureDir, 'tools', 'assets');
  cpSync(path.join(rootDir, 'tools', 'assets', 'lib.mjs'), path.join(toolsDir, 'lib.mjs'));
  cpSync(
    path.join(rootDir, 'tools', 'assets', 'validate-manifest.mjs'),
    path.join(toolsDir, 'validate-manifest.mjs'),
  );
  try {
    const output = execFileSync('node', [path.join(toolsDir, 'validate-manifest.mjs')], {
      cwd: fixtureDir,
      encoding: 'utf8',
    });
    return { code: 0, output };
  } catch (error) {
    const e = error as { status?: number; stdout?: string; stderr?: string };
    return { code: e.status ?? 1, output: `${e.stdout ?? ''}${e.stderr ?? ''}` };
  }
}

describe('asset pipeline validation (fail closed)', () => {
  it('real project manifest passes validation', () => {
    const result = runValidate(rootDir);
    expect(result.code).toBe(0);
    expect(result.output).toContain('素材校验通过');
  });

  it('real inventory has a record for every raw asset with review fields', () => {
    const inventory = JSON.parse(readFileSync(path.join(rootDir, 'asset-inventory.json'), 'utf8'));
    expect(inventory.records.length).toBeGreaterThanOrEqual(300);
    for (const record of inventory.records) {
      expect(record.sha256).toMatch(/^[0-9a-f]{64}$/);
      expect(record.review).toBeDefined();
      expect(record.review.approval).toBeDefined();
      expect(record.review.license).toBeDefined();
    }
  });

  it('rejects manifest entries whose source asset is not approved', () => {
    const dir = makeFixture({ approval: 'unreviewed' });
    const result = runValidateInFixture(dir);
    expect(result.code).not.toBe(0);
    expect(result.output).toContain('未获批准');
  });

  it('rejects manifest entries with raw screen_* runtime paths', () => {
    const dir = makeFixture({ manifestPath: 'assets/item/screen_12345.png' });
    const result = runValidateInFixture(dir);
    expect(result.code).not.toBe(0);
    expect(result.output).toContain('原始文件名');
  });

  it('rejects manifest entries whose runtime file is missing', () => {
    const dir = makeFixture({ missingFile: true });
    const result = runValidateInFixture(dir);
    expect(result.code).not.toBe(0);
    expect(result.output).toContain('文件缺失');
  });

  it('rejects manifest entries whose source is absent from inventory', () => {
    const dir = makeFixture({ badSourceRef: true });
    const result = runValidateInFixture(dir);
    expect(result.code).not.toBe(0);
  });

  it('runtime manifest only contains semantic paths and approved categories', () => {
    const manifest = JSON.parse(
      readFileSync(path.join(rootDir, 'src', 'assets', 'manifest.json'), 'utf8'),
    );
    const ids = Object.keys(manifest.assets);
    expect(ids.length).toBeGreaterThan(200);
    for (const [id, asset] of Object.entries<Record<string, string>>(manifest.assets)) {
      expect(id).toMatch(/^[a-z0-9-]+$/);
      expect(asset.path).not.toMatch(/screen_|code_/);
      expect(asset.path).toMatch(/^assets\/(character|enemy|environment|item|skill|ui|effect)\//);
    }
  });
});
