import { useState } from 'react';

export function ExerciseGif({ src, title }: { src: string; title: string }) {
  const [state, setState] = useState<'loading' | 'ready' | 'failed'>('loading');
  return <div className="exercise-gif">
    {state === 'loading' && <small role="status">Загружаем GIF…</small>}
    {state === 'failed' && <small role="status">GIF сейчас недоступен.</small>}
    {state !== 'failed' && <img hidden={state !== 'ready'} src={src} alt={`Демонстрация: ${title}`}
      width="180" height="180" referrerPolicy="no-referrer" onLoad={() => setState('ready')} onError={() => setState('failed')}/>}
  </div>;
}
