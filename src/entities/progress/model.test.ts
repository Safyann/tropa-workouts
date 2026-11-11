import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { nextStop, readProgress, saveProgress, weekCount, type Session } from './model';

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
