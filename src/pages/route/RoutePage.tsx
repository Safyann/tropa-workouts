import {
  cardioActivity,
  cardioTitles,
  defaultPreferences,
  defaultWeeklyGoal,
  equipmentLabels,
  defaultEquipment,
  levels,
  route,
  workoutDetail,
  type WorkoutPreferences,
} from '../../entities/program';
import { nextStop, routeLength, weekCount, type Progress } from '../../entities/progress';
import { Icon } from '../../shared/ui/Icon';
import { DayPreview } from './DayPreview';
import { MuscleGroupPicker } from './MuscleGroupPicker';
import { RouteMap } from './RouteMap';
import { WorkoutSettings } from './WorkoutSettings';
import ui from '../../shared/ui/Common.module.css';
import styles from './Route.module.css';

interface Props {
  progress: Progress;
  activeStop?: number;
  offlineReady: boolean;
  start: (short: boolean) => void;
  restart: () => void;
  changePreferences: (preferences: WorkoutPreferences) => void;
}

export function RoutePage({
  progress,
  activeStop,
  offlineReady,
  start,
  restart,
  changePreferences,
}: Props) {
  const inWorkout = activeStop !== undefined;
  const totalStops = routeLength(progress, activeStop);
  const next = nextStop(progress, totalStops);
  const stop = route[next];
  const completedStops = new Set(
    progress.sessions.filter((session) => session.round === progress.round).map(({ stop }) => stop),
  );
  const historyStops = new Set(progress.sessions.map(({ stop }) => stop));
  const count = weekCount(progress.sessions);
  const preferences = progress.preferences ?? defaultPreferences;
  const goal = preferences.weeklyGoal ?? defaultWeeklyGoal;
  const equipment = (preferences.equipment ?? defaultEquipment).map(
    (item) => equipmentLabels[item],
  );
  return (
    <>
      <div className={styles.intro}>
        <div>
          <p className={ui.eyebrow}>
            <span className={styles.signal} /> ПРОГРАММА 01 / ДОМА
          </p>
          <h1 tabIndex={-1}>
            Войти в ритм<span>.</span>
          </h1>
          <p className={ui.subtitle}>Чередуй силовые и кардио в своём темпе.</p>
        </div>
        <div className={styles.week}>
          <p className={styles.weekLabel}>ЦЕЛЬ НЕДЕЛИ</p>
          <strong>
            {count}
            <span className={styles.goal}> / {goal}</span>
          </strong>
          <span className={styles.weekDots} aria-hidden="true">
            {Array.from({ length: goal }, (_, index) => (
              <i key={index} className={count > index ? styles.filled : undefined} />
            ))}
          </span>
          <a className={styles.weekSettings} href="#settings">
            Настройки профиля
          </a>
        </div>
      </div>
      <div className={styles.dashboard}>
        <section className={styles.nextCard}>
          <p className={ui.eyebrow}>
            {stop ? `ОСТАНОВКА ${next + 1} / ${totalStops}` : 'МАРШРУТ ЗАВЕРШЁН'}
          </p>
          <span className={styles.stopIcon}>
            <Icon name={stop?.icon ?? 'check'} />
          </span>
          <h2>{stop?.title ?? 'Все костры горят'}</h2>
          {stop ? (
            <>
              {!inWorkout && (
                <>
                  <p className={styles.sessionType}>
                    {stop.icon === 'cardio'
                      ? cardioTitles[cardioActivity(preferences.equipment)]
                      : stop.type}
                  </p>
                  <p className={styles.sessionDetail}>
                    {workoutDetail(stop, false, preferences)} · {levels[preferences.level].title}
                  </p>
                </>
              )}
              {!inWorkout && stop.icon === 'strength' && (
                <MuscleGroupPicker preferences={preferences} change={changePreferences} />
              )}
              <div className={styles.cardActions}>
                <button className={ui.primary} onClick={() => start(false)}>
                  {inWorkout ? 'Продолжить занятие' : 'Начать занятие'} <Icon name="arrow" />
                </button>
                {!inWorkout && (
                  <button className={ui.secondary} onClick={() => start(true)}>
                    Короткий вариант
                  </button>
                )}
              </div>
              {!inWorkout && (
                <>
                  {!progress.sessions.length && !preferences.equipment && (
                    <div className={styles.equipmentIntro}>
                      <p className={ui.hint}>Подбери план под свой домашний инвентарь.</p>
                      <a className={ui.secondary} href="#settings">
                        Выбрать инвентарь
                      </a>
                      <button
                        type="button"
                        className={ui.secondary}
                        onClick={() => changePreferences({ ...preferences, equipment: [] })}
                      >
                        Без инвентаря
                      </button>
                    </div>
                  )}
                  <WorkoutSettings preferences={preferences} change={changePreferences} />
                  <DayPreview key={next} stop={stop} preferences={preferences} />
                </>
              )}
            </>
          ) : (
            <>
              <p className={styles.sessionType}>
                Результаты сохранены в истории. Можно пройти тропу ещё раз.
              </p>
              <div className={styles.cardActions}>
                <button className={ui.primary} onClick={restart}>
                  Новый круг <Icon name="arrow" />
                </button>
              </div>
            </>
          )}
        </section>
        <RouteMap
          next={next}
          totalStops={totalStops}
          completedStops={completedStops}
          historyStops={historyStops}
        />
      </div>
      <footer className={ui.foot}>
        <span>{equipment.join(' · ') || 'Без инвентаря'}</span>
        <span>
          {offlineReady
            ? 'Маршрут доступен без сети · история в этом браузере'
            : 'Прогресс хранится в этом браузере'}
        </span>
      </footer>
    </>
  );
}
