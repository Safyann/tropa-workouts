import type { Workout } from '../features/workout';

export type AppRoute =
  | { page: 'map' | 'catalog' | 'settings' }
  | { page: 'workout'; workout: Workout }
  | { page: 'result'; round: number; stopIndex: number }
  | { page: 'history'; stopIndex?: number };

export function resolveRoute(hash: string, workout: Workout | null, stopCount: number): AppRoute {
  const path = hash.slice(1);
  switch (path) {
    case 'workout':
      return workout ? { page: 'workout', workout } : { page: 'map' };
    case 'catalog':
    case 'settings':
    case 'history':
      return { page: path };
  }

  const result = /^result\/(\d+)\/(\d+)$/.exec(path);
  if (result) {
    const round = Number(result[1]);
    const stopIndex = Number(result[2]) - 1;
    if (Number.isSafeInteger(round) && stopIndex >= 0 && stopIndex < stopCount) {
      return { page: 'result', round, stopIndex };
    }
  }

  const historyMatch = /^history\/(\d+)$/.exec(path);
  if (historyMatch) {
    const stopIndex = Number(historyMatch[1]) - 1;
    if (stopIndex >= 0 && stopIndex < stopCount) return { page: 'history', stopIndex };
  }
  return { page: 'map' };
}
