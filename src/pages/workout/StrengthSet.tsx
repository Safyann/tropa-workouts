import { useId, useRef, type FormEvent, type Ref, type RefObject } from 'react';
import { ExerciseInstructions, exercises } from '../../entities/program';
import {
  effortLabels,
  exerciseNote,
  exerciseNoteLimit,
  formatSet,
  formatWeight,
  previousExerciseResult,
  previousExerciseNote,
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

function SetField({
  label,
  name,
  minimum,
  placeholder,
  inputRef,
  increment,
}: {
  label: string;
  name: 'weight' | 'reps';
  minimum: number;
  placeholder: number;
  inputRef: RefObject<HTMLInputElement | null>;
  increment: number;
}) {
  const inputId = useId();
  const isWeight = name === 'weight';

  function adjust(direction: number) {
    const input = inputRef.current;
    if (!input) return;
    const current = Number.isFinite(input.valueAsNumber) ? input.valueAsNumber : placeholder;
    const maximum = isWeight ? Number.MAX_VALUE : Number.MAX_SAFE_INTEGER;
    const next = Math.min(maximum, Math.max(minimum, current + direction * increment));
    input.value = String(isWeight ? Number(next.toFixed(10)) : next);
  }

  return (
    <div className={styles.setField}>
      <label htmlFor={inputId}>{label}</label>
      <div className={styles.setFieldControls}>
        <button
          className={ui.secondary}
          type="button"
          aria-label={`Уменьшить: ${label}`}
          onClick={() => adjust(-1)}
        >
          −
        </button>
        <input
          id={inputId}
          ref={inputRef}
          name={name}
          type="number"
          inputMode={isWeight ? 'decimal' : 'numeric'}
          min={minimum}
          max={isWeight ? undefined : Number.MAX_SAFE_INTEGER}
          step={isWeight ? 'any' : '1'}
          placeholder={String(placeholder)}
        />
        <button
          className={ui.secondary}
          type="button"
          aria-label={`Увеличить: ${label}`}
          onClick={() => adjust(1)}
        >
          +
        </button>
      </div>
    </div>
  );
}

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
  weightStep,
  setWeightStep,
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
  weightStep: number;
  setWeightStep: (step: number) => void;
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
  const previousNote = previousExerciseNote(history, id);
  const currentNote = exerciseNote(workout.notes, id);
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
    const updated = recordSet(
      workout,
      {
        weight: canAddWeight ? number('weight') : null,
        reps: number('reps'),
      },
      String(data.get('note') ?? ''),
    );
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
          {(previousSets.length > 0 || previousNote) && (
            <div className={styles.previousResult}>
              <div>
                <strong>В прошлый раз</strong>
                {previousSets.length > 0 && <p>{previousSets.map(formatSet).join(' / ')}</p>}
                {previousNote && (
                  <p className={styles.noteText}>Последняя заметка · {previousNote}</p>
                )}
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
          <div className={styles.setFields}>
            {canAddWeight && (
              <>
                <SetField
                  label={weightLabel}
                  name="weight"
                  minimum={0}
                  placeholder={prior?.weight ?? 0}
                  inputRef={weightInput}
                  increment={weightStep}
                />
                <label className={styles.weightStep}>
                  Шаг веса, кг
                  <select
                    value={weightStep}
                    onChange={(event) => setWeightStep(Number(event.target.value))}
                  >
                    <option value="0.25">0,25</option>
                    <option value="0.5">0,5</option>
                    <option value="1">1</option>
                    <option value="2.5">2,5</option>
                    <option value="5">5</option>
                  </select>
                </label>
              </>
            )}
            <SetField
              label={exercise.perSide ? 'Повторы на сторону' : 'Повторы'}
              name="reps"
              minimum={1}
              placeholder={targetReps}
              inputRef={repsInput}
              increment={1}
            />
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
          <details className={styles.exerciseNote} open={currentNote ? true : undefined}>
            <summary>Заметка к упражнению</summary>
            <label>
              <span className={ui.srOnly}>Заметка к упражнению</span>
              <textarea
                name="note"
                rows={2}
                maxLength={exerciseNoteLimit}
                defaultValue={currentNote}
              />
            </label>
          </details>
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
