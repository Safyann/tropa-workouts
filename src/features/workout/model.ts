import { cardioActivity, defaultPreferences, exerciseAlternatives, homeEquipment, levels, route, strengthPlan, workoutTiming, type CardioActivity, type ExerciseId, type HomeEquipment } from '../../entities/program';
import type { Session, SetRecord } from '../../entities/progress';

interface Timer {
  remaining: number;
  end: number | null;
}

interface WorkoutInfo {
  index: number;
  round: number;
  short: boolean;
  startedAt: number;
  mainMinutes: number;
  cooldownMinutes: number;
  block: WorkoutBlock | null;
}

interface WorkoutBlock {
  type: 'warmup' | 'cooldown';
  timer: Timer;
}

export interface PlanExercise {
  id: number;
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
  restSeconds: number;
  equipment: readonly HomeEquipment[];
};

export type Workout = StrengthWorkout | (WorkoutInfo & { kind: 'cardio'; activity: CardioActivity; seconds: number; timer: Timer });

export function createWorkout(index: number, round: number, short: boolean, preferences = defaultPreferences): Workout {
  const stop = route[index];
  const timing = workoutTiming(stop, short, preferences);
  const info: WorkoutInfo = {
    index, round, short,
    startedAt: Date.now(),
    mainMinutes: timing.main,
    cooldownMinutes: timing.cooldown,
    block: timing.warmup ? makeBlock('warmup', timing.warmup) : null
  };
  if (stop.icon === 'cardio') {
    const seconds = timing.main * 60;
    return { ...info, kind: 'cardio', activity: cardioActivity(preferences.equipment), seconds, timer: { remaining: seconds, end: null } };
  }
  const plan = strengthPlan(stop, short, preferences).map((item, id) => ({ ...item, id, completed: 0, skipped: false }));
  const restSeconds = levels[preferences.level].rest;
  return { ...info, kind: 'strength', plan, selected: 0, sets: [], timer: null, restSeconds, equipment: preferences.equipment ?? homeEquipment };
}

function makeBlock(type: WorkoutBlock['type'], minutes: number): WorkoutBlock {
  return { type, timer: { remaining: minutes * 60, end: null } };
}

export function startCooldown(workout: Workout, now = Date.now()): Workout | null {
  if (!workout.cooldownMinutes || workout.block) return null;
  const block = makeBlock('cooldown', workout.cooldownMinutes);
  if (workout.kind === 'cardio') {
    return { ...workout, block, timer: { remaining: remaining(workout.timer, now), end: null } };
  }
  return { ...workout, block, timer: null };
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

export function moveExercise(workout: StrengthWorkout, from: number, to: number): StrengthWorkout {
  if (!workout.plan[from] || !workout.plan[to] || from === to) return workout;
  const activeId = workout.selected === null ? null : workout.plan[workout.selected].id;
  const plan = [...workout.plan];
  const [moved] = plan.splice(from, 1);
  plan.splice(to, 0, moved);
  return { ...workout, plan, selected: activeId === null ? null : plan.findIndex(item => item.id === activeId) };
}

function updateExercise(workout: StrengthWorkout, index: number, item: PlanExercise) {
  return workout.plan.map((entry, position) => position === index ? item : entry);
}

export function replaceExercise(workout: StrengthWorkout, index: number, alternative: ExerciseId): StrengthWorkout {
  const item = workout.plan[index];
  if (!item || !isPending(item) || !exerciseAlternatives(item.exercise, workout.equipment).includes(alternative)) return workout;
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
  if (index === null || workout.timer || workout.block) return workout;
  const item = workout.plan[index];
  if (!isPending(item)) return workout;
  const updated = { ...item, completed: item.completed + 1 };
  const plan = updateExercise(workout, index, updated);
  const selected = isPending(updated) ? index : null;
  const timer = plan.some(isPending)
    ? { remaining: workout.restSeconds, end: Date.now() + workout.restSeconds * 1000 }
    : null;
  return { ...workout, plan, selected, sets: [...workout.sets, { ...values, exercise: item.exercise }], timer };
}

export function summarize(workout: Workout): Session {
  const date = Date.now();
  const skipped = workout.kind === 'strength' ? workout.plan.filter(item => item.skipped).map(item => item.exercise) : [];
  return {
    date, stop: workout.index, round: workout.round, short: workout.short,
    durationSeconds: Math.max(0, Math.floor((date - workout.startedAt) / 1000)),
    sets: workout.kind === 'strength' ? workout.sets : [],
    elapsed: workout.kind === 'cardio' ? workout.seconds - remaining(workout.timer, date) : null,
    ...(workout.kind === 'cardio' ? { cardioActivity: workout.activity } : {}),
    ...(skipped.length ? { skipped } : {})
  };
}
