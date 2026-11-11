import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { route } from '../program/@x/progress';
import {
  nextStop,
  previousExerciseResult,
  progressStorageKey,
  readProgress,
  routeLength,
  saveProgress,
  weekCount,
  type Session,
} from './model';

function entry(stop: number, round = 0, date = 0): Session {
  return { date, stop, round, short: true, sets: [], elapsed: null };
}

beforeEach(() => {
  const data = new Map<string, string>();
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => data.set(key, value),
  });
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('progress', () => {
  it('uses the latest session with recorded values for the exercise', () => {
    const first = { exercise: 'squat', weight: 10, reps: 8 } as const;
    const last = { exercise: 'squat', weight: 0, reps: 9 } as const;
    const blank = { exercise: 'squat', weight: null, reps: null } as const;
    const other = { exercise: 'row', weight: 5, reps: 6 } as const;
    const sessions = [
      { ...entry(0), sets: [first] },
      { ...entry(2), sets: [last, other, blank] },
      { ...entry(0, 1), sets: [blank] },
    ];

    expect(previousExerciseResult(sessions, 'squat')?.sets).toEqual([last, blank]);
    expect(previousExerciseResult(sessions, 'row')?.sets).toEqual([other]);
    expect(previousExerciseResult(sessions, 'press')).toBeUndefined();
  });

  it('restores saved history and opens the next stop', () => {
    expect(nextStop(readProgress(), 4)).toBe(0);
    const progress = { version: 1, round: 0, sessions: [entry(0), entry(1)] } as const;
    expect(saveProgress({ ...progress, sessions: [...progress.sessions] })).toBe(true);
    const restored = readProgress();
    expect(restored).toEqual(progress);
    expect(nextStop(restored, 4)).toBe(2);
  });

  it('keeps previous sessions when a new round starts', () => {
    const sessions = Array.from({ length: 4 }, (_, index) => entry(index));
    expect(nextStop({ version: 1, round: 0, sessions }, 4)).toBe(-1);
    expect(nextStop({ version: 1, round: 1, sessions }, 4)).toBe(0);
  });

  it('sizes a round from weekly frequency and weeks without dropping completed stops', () => {
    const progress = readProgress();
    expect(routeLength(progress)).toBe(4);
    const preferences = {
      level: 'beginner',
      minutes: 20,
      warmup: false,
      cooldown: false,
      weeklyGoal: 7,
      routeWeeks: 4,
    } as const;
    saveProgress({ ...progress, preferences, sessions: [entry(27, 0)] });
    const restored = readProgress();
    expect(restored.preferences).toEqual(preferences);
    expect(restored.sessions).toHaveLength(1);
    expect(routeLength(restored)).toBe(route.length);
    expect(new Set(route.map(({ title }) => title)).size).toBe(28);

    const shortened = {
      ...restored,
      preferences: { ...preferences, weeklyGoal: 1, routeWeeks: 1 },
    } as const;
    expect(routeLength(shortened)).toBe(28);
    expect(routeLength({ ...shortened, round: 1 })).toBe(1);
  });

  it('restores valid history even when other sessions and sets are damaged', () => {
    const set = { exercise: 'retired-exercise', weight: 2.5, reps: 8 };
    localStorage.setItem(
      progressStorageKey,
      JSON.stringify({
        version: 1,
        round: 0,
        sessions: [
          null,
          { ...entry(0), sets: [null, set], skipped: 'squat' },
          { ...entry(1), stop: 99 },
          { ...entry(2), date: Number.MAX_SAFE_INTEGER },
        ],
        preferences: {
          level: 'beginner',
          minutes: 20,
          warmup: true,
          cooldown: false,
          equipment: 42,
        },
      }),
    );
    const progress = readProgress();
    expect(progress.sessions).toEqual([{ ...entry(0), sets: [set] }]);
    expect(progress.preferences).toEqual({
      level: 'beginner',
      minutes: 20,
      warmup: true,
      cooldown: false,
    });
    expect(nextStop(progress, 4)).toBe(1);
  });

  it('persists workout preferences alongside existing session history', () => {
    const previous = { ...readProgress(), sessions: [entry(0)] };
    saveProgress(previous);
    const preferences = {
      minutes: 60,
      level: 'experienced',
      warmup: true,
      cooldown: false,
      weeklyGoal: 3,
    } as const;
    expect(saveProgress({ ...readProgress(), preferences })).toBe(true);
    expect(readProgress()).toEqual({ ...previous, preferences });
  });

  it('counts sessions starting at local Monday midnight', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 10, 11, 12));
    const monday = new Date(2026, 10, 9).getTime();
    expect(weekCount([entry(0, 0, monday - 1), entry(1, 0, monday), entry(2, 0, monday + 1)])).toBe(
      2,
    );
  });

  it('falls back to an empty route when storage is blocked or corrupted', () => {
    localStorage.setItem('tropa-workouts-v1', 'broken JSON');
    expect(readProgress().sessions).toEqual([]);
    vi.stubGlobal('localStorage', {
      getItem: () => {
        throw new Error('blocked');
      },
      setItem: () => {
        throw new Error('blocked');
      },
    });
    expect(nextStop(readProgress(), 4)).toBe(0);
    expect(saveProgress(readProgress())).toBe(false);
  });
});
