import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import {
  createWorkout,
  replaceExercise,
  selectExercise,
  toggleSkip,
  type Workout,
} from '../../features/workout';
import { WorkoutPage } from './index';

function InteractiveWorkout({ initial }: { initial: Workout }) {
  const [workout, update] = useState(initial);
  const [completed, setCompleted] = useState(false);
  if (completed) return <h1>Занятие завершено.</h1>;
  return (
    <WorkoutPage
      workout={workout}
      history={[]}
      update={update}
      finish={() => setCompleted(true)}
      discard={() => update(initial)}
    />
  );
}

const meta = {
  title: 'Страницы/Тренировка',
  component: InteractiveWorkout,
} satisfies Meta<typeof InteractiveWorkout>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Strength: Story = {
  name: 'Короткая силовая',
  args: { initial: createWorkout(0, 0, true) },
};

export const Cardio: Story = {
  name: 'Таймер эллипса',
  args: { initial: createWorkout(1, 0, true) },
};

const original = createWorkout(0, 0, false);
export const AdjustedPlan: Story = {
  name: 'Поменяли порядок, заменили и пропустили',
  args: {
    initial:
      original.kind === 'strength'
        ? selectExercise(toggleSkip(replaceExercise(original, 1, 'wallPress'), 0), 1)
        : original,
  },
};

export const Warmup: Story = {
  name: 'Разминка перед тренировкой',
  args: {
    initial: createWorkout(0, 0, false, {
      minutes: 60,
      level: 'beginner',
      warmup: true,
      cooldown: true,
    }),
  },
};
