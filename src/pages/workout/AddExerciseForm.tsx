import { useState } from 'react';
import { exercises, type ExerciseId, type HomeEquipment } from '../../entities/program';
import { ExercisePicker, useExerciseChoice } from './ExercisePicker';
import ui from '../../shared/ui/Common.module.css';
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
        <button className={ui.secondary} type="submit" disabled={!choice.selected}>
          Добавить один подход
        </button>
      </form>
      <p role="status">{message}</p>
    </details>
  );
}
