import {
  defaultPreferences,
  homeEquipment,
  mainBudget,
  optionalBlockMinutes,
  type HomeEquipment,
} from './preferences';

type Point = [number, number];
type Pose = Point[];

export interface Exercise {
  title: string;
  group:
    | 'Ноги и ягодицы'
    | 'Грудь и трицепсы'
    | 'Спина'
    | 'Задняя поверхность бедра и ягодицы'
    | 'Плечи'
    | 'Мышцы корпуса';
  gear: string;
  needs?: readonly HomeEquipment[];
  weighted: boolean;
  perSide?: boolean;
  cues: string[];
  equipment?: string;
  poses?: [Pose, Pose];
  gifId?: string;
  support?: string;
  reference?: string;
}

export type ExerciseId =
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

export const exercises: Record<ExerciseId, Exercise> = {
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
    gifId: 'SpYC0Kp',
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
    gifId: '6YUfHPL',
    cues: [
      'Упрись всей стопой в пол и отведи таз назад.',
      'Плавно опустись на удобную глубину, затем выпрямись.',
    ],
  },
  gobletSquat: {
    needs: ['dumbbells'],
    title: 'Присед с гантелью у груди',
    group: 'Ноги и ягодицы',
    gear: 'Одна гантель',
    weighted: true,
    gifId: 'yn8yg1r',
    reference: 'https://www.acefitness.org/resources/everyone/exercise-library/362/goblet-squat/',
    cues: ['Держи гантель двумя руками перед грудью.', 'Опускайся плавно и держи стопы на полу.'],
  },
  floorPress: {
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
    gifId: 'NCmbLCw',
    reference: 'https://www.nhs.uk/live-well/exercise/strength-exercises/',
    cues: [
      'Поставь ладони на стену примерно на уровне груди.',
      'Согни руки и приблизь корпус к стене, затем плавно оттолкнись.',
    ],
  },
  pushup: {
    title: 'Отжимания от пола',
    group: 'Грудь и трицепсы',
    gear: 'Без инвентаря',
    weighted: false,
    gifId: 'I4hDWkc',
    reference: 'https://www.acefitness.org/resources/everyone/exercise-library/41/push-up/',
    cues: [
      'Упрись ладонями в пол и удерживай корпус ровно.',
      'Плавно согни руки, затем оттолкнись от пола.',
    ],
  },
  freeRow: {
    needs: ['dumbbells'],
    title: 'Тяга двух гантелей в наклоне',
    group: 'Спина',
    gear: 'Гантели',
    weighted: true,
    gifId: 'BJ0Hz5L',
    reference: 'https://oss.exercisedb.dev/api/v1/exercises/BJ0Hz5L',
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
    gifId: 'v2DfH14',
    reference: 'https://oss.exercisedb.dev/api/v1/exercises/v2DfH14',
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
    needs: ['dumbbells'],
    title: 'Румынская тяга с гантелями',
    group: 'Задняя поверхность бедра и ягодицы',
    gear: 'Гантели',
    weighted: true,
    gifId: 'rR0LJzx',
    cues: [
      'Слегка согни колени и отведи таз назад, держа гантели близко к ногам.',
      'Выпрямись, сохраняя контроль и устойчивое положение корпуса.',
    ],
  },
  gluteBridge: {
    title: 'Ягодичный мост на полу',
    group: 'Задняя поверхность бедра и ягодицы',
    gear: 'Без инвентаря',
    weighted: false,
    gifId: 'u0cNiij',
    cues: [
      'Ляг на спину, согни колени и поставь стопы на пол.',
      'Подними таз и плавно опусти его, сохраняя контроль.',
    ],
  },
  shoulderPress: {
    needs: ['dumbbells'],
    title: 'Жим гантелей сидя',
    group: 'Плечи',
    gear: 'Гантели · скамья или устойчивый стул',
    weighted: true,
    gifId: 'znQUdHY',
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
    title: 'Мёртвый жук',
    group: 'Мышцы корпуса',
    gear: 'Без инвентаря',
    weighted: false,
    perSide: true,
    gifId: 'iny3m5y',
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

function hasEquipment(id: ExerciseId, equipment: readonly HomeEquipment[]) {
  return exercises[id].needs?.every((item) => equipment.includes(item)) ?? true;
}

export function exerciseAlternatives(
  id: ExerciseId,
  equipment: readonly HomeEquipment[] = homeEquipment,
): ExerciseId[] {
  return (Object.keys(exercises) as ExerciseId[]).filter(
    (candidate) =>
      candidate !== id &&
      exercises[candidate].group === exercises[id].group &&
      hasEquipment(candidate, equipment),
  );
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

export function strengthPlan(
  stop: Extract<Stop, { icon: 'strength' }>,
  short: boolean,
  preferences = defaultPreferences,
) {
  const budget = mainBudget(preferences);
  const extraCount = budget >= 45 ? 3 : budget >= 30 ? 2 : 0;
  const equipment = preferences.equipment ?? homeEquipment;
  const bodyweight = !equipment.includes('dumbbells') && !equipment.includes('bench');
  const moves = bodyweight
    ? bodyweightMoves
    : [...stop.moves, ...extendedMoves.slice(0, extraCount)];
  const available = moves.flatMap((exercise) => {
    if (hasEquipment(exercise, equipment)) return [exercise];
    return exerciseAlternatives(exercise, equipment).slice(0, 1);
  });
  if (short)
    return available.slice(0, bodyweight ? 3 : 2).map((exercise) => ({ exercise, target: 1 }));
  const extraSets = {
    beginner: Number(budget >= 45),
    basic: Number(budget >= 30),
    experienced: 1 + Number(budget >= 45),
    advanced: 1 + Number(budget >= 30),
  }[preferences.level];
  const target = budget < 15 ? 1 : stop.sets + extraSets;
  return available.map((exercise) => ({ exercise, target }));
}

export function workoutDetail(stop: Stop, short = false, preferences = defaultPreferences) {
  const { total } = workoutTiming(stop, short, preferences);
  if (stop.icon === 'cardio') return `${total} мин`;
  const plan = strengthPlan(stop, short, preferences);
  const noun = plan.length < 5 ? 'упражнения' : 'упражнений';
  return `${plan.length} ${noun} · до ${total} мин`;
}
