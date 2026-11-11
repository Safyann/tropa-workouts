import { useState } from 'react';
import { ExerciseInstructions, type KineticExerciseId } from '../../entities/program';
import styles from './Catalog.module.css';

export function CatalogTechnique({ id }: { id: KineticExerciseId }) {
  const [opened, setOpened] = useState(false);
  return (
    <details
      className={styles.catalogTechnique}
      onToggle={(event) => {
        if (event.currentTarget.open) setOpened(true);
      }}
    >
      <summary>Техника выполнения</summary>
      {opened && <ExerciseInstructions source={id} ordered />}
    </details>
  );
}
