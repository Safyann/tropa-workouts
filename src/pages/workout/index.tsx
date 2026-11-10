import { useEffect, useRef, useState, type FormEvent } from 'react';
import { exercises, route, workoutDetail } from '../../entities/program';
import { formatTime, type Session } from '../../entities/progress';
import { isPending, recordSet, remaining, selectExercise, toggleTimer, type StrengthWorkout, type Workout } from '../../features/workout';
import { Icon } from '../../shared/ui/Icon';
import { ExerciseGif } from '../../shared/ui/ExerciseGif';
import { exerciseGifUrl } from '../../shared/api/exerciseDb';
import { Demonstration } from './Demonstration';
import { WorkoutPlan } from './WorkoutPlan';

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
  const exerciseHeading = useRef<HTMLHeadingElement>(null);
  const focusExercise = useRef(false);
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
  useEffect(() => {
    if (focusExercise.current && exerciseHeading.current) {
      focusExercise.current = false;
      exerciseHeading.current.focus();
    }
  }, [workout]);

  const stop = route[workout.index];
  const left = timer ? remaining(timer, now) : 0;
  const toggle = () => {
    if (!timer) return;
    const timestamp = Date.now();
    setNow(timestamp);
    update({ ...workout, timer: toggleTimer(timer, timestamp) });
  };
  const timerView = (label: string) => <Timer seconds={left} running={timer?.end != null} label={label} toggle={toggle}/>;
  const choose = (index: number) => {
    if (workout.kind !== 'strength') return;
    focusExercise.current = true;
    update(selectExercise(workout, index));
  };

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
    </> : <>
      <WorkoutPlan workout={workout} update={update} choose={choose}/>
      {workout.timer ? <div className="workout-card">{timerView('ОТДЫХ МЕЖДУ ПОДХОДАМИ')}
        <button className="primary" onClick={() => choose(workout.selected ?? workout.plan.findIndex(isPending))}>
          Следующий подход <Icon name="arrow"/>
        </button>
      </div> : workout.selected !== null
        ? <StrengthSet key={`${workout.selected}-${workout.plan[workout.selected].exercise}-${workout.sets.length}`}
            itemIndex={workout.selected} workout={workout} history={history} update={update} finish={finish}
            headingRef={exerciseHeading}/>
        : !workout.plan.some(isPending) && <div className="workout-card">
          {workout.sets.length > 0
            ? <button className="primary" onClick={() => finish(workout)}>Сохранить занятие <Icon name="check"/></button>
            : <p className="subtitle">Все упражнения пропущены. Можно вернуться к карте или вернуть упражнение в план.</p>}
        </div>}
    </>}
  </section>;
}

function StrengthSet({ workout, history, update, finish, itemIndex, headingRef }: Props & {
  workout: StrengthWorkout;
  itemIndex: number;
  headingRef: React.Ref<HTMLHeadingElement>;
}) {
  const item = workout.plan[itemIndex];
  const id = item.exercise;
  const exercise = exercises[id];
  const finalSet = item.completed + 1 === item.target && workout.plan.filter(isPending).length === 1;
  const prior = [...workout.sets].reverse().find(set => set.exercise === id && set.weight !== null)
    ?? [...history].reverse().flatMap(entry => [...entry.sets].reverse()).find(set => set.exercise === id && set.weight !== null);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const number = (name: string) => data.get(name) === '' ? null : Number(data.get(name));
    const updated = recordSet(workout, { weight: exercise.weighted ? number('weight') : null, reps: number('reps') });
    if (finalSet) finish(updated);
    else update(updated);
  }

  return <>
    <div className="workout-card">
      <p className="eyebrow">ПОДХОД {item.completed + 1} ИЗ {item.target}</p>
      <h2 tabIndex={-1} ref={headingRef}>{exercise.title}</h2><Demonstration exercise={exercise}/>
      {exercise.gifId && <WorkoutGif id={exercise.gifId} title={exercise.title}/>}
      <ul className="cues">{exercise.cues.map(cue => <li key={cue}>{cue}</li>)}</ul>
      <a className="reference" href={exercise.reference} target="_blank" rel="noreferrer">Техника подробно ↗</a>
      <form onSubmit={submit}>
        <div className="fields">
          {exercise.weighted && <label>Вес одной гантели, кг<input name="weight" type="number" inputMode="decimal" min="0" step="any" placeholder={String(prior?.weight ?? 0)}/></label>}
          <label>Повторы{exercise.perSide ? ' на руку' : ''}<input name="reps" type="number" inputMode="numeric" min="1" step="1" placeholder="8"/></label>
        </div>
        <p className="hint">Ориентир — 8 повторов. {prior ? `Прошлый вес: ${prior.weight} кг.` : 'Можно записать фактический результат или оставить поля пустыми.'}</p>
        <button className="primary" type="submit">{finalSet ? 'Завершить занятие' : 'Записать подход'} <Icon name="check"/></button>
      </form>
    </div>
  </>;
}

function WorkoutGif({ id, title }: { id: string; title: string }) {
  const [visible, setVisible] = useState(false);
  return <div className="exercise-gif">
    <button className="secondary" aria-expanded={visible} onClick={() => setVisible(!visible)}>
      {visible ? 'Скрыть GIF' : 'Показать GIF'}
    </button>
    {visible && <><ExerciseGif src={exerciseGifUrl(id)} title={title}/>
      <small>Источник: <a href="https://exercisedb.dev/docs" target="_blank" rel="noreferrer">ExerciseDB / AscendAPI</a></small></>}
  </div>;
}
