import { durations, optionalBlockMinutes, type WorkoutPreferences } from '../../entities/program';
import ui from '../../shared/ui/Common.module.css';
import styles from './Route.module.css';
import formStyles from '../../shared/ui/SettingsForm.module.css';

export function WorkoutSettings({
  preferences,
  change,
}: {
  preferences: WorkoutPreferences;
  change: (preferences: WorkoutPreferences) => void;
}) {
  return (
    <details className={styles.dayPreview}>
      <summary>Настройки занятия</summary>
      <div className={formStyles.fields}>
        <label className={formStyles.wide}>
          Длительность
          <select
            value={preferences.minutes}
            onChange={(event) => {
              const minutes = durations.find((value) => String(value) === event.target.value);
              if (minutes) change({ ...preferences, minutes });
            }}
          >
            {durations.map((minutes) => (
              <option key={minutes} value={minutes}>
                {minutes} минут
              </option>
            ))}
          </select>
        </label>
        <label className={formStyles.toggle}>
          <input
            type="checkbox"
            checked={preferences.warmup}
            onChange={(event) => change({ ...preferences, warmup: event.target.checked })}
          />{' '}
          Разминка · {optionalBlockMinutes} мин
        </label>
        <label className={formStyles.toggle}>
          <input
            type="checkbox"
            checked={preferences.cooldown}
            onChange={(event) => change({ ...preferences, cooldown: event.target.checked })}
          />{' '}
          Заминка · {optionalBlockMinutes} мин
        </label>
      </div>
      <p className={ui.hint}>
        Разминка и заминка входят в выбранное время. Для силовой это ориентир.
      </p>
    </details>
  );
}
