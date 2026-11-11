import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import type { Progress } from '../../entities/progress';
import { readWorkoutDraft, saveWorkoutDraft, syncWorkoutDraft, workoutDraftKey } from './draft';
import {
  createWorkout,
  moveExercise,
  recordSet,
  replaceExercise,
  selectExercise,
  summarize,
} from './model';

const progress: Progress = { version: 1, round: 0, sessions: [] };

beforeEach(() => {
  const values = new Map<string, string>();
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
    removeItem: (key: string) => values.delete(key),
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
    timer: { end: recorded.timer?.end, remaining: 60 },
  });
});

it('ignores a draft once the session is saved, and removes a discarded draft', () => {
  const workout = createWorkout(0, 0, false);
  saveWorkoutDraft(workout);
  expect(readWorkoutDraft({ ...progress, sessions: [summarize(workout)] })).toBeNull();
  expect(saveWorkoutDraft(null)).toBe(true);
  expect(readWorkoutDraft(progress)).toBeNull();
});

it.each([
  { selected: 99 },
  { selected: -1 },
  { plan: [{ id: 0, exercise: 'unknown', target: 1, completed: 0, skipped: false }] },
  { timer: { remaining: '60', end: null } },
  { block: { type: 'warmup', timer: null } },
  { equipment: null },
  { sets: [{ exercise: 'squat', weight: '4', reps: 8 }] },
])('ignores a malformed strength draft with %j', (overrides) => {
  const workout = createWorkout(0, 0, false);
  localStorage.setItem(workoutDraftKey, JSON.stringify({ ...workout, ...overrides }));
  expect(readWorkoutDraft(progress)).toBeNull();
});

it('restores a valid cardio draft and rejects an invalid cardio timer', () => {
  const cardioProgress = { ...progress, sessions: [summarize(createWorkout(0, 0, false))] };
  const workout = createWorkout(1, 0, false);
  saveWorkoutDraft(workout);
  expect(readWorkoutDraft(cardioProgress)).toEqual(workout);
  localStorage.setItem(workoutDraftKey, JSON.stringify({ ...workout, timer: { remaining: 20 } }));
  expect(readWorkoutDraft(cardioProgress)).toBeNull();
});

it('preserves a locally recorded set if writing the draft failed', () => {
  const saved = createWorkout(0, 0, false);
  if (saved.kind !== 'strength') throw new Error('Expected a strength workout');
  const workout = recordSet(saved, { weight: 4, reps: 8 });
  const current = { workout, saveFailed: false };
  const unsaved = { workout, saveFailed: true };
  const updatedPreferences = {
    ...progress,
    preferences: { level: 'basic', minutes: 20, warmup: false, cooldown: false },
  } satisfies Progress;

  expect(syncWorkoutDraft(unsaved, saved, updatedPreferences, false)).toBe(unsaved);
  expect(syncWorkoutDraft(unsaved, saved, updatedPreferences, true)).toBe(unsaved);
  expect(syncWorkoutDraft(current, saved, updatedPreferences, false)).toBe(current);
  expect(syncWorkoutDraft(current, saved, updatedPreferences, true).workout).toBe(saved);

  const updatedHistory = { ...progress, sessions: [summarize(workout)] };
  expect(syncWorkoutDraft(current, null, updatedHistory, false).workout).toBeNull();
});
