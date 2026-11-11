import { expect, it } from 'vitest';
import type { Session } from './model';
import { trainingReport, weeklyReport } from './trainingReport';

function workout(day: number, reps: number): Session {
  return {
    round: 0,
    stop: day,
    date: new Date(2026, 10, day, 12).getTime(),
    short: false,
    sets: [{ exercise: 'squat', weight: 8, reps }],
    elapsed: null,
  };
}

it('counts only the current week and compares recorded sets across the boundary', () => {
  const previous = workout(8, 8);
  const current = { ...workout(9, 10), durationSeconds: 1200 };
  const later = workout(16, 20);
  const report = weeklyReport([later, current, previous], new Date(2026, 10, 11).getTime());
  expect(report).toMatchObject({ workouts: 1, routeWorkouts: 1, seconds: 1200, sets: 1 });
  expect(report.changes[0]).toMatchObject({ previous: { reps: 8 }, current: { reps: 10 } });
  expect(trainingReport([current, previous])).toMatchObject({ workouts: 2, timedWorkouts: 1 });
});
