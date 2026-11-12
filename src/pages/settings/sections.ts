export const settingsSectionTitles = {
  level: 'Уровень нагрузки',
  workout: 'Параметры занятия',
  schedule: 'Маршрут и расписание',
  equipment: 'Инвентарь',
  profile: 'Профиль',
  data: 'Данные',
} as const;

export type SettingsSection = keyof typeof settingsSectionTitles;

export function isSettingsSection(value: string): value is SettingsSection {
  return Object.hasOwn(settingsSectionTitles, value);
}
