export interface CatalogExercise {
  exerciseId: string;
  name: string;
  gifUrl: string;
}

function httpsOrigin(configured: string | undefined, fallback: string) {
  const url = new URL(configured || fallback);
  if (url.protocol !== 'https:' || url.username || url.password
      || url.pathname !== '/' || url.search || url.hash) {
    throw new Error('ExerciseDB configuration requires an HTTPS origin');
  }
  return url.origin;
}

const apiOrigin = httpsOrigin(import.meta.env.VITE_EXERCISE_DB_API_ORIGIN, 'https://oss.exercisedb.dev');
const mediaOrigin = httpsOrigin(import.meta.env.VITE_EXERCISE_DB_MEDIA_ORIGIN, 'https://static.exercisedb.dev');

export function exerciseGifUrl(id: string) {
  return `${mediaOrigin}/media/${encodeURIComponent(id)}.gif`;
}

function isExercise(value: unknown): value is CatalogExercise {
  if (!value || typeof value !== 'object') return false;
  const item = value as Partial<CatalogExercise>;
  if (typeof item.exerciseId !== 'string' || typeof item.name !== 'string'
      || typeof item.gifUrl !== 'string') return false;
  try {
    const url = new URL(item.gifUrl);
    return url.origin === mediaOrigin && !url.username && !url.password
      && /^\/media\/[\w-]+\.gif$/i.test(url.pathname);
  } catch {
    return false;
  }
}

export async function searchExercises(query: string, signal: AbortSignal) {
  const url = new URL('/api/v1/exercises/search', apiOrigin);
  url.searchParams.set('search', query);
  const response = await fetch(url, { signal, credentials: 'omit', referrerPolicy: 'no-referrer' });
  if (!response.ok) throw new Error(`ExerciseDB: ${response.status}`);
  const payload = await response.json() as { success?: boolean; data?: unknown };
  if (!payload.success || !Array.isArray(payload.data)) throw new Error('Unexpected ExerciseDB response');
  return payload.data.filter(isExercise).slice(0, 12);
}

export async function browseExercises(cursor: string | null, signal: AbortSignal) {
  const url = new URL('/api/v1/exercises', apiOrigin);
  url.searchParams.set('limit', '12');
  if (cursor) url.searchParams.set('after', cursor);
  const response = await fetch(url, { signal, credentials: 'omit', referrerPolicy: 'no-referrer' });
  if (!response.ok) throw new Error(`ExerciseDB: ${response.status}`);
  const payload = await response.json() as { success?: boolean; data?: unknown; meta?: { nextCursor?: unknown } };
  if (!payload.success || !Array.isArray(payload.data)) throw new Error('Unexpected ExerciseDB response');
  const next = payload.meta?.nextCursor;
  return { items: payload.data.filter(isExercise), next: typeof next === 'string' && next !== cursor ? next : null };
}
