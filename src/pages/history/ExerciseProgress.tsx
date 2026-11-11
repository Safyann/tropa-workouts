import type { Ref } from 'react';
import { exercises, type ExerciseId } from '../../entities/program';
import type { ExerciseProgressEntry } from '../../entities/progress';
import ui from '../../shared/ui/Common.module.css';
import styles from './ExerciseProgress.module.css';

const dateFormat = new Intl.DateTimeFormat('ru', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});
const numberFormat = new Intl.NumberFormat('ru', { maximumSignificantDigits: 15 });

function Metric({ value, max, unit }: { value: number | null; max: number; unit: string }) {
  if (value === null) return <td aria-label="Нет данных">—</td>;
  return (
    <td>
      <span>
        {numberFormat.format(value)} {unit}
      </span>
      <meter aria-hidden="true" min={0} max={max || 1} value={value} />
    </td>
  );
}

export function ExerciseProgress({
  entriesByExercise,
  selected,
  select,
  headingRef,
}: {
  entriesByExercise: ReadonlyMap<ExerciseId, ExerciseProgressEntry[]>;
  selected: ExerciseId;
  select: (exercise: ExerciseId) => void;
  headingRef: Ref<HTMLHeadingElement>;
}) {
  const entries = entriesByExercise.get(selected) ?? [];
  const exercise = exercises[selected];
  const maxWeight = entries.reduce((max, { weight }) => Math.max(max, weight ?? 0), 0);
  const maxReps = entries.reduce((max, { reps }) => Math.max(max, reps ?? 0), 0);
  const showsWeight = entries.some(({ weight }) => weight !== null);
  const showsReps = entries.some(({ reps }) => reps !== null);

  return (
    <section className={ui.panel} aria-labelledby="exercise-progress-heading">
      <h2 ref={headingRef} id="exercise-progress-heading" tabIndex={-1}>
        Прогресс по упражнениям
      </h2>
      <label className={styles.picker}>
        Упражнение
        <select value={selected} onChange={(event) => select(event.target.value as ExerciseId)}>
          {[...entriesByExercise.keys()].map((id) => (
            <option key={id} value={id}>
              {exercises[id]?.title ?? id}
            </option>
          ))}
        </select>
      </label>
      <p className={styles.note}>
        Максимальные значения за подход в каждом занятии.
        {showsWeight && exercise?.needs?.includes('dumbbells') && ' Вес указан на одну гантель.'}
        {showsReps && exercise?.perSide && ' Повторы указаны на одну сторону.'}
      </p>
      <table className={styles.metrics} aria-label={exercise?.title ?? selected}>
        <thead>
          <tr>
            <th scope="col">Дата</th>
            {showsWeight && <th scope="col">Вес</th>}
            {showsReps && <th scope="col">Повторы</th>}
          </tr>
        </thead>
        <tbody>
          {entries.map(({ session, weight, reps }) => (
            <tr key={`${session.round}-${session.stop}`}>
              <th scope="row">
                <time dateTime={new Date(session.date).toISOString()}>
                  {dateFormat.format(session.date)}
                </time>
              </th>
              {showsWeight && <Metric value={weight} max={maxWeight} unit="кг" />}
              {showsReps && <Metric value={reps} max={maxReps} unit="" />}
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
