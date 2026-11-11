import { useEffect, useRef, useState } from 'react';
import {
  blockActivityLabel,
  cardioTitles,
  route,
  workoutBlockTitles,
} from '../../entities/program';
import type { Session } from '../../entities/progress';
import {
  finishWarmup,
  isPending,
  remaining,
  selectExercise,
  startCooldown,
  toggleTimer,
  type Workout,
} from '../../features/workout';
import { Icon } from '../../shared/ui/Icon';
import { StrengthSet } from './StrengthSet';
import { StretchingInstructions } from './StretchingInstructions';
import { Timer } from './Timer';
import { WorkoutPlan } from './WorkoutPlan';
import ui from '../../shared/ui/Common.module.css';
import styles from './Workout.module.css';

const walkingInstructions = {
  warmup: 'Начни с лёгкой ходьбы на месте.',
  cooldown: 'Постепенно сбавь темп и закончи спокойной ходьбой.',
};

interface Props {
  workout: Workout;
  totalStops: number;
  history: Session[];
  update: (workout: Workout) => void;
  finish: (workout: Workout) => void;
}

export function WorkoutPage({
  workout,
  totalStops,
  history,
  update,
  finish,
  discard,
}: Props & { discard: () => void }) {
  const [now, setNow] = useState(Date.now);
  const exerciseHeading = useRef<HTMLHeadingElement>(null);
  const focusExercise = useRef(false);
  const timer = workout.block?.timer ?? workout.timer;
  useEffect(() => {
    if (!timer || timer.end === null) return;
    let displayedSeconds: number | undefined;
    const tick = () => {
      const timestamp = Date.now();
      const seconds = remaining(timer, timestamp);
      if (seconds !== displayedSeconds) {
        displayedSeconds = seconds;
        setNow(timestamp);
      }
      if (seconds === 0) window.clearInterval(interval);
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
  const timerView = (label: string) => (
    <Timer seconds={left} running={timer?.end != null} label={label} toggle={toggle} />
  );
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
  const blockActivity = workout.block?.activity ?? 'walking';
  const endLabel = workout.cooldownMinutes ? 'Перейти к заминке' : 'Завершить занятие';

  return (
    <section className={ui.narrow}>
      <a className={ui.back} href="#map">
        ← К карте
      </a>
      <p className={ui.eyebrow}>
        ОСТАНОВКА {workout.index + 1} / {totalStops}
      </p>
      <h1 tabIndex={-1}>
        {stop.title}
        <span>.</span>
      </h1>
      {workout.block ? (
        <div className={styles.step} key={workout.block.type}>
          <h2>{workoutBlockTitles[workout.block.type]}</h2>
          <p className={styles.stepDescription}>
            {blockActivityLabel(workout.block.type, blockActivity)}
            {blockActivity === 'walking' && `. ${walkingInstructions[workout.block.type]}`}
          </p>
          {blockActivity === 'stretching' && (
            <StretchingInstructions workout={workout} type={workout.block.type} />
          )}
          {timerView(warmup ? 'ТАЙМЕР РАЗМИНКИ' : 'ТАЙМЕР ЗАМИНКИ')}
          <button
            className={styles.stepAction}
            onClick={() => (warmup ? update(finishWarmup(workout)) : finish(workout))}
          >
            {warmup ? 'К основной части' : 'Сохранить занятие'}{' '}
            <Icon name={warmup ? 'arrow' : 'check'} />
          </button>
        </div>
      ) : workout.kind === 'cardio' ? (
        <>
          <p className={ui.subtitle}>
            {cardioTitles[workout.activity]} · {workout.mainMinutes} мин
          </p>
          <div className={styles.step}>
            {timerView('ТАЙМЕР ЗАНЯТИЯ')}
            <button
              className={styles.stepAction}
              onClick={() => finishMain(workout)}
              disabled={left === workout.seconds}
            >
              {endLabel} <Icon name="check" />
            </button>
          </div>
        </>
      ) : (
        <>
          <p className={ui.subtitle}>Основная часть · ориентир {workout.mainMinutes} мин</p>
          <WorkoutPlan workout={workout} update={update} choose={choose} />
          {workout.timer ? (
            <div className={styles.step}>
              {timerView('ОТДЫХ МЕЖДУ ПОДХОДАМИ')}
              <button
                className={styles.stepAction}
                onClick={() => choose(workout.selected ?? workout.plan.findIndex(isPending))}
              >
                Следующий подход <Icon name="arrow" />
              </button>
            </div>
          ) : workout.selected !== null ? (
            <StrengthSet
              key={`${workout.plan[workout.selected].id}-${workout.plan[workout.selected].exercise}-${workout.sets.length}`}
              itemIndex={workout.selected}
              workout={workout}
              history={history}
              update={update}
              finish={finishMain}
              headingRef={exerciseHeading}
              endLabel={endLabel}
            />
          ) : (
            !workout.plan.some(isPending) && (
              <div className={styles.step}>
                {workout.sets.length > 0 ? (
                  <button className={styles.stepAction} onClick={() => finishMain(workout)}>
                    {workout.cooldownMinutes ? endLabel : 'Сохранить занятие'} <Icon name="check" />
                  </button>
                ) : (
                  <p className={styles.stepDescription}>
                    Все упражнения пропущены. Можно вернуть упражнение в план или сбросить занятие.
                  </p>
                )}
              </div>
            )
          )}
        </>
      )}
      <div className={styles.workoutExit}>
        {!workout.block &&
          workout.kind === 'strength' &&
          workout.sets.length > 0 &&
          workout.plan.some(isPending) && (
            <button type="button" className={ui.secondary} onClick={() => finishMain(workout)}>
              {workout.cooldownMinutes ? endLabel : 'Закончить и сохранить'}
            </button>
          )}
        <button
          type="button"
          className={ui.secondary}
          onClick={() => {
            if (window.confirm('Сбросить это занятие? Записанные в нём подходы будут удалены.'))
              discard();
          }}
        >
          Сбросить занятие
        </button>
      </div>
    </section>
  );
}
