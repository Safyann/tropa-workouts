export interface CatalogExercise {
  exerciseId: string;
  name: string;
  gifUrl: string;
}

function isExercise(value: unknown): value is CatalogExercise {
  if (!value || typeof value !== 'object') return false;
  const item = value as Partial<CatalogExercise>;
  return typeof item.exerciseId === 'string' && typeof item.name === 'string'
    && typeof item.gifUrl === 'string' && item.gifUrl.startsWith('https://static.exercisedb.dev/media/');
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
