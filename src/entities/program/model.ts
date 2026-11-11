import {
  defaultPreferences,
  defaultEquipment,
  levels,
  mainBudget,
  muscleGroups,
  optionalBlockMinutes,
  type HomeEquipment,
  type MuscleGroup,
  type WorkoutPreferences,
} from './preferences';
import { kineticStrengthExercises, kineticVideo, type KineticExerciseId } from './kinetic';

type Point = [number, number];
type Pose = Point[];

export interface Exercise {
  title: string;
  group: MuscleGroup;
  gear: string;
  needs?: readonly HomeEquipment[];
  weighted: boolean;
  perSide?: boolean;
  cues: readonly string[] | KineticExerciseId;
  equipment?: string;
  poses?: [Pose, Pose];
  video?: string;
  support?: string;
  reference?: string;
}

type RouteExerciseId =
  | 'squat'
  | 'press'
  | 'row'
  | 'bodySquat'
  | 'gobletSquat'
  | 'floorPress'
  | 'wallPress'
  | 'pushup'
  | 'freeRow'
  | 'singleFreeRow'
  | 'rdl'
  | 'gluteBridge'
  | 'shoulderPress'
  | 'standingPress'
  | 'deadBug'
  | 'birdDog'
  | 'proneW';

export type ExerciseId = RouteExerciseId | KineticExerciseId;

const routeExercises: Record<RouteExerciseId, Exercise> = {
  squat: {
    needs: ['bench'],
    title: 'Присед к скамье',
    group: 'Ноги и ягодицы',
    gear: 'Скамья · гантель по желанию',
    weighted: true,
    reference: 'https://www.nhs.uk/live-well/exercise/strength-exercises/',
    cues: [
      'Встань перед устойчивой скамьёй. Стопы полностью на полу.',
      'Отведи таз назад, слегка коснись скамьи и встань. Можно начать без веса.',
    ],
    equipment: 'M49 103h54m-46 0v36m38-36v36',
    poses: [
      [
        [118, 33],
        [116, 51],
        [115, 83],
        [123, 111],
        [125, 137],
        [122, 62],
        [118, 73],
        [115, 73],
      ],
      [
        [132, 56],
        [123, 73],
        [103, 102],
        [130, 109],
        [125, 137],
        [127, 84],
        [135, 89],
        [132, 88],
      ],
    ],
  },
  press: {
    needs: ['bench', 'dumbbells'],
    title: 'Жим гантелей лёжа',
    group: 'Грудь и трицепсы',
    gear: 'Скамья · гантели',
    weighted: true,
    reference:
      'https://www.mayoclinic.org/healthy-lifestyle/fitness/multimedia/chest-press/vid-20084677',
    cues: [
      'Ляг на устойчивую скамью и поставь стопы на пол.',
      'Поднимай гантели над грудью. Опускай их плавно, сохраняя контроль.',
    ],
    equipment: 'M49 101h110m-100 0v38m89-38v38',
    poses: [
      [
        [65, 83],
        [80, 90],
        [142, 92],
        [159, 112],
        [170, 137],
        [96, 93],
        [119, 103],
        [119, 82],
      ],
      [
        [65, 83],
        [80, 90],
        [142, 92],
        [159, 112],
        [170, 137],
        [103, 82],
        [107, 58],
        [107, 40],
      ],
    ],
  },
  row: {
    needs: ['bench', 'dumbbells'],
    title: 'Тяга гантели с опорой',
    group: 'Спина',
    gear: 'Скамья · гантель',
    weighted: true,
    perSide: true,
    reference: 'https://www.acefitness.org/resources/everyone/exercise-library/126/single-arm-row/',
    cues: [
      'Обопрись свободной рукой на устойчивую скамью. Держи корпус неподвижно.',
      'Веди локоть к поясу, затем плавно опускай гантель. Повтори другой рукой.',
    ],
    equipment: 'M140 105h56m-50 0v34m43-34v34',
    poses: [
      [
        [146, 43],
        [131, 56],
        [90, 78],
        [83, 110],
        [80, 137],
        [131, 72],
        [129, 99],
        [129, 125],
      ],
      [
        [146, 43],
        [131, 56],
        [90, 78],
        [83, 110],
        [80, 137],
        [129, 67],
        [100, 62],
        [101, 88],
      ],
    ],
    support: 'M130 61l24 22 9 20',
  },
  bodySquat: {
    title: 'Присед без скамьи',
    group: 'Ноги и ягодицы',
    gear: 'Без инвентаря',
    weighted: false,
    reference:
      'https://www.acefitness.org/resources/everyone/exercise-library/135/bodyweight-squat/',
    cues: [
      'Упрись всей стопой в пол и отведи таз назад.',
      'Плавно опустись на удобную глубину, затем выпрямись.',
    ],
  },
  gobletSquat: {
    video: kineticVideo('goblet-squat'),
    needs: ['dumbbells'],
    title: 'Присед с гантелью у груди',
    group: 'Ноги и ягодицы',
    gear: 'Одна гантель',
    weighted: true,
    reference: 'https://www.acefitness.org/resources/everyone/exercise-library/362/goblet-squat/',
    cues: ['Держи гантель двумя руками перед грудью.', 'Опускайся плавно и держи стопы на полу.'],
  },
  floorPress: {
    video: kineticVideo('dumbbell-floor-press'),
    needs: ['dumbbells'],
    title: 'Жим гантелей на полу',
    group: 'Грудь и трицепсы',
    gear: 'Гантели',
    weighted: true,
    reference:
      'https://www.mayoclinic.org/healthy-lifestyle/fitness/multimedia/chest-press/vid-20084677',
    cues: [
      'Ляг на спину, согни колени и поставь стопы на пол.',
      'Плавно опускай гантели, пока верхняя часть рук мягко не коснётся пола.',
    ],
  },
  wallPress: {
    title: 'Отжимания от стены',
    group: 'Грудь и трицепсы',
    gear: 'Устойчивая стена',
    weighted: false,
    reference: 'https://www.nhs.uk/live-well/exercise/strength-exercises/',
    cues: [
      'Поставь ладони на стену примерно на уровне груди.',
      'Согни руки и приблизь корпус к стене, затем плавно оттолкнись.',
    ],
  },
  pushup: {
    video: kineticVideo('pushups'),
    title: 'Отжимания от пола',
    group: 'Грудь и трицепсы',
    gear: 'Без инвентаря',
    weighted: false,
    reference: 'https://www.acefitness.org/resources/everyone/exercise-library/41/push-up/',
    cues: [
      'Упрись ладонями в пол и удерживай корпус ровно.',
      'Плавно согни руки, затем оттолкнись от пола.',
    ],
  },
  freeRow: {
    video: kineticVideo('bent-over-two-dumbbell-row'),
    needs: ['dumbbells'],
    title: 'Тяга двух гантелей в наклоне',
    group: 'Спина',
    gear: 'Гантели',
    weighted: true,
    cues: [
      'Слегка согни колени и наклони корпус за счёт движения в тазу.',
      'Подтяни гантели к корпусу, удерживая его неподвижно, затем плавно опусти.',
    ],
  },
  singleFreeRow: {
    needs: ['dumbbells'],
    title: 'Тяга одной гантели в наклоне без скамьи',
    group: 'Спина',
    gear: 'Одна гантель',
    weighted: true,
    perSide: true,
    cues: [
      'Наклони корпус и сохраняй устойчивое положение.',
      'Подтяни гантель к боку, удерживая корпус неподвижно. Повтори другой рукой.',
    ],
  },
  proneW: {
    title: 'Подъём рук буквой W лёжа',
    group: 'Спина',
    gear: 'Без инвентаря',
    weighted: false,
    reference:
      'https://www.acefitness.org/resources/everyone/exercise-library/249/prone-scapular-shoulder-stabilization-series-i-y-t-w-o-formation/',
    cues: [
      'Ляг на живот и согни руки так, чтобы они образовали букву W.',
      'Слегка приподними руки, мягко сведи лопатки и плавно опусти руки.',
    ],
  },
  rdl: {
    video: kineticVideo('dumbbell-romanian-extension'),
    needs: ['dumbbells'],
    title: 'Румынская тяга с гантелями',
    group: 'Задняя поверхность бедра и ягодицы',
    gear: 'Гантели',
    weighted: true,
    cues: [
      'Слегка согни колени и отведи таз назад, держа гантели близко к ногам.',
      'Выпрямись, сохраняя контроль и устойчивое положение корпуса.',
    ],
  },
  gluteBridge: {
    video: kineticVideo('butt-lift-bridge'),
    title: 'Ягодичный мост на полу',
    group: 'Задняя поверхность бедра и ягодицы',
    gear: 'Без инвентаря',
    weighted: false,
    cues: [
      'Ляг на спину, согни колени и поставь стопы на пол.',
      'Подними таз и плавно опусти его, сохраняя контроль.',
    ],
  },
  shoulderPress: {
    video: kineticVideo('dumbbell-shoulder-press'),
    needs: ['dumbbells'],
    title: 'Жим гантелей сидя',
    group: 'Плечи',
    gear: 'Гантели · скамья или устойчивый стул',
    weighted: true,
    cues: [
      'Сядь устойчиво и держи гантели у плеч.',
      'Плавно выжми гантели вверх и верни их к плечам.',
    ],
  },
  standingPress: {
    needs: ['dumbbells'],
    title: 'Жим гантелей стоя',
    group: 'Плечи',
    gear: 'Гантели',
    weighted: true,
    cues: [
      'Встань устойчиво и подними гантели к плечам.',
      'Жми вверх плавно, удерживая корпус неподвижным.',
    ],
  },
  deadBug: {
    video: kineticVideo('dead-bug'),
    title: 'Мёртвый жук',
    group: 'Мышцы корпуса',
    gear: 'Без инвентаря',
    weighted: false,
    perSide: true,
    cues: [
      'Ляг на спину, подними руки и согнутые ноги.',
      'Плавно отводи противоположные руку и ногу, сохраняя корпус неподвижным. Чередуй стороны.',
    ],
  },
  birdDog: {
    title: 'Рука и нога на четвереньках',
    group: 'Мышцы корпуса',
    gear: 'Без инвентаря',
    weighted: false,
    perSide: true,
    reference: 'https://www.acefitness.org/resources/everyone/exercise-library/14/bird-dog/',
    cues: [
      'Встань на четвереньки, ладони под плечами, колени под тазом.',
      'Плавно вытяни противоположные руку и ногу, затем вернись и поменяй стороны.',
    ],
  },
};

const routeExerciseIds = Object.keys(routeExercises) as RouteExerciseId[];
const kineticById = Object.fromEntries(kineticStrengthExercises.map((item) => [item.id, item]));

export const exercises: Record<ExerciseId, Exercise> = { ...routeExercises, ...kineticById };

function hasEquipment(id: ExerciseId, equipment: readonly HomeEquipment[]) {
  return exercises[id].needs?.every((item) => equipment.includes(item)) ?? true;
}

export function exerciseAlternatives(
  id: ExerciseId,
  equipment: readonly HomeEquipment[] = defaultEquipment,
  limit = Infinity,
): ExerciseId[] {
  const { group } = exercises[id];
  const candidates = Object.hasOwn(routeExercises, id)
    ? routeExerciseIds
    : (kineticAlternativeIds.get(group) ?? []);
  const alternatives: ExerciseId[] = [];
  for (const candidate of candidates) {
    if (alternatives.length >= limit) break;
    if (
      candidate !== id &&
      exercises[candidate].group === group &&
      hasEquipment(candidate, equipment)
    )
      alternatives.push(candidate);
  }
  return alternatives;
}

const difficultyRank: Record<string, number> = { beginner: 0, intermediate: 1, expert: 3 };
const rankedKineticExercises = [...kineticStrengthExercises].sort(
  (a, b) => (difficultyRank[a.difficulty ?? ''] ?? 2) - (difficultyRank[b.difficulty ?? ''] ?? 2),
);
const kineticByGroup = new Map<MuscleGroup, typeof rankedKineticExercises>();
for (const exercise of rankedKineticExercises) {
  const group = kineticByGroup.get(exercise.group) ?? [];
  group.push(exercise);
  kineticByGroup.set(exercise.group, group);
}
const kineticAlternativeIds = new Map(
  [...kineticByGroup].map(([group, candidates]) => [
    group,
    candidates.filter(({ difficulty }) => difficulty !== 'expert').map(({ id }) => id),
  ]),
);

export function availableExercisesByGroup(preferences = defaultPreferences) {
  const available = new Map<MuscleGroup, ExerciseId[]>();
  const equipment = preferences.equipment ?? defaultEquipment;
  for (const [group, candidates] of kineticByGroup) {
    const withNewEquipment: ExerciseId[] = [];
    const usual: ExerciseId[] = [];
    for (const { id, difficulty, needs } of candidates) {
      if (difficulty === 'expert' && preferences.level !== 'advanced') continue;
      if (!hasEquipment(id, equipment)) continue;
      if (needs.some((item) => !defaultEquipment.some((defaultItem) => defaultItem === item))) {
        withNewEquipment.push(id);
      } else {
        usual.push(id);
      }
    }
    if (withNewEquipment.length || usual.length) {
      available.set(group, [...withNewEquipment, ...usual]);
    }
  }
  return available;
}

interface StopInfo {
  title: string;
  type: string;
  x: number;
  y: number;
}

export type Stop = StopInfo &
  (
    | { icon: 'strength'; moves: ExerciseId[]; sets: number }
    | { icon: 'cardio'; shortMinutes: number }
  );

export const route: Stop[] = [
  {
    title: 'Первый костёр',
    type: 'Силовая',
    icon: 'strength',
    moves: ['squat', 'press', 'row'],
    sets: 2,
    x: 15.3,
    y: 76.4,
  },
  { title: 'Лесная тропа', type: 'Эллипс', icon: 'cardio', shortMinutes: 5, x: 38.1, y: 53.6 },
  {
    title: 'Тихий подъём',
    type: 'Силовая',
    icon: 'strength',
    moves: ['row', 'squat', 'press'],
    sets: 2,
    x: 61.9,
    y: 60,
  },
  { title: 'Большая поляна', type: 'Эллипс', icon: 'cardio', shortMinutes: 6, x: 81.9, y: 25.1 },
];

const extendedMoves: ExerciseId[] = ['rdl', 'shoulderPress', 'deadBug'];
const bodyweightMoves: ExerciseId[] = [
  'bodySquat',
  'wallPress',
  'proneW',
  'gluteBridge',
  'deadBug',
];

export function workoutTiming(stop: Stop, short: boolean, preferences = defaultPreferences) {
  const warmup = preferences.warmup ? optionalBlockMinutes : 0;
  const cooldown = preferences.cooldown ? optionalBlockMinutes : 0;
  const budget = mainBudget(preferences);
  const main = short ? Math.min(budget, stop.icon === 'cardio' ? stop.shortMinutes : 10) : budget;
  return { warmup, main, cooldown, total: warmup + main + cooldown };
}

interface StrengthSchedule {
  plan: { exercise: ExerciseId; target: number }[];
  restSeconds: number;
  estimatedMainMinutes: number | null;
}

const setsPerExercise = 3;
const maxSetsPerExercise = 4;
const regularSetSeconds = 90;
const quickSetSeconds = 40;
const maxExtraRestSeconds = 15;

function focusedStrengthSchedule(
  mainMinutes: number,
  short: boolean,
  preferences: WorkoutPreferences,
): StrengthSchedule | null {
  const selected = preferences.muscleGroups ?? [];
  if (!selected.length) return null;

  const byGroup = availableExercisesByGroup(preferences);
  const groups = muscleGroups.flatMap((group) => {
    const candidates = byGroup.get(group);
    return candidates && selected.includes(group) ? [candidates] : [];
  });
  if (!groups.length) return null;

  const budget = mainMinutes * 60;
  const usualRest = levels[preferences.level].rest;
  // A full set estimate includes setup and logging. Use a quicker pace for short sessions
  // or when the main block needs to fit at least one set for many selected groups.
  const minimumRestCount = groups.length - 1;
  const quickPace =
    short || groups.length * regularSetSeconds + minimumRestCount * usualRest > budget;
  const setSeconds = quickPace ? quickSetSeconds : regularSetSeconds;
  const baseRest =
    minimumRestCount === 0
      ? usualRest
      : Math.min(usualRest, Math.floor((budget - groups.length * setSeconds) / minimumRestCount));
  // The final set has no rest after it.
  const setBudget = Math.floor((budget + baseRest) / (setSeconds + baseRest));
  const exerciseBudget = short
    ? setBudget
    : Math.max(groups.length, Math.ceil(setBudget / setsPerExercise));
  const plan: StrengthSchedule['plan'] = [];
  for (let position = 0; plan.length < exerciseBudget; position++) {
    const countBefore = plan.length;
    for (const group of groups) {
      const exercise = group[position];
      if (!exercise) continue;
      plan.push({ exercise, target: 1 });
      if (plan.length === exerciseBudget) break;
    }
    if (plan.length === countBefore) break;
  }
  const totalSets = short ? plan.length : Math.min(setBudget, plan.length * maxSetsPerExercise);
  for (let index = 0; index < totalSets - plan.length; index++) {
    plan[index % plan.length].target++;
  }
  const workSeconds = totalSets * setSeconds;
  const restCount = totalSets - 1;
  // Spread a small remainder across rests without stretching a short plan with long pauses.
  const restSeconds =
    restCount > 0
      ? Math.min(baseRest + maxExtraRestSeconds, Math.floor((budget - workSeconds) / restCount))
      : baseRest;
  const seconds = workSeconds + restCount * restSeconds;
  return { plan, restSeconds, estimatedMainMinutes: Math.round(seconds / 60) };
}

export function strengthSchedule(
  stop: Extract<Stop, { icon: 'strength' }>,
  short: boolean,
  preferences = defaultPreferences,
): StrengthSchedule {
  const { main } = workoutTiming(stop, short, preferences);
  const focused = focusedStrengthSchedule(main, short, preferences);
  if (focused) return focused;

  const budget = mainBudget(preferences);
  const extraCount = budget >= 45 ? 3 : budget >= 30 ? 2 : 0;
  const equipment = preferences.equipment ?? defaultEquipment;
  const bodyweight = !equipment.includes('dumbbells') && !equipment.includes('bench');
  const routeMoves = bodyweight
    ? bodyweightMoves
    : [...stop.moves, ...extendedMoves.slice(0, extraCount)];
  const moves = routeMoves.flatMap((exercise) =>
    hasEquipment(exercise, equipment) ? [exercise] : exerciseAlternatives(exercise, equipment, 1),
  );
  const extraSets = {
    beginner: Number(budget >= 45),
    basic: Number(budget >= 30),
    experienced: 1 + Number(budget >= 45),
    advanced: 1 + Number(budget >= 30),
  }[preferences.level];
  const target = short || budget < 15 ? 1 : stop.sets + extraSets;
  return {
    plan: (short ? moves.slice(0, bodyweight ? 3 : 2) : moves).map((exercise) => ({
      exercise,
      target,
    })),
    restSeconds: levels[preferences.level].rest,
    estimatedMainMinutes: null,
  };
}

export function workoutDetail(stop: Stop, short = false, preferences = defaultPreferences) {
  const { total, warmup, cooldown } = workoutTiming(stop, short, preferences);
  if (stop.icon === 'cardio') return `${total} мин`;
  const { plan, estimatedMainMinutes } = strengthSchedule(stop, short, preferences);
  let noun = 'упражнений';
  if (plan.length === 1) noun = 'упражнение';
  else if (plan.length < 5) noun = 'упражнения';
  const duration =
    estimatedMainMinutes === null
      ? `до ${total} мин`
      : `около ${warmup + estimatedMainMinutes + cooldown} мин`;
  return `${plan.length} ${noun} · ${duration}`;
}
