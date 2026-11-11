import {
  defaultWeeklyGoal,
  defaultEquipment,
  levels,
  weeklyGoals,
  type WorkoutPreferences,
} from '../../entities/program';
import { BodyWeightForm } from '../../features/workout/BodyWeightForm';
import { EquipmentPicker } from './EquipmentPicker';
import { LevelGuide } from './LevelGuide';
import { levelOptions } from './levelOptions';
import ui from '../../shared/ui/Common.module.css';
import styles from './Settings.module.css';
import formStyles from '../../shared/ui/SettingsForm.module.css';

export function SettingsPage({
  preferences,
  change,
}: {
  preferences: WorkoutPreferences;
  change: (preferences: WorkoutPreferences) => void;
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
        Уровень и недельная цель сохраняются в этом браузере и действуют для следующих занятий.
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
            Занятий в неделю
            <select
              value={preferences.weeklyGoal ?? defaultWeeklyGoal}
              onChange={(event) => {
                const weeklyGoal = weeklyGoals.find(
                  (value) => String(value) === event.target.value,
                );
                if (weeklyGoal) change({ ...preferences, weeklyGoal });
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
        <BodyWeightForm
          key={preferences.bodyWeightKg}
          value={preferences.bodyWeightKg}
          save={(bodyWeightKg) => change({ ...preferences, bodyWeightKg })}
        />
        <LevelGuide apply={(level) => change({ ...preferences, level })} />
      </div>
      <EquipmentPicker
        selected={preferences.equipment ?? defaultEquipment}
        change={(equipment) => change({ ...preferences, equipment })}
      />
    </section>
  );
}
