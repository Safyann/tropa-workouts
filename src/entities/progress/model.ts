import {
  cardioTitles,
  defaultRouteWeeks,
  defaultWeeklyGoal,
  durations,
  homeEquipment,
  isBodyWeight,
  levels,
  muscleGroups,
  programRoute,
  route,
  routeWeeks,
  trainingWeekdays,
  weeklyGoals,
  type CardioActivity,
  type ExerciseId,
  type ProgramId,
  type WorkoutPreferences,
} from '../program/@x/progress';

export const progressStorageKey = 'tropa-workouts-v1';
export const effortLabels = { easy: 'Легко', normal: 'Нормально', hard: 'Тяжело' } as const;
export type Effort = keyof typeof effortLabels;

export interface SetRecord {
  exercise: ExerciseId;
  weight: number | null;
  reps: number | null;
}

export interface ExerciseNote {
  exercise: ExerciseId;
  text: string;
}

export const exerciseNoteLimit = 500;

export interface Session {
  stop: number;
  round: number;
  program?: ProgramId;
  roundTotal?: number;
  freeId?: string;
  date: number;
  originalDate?: number;
  short: boolean;
  sets: SetRecord[];
  notes?: ExerciseNote[];
  elapsed: number | null;
  cardioActivity?: CardioActivity;
  durationSeconds?: number;
  activeCaloriesPerKg?: number;
  bodyWeightKg?: number;
  skipped?: ExerciseId[];
  partial?: boolean;
  effort?: Effort;
}

export interface Progress {
  version: 1;
  round: number;
  sessions: Session[];
  preferences?: WorkoutPreferences;
  movedWorkout?: MovedWorkout;
  savedRoutes?: Partial<Record<'home' | ProgramId, RouteCheckpoint>>;
  templates?: WorkoutTemplate[];
}

interface MovedWorkout {
  round: number;
  stop: number;
  day: number;
}

export interface RouteCheckpoint {
  round: number;
  schedule?: WorkoutPreferences['schedule'];
  movedWorkout?: MovedWorkout;
}

export interface WorkoutTemplate {
  id: string;
  title: string;
  exercises: ExerciseId[];
}

export const workoutTemplateTitleLimit = 60;

export function isFreeSessionId(value: unknown): value is string {
  return typeof value === 'string' && /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(value);
}

export function sessionIdentity(session: Session) {
  // Свободным записям нужен отдельный ключ, чтобы они не занимали остановку маршрута.
  return session.freeId ? `free/${session.freeId}` : `${session.round}/${session.stop + 1}`;
}

export function sessionTitle(session: Session) {
  if (session.freeId) return session.elapsed === null ? 'Свободная тренировка' : 'Прогулка';
  return programRoute(session.program)[session.stop].title;
}

export function exerciseNote(notes: readonly ExerciseNote[] | undefined, exercise: ExerciseId) {
  return notes?.find((note) => note.exercise === exercise)?.text;
}

export function updateExerciseNotes(
  notes: readonly ExerciseNote[] | undefined,
  exercise: ExerciseId,
  value: string,
) {
  const text = value.trim().slice(0, exerciseNoteLimit);
  const others = (notes ?? []).filter((note) => note.exercise !== exercise);
  return text ? [...others, { exercise, text }] : others;
}

export function previousExerciseNote(sessions: readonly Session[], exercise: ExerciseId) {
  for (let index = sessions.length - 1; index >= 0; index--) {
    const note = exerciseNote(sessions[index].notes, exercise);
    if (note) return note;
  }
}

export function isExerciseNote(value: unknown): value is ExerciseNote {
  return (
    isRecord(value) &&
    typeof value.exercise === 'string' &&
    !!value.exercise &&
    typeof value.text === 'string' &&
    !!value.text.trim() &&
    value.text.length <= exerciseNoteLimit
  );
}

export function previousExerciseResult(sessions: readonly Session[], exercise: ExerciseId) {
  for (let index = sessions.length - 1; index >= 0; index--) {
    const session = sessions[index];
    const sets = session.sets.filter((set) => set.exercise === exercise);
    if (sets.some(({ weight, reps }) => weight !== null || reps !== null))
      return { sets, effort: session.effort };
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isCount(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;
}

function isTimestamp(value: unknown): value is number {
  return isCount(value) && Number.isFinite(new Date(value).getTime());
}

function isOneOf<T>(values: readonly T[], value: unknown): value is T {
  return values.some((item) => item === value);
}

function isKeyOf<T extends object>(values: T, value: unknown): value is keyof T {
  return typeof value === 'string' && Object.hasOwn(values, value);
}

function isSetRecord(value: unknown): value is SetRecord {
  // Сохраняем старые идентификаторы упражнений, чтобы записи оставались доступны в истории.
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
    program,
    roundTotal,
    freeId,
    date,
    originalDate,
    short,
    sets,
    notes,
    elapsed,
    cardioActivity,
    durationSeconds,
    activeCaloriesPerKg,
    bodyWeightKg,
    skipped,
    partial,
    effort,
  } = value;
  if (
    !isCount(stop) ||
    (program !== undefined && program !== 'dumbbell') ||
    stop >= programRoute(program).length ||
    (freeId !== undefined && !isFreeSessionId(freeId)) ||
    !isCount(round) ||
    !isTimestamp(date) ||
    typeof short !== 'boolean' ||
    !Array.isArray(sets) ||
    (elapsed !== null && !isCount(elapsed))
  )
    return null;

  return {
    stop,
    round,
    ...(program && { program }),
    ...(isCount(roundTotal) &&
      roundTotal >= 1 &&
      roundTotal <= programRoute(program).length && { roundTotal }),
    ...(freeId && { freeId }),
    date,
    ...(isTimestamp(originalDate) && { originalDate }),
    short,
    sets: sets.filter(isSetRecord),
    ...(Array.isArray(notes) && { notes: notes.filter(isExerciseNote) }),
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
    ...(isKeyOf(effortLabels, effort) && { effort }),
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
    program,
    schedule,
    restSound,
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

  const savedSchedule = readSchedule(schedule);
  return {
    level,
    minutes,
    warmup,
    cooldown,
    ...(isOneOf(['walking', 'stretching'] as const, warmupActivity) && { warmupActivity }),
    ...(isOneOf(['walking', 'stretching'] as const, cooldownActivity) && { cooldownActivity }),
    ...(isOneOf(weeklyGoals, weeklyGoal) && { weeklyGoal }),
    ...(isOneOf(routeWeeks, weeks) && { routeWeeks: weeks }),
    ...(program === 'dumbbell' && { program }),
    ...(savedSchedule && { schedule: savedSchedule }),
    ...(typeof restSound === 'boolean' && { restSound }),
    ...(isBodyWeight(bodyWeightKg) && { bodyWeightKg }),
    ...(Array.isArray(equipment) && {
      equipment: equipment.filter((item) => isOneOf(homeEquipment, item)),
    }),
    ...(Array.isArray(selected) && {
      muscleGroups: selected.filter((item) => isOneOf(muscleGroups, item)),
    }),
  };
}

function readSchedule(value: unknown): WorkoutPreferences['schedule'] {
  if (!isRecord(value) || !Array.isArray(value.days) || !isTimestamp(value.start)) return;
  const days: unknown[] = value.days;
  const trainingDays = trainingWeekdays.filter((day) => days.includes(day));
  if (trainingDays.length)
    return {
      days: trainingDays,
      start: value.start,
      ...(value.paused === true && { paused: true }),
    };
}

function readMovedWorkout(value: unknown, round: number): MovedWorkout | undefined {
  if (
    isRecord(value) &&
    value.round === round &&
    isCount(value.stop) &&
    value.stop < route.length &&
    isTimestamp(value.day)
  )
    return { round, stop: value.stop, day: value.day };
}

function readCheckpoint(value: unknown): RouteCheckpoint | undefined {
  if (!isRecord(value) || !isCount(value.round)) return;
  const schedule = readSchedule(value.schedule);
  const movedWorkout = readMovedWorkout(value.movedWorkout, value.round);
  return {
    round: value.round,
    ...(schedule && { schedule }),
    ...(movedWorkout && { movedWorkout }),
  };
}

function readTemplate(value: unknown): WorkoutTemplate | null {
  if (
    !isRecord(value) ||
    !isFreeSessionId(value.id) ||
    typeof value.title !== 'string' ||
    !Array.isArray(value.exercises)
  )
    return null;
  const title = value.title.trim().slice(0, workoutTemplateTitleLimit);
  const exercises = [
    ...new Set(value.exercises.filter((id): id is ExerciseId => typeof id === 'string' && !!id)),
  ];
  return title && exercises.length ? { id: value.id, title, exercises } : null;
}

export function parseProgress(data: string, strict = false): Progress | null {
  try {
    const saved: unknown = JSON.parse(data);
    if (
      isRecord(saved) &&
      saved.version === 1 &&
      isCount(saved.round) &&
      Array.isArray(saved.sessions)
    ) {
      const preferences = readPreferences(saved.preferences);
      const sessions = saved.sessions.map(readSession).filter((session) => session !== null);
      if (
        strict &&
        (sessions.length !== saved.sessions.length ||
          new Set(sessions.map(sessionIdentity)).size !== sessions.length ||
          saved.sessions.some(
            (session) =>
              !isRecord(session) ||
              !Array.isArray(session.sets) ||
              !session.sets.every(isSetRecord),
          ))
      )
        return null;
      const movedWorkout = readMovedWorkout(saved.movedWorkout, saved.round);
      const checkpoints = isRecord(saved.savedRoutes) ? saved.savedRoutes : {};
      const home = preferences?.program ? readCheckpoint(checkpoints.home) : undefined;
      const dumbbell = preferences?.program ? undefined : readCheckpoint(checkpoints.dumbbell);
      const savedRoutes = {
        ...(home && home.round !== saved.round && { home }),
        ...(dumbbell && dumbbell.round !== saved.round && { dumbbell }),
      };
      const templates = Array.isArray(saved.templates)
        ? [
            ...new Map(
              saved.templates
                .map(readTemplate)
                .filter((template) => template !== null)
                .map((template) => [template.id, template]),
            ).values(),
          ]
        : [];
      return {
        version: 1,
        round: saved.round,
        sessions,
        ...(preferences && { preferences }),
        ...(movedWorkout && { movedWorkout }),
        ...(Object.keys(savedRoutes).length > 0 && { savedRoutes }),
        ...(templates.length > 0 && { templates }),
      };
    }
  } catch {
    return null;
  }
  return null;
}

export function readProgress(): Progress {
  return readSavedProgress() ?? { version: 1, round: 0, sessions: [] };
}

export function readSavedProgress(): Progress | null {
  try {
    return parseProgress(localStorage.getItem(progressStorageKey) ?? '');
  } catch {
    return null;
  }
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
  const {
    weeklyGoal = defaultWeeklyGoal,
    routeWeeks: weeks = defaultRouteWeeks,
    program,
  } = progress.preferences ?? {};
  if (program) return programRoute(program).length;
  // При сокращении маршрута сохраняем завершённые и уже начатые остановки текущего круга.
  return progress.sessions.reduce(
    (length, session) =>
      !session.freeId && session.round === progress.round && !session.program
        ? Math.max(length, session.stop + 1)
        : length,
    Math.max(weeklyGoal * weeks, activeStop + 1),
  );
}

export function nextStop(progress: Progress, totalStops: number) {
  return Array.from({ length: totalStops }).findIndex(
    (_, index) =>
      !progress.sessions.some(
        (entry) =>
          !entry.freeId &&
          entry.program === progress.preferences?.program &&
          entry.round === progress.round &&
          entry.stop === index,
      ),
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

export function formatWeight(weight: number) {
  return `${String(weight).replace('.', ',')} кг`;
}

export function formatSet({ weight, reps }: SetRecord) {
  if (weight === null) return reps === null ? 'Без данных' : `${reps} повт.`;
  const load = formatWeight(weight);
  return reps === null ? load : `${load} × ${reps}`;
}

export function estimatedCalories(session: Session) {
  if (session.activeCaloriesPerKg === undefined) return undefined;
  if (session.activeCaloriesPerKg === 0) return 0;
  if (session.bodyWeightKg === undefined) return undefined;
  return Math.round(session.activeCaloriesPerKg * session.bodyWeightKg);
}
