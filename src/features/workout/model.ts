import { route, type ExerciseId } from '../../entities/program';
import type { Session, SetRecord } from '../../entities/progress';

interface Timer {
  remaining: number;
  end: number | null;
}

interface WorkoutInfo {
  index: number;
  round: number;
  short: boolean;
}

export type Workout = WorkoutInfo & (
  | { kind: 'strength'; moves: ExerciseId[]; sets: SetRecord[]; timer: Timer | null }
  | { kind: 'cardio'; seconds: number; timer: Timer }
);

export function createWorkout(index: number, round: number, short: boolean): Workout {
  const stop = route[index];
  const info = { index, round, short };
  if (stop.icon === 'cardio') {
    const seconds = (short ? stop.shortMinutes : stop.minutes) * 60;
    return { ...info, kind: 'cardio', seconds, timer: { remaining: seconds, end: null } };
  }
  const moves = (short ? stop.moves.slice(0, 2) : stop.moves).flatMap(exercise =>
    Array<ExerciseId>(short ? 1 : stop.sets).fill(exercise));
  return { ...info, kind: 'strength', moves, sets: [], timer: null };
}

export function remaining(timer: Timer, now: number) {
  return timer.end === null ? timer.remaining : Math.min(timer.remaining, Math.max(0, Math.ceil((timer.end - now) / 1000)));
}

export function toggleTimer(timer: Timer, now: number): Timer {
  const left = remaining(timer, now);
  return { remaining: left, end: timer.end === null && left > 0 ? now + left * 1000 : null };
}

export function recordSet(workout: Extract<Workout, { kind: 'strength' }>, set: SetRecord): Workout {
  return { ...workout, sets: [...workout.sets, set], timer: { remaining: 60, end: Date.now() + 60000 } };
}

export function summarize(workout: Workout): Session {
  const date = Date.now();
  return {
    date, stop: workout.index, round: workout.round, short: workout.short,
    sets: workout.kind === 'strength' ? workout.sets : [],
    elapsed: workout.kind === 'cardio' ? workout.seconds - remaining(workout.timer, date) : null
  };
}
