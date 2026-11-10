import { afterEach, describe, expect, it, vi } from 'vitest';
import { searchExercises } from './exerciseDb';

afterEach(() => vi.unstubAllGlobals());

describe('ExerciseDB', () => {
  it('sends the search query and only returns valid ExerciseDB demonstrations', async () => {
    const valid = { exerciseId: 'id', name: 'dumbbell press', gifUrl: 'https://static.exercisedb.dev/media/id.gif' };
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(Response.json({
      success: true,
      data: [valid, { ...valid, gifUrl: 'https://other.example/id.gif' }, null]
    }));
    vi.stubGlobal('fetch', fetchMock);
    const signal = new AbortController().signal;
    expect(await searchExercises('dumbbell press', signal)).toEqual([valid]);
    const [url, options] = fetchMock.mock.calls[0];
    expect(String(url)).toBe('https://oss.exercisedb.dev/api/v1/exercises/search?search=dumbbell+press');
    expect(options?.signal).toBe(signal);
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
});
