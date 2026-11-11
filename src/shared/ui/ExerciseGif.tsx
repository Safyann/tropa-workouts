import { useState } from 'react';
import styles from './ExerciseGif.module.css';

export function ExerciseGif({
  src,
  title,
  className,
}: {
  src: string;
  title: string;
  className?: string;
}) {
  const [state, setState] = useState<'loading' | 'ready' | 'failed'>('loading');
  return (
    <div className={className ? `${styles.container} ${className}` : styles.container}>
      {state === 'loading' && <small role="status">Загружаем GIF…</small>}
      {state === 'failed' && <small role="status">GIF сейчас недоступен.</small>}
      {state !== 'failed' && (
        <img
          hidden={state !== 'ready'}
          src={src}
          alt={`Демонстрация: ${title}`}
          width="180"
          height="180"
          referrerPolicy="no-referrer"
          onLoad={() => setState('ready')}
          onError={() => setState('failed')}
        />
      )}
    </div>
  );
}
