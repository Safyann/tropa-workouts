import { useState, type FormEvent } from 'react';
import { levels, recommendLevel, type WorkoutLevel } from '../../entities/program';
import { levelOptions } from './levelOptions';
import ui from '../../shared/ui/Common.module.css';
import styles from './Settings.module.css';
import formStyles from '../../shared/ui/SettingsForm.module.css';

export function LevelGuide({ apply }: { apply: (level: WorkoutLevel) => void }) {
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
