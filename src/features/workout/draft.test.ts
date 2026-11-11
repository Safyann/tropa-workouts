import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import type { Progress } from '../../entities/progress';
import { readWorkoutDraft, saveWorkoutDraft } from './draft';
import { createWorkout, moveExercise, recordSet, replaceExercise, selectExercise, summarize } from './model';

const progress: Progress = { version: 1, round: 0, sessions: [] };

beforeEach(() => {
  const values = new Map<string, string>();
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
    removeItem: (key: string) => values.delete(key)
  });
});

afterEach(() => vi.unstubAllGlobals());

it('restores recorded sets, timer, order and exercise replacement after reload', () => {
  const workout = createWorkout(0, 0, false);
  if (workout.kind !== 'strength') throw new Error('Expected a strength workout');
  const reordered = moveExercise(workout, 1, 0);
  const replaced = replaceExercise(reordered, 0, 'floorPress');
  const recorded = recordSet(selectExercise(replaced, 0), { weight: 4, reps: 8 });
  expect(saveWorkoutDraft(recorded)).toBe(true);
  expect(readWorkoutDraft(progress)).toMatchObject({
    selected: 0,
    plan: [{ exercise: 'floorPress' }, { exercise: 'squat' }, { exercise: 'row' }],
    sets: [{ exercise: 'floorPress', weight: 4, reps: 8 }],
    timer: { end: recorded.timer?.end, remaining: 60 }
  });
});

it('ignores a draft once the session is saved, and removes a discarded draft', () => {
  const workout = createWorkout(0, 0, false);
  saveWorkoutDraft(workout);
  expect(readWorkoutDraft({ ...progress, sessions: [summarize(workout)] })).toBeNull();
  expect(saveWorkoutDraft(null)).toBe(true);
  expect(readWorkoutDraft(progress)).toBeNull();
});
