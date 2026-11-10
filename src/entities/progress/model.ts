import type { ExerciseId, WorkoutPreferences } from '../program/@x/progress';

const key = 'tropa-workouts-v1';

export interface SetRecord {
  exercise: ExerciseId;
  weight: number | null;
  reps: number | null;
}

export interface Session {
  stop: number;
  round: number;
  date: number;
  short: boolean;
  sets: SetRecord[];
  elapsed: number | null;
  durationSeconds?: number;
  skipped?: ExerciseId[];
}

export interface Progress {
  version: 1;
  round: number;
  sessions: Session[];
  preferences?: WorkoutPreferences;
}

export function readProgress(): Progress {
  try {
    const saved = JSON.parse(localStorage.getItem(key) ?? 'null') as Progress | null;
    if (saved?.version === 1 && Number.isInteger(saved.round) && Array.isArray(saved.sessions)) {
      return saved;
    }
  } catch {
    // The route is still usable if browser storage is unavailable.
  }
  return { version: 1, round: 0, sessions: [] };
}

export function saveProgress(progress: Progress) {
  try {
    localStorage.setItem(key, JSON.stringify(progress));
    return true;
  } catch {
    return false;
  }
}

export function nextStop(progress: Progress, totalStops: number) {
  return Array.from({ length: totalStops }).findIndex((_, index) => !progress.sessions.some(entry =>
    entry.round === progress.round && entry.stop === index));
}

export function weekCount(sessions: Session[]) {
  const monday = new Date();
  monday.setHours(0, 0, 0, 0);
  monday.setDate(monday.getDate() - (monday.getDay() + 6) % 7);
  return sessions.filter(entry => entry.date >= monday.getTime()).length;
}

export function formatTime(seconds: number) {
  const value = Math.max(0, seconds);
  return `${String(Math.floor(value / 60)).padStart(2, '0')}:${String(value % 60).padStart(2, '0')}`;
}
