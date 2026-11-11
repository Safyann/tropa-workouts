import { sessionIdentity, type Progress, type Session } from './model';

export type SessionChanges = Required<Pick<Session, 'date' | 'sets' | 'notes'>>;

export function editSavedSession(
  progress: Progress,
  id: string,
  changes: SessionChanges,
): Progress | null {
  if (!progress.sessions.some((session) => sessionIdentity(session) === id)) return null;
  const sessions = progress.sessions.map((session) => {
    if (sessionIdentity(session) !== id) return session;
    // Дата исходной записи нужна для сопоставления со старыми резервными копиями.
    const originalDate =
      changes.date === session.date ? session.originalDate : (session.originalDate ?? session.date);
    return { ...session, ...changes, ...(originalDate !== undefined && { originalDate }) };
  });
  sessions.sort((first, second) => first.date - second.date);
  return { ...progress, sessions };
}
