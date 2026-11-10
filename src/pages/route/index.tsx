import type { CSSProperties } from 'react';
import { exercises, route, strengthPlan, workoutDetail, type Stop } from '../../entities/program';
import { nextStop, weekCount, type Progress } from '../../entities/progress';
import { Icon } from '../../shared/ui/Icon';

interface Props {
  progress: Progress;
  inWorkout: boolean;
  offlineReady: boolean;
  start: (short: boolean) => void;
  restart: () => void;
}

export function RoutePage({ progress, inWorkout, offlineReady, start, restart }: Props) {
  const next = nextStop(progress, route.length);
  const stop = route[next];
  const completed = next === -1 ? route.length : next;
  const count = weekCount(progress.sessions);
  return <>
    <div className="intro">
      <div><p className="eyebrow"><span className="signal"/> ПРОГРАММА 01 / ДОМА</p>
        <h1 tabIndex={-1}>Войти в ритм<span>.</span></h1>
        <p className="subtitle">Четыре остановки, чтобы начать заниматься регулярно.</p>
      </div>
      <div className="week"><p className="eyebrow">ЦЕЛЬ НЕДЕЛИ</p>
        <strong>{count}<span> / 2</span></strong>
        <span className="week-dots" aria-hidden="true">
          <i className={count >= 1 ? 'filled' : ''}/><i className={count >= 2 ? 'filled' : ''}/>
        </span>
      </div>
    </div>
    <div className="dashboard">
      <section className="map" aria-label="Карта из четырёх остановок">
        <img className="map-art" src="./map.svg" alt=""/>
        <div className="map-caption"><span>01 / МАРШРУТ</span><strong>Тропа костров</strong></div>
        <ol className="markers">{route.map((item, index) => {
          const state = index < completed ? 'done' : index === next ? 'current' : 'locked';
          const status = { done: 'Пройдено', current: 'Следующее занятие', locked: 'Закрыто' }[state];
          const position = { '--x': `${item.x}%`, '--y': `${item.y}%` } as CSSProperties;
          return <li className={`marker ${state}`} style={position} key={item.title}>
            <span className="marker-dot"><Icon name={state === 'locked' ? 'lock' : 'flame'}/></span>
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
          <p className="session-detail">{workoutDetail(stop)}</p>
          {!inWorkout && <DayPreview key={next} stop={stop}/>}
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

function DayPreview({ stop }: { stop: Stop }) {
  return <details className="day-preview">
    <summary>Вся тренировка</summary>
    {stop.icon === 'strength' ? <>
      <ul className="plan-list">{strengthPlan(stop, false).map(item => {
        const exercise = exercises[item.exercise];
        return <li key={item.exercise}><strong>{exercise.title}</strong><small>{item.target === 1 ? '1 подход' : `${item.target} подхода`} · {exercise.group}</small></li>;
      })}</ul>
      <p className="hint">В коротком варианте — первые два упражнения по одному подходу.</p>
    </> : <p className="hint">Эллипс · {workoutDetail(stop)}. Короткий вариант · {workoutDetail(stop, true)}.</p>}
  </details>;
}
