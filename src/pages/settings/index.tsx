import { useState, type FormEvent } from 'react';
import {
  defaultWeeklyGoal,
  equipmentLabels,
  defaultEquipment,
  selectableEquipment,
  levels,
  recommendLevel,
  weeklyGoals,
  type HomeEquipment,
  type WorkoutLevel,
  type WorkoutPreferences,
} from '../../entities/program';
import ui from '../../shared/ui/Common.module.css';
import styles from './Settings.module.css';
import formStyles from '../../shared/ui/SettingsForm.module.css';
import { BodyWeightForm } from '../../features/workout/BodyWeightForm';

const levelOptions = Object.keys(levels) as WorkoutLevel[];

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

function normalizeEquipmentText(value: string) {
  return value.toLowerCase().replaceAll('ё', 'е').replaceAll('-', ' ');
}

function EquipmentPicker({
  selected,
  change,
}: {
  selected: readonly HomeEquipment[];
  change: (equipment: HomeEquipment[]) => void;
}) {
  const [query, setQuery] = useState('');
  const terms = normalizeEquipmentText(query).trim().split(/\s+/).filter(Boolean);
  const matches = selectableEquipment.filter((item) => {
    const label = normalizeEquipmentText(equipmentLabels[item]);
    return terms.every((term) => label.includes(term));
  });

  return (
    <fieldset className={styles.homeEquipment}>
      <legend>Инвентарь дома</legend>
      <p className={styles.equipmentHint}>
        Отметь доступный инвентарь. Приложение учтёт его в силовом плане по группам мышц и в фильтре
        «Мой инвентарь» в каталоге.
      </p>
      <div className={formStyles.fields}>
        <label className={formStyles.wide}>
          Поиск инвентаря
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Например, гантели или турник"
          />
        </label>
        <p className={`${formStyles.wide} ${styles.equipmentStatus}`} role="status">
          {matches.length
            ? `Показано позиций: ${matches.length} из ${selectableEquipment.length}`
            : 'Инвентарь не найден.'}
        </p>
        {matches.map((item) => (
          <label key={item} className={formStyles.toggle}>
            <input
              type="checkbox"
              checked={selected.includes(item)}
              onChange={(event) =>
                change(
                  event.target.checked
                    ? [...selected, item]
                    : selected.filter((value) => value !== item),
                )
              }
            />
            {equipmentLabels[item]}
          </label>
        ))}
      </div>
    </fieldset>
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
