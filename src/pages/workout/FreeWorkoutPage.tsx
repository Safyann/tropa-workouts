import { useEffect, useRef, useState, type FormEvent } from 'react';
import { exercises } from '../../entities/program';
import {
  formatSet,
  type Session,
  type SetRecord,
  type WorkoutTemplate,
} from '../../entities/progress';
import {
  clearFreeStrengthDraft,
  freeStrengthDraftKey,
  readFreeStrengthDraft,
  saveFreeStrengthDraft,
  type FreeStrengthDraft,
} from '../../features/workout/draft';
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
  const [draftState, setDraftState] = useState(() => ({
    draft: readFreeStrengthDraft(),
    saveFailed: false,
  }));
  const { draft, saveFailed } = draftState;
  const walkingId = useRef<string | undefined>(undefined);
  const sets = draft?.sets ?? [];
  const template = templates?.find(({ id }) => id === templateId);
  const choice = useExerciseChoice(template?.exercises);
  const { selected } = choice;
  const exercise = selected ? exercises[selected] : undefined;

  useEffect(() => {
    function syncDraft(event: StorageEvent) {
      if (event.key !== null && event.key !== freeStrengthDraftKey) return;
      const saved = readFreeStrengthDraft();
      setDraftState((current) =>
        current.saveFailed ? current : { draft: saved, saveFailed: false },
      );
    }
    window.addEventListener('storage', syncDraft);
    return () => window.removeEventListener('storage', syncDraft);
  }, []);

  function updateDraft(changes: Partial<Pick<FreeStrengthDraft, 'sets' | 'minutes'>>) {
    const next = { ...(draft ?? { id: crypto.randomUUID(), sets: [], minutes: '' }), ...changes };
    setDraftState({ draft: next, saveFailed: !saveFreeStrengthDraft(next) });
  }

  function addSet(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected) return;
    const data = new FormData(event.currentTarget);
    const weight = data.get('weight');
    const reps = data.get('reps');
    const set: SetRecord = {
      exercise: selected,
      weight: typeof weight === 'string' && weight !== '' ? Number(weight) : null,
      reps: typeof reps === 'string' && reps !== '' ? Number(reps) : null,
    };
    updateDraft({ sets: [...sets, set] });
    event.currentTarget.reset();
  }

  function saveWorkout(minutes?: number) {
    const walking = mode === 'walking';
    if (walking ? minutes === undefined : !draft?.sets.length) return;
    if (minutes !== undefined && (!Number.isInteger(minutes) || minutes < 1 || minutes > 1440))
      return;
    const durationSeconds = minutes === undefined ? undefined : minutes * 60;
    const freeId = walking ? (walkingId.current ??= crypto.randomUUID()) : draft?.id;
    if (!freeId) return;
    const saved = save({
      freeId,
      date: Date.now(),
      stop: walking ? 1 : 0,
      short: false,
      sets: walking ? [] : sets,
      elapsed: walking ? (durationSeconds ?? null) : null,
      ...(durationSeconds !== undefined && { durationSeconds }),
      ...(walking && { cardioActivity: 'walking' }),
    });
    if (saved && !walking) clearFreeStrengthDraft(freeId);
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
                saveWorkout(minutes);
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
                  <input
                    type="number"
                    inputMode="numeric"
                    name="reps"
                    min="1"
                    max={Number.MAX_SAFE_INTEGER}
                  />
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
                        updateDraft({ sets: sets.filter((_, position) => position !== index) })
                      }
                    >
                      Удалить
                    </button>
                  </li>
                ))}
              </ol>
            )}
            {saveFailed && (
              <p role="alert">
                Черновик не сохранился в браузере. Попробуй сохранить занятие перед выходом.
              </p>
            )}
            <form
              className={styles.freeFields}
              onSubmit={(event) => {
                event.preventDefault();
                saveWorkout(draft?.minutes ? Number(draft.minutes) : undefined);
              }}
            >
              <label>
                Длительность, мин (необязательно)
                <input
                  type="number"
                  inputMode="numeric"
                  name="minutes"
                  min="1"
                  max="1440"
                  value={draft?.minutes ?? ''}
                  onChange={(event) => updateDraft({ minutes: event.target.value })}
                />
              </label>
              <button className={styles.stepAction} type="submit" disabled={!sets.length}>
                Сохранить тренировку
              </button>
            </form>
          </>
        )}
      </div>
    </section>
  );
}
