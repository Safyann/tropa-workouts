import { expect, it } from 'vitest';
import { nextStop, parseProgress, routeLength, type Progress } from './model';
import { nextRoundNumber, switchProgram } from './programProgress';

it('restores the previous round and schedule and reserves its number for later', () => {
  const original: Progress = {
    version: 1,
    round: 0,
    sessions: [{ date: 1000, round: 0, stop: 0, short: false, sets: [], elapsed: null }],
    preferences: {
      level: 'beginner',
      minutes: 20,
      warmup: false,
      cooldown: false,
      schedule: { days: [1, 3], start: 1000, paused: true },
    },
    movedWorkout: { round: 0, stop: 1, day: 2000 },
  };
  const switched = switchProgram(original, 'dumbbell', 10_000);
  expect(switched.round).toBe(1);
  expect(nextStop(switched, routeLength(switched))).toBe(0);
  const saved = parseProgress(JSON.stringify(switched));
  if (!saved) throw new Error('Expected saved progress');
  const back = switchProgram(saved, undefined);
  expect(back.round).toBe(0);
  expect(back.movedWorkout).toEqual(original.movedWorkout);
  expect(back.preferences?.schedule).toEqual(original.preferences?.schedule);
  expect(nextStop(back, routeLength(back))).toBe(1);
  expect(nextRoundNumber(back)).toBe(2);
  expect(switchProgram(back, 'dumbbell').round).toBe(1);
});

it('resumes a previously used program from history created before checkpoints', () => {
  const progress: Progress = {
    version: 1,
    round: 3,
    sessions: [
      { date: 1000, round: 2, program: 'dumbbell', stop: 0, short: false, sets: [], elapsed: null },
      { date: 2000, round: 5, program: 'dumbbell', stop: 1, short: false, sets: [], elapsed: null },
    ],
  };
  const resumed = switchProgram(progress, 'dumbbell');
  expect(resumed.round).toBe(2);
  expect(nextStop(resumed, routeLength(resumed))).toBe(1);
});
