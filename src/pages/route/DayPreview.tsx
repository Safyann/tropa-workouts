import {
  blockActivityLabel,
  cardioActivity,
  cardioTitles,
  exercises,
  strengthSchedule,
  workoutDetail,
  workoutTiming,
  type Stop,
  type WorkoutPreferences,
} from '../../entities/program';
import ui from '../../shared/ui/Common.module.css';
import styles from './Route.module.css';

export function DayPreview({ stop, preferences }: { stop: Stop; preferences: WorkoutPreferences }) {
  const timing = workoutTiming(stop, false, preferences);
  const schedule = stop.icon === 'strength' ? strengthSchedule(stop, false, preferences) : null;
  const mainMinutes = schedule?.estimatedMainMinutes ?? timing.main;
  return (
    <details className={styles.dayPreview}>
      <summary>Вся тренировка</summary>
      {timing.warmup > 0 && (
        <p className={ui.hint}>
          Разминка · {blockActivityLabel('warmup', preferences.warmupActivity)} · {timing.warmup}{' '}
          мин
        </p>
      )}
      {schedule ? (
        <>
          <ul className={styles.previewPlan}>
            {schedule.plan.map((item) => {
              const exercise = exercises[item.exercise];
              return (
                <li key={item.exercise}>
                  <strong>{exercise.title}</strong>
                  <small>
                    {item.target === 1 ? '1 подход' : `${item.target} подхода`} · {exercise.group}
                  </small>
                </li>
              );
            })}
          </ul>
          <p className={ui.hint}>
            Основная часть · около {mainMinutes} мин. Короткий вариант —{' '}
            {workoutDetail(stop, true, preferences)}. По одному подходу на упражнение.
          </p>
          {timing.main - mainMinutes > 3 && (
            <p className={ui.hint}>
              С выбранными группами и инвентарём подходящих упражнений хватило на {mainMinutes} из{' '}
              {timing.main} мин основной части.
            </p>
          )}
        </>
      ) : (
        <p className={ui.hint}>
          {cardioTitles[cardioActivity(preferences.equipment)]} · {timing.main} мин. Короткий
          вариант целиком · {workoutDetail(stop, true, preferences)}.
        </p>
      )}
      {timing.cooldown > 0 && (
        <p className={ui.hint}>
          Заминка · {blockActivityLabel('cooldown', preferences.cooldownActivity)} ·{' '}
          {timing.cooldown} мин
        </p>
      )}
    </details>
  );
}
