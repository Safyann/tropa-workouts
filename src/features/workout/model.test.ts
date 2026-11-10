import { afterEach, describe, expect, it, vi } from 'vitest';
import { createWorkout, recordSet, remaining, summarize, toggleTimer } from './model';

afterEach(() => vi.useRealTimers());

describe('workout', () => {
  it('uses one set each for two exercises in the short strength workout', () => {
    expect(createWorkout(0, 0, false)).toMatchObject({
      moves: ['squat', 'squat', 'press', 'press', 'row', 'row']
    });
    expect(createWorkout(0, 0, true)).toMatchObject({ moves: ['squat', 'press'] });
  });

  it('records the actual set and starts a 60-second rest', () => {
    vi.useFakeTimers();
    vi.setSystemTime(1_000);
    const workout = createWorkout(0, 1, true);
    if (workout.kind !== 'strength') throw new Error('Expected a strength workout');
    const set = { exercise: 'squat', weight: 5.5, reps: 8 } as const;
    const updated = recordSet(workout, set);

    expect(workout.sets).toEqual([]);
    expect(updated.timer).toEqual({ remaining: 60, end: 61_000 });
    expect(summarize(updated)).toEqual({
      date: 1_000, stop: 0, round: 1, short: true, sets: [set], elapsed: null
    });
  });

  it('pauses, resumes and finishes the cardio countdown', () => {
    const workout = createWorkout(1, 0, true);
    if (workout.kind !== 'cardio') throw new Error('Expected a cardio workout');
    expect(workout.seconds).toBe(300);
    const running = toggleTimer(workout.timer, 1_000);
    const paused = toggleTimer(running, 11_000);
    expect(remaining(paused, 20_000)).toBe(290);
    const resumed = toggleTimer(paused, 21_000);
    expect(remaining(resumed, 26_000)).toBe(285);
    expect(remaining(resumed, 400_000)).toBe(0);
  });

  it('stores time spent on cardio instead of its target duration', () => {
    vi.useFakeTimers();
    vi.setSystemTime(43_000);
    const workout = createWorkout(1, 0, false);
    if (workout.kind !== 'cardio') throw new Error('Expected a cardio workout');
    const timer = toggleTimer(workout.timer, 1_000);
    expect(summarize({ ...workout, timer }).elapsed).toBe(42);
  });
});
