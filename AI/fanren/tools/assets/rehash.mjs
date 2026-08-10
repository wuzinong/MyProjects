/** 重新计算 manifest 中每个运行时文件的 sha256（在图像优化后运行）。 */
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { sha256 } from './lib.mjs';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const manifestPath = path.join(rootDir, 'src', 'assets', 'manifest.json');
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
for (const asset of Object.values(manifest.assets)) {
  asset.sha256 = sha256(readFileSync(path.join(rootDir, 'public', asset.path)));
}
writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n', 'utf8');
console.log('manifest 哈希已刷新');
