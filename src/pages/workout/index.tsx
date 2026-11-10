import { useEffect, useState, type FormEvent } from 'react';
import { exercises, route, workoutDetail } from '../../entities/program';
import { formatTime, type Session } from '../../entities/progress';
import { recordSet, remaining, toggleTimer, type Workout } from '../../features/workout';
import { Icon } from '../../shared/ui/Icon';
import { Demonstration } from './Demonstration';

interface Props {
  workout: Workout;
  history: Session[];
  update: (workout: Workout) => void;
  finish: (workout: Workout) => void;
}

function Timer({ seconds, running, label, toggle }: {
  seconds: number; running: boolean; label: string; toggle: () => void;
}) {
  return <div className="timer"><p className="eyebrow">{label}</p>
    <p className="clock" role="timer">{formatTime(seconds)}</p>
    <button className="secondary" onClick={toggle} disabled={seconds === 0}>
      {seconds === 0 ? 'Время вышло' : running ? 'Пауза' : 'Запустить таймер'}
    </button>
  </div>;
}

export function WorkoutPage({ workout, history, update, finish }: Props) {
  const [now, setNow] = useState(Date.now);
  const timer = workout.timer;
  useEffect(() => {
    if (!timer || timer.end === null) return;
    const tick = () => {
      const timestamp = Date.now();
      setNow(timestamp);
      if (timer.end !== null && timestamp >= timer.end) window.clearInterval(interval);
    };
    const interval = window.setInterval(tick, 250);
    tick();
    return () => window.clearInterval(interval);
  }, [timer]);

  const stop = route[workout.index];
  const left = timer ? remaining(timer, now) : 0;
  const toggle = () => {
    if (!timer) return;
    const timestamp = Date.now();
    setNow(timestamp);
    update({ ...workout, timer: toggleTimer(timer, timestamp) });
  };
  const timerView = (label: string) => <Timer seconds={left} running={timer?.end != null} label={label} toggle={toggle}/>;

  return <section className="narrow">
    <a className="back" href="#map">← К карте</a>
    <p className="eyebrow">ОСТАНОВКА 0{workout.index + 1} / 04</p><h1 tabIndex={-1}>{stop.title}<span>.</span></h1>
    {workout.kind === 'cardio' ? <>
      <p className="subtitle">Эллипс · {workoutDetail(stop, workout.short)}</p>
      <div className="workout-card">{timerView('ТАЙМЕР ЗАНЯТИЯ')}
        <button className="primary" onClick={() => finish(workout)} disabled={left === workout.seconds}>
          Завершить занятие <Icon name="check"/>
        </button>
      </div>
    </> : workout.timer ? <>
      <p className="subtitle">Подход записан.</p>
      <div className="workout-card">{timerView('ОТДЫХ МЕЖДУ ПОДХОДАМИ')}
        <button className="primary" onClick={() => update({ ...workout, timer: null })}>
          Следующий подход <Icon name="arrow"/>
        </button>
      </div>
    </> : <StrengthSet key={workout.sets.length} workout={workout} history={history} update={update} finish={finish}/>}
  </section>;
}

function StrengthSet({ workout, history, update, finish }: Props & { workout: Extract<Workout, { kind: 'strength' }> }) {
  const step = workout.sets.length;
  const id = workout.moves[step];
  const exercise = exercises[id];
  const finalSet = step + 1 === workout.moves.length;
  const prior = [...workout.sets].reverse().find(set => set.exercise === id && set.weight !== null)
    ?? [...history].reverse().flatMap(entry => [...entry.sets].reverse()).find(set => set.exercise === id && set.weight !== null);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const number = (name: string) => data.get(name) === '' ? null : Number(data.get(name));
    const updated = recordSet(workout, { exercise: id, weight: number('weight'), reps: number('reps') });
    if (finalSet) finish(updated);
    else update(updated);
  }

  return <>
    <p className="subtitle">Подход {step + 1} из {workout.moves.length} · {workout.short ? 'Короткий вариант' : 'Обычное занятие'}</p>
    <div className="workout-card">
      <h2>{exercise.title}</h2><Demonstration exercise={exercise}/>
      <ul className="cues">{exercise.cues.map(cue => <li key={cue}>{cue}</li>)}</ul>
      <a className="reference" href={exercise.reference} target="_blank" rel="noreferrer">Техника подробно ↗</a>
      <form onSubmit={submit}>
        <div className="fields">
          <label>Вес одной гантели, кг<input name="weight" type="number" inputMode="decimal" min="0" step="any" placeholder={String(prior?.weight ?? 0)}/></label>
          <label>Повторы{id === 'row' ? ' на руку' : ''}<input name="reps" type="number" inputMode="numeric" min="1" step="1" placeholder="8"/></label>
        </div>
        <p className="hint">Ориентир — 8 повторов. {prior ? `Прошлый вес: ${prior.weight} кг.` : 'Можно записать фактический результат или оставить поля пустыми.'}</p>
        <button className="primary" type="submit">{finalSet ? 'Завершить занятие' : 'Записать подход'} <Icon name="check"/></button>
      </form>
    </div>
  </>;
}
