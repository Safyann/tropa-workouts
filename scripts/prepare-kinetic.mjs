import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import prettier from 'prettier';
import catalog from '@kinetic-place/exercises-json/en/exercises.json' with { type: 'json' };

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

function homeEquipmentNeeded(equipment, instructions) {
  if (!equipment.length) return null;
  const needed = new Set();
  for (const item of equipment) {
    if (item.family === 'bodyweight') continue;
    if (item.family === 'dumbbell' && (item.numItems ?? 1) <= 2) needed.add('dumbbells');
    else if (item.name === 'Flat bench') needed.add('bench');
    else return null;
  }
  // Check for equipment and assistance mentioned only in the instructions.
  const text = instructions.join(' ');
  if (
    /\b(?:incline bench|decline bench|adjustable bench|preacher bench|rack|smith machine|pull-up bar|barbell|dip station|plyo box|block|partner|someone holding)\b/i.test(
      text,
    )
  )
    return null;
  if (/\bbench\b/i.test(text)) needed.add('bench');
  if (/\bdumbbells?\b/i.test(text)) needed.add('dumbbells');
  return [...needed];
}

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
    needs: homeEquipmentNeeded(item.equipment, instructions),
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
