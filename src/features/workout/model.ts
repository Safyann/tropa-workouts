import { exerciseAlternatives, route, strengthPlan, type ExerciseId } from '../../entities/program';
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

export interface PlanExercise {
  exercise: ExerciseId;
  target: number;
  completed: number;
  skipped: boolean;
}

export type StrengthWorkout = WorkoutInfo & {
  kind: 'strength';
  plan: PlanExercise[];
  selected: number | null;
  sets: SetRecord[];
  timer: Timer | null;
};

export type Workout = StrengthWorkout | (WorkoutInfo & { kind: 'cardio'; seconds: number; timer: Timer });

export function createWorkout(index: number, round: number, short: boolean): Workout {
  const stop = route[index];
  const info = { index, round, short };
  if (stop.icon === 'cardio') {
    const seconds = (short ? stop.shortMinutes : stop.minutes) * 60;
    return { ...info, kind: 'cardio', seconds, timer: { remaining: seconds, end: null } };
  }
  const plan = strengthPlan(stop, short).map(item => ({ ...item, completed: 0, skipped: false }));
  return { ...info, kind: 'strength', plan, selected: 0, sets: [], timer: null };
}

export function remaining(timer: Timer, now: number) {
  return timer.end === null ? timer.remaining : Math.min(timer.remaining, Math.max(0, Math.ceil((timer.end - now) / 1000)));
}

export function toggleTimer(timer: Timer, now: number): Timer {
  const left = remaining(timer, now);
  return { remaining: left, end: timer.end === null && left > 0 ? now + left * 1000 : null };
}

export function isPending(item: PlanExercise) {
  return !item.skipped && item.completed < item.target;
}

export function selectExercise(workout: StrengthWorkout, index: number): StrengthWorkout {
  if (!workout.plan[index] || !isPending(workout.plan[index])) return workout;
  return { ...workout, selected: index, timer: null };
}

function updateExercise(workout: StrengthWorkout, index: number, item: PlanExercise) {
  return workout.plan.map((entry, position) => position === index ? item : entry);
}

export function replaceExercise(workout: StrengthWorkout, index: number, alternative: ExerciseId): StrengthWorkout {
  const item = workout.plan[index];
  if (!item || !isPending(item) || !exerciseAlternatives(item.exercise).includes(alternative)) return workout;
  return { ...workout, plan: updateExercise(workout, index, { ...item, exercise: alternative }) };
}

export function toggleSkip(workout: StrengthWorkout, index: number): StrengthWorkout {
  const item = workout.plan[index];
  if (!item || item.completed === item.target) return workout;
  const plan = updateExercise(workout, index, { ...item, skipped: !item.skipped });
  if (!plan.some(isPending)) return { ...workout, plan, selected: null, timer: null };
  if (workout.selected !== index) return { ...workout, plan };
  return { ...workout, plan, selected: null, timer: null };
}

export function recordSet(workout: StrengthWorkout, values: Omit<SetRecord, 'exercise'>): StrengthWorkout {
  const index = workout.selected;
  if (index === null || workout.timer) return workout;
  const item = workout.plan[index];
  if (!isPending(item)) return workout;
  const updated = { ...item, completed: item.completed + 1 };
  const plan = updateExercise(workout, index, updated);
  const selected = isPending(updated) ? index : null;
  const timer = plan.some(isPending) ? { remaining: 60, end: Date.now() + 60000 } : null;
  return { ...workout, plan, selected, sets: [...workout.sets, { ...values, exercise: item.exercise }], timer };
}

export function summarize(workout: Workout): Session {
  const date = Date.now();
  const skipped = workout.kind === 'strength' ? workout.plan.filter(item => item.skipped).map(item => item.exercise) : [];
  return {
    date, stop: workout.index, round: workout.round, short: workout.short,
    sets: workout.kind === 'strength' ? workout.sets : [],
    elapsed: workout.kind === 'cardio' ? workout.seconds - remaining(workout.timer, date) : null,
    ...(skipped.length ? { skipped } : {})
  };
}
