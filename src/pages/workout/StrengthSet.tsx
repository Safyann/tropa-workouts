import { useRef, type FormEvent, type Ref } from 'react';
import { ExerciseInstructions, exercises } from '../../entities/program';
import {
  effortLabels,
  formatSet,
  formatWeight,
  previousExerciseResult,
  type Session,
} from '../../entities/progress';
import {
  isLastSet,
  prepareRestSound,
  recordSet,
  type StrengthWorkout,
  type Workout,
} from '../../features/workout';
import { Icon } from '../../shared/ui/Icon';
import { Demonstration } from './Demonstration';
import ui from '../../shared/ui/Common.module.css';
import styles from './Workout.module.css';

export function StrengthSet({
  workout,
  history,
  update,
  finish,
  itemIndex,
  headingRef,
  endLabel,
  restSound,
  targetReps = 8,
}: {
  workout: StrengthWorkout;
  history: Session[];
  update: (workout: Workout) => void;
  finish: (workout: Workout) => void;
  itemIndex: number;
  headingRef: Ref<HTMLHeadingElement>;
  endLabel: string;
  restSound?: boolean;
  targetReps?: number;
}) {
  const weightInput = useRef<HTMLInputElement>(null);
  const repsInput = useRef<HTMLInputElement>(null);
  const item = workout.plan[itemIndex];
  const id = item.exercise;
  const exercise = exercises[id];
  const canAddWeight = exercise.weighted;
  const weightLabel = exercise.needs?.includes('dumbbells') ? 'Вес одной гантели, кг' : 'Вес, кг';
  const finalSet = isLastSet(workout);
  const previous = previousExerciseResult(history, id);
  const previousSets = previous?.sets ?? [];
  const previousWeight = [...previousSets].reverse().find((set) => set.weight !== null)?.weight;
  const currentSets = workout.sets.filter((set) => set.exercise === id).reverse();
  const repeat = currentSets.find(
    ({ weight, reps }) => (canAddWeight && weight !== null) || reps !== null,
  );
  const prior =
    currentSets.find((set) => set.weight !== null) ??
    [...history]
      .reverse()
      .flatMap((entry) => [...entry.sets].reverse())
      .find((set) => set.exercise === id && set.weight !== null);

  function applyPreviousWeight(weight: number) {
    const input = weightInput.current;
    if (!input) return;
    input.value = String(weight);
    input.focus();
  }

  function repeatSet() {
    if (!repeat) return;
    if (weightInput.current) weightInput.current.value = repeat.weight?.toString() ?? '';
    if (repsInput.current) repsInput.current.value = repeat.reps?.toString() ?? '';
    (weightInput.current ?? repsInput.current)?.focus();
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (restSound && !finalSet) prepareRestSound();
    const data = new FormData(event.currentTarget);
    const number = (name: string) => (data.get(name) === '' ? null : Number(data.get(name)));
    const updated = recordSet(workout, {
      weight: canAddWeight ? number('weight') : null,
      reps: number('reps'),
    });
    if (finalSet) finish(updated);
    else update(updated);
  }

  return (
    <>
      <div className={styles.step}>
        <p className={ui.eyebrow}>
          ПОДХОД {item.completed + 1} ИЗ {item.target}
        </p>
        <h2 tabIndex={-1} ref={headingRef}>
          {exercise.title}
        </h2>
        <Demonstration exercise={exercise} />
        <ExerciseInstructions source={exercise.cues} className={styles.cues} />
        {exercise.video && (
          <a className={styles.reference} href={exercise.video} target="_blank" rel="noreferrer">
            Видео техники на YouTube ↗
          </a>
        )}
        {exercise.reference && (
          <a
            className={styles.reference}
            href={exercise.reference}
            target="_blank"
            rel="noreferrer"
          >
            Техника подробно ↗
          </a>
        )}
        <form onSubmit={submit}>
          {previousSets.length > 0 && (
            <div className={styles.previousResult}>
              <div>
                <strong>В прошлый раз</strong>
                <p>{previousSets.map(formatSet).join(' / ')}</p>
                {previous?.effort && <p>Тренировка далась · {effortLabels[previous.effort]}</p>}
                {exercise.perSide && previousSets.some(({ reps }) => reps !== null) && (
                  <p>Повторы на сторону</p>
                )}
              </div>
              {canAddWeight && previousWeight != null && (
                <button
                  className={ui.secondary}
                  type="button"
                  onClick={() => applyPreviousWeight(previousWeight)}
                >
                  Подставить {formatWeight(previousWeight)}
                </button>
              )}
            </div>
          )}
          <div className={styles.fields}>
            {canAddWeight && (
              <label>
                {weightLabel}
                <input
                  ref={weightInput}
                  name="weight"
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="any"
                  placeholder={String(prior?.weight ?? 0)}
                />
              </label>
            )}
            <label>
              Повторы{exercise.perSide ? ' на сторону' : ''}
              <input
                ref={repsInput}
                name="reps"
                type="number"
                inputMode="numeric"
                min="1"
                step="1"
                placeholder={String(targetReps)}
              />
            </label>
          </div>
          {repeat && (
            <button
              className={`${ui.secondary} ${styles.repeatSet}`}
              type="button"
              onClick={repeatSet}
            >
              Повторить подход · {formatSet(repeat)}
            </button>
          )}
          <p className={ui.hint}>
            Ориентир — {targetReps} повторов. Можно записать фактический результат или оставить поля
            пустыми.
          </p>
          <button className={styles.stepAction} type="submit">
            {finalSet ? endLabel : 'Записать подход'} <Icon name="check" />
          </button>
        </form>
      </div>
    </>
  );
}
