import { addDays, localDay } from '../../shared/lib/calendarDates';
import { routeLength, type Progress } from './model';

export interface PlannedWorkout {
  stop: number;
  day: number;
}

export function plannedWorkouts(progress: Progress, activeStop?: number): PlannedWorkout[] {
  const schedule = progress.preferences?.schedule;
  if (!schedule?.days.length) return [];

  const completed = progress.sessions.filter(({ round }) => round === progress.round);
  const completedStops = new Set(completed.map(({ stop }) => stop));
  const lastWorkout = completed.reduce((latest, { date }) => Math.max(latest, date), -1);
  const firstDayAfterWorkout = lastWorkout < 0 ? 0 : addDays(lastWorkout, 1);
  let cursor = Math.max(localDay(schedule.start), firstDayAfterWorkout);
  const moved = progress.movedWorkout;
  const planned: PlannedWorkout[] = [];
  const total = routeLength(progress, activeStop);

  for (let stop = 0; stop < total; stop++) {
    if (completedStops.has(stop)) continue;
    const movedDay =
      moved?.round === progress.round && moved.stop === stop ? localDay(moved.day) : undefined;
    const day =
      movedDay ??
      Array.from({ length: 7 }, (_, offset) => addDays(cursor, offset)).find((date) =>
        schedule.days.some((weekday) => new Date(date).getDay() === weekday),
      );
    if (day === undefined) break;
    planned.push({ stop, day });
    cursor = addDays(day, 1);
  }
  return planned;
}
