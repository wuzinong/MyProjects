/**
 * 语义化晋升（任务 2.4）：把 approval=approved 的图片复制为
 * public/assets/<category>/<slug>.png，并生成 512px 的 @1x 缩放版（原图保留为 @2x 需求时可扩展）。
 * 透明边裁切与缩放通过 PowerShell + System.Drawing 完成（Windows 环境），
 * 本脚本负责挑选、命名、追踪与 manifest 生成输入。
 * 输出 src/assets/manifest.json：logicalId -> { path, category, cn, source, sha256 }。
 */
import { copyFileSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadInventory, sha256 } from './lib.mjs';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const inventory = loadInventory(rootDir);
const publicAssets = path.join(rootDir, 'public', 'assets');

const manifest = { version: 1, assets: {} };
let promoted = 0;
const seenIds = new Set();

for (const record of inventory.records) {
  const r = record.review;
  if (r.approval !== 'approved' || !r.logicalId || !r.targetName) continue;
  if (record.duplicateOf) continue;
  if (seenIds.has(r.logicalId)) {
    throw new Error(`重复逻辑 ID: ${r.logicalId} (${record.path})`);
  }
  seenIds.add(r.logicalId);

  const targetRel = r.targetName.replaceAll('\\', '/');
  const targetAbs = path.join(publicAssets, targetRel);
  mkdirSync(path.dirname(targetAbs), { recursive: true });
  copyFileSync(path.join(rootDir, record.path), targetAbs);

  manifest.assets[r.logicalId] = {
    path: `assets/${targetRel}`,
    category: r.category,
    cn: r.candidateUse,
    source: record.path,
    sha256: sha256(readFileSync(targetAbs)),
  };
  promoted++;
}

mkdirSync(path.join(rootDir, 'src', 'assets'), { recursive: true });
writeFileSync(
  path.join(rootDir, 'src', 'assets', 'manifest.json'),
  JSON.stringify(manifest, null, 2) + '\n',
  'utf8',
);
console.log(`晋升完成：${promoted} 个素材已写入 public/assets/，manifest 已更新`);
