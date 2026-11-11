import { describe, expect, it } from 'vitest';
import { createWorkout, recordSet, selectExercise, toggleSkip } from './model';
import { stretchingPlan } from './stretching';

describe('stretchingPlan', () => {
  it('uses the planned groups for warmup and recorded sets for cooldown', () => {
    const workout = createWorkout(0, 0, false);
    if (workout.kind !== 'strength') throw new Error('Expected a strength workout');

    const squats = workout.plan.findIndex(({ exercise }) => exercise === 'squat');
    const rows = workout.plan.findIndex(({ exercise }) => exercise === 'row');
    const planned = toggleSkip(workout, squats);
    const warmup = stretchingPlan(planned, 'warmup');
    expect(warmup.steps.map(({ group }) => group)).toEqual(['Грудь и трицепсы', 'Спина']);
    expect(warmup.walkingMinutes).toBe(3);

    const completed = recordSet(selectExercise(planned, rows), { weight: null, reps: 8 });
    const cooldown = stretchingPlan(completed, 'cooldown');
    expect(cooldown.steps.map(({ group }) => group)).toEqual(['Спина']);
    expect(cooldown.walkingMinutes).toBe(4);
  });

  it('keeps the cardio routine inside five minutes', () => {
    const workout = createWorkout(1, 0, true);
    const warmup = stretchingPlan(workout, 'warmup');
    const cooldown = stretchingPlan(workout, 'cooldown');
    expect(warmup.steps.map(({ group }) => group)).toContain('Икры');
    expect(warmup.steps[0].title).not.toBe(cooldown.steps[0].title);
    expect(cooldown.walkingMinutes + cooldown.steps.length).toBe(5);
  });
});
