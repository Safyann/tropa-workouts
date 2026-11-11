import {
  effortLabels,
  estimatedCalories,
  formatTime,
  type Effort,
  type Session,
} from '../../entities/progress';
import { BodyWeightForm } from '../../features/workout/BodyWeightForm';
import ui from '../../shared/ui/Common.module.css';
import styles from './Workout.module.css';

export function WorkoutResult({
  session,
  saveWeight,
  saveEffort,
}: {
  session: Session;
  saveWeight: (weight: number) => void;
  saveEffort: (effort: Effort | undefined) => void;
}) {
  const calories = estimatedCalories(session);

  return (
    <section className={ui.narrow}>
      <h1 tabIndex={-1}>
        Итоги занятия<span>.</span>
      </h1>
      <div className={styles.step}>
        <p className={ui.eyebrow}>ВСЁ ЗАНЯТИЕ</p>
        {session.durationSeconds !== undefined ? (
          <>
            <p className={styles.clock}>{formatTime(session.durationSeconds)}</p>
            <p className={ui.hint}>От начала до завершения, включая паузы.</p>
          </>
        ) : (
          <p>Длительность не записана.</p>
        )}
        {calories !== undefined && (
          <p>
            <strong>≈ {calories} ккал</strong> активного расхода
          </p>
        )}
        {calories === undefined && session.activeCaloriesPerKg !== undefined && (
          <>
            <p>Укажи вес тела, чтобы получить примерный расход калорий.</p>
            <BodyWeightForm
              save={(weight) => {
                if (weight !== undefined) saveWeight(weight);
              }}
            />
          </>
        )}
      </div>
      <fieldset className={styles.effort}>
        <legend>Как далась тренировка?</legend>
        {(Object.keys(effortLabels) as Effort[]).map((effort) => (
          <button
            key={effort}
            className={ui.secondary}
            type="button"
            aria-pressed={session.effort === effort}
            onClick={() => saveEffort(session.effort === effort ? undefined : effort)}
          >
            {effortLabels[effort]}
          </button>
        ))}
      </fieldset>
      <a className={ui.secondary} href="#map">
        К карте
      </a>{' '}
      <a className={ui.secondary} href="#history">
        История занятий
      </a>
    </section>
  );
}
