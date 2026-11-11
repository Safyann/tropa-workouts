import { expect, it } from 'vitest';
import { calendarWeeks, localDay, monthStart } from './calendarDates';

it('places days in Monday-first weeks and includes February 29', () => {
  const february = new Date(2024, 1, 1).getTime();
  const weeks = calendarWeeks(february);
  expect(weeks[0].slice(0, 4)).toEqual([null, null, null, february]);
  expect(weeks.at(-1)?.slice(3)).toEqual([new Date(2024, 1, 29).getTime(), null, null, null]);
  expect(weeks.flat().filter((day) => day !== null)).toHaveLength(29);
});

it('uses local calendar days and navigates across years from the first of each month', () => {
  const lateWorkout = new Date(2026, 11, 31, 23, 45).getTime();
  expect(localDay(lateWorkout)).toBe(new Date(2026, 11, 31).getTime());
  expect(monthStart(lateWorkout, 1)).toBe(new Date(2027, 0, 1).getTime());
});
