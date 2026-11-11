import {
  cardioTitles,
  exercises,
  homeEquipment,
  route,
  type ExerciseId,
} from '../../entities/program';
import { nextStop, type Progress, type SetRecord } from '../../entities/progress';
import { isPending, type PlanExercise, type Workout } from './model';

export const workoutDraftKey = 'tropa-workout-draft-v1';

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

function isCurrentWorkoutDraft(draft: Workout, progress: Progress): boolean {
  return (
    isCount(draft.index) &&
    draft.round === progress.round &&
    draft.index === nextStop(progress, route.length)
  );
}

function isWorkoutDraft(value: unknown): value is Workout {
  if (
    !isRecord(value) ||
    !isCount(value.index) ||
    !isCount(value.round) ||
    !isCount(value.startedAt) ||
    !isCount(value.mainMinutes) ||
    !isCount(value.cooldownMinutes) ||
    typeof value.short !== 'boolean'
  )
    return false;
  const { block } = value;
  if (
    block !== null &&
    (!isRecord(block) ||
      (block.type !== 'warmup' && block.type !== 'cooldown') ||
      !isTimer(block.timer))
  )
    return false;

  const stop = route[value.index];
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

  const { plan, selected, sets, timer, restSeconds, equipment } = value;
  if (
    !Array.isArray(plan) ||
    !plan.length ||
    !plan.every(isPlanExercise) ||
    new Set(plan.map((item) => item.id)).size !== plan.length ||
    !Array.isArray(sets) ||
    !sets.every(isSetRecord) ||
    !isCount(restSeconds) ||
    !Array.isArray(equipment) ||
    !equipment.every((item) => homeEquipment.some((known) => known === item)) ||
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
