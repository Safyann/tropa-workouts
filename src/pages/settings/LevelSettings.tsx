import { levels, type WorkoutLevel } from '../../entities/program';
import { LevelGuide } from './LevelGuide';
import { levelOptions } from './levelOptions';
import ui from '../../shared/ui/Common.module.css';
import styles from './Settings.module.css';

export function LevelSettings({
  selected,
  change,
}: {
  selected: WorkoutLevel;
  change: (level: WorkoutLevel) => void;
}) {
  return (
    <div className={ui.panel}>
      <p className={ui.subtitle}>
        Уровень влияет на план силовых и отдых между подходами. Выбери по тому, как ты занимался за
        последний месяц.
      </p>
      <fieldset className={styles.levelOptions}>
        <legend className={ui.srOnly}>Выбери уровень</legend>
        {levelOptions.map((level) => (
          <label className={styles.levelOption} key={level}>
            <input
              type="radio"
              name="level"
              value={level}
              checked={selected === level}
              aria-labelledby={`level-${level}`}
              aria-describedby={`level-${level}-description`}
              onChange={() => change(level)}
            />
            <span>
              <strong id={`level-${level}`}>{levels[level].title}</strong>
              <span className={styles.levelDescription} id={`level-${level}-description`}>
                {levels[level].description}
              </span>
            </span>
          </label>
        ))}
      </fieldset>
      <LevelGuide selected={selected} apply={change} />
    </div>
  );
}
