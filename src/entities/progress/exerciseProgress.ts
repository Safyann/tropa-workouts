import type { ExerciseId } from '../program/@x/progress';
import type { Session } from './model';

export interface ExerciseProgressEntry {
  session: Session;
  weight: number | null;
  reps: number | null;
}

export function exerciseProgress(sessions: readonly Session[]) {
  const progress = new Map<ExerciseId, ExerciseProgressEntry[]>();
  for (const session of [...sessions].sort((first, second) => second.date - first.date)) {
    for (const { exercise, weight, reps } of session.sets) {
      if (weight === null && reps === null) continue;
      const entries = progress.get(exercise) ?? [];
      const latestEntry = entries.at(-1);
      if (latestEntry?.session === session) {
        if (weight !== null) latestEntry.weight = Math.max(latestEntry.weight ?? 0, weight);
        if (reps !== null) latestEntry.reps = Math.max(latestEntry.reps ?? 0, reps);
      } else {
        entries.push({ session, weight, reps });
        progress.set(exercise, entries);
      }
    }
  }
  return progress;
}
