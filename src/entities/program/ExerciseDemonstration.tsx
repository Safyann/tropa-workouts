import { useState } from 'react';
import { Button } from '../../shared/ui/Controls';
import styles from './ExerciseDemonstration.module.css';

export function ExerciseDemonstration({
  title,
  demo,
  autoPlay = false,
}: {
  title: string;
  demo: string | undefined;
  autoPlay?: boolean;
}) {
  const [playing, setPlaying] = useState(
    () => autoPlay && !window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );

  if (!demo) {
    const query = encodeURIComponent(`${title} техника выполнения на русском`);
    return (
      <a
        className={styles.videoSearch}
        href={`https://yandex.ru/video/search?text=${query}`}
        target="_blank"
        rel="noreferrer"
        aria-label={`Найти видео техники упражнения «${title}» в Яндексе`}
      >
        Найти видео техники в Яндексе ↗
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
