import { useRef, useState, type FormEvent } from 'react';
import { exercises } from '../../entities/program';
import {
  formatSet,
  type Session,
  type SetRecord,
  type WorkoutTemplate,
} from '../../entities/progress';
import { ExercisePicker, useExerciseChoice } from './ExercisePicker';
import ui from '../../shared/ui/Common.module.css';
import styles from './Workout.module.css';

export function FreeWorkoutPage({
  save,
  templates,
  removeTemplate,
}: {
  save: (session: Omit<Session, 'round'>) => boolean;
  templates?: readonly WorkoutTemplate[];
  removeTemplate: (id: string) => boolean;
}) {
  const [mode, setMode] = useState<'strength' | 'walking'>('strength');
  const [templateId, setTemplateId] = useState('');
  const [sets, setSets] = useState<SetRecord[]>([]);
  const freeId = useRef<string | undefined>(undefined);
  const template = templates?.find(({ id }) => id === templateId);
  const choice = useExerciseChoice(template?.exercises);
  const { selected } = choice;
  const exercise = selected ? exercises[selected] : undefined;

  function addSet(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected) return;
    const data = new FormData(event.currentTarget);
    const weight = data.get('weight');
    const reps = data.get('reps');
    setSets((current) => [
      ...current,
      {
        exercise: selected,
        weight: typeof weight === 'string' && weight !== '' ? Number(weight) : null,
        reps: typeof reps === 'string' && reps !== '' ? Number(reps) : null,
      },
    ]);
    event.currentTarget.reset();
  }

  function saveWorkout(durationSeconds?: number) {
    freeId.current ??= crypto.randomUUID();
    save({
      freeId: freeId.current,
      date: Date.now(),
      stop: mode === 'walking' ? 1 : 0,
      short: false,
      sets: mode === 'walking' ? [] : sets,
      elapsed: durationSeconds ?? null,
      ...(durationSeconds !== undefined && { durationSeconds, cardioActivity: 'walking' }),
    });
  }

  return (
    <section className={ui.narrow}>
      <a className={ui.back} href="#map">
        ← К карте
      </a>
      <h1 tabIndex={-1}>
        Свободное занятие<span>.</span>
      </h1>
      <p className={ui.subtitle}>Запиши тренировку или прогулку в историю.</p>
      <div className={styles.step}>
        <div className={styles.freeFields}>
          <label>
            Вид занятия
            <select
              value={mode}
              onChange={(event) =>
                setMode(event.target.value === 'walking' ? 'walking' : 'strength')
              }
            >
              <option value="strength">Силовая</option>
              <option value="walking">Прогулка</option>
            </select>
          </label>
        </div>
        {mode === 'walking' ? (
          <form
            className={styles.freeFields}
            onSubmit={(event) => {
              event.preventDefault();
              const minutes = Number(new FormData(event.currentTarget).get('minutes'));
              if (Number.isInteger(minutes) && minutes >= 1 && minutes <= 1440)
                saveWorkout(minutes * 60);
            }}
          >
            <label>
              Длительность, мин
              <input type="number" inputMode="numeric" name="minutes" min="1" max="1440" required />
            </label>
            <button className={ui.primary} type="submit">
              Сохранить прогулку
            </button>
          </form>
        ) : (
          <>
            {!!templates?.length && (
              <div className={styles.freeFields}>
                <label>
                  Шаблон тренировки
                  <select
                    value={template?.id ?? ''}
                    onChange={(event) => {
                      setTemplateId(event.target.value);
                      choice.setQuery('');
                      choice.select(undefined);
                    }}
                  >
                    <option value="">Выбрать упражнения вручную</option>
                    {templates.map(({ id, title }) => (
                      <option key={id} value={id}>
                        {title}
                      </option>
                    ))}
                  </select>
                </label>
                {template && (
                  <button
                    className={ui.secondary}
                    type="button"
                    onClick={() => {
                      if (
                        window.confirm(`Удалить шаблон «${template.title}»?`) &&
                        removeTemplate(template.id)
                      )
                        setTemplateId('');
                    }}
                  >
                    Удалить шаблон
                  </button>
                )}
              </div>
            )}
            <form className={styles.freeFields} onSubmit={addSet}>
              <ExercisePicker choice={choice} />
              <div className={styles.fields} key={selected}>
                {exercise?.weighted && (
                  <label>
                    {exercise.needs?.includes('dumbbells') ? 'Вес одной гантели, кг' : 'Вес, кг'}
                    <input type="number" inputMode="decimal" name="weight" min="0" step="any" />
                  </label>
                )}
                <label>
                  Повторы{exercise?.perSide ? ' на сторону' : ''}
                  <input type="number" inputMode="numeric" name="reps" min="1" />
                </label>
              </div>
              <button className={ui.secondary} type="submit" disabled={!selected}>
                Добавить подход
              </button>
            </form>
            {sets.length > 0 && (
              <ol className={styles.freeSets}>
                {sets.map((set, index) => (
                  <li key={index}>
                    <span>
                      {exercises[set.exercise].title} · {formatSet(set)}
                    </span>
                    <button
                      className={ui.secondary}
                      type="button"
                      aria-label={`Удалить подход ${index + 1}`}
                      onClick={() =>
                        setSets((current) => current.filter((_, position) => position !== index))
                      }
                    >
                      Удалить
                    </button>
                  </li>
                ))}
              </ol>
            )}
            <button
              className={styles.stepAction}
              type="button"
              disabled={!sets.length}
              onClick={() => saveWorkout()}
            >
              Сохранить тренировку
            </button>
          </>
        )}
      </div>
    </section>
  );
}
