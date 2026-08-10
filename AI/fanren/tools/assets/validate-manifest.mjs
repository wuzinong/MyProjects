/**
 * 运行时素材 manifest 校验（任务 2.5，发布门禁）：
 * - manifest 引用的文件必须存在；
 * - 逻辑 ID 唯一（JSON 结构天然保证 key 唯一，但 path 也不得重复）；
 * - 禁止引用原始 screen_* / code_* 文件名；
 * - manifest 中素材必须在盘点中 approval=approved；
 * - src/ 源码中禁止出现原始素材文件名。
 * 任一失败以非零退出码结束（fail closed）。
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadInventory } from './lib.mjs';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const manifestPath = path.join(rootDir, 'src', 'assets', 'manifest.json');

const errors = [];

if (!existsSync(manifestPath)) {
  console.error('缺少 src/assets/manifest.json，请先运行 npm run assets:promote');
  process.exit(1);
}

const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
const inventory = loadInventory(rootDir);
const approvedBySource = new Map(
  inventory.records
    .filter((r) => r.review && r.review.approval === 'approved')
    .map((r) => [r.path, r]),
);

const seenPaths = new Set();
for (const [logicalId, asset] of Object.entries(manifest.assets)) {
  if (/screen_\d|code_\d|screen\.png/.test(asset.path)) {
    errors.push(`[${logicalId}] 运行时路径引用了原始文件名: ${asset.path}`);
  }
  if (seenPaths.has(asset.path)) {
    errors.push(`[${logicalId}] 运行时路径重复: ${asset.path}`);
  }
  seenPaths.add(asset.path);
  const abs = path.join(rootDir, 'public', asset.path);
  if (!existsSync(abs)) {
    errors.push(`[${logicalId}] 文件缺失: public/${asset.path}`);
  }
  if (!asset.source || !approvedBySource.has(asset.source)) {
    errors.push(`[${logicalId}] 源素材未获批准或未盘点: ${asset.source ?? '(无)'} `);
  }
}

// 源码禁引原始素材名
function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else if (/\.(ts|tsx|js|mjs|css|html)$/.test(entry)) out.push(full);
  }
  return out;
}
const srcDir = path.join(rootDir, 'src');
if (existsSync(srcDir)) {
  for (const file of walk(srcDir)) {
    const text = readFileSync(file, 'utf8');
    if (/assets\/(images|animation)\/(screen|code)[_.]/.test(text)) {
      errors.push(`源码直接引用原始素材: ${path.relative(rootDir, file)}`);
    }
  }
}

if (errors.length > 0) {
  console.error(`素材校验失败（${errors.length} 个问题）:`);
  for (const e of errors) console.error('  - ' + e);
  process.exit(1);
}
console.log(`素材校验通过：${Object.keys(manifest.assets).length} 个运行时素材`);
