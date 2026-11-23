import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { renderMath } from '../scripts/render-math.mjs';
import { equations } from '../src/equations.js';
const source = readFileSync(new URL('../src/index.html',import.meta.url),'utf8');
const html = renderMath(Object.keys(equations).map(id => `<div class="equation" data-equation="${id}"></div>`).join(''));
const article = renderMath(source);
test('all numbered and compact equations render strictly with accessible MathML', () => {
  assert.equal(Object.keys(equations).length,14);
  assert.equal((html.match(/class="equation" id="eq-/g)||[]).length,14);
  assert.ok((html.match(/<math /g)||[]).length>=14);
  assert.ok(!html.includes('katex-error'));
  assert.ok(!html.includes('data-equation='));
  for(let i=1;i<=14;i++) assert.ok(html.includes(`href="#eq-${i}"`));
});
test('invalid mathematics stops the build instead of silently degrading', () => {
  assert.throws(()=>renderMath(String.raw`<p>\(\notARealMathCommand\)</p>`));
});
test('math markup survives without client JavaScript or third-party assets', () => {
  assert.ok(article.includes('math/katex.min.css'));
  assert.ok(!/<script[^>]+src="https?:/.test(html));
  assert.ok(html.includes('application/x-tex'));
  const css=readFileSync(new URL('../src/style.css',import.meta.url),'utf8');
  assert.ok(!/(?:^|\})\s*svg\s*\{/.test(css),'Chart SVG rules must not affect math radicals');
  assert.ok(!/\.equation\s+span\s*\{/.test(css),'Do not override typesetter internals');
});
test('generated math CSS references locally available font files', () => {
  const css=readFileSync(new URL('../dist/math/katex.min.css',import.meta.url),'utf8');
  const fonts=[...css.matchAll(/url\(([^)]+)\)/g)].map(m=>m[1].replace(/["']/g,''));
  assert.ok(fonts.length>0);
  for(const font of fonts) assert.ok(existsSync(new URL('../dist/math/'+font,import.meta.url)),font);
  assert.ok(existsSync(new URL('../dist/math/LICENSE.txt',import.meta.url)));
});
