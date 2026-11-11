import {
  blockActivityLabel,
  durations,
  optionalBlockMinutes,
  workoutBlockTitles,
  type WorkoutPreferences,
} from '../../entities/program';
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
        {(['warmup', 'cooldown'] as const).map((type) => {
          const activityKey = `${type}Activity` as const;
          return (
            <label className={formStyles.wide} key={type}>
              {workoutBlockTitles[type]}
              <select
                value={preferences[type] ? (preferences[activityKey] ?? 'walking') : 'off'}
                onChange={(event) => {
                  const value = event.target.value;
                  change({
                    ...preferences,
                    [type]: value !== 'off',
                    [activityKey]: value === 'stretching' ? 'stretching' : 'walking',
                  });
                }}
              >
                <option value="off">Без {type === 'warmup' ? 'разминки' : 'заминки'}</option>
                <option value="walking">Ходьба · {optionalBlockMinutes} мин</option>
                <option value="stretching">
                  {blockActivityLabel(type, 'stretching')} · {optionalBlockMinutes} мин
                </option>
              </select>
            </label>
          );
        })}
      </div>
      <p className={ui.hint}>
        Разминка и заминка входят в выбранное время. План по группам учитывает подходы и отдых.
      </p>
    </details>
  );
}
