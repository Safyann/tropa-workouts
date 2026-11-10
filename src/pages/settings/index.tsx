import { useState, type FormEvent } from 'react';
import { defaultWeeklyGoal, levels, recommendLevel, weeklyGoals, type WorkoutLevel, type WorkoutPreferences } from '../../entities/program';

const levelOptions = Object.keys(levels) as WorkoutLevel[];

export function SettingsPage({ preferences, change }: {
  preferences: WorkoutPreferences;
  change: (preferences: WorkoutPreferences) => void;
}) {
  return <section className="narrow">
    <a className="back" href="#map">← К карте</a>
    <h1 tabIndex={-1}>Настройки профиля<span>.</span></h1>
    <p className="subtitle">Уровень и недельная цель сохраняются в этом браузере и действуют для следующих занятий.</p>
    <div className="workout-card profile-settings">
      <div className="settings-fields">
        <label>Уровень
          <select value={preferences.level} onChange={event => {
            const level = levelOptions.find(value => value === event.target.value);
            if (level) change({ ...preferences, level });
          }}>
            {levelOptions.map(level => <option key={level} value={level}>{levels[level].title}</option>)}
          </select>
        </label>
        <label>Занятий в неделю
          <select value={preferences.weeklyGoal ?? defaultWeeklyGoal} onChange={event => {
            const weeklyGoal = weeklyGoals.find(value => String(value) === event.target.value);
            if (weeklyGoal) change({ ...preferences, weeklyGoal });
          }}>
            {weeklyGoals.map(goal => <option key={goal} value={goal}>{goal}</option>)}
          </select>
        </label>
      </div>
      <LevelGuide apply={level => change({ ...preferences, level })}/>
    </div>
  </section>;
}

function LevelGuide({ apply }: { apply: (level: WorkoutLevel) => void }) {
  const [suggestion, setSuggestion] = useState<WorkoutLevel | null>(null);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const level = recommendLevel(Number(data.get('days')), Number(data.get('minutes')), data.has('regular'));
    setSuggestion(level);
    apply(level);
  }

  return <details className="level-guide">
    <summary>Как выбрать уровень</summary>
    <dl>{levelOptions.map(level => <div key={level}>
      <dt>{levels[level].title}</dt><dd>{levels[level].description}</dd>
    </div>)}</dl>
    <p className="hint">Оцени обычную неделю за последний месяц. Ходьбу и кардио сюда не включай. Это подсказка для настройки плана.</p>
    <form className="settings-fields" onSubmit={submit}>
      <label>Силовых занятий в неделю<input name="days" type="number" inputMode="numeric" min="0" max="7" required/></label>
      <label>Минут силовых в неделю<input name="minutes" type="number" inputMode="numeric" min="0" max="10080" required/></label>
      <label className="settings-toggle"><input type="checkbox" name="regular"/> Регулярно занимаюсь несколько месяцев и умею менять нагрузку</label>
      <button className="secondary" type="submit">Подобрать уровень</button>
    </form>
    {suggestion && <p role="status" className="hint">Подсказка — «{levels[suggestion].title}». Уровень можно поменять вручную.</p>}
  </details>;
}
