/**
 * 素材盘点命令：扫描 assets/ 下的 PNG 与 HTML，生成/更新 asset-inventory.json。
 * - 记录路径、SHA-256、类型、尺寸；
 * - 相同哈希标记 duplicateOf（保留首个出现者）；
 * - 重跑保留人工填写的 review 字段。
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  INVENTORY_VERSION, defaultReviewFields, loadInventory, pngDimensions, saveInventory, sha256,
} from './lib.mjs';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const assetsDir = path.join(rootDir, 'assets');

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
}

const previous = loadInventory(rootDir);
const prevByPath = new Map(previous.records.map((r) => [r.path, r]));

const files = walk(assetsDir).filter((f) => /\.(png|html)$/i.test(f));
const hashFirstSeen = new Map();
const records = [];

for (const file of files.sort()) {
  const rel = path.relative(rootDir, file).replaceAll('\\', '/');
  const buffer = readFileSync(file);
  const hash = sha256(buffer);
  const dims = pngDimensions(buffer);
  const mediaType = file.toLowerCase().endsWith('.png') ? 'image/png' : 'text/html';
  const duplicateOf = hashFirstSeen.has(hash) ? hashFirstSeen.get(hash) : null;
  if (!duplicateOf) hashFirstSeen.set(hash, rel);

  const prev = prevByPath.get(rel);
  records.push({
    path: rel,
    sha256: hash,
    mediaType,
    bytes: buffer.length,
    width: dims ? dims.width : null,
    height: dims ? dims.height : null,
    duplicateOf,
    review: prev && prev.review ? { ...defaultReviewFields(), ...prev.review } : defaultReviewFields(),
  });
}

saveInventory(rootDir, { version: INVENTORY_VERSION, records });

const dupCount = records.filter((r) => r.duplicateOf).length;
console.log(`盘点完成：${records.length} 个素材（重复 ${dupCount}），已写入 asset-inventory.json`);
