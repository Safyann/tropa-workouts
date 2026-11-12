import {
  defaultWeeklyGoal,
  defaultRouteWeeks,
  defaultEquipment,
  dumbbellWeeklyGoal,
  levels,
  routeWeeks,
  weeklyGoals,
  type WorkoutPreferences,
} from '../../entities/program';
import { BodyWeightForm } from '../../features/workout/BodyWeightForm';
import type { Progress } from '../../entities/progress';
import { BackupSettings } from './BackupSettings';
import { EquipmentPicker } from './EquipmentPicker';
import { LevelGuide } from './LevelGuide';
import { levelOptions } from './levelOptions';
import { ScheduleSettings } from './ScheduleSettings';
import { themeOptions, type ThemePreference } from '../../shared/lib/theme';
import { BackLink } from '../../shared/ui/NavigationLinks';
import { PageTitle } from '../../shared/ui/PageTitle';
import { Checkbox, Select } from '../../shared/ui/Controls';
import ui from '../../shared/ui/Common.module.css';
import styles from './Settings.module.css';
import formStyles from '../../shared/ui/SettingsForm.module.css';

const themeLabels: Record<ThemePreference, string> = {
  system: 'Системная',
  light: 'Светлая',
  dark: 'Тёмная',
};

export function SettingsPage({
  theme,
  changeTheme,
  preferences,
  change,
  progress,
  restore,
}: {
  theme: ThemePreference;
  changeTheme: (theme: ThemePreference) => void;
  preferences: WorkoutPreferences;
  change: (preferences: WorkoutPreferences) => void;
  progress: Progress;
  restore: (contents: string) => string;
}) {
  return (
    <section className={ui.narrow}>
      <BackLink href="#map">К карте</BackLink>
      <PageTitle>Настройки профиля</PageTitle>
      <p className={ui.subtitle}>
        {preferences.program
          ? 'В программе с гантелями две тренировки в неделю на протяжении четырёх недель.'
          : 'Число занятий в неделю и длительность в неделях задают длину маршрута.'}
      </p>
      <div className={`${ui.panel} ${styles.profileSettings}`}>
        <div className={formStyles.fields}>
          <label>
            Тема оформления
            <Select
              value={theme}
              onChange={(event) => {
                const selected = themeOptions.find((option) => option === event.target.value);
                if (selected) changeTheme(selected);
              }}
            >
              {themeOptions.map((option) => (
                <option key={option} value={option}>
                  {themeLabels[option]}
                </option>
              ))}
            </Select>
          </label>
          <label>
            Уровень
            <Select
              value={preferences.level}
              onChange={(event) => {
                const level = levelOptions.find((value) => value === event.target.value);
                if (level) change({ ...preferences, level });
              }}
            >
              {levelOptions.map((level) => (
                <option key={level} value={level}>
                  {levels[level].title}
                </option>
              ))}
            </Select>
          </label>
          <label>
            Недель в маршруте
            <Select
              value={preferences.program ? 4 : (preferences.routeWeeks ?? defaultRouteWeeks)}
              disabled={Boolean(preferences.program)}
              onChange={(event) => {
                const weeks = routeWeeks.find((value) => String(value) === event.target.value);
                if (weeks) change({ ...preferences, routeWeeks: weeks });
              }}
            >
              {routeWeeks.map((weeks) => (
                <option key={weeks} value={weeks}>
                  {weeks}
                </option>
              ))}
            </Select>
          </label>
          <label>
            Занятий в неделю
            <Select
              value={
                preferences.program
                  ? dumbbellWeeklyGoal
                  : (preferences.weeklyGoal ?? defaultWeeklyGoal)
              }
              disabled={Boolean(preferences.program)}
              onChange={(event) => {
                const weeklyGoal = weeklyGoals.find(
                  (value) => String(value) === event.target.value,
                );
                if (weeklyGoal) change({ ...preferences, weeklyGoal, schedule: undefined });
              }}
            >
              {weeklyGoals.map((goal) => (
                <option key={goal} value={goal}>
                  {goal}
                </option>
              ))}
            </Select>
          </label>
        </div>
        <label className={styles.soundSetting}>
          <Checkbox
            checked={preferences.restSound ?? false}
            onChange={(event) => change({ ...preferences, restSound: event.target.checked })}
          />
          Звук окончания отдыха между подходами
        </label>
        <BodyWeightForm
          key={preferences.bodyWeightKg}
          value={preferences.bodyWeightKg}
          save={(bodyWeightKg) => change({ ...preferences, bodyWeightKg })}
        />
        <LevelGuide apply={(level) => change({ ...preferences, level })} />
      </div>
      <ScheduleSettings
        key={`${preferences.weeklyGoal}-${preferences.schedule?.days.join(',')}`}
        preferences={preferences}
        change={change}
      />
      <EquipmentPicker
        selected={preferences.equipment ?? defaultEquipment}
        change={(equipment) => change({ ...preferences, equipment })}
      />
      <BackupSettings progress={progress} restore={restore} />
    </section>
  );
}
