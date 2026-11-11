import { useEffect, useRef, useState, type FormEvent } from 'react';
import { cardioTitles, exercises, route } from '../../entities/program';
import { formatTime, type Session } from '../../entities/progress';
import { isPending, recordSet, remaining, selectExercise, startCooldown, toggleTimer, type StrengthWorkout, type Workout } from '../../features/workout';
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
  const timer = workout.block?.timer ?? workout.timer;
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
    const nextTimer = toggleTimer(timer, timestamp);
    if (workout.block) update({ ...workout, block: { ...workout.block, timer: nextTimer } });
    else update({ ...workout, timer: nextTimer });
  };
  const timerView = (label: string) => <Timer seconds={left} running={timer?.end != null} label={label} toggle={toggle}/>;
  const choose = (index: number) => {
    if (workout.kind !== 'strength') return;
    focusExercise.current = true;
    update(selectExercise(workout, index));
  };
  const finishMain = (completed: Workout) => {
    const cooldown = startCooldown(completed);
    if (cooldown) update(cooldown);
    else finish(completed);
  };
  const warmup = workout.block?.type === 'warmup';
  const endLabel = workout.cooldownMinutes ? 'Перейти к заминке' : 'Завершить занятие';

  return <section className="narrow">
    <a className="back" href="#map">← К карте</a>
    <p className="eyebrow">ОСТАНОВКА 0{workout.index + 1} / 04</p><h1 tabIndex={-1}>{stop.title}<span>.</span></h1>
    {workout.block ? <div className="workout-card workout-step" key={workout.block.type}>
      <h2>{warmup ? 'Разминка' : 'Заминка'}</h2>
      <p className="subtitle">{warmup
        ? 'Начни с лёгкой ходьбы на месте.'
        : 'Постепенно сбавь темп и закончи спокойной ходьбой.'}</p>
      {timerView(warmup ? 'ТАЙМЕР РАЗМИНКИ' : 'ТАЙМЕР ЗАМИНКИ')}
      <button className="primary" onClick={() => warmup ? update({ ...workout, block: null }) : finish(workout)}>
        {warmup ? 'К основной части' : 'Сохранить занятие'} <Icon name={warmup ? 'arrow' : 'check'}/>
      </button>
    </div> : workout.kind === 'cardio' ? <>
      <p className="subtitle">{cardioTitles[workout.activity]} · {workout.mainMinutes} мин</p>
      <div className="workout-card workout-step">{timerView('ТАЙМЕР ЗАНЯТИЯ')}
        <button className="primary" onClick={() => finishMain(workout)} disabled={left === workout.seconds}>
          {endLabel} <Icon name="check"/>
        </button>
      </div>
    </> : <>
      <p className="subtitle">Основная часть · ориентир {workout.mainMinutes} мин</p>
      <WorkoutPlan workout={workout} update={update} choose={choose}/>
      {workout.timer ? <div className="workout-card workout-step">{timerView('ОТДЫХ МЕЖДУ ПОДХОДАМИ')}
        <button className="primary" onClick={() => choose(workout.selected ?? workout.plan.findIndex(isPending))}>
          Следующий подход <Icon name="arrow"/>
        </button>
      </div> : workout.selected !== null
        ? <StrengthSet key={`${workout.plan[workout.selected].id}-${workout.plan[workout.selected].exercise}-${workout.sets.length}`}
            itemIndex={workout.selected} workout={workout} history={history} update={update} finish={finishMain}
            headingRef={exerciseHeading} endLabel={endLabel}/>
        : !workout.plan.some(isPending) && <div className="workout-card workout-step">
          {workout.sets.length > 0
            ? <button className="primary" onClick={() => finishMain(workout)}>{workout.cooldownMinutes ? endLabel : 'Сохранить занятие'} <Icon name="check"/></button>
            : <p className="subtitle">Все упражнения пропущены. Можно вернуться к карте или вернуть упражнение в план.</p>}
        </div>}
    </>}
  </section>;
}

function StrengthSet({ workout, history, update, finish, itemIndex, headingRef, endLabel }: Props & {
  workout: StrengthWorkout;
  itemIndex: number;
  headingRef: React.Ref<HTMLHeadingElement>;
  endLabel: string;
}) {
  const item = workout.plan[itemIndex];
  const id = item.exercise;
  const exercise = exercises[id];
  const canAddWeight = exercise.weighted && workout.equipment.includes('dumbbells');
  const finalSet = item.completed + 1 === item.target && workout.plan.filter(isPending).length === 1;
  const prior = [...workout.sets].reverse().find(set => set.exercise === id && set.weight !== null)
    ?? [...history].reverse().flatMap(entry => [...entry.sets].reverse()).find(set => set.exercise === id && set.weight !== null);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const number = (name: string) => data.get(name) === '' ? null : Number(data.get(name));
    const updated = recordSet(workout, { weight: canAddWeight ? number('weight') : null, reps: number('reps') });
    if (finalSet) finish(updated);
    else update(updated);
  }

  return <>
    <div className="workout-card workout-step">
      <p className="eyebrow">ПОДХОД {item.completed + 1} ИЗ {item.target}</p>
      <h2 tabIndex={-1} ref={headingRef}>{exercise.title}</h2><Demonstration exercise={exercise}/>
      {exercise.gifId && <WorkoutGif id={exercise.gifId} title={exercise.title}/>}
      <ul className="cues">{exercise.cues.map(cue => <li key={cue}>{cue}</li>)}</ul>
      {exercise.reference && <a className="reference" href={exercise.reference} target="_blank" rel="noreferrer">Техника подробно ↗</a>}
      <form onSubmit={submit}>
        <div className="fields">
          {canAddWeight && <label>Вес одной гантели, кг<input name="weight" type="number" inputMode="decimal" min="0" step="any" placeholder={String(prior?.weight ?? 0)}/></label>}
          <label>Повторы{exercise.perSide ? ' на сторону' : ''}<input name="reps" type="number" inputMode="numeric" min="1" step="1" placeholder="8"/></label>
        </div>
        <p className="hint">Ориентир — 8 повторов. {prior ? `Прошлый вес: ${prior.weight} кг.` : 'Можно записать фактический результат или оставить поля пустыми.'}</p>
        <button className="primary" type="submit">{finalSet ? endLabel : 'Записать подход'} <Icon name="check"/></button>
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
