import {
  cardioActivity,
  defaultPreferences,
  exerciseAlternatives,
  defaultEquipment,
  optionalBlockMinutes,
  programRoute,
  strengthSchedule,
  workoutTiming,
  type CardioActivity,
  type ExerciseId,
  type HomeEquipment,
  type ProgramId,
  type WorkoutBlockActivity,
  type WorkoutBlockType,
} from '../../entities/program';
import type { Session, SetRecord } from '../../entities/progress';

interface Timer {
  remaining: number;
  end: number | null;
}

interface WorkoutInfo {
  index: number;
  program?: ProgramId;
  round: number;
  short: boolean;
  startedAt: number;
  mainMinutes: number;
  cooldownMinutes: number;
  cooldownActivity?: WorkoutBlockActivity;
  completedWarmup?: { activity: WorkoutBlockActivity; seconds: number };
  block: WorkoutBlock | null;
}

interface WorkoutBlock {
  type: WorkoutBlockType;
  activity?: WorkoutBlockActivity;
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

export type Workout =
  | StrengthWorkout
  | (WorkoutInfo & { kind: 'cardio'; activity: CardioActivity; seconds: number; timer: Timer });

export function createWorkout(
  index: number,
  round: number,
  short: boolean,
  preferences = defaultPreferences,
): Workout {
  const stop = programRoute(preferences.program)[index];
  const timing = workoutTiming(stop, short, preferences);
  const info: WorkoutInfo = {
    index,
    ...(preferences.program && { program: preferences.program }),
    round,
    short,
    startedAt: Date.now(),
    mainMinutes: timing.main,
    cooldownMinutes: timing.cooldown,
    cooldownActivity: preferences.cooldownActivity,
    block: timing.warmup ? makeBlock('warmup', timing.warmup, preferences.warmupActivity) : null,
  };
  if (stop.icon === 'cardio') {
    const seconds = timing.main * 60;
    return {
      ...info,
      kind: 'cardio',
      activity: cardioActivity(preferences.equipment),
      seconds,
      timer: { remaining: seconds, end: null },
    };
  }
  const schedule = strengthSchedule(stop, short, preferences);
  const plan = schedule.plan.map((item, id) => ({
    ...item,
    id,
    completed: 0,
    skipped: false,
  }));
  return {
    ...info,
    kind: 'strength',
    mainMinutes: schedule.estimatedMainMinutes ?? timing.main,
    plan,
    selected: 0,
    sets: [],
    timer: null,
    restSeconds: schedule.restSeconds,
    equipment: preferences.equipment ?? defaultEquipment,
  };
}

function makeBlock(
  type: WorkoutBlockType,
  minutes: number,
  activity: WorkoutBlockActivity = 'walking',
): WorkoutBlock {
  return { type, activity, timer: { remaining: minutes * 60, end: null } };
}

export function startCooldown(workout: Workout, now = Date.now()): Workout | null {
  if (!workout.cooldownMinutes || workout.block) return null;
  const block = makeBlock('cooldown', workout.cooldownMinutes, workout.cooldownActivity);
  if (workout.kind === 'cardio') {
    return { ...workout, block, timer: { remaining: remaining(workout.timer, now), end: null } };
  }
  return { ...workout, block, timer: null };
}

export function remaining(timer: Timer, now: number) {
  return timer.end === null
    ? timer.remaining
    : Math.min(timer.remaining, Math.max(0, Math.ceil((timer.end - now) / 1000)));
}

export function finishWarmup(workout: Workout, now = Date.now()): Workout {
  const { block } = workout;
  if (block?.type !== 'warmup') return workout;
  return {
    ...workout,
    block: null,
    completedWarmup: {
      activity: block.activity ?? 'walking',
      seconds: Math.max(0, optionalBlockMinutes * 60 - remaining(block.timer, now)),
    },
  };
}

export function toggleTimer(timer: Timer, now: number): Timer {
  const left = remaining(timer, now);
  return { remaining: left, end: timer.end === null && left > 0 ? now + left * 1000 : null };
}

export function extendRest(workout: StrengthWorkout, now = Date.now()): StrengthWorkout {
  const { timer, block } = workout;
  if (!timer || block) return workout;
  const seconds = remaining(timer, now) + 15;
  // Прибавка сохраняет паузу. Если запущенный таймер истёк, прибавка начинает новый отсчёт.
  return {
    ...workout,
    timer: { remaining: seconds, end: timer.end === null ? null : now + seconds * 1000 },
  };
}

export function isPending(item: PlanExercise) {
  return !item.skipped && item.completed < item.target;
}

export function isLastSet(workout: StrengthWorkout): boolean {
  const index = workout.selected;
  if (index === null || workout.timer || workout.block) return false;
  const item = workout.plan[index];
  return (
    !!item &&
    isPending(item) &&
    item.completed + 1 === item.target &&
    workout.plan.every((entry, position) => position === index || !isPending(entry))
  );
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
  return {
    ...workout,
    plan,
    selected: activeId === null ? null : plan.findIndex((item) => item.id === activeId),
  };
}

function updateExercise(workout: StrengthWorkout, index: number, item: PlanExercise) {
  return workout.plan.map((entry, position) => (position === index ? item : entry));
}

export function replaceExercise(
  workout: StrengthWorkout,
  index: number,
  alternative: ExerciseId,
): StrengthWorkout {
  const item = workout.plan[index];
  if (
    !item ||
    !isPending(item) ||
    !exerciseAlternatives(item.exercise, workout.equipment).includes(alternative)
  )
    return workout;
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

export function recordSet(
  workout: StrengthWorkout,
  values: Omit<SetRecord, 'exercise'>,
): StrengthWorkout {
  const index = workout.selected;
  if (index === null || workout.timer || workout.block) return workout;
  const item = workout.plan[index];
  if (!isPending(item)) return workout;
  const updated = { ...item, completed: item.completed + 1 };
  const plan = updateExercise(workout, index, updated);
  const selected = isPending(updated) ? index : null;
  const timer = isLastSet(workout)
    ? null
    : { remaining: workout.restSeconds, end: Date.now() + workout.restSeconds * 1000 };
  return {
    ...workout,
    plan,
    selected,
    sets: [...workout.sets, { ...values, exercise: item.exercise }],
    timer,
  };
}

// Коды активностей из Adult Compendium 2024 года: 02048, 02054, 02101 и 17152.
const activityMet = { elliptical: 5, strength: 3.5, stretching: 2.3, walking: 2.8 };
const activeSetSeconds = 40;

function activeCaloriesPerKg(met: number, seconds: number) {
  return ((met - 1) * seconds) / 3600;
}

export function summarize(workout: Workout, bodyWeightKg?: number): Session {
  const date = Date.now();
  const durationSeconds = Math.max(0, Math.floor((date - workout.startedAt) / 1000));
  const elapsed =
    workout.kind === 'cardio' ? workout.seconds - remaining(workout.timer, date) : null;
  const warmup = workout.completedWarmup;
  const cooldown = workout.block?.type === 'cooldown' ? workout.block : null;
  const cooldownSeconds = cooldown
    ? Math.max(0, workout.cooldownMinutes * 60 - remaining(cooldown.timer, date))
    : 0;
  const mainSeconds = Math.max(0, durationSeconds - (warmup?.seconds ?? 0) - cooldownSeconds);
  const strengthSeconds =
    workout.kind === 'strength' ? Math.min(mainSeconds, workout.sets.length * activeSetSeconds) : 0;
  const energy =
    activeCaloriesPerKg(activityMet[warmup?.activity ?? 'walking'], warmup?.seconds ?? 0) +
    activeCaloriesPerKg(activityMet[cooldown?.activity ?? 'walking'], cooldownSeconds) +
    (workout.kind === 'cardio'
      ? activeCaloriesPerKg(activityMet[workout.activity], elapsed ?? 0)
      : activeCaloriesPerKg(activityMet.strength, strengthSeconds));
  const skipped =
    workout.kind === 'strength'
      ? workout.plan.filter((item) => item.skipped).map((item) => item.exercise)
      : [];
  return {
    date,
    stop: workout.index,
    round: workout.round,
    ...(workout.program && { program: workout.program }),
    short: workout.short,
    durationSeconds,
    activeCaloriesPerKg: energy,
    ...(bodyWeightKg !== undefined && { bodyWeightKg }),
    sets: workout.kind === 'strength' ? workout.sets : [],
    elapsed,
    ...(workout.kind === 'cardio' ? { cardioActivity: workout.activity } : {}),
    ...(workout.kind === 'strength' && workout.plan.some(isPending) ? { partial: true } : {}),
    ...(skipped.length ? { skipped } : {}),
  };
}
