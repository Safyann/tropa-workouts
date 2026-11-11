import { expect, it } from 'vitest';
import { createWorkout } from '../features/workout';
import { resolveRoute } from './route';

it('resolves a stop history link and falls back to the map for an invalid stop', () => {
  expect(resolveRoute('#history', null, 4)).toEqual({ page: 'history' });
  expect(resolveRoute('#history/4', null, 4)).toEqual({ page: 'history', stopIndex: 3 });
  expect(resolveRoute('#history/0', null, 4)).toEqual({ page: 'map' });
  expect(resolveRoute('#history/5', null, 4)).toEqual({ page: 'map' });
});

it('opens the workout screen when an active draft exists', () => {
  const workout = createWorkout(0, 0, false);
  expect(resolveRoute('#workout', workout, 4)).toEqual({ page: 'workout', workout });
  expect(resolveRoute('#workout', null, 4)).toEqual({ page: 'map' });
});
