import { normalizeSearchText } from '../../shared/lib/normalizeSearchText';
import { kineticCatalog } from './kinetic';
import type { HomeEquipment } from './preferences';

const russianTerms: [RegExp, RegExp][] = [
  [/^гантел/, /\bdumbbells?\b/],
  [/^штанг/, /\bbarbells?\b/],
  [/^гир/, /\bkettlebells?\b/],
  [/^резин|^эспандер/, /\bbands?\b/],
  [/^скам/, /\bbench\b/],
  [/^тренаж/, /\b(?:machine|cable)s?\b/],
  [/^турник/, /\b(?:pull up bar|pull ups?|chin ups?)\b/],
  [/^брусь/, /\b(?:dips?|dip station)\b/],
  [/^жим/, /\bpress\b/],
  [/^присед/, /\bsquats?\b/],
  [/^отжим/, /\b(?:push ?ups?|dips?)\b/],
  [/^подтяг/, /\b(?:pull ?ups?|chin ?ups?)\b/],
  [/^тяг|^гребл/, /\b(?:rows?|deadlifts?|pull ?downs?)\b/],
  [/^выпад/, /\blunges?\b/],
  [/^планк/, /\bplanks?\b/],
  [/^скручив/, /\b(?:crunch(?:es)?|twists?)\b/],
  [/^мост/, /\bbridge\b/],
  [/^сгиб/, /\b(?:curls?|flexion)\b/],
  [/^разгиб/, /\bextensions?\b/],
  [/^развед|^развод/, /\b(?:flye?s?|raises?)\b/],
  [/^подъем|^мах/, /\b(?:raises?|lifts?|swings?)\b/],
  [/^пресс|^живот|^корпус/, /\b(?:abdominals|abs|core)\b/],
  [/^груд/, /\bchest\b/],
  [/^спин/, /\b(?:back|lats|traps)\b/],
  [/^широчайш/, /\blats\b/],
  [/^трапец/, /\btraps\b/],
  [/^плеч|^дельт/, /\b(?:shoulders?|deltoids?)\b/],
  [/^бицепс/, /\bbiceps\b/],
  [/^трицепс/, /\btriceps\b/],
  [/^предплеч/, /\bforearms?\b/],
  [/^ягодиц|^ягодич/, /\bglutes?\b/],
  [/^икр/, /\b(?:calves|calf)\b/],
  [/^бедр/, /\b(?:hamstrings|quadriceps|abductors|adductors)\b/],
  [/^квадрицепс/, /\bquadriceps\b/],
  [/^ше[яию]/, /\bneck\b/],
  [/^ног/, /\b(?:legs?|quadriceps|hamstrings|glutes|calves)\b/],
  [/^леж/, /\b(?:bench|floor|lying|prone|supine)\b/],
  [/^сид/, /\b(?:seated|sitting)\b/],
  [/^сто[яй]/, /\bstanding\b/],
  [/^румын/, /\bromanian\b/],
  [/^наклон/, /\b(?:incline|bent over|decline)\b/],
  [/^мертв/, /\bdead(?:lift)?\b/],
  [/^жук/, /\bbug\b/],
];

const searchableCatalog = kineticCatalog.map((exercise) => ({
  exercise,
  text: normalizeSearchText(
    [
      exercise.title,
      exercise.slug,
      exercise.gear,
      ...exercise.groups,
      ...exercise.searchLabels,
    ].join(' '),
  ),
}));

const prepositions = new Set(['в', 'во', 'на', 'с', 'со', 'и', 'для', 'к', 'по', 'от']);
const bodyweightPhrase = /без\s+(?:инвентаря|оборудования|веса)|с\s+собственным\s+весом/;

export function searchKineticExercises(
  query: string,
  group = '',
  equipment?: readonly HomeEquipment[],
) {
  const normalizedQuery = normalizeSearchText(query);
  const bodyweightOnly = bodyweightPhrase.test(normalizedQuery);
  const words = normalizedQuery.replace(bodyweightPhrase, ' ').match(/[\p{L}\p{N}]+/gu) ?? [];
  const terms = words
    .filter((word) => !prepositions.has(word) && !word.startsWith('упражнен'))
    .map((word) => ({ word, alias: russianTerms.find(([pattern]) => pattern.test(word))?.[1] }));

  return searchableCatalog
    .filter(
      ({ exercise, text }) =>
        (!group || exercise.groups.some((value) => value === group)) &&
        (!bodyweightOnly || exercise.needs?.length === 0) &&
        (!equipment || exercise.needs?.every((item) => equipment.includes(item))) &&
        terms.every(({ word, alias }) => text.includes(word) || alias?.test(text)),
    )
    .map(({ exercise }) => exercise);
}
