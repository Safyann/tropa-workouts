import { formatTime } from '../../entities/progress';
import ui from '../../shared/ui/Common.module.css';
import styles from './Workout.module.css';

export function Timer({
  seconds,
  running,
  label,
  toggle,
}: {
  seconds: number;
  running: boolean;
  label: string;
  toggle: () => void;
}) {
  return (
    <div className={styles.timer}>
      <p className={ui.eyebrow}>{label}</p>
      <p className={styles.clock} role="timer">
        {formatTime(seconds)}
      </p>
      <button className={ui.secondary} onClick={toggle} disabled={seconds === 0}>
        {seconds === 0 ? 'Время вышло' : running ? 'Пауза' : 'Запустить таймер'}
      </button>
    </div>
  );
}
