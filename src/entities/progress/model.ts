import {
  cardioTitles,
  defaultRouteWeeks,
  defaultWeeklyGoal,
  durations,
  homeEquipment,
  isBodyWeight,
  levels,
  muscleGroups,
  route,
  routeWeeks,
  weeklyGoals,
  type CardioActivity,
  type ExerciseId,
  type WorkoutPreferences,
} from '../program/@x/progress';

export const progressStorageKey = 'tropa-workouts-v1';

export interface SetRecord {
  exercise: ExerciseId;
  weight: number | null;
  reps: number | null;
}

export interface Session {
  stop: number;
  round: number;
  date: number;
  short: boolean;
  sets: SetRecord[];
  elapsed: number | null;
  cardioActivity?: CardioActivity;
  durationSeconds?: number;
  activeCaloriesPerKg?: number;
  bodyWeightKg?: number;
  skipped?: ExerciseId[];
  partial?: boolean;
}

export interface Progress {
  version: 1;
  round: number;
  sessions: Session[];
  preferences?: WorkoutPreferences;
}

export function previousExerciseSets(sessions: readonly Session[], exercise: ExerciseId) {
  for (let index = sessions.length - 1; index >= 0; index--) {
    const sets = sessions[index].sets.filter((set) => set.exercise === exercise);
    if (sets.some(({ weight, reps }) => weight !== null || reps !== null)) return sets;
  }
  return [];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isCount(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;
}

function isOneOf<T>(values: readonly T[], value: unknown): value is T {
  return values.some((item) => item === value);
}

function isKeyOf<T extends object>(values: T, value: unknown): value is keyof T {
  return typeof value === 'string' && Object.hasOwn(values, value);
}

function isSetRecord(value: unknown): value is SetRecord {
  // Keep old exercise IDs so that previous workouts still appear in history.
  if (!isRecord(value) || typeof value.exercise !== 'string' || !value.exercise) return false;
  const { reps, weight } = value;
  return (
    (reps === null || (isCount(reps) && reps > 0)) &&
    (weight === null || (typeof weight === 'number' && Number.isFinite(weight) && weight >= 0))
  );
}

function readSession(value: unknown): Session | null {
  if (!isRecord(value)) return null;
  const {
    stop,
    round,
    date,
    short,
    sets,
    elapsed,
    cardioActivity,
    durationSeconds,
    activeCaloriesPerKg,
    bodyWeightKg,
    skipped,
    partial,
  } = value;
  if (
    !isCount(stop) ||
    stop >= route.length ||
    !isCount(round) ||
    !isCount(date) ||
    !Number.isFinite(new Date(date).getTime()) ||
    typeof short !== 'boolean' ||
    !Array.isArray(sets) ||
    (elapsed !== null && !isCount(elapsed))
  )
    return null;

  return {
    stop,
    round,
    date,
    short,
    sets: sets.filter(isSetRecord),
    elapsed,
    ...(isKeyOf(cardioTitles, cardioActivity) && { cardioActivity }),
    ...(isCount(durationSeconds) && { durationSeconds }),
    ...(typeof activeCaloriesPerKg === 'number' &&
      Number.isFinite(activeCaloriesPerKg) &&
      activeCaloriesPerKg >= 0 && { activeCaloriesPerKg }),
    ...(isBodyWeight(bodyWeightKg) && { bodyWeightKg }),
    ...(Array.isArray(skipped) && {
      skipped: skipped.filter((item): item is ExerciseId => typeof item === 'string' && !!item),
    }),
    ...(typeof partial === 'boolean' && { partial }),
  };
}

function readPreferences(value: unknown): WorkoutPreferences | undefined {
  if (!isRecord(value)) return;
  const {
    level,
    minutes,
    warmup,
    cooldown,
    warmupActivity,
    cooldownActivity,
    weeklyGoal,
    routeWeeks: weeks,
    bodyWeightKg,
    equipment,
    muscleGroups: selected,
  } = value;
  if (
    !isKeyOf(levels, level) ||
    !isOneOf(durations, minutes) ||
    typeof warmup !== 'boolean' ||
    typeof cooldown !== 'boolean'
  )
    return;

  return {
    level,
    minutes,
    warmup,
    cooldown,
    ...(isOneOf(['walking', 'stretching'] as const, warmupActivity) && { warmupActivity }),
    ...(isOneOf(['walking', 'stretching'] as const, cooldownActivity) && { cooldownActivity }),
    ...(isOneOf(weeklyGoals, weeklyGoal) && { weeklyGoal }),
    ...(isOneOf(routeWeeks, weeks) && { routeWeeks: weeks }),
    ...(isBodyWeight(bodyWeightKg) && { bodyWeightKg }),
    ...(Array.isArray(equipment) && {
      equipment: equipment.filter((item) => isOneOf(homeEquipment, item)),
    }),
    ...(Array.isArray(selected) && {
      muscleGroups: selected.filter((item) => isOneOf(muscleGroups, item)),
    }),
  };
}

export function readProgress(): Progress {
  try {
    const saved: unknown = JSON.parse(localStorage.getItem(progressStorageKey) ?? 'null');
    if (
      isRecord(saved) &&
      saved.version === 1 &&
      isCount(saved.round) &&
      Array.isArray(saved.sessions)
    ) {
      const preferences = readPreferences(saved.preferences);
      const sessions = saved.sessions.map(readSession).filter((session) => session !== null);
      return { version: 1, round: saved.round, sessions, ...(preferences && { preferences }) };
    }
  } catch {
    // The route is still usable if browser storage is unavailable.
  }
  return { version: 1, round: 0, sessions: [] };
}

export function saveProgress(progress: Progress) {
  try {
    localStorage.setItem(progressStorageKey, JSON.stringify(progress));
    return true;
  } catch {
    return false;
  }
}

export function routeLength(progress: Progress, activeStop = -1) {
  const { weeklyGoal = defaultWeeklyGoal, routeWeeks: weeks = defaultRouteWeeks } =
    progress.preferences ?? {};
  // A shorter plan still includes the stops already completed or started in this round.
  return progress.sessions.reduce(
    (length, session) =>
      session.round === progress.round ? Math.max(length, session.stop + 1) : length,
    Math.max(weeklyGoal * weeks, activeStop + 1),
  );
}

export function nextStop(progress: Progress, totalStops: number) {
  return Array.from({ length: totalStops }).findIndex(
    (_, index) =>
      !progress.sessions.some((entry) => entry.round === progress.round && entry.stop === index),
  );
}

export function weekCount(sessions: Session[]) {
  const monday = new Date();
  monday.setHours(0, 0, 0, 0);
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
  return sessions.filter((entry) => entry.date >= monday.getTime()).length;
}

export function formatTime(seconds: number) {
  const value = Math.max(0, seconds);
  return `${String(Math.floor(value / 60)).padStart(2, '0')}:${String(value % 60).padStart(2, '0')}`;
}

export function estimatedCalories(session: Session) {
  if (session.activeCaloriesPerKg === undefined) return undefined;
  if (session.activeCaloriesPerKg === 0) return 0;
  if (session.bodyWeightKg === undefined) return undefined;
  return Math.round(session.activeCaloriesPerKg * session.bodyWeightKg);
}
