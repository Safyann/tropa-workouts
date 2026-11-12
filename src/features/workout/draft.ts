import {
  cardioTitles,
  exercises,
  homeEquipment,
  programRoute,
  type ExerciseId,
} from '../../entities/program';
import {
  isExerciseNote,
  isFreeSessionId,
  nextStop,
  readSavedProgress,
  routeLength,
  type Progress,
  type SetRecord,
} from '../../entities/progress';
import { isPending, type PlanExercise, type Workout } from './model';

export const workoutDraftKey = 'tropa-workout-draft-v1';
export const freeStrengthDraftKey = 'tropa-free-strength-draft-v1';

export interface FreeStrengthDraft {
  id: string;
  sets: SetRecord[];
  minutes: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isCount(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;
}

function isExerciseId(value: unknown): value is ExerciseId {
  return typeof value === 'string' && Object.hasOwn(exercises, value);
}

function isTimer(value: unknown): boolean {
  return isRecord(value) && isCount(value.remaining) && (value.end === null || isCount(value.end));
}

function isOptionalBlockActivity(value: unknown) {
  return value === undefined || value === 'walking' || value === 'stretching';
}

function isCompletedWarmup(value: unknown) {
  return (
    value === undefined ||
    (isRecord(value) &&
      (value.activity === 'walking' || value.activity === 'stretching') &&
      isCount(value.seconds))
  );
}

function isPlanExercise(value: unknown): value is PlanExercise {
  return (
    isRecord(value) &&
    isCount(value.id) &&
    isExerciseId(value.exercise) &&
    isCount(value.target) &&
    value.target > 0 &&
    isCount(value.completed) &&
    value.completed <= value.target &&
    typeof value.skipped === 'boolean'
  );
}

function isSetRecord(value: unknown): value is SetRecord {
  return (
    isRecord(value) &&
    isExerciseId(value.exercise) &&
    (value.weight === null ||
      (typeof value.weight === 'number' && Number.isFinite(value.weight) && value.weight >= 0)) &&
    (value.reps === null || (isCount(value.reps) && value.reps > 0))
  );
}

export function readFreeStrengthDraft(): FreeStrengthDraft | null {
  try {
    const draft: unknown = JSON.parse(localStorage.getItem(freeStrengthDraftKey) ?? 'null');
    if (
      !isRecord(draft) ||
      typeof draft.id !== 'string' ||
      !isFreeSessionId(draft.id) ||
      !Array.isArray(draft.sets) ||
      !draft.sets.every(isSetRecord) ||
      typeof draft.minutes !== 'string' ||
      readSavedProgress()?.sessions.some(({ freeId }) => freeId === draft.id)
    )
      return null;
    return { id: draft.id, sets: draft.sets, minutes: draft.minutes };
  } catch {
    return null;
  }
}

export function saveFreeStrengthDraft(draft: FreeStrengthDraft): boolean {
  try {
    if (draft.sets.length || draft.minutes) {
      localStorage.setItem(freeStrengthDraftKey, JSON.stringify(draft));
    } else {
      localStorage.removeItem(freeStrengthDraftKey);
    }
    return true;
  } catch {
    return false;
  }
}

export function clearFreeStrengthDraft(id: string) {
  try {
    // Проверяем сырой черновик: после записи результата чтение черновика его уже скрывает.
    const draft: unknown = JSON.parse(localStorage.getItem(freeStrengthDraftKey) ?? 'null');
    if (isRecord(draft) && draft.id === id) localStorage.removeItem(freeStrengthDraftKey);
  } catch {
    // Сохранённый результат не позволит восстановить этот черновик.
  }
}

function isCurrentWorkoutDraft(draft: Workout, progress: Progress): boolean {
  // Пока черновик открыт, другая вкладка может завершить остановку или начать новый круг.
  return (
    isCount(draft.index) &&
    draft.round === progress.round &&
    draft.program === progress.preferences?.program &&
    draft.index === nextStop(progress, routeLength(progress, draft.index))
  );
}

function isWorkoutDraft(value: unknown): value is Workout {
  if (
    !isRecord(value) ||
    !isCount(value.index) ||
    (value.program !== undefined && value.program !== 'dumbbell') ||
    !isCount(value.round) ||
    !isCount(value.startedAt) ||
    !isCount(value.mainMinutes) ||
    !isCount(value.cooldownMinutes) ||
    !isOptionalBlockActivity(value.cooldownActivity) ||
    !isCompletedWarmup(value.completedWarmup) ||
    typeof value.short !== 'boolean'
  )
    return false;
  const { block } = value;
  if (
    block !== null &&
    (!isRecord(block) ||
      (block.type !== 'warmup' && block.type !== 'cooldown') ||
      !isOptionalBlockActivity(block.activity) ||
      !isTimer(block.timer))
  )
    return false;

  const stop = programRoute(value.program)[value.index];
  if (stop?.icon === 'cardio') {
    return (
      value.kind === 'cardio' &&
      typeof value.activity === 'string' &&
      Object.hasOwn(cardioTitles, value.activity) &&
      isCount(value.seconds) &&
      isTimer(value.timer)
    );
  }
  if (stop?.icon !== 'strength' || value.kind !== 'strength') return false;

  const { plan, selected, sets, notes, timer, restSeconds, equipment, setCorrection } = value;
  if (
    !Array.isArray(plan) ||
    !plan.length ||
    !plan.every(isPlanExercise) ||
    new Set(plan.map((item) => item.id)).size !== plan.length ||
    !Array.isArray(sets) ||
    !sets.every(isSetRecord) ||
    (notes !== undefined && (!Array.isArray(notes) || !notes.every(isExerciseNote))) ||
    !isCount(restSeconds) ||
    !Array.isArray(equipment) ||
    !equipment.every((item) => homeEquipment.some((known) => known === item)) ||
    (setCorrection !== undefined &&
      (!isRecord(setCorrection) ||
        !isCount(setCorrection.planId) ||
        (setCorrection.values !== undefined && !isSetRecord(setCorrection.values)))) ||
    (timer !== null && !isTimer(timer))
  )
    return false;
  if (selected === null) return timer === null || plan.some(isPending);
  return isCount(selected) && selected < plan.length && isPending(plan[selected]);
}

export function readWorkoutDraft(progress: Progress): Workout | null {
  try {
    const draft: unknown = JSON.parse(localStorage.getItem(workoutDraftKey) ?? 'null');
    return isWorkoutDraft(draft) && isCurrentWorkoutDraft(draft, progress) ? draft : null;
  } catch {
    return null;
  }
}

export function saveWorkoutDraft(workout: Workout | null): boolean {
  try {
    if (workout) localStorage.setItem(workoutDraftKey, JSON.stringify(workout));
    else localStorage.removeItem(workoutDraftKey);
    return true;
  } catch {
    return false;
  }
}

export interface WorkoutDraftState {
  workout: Workout | null;
  saveFailed: boolean;
}

export function syncWorkoutDraft(
  current: WorkoutDraftState,
  saved: Workout | null,
  progress: Progress,
  draftChanged: boolean,
): WorkoutDraftState {
  if (current.workout && current.saveFailed) return current;
  if (!draftChanged && current.workout && isCurrentWorkoutDraft(current.workout, progress))
    return current;
  return { workout: saved, saveFailed: false };
}
