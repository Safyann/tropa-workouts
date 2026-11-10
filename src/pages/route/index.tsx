import type { CSSProperties } from 'react';
import { defaultPreferences, defaultWeeklyGoal, exercises, levels, route, strengthPlan, workoutDetail, workoutTiming, type Stop, type WorkoutPreferences } from '../../entities/program';
import { nextStop, weekCount, type Progress } from '../../entities/progress';
import { Icon } from '../../shared/ui/Icon';
import { WorkoutSettings } from './WorkoutSettings';

interface Props {
  progress: Progress;
  inWorkout: boolean;
  offlineReady: boolean;
  start: (short: boolean) => void;
  restart: () => void;
  changePreferences: (preferences: WorkoutPreferences) => void;
}

export function RoutePage({ progress, inWorkout, offlineReady, start, restart, changePreferences }: Props) {
  const next = nextStop(progress, route.length);
  const stop = route[next];
  const completed = next === -1 ? route.length : next;
  const count = weekCount(progress.sessions);
  const preferences = progress.preferences ?? defaultPreferences;
  const goal = preferences.weeklyGoal ?? defaultWeeklyGoal;
  return <>
    <div className="intro">
      <div><p className="eyebrow"><span className="signal"/> ПРОГРАММА 01 / ДОМА</p>
        <h1 tabIndex={-1}>Войти в ритм<span>.</span></h1>
        <p className="subtitle">Четыре остановки, чтобы начать заниматься регулярно.</p>
      </div>
      <div className="week"><p className="eyebrow">ЦЕЛЬ НЕДЕЛИ</p>
        <strong>{count}<span> / {goal}</span></strong>
        <span className="week-dots" aria-hidden="true">
          {Array.from({ length: goal }, (_, index) => <i key={index} className={count > index ? 'filled' : ''}/>)}
        </span>
        <a className="week-settings" href="#settings">Уровень и цель</a>
      </div>
    </div>
    <div className="dashboard">
      <section className="map" aria-label="Карта из четырёх остановок">
        <img className="map-art" src="./map.svg" alt=""/>
        <div className="map-caption"><span>01 / МАРШРУТ</span><strong>Тропа костров</strong></div>
        <ol className="markers">{route.map((item, index) => {
          const state = index < completed ? 'done' : index === next ? 'current' : 'locked';
          const status = { done: 'Пройдено', current: 'Следующее занятие', locked: 'Закрыто' }[state];
          const hasHistory = progress.sessions.some(session => session.stop === index);
          const position = { '--x': `${item.x}%`, '--y': `${item.y}%` } as CSSProperties;
          return <li className={`marker ${state}`} style={position} key={item.title}>
            {hasHistory
              ? <a className="marker-dot marker-link" href={`#history/${index + 1}`} aria-label={`История: ${item.title}`} title="Открыть историю">
                  <Icon name="flame"/>
                </a>
              : <span className="marker-dot"><Icon name={state === 'locked' ? 'lock' : 'flame'}/></span>}
            <span className="marker-label"><b>0{index + 1}</b> <span className="marker-name">{item.title}</span>
              <span className="sr-only"> — {status}</span></span>
          </li>;
        })}</ol>
        <div className="map-legend"><span className="signal"/> {completed} из 4 остановок пройдено</div>
      </section>
      <section className="next-card">
        <p className="eyebrow">{stop ? `ОСТАНОВКА 0${next + 1} / 04` : 'МАРШРУТ ЗАВЕРШЁН'}</p>
        <span className="type-icon"><Icon name={stop?.icon ?? 'check'}/></span>
        <h2>{stop?.title ?? 'Все костры горят'}</h2>
        {stop ? <>
          <p className="session-type">{stop.type} · {stop.gear}</p>
          {!inWorkout && <>
            <p className="session-detail">{workoutDetail(stop, false, preferences)} · {levels[preferences.level].title}</p>
            <WorkoutSettings preferences={preferences} change={changePreferences}/>
            <DayPreview key={next} stop={stop} preferences={preferences}/>
          </>}
          <div className="card-actions">
            <button className="primary" onClick={() => start(false)}>{inWorkout ? 'Продолжить занятие' : 'Начать занятие'} <Icon name="arrow"/></button>
            {!inWorkout && <button className="secondary" onClick={() => start(true)}>Короткий вариант</button>}
          </div>
        </> : <>
          <p className="session-type">Четыре занятия в истории. Можно пройти тропу ещё раз.</p>
          <div className="card-actions"><button className="primary" onClick={restart}>Новый круг <Icon name="arrow"/></button></div>
        </>}
      </section>
    </div>
    <footer className="foot">
      <span>Гантели <b>·</b> скамья <b>·</b> эллипс</span>
      <span>{offlineReady ? 'Маршрут доступен без сети · история в этом браузере' : 'Прогресс хранится в этом браузере'}</span>
    </footer>
  </>;
}

function DayPreview({ stop, preferences }: { stop: Stop; preferences: WorkoutPreferences }) {
  const timing = workoutTiming(stop, false, preferences);
  return <details className="day-preview">
    <summary>Вся тренировка</summary>
    {timing.warmup > 0 && <p className="hint">Разминка · {timing.warmup} мин</p>}
    {stop.icon === 'strength' ? <>
      <ul className="plan-list">{strengthPlan(stop, false, preferences).map(item => {
        const exercise = exercises[item.exercise];
        return <li key={item.exercise}><strong>{exercise.title}</strong><small>{item.target === 1 ? '1 подход' : `${item.target} подхода`} · {exercise.group}</small></li>;
      })}</ul>
      <p className="hint">Ориентир для основной части — {timing.main} мин. В коротком варианте — первые два упражнения по одному подходу.</p>
    </> : <p className="hint">Эллипс · {timing.main} мин. Короткий вариант целиком · {workoutDetail(stop, true, preferences)}.</p>}
    {timing.cooldown > 0 && <p className="hint">Заминка · {timing.cooldown} мин</p>}
  </details>;
}
