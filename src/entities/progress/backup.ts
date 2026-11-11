import type { Progress, Session } from './model';

function sessionKey({ date, stop }: Session) {
  return `${date}/${stop}`;
}

export function mergeProgressBackup(current: Progress, backup: Progress): Progress {
  if (!current.sessions.length && current.round === 0) return backup;

  const sessions = new Map(current.sessions.map((session) => [sessionKey(session), session]));
  const rounds = new Map<number, number>();
  let lastRound = current.sessions.reduce(
    (last, { round }) => Math.max(last, round),
    current.round,
  );
  for (const session of backup.sessions) {
    const key = sessionKey(session);
    const existing = sessions.get(key);
    if (existing) {
      if (!existing.effort && session.effort)
        sessions.set(key, { ...existing, effort: session.effort });
      continue;
    }
    let round = rounds.get(session.round);
    if (round === undefined) {
      round = ++lastRound;
      rounds.set(session.round, round);
    }
    sessions.set(key, { ...session, round });
  }
  return {
    ...current,
    sessions: [...sessions.values()].sort((first, second) => first.date - second.date),
  };
}
