import catalog from './kinetic.ru.json';
import {
  defaultEquipment,
  equipmentLabels,
  homeEquipment,
  type HomeEquipment,
  type MuscleGroup,
} from './preferences';
import type { Exercise } from './model';

export type KineticExerciseId = `kinetic:${string}`;

const groupsByMuscle: Partial<Record<string, MuscleGroup>> = {
  quadriceps: 'Ноги и ягодицы',
  abductors: 'Ноги и ягодицы',
  adductors: 'Ноги и ягодицы',
  chest: 'Грудь и трицепсы',
  triceps: 'Грудь и трицепсы',
  lats: 'Спина',
  'middle-back': 'Спина',
  'lower-back': 'Спина',
  traps: 'Спина',
  hamstrings: 'Задняя поверхность бедра и ягодицы',
  glutes: 'Задняя поверхность бедра и ягодицы',
  shoulders: 'Плечи',
  biceps: 'Бицепс',
  forearms: 'Предплечья',
  calves: 'Икры',
  abdominals: 'Мышцы корпуса',
};

const gearLabels: Record<string, string> = {
  'Ab Wheel': 'Ролик для пресса',
  'Adjustable bench': 'Регулируемая скамья',
  Bands: 'Эспандер',
  Barbell: 'Штанга',
  'Battle Ropes': 'Тренировочные канаты',
  'Bench press station': 'Стойка для жима лёжа',
  'Body Only': 'Без инвентаря',
  Cable: 'Блочный тренажёр',
  'Climbing Rope': 'Канат для лазания',
  'Dip station': 'Брусья',
  Dumbbell: 'Гантели',
  'E-z Curl Bar': 'Гриф EZ',
  'Exercise Ball': 'Фитбол',
  'Flat bench': 'Горизонтальная скамья',
  'Foam Roll': 'Массажный ролик',
  'Gymnastic Rings': 'Гимнастические кольца',
  'Jump rope': 'Скакалка',
  Kettlebells: 'Гири',
  Landmine: 'Штанга с упором',
  Machine: 'Тренажёр',
  'Medicine Ball': 'Медбол',
  Other: 'Другой инвентарь',
  'Plyo box': 'Тумба для прыжков',
  'Preacher curl bench': 'Скамья Скотта',
  'Pull-Up Bar': 'Турник',
  Sandbag: 'Мешок с песком',
  Sled: 'Тренировочные сани',
  Sliders: 'Диски для скольжения',
  'Squat rack': 'Стойка для приседаний',
  'Suspension Trainer': 'Тренировочные петли',
  Tire: 'Покрышка',
  'Trap Bar': 'Трэп-гриф',
  'Weight Plate': 'Диск для штанги',
};

const demonstrations: Partial<Record<string, string>> = {
  'arm-circles': 'armCircles',
  'barbell-bench-press': 'barbellBenchPress',
  'barbell-deadlift': 'barbellDeadlift',
  'barbell-squat': 'barbellSquat',
  'bodyweight-squat': 'bodySquat',
  'chin-up': 'chinUp',
  'dips-triceps-version': 'tricepsDips',
  'dumbbell-bicep-curl': 'dumbbellCurl',
  'elliptical-trainer': 'elliptical',
  'kneeling-cable-crunch-with-alternating-oblique-twists': 'obliqueCableCrunch',
  'muscle-up': 'ringMuscleUp',
  plank: 'plank',
  pullups: 'pullups',
  'side-lateral-raise': 'lateralRaise',
  'goblet-squat': 'gobletSquat',
  'dumbbell-bench-press': 'press',
  'dumbbell-floor-press': 'floorPress',
  pushups: 'pushup',
  'bent-over-two-dumbbell-row': 'freeRow',
  'dumbbell-romanian-extension': 'rdl',
  'butt-lift-bridge': 'gluteBridge',
  'dumbbell-shoulder-press': 'shoulderPress',
  'standing-dumbbell-press': 'standingPress',
  'dead-bug': 'deadBug',
  'split-squats': 'splitSquatJump',
  'dumbbell-rear-lunge': 'dumbbellRearLunge',
  'barbell-lunge': 'barbellForwardLunge',
  'front-squat-clean-grip': 'cleanGripFrontSquat',
  'good-morning': 'goodMorning',
  'standing-dumbbell-calf-raise': 'standingDumbbellCalfRaise',
  crunches: 'abdominalCrunch',
  superman: 'superman',
  'single-leg-glute-bridge': 'singleLegBridge',
  'mountain-climbers': 'mountainClimber',
  'concentration-curls': 'concentrationCurl',
  'dumbbell-shrug': 'dumbbellShrug',
  'front-dumbbell-raise': 'alternatingFrontRaise',
  'dumbbell-step-ups': 'dumbbellStepUp',
};

export const kineticCatalog = catalog.map((item) => {
  const { title, hasCues, videoId } = item;
  const needs = item.needs as HomeEquipment[] | null;
  const groups = item.muscles.flatMap((muscle) => groupsByMuscle[muscle] ?? []);
  return {
    id: `kinetic:${item.id}` as KineticExerciseId,
    title,
    slug: item.slug,
    searchLabels: [item.originalTitle, ...item.muscles, ...item.equipment],
    groups: [...new Set(groups)],
    gear: needs
      ? needs.map((item) => equipmentLabels[item]).join(', ') || 'Без инвентаря'
      : item.equipment.map((name) => gearLabels[name] ?? 'Другой инвентарь').join(', ') ||
        'Инвентарь не указан',
    needs,
    hasCues,
    demonstration: demonstrations[item.slug],
    videoUrl:
      videoId && /^[\w-]{11}$/.test(videoId)
        ? `https://www.youtube.com/watch?v=${videoId}`
        : undefined,
    strength: item.strength,
    difficulty: item.difficulty,
  };
});

const usedEquipment = new Set<HomeEquipment>([
  ...defaultEquipment,
  ...kineticCatalog.flatMap(({ needs }) => needs ?? []),
]);
export const selectableEquipment = homeEquipment.filter((item) => usedEquipment.has(item));

export async function loadKineticCues(id: KineticExerciseId): Promise<readonly string[]> {
  const { default: cues } = await import('./kinetic.cues.ru.json');
  const byId: Record<string, string[]> = cues;
  return byId[id.slice('kinetic:'.length)] ?? [];
}

const weightedEquipment: readonly HomeEquipment[] = [
  'dumbbells',
  'barbell',
  'ezBar',
  'trapBar',
  'kettlebells',
  'weightPlate',
];

export const kineticStrengthExercises = kineticCatalog.flatMap((item) => {
  const [group] = item.groups;
  if (!item.strength || item.needs === null || !group || !item.hasCues) return [];
  return [
    {
      id: item.id,
      title: item.title,
      group,
      gear: item.gear,
      needs: item.needs,
      weighted: item.needs.some((equipment) => weightedEquipment.includes(equipment)),
      cues: item.id,
      demonstration: item.demonstration,
      videoUrl: item.videoUrl,
      difficulty: item.difficulty,
    } satisfies Exercise & { id: KineticExerciseId; difficulty: string | null },
  ];
});
