import type { ExerciseId } from '../program/@x/progress';
import { addDays, localDay } from '../../shared/lib/calendarDates';
import { bestSet } from './compareSession';
import type { Session, SetRecord } from './model';

function bestByExercise(sessions: readonly Session[]) {
  const result = new Map<ExerciseId, { set: SetRecord; session: Session }>();
  for (const session of sessions) {
    for (const exercise of new Set(session.sets.map((set) => set.exercise))) {
      if (result.has(exercise)) continue;
      const set = bestSet(session.sets.filter((item) => item.exercise === exercise));
      if (set) result.set(exercise, { set, session });
    }
  }
  return result;
}

export function trainingReport(sessions: readonly Session[], previous?: readonly Session[]) {
  const ordered = [...sessions].sort((first, second) => first.date - second.date);
  const initial = bestByExercise(
    previous ? [...previous].sort((first, second) => second.date - first.date) : ordered,
  );
  const latest = bestByExercise(ordered.reverse());
  const changes = [...latest].flatMap(([exercise, current]) => {
    const earlier = initial.get(exercise);
    if (!earlier || earlier.session === current.session) return [];
    if (earlier.set.weight === current.set.weight && earlier.set.reps === current.set.reps)
      return [];
    return [{ exercise, previous: earlier.set, current: current.set }];
  });
  const durations = sessions.flatMap(({ durationSeconds, elapsed }) => {
    const duration = durationSeconds ?? elapsed;
    return duration === null ? [] : [duration];
  });
  return {
    workouts: sessions.length,
    sets: sessions.reduce((count, session) => count + session.sets.length, 0),
    seconds: durations.length ? durations.reduce((sum, duration) => sum + duration, 0) : null,
    timedWorkouts: durations.length,
    changes,
  };
}

export type TrainingReport = ReturnType<typeof trainingReport>;

export function weeklyReport(sessions: readonly Session[], now = Date.now()) {
  const today = localDay(now);
  const monday = addDays(today, -((new Date(today).getDay() + 6) % 7));
  const end = addDays(monday, 7);
  const week = sessions.filter(({ date }) => date >= monday && date < end);
  return {
    ...trainingReport(
      week,
      sessions.filter(({ date }) => date < monday),
    ),
    routeWorkouts: week.filter(({ freeId }) => !freeId).length,
  };
}
