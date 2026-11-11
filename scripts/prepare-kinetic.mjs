import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import prettier from 'prettier';
import catalog from '@kinetic-place/exercises-json/en/exercises.json' with { type: 'json' };
import { equipmentNeeded } from './kinetic-equipment.mjs';

const output = new URL('../src/entities/program/kinetic.ru.json', import.meta.url);
const cuesOutput = new URL('../src/entities/program/kinetic.cues.ru.json', import.meta.url);
const translations = process.argv[2] ? resolve(process.argv[2]) : output;
const savedCues = process.argv[2] ? {} : JSON.parse(await readFile(cuesOutput, 'utf8'));
const russianText = new Map(
  JSON.parse(await readFile(translations, 'utf8')).map(({ id, title, cues }) => [
    id,
    { title, cues: cues ?? savedCues[id] },
  ]),
);

const localized = catalog.map((item) => {
  const translation = russianText.get(item.id);
  const instructions = (item.instructions ?? []).filter((cue) => cue.trim());
  if (!translation?.title || translation.cues?.length !== instructions.length) {
    throw new Error(`Update the Russian translation for ${item.slug} (${item.id})`);
  }
  return {
    id: item.id,
    slug: item.slug,
    originalTitle: item.name,
    title: translation.title,
    hasCues: instructions.length > 0,
    muscles: item.muscleGroups
      .filter((muscle) => muscle.type === 'primary')
      .map(({ slug }) => slug),
    equipment: item.equipment.map(({ name }) => name),
    needs: equipmentNeeded(item, instructions),
    videoId: item.youtube?.videoId ?? null,
    strength: item.category === 'strength' && item.type === 'reps',
    difficulty: item.difficultyLevel,
  };
});

const options = await prettier.resolveConfig(fileURLToPath(output));
const cues = Object.fromEntries(localized.map(({ id }) => [id, russianText.get(id).cues]));
const formatJson = (value) =>
  prettier.format(JSON.stringify(value), { ...options, parser: 'json' });
await Promise.all([
  writeFile(output, await formatJson(localized)),
  writeFile(cuesOutput, await formatJson(cues)),
]);
