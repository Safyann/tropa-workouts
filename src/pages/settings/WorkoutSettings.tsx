import {
  blockActivityLabel,
  durations,
  levels,
  optionalBlockMinutes,
  workoutBlockTitles,
  type WorkoutPreferences,
} from '../../entities/program';
import { Checkbox, Select } from '../../shared/ui/Controls';
import ui from '../../shared/ui/Common.module.css';
import styles from './Settings.module.css';
import { LevelGuide } from './LevelGuide';
import { levelOptions } from './levelOptions';
import formStyles from '../../shared/ui/SettingsForm.module.css';

export function WorkoutSettings({
  preferences,
  change,
}: {
  preferences: WorkoutPreferences;
  change: (preferences: WorkoutPreferences) => void;
}) {
  return (
    <section className={`${ui.panel} ${styles.workoutSettings}`}>
      <div className={formStyles.fields}>
        <label className={formStyles.wide}>
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
        <label className={formStyles.wide}>
          Длительность
          <Select
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
          </Select>
        </label>
        {(['warmup', 'cooldown'] as const).map((type) => {
          const activityKey = `${type}Activity` as const;
          return (
            <label className={formStyles.wide} key={type}>
              {workoutBlockTitles[type]}
              <Select
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
              </Select>
            </label>
          );
        })}
      </div>
      <p className={ui.hint}>
        Разминка и заминка входят в выбранное время. План по группам учитывает подходы и отдых.
      </p>
      <label className={styles.soundSetting}>
        <Checkbox
          checked={preferences.restSound ?? false}
          onChange={(event) => change({ ...preferences, restSound: event.target.checked })}
        />
        Звук окончания отдыха между подходами
      </label>
      <LevelGuide apply={(level) => change({ ...preferences, level })} />
    </section>
  );
}
