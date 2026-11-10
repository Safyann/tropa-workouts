import { durations, optionalBlockMinutes, type WorkoutPreferences } from '../../entities/program';

export function WorkoutSettings({ preferences, change }: {
  preferences: WorkoutPreferences;
  change: (preferences: WorkoutPreferences) => void;
}) {
  return <details className="day-preview settings">
    <summary>Настройки занятия</summary>
    <div className="settings-fields">
      <label className="settings-wide">Длительность
        <select value={preferences.minutes} onChange={event => {
          const minutes = durations.find(value => String(value) === event.target.value);
          if (minutes) change({ ...preferences, minutes });
        }}>
          {durations.map(minutes => <option key={minutes} value={minutes}>{minutes} минут</option>)}
        </select>
      </label>
      <label className="settings-toggle"><input type="checkbox" checked={preferences.warmup}
        onChange={event => change({ ...preferences, warmup: event.target.checked })}/> Разминка · {optionalBlockMinutes} мин</label>
      <label className="settings-toggle"><input type="checkbox" checked={preferences.cooldown}
        onChange={event => change({ ...preferences, cooldown: event.target.checked })}/> Заминка · {optionalBlockMinutes} мин</label>
    </div>
    <p className="hint">Разминка и заминка входят в выбранное время. Для силовой это ориентир.</p>
  </details>;
}
