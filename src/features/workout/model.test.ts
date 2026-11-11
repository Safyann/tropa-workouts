import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  createWorkout,
  extendRest,
  finishWarmup,
  isLastSet,
  moveExercise,
  recordSet,
  remaining,
  replaceExercise,
  selectExercise,
  startCooldown,
  summarize,
  toggleSkip,
  toggleTimer,
} from './model';
import { defaultPreferences, exercises } from '../../entities/program';
import { estimatedCalories } from '../../entities/progress';

afterEach(() => vi.useRealTimers());

describe('workout', () => {
  it('adds fifteen seconds to running and paused rest', () => {
    const workout = createWorkout(0, 0, false);
    if (workout.kind !== 'strength') throw new Error('Expected a strength workout');
    const running = { ...workout, timer: { remaining: 60, end: 61_000 } };
    expect(extendRest(running, 11_000).timer).toEqual({ remaining: 65, end: 76_000 });
    const paused = { ...workout, timer: { remaining: 20, end: null } };
    expect(extendRest(paused, 11_000).timer).toEqual({ remaining: 35, end: null });
    expect(extendRest(running, 62_000).timer).toEqual({ remaining: 15, end: 77_000 });
  });

  it('creates the program plans with dumbbells and preserves the program in history', () => {
    const preferences = {
      ...defaultPreferences,
      program: 'dumbbell',
      equipment: ['dumbbells'],
    } as const;
    const workout = createWorkout(1, 3, false, preferences);
    if (workout.kind !== 'strength') throw new Error('Expected a strength workout');
    expect(workout.plan.map(({ exercise }) => exercise)).toEqual([
      'gobletSquat',
      'standingPress',
      'singleFreeRow',
      'gluteBridge',
    ]);
    expect(summarize(workout).program).toBe('dumbbell');
  });
  it('plans both strength stops without equipment and rejects unavailable replacements', () => {
    const preferences = { ...defaultPreferences, equipment: [] };
    const workout = createWorkout(2, 0, true, preferences);
    if (workout.kind !== 'strength') throw new Error('Expected a strength workout');
    expect(workout.plan.map((item) => item.exercise)).toEqual(['bodySquat', 'wallPress', 'proneW']);
    expect(replaceExercise(workout, 1, 'floorPress')).toBe(workout);
    expect(replaceExercise(workout, 1, 'pushup').plan[1].exercise).toBe('pushup');
  });

  it('uses the existing cardio timer for walking and records the activity', () => {
    const workout = createWorkout(1, 0, true, { ...defaultPreferences, equipment: ['dumbbells'] });
    expect(workout).toMatchObject({ kind: 'cardio', activity: 'walking', seconds: 300 });
    expect(summarize(workout).cardioActivity).toBe('walking');
  });
  it('uses one set each for two exercises in the short strength workout', () => {
    expect(createWorkout(0, 0, false)).toMatchObject({
      plan: [
        { exercise: 'squat', target: 2 },
        { exercise: 'press', target: 2 },
        { exercise: 'row', target: 2 },
      ],
    });
    expect(createWorkout(0, 0, true)).toMatchObject({
      plan: [
        { exercise: 'squat', target: 1 },
        { exercise: 'press', target: 1 },
      ],
    });
  });

  it('builds a full workout for one selected muscle group', () => {
    const preferences = {
      ...defaultPreferences,
      muscleGroups: ['Мышцы корпуса'] as const,
    };
    const plans = ([20, 40, 60] as const).map((minutes) => {
      const workout = createWorkout(0, 0, false, { ...preferences, minutes });
      if (workout.kind !== 'strength') throw new Error('Expected a strength workout');
      const ids = workout.plan.map(({ exercise }) => exercise);
      expect(new Set(ids).size).toBe(ids.length);
      expect(
        ids.every((id) => id.startsWith('kinetic:') && exercises[id].group === 'Мышцы корпуса'),
      ).toBe(true);
      expect(workout.mainMinutes).toBeGreaterThanOrEqual(minutes - 2);
      expect(workout.mainMinutes).toBeLessThanOrEqual(minutes);
      return ids.length;
    });
    expect(plans[0]).toBeGreaterThan(1);
    expect(plans[1]).toBeGreaterThan(plans[0]);
    expect(plans[2]).toBeGreaterThan(plans[1]);
  });

  it('uses selected new equipment in a focused workout without adding unavailable gear', () => {
    const workout = createWorkout(0, 0, false, {
      ...defaultPreferences,
      equipment: ['abWheel'],
      muscleGroups: ['Мышцы корпуса'],
    });
    if (workout.kind !== 'strength') throw new Error('Expected a strength workout');
    expect(exercises[workout.plan[0].exercise].needs).toEqual(['abWheel']);
    expect(
      workout.plan.every(({ exercise }) =>
        exercises[exercise].needs?.every((item) => item === 'abWheel'),
      ),
    ).toBe(true);
  });

  it('uses both groups and budgets for the warmup and cooldown in a 60-minute plan', () => {
    const workout = createWorkout(0, 0, false, {
      ...defaultPreferences,
      minutes: 60,
      warmup: true,
      cooldown: true,
      muscleGroups: ['Грудь и трицепсы', 'Мышцы корпуса'],
    });
    if (workout.kind !== 'strength') throw new Error('Expected a strength workout');
    const groups = workout.plan.map(({ exercise }) => exercises[exercise].group);
    expect(new Set(groups)).toEqual(new Set(['Грудь и трицепсы', 'Мышцы корпуса']));
    expect(groups.filter((group) => group === 'Грудь и трицепсы').length).toBeGreaterThan(1);
    expect(groups.filter((group) => group === 'Мышцы корпуса').length).toBeGreaterThan(1);
    expect(workout.mainMinutes).toBeGreaterThanOrEqual(48);
    expect(workout.mainMinutes).toBeLessThanOrEqual(50);
    expect(workout.block?.timer.remaining).toBe(300);
    expect(workout.cooldownMinutes).toBe(5);
  });

  it('reports a shorter workout when the selected equipment limits exercise variety', () => {
    const workout = createWorkout(0, 0, false, {
      ...defaultPreferences,
      minutes: 60,
      muscleGroups: ['Икры'],
    });
    if (workout.kind !== 'strength') throw new Error('Expected a strength workout');
    expect(workout.plan.length).toBeGreaterThan(0);
    expect(
      workout.plan.every(
        ({ exercise, target }) => exercises[exercise].group === 'Икры' && target <= 4,
      ),
    ).toBe(true);
    expect(workout.mainMinutes).toBeLessThan(60);
  });

  it('covers every available selected group in a short workout without equipment', () => {
    const workout = createWorkout(0, 0, true, {
      ...defaultPreferences,
      equipment: [],
      muscleGroups: [
        'Грудь и трицепсы',
        'Спина',
        'Задняя поверхность бедра и ягодицы',
        'Плечи',
        'Мышцы корпуса',
      ],
    });

    if (workout.kind !== 'strength') throw new Error('Expected a strength workout');
    expect([...new Set(workout.plan.map(({ exercise }) => exercises[exercise].group))]).toEqual([
      'Грудь и трицепсы',
      'Спина',
      'Задняя поверхность бедра и ягодицы',
      'Плечи',
      'Мышцы корпуса',
    ]);
    for (const item of workout.plan) {
      expect(item).toMatchObject({ exercise: expect.stringMatching(/^kinetic:/), target: 1 });
      expect(exercises[item.exercise].needs).toEqual([]);
    }
  });

  it('uses the route plan if no selected group has an exercise for the available equipment', () => {
    const preferences = { ...defaultPreferences, equipment: [] };
    const regular = createWorkout(0, 0, false, preferences);
    const focused = createWorkout(0, 0, false, { ...preferences, muscleGroups: ['Бицепс'] });
    if (regular.kind !== 'strength' || focused.kind !== 'strength')
      throw new Error('Expected strength workouts');

    expect(focused.plan).toEqual(regular.plan);
  });

  it('records the actual set and starts a 60-second rest', () => {
    vi.useFakeTimers();
    vi.setSystemTime(1_000);
    const workout = createWorkout(0, 1, true);
    if (workout.kind !== 'strength') throw new Error('Expected a strength workout');
    const set = { exercise: 'squat', weight: 5.5, reps: 8 } as const;
    const updated = recordSet(workout, { weight: set.weight, reps: set.reps });

    expect(workout.sets).toEqual([]);
    expect(updated.timer).toEqual({ remaining: 60, end: 61_000 });
    expect(summarize(updated)).toEqual({
      date: 1_000,
      stop: 0,
      round: 1,
      short: true,
      sets: [set],
      elapsed: null,
      durationSeconds: 0,
      activeCaloriesPerKg: 0,
      partial: true,
    });
  });

  it('estimates active calories from completed timers and excludes time spent paused', () => {
    vi.useFakeTimers();
    vi.setSystemTime(0);
    const workout = createWorkout(1, 0, false, {
      ...defaultPreferences,
      warmup: true,
      cooldown: true,
      warmupActivity: 'stretching',
    });
    if (workout.kind !== 'cardio' || !workout.block) throw new Error('Expected cardio with warmup');
    const warmedUp = finishWarmup({
      ...workout,
      block: { ...workout.block, timer: { remaining: 240, end: null } },
    });
    if (warmedUp.kind !== 'cardio') throw new Error('Expected cardio');
    const cooldown = startCooldown({
      ...warmedUp,
      timer: { remaining: warmedUp.seconds - 120, end: null },
    });
    if (!cooldown?.block) throw new Error('Expected cooldown');
    vi.setSystemTime(600_000);
    const result = summarize(
      {
        ...cooldown,
        block: { ...cooldown.block, timer: { remaining: 240, end: null } },
      },
      72,
    );
    expect(result.durationSeconds).toBe(600);
    expect(result.elapsed).toBe(120);
    expect(estimatedCalories(result)).toBe(13);
  });

  it('records the selected exercise out of order', () => {
    const workout = createWorkout(0, 0, false);
    if (workout.kind !== 'strength') throw new Error('Expected a strength workout');
    const updated = recordSet(selectExercise(workout, 2), { weight: 4, reps: 7 });
    expect(updated.plan.map((item) => item.completed)).toEqual([0, 0, 1]);
    expect(updated.sets[0]).toEqual({ exercise: 'row', weight: 4, reps: 7 });
  });

  it('ends the workout without a rest timer after the last unskipped set', () => {
    const workout = createWorkout(0, 0, true);
    if (workout.kind !== 'strength') throw new Error('Expected a strength workout');
    expect(isLastSet(workout)).toBe(false);

    const lastSet = toggleSkip(workout, 1);
    expect(isLastSet(lastSet)).toBe(true);
    const completed = recordSet(lastSet, { weight: null, reps: 8 });
    expect(completed.timer).toBeNull();
    expect(completed.selected).toBeNull();
    expect(summarize(completed).partial).toBeUndefined();
  });

  it('preserves the selected exercise and recorded sets when rows are dragged', () => {
    const workout = createWorkout(0, 0, false);
    if (workout.kind !== 'strength') throw new Error('Expected a strength workout');
    const recorded = recordSet(selectExercise(workout, 1), { weight: 6, reps: 8 });
    const reordered = moveExercise(recorded, 1, 0);
    expect(reordered.plan.map((item) => item.exercise)).toEqual(['press', 'squat', 'row']);
    expect(reordered.selected).toBe(0);
    expect(reordered.plan[0].completed).toBe(1);
    expect(reordered.sets).toEqual(recorded.sets);
    expect(moveExercise(reordered, 0, 3)).toBe(reordered);
  });

  it('keeps recorded sets and applies a same-group replacement only to remaining sets', () => {
    const workout = createWorkout(0, 0, false);
    if (workout.kind !== 'strength') throw new Error('Expected a strength workout');
    const recorded = recordSet(selectExercise(workout, 1), { weight: 4, reps: 8 });
    expect(replaceExercise(recorded, 1, 'freeRow')).toBe(recorded);
    const replaced = replaceExercise(recorded, 1, 'floorPress');
    expect(replaced.plan[1]).toMatchObject({ exercise: 'floorPress', completed: 1, target: 2 });
    const finished = recordSet(selectExercise(replaced, 1), { weight: 4, reps: 8 });
    expect(finished.sets.map((set) => set.exercise)).toEqual(['press', 'floorPress']);
    expect(replaceExercise(finished, 1, 'press')).toBe(finished);
  });

  it('skips remaining work without recording a set and supports undo', () => {
    const workout = createWorkout(0, 0, true);
    if (workout.kind !== 'strength') throw new Error('Expected a strength workout');
    const recorded = recordSet(workout, { weight: null, reps: 8 });
    const skipped = toggleSkip(recorded, 1);
    expect(skipped.timer).toBeNull();
    expect(selectExercise(skipped, 1)).toBe(skipped);
    expect(summarize(skipped)).toMatchObject({ skipped: ['press'], sets: [{ exercise: 'squat' }] });
    expect(selectExercise(toggleSkip(skipped, 1), 1).selected).toBe(1);
  });

  it('pauses, resumes and finishes the cardio countdown', () => {
    const workout = createWorkout(1, 0, true);
    if (workout.kind !== 'cardio') throw new Error('Expected a cardio workout');
    expect(workout.seconds).toBe(300);
    const running = toggleTimer(workout.timer, 1_000);
    const paused = toggleTimer(running, 11_000);
    expect(remaining(paused, 20_000)).toBe(290);
    const resumed = toggleTimer(paused, 21_000);
    expect(remaining(resumed, 26_000)).toBe(285);
    expect(remaining(resumed, 400_000)).toBe(0);
  });

  it('stores time spent on cardio instead of its target duration', () => {
    vi.useFakeTimers();
    vi.setSystemTime(43_000);
    const workout = createWorkout(1, 0, false);
    if (workout.kind !== 'cardio') throw new Error('Expected a cardio workout');
    const timer = toggleTimer(workout.timer, 1_000);
    expect(summarize({ ...workout, timer }).elapsed).toBe(42);
  });

  it('keeps warm-up and cooldown inside an hour and adapts strength to level', () => {
    const options = { minutes: 60, level: 'experienced', warmup: true, cooldown: true } as const;
    const workout = createWorkout(0, 0, false, options);
    const beginner = createWorkout(0, 0, false, { ...options, level: 'beginner' });
    if (workout.kind !== 'strength' || beginner.kind !== 'strength')
      throw new Error('Expected strength workouts');

    expect(workout).toMatchObject({
      mainMinutes: 50,
      cooldownMinutes: 5,
      block: { type: 'warmup', timer: { remaining: 300 } },
    });
    expect(workout.plan).toHaveLength(6);
    expect(workout.plan.every((item) => item.target === 4)).toBe(true);
    expect(beginner.plan.every((item) => item.target === 3)).toBe(true);
    expect(recordSet(workout, { weight: null, reps: 8 })).toBe(workout);
  });

  it('freezes cardio elapsed time when cooldown starts', () => {
    vi.useFakeTimers();
    vi.setSystemTime(1_000);
    const cardio = createWorkout(1, 0, false, {
      minutes: 20,
      level: 'beginner',
      warmup: false,
      cooldown: true,
    });
    if (cardio.kind !== 'cardio') throw new Error('Expected a cardio workout');
    expect(cardio.seconds).toBe(900);
    const running = { ...cardio, timer: toggleTimer(cardio.timer, 1_000) };
    const cooldown = startCooldown(running, 31_000);
    expect(cooldown).toMatchObject({ block: { type: 'cooldown', timer: { remaining: 300 } } });
    vi.setSystemTime(331_000);
    expect(cooldown && summarize(cooldown).elapsed).toBe(30);
    expect(cooldown && summarize(cooldown).durationSeconds).toBe(330);
  });
});
