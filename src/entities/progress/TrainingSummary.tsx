import { exercises } from '../program/@x/progress';
import { formatSet } from './model';
import type { TrainingReport } from './trainingReport';
import styles from './TrainingSummary.module.css';

export function TrainingSummary({
  report,
  goal,
  comparisonLabel,
}: {
  report: TrainingReport;
  goal?: number;
  comparisonLabel: string;
}) {
  const minutes = report.seconds === null ? null : Math.round(report.seconds / 60);
  const duration =
    minutes === null ? '—' : minutes === 0 && report.seconds ? '<1 мин' : `${minutes} мин`;
  return (
    <>
      <dl className={styles.metrics}>
        <div>
          <dt>Занятия</dt>
          <dd>{goal === undefined ? report.workouts : `${report.workouts} из ${goal}`}</dd>
        </div>
        <div>
          <dt>Записано времени</dt>
          <dd>{duration}</dd>
        </div>
        <div>
          <dt>Подходы</dt>
          <dd>{report.sets}</dd>
        </div>
      </dl>
      {report.workouts > 0 && report.timedWorkouts < report.workouts && (
        <p className={styles.hint}>
          С длительностью записано {report.timedWorkouts} из {report.workouts} занятий.
        </p>
      )}
      {report.changes.length > 0 && (
        <details className={styles.changes}>
          <summary>{comparisonLabel}</summary>
          <ul>
            {report.changes.map(({ exercise, previous, current }) => {
              const definition = exercises[exercise];
              const comparable =
                previous.weight === current.weight &&
                (current.weight !== null || definition?.weighted === false);
              const change =
                comparable && current.reps !== null && previous.reps !== null
                  ? current.reps - previous.reps
                  : 0;
              return (
                <li key={exercise}>
                  <strong>{definition?.title ?? exercise}</strong>
                  <span>
                    {formatSet(previous)} → {formatSet(current)}
                  </span>
                  {change > 0 && <span>+{change} повт. при той же нагрузке</span>}
                </li>
              );
            })}
          </ul>
        </details>
      )}
    </>
  );
}
