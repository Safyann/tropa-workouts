import { useRef, type FormEvent, type Ref } from 'react';
import {
  ExerciseDemonstration,
  ExerciseInstructions,
  exerciseDemonstration,
  exercises,
} from '../../entities/program';
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
import { readSetFields, SetFields } from '../../features/workout/SetFields';
import { Button, Select } from '../../shared/ui/Controls';
import { Icon } from '../../shared/ui/Icon';
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
    const updated = recordSet(workout, readSetFields(data), String(data.get('note') ?? ''));
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
        <ExerciseDemonstration title={exercise.title} demo={exerciseDemonstration(id)} autoPlay />
        <ExerciseInstructions source={exercise.cues} className={styles.cues} />
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
                <Button type="button" onClick={() => applyPreviousWeight(previousWeight)}>
                  Подставить {formatWeight(previousWeight)}
                </Button>
              )}
            </div>
          )}
          <div className={styles.setFields}>
            <SetFields
              exercise={exercise}
              adjustments={{
                weight: { ref: weightInput, step: weightStep, fallback: prior?.weight ?? 0 },
                reps: { ref: repsInput, step: 1, fallback: targetReps },
              }}
              afterWeight={
                <label className={styles.weightStep}>
                  Шаг веса, кг
                  <Select
                    value={weightStep}
                    onChange={(event) => setWeightStep(Number(event.target.value))}
                  >
                    <option value="0.25">0,25</option>
                    <option value="0.5">0,5</option>
                    <option value="1">1</option>
                    <option value="2.5">2,5</option>
                    <option value="5">5</option>
                  </Select>
                </label>
              }
            />
          </div>
          {repeat && (
            <Button className={styles.repeatSet} type="button" onClick={repeatSet}>
              Повторить подход · {formatSet(repeat)}
            </Button>
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
          <Button variant="primary" className={styles.stepAction} type="submit">
            {finalSet ? endLabel : 'Записать подход'} <Icon name="check" />
          </Button>
        </form>
      </div>
    </>
  );
}
