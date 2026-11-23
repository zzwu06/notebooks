import { mkdir, copyFile, readFile, writeFile, readdir, cp } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { sourceZip } from './source-zip.mjs';
import { renderMath } from './render-math.mjs';
await mkdir('dist', { recursive: true });
for (const name of await readdir('src')) {
  if (name === 'index.html') await writeFile('dist/index.html', renderMath(await readFile('src/index.html','utf8')));
  else await copyFile('src/' + name, 'dist/' + name);
}
await mkdir('dist/math', { recursive:true });
await copyFile('node_modules/katex/dist/katex.min.css','dist/math/katex.min.css');
await cp('node_modules/katex/dist/fonts','dist/math/fonts',{recursive:true});
await copyFile('node_modules/katex/LICENSE','dist/math/LICENSE.txt');
await copyFile('LICENSE', 'dist/LICENSE.txt');
const files = ['README.md', 'LICENSE', 'package.json', 'package-lock.json', '.gitignore'];
for (const directory of ['src', 'scripts', 'tests', 'docs']) {
  for (const name of await readdir(directory)) files.push(directory + '/' + name);
}
const entries = await Promise.all(files.sort().map(async name => ({ name, data: await readFile(name) })));
const zip = sourceZip(entries);
await writeFile('dist/vision-dynamics-source.zip', zip);
await writeFile('dist/source-manifest.json', JSON.stringify({
  title: 'Research Notes — Orientation selectivity', license: 'MIT',
  archive: 'vision-dynamics-source.zip', sha256: createHash('sha256').update(zip).digest('hex'),
  files: entries.map(({ name, data }) => ({ name, sha256: createHash('sha256').update(data).digest('hex') }))
}, null, 2));
console.log('Built pre-rendered mathematics, local fonts, and complete source archive.');
