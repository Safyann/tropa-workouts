type Point = [number, number];
type Pose = Point[];

export interface Exercise {
  title: string;
  cues: string[];
  equipment: string;
  poses: [Pose, Pose];
  support?: string;
  reference: string;
}

export type ExerciseId = 'squat' | 'press' | 'row';

export const exercises: Record<ExerciseId, Exercise> = {
  squat: {
    title: 'Присед к скамье',
    reference: 'https://www.nhs.uk/live-well/exercise/strength-exercises/',
    cues: ['Встань перед устойчивой скамьёй. Стопы полностью на полу.', 'Отведи таз назад, слегка коснись скамьи и встань. Можно начать без веса.'],
    equipment: 'M49 103h54m-46 0v36m38-36v36',
    poses: [
      [[118,33],[116,51],[115,83],[123,111],[125,137],[122,62],[118,73],[115,73]],
      [[132,56],[123,73],[103,102],[130,109],[125,137],[127,84],[135,89],[132,88]]
    ]
  },
  press: {
    title: 'Жим гантелей лёжа',
    reference: 'https://www.mayoclinic.org/healthy-lifestyle/fitness/multimedia/chest-press/vid-20084677',
    cues: ['Ляг на устойчивую скамью и поставь стопы на пол.', 'Поднимай гантели над грудью. Опускай их плавно, сохраняя контроль.'],
    equipment: 'M49 101h110m-100 0v38m89-38v38',
    poses: [
      [[65,83],[80,90],[142,92],[159,112],[170,137],[96,93],[119,103],[119,82]],
      [[65,83],[80,90],[142,92],[159,112],[170,137],[103,82],[107,58],[107,40]]
    ]
  },
  row: {
    title: 'Тяга гантели с опорой',
    reference: 'https://www.acefitness.org/resources/everyone/exercise-library/126/single-arm-row/',
    cues: ['Обопрись свободной рукой на устойчивую скамью. Держи корпус неподвижно.', 'Веди локоть к поясу, затем плавно опускай гантель. Повтори другой рукой.'],
    equipment: 'M140 105h56m-50 0v34m43-34v34',
    poses: [
      [[146,43],[131,56],[90,78],[83,110],[80,137],[131,72],[129,99],[129,125]],
      [[146,43],[131,56],[90,78],[83,110],[80,137],[129,67],[100,62],[101,88]]
    ],
    support: 'M130 61l24 22 9 20'
  }
};

interface StopInfo {
  title: string;
  type: string;
  gear: string;
  x: number;
  y: number;
}

export type Stop = StopInfo & (
  | { icon: 'strength'; moves: ExerciseId[]; sets: number }
  | { icon: 'cardio'; minutes: number; shortMinutes: number }
);

export const route: Stop[] = [
  { title: 'Первый костёр', type: 'Силовая', icon: 'strength', gear: 'Гантели · скамья', moves: ['squat', 'press', 'row'], sets: 2, x: 15.3, y: 76.4 },
  { title: 'Лесная тропа', type: 'Эллипс', icon: 'cardio', gear: 'Эллиптический тренажёр', minutes: 10, shortMinutes: 5, x: 38.1, y: 53.6 },
  { title: 'Тихий подъём', type: 'Силовая', icon: 'strength', gear: 'Гантели · скамья', moves: ['row', 'squat', 'press'], sets: 2, x: 61.9, y: 60 },
  { title: 'Большая поляна', type: 'Эллипс', icon: 'cardio', gear: 'Эллиптический тренажёр', minutes: 12, shortMinutes: 6, x: 81.9, y: 25.1 }
];

export function workoutDetail(stop: Stop, short = false) {
  if (stop.icon === 'cardio') return `${short ? stop.shortMinutes : stop.minutes} мин`;
  return short ? '2 упражнения · по 1 подходу' : `${stop.moves.length} упражнения · по ${stop.sets} подхода`;
}
