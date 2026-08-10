/**
 * 应用人工分类结论到 asset-inventory.json（任务 2.2/2.3）。
 * - images/*.png: 按 classification.mjs 填 category/candidateUse/logicalId/targetName；
 *   来源为项目内生成素材（source: project-generated, license: project-internal, approval: approved）。
 * - animation/*.html: 归为 reference，禁止直接进入运行时（approval: quarantined）。
 * - 未识别文件保持 unreviewed（默认不可发布）。
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadInventory, saveInventory } from './lib.mjs';
import { ANIMATION_PNG_CLASSIFICATION, IMAGE_CLASSIFICATION } from './classification.mjs';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const inventory = loadInventory(rootDir);

let classified = 0;
let unknown = 0;

for (const record of inventory.records) {
  const base = path.posix.basename(record.path);
  const isAnimationDir = record.path.startsWith('assets/animation/');
  const cls = isAnimationDir
    ? ANIMATION_PNG_CLASSIFICATION[base]
    : IMAGE_CLASSIFICATION[base];

  if (record.mediaType === 'text/html') {
    record.review = {
      ...record.review,
      category: 'reference',
      candidateUse: '动效参考（仅供移植 GLSL/SVG，不直接进入运行时）',
      source: 'project-generated',
      license: 'project-internal',
      approval: 'quarantined',
      logicalId: null,
      targetName: null,
      notes: '含 Tailwind CDN 引用，禁止以 HTML 形式进入构建。',
    };
    classified++;
    continue;
  }

  if (cls) {
    record.review = {
      ...record.review,
      category: cls.cat,
      candidateUse: cls.cn,
      source: 'project-generated',
      license: 'project-internal',
      approval: cls.cat === 'reference' ? 'quarantined' : 'approved',
      logicalId: cls.slug,
      targetName: `${cls.cat}/${cls.slug}.png`,
    };
    classified++;
  } else {
    unknown++;
  }
}

saveInventory(rootDir, inventory);
console.log(`分类完成：${classified} 条已标注，${unknown} 条保持 unknown/unreviewed`);
