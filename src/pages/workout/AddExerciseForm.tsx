import { useState } from 'react';
import { exercises, type ExerciseId, type HomeEquipment } from '../../entities/program';
import { Button } from '../../shared/ui/Controls';
import { ExercisePicker, useExerciseChoice } from './ExercisePicker';
import styles from './Workout.module.css';

export function AddExerciseForm({
  equipment,
  add,
}: {
  equipment: readonly HomeEquipment[];
  add: (exercise: ExerciseId) => void;
}) {
  const choice = useExerciseChoice(undefined, equipment);
  const [message, setMessage] = useState('');
  return (
    <details className={styles.addExercise}>
      <summary>Добавить упражнение из каталога</summary>
      <form
        className={styles.freeFields}
        onSubmit={(event) => {
          event.preventDefault();
          if (!choice.selected) return;
          add(choice.selected);
          setMessage(`Добавлено · ${exercises[choice.selected].title}`);
        }}
      >
        <ExercisePicker choice={choice} />
        <Button type="submit" disabled={!choice.selected}>
          Добавить один подход
        </Button>
      </form>
      <p role="status">{message}</p>
    </details>
  );
}
