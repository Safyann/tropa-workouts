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
    expect(warmup.map(({ group }) => group)).toEqual([
      'Грудь и трицепсы',
      'Спина',
      'Мышцы корпуса',
      'Плечи',
      'Ноги и ягодицы',
    ]);

    const completed = recordSet(selectExercise(planned, rows), { weight: null, reps: 8 });
    const cooldown = stretchingPlan(completed, 'cooldown');
    expect(cooldown.map(({ group }) => group)).toEqual([
      'Спина',
      'Мышцы корпуса',
      'Плечи',
      'Ноги и ягодицы',
      'Задняя поверхность бедра и ягодицы',
    ]);
  });

  it('keeps the cardio routine inside five minutes', () => {
    const workout = createWorkout(1, 0, true);
    const warmup = stretchingPlan(workout, 'warmup');
    const cooldown = stretchingPlan(workout, 'cooldown');
    expect(warmup.map(({ group }) => group)).toContain('Икры');
    expect(warmup[0].title).not.toBe(cooldown[0].title);
    expect(warmup).toHaveLength(5);
    expect(cooldown).toHaveLength(5);
  });
});
