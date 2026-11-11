import { localDay } from '../../shared/lib/calendarDates';
import {
  defaultPreferences,
  defaultWeeklyGoal,
  dumbbellWeeklyGoal,
  type ProgramId,
} from '../program/@x/progress';
import type { Progress, RouteCheckpoint } from './model';

export function programKey(program: ProgramId | undefined) {
  return program ?? 'home';
}

export function nextRoundNumber(progress: Progress) {
  const reserved = Object.values(progress.savedRoutes ?? {}).map(({ round }) => round);
  const last = progress.sessions.reduce(
    (round, session) => (session.freeId ? round : Math.max(round, session.round)),
    Math.max(progress.round, ...reserved),
  );
  return last + 1;
}

export function savedProgramRound(progress: Progress, program: ProgramId | undefined) {
  const checkpoint = progress.savedRoutes?.[programKey(program)];
  if (checkpoint || progress.savedRoutes) return checkpoint?.round;

  // Для старых версий ищем последний круг другой программы среди завершённых занятий.
  const legacy = progress.sessions.reduce((round, session) => {
    if (session.freeId || session.program !== program || session.round >= progress.round)
      return round;
    return Math.max(round, session.round);
  }, -1);
  return legacy === -1 ? undefined : legacy;
}

export function switchProgram(
  progress: Progress,
  program: ProgramId | undefined,
  now = Date.now(),
): Progress {
  const current = progress.preferences ?? defaultPreferences;
  if (current.program === program) return progress;
  const target = programKey(program);
  const checkpoint = progress.savedRoutes?.[target];
  const schedule = current.schedule;
  const goal = program ? dumbbellWeeklyGoal : (current.weeklyGoal ?? defaultWeeklyGoal);
  const active: RouteCheckpoint = {
    round: progress.round,
    ...(schedule && { schedule }),
    ...(progress.movedWorkout && { movedWorkout: progress.movedWorkout }),
  };
  const savedRoutes = { ...progress.savedRoutes, [programKey(current.program)]: active };
  delete savedRoutes[target];
  // Восстанавливаем даты прежнего круга вместе с остановками.
  const nextSchedule = checkpoint
    ? checkpoint.schedule
    : schedule?.days.length === goal
      ? { ...schedule, start: localDay(now) }
      : undefined;
  return {
    ...progress,
    round: savedProgramRound(progress, program) ?? nextRoundNumber(progress),
    savedRoutes,
    movedWorkout: checkpoint?.movedWorkout,
    preferences: { ...current, program, schedule: nextSchedule },
  };
}
