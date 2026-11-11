import type { Progress, Session } from './model';
import { nextRoundNumber } from './programProgress';

function sessionKey({ date, originalDate, stop, freeId, program }: Session) {
  // После исправления даты старая резервная копия должна по-прежнему находить ту же запись.
  return freeId ? `free/${freeId}` : `${program ?? 'home'}/${originalDate ?? date}/${stop}`;
}

export function mergeProgressBackup(current: Progress, backup: Progress): Progress {
  if (
    !current.sessions.length &&
    !current.templates?.length &&
    !current.savedRoutes &&
    current.round === 0
  )
    return backup;

  const sessions = new Map(current.sessions.map((session) => [sessionKey(session), session]));
  const rounds = new Map<number, number>();
  let lastRound = nextRoundNumber(current) - 1;
  for (const session of backup.sessions) {
    const key = sessionKey(session);
    const existing = sessions.get(key);
    if (existing) {
      if (!existing.effort && session.effort)
        sessions.set(key, { ...existing, effort: session.effort });
      continue;
    }
    if (session.freeId) {
      sessions.set(key, session);
      continue;
    }
    // Отдельные номера импортированных кругов защищают текущий маршрут от случайного продвижения.
    let round = rounds.get(session.round);
    if (round === undefined) {
      round = ++lastRound;
      rounds.set(session.round, round);
    }
    sessions.set(key, { ...session, round });
  }
  const templates = new Map((current.templates ?? []).map((template) => [template.id, template]));
  for (const template of backup.templates ?? []) {
    if (!templates.has(template.id)) templates.set(template.id, template);
  }
  return {
    ...current,
    sessions: [...sessions.values()].sort((first, second) => first.date - second.date),
    ...(templates.size > 0 && { templates: [...templates.values()] }),
  };
}
