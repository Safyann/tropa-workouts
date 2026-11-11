import { expect, it } from 'vitest';
import { exerciseProgress } from './exerciseProgress';
import type { Session, SetRecord } from './model';

function session(date: number, sets: SetRecord[]): Session {
  return { date, sets, stop: 0, round: date, short: false, elapsed: null };
}

it('groups saved sets by exercise and shows the maxima per workout in date order', () => {
  const recent = session(2, [
    { exercise: 'squat', weight: 12, reps: 5 },
    { exercise: 'squat', weight: 10, reps: 9 },
    { exercise: 'wallPress', weight: null, reps: 7 },
  ]);
  const earlier = session(1, [
    { exercise: 'squat', weight: 0, reps: null },
    { exercise: 'row', weight: null, reps: null },
  ]);

  const progress = exerciseProgress([earlier, recent]);

  expect(progress.get('squat')).toEqual([
    { session: recent, weight: 12, reps: 9 },
    { session: earlier, weight: 0, reps: null },
  ]);
  expect(progress.get('wallPress')).toEqual([{ session: recent, weight: null, reps: 7 }]);
  expect(progress.has('row')).toBe(false);
});
