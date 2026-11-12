import { useRef, useState, type FormEvent } from 'react';
import { levels, recommendLevel, type WorkoutLevel } from '../../entities/program';
import { Button, Checkbox, Input } from '../../shared/ui/Controls';
import ui from '../../shared/ui/Common.module.css';
import styles from './Settings.module.css';
import formStyles from '../../shared/ui/SettingsForm.module.css';

export function LevelGuide({
  selected,
  apply,
}: {
  selected: WorkoutLevel;
  apply: (level: WorkoutLevel) => void;
}) {
  const [suggestion, setSuggestion] = useState<WorkoutLevel | null>(null);
  const result = useRef<HTMLParagraphElement>(null);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const level = recommendLevel(
      Number(data.get('days')),
      Number(data.get('minutes')),
      data.has('regular'),
    );
    setSuggestion(level);
  }

  return (
    <details className={styles.levelGuide}>
      <summary>Помочь выбрать уровень</summary>
      <p className={ui.hint}>
        Вспомни обычную неделю за последний месяц. Если силовых не было, укажи 0 в обоих полях.
      </p>
      <form className={formStyles.fields} onSubmit={submit}>
        <label>
          Силовых занятий в неделю
          <Input name="days" type="number" inputMode="numeric" min="0" max="7" required />
        </label>
        <label>
          Всего минут силовых в неделю
          <Input name="minutes" type="number" inputMode="numeric" min="0" max="10080" required />
        </label>
        <label className={formStyles.toggle}>
          <Checkbox name="regular" /> Регулярно занимаюсь несколько месяцев и умею менять нагрузку
        </label>
        <Button className={styles.guideSubmit} type="submit">
          Подобрать уровень
        </Button>
      </form>
      <div className={styles.levelRecommendation}>
        <p role="status" tabIndex={-1} ref={result}>
          {suggestion && (
            <>
              Рекомендация — «{levels[suggestion].title}».
              {selected === suggestion && ' Этот уровень выбран.'}
            </>
          )}
        </p>
        {suggestion && selected !== suggestion && (
          <Button
            variant="primary"
            onClick={() => {
              apply(suggestion);
              result.current?.focus();
            }}
          >
            Выбрать «{levels[suggestion].title}»
          </Button>
        )}
      </div>
    </details>
  );
}
