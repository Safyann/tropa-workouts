import { previousExerciseResult, type Session, type SetRecord } from './model';

export function bestSet(sets: readonly SetRecord[]) {
  // Берём вес и повторы из одного записанного подхода, чтобы сравнивать фактические результаты.
  return sets.reduce<SetRecord | undefined>((best, set) => {
    if (set.weight === null && set.reps === null) return best;
    if (!best || (set.weight ?? -1) > (best.weight ?? -1)) return set;
    if (set.weight === best.weight && (set.reps ?? 0) > (best.reps ?? 0)) return set;
    return best;
  }, undefined);
}

export function compareSession(session: Session, history: readonly Session[]) {
  const earlier = history.filter(({ date }) => date < session.date).sort((a, b) => a.date - b.date);
  return [...new Set(session.sets.map(({ exercise }) => exercise))].flatMap((exercise) => {
    const current = bestSet(session.sets.filter((set) => set.exercise === exercise));
    const previous = bestSet(previousExerciseResult(earlier, exercise)?.sets ?? []);
    return current && previous ? [{ exercise, current, previous }] : [];
  });
}
