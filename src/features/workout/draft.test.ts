import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { defaultPreferences } from '../../entities/program';
import { saveProgress, type Progress } from '../../entities/progress';
import {
  clearFreeStrengthDraft,
  freeStrengthDraftKey,
  readFreeStrengthDraft,
  readWorkoutDraft,
  saveFreeStrengthDraft,
  saveWorkoutDraft,
  syncWorkoutDraft,
  workoutDraftKey,
} from './draft';
import {
  createWorkout,
  moveExercise,
  recordSet,
  replaceExercise,
  selectExercise,
  startCooldown,
  summarize,
  undoLastSet,
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

it('corrects the last set after reordering and keeps the correction through reloads', () => {
  const workout = createWorkout(0, 0, false);
  if (workout.kind !== 'strength') throw new Error('Expected a strength workout');
  const original = workout.plan[0];
  const first = recordSet(workout, { weight: 5, reps: 8 });
  const second = recordSet(selectExercise(first, 1), { weight: null, reps: 10 });
  const reordered = moveExercise(second, 1, 0);
  saveWorkoutDraft(reordered);

  const resumed = readWorkoutDraft(progress);
  if (resumed?.kind !== 'strength') throw new Error('Expected a saved strength workout');
  const correction = undoLastSet(resumed);
  expect(correction.timer).toBeNull();
  expect(correction.selected).toBe(0);
  expect(correction.plan[0]).toMatchObject({ id: second.plan[1].id, completed: 0 });
  expect(correction.plan[1]).toMatchObject({ id: original.id, completed: 1 });
  expect(correction.sets).toEqual(first.sets);
  expect(undoLastSet(correction)).toBe(correction);
  saveWorkoutDraft(correction);

  const reopened = readWorkoutDraft(progress);
  if (reopened?.kind !== 'strength') throw new Error('Expected an editable strength workout');
  expect(reopened.setCorrection?.values).toMatchObject({ weight: null, reps: 10 });
  expect(recordSet(reopened, { weight: 7.5, reps: 9 }).sets).toEqual([
    ...first.sets,
    { exercise: second.plan[1].exercise, weight: 7.5, reps: 9 },
  ]);
});

const freeDraft = {
  id: '7cb4ba2b-88dd-4e05-8d7b-df310d61e0d1',
  sets: [{ exercise: 'squat', weight: 8, reps: 10 }],
  minutes: '25',
} as const;

it('restores a free strength draft independently and keeps it on a mismatched clear', () => {
  const draft = { ...freeDraft, sets: [...freeDraft.sets] };
  saveWorkoutDraft(createWorkout(0, 0, false));
  expect(saveFreeStrengthDraft(draft)).toBe(true);
  clearFreeStrengthDraft('another-draft');
  expect(readFreeStrengthDraft()).toEqual(draft);
  clearFreeStrengthDraft(draft.id);
  expect(readFreeStrengthDraft()).toBeNull();
  expect(readWorkoutDraft(progress)).not.toBeNull();
});

it('does not restore a completed free session if its draft is still in storage', () => {
  const draft = { ...freeDraft, sets: [...freeDraft.sets] };
  saveFreeStrengthDraft(draft);
  saveProgress({
    ...progress,
    sessions: [
      {
        freeId: draft.id,
        date: Date.now(),
        stop: 0,
        round: 0,
        short: false,
        sets: draft.sets,
        elapsed: null,
        durationSeconds: 1500,
      },
    ],
  });
  expect(localStorage.getItem(freeStrengthDraftKey)).not.toBeNull();
  expect(readFreeStrengthDraft()).toBeNull();
});

it('ignores damaged free drafts and removes empty ones', () => {
  localStorage.setItem(freeStrengthDraftKey, '{');
  expect(readFreeStrengthDraft()).toBeNull();
  expect(saveFreeStrengthDraft({ id: freeDraft.id, sets: [], minutes: '' })).toBe(true);
  expect(localStorage.getItem(freeStrengthDraftKey)).toBeNull();
});

it('resumes a Kinetic plan with stretching options and recorded sets', () => {
  const workout = createWorkout(0, 0, true, {
    ...defaultPreferences,
    muscleGroups: ['Спина'],
    warmup: true,
    warmupActivity: 'stretching',
    cooldown: true,
    cooldownActivity: 'stretching',
  });
  if (workout.kind !== 'strength') throw new Error('Expected a strength workout');
  saveWorkoutDraft(workout);
  expect(readWorkoutDraft(progress)?.block).toMatchObject({
    type: 'warmup',
    activity: 'stretching',
    timer: { remaining: 300 },
  });

  const completed = recordSet({ ...workout, block: null }, { weight: null, reps: 8 });
  saveWorkoutDraft(completed);
  const resumed = readWorkoutDraft(progress);
  if (!resumed) throw new Error('Expected a saved workout');
  expect(startCooldown(resumed)?.block).toMatchObject({
    type: 'cooldown',
    activity: 'stretching',
    timer: { remaining: 300 },
  });
  expect(summarize(resumed).sets).toEqual([
    { exercise: expect.stringMatching(/^kinetic:/), weight: null, reps: 8 },
  ]);
});

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

it('restores one note per exercise and includes it in the saved session', () => {
  const workout = createWorkout(0, 0, false);
  if (workout.kind !== 'strength') throw new Error('Expected a strength workout');
  const first = recordSet(workout, { weight: 8, reps: 8 }, 'Первый подход с опорой');
  const second = recordSet(
    selectExercise(first, 0),
    { weight: 8, reps: 9 },
    'Оба подхода с опорой',
  );
  expect(saveWorkoutDraft(second)).toBe(true);
  const resumed = readWorkoutDraft(progress);
  if (!resumed) throw new Error('Expected a saved workout');
  expect(summarize(resumed).notes).toEqual([{ exercise: 'squat', text: 'Оба подхода с опорой' }]);
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

it('keeps the active stop after shortening the route', () => {
  const preferences = { ...defaultPreferences, weeklyGoal: 1, routeWeeks: 1 } as const;
  const sessions = Array.from({ length: 4 }, (_, index) =>
    summarize(createWorkout(index, 0, false)),
  );
  const active = createWorkout(4, 0, false);
  saveWorkoutDraft(active);
  expect(readWorkoutDraft({ ...progress, preferences, sessions })).toEqual(active);
  expect(readWorkoutDraft({ ...progress, preferences, sessions: sessions.slice(0, 2) })).toBeNull();
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
