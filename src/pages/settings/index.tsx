import { useState, type FormEvent } from 'react';
import {
  defaultWeeklyGoal,
  equipmentLabels,
  homeEquipment,
  levels,
  recommendLevel,
  weeklyGoals,
  type WorkoutLevel,
  type WorkoutPreferences,
} from '../../entities/program';
import ui from '../../shared/ui/Common.module.css';
import styles from './Settings.module.css';
import formStyles from '../../shared/ui/SettingsForm.module.css';

const levelOptions = Object.keys(levels) as WorkoutLevel[];

export function SettingsPage({
  preferences,
  change,
}: {
  preferences: WorkoutPreferences;
  change: (preferences: WorkoutPreferences) => void;
}) {
  const equipment = preferences.equipment ?? homeEquipment;
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
        <LevelGuide apply={(level) => change({ ...preferences, level })} />
      </div>
      <fieldset className={styles.homeEquipment}>
        <legend>Инвентарь дома</legend>
        <p className={styles.equipmentHint}>
          Отметь, чем можешь пользоваться. Если убрать всё, план подберёт упражнения с весом тела и
          ходьбу.
        </p>
        <div className={formStyles.fields}>
          {homeEquipment.map((item) => (
            <label key={item} className={formStyles.toggle}>
              <input
                type="checkbox"
                checked={equipment.includes(item)}
                onChange={(event) =>
                  change({
                    ...preferences,
                    equipment: event.target.checked
                      ? [...equipment, item]
                      : equipment.filter((selected) => selected !== item),
                  })
                }
              />
              {equipmentLabels[item]}
            </label>
          ))}
        </div>
      </fieldset>
    </section>
  );
}

function LevelGuide({ apply }: { apply: (level: WorkoutLevel) => void }) {
  const [suggestion, setSuggestion] = useState<WorkoutLevel | null>(null);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const level = recommendLevel(
      Number(data.get('days')),
      Number(data.get('minutes')),
      data.has('regular'),
    );
    setSuggestion(level);
    apply(level);
  }

  return (
    <details className={styles.levelGuide}>
      <summary>Как выбрать уровень</summary>
      <dl>
        {levelOptions.map((level) => (
          <div key={level}>
            <dt>{levels[level].title}</dt>
            <dd>{levels[level].description}</dd>
          </div>
        ))}
      </dl>
      <p className={ui.hint}>
        Оцени обычную неделю за последний месяц. Ходьбу и кардио сюда не включай. Это подсказка для
        настройки плана.
      </p>
      <form className={formStyles.fields} onSubmit={submit}>
        <label>
          Силовых занятий в неделю
          <input name="days" type="number" inputMode="numeric" min="0" max="7" required />
        </label>
        <label>
          Минут силовых в неделю
          <input name="minutes" type="number" inputMode="numeric" min="0" max="10080" required />
        </label>
        <label className={formStyles.toggle}>
          <input type="checkbox" name="regular" /> Регулярно занимаюсь несколько месяцев и умею
          менять нагрузку
        </label>
        <button className={styles.guideSubmit} type="submit">
          Подобрать уровень
        </button>
      </form>
      {suggestion && (
        <p role="status" className={ui.hint}>
          Подсказка — «{levels[suggestion].title}». Уровень можно поменять вручную.
        </p>
      )}
    </details>
  );
}
