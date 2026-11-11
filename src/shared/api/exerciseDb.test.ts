import { afterEach, describe, expect, it, vi } from 'vitest';
import { browseExercises, searchExercises } from './exerciseDb';

vi.hoisted(() => {
  vi.stubEnv('VITE_EXERCISE_DB_API_ORIGIN', '');
  vi.stubEnv('VITE_EXERCISE_DB_MEDIA_ORIGIN', '');
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe('ExerciseDB', () => {
  it('uses configured public origins for requests and GIF validation', async () => {
    vi.stubEnv('VITE_EXERCISE_DB_API_ORIGIN', 'https://api.example.com');
    vi.stubEnv('VITE_EXERCISE_DB_MEDIA_ORIGIN', 'https://media.example.com');
    vi.resetModules();
    const configured = await import('./exerciseDb');
    const exercise = { exerciseId: 'id', name: 'press', gifUrl: 'https://media.example.com/media/id.gif' };
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(Response.json({ success: true, data: [exercise] }));
    vi.stubGlobal('fetch', fetchMock);

    expect(configured.exerciseGifUrl('id')).toBe(exercise.gifUrl);
    expect(await configured.searchExercises('press', new AbortController().signal)).toEqual([exercise]);
    expect(String(fetchMock.mock.calls[0][0])).toBe('https://api.example.com/api/v1/exercises/search?search=press');
  });

  it('sends the search query and only returns valid ExerciseDB demonstrations', async () => {
    const valid = { exerciseId: 'id', name: 'dumbbell press', gifUrl: 'https://static.exercisedb.dev/media/id.gif' };
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(Response.json({
      success: true,
      data: [
        valid,
        { ...valid, gifUrl: 'https://other.example/id.gif' },
        { ...valid, gifUrl: 'https://static.exercisedb.dev/media/../id.gif' },
        null
      ]
    }));
    vi.stubGlobal('fetch', fetchMock);
    const signal = new AbortController().signal;
    expect(await searchExercises('dumbbell press', signal)).toEqual([valid]);
    const [url, options] = fetchMock.mock.calls[0];
    expect(String(url)).toBe('https://oss.exercisedb.dev/api/v1/exercises/search?search=dumbbell+press');
    expect(options?.signal).toBe(signal);
    expect(options?.credentials).toBe('omit');
  });

  it('reports rate limits and rejects unexpected API responses', async () => {
    const fetchMock = vi.fn<typeof fetch>()
      .mockResolvedValueOnce(new Response(null, { status: 429 }))
      .mockResolvedValueOnce(Response.json({ success: true, data: {} }));
    vi.stubGlobal('fetch', fetchMock);
    const signal = new AbortController().signal;
    await expect(searchExercises('row', signal)).rejects.toThrow('429');
    await expect(searchExercises('row', signal)).rejects.toThrow('Unexpected ExerciseDB response');
  });

  it('browses the full catalog with the provider’s after cursor', async () => {
    const fetchMock = vi.fn<typeof fetch>()
      .mockResolvedValueOnce(Response.json({ success: true, data: [], meta: { nextCursor: 'first' } }))
      .mockResolvedValueOnce(Response.json({ success: true, data: [], meta: { nextCursor: 'first' } }));
    vi.stubGlobal('fetch', fetchMock);
    const signal = new AbortController().signal;

    expect(await browseExercises(null, signal)).toEqual({ items: [], next: 'first' });
    expect(await browseExercises('first', signal)).toEqual({ items: [], next: null });
    expect(String(fetchMock.mock.calls[1][0])).toBe('https://oss.exercisedb.dev/api/v1/exercises?limit=12&after=first');
  });
});
