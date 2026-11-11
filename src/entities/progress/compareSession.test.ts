import { expect, it } from 'vitest';
import { compareSession } from './compareSession';
import type { Session } from './model';

it('compares real sets with the previous workout, excluding later entries', () => {
  const session: Session = {
    round: 0,
    stop: 2,
    date: 20,
    short: false,
    elapsed: null,
    sets: [
      { exercise: 'squat', weight: 10, reps: 9 },
      { exercise: 'squat', weight: 12, reps: 5 },
    ],
  };
  const previous = { ...session, date: 10, stop: 0 };
  expect(compareSession(session, [{ ...session, date: 30 }, previous, session])).toEqual([
    { exercise: 'squat', previous: previous.sets[1], current: session.sets[1] },
  ]);
});
