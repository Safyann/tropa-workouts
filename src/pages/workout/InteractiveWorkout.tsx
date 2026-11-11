import { useState } from 'react';
import { routeLength } from '../../entities/progress';
import { type Workout } from '../../features/workout';
import { WorkoutPage } from './WorkoutPage';

export function InteractiveWorkout({ initial }: { initial: Workout }) {
  const [workout, update] = useState(initial);
  const [completed, setCompleted] = useState(false);
  if (completed) return <h1>Занятие завершено.</h1>;
  return (
    <WorkoutPage
      workout={workout}
      totalStops={routeLength({ version: 1, round: workout.round, sessions: [] }, workout.index)}
      history={[]}
      update={update}
      finish={() => setCompleted(true)}
      discard={() => update(initial)}
    />
  );
}
