import { describe, expect, it } from 'vitest';
import { recommendLevel } from './preferences';

describe('weekly level guide', () => {
  it('separates starting, occasional, and regular strength training', () => {
    expect(recommendLevel(0, 0, false)).toBe('beginner');
    expect(recommendLevel(1, 45, false)).toBe('basic');
    expect(recommendLevel(2, 60, false)).toBe('experienced');
  });

  it('uses experience with adjusting loads in addition to weekly volume', () => {
    expect(recommendLevel(3, 120, false)).toBe('experienced');
    expect(recommendLevel(3, 120, true)).toBe('advanced');
  });
});
