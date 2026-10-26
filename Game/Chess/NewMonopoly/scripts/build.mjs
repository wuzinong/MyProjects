import { build } from 'esbuild';
import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const result = await build({
  entryPoints: ['src/main.js'],
  bundle: true,
  write: false,
  minify: true,
  format: 'iife',
  target: 'es2022',
  legalComments: 'inline',
});
const [template, css, license] = await Promise.all([
  readFile('src/index.template.html', 'utf8'),
  readFile('src/styles.css', 'utf8'),
  readFile('node_modules/three/LICENSE', 'utf8'),
]);
const code = result.outputFiles[0].text.replace(/<\/script/gi, '<\\/script');
let html = template
  .replace('/* STYLES */', () => css)
  .replace('/* APPLICATION */', () => code)
  .replace('<!-- LICENSE -->', () => `<!-- Three.js license\n${license.replace(/-->/g, '')}\n-->`);
const script = html.match(/<script>([\s\S]*)<\/script>/)?.[1];
if (!script) throw Error('Missing embedded application script');
html = html.replace(
  '__SCRIPT_HASH__',
  () => `sha256-${createHash('sha256').update(script).digest('base64')}`,
);
await writeFile('index.html', html);
console.log(`Built offline index.html (${(Buffer.byteLength(html) / 1024).toFixed(0)} KiB)`);
