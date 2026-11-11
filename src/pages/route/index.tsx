import type { CSSProperties } from 'react';
import {
  cardioActivity,
  cardioTitles,
  defaultPreferences,
  defaultWeeklyGoal,
  equipmentLabels,
  exercises,
  homeEquipment,
  levels,
  route,
  strengthPlan,
  workoutDetail,
  workoutTiming,
  type Stop,
  type WorkoutPreferences,
} from '../../entities/program';
import { nextStop, weekCount, type Progress } from '../../entities/progress';
import { Icon } from '../../shared/ui/Icon';
import { WorkoutSettings } from './WorkoutSettings';
import ui from '../../shared/ui/Common.module.css';
import styles from './Route.module.css';

interface Props {
  progress: Progress;
  inWorkout: boolean;
  offlineReady: boolean;
  start: (short: boolean) => void;
  restart: () => void;
  changePreferences: (preferences: WorkoutPreferences) => void;
}

export function RoutePage({
  progress,
  inWorkout,
  offlineReady,
  start,
  restart,
  changePreferences,
}: Props) {
  const next = nextStop(progress, route.length);
  const stop = route[next];
  const completed = next === -1 ? route.length : next;
  const count = weekCount(progress.sessions);
  const preferences = progress.preferences ?? defaultPreferences;
  const goal = preferences.weeklyGoal ?? defaultWeeklyGoal;
  const equipment = (preferences.equipment ?? homeEquipment).map((item) => equipmentLabels[item]);
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
          <p className={ui.subtitle}>Четыре остановки, чтобы начать заниматься регулярно.</p>
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
          <p className={ui.eyebrow}>{stop ? `ОСТАНОВКА 0${next + 1} / 04` : 'МАРШРУТ ЗАВЕРШЁН'}</p>
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
                Четыре занятия в истории. Можно пройти тропу ещё раз.
              </p>
              <div className={styles.cardActions}>
                <button className={ui.primary} onClick={restart}>
                  Новый круг <Icon name="arrow" />
                </button>
              </div>
            </>
          )}
        </section>
        <section className={styles.map} aria-label="Карта из четырёх остановок">
          <img className={styles.mapArt} src="./map.svg" alt="" />
          <div className={styles.mapCaption}>
            <span>01 / МАРШРУТ</span>
            <strong>Тропа костров</strong>
          </div>
          <ol className={styles.markers}>
            {route.map((item, index) => {
              const state = index < completed ? 'done' : index === next ? 'current' : 'locked';
              const status = { done: 'Пройдено', current: 'Следующее занятие', locked: 'Закрыто' }[
                state
              ];
              const hasHistory = progress.sessions.some((session) => session.stop === index);
              const position = { '--x': `${item.x}%`, '--y': `${item.y}%` } as CSSProperties;
              return (
                <li className={styles.marker} data-state={state} style={position} key={item.title}>
                  {hasHistory ? (
                    <a
                      className={`${styles.markerDot} ${styles.markerLink}`}
                      href={`#history/${index + 1}`}
                      aria-label={`История: ${item.title}`}
                      title="Открыть историю"
                    >
                      <Icon name="flame" />
                    </a>
                  ) : (
                    <span className={styles.markerDot}>
                      <Icon name={state === 'locked' ? 'lock' : 'flame'} />
                    </span>
                  )}
                  <span className={styles.markerLabel}>
                    <b>0{index + 1}</b> <span className={styles.markerName}>{item.title}</span>
                    <span className={ui.srOnly}> — {status}</span>
                  </span>
                </li>
              );
            })}
          </ol>
          <div className={styles.mapLegend}>
            <span className={styles.signal} /> {completed} из 4 остановок пройдено
          </div>
        </section>
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

function DayPreview({ stop, preferences }: { stop: Stop; preferences: WorkoutPreferences }) {
  const timing = workoutTiming(stop, false, preferences);
  return (
    <details className={styles.dayPreview}>
      <summary>Вся тренировка</summary>
      {timing.warmup > 0 && <p className={ui.hint}>Разминка · {timing.warmup} мин</p>}
      {stop.icon === 'strength' ? (
        <>
          <ul className={styles.previewPlan}>
            {strengthPlan(stop, false, preferences).map((item) => {
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
            Ориентир для основной части — {timing.main} мин. В коротком варианте — первые{' '}
            {strengthPlan(stop, true, preferences).length} упражнения по одному подходу.
          </p>
        </>
      ) : (
        <p className={ui.hint}>
          {cardioTitles[cardioActivity(preferences.equipment)]} · {timing.main} мин. Короткий
          вариант целиком · {workoutDetail(stop, true, preferences)}.
        </p>
      )}
      {timing.cooldown > 0 && <p className={ui.hint}>Заминка · {timing.cooldown} мин</p>}
    </details>
  );
}
