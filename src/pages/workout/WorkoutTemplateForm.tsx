import { useState } from 'react';
import { workoutTemplateTitleLimit } from '../../entities/progress';
import { Button, Input } from '../../shared/ui/Controls';
import ui from '../../shared/ui/Common.module.css';
import styles from './Workout.module.css';

export function WorkoutTemplateForm({
  title,
  save,
}: {
  title?: string;
  save: (title: string) => boolean;
}) {
  const [message, setMessage] = useState('');
  return (
    <section className={ui.panel}>
      <h2>Шаблон тренировки</h2>
      <form
        className={styles.templateForm}
        onSubmit={(event) => {
          event.preventDefault();
          const name = String(new FormData(event.currentTarget).get('title') ?? '').trim();
          setMessage(
            !name
              ? 'Введи название шаблона.'
              : save(name)
                ? 'Шаблон сохранён.'
                : 'Не удалось сохранить шаблон.',
          );
        }}
      >
        <label>
          Название
          <Input name="title" defaultValue={title} maxLength={workoutTemplateTitleLimit} required />
        </label>
        <Button type="submit">{title ? 'Обновить шаблон' : 'Сохранить как шаблон'}</Button>
        {message && (
          <p role="status" className={ui.hint}>
            {message}
          </p>
        )}
      </form>
    </section>
  );
}
