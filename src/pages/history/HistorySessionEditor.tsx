import { useState, type FormEvent } from 'react';
import { exercises } from '../../entities/program';
import {
  exerciseNote,
  exerciseNoteLimit,
  updateExerciseNotes,
  type Session,
  type SessionChanges,
} from '../../entities/progress';
import { readSetFields, SetFields } from '../../features/workout/SetFields';
import { Button, Input } from '../../shared/ui/Controls';
import { changeLocalDate, dateInputValue } from '../../shared/lib/calendarDates';
import styles from './History.module.css';

export function HistorySessionEditor({
  session,
  save,
  cancel,
}: {
  session: Session;
  save: (changes: SessionChanges) => string | undefined;
  cancel: () => void;
}) {
  const [error, setError] = useState<string>();
  const exerciseIds = [...new Set(session.sets.map(({ exercise }) => exercise))];

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const date = changeLocalDate(session.date, String(data.get('date') ?? ''));
    if (date === null || date < 0) {
      setError('Проверь дату занятия.');
      return;
    }
    const sets = session.sets.map(({ exercise }, index) => ({
      exercise,
      ...readSetFields(data, index),
    }));
    let notes = session.notes ?? [];
    for (const [index, exercise] of exerciseIds.entries())
      notes = updateExerciseNotes(notes, exercise, String(data.get(`note-${index}`) ?? ''));
    setError(save({ date, sets, notes }));
  }

  return (
    <form className={styles.historyEditor} onSubmit={submit}>
      <label>
        Дата занятия
        <Input
          autoFocus
          type="date"
          name="date"
          required
          defaultValue={dateInputValue(session.date)}
        />
      </label>
      {session.sets.map((set, index) => {
        const exercise = exercises[set.exercise];
        return (
          <fieldset key={index}>
            <legend>
              {exercise?.title ?? set.exercise} · подход {index + 1}
            </legend>
            <div className={styles.historyEditFields}>
              <SetFields
                exercise={exercise}
                showWeight={exercise?.weighted !== false || set.weight !== null}
                index={index}
                values={set}
              />
            </div>
          </fieldset>
        );
      })}
      {exerciseIds.map((exercise, index) => (
        <label key={exercise}>
          Заметка · {exercises[exercise]?.title ?? exercise}
          <textarea
            name={`note-${index}`}
            rows={2}
            maxLength={exerciseNoteLimit}
            defaultValue={exerciseNote(session.notes, exercise)}
          />
        </label>
      ))}
      {error && <p role="alert">{error}</p>}
      <div className={styles.historyActions}>
        <Button variant="primary" type="submit">
          Сохранить изменения
        </Button>
        <Button type="button" onClick={cancel}>
          Отмена
        </Button>
      </div>
    </form>
  );
}
