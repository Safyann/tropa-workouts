export const durations = [20, 40, 60] as const;
export const weeklyGoals = [1, 2, 3, 4, 5, 6, 7] as const;
export const defaultWeeklyGoal = 2;
export const homeEquipment = ['dumbbells', 'bench', 'elliptical'] as const;
export type HomeEquipment = typeof homeEquipment[number];
export const equipmentLabels: Record<HomeEquipment, string> = {
  dumbbells: 'Гантели', bench: 'Скамья', elliptical: 'Эллипс'
};
export const cardioTitles = { elliptical: 'Эллипс', walking: 'Ходьба' } as const;
export type CardioActivity = keyof typeof cardioTitles;

export const levels = {
  beginner: { title: 'Новичок', description: 'Силовых пока нет или ты возвращаешься после паузы.', rest: 60 },
  basic: { title: 'Базовый', description: 'Примерно одна силовая в неделю или занятия пока нерегулярны.', rest: 75 },
  experienced: { title: 'Средний', description: 'Обычно две или больше силовых и около часа суммарно за неделю.', rest: 90 },
  advanced: { title: 'Продвинутый', description: 'Обычно три или больше силовых, около двух часов суммарно и опыт самостоятельной прогрессии.', rest: 105 }
} as const;

export type WorkoutLevel = keyof typeof levels;

export interface WorkoutPreferences {
  level: WorkoutLevel;
  minutes: typeof durations[number];
  warmup: boolean;
  cooldown: boolean;
  weeklyGoal?: typeof weeklyGoals[number];
  equipment?: readonly HomeEquipment[];
}

export function cardioActivity(equipment: readonly HomeEquipment[] = homeEquipment): CardioActivity {
  return equipment.includes('elliptical') ? 'elliptical' : 'walking';
}

export const defaultPreferences: WorkoutPreferences = {
  level: 'beginner',
  minutes: 20,
  warmup: false,
  cooldown: false
};

export const optionalBlockMinutes = 5;

export function recommendLevel(days: number, minutes: number, managesLoad: boolean): WorkoutLevel {
  if (days < 1 || minutes <= 0) return 'beginner';
  if (days >= 3 && minutes >= 120 && managesLoad) return 'advanced';
  if (days >= 2 && minutes >= 60) return 'experienced';
  return 'basic';
}

export function mainBudget(preferences: WorkoutPreferences) {
  return preferences.minutes
    - (preferences.warmup ? optionalBlockMinutes : 0)
    - (preferences.cooldown ? optionalBlockMinutes : 0);
}
