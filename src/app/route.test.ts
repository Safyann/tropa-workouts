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

it('opens the public roadmap with or without an active workout', () => {
  expect(resolveRoute('#roadmap', null, 4)).toEqual({ page: 'roadmap' });
  expect(resolveRoute('#roadmap', createWorkout(0, 0, false), 4)).toEqual({ page: 'roadmap' });
});

it('opens each settings section and recovers an unknown section at the settings menu', () => {
  for (const section of ['workout', 'schedule', 'equipment', 'profile', 'data']) {
    expect(resolveRoute(`#settings/${section}`, null, 4)).toEqual({ page: 'settings', section });
  }
  expect(resolveRoute('#settings', null, 4)).toEqual({ page: 'settings' });
  expect(resolveRoute('#settings/unknown', null, 4)).toEqual({ page: 'settings' });
});

it('opens free workout results and dumbbell stop history by their own links', () => {
  const freeId = '00000000-0000-4000-8000-000000000001';
  expect(resolveRoute('#free', null, 28)).toEqual({ page: 'free' });
  expect(resolveRoute(`#result/free/${freeId}`, null, 28)).toEqual({ page: 'free-result', freeId });
  expect(resolveRoute('#history/dumbbell/8', null, 28)).toEqual({
    page: 'history',
    program: 'dumbbell',
    stopIndex: 7,
  });
  expect(resolveRoute('#history/dumbbell/9', null, 28)).toEqual({ page: 'map' });
});
