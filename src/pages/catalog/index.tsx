import { useEffect, useRef, useState, type FormEvent } from 'react';
import { searchExercises, type CatalogExercise } from '../../shared/api/exerciseDb';

type Result =
  | { state: 'idle' | 'loading' | 'failed' }
  | { state: 'loaded'; items: CatalogExercise[] };

export function CatalogPage() {
  const [result, setResult] = useState<Result>({ state: 'idle' });
  const [shown, setShown] = useState<string | null>(null);
  const [broken, setBroken] = useState<string | null>(null);
  const request = useRef<AbortController | null>(null);
  useEffect(() => () => request.current?.abort(), []);

  async function search(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = String(new FormData(event.currentTarget).get('query') ?? '').trim();
    if (!query) return;
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    setResult({ state: 'loading' });
    setShown(null);
    setBroken(null);
    try {
      const items = await searchExercises(query, controller.signal);
      if (!controller.signal.aborted) setResult({ state: 'loaded', items });
    } catch {
      if (!controller.signal.aborted) setResult({ state: 'failed' });
    }
  }

  return <section className="narrow">
    <p className="eyebrow">ОНЛАЙН-КАТАЛОГ</p><h1 tabIndex={-1}>Упражнения<span>.</span></h1>
    <p className="subtitle">Найди упражнение по английскому названию и посмотри движение.</p>
    <form className="catalog-form" onSubmit={search}>
      <label htmlFor="exercise-query">Название упражнения</label>
      <div><input id="exercise-query" name="query" type="search" placeholder="dumbbell press" required maxLength={100}/>
        <button className="primary" type="submit">Найти</button></div>
    </form>
    <div aria-live="polite" className="catalog-status">
      {result.state === 'loading' && 'Ищем упражнения…'}
      {result.state === 'failed' && 'Каталог сейчас недоступен. Проверь подключение и повтори поиск. Домашний маршрут доступен на карте.'}
      {result.state === 'loaded' && (result.items.length ? `Найдено: ${result.items.length}` : 'Ничего не нашлось. Попробуй другой запрос.')}
    </div>
    {result.state === 'loaded' && <ul className="catalog-list">{result.items.map(item => {
      const open = shown === item.exerciseId;
      return <li className="history-row" key={item.exerciseId}>
        <strong lang="en">{item.name}</strong>
        <button className="secondary" aria-expanded={open} onClick={() => setShown(open ? null : item.exerciseId)}>
          {open ? 'Скрыть' : 'Показать GIF'}
        </button>
        {open && (broken === item.exerciseId
          ? <p className="hint">Демонстрация временно недоступна.</p>
          : <img src={item.gifUrl} alt={`Демонстрация: ${item.name}`} width="180" height="180"
              referrerPolicy="no-referrer" onError={() => setBroken(item.exerciseId)}/>)}
      </li>;
    })}</ul>}
    <footer className="foot"><span>Данные и GIF — <a href="https://exercisedb.dev/docs" target="_blank" rel="noreferrer">ExerciseDB / AscendAPI ↗</a></span></footer>
  </section>;
}
