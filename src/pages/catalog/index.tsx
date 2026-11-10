import { useEffect, useRef, useState, type FormEvent } from 'react';
import { browseExercises, searchExercises, type CatalogExercise } from '../../shared/api/exerciseDb';
import { ExerciseGif } from '../../shared/ui/ExerciseGif';

export function CatalogPage() {
  const [items, setItems] = useState<CatalogExercise[]>([]);
  const [next, setNext] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'failed' | 'loaded'>('idle');
  const [shown, setShown] = useState<string | null>(null);
  const request = useRef<AbortController | null>(null);
  useEffect(() => () => request.current?.abort(), []);

  async function load(query: string | null, cursor: string | null = null) {
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    setStatus('loading');
    if (!cursor) {
      setItems([]);
      setNext(null);
      setShown(null);
    }
    try {
      const result = query
        ? { items: await searchExercises(query, controller.signal), next: null }
        : await browseExercises(cursor, controller.signal);
      if (controller.signal.aborted) return;
      setItems(previous => cursor ? [...previous, ...result.items] : result.items);
      setNext(result.next);
      setStatus('loaded');
    } catch {
      if (!controller.signal.aborted) setStatus('failed');
    }
  }

  function search(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = String(new FormData(event.currentTarget).get('query') ?? '').trim();
    if (query) void load(query);
  }

  return <section className="narrow">
    <p className="eyebrow">ОНЛАЙН-КАТАЛОГ</p><h1 tabIndex={-1}>Упражнения<span>.</span></h1>
    <p className="subtitle">Найди упражнение по английскому названию и посмотри движение.</p>
    <form className="catalog-form" onSubmit={search}>
      <label htmlFor="exercise-query">Название упражнения</label>
      <div><input id="exercise-query" name="query" type="search" placeholder="dumbbell press" required maxLength={100}/>
        <button className="primary" type="submit">Найти</button></div>
    </form>
    <button className="secondary catalog-browse" onClick={() => void load(null)}>Открыть всю базу</button>
    <div aria-live="polite" className="catalog-status">
      {status === 'loading' && 'Загружаем упражнения…'}
      {status === 'failed' && 'Каталог сейчас недоступен. Проверь подключение и повтори запрос. Домашний маршрут доступен на карте.'}
      {status === 'loaded' && (items.length ? `Показано: ${items.length}` : 'Ничего не нашлось. Попробуй другой запрос.')}
    </div>
    {items.length > 0 && <ul className="catalog-list">{items.map(item => {
      const open = shown === item.exerciseId;
      return <li className="history-row" key={item.exerciseId}>
        <strong lang="en">{item.name}</strong>
        <button className="secondary" aria-expanded={open} onClick={() => setShown(open ? null : item.exerciseId)}>
          {open ? 'Скрыть' : 'Показать GIF'}
        </button>
        {open && <ExerciseGif src={item.gifUrl} title={item.name}/>}
      </li>;
    })}</ul>}
    {next && <button className="secondary" disabled={status === 'loading'} onClick={() => void load(null, next)}>Показать ещё</button>}
    <footer className="foot"><span>Данные и GIF — <a href="https://exercisedb.dev/docs" target="_blank" rel="noreferrer">ExerciseDB / AscendAPI ↗</a></span></footer>
  </section>;
}
