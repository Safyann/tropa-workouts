import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { createWorkout, type Workout } from '../../features/workout';
import { WorkoutPage } from './index';

function InteractiveWorkout({ initial }: { initial: Workout }) {
  const [workout, update] = useState(initial);
  const [completed, setCompleted] = useState(false);
  if (completed) return <h1>Занятие завершено.</h1>;
  return <WorkoutPage workout={workout} history={[]} update={update} finish={() => setCompleted(true)}/>;
}

const meta = {
  title: 'Страницы/Тренировка',
  component: InteractiveWorkout
} satisfies Meta<typeof InteractiveWorkout>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Strength: Story = {
  name: 'Короткая силовая',
  args: { initial: createWorkout(0, 0, true) }
};

export const Cardio: Story = {
  name: 'Таймер эллипса',
  args: { initial: createWorkout(1, 0, true) }
};
