import {
  availableExerciseByGroup,
  muscleGroups,
  type WorkoutPreferences,
} from '../../entities/program';
import ui from '../../shared/ui/Common.module.css';
import formStyles from '../../shared/ui/SettingsForm.module.css';
import styles from './Route.module.css';

export function MuscleGroupPicker({
  preferences,
  change,
}: {
  preferences: WorkoutPreferences;
  change: (preferences: WorkoutPreferences) => void;
}) {
  const available = availableExerciseByGroup(preferences);
  const savedGroups = preferences.muscleGroups;
  const selected = muscleGroups.filter(
    (group) => available.has(group) && Array.isArray(savedGroups) && savedGroups.includes(group),
  );

  return (
    <details className={styles.dayPreview}>
      <summary>Группы мышц{selected.length > 0 && ` · ${selected.length}`}</summary>
      <fieldset className={styles.muscleGroups}>
        <legend>Выбери одну или несколько групп</legend>
        <div className={formStyles.fields}>
          {muscleGroups.map((group) => (
            <label className={formStyles.toggle} key={group}>
              <input
                type="checkbox"
                checked={selected.includes(group)}
                disabled={!available.has(group)}
                onChange={(event) =>
                  change({
                    ...preferences,
                    muscleGroups: event.target.checked
                      ? [...selected, group]
                      : selected.filter((item) => item !== group),
                  })
                }
              />
              {group}
              {!available.has(group) && ' · нет подходящих упражнений'}
            </label>
          ))}
        </div>
      </fieldset>
      <p className={ui.hint}>Сними все отметки, чтобы вернуться к плану маршрута.</p>
    </details>
  );
}
