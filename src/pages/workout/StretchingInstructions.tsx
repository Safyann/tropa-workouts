import { ExerciseDemonstration, type WorkoutBlockType } from '../../entities/program';
import { stretchingPlan, type Workout } from '../../features/workout';
import styles from './Workout.module.css';

export function StretchingInstructions({
  workout,
  type,
}: {
  workout: Workout;
  type: WorkoutBlockType;
}) {
  const { steps, walkingMinutes } = stretchingPlan(workout, type);

  return (
    <>
      <ol className={styles.stretchingPlan}>
        <li>
          <strong>Лёгкая ходьба · {walkingMinutes} мин</strong>
          <p>
            {type === 'warmup'
              ? 'Начни с комфортного темпа. Можно идти на месте.'
              : 'Постепенно сбавь темп. Переходи к растяжке, когда дыхание станет спокойнее.'}
          </p>
          <ExerciseDemonstration title="Лёгкая ходьба" demo="walk" />
        </li>
        {steps.map(({ group, title, cue, demo }) => (
          <li key={group}>
            <strong>{title} · 1 мин</strong>
            <small>{group}</small>
            <p>{cue}</p>
            <ExerciseDemonstration title={title} demo={demo} />
          </li>
        ))}
      </ol>
      {steps.length > 0 && (
        <p className={styles.stretchingHint}>
          Двигайся плавно и без боли. Оставшееся время каждой минуты используй для отдыха и
          перехода.
        </p>
      )}
    </>
  );
}
