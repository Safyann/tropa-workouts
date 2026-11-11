import { expect, it } from 'vitest';
import type { Progress } from './model';
import { plannedWorkouts } from './schedule';

const monday = new Date(2026, 10, 9).getTime();
const wednesday = new Date(2026, 10, 11).getTime();
const friday = new Date(2026, 10, 13).getTime();
const nextMonday = new Date(2026, 10, 16).getTime();
const nextWednesday = new Date(2026, 10, 18).getTime();

it('keeps route order when moving a workout and removes completed stops from the plan', () => {
  const progress: Progress = {
    version: 1,
    round: 0,
    sessions: [],
    preferences: {
      level: 'beginner',
      minutes: 20,
      warmup: false,
      cooldown: false,
      schedule: { start: monday, days: [1, 3] },
    },
  };
  expect(plannedWorkouts(progress).map(({ day }) => day)).toEqual([
    monday,
    wednesday,
    nextMonday,
    nextWednesday,
  ]);
  const moved = { ...progress, movedWorkout: { round: 0, stop: 0, day: friday } };
  expect(
    plannedWorkouts(moved)
      .slice(0, 3)
      .map(({ day }) => day),
  ).toEqual([friday, nextMonday, nextWednesday]);
  const completed = {
    ...moved,
    sessions: [{ date: friday, stop: 0, round: 0, short: false, sets: [], elapsed: null }],
  };
  expect(plannedWorkouts(completed)[0]).toEqual({ stop: 1, day: nextMonday });
});
