import {
  defaultWeeklyGoal,
  defaultRouteWeeks,
  defaultEquipment,
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
import ui from '../../shared/ui/Common.module.css';
import styles from './Settings.module.css';
import formStyles from '../../shared/ui/SettingsForm.module.css';

export function SettingsPage({
  preferences,
  change,
  progress,
  restore,
}: {
  preferences: WorkoutPreferences;
  change: (preferences: WorkoutPreferences) => void;
  progress: Progress;
  restore: (contents: string) => string;
}) {
  return (
    <section className={ui.narrow}>
      <a className={ui.back} href="#map">
        ← К карте
      </a>
      <h1 tabIndex={-1}>
        Настройки профиля<span>.</span>
      </h1>
      <p className={ui.subtitle}>
        Число занятий в неделю и длительность в неделях задают длину маршрута.
      </p>
      <div className={`${ui.panel} ${styles.profileSettings}`}>
        <div className={formStyles.fields}>
          <label>
            Уровень
            <select
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
            </select>
          </label>
          <label>
            Недель в маршруте
            <select
              value={preferences.routeWeeks ?? defaultRouteWeeks}
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
            </select>
          </label>
          <label>
            Занятий в неделю
            <select
              value={preferences.weeklyGoal ?? defaultWeeklyGoal}
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
            </select>
          </label>
        </div>
        <label className={styles.soundSetting}>
          <input
            type="checkbox"
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
