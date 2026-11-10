export interface CatalogExercise {
  exerciseId: string;
  name: string;
  gifUrl: string;
}

const mediaBase = 'https://static.exercisedb.dev/media/';

export function exerciseGifUrl(id: string) {
  return `${mediaBase}${encodeURIComponent(id)}.gif`;
}

function isExercise(value: unknown): value is CatalogExercise {
  if (!value || typeof value !== 'object') return false;
  const item = value as Partial<CatalogExercise>;
  return typeof item.exerciseId === 'string' && typeof item.name === 'string'
    && typeof item.gifUrl === 'string' && item.gifUrl.startsWith(mediaBase);
}

export async function searchExercises(query: string, signal: AbortSignal) {
  const url = new URL('https://oss.exercisedb.dev/api/v1/exercises/search');
  url.searchParams.set('search', query);
  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error(`ExerciseDB: ${response.status}`);
  const payload = await response.json() as { success?: boolean; data?: unknown };
  if (!payload.success || !Array.isArray(payload.data)) throw new Error('Unexpected ExerciseDB response');
  return payload.data.filter(isExercise).slice(0, 12);
}

export async function browseExercises(cursor: string | null, signal: AbortSignal) {
  const url = new URL('https://oss.exercisedb.dev/api/v1/exercises');
  url.searchParams.set('limit', '12');
  if (cursor) url.searchParams.set('after', cursor);
  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error(`ExerciseDB: ${response.status}`);
  const payload = await response.json() as { success?: boolean; data?: unknown; meta?: { nextCursor?: unknown } };
  if (!payload.success || !Array.isArray(payload.data)) throw new Error('Unexpected ExerciseDB response');
  const next = payload.meta?.nextCursor;
  return { items: payload.data.filter(isExercise), next: typeof next === 'string' && next !== cursor ? next : null };
}
