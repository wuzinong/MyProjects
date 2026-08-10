/**
 * 共享工具：素材盘点数据结构与读写。
 * 盘点文件: asset-inventory.json（版本化、可人工编辑 review 字段，重跑保留人工数据）。
 */
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';

export const INVENTORY_VERSION = 1;

export const CATEGORIES = [
  'character', 'enemy', 'environment', 'item', 'skill', 'ui', 'effect', 'reference', 'duplicate', 'unknown',
];

export const APPROVAL_STATUSES = ['unreviewed', 'approved', 'rejected', 'quarantined'];

export function sha256(buffer) {
  return createHash('sha256').update(buffer).digest('hex');
}

/** 从 PNG buffer 读取 IHDR 宽高；非 PNG 返回 null。 */
export function pngDimensions(buffer) {
  if (buffer.length < 24) return null;
  const sig = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  for (let i = 0; i < 8; i++) {
    if (buffer[i] !== sig[i]) return null;
  }
  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
}

export function inventoryPath(rootDir) {
  return path.join(rootDir, 'asset-inventory.json');
}

export function loadInventory(rootDir) {
  const file = inventoryPath(rootDir);
  if (!existsSync(file)) {
    return { version: INVENTORY_VERSION, generatedAt: null, records: [] };
  }
  return JSON.parse(readFileSync(file, 'utf8'));
}

export function saveInventory(rootDir, inventory) {
  inventory.generatedAt = new Date().toISOString();
  writeFileSync(inventoryPath(rootDir), JSON.stringify(inventory, null, 2) + '\n', 'utf8');
}

/** 默认的人工审核字段：未核验素材默认不可发布。 */
export function defaultReviewFields() {
  return {
    category: 'unknown',
    candidateUse: '',
    source: 'unknown',
    license: 'unknown',
    approval: 'unreviewed',
    logicalId: null,
    targetName: null,
    notes: '',
  };
}
