import { useState } from 'react';
import { Button } from '../../shared/ui/Controls';
import styles from './ExerciseDemonstration.module.css';

export function ExerciseDemonstration({
  title,
  demo,
  videoUrl,
  autoPlay = false,
}: {
  title: string;
  demo: string | undefined;
  videoUrl?: string;
  autoPlay?: boolean;
}) {
  const [playing, setPlaying] = useState(
    () => autoPlay && !window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );

  if (!demo) {
    if (!videoUrl) return null;
    return (
      <a
        className={styles.videoLink}
        href={videoUrl}
        target="_blank"
        rel="noreferrer"
        aria-label={`Смотреть технику упражнения «${title}» на YouTube`}
      >
        Смотреть на YouTube ↗
      </a>
    );
  }

  return (
    <div className={styles.demo}>
      <img
        src={`${import.meta.env.BASE_URL}exercise-demos/${demo}.${playing ? 'gif' : 'png'}`}
        width={320}
        height={208}
        loading={autoPlay ? 'eager' : 'lazy'}
        alt={`Схема движения: ${title}`}
      />
      <Button variant="plain" type="button" onClick={() => setPlaying(!playing)}>
        {playing ? 'Остановить анимацию' : 'Показать движение'}
      </Button>
    </div>
  );
}
