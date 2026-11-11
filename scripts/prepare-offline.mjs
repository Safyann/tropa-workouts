import { createHash } from 'node:crypto';
import { readFile, readdir, writeFile } from 'node:fs/promises';
import { join, relative, resolve, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const output = process.argv[2]
  ? pathToFileURL(resolve(process.argv[2]) + sep)
  : new URL('../dist/', import.meta.url);
const outputPath = fileURLToPath(output);
const assets = (await readdir(output, { recursive: true, withFileTypes: true }))
  .filter((entry) => entry.isFile() && !['sw.js', '.nojekyll'].includes(entry.name))
  .map((entry) => relative(outputPath, join(entry.parentPath, entry.name)).split(sep).join('/'))
  .sort();
const worker = await readFile(new URL('./worker.js', import.meta.url), 'utf8');
const hash = createHash('sha256').update(worker);
for (const asset of assets) hash.update(asset).update(await readFile(new URL(asset, output)));
const version = hash.digest('hex').slice(0, 16);
await writeFile(
  new URL('sw.js', output),
  `const version = ${JSON.stringify(version)};\nconst assets = ${JSON.stringify(assets)};\n${worker}`,
);
