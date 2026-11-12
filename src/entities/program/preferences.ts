import equipmentLabels from './equipment.json';

export { equipmentLabels };

export const durations = [20, 40, 60] as const;
export const weeklyGoals = [1, 2, 3, 4, 5, 6, 7] as const;
export const defaultWeeklyGoal = 2;
export const routeWeeks = [1, 2, 3, 4] as const;
export const defaultRouteWeeks = 2;
export const trainingWeekdays = [1, 2, 3, 4, 5, 6, 0] as const;
export type TrainingWeekday = (typeof trainingWeekdays)[number];
export type ProgramId = 'dumbbell';
export type HomeEquipment = keyof typeof equipmentLabels;
export const homeEquipment = Object.keys(equipmentLabels) as HomeEquipment[];
export const defaultEquipment = [
  'dumbbells',
  'bench',
  'elliptical',
] as const satisfies readonly HomeEquipment[];
export const cardioTitles = { elliptical: 'Эллипс', walking: 'Ходьба' } as const;
export type CardioActivity = keyof typeof cardioTitles;

export type WorkoutBlockActivity = 'walking' | 'stretching';
export type WorkoutBlockType = 'warmup' | 'cooldown';
export const workoutBlockTitles = { warmup: 'Разминка', cooldown: 'Заминка' } as const;

export function blockActivityLabel(
  type: WorkoutBlockType,
  activity: WorkoutBlockActivity = 'walking',
) {
  if (activity === 'walking') return 'Ходьба';
  return type === 'warmup' ? 'Динамическая растяжка' : 'Спокойная растяжка';
}

export const muscleGroups = [
  'Ноги и ягодицы',
  'Грудь и трицепсы',
  'Спина',
  'Задняя поверхность бедра и ягодицы',
  'Плечи',
  'Бицепс',
  'Предплечья',
  'Икры',
  'Мышцы корпуса',
] as const;
export type MuscleGroup = (typeof muscleGroups)[number];

export const levels = {
  beginner: {
    title: 'Новичок',
    description: 'Начинаешь силовые или возвращаешься после перерыва.',
    rest: 60,
  },
  basic: {
    title: 'Базовый',
    description: 'Силовые уже есть, но обычно это одно занятие или меньше часа в неделю.',
    rest: 75,
  },
  experienced: {
    title: 'Средний',
    description: 'Две или больше силовых в неделю, от часа суммарно.',
    rest: 90,
  },
  advanced: {
    title: 'Продвинутый',
    description:
      'Три или больше силовых в неделю, от двух часов суммарно. Занимаешься регулярно несколько месяцев и умеешь менять нагрузку.',
    rest: 105,
  },
} as const;

export type WorkoutLevel = keyof typeof levels;

export interface WorkoutPreferences {
  level: WorkoutLevel;
  minutes: (typeof durations)[number];
  warmup: boolean;
  cooldown: boolean;
  warmupActivity?: WorkoutBlockActivity;
  cooldownActivity?: WorkoutBlockActivity;
  weeklyGoal?: (typeof weeklyGoals)[number];
  routeWeeks?: (typeof routeWeeks)[number];
  program?: ProgramId;
  schedule?: { days: readonly TrainingWeekday[]; start: number; paused?: boolean };
  restSound?: boolean;
  bodyWeightKg?: number;
  equipment?: readonly HomeEquipment[];
  muscleGroups?: readonly MuscleGroup[];
}

export function isBodyWeight(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0;
}

export function cardioActivity(
  equipment: readonly HomeEquipment[] = defaultEquipment,
): CardioActivity {
  return equipment.includes('elliptical') ? 'elliptical' : 'walking';
}

export const defaultPreferences: WorkoutPreferences = {
  level: 'beginner',
  minutes: 20,
  warmup: false,
  cooldown: false,
};

export const optionalBlockMinutes = 5;

export function recommendLevel(days: number, minutes: number, managesLoad: boolean): WorkoutLevel {
  if (days < 1 || minutes <= 0) return 'beginner';
  if (days >= 3 && minutes >= 120 && managesLoad) return 'advanced';
  if (days >= 2 && minutes >= 60) return 'experienced';
  return 'basic';
}

export function mainBudget(preferences: WorkoutPreferences) {
  return (
    preferences.minutes -
    (preferences.warmup ? optionalBlockMinutes : 0) -
    (preferences.cooldown ? optionalBlockMinutes : 0)
  );
}
