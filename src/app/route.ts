import type { Workout } from '../features/workout';
import { isFreeSessionId } from '../entities/progress';
import { programRoute, type ProgramId } from '../entities/program';

export type AppRoute =
  | { page: 'map' | 'catalog' | 'roadmap' | 'settings' | 'free' }
  | { page: 'workout'; workout: Workout }
  | { page: 'result'; round: number; stopIndex: number }
  | { page: 'free-result'; freeId: string }
  | { page: 'history'; stopIndex?: number; program?: ProgramId };

export function resolveRoute(hash: string, workout: Workout | null, stopCount: number): AppRoute {
  // Ссылки с хешем работают в подкаталоге GitHub Pages без серверных перенаправлений.
  const path = hash.slice(1);
  switch (path) {
    case 'workout':
      return workout ? { page: 'workout', workout } : { page: 'map' };
    case 'catalog':
    case 'roadmap':
    case 'settings':
    case 'free':
    case 'history':
      return { page: path };
  }

  if (path.startsWith('result/free/')) {
    const freeId = path.slice('result/free/'.length);
    if (isFreeSessionId(freeId)) return { page: 'free-result', freeId };
  }

  const result = /^result\/(\d+)\/(\d+)$/.exec(path);
  if (result) {
    const round = Number(result[1]);
    const stopIndex = Number(result[2]) - 1;
    if (Number.isSafeInteger(round) && stopIndex >= 0 && stopIndex < stopCount) {
      return { page: 'result', round, stopIndex };
    }
  }

  const historyMatch = /^history\/(?:(dumbbell)\/)?(\d+)$/.exec(path);
  if (historyMatch) {
    const program = historyMatch[1] === 'dumbbell' ? 'dumbbell' : undefined;
    const stopIndex = Number(historyMatch[2]) - 1;
    if (stopIndex >= 0 && stopIndex < (program ? programRoute(program).length : stopCount))
      return { page: 'history', stopIndex, ...(program && { program }) };
  }
  return { page: 'map' };
}
