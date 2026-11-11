import { route } from '../../entities/program';
import { nextStop, type Progress } from '../../entities/progress';
import type { Workout } from './model';

export const workoutDraftKey = 'tropa-workout-draft-v1';

export function readWorkoutDraft(progress: Progress): Workout | null {
  try {
    const draft = JSON.parse(localStorage.getItem(workoutDraftKey) ?? 'null') as Workout | null;
    if (!draft || !Number.isFinite(draft.startedAt) || draft.round !== progress.round
        || draft.index !== nextStop(progress, route.length)) return null;
    const stop = route[draft.index];
    if (stop.icon === 'cardio') return draft.kind === 'cardio' && draft.timer ? draft : null;
    return draft.kind === 'strength' && Array.isArray(draft.plan) && Array.isArray(draft.sets) ? draft : null;
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
