import { expect, it } from 'vitest';
import { mergeProgressBackup } from './backup';
import { editSavedSession } from './historyEdits';
import { parseProgress, type Progress, type Session } from './model';

const first: Session = { date: 1000, stop: 0, round: 0, short: true, sets: [], elapsed: null };

it('preserves local sessions and merges a backup once when round numbers overlap', () => {
  const current: Progress = { version: 1, round: 0, sessions: [first] };
  const backup: Progress = {
    ...current,
    sessions: [
      { ...first, effort: 'hard' },
      { ...first, stop: 1, date: 2000 },
    ],
  };
  const merged = mergeProgressBackup(current, backup);
  expect(merged.sessions).toEqual([
    { ...first, effort: 'hard' },
    { ...first, stop: 1, round: 1, date: 2000 },
  ]);
  expect(merged.round).toBe(0);
  expect(mergeProgressBackup(merged, backup)).toEqual(merged);
  expect(parseProgress(JSON.stringify(merged), true)).toEqual(merged);
  expect(parseProgress('{"version":1,"round":0,"sessions":[null]}', true)).toBeNull();
});

it('recognizes a session in an old backup after its date or sets were corrected', () => {
  const original: Progress = { version: 1, round: 0, sessions: [first] };
  const edited = editSavedSession(original, '0/1', {
    date: 3000,
    sets: [{ exercise: 'squat', weight: 8, reps: 10 }],
    notes: [{ exercise: 'squat', text: 'С опорой' }],
  });
  if (!edited) throw new Error('Expected an edited session');
  expect(edited.sessions[0]).toMatchObject({ originalDate: first.date, date: 3000 });
  expect(mergeProgressBackup(edited, original)).toEqual(edited);
});
