import { createHash } from 'node:crypto';
import { readFile, readdir, writeFile } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const output = new URL('../docs/', import.meta.url);
const outputPath = fileURLToPath(output);
const assets = (await readdir(output, { recursive: true, withFileTypes: true }))
  .filter(entry => entry.isFile() && !['sw.js', '.nojekyll'].includes(entry.name))
  .map(entry => relative(outputPath, join(entry.parentPath, entry.name)).split(sep).join('/'))
  .sort();
const worker = await readFile(new URL('./worker.js', import.meta.url), 'utf8');
const hash = createHash('sha256').update(worker);
for (const asset of assets) hash.update(asset).update(await readFile(new URL(asset, output)));
const version = hash.digest('hex').slice(0, 16);
await writeFile(new URL('sw.js', output), `const version = ${JSON.stringify(version)};\nconst assets = ${JSON.stringify(assets)};\n${worker}`);
