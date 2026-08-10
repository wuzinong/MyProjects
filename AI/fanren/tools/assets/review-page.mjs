/**
 * 生成本地素材审阅页 asset-review.html：
 * 按类别分组显示缩略图与元数据，辅助人工分类和授权标注。
 * 纯本地静态页，不引用任何 CDN。
 */
import { writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CATEGORIES, loadInventory } from './lib.mjs';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const inventory = loadInventory(rootDir);

const groups = new Map(CATEGORIES.map((c) => [c, []]));
for (const record of inventory.records) {
  const cat = record.duplicateOf ? 'duplicate' : (record.review.category || 'unknown');
  if (!groups.has(cat)) groups.set(cat, []);
  groups.get(cat).push(record);
}

const sections = [...groups.entries()]
  .filter(([, records]) => records.length > 0)
  .map(([cat, records]) => {
    const cards = records.map((r) => {
      const media = r.mediaType === 'image/png'
        ? `<img loading="lazy" src="${r.path}" alt="${r.path}">`
        : `<div class="html-ref">HTML 动效参考</div>`;
      return `<figure>
  ${media}
  <figcaption>
    <code>${r.path}</code><br>
    ${r.width ?? '?'}×${r.height ?? '?'} · ${(r.bytes / 1024).toFixed(0)} KB<br>
    授权: ${r.review.license} · 状态: ${r.review.approval}
    ${r.review.logicalId ? `<br>ID: ${r.review.logicalId}` : ''}
    ${r.duplicateOf ? `<br>重复于: <code>${r.duplicateOf}</code>` : ''}
  </figcaption>
</figure>`;
    }).join('\n');
    return `<section><h2>${cat}（${records.length}）</h2><div class="grid">${cards}</div></section>`;
  }).join('\n');

const html = `<!doctype html>
<html lang="zh-CN"><head><meta charset="utf-8"><title>素材审阅</title>
<style>
body { font-family: system-ui, sans-serif; background: #14161c; color: #ddd; margin: 1rem; }
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 10px; }
figure { margin: 0; background: #1e2129; border-radius: 6px; padding: 6px; }
img { width: 100%; height: 140px; object-fit: contain; background: repeating-conic-gradient(#2a2d36 0 25%, #22252d 0 50%) 0 0/16px 16px; }
figcaption { font-size: 11px; word-break: break-all; }
.html-ref { height: 140px; display: flex; align-items: center; justify-content: center; background: #262a34; }
h2 { border-bottom: 1px solid #333; padding-bottom: 4px; }
</style></head>
<body><h1>素材审阅（共 ${inventory.records.length}）</h1>
<p>生成时间: ${inventory.generatedAt ?? '未知'}。请在 asset-inventory.json 中维护 review 字段。</p>
${sections}
</body></html>
`;

writeFileSync(path.join(rootDir, 'asset-review.html'), html, 'utf8');
console.log('已生成 asset-review.html');
