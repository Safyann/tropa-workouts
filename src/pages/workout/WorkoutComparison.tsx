import { exercises } from '../../entities/program';
import { compareSession, formatSet, type Session } from '../../entities/progress';
import ui from '../../shared/ui/Common.module.css';
import styles from './Workout.module.css';

export function WorkoutComparison({
  session,
  history,
}: {
  session: Session;
  history: readonly Session[];
}) {
  const comparison = compareSession(session, history);
  if (!comparison.length) return null;
  return (
    <section className={ui.panel}>
      <h2>Сравнение с прошлой тренировкой</h2>
      <p className={ui.hint}>
        Для каждого упражнения показан подход с наибольшим записанным весом. При равном весе выбран
        подход с большим числом повторов.
      </p>
      <ul className={styles.comparison}>
        {comparison.map(({ exercise, previous, current }) => {
          const definition = exercises[exercise];
          const comparable =
            previous.weight === current.weight &&
            (current.weight !== null || definition?.weighted === false);
          const change =
            comparable && current.reps !== null && previous.reps !== null
              ? current.reps - previous.reps
              : 0;
          return (
            <li className={styles.comparisonItem} key={exercise}>
              <strong>{definition?.title ?? exercise}</strong>
              <dl>
                <div>
                  <dt>В прошлый раз</dt>
                  <dd>{formatSet(previous)}</dd>
                </div>
                <div>
                  <dt>Сегодня</dt>
                  <dd>{formatSet(current)}</dd>
                </div>
              </dl>
              {change !== 0 && (
                <p>
                  {change > 0 ? '+' : '−'}
                  {Math.abs(change)} повт. при той же нагрузке
                </p>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
