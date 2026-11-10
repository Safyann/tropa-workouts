import { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { route } from '../entities/program';
import { nextStop, readProgress, saveProgress, type Progress } from '../entities/progress';
import { createWorkout, summarize, type Workout } from '../features/workout';
import { CatalogPage } from '../pages/catalog';
import { HistoryPage } from '../pages/history';
import { RoutePage } from '../pages/route';
import { WorkoutPage } from '../pages/workout';
import './styles.css';

const navigation = [
  ['map', 'Карта'],
  ['history', 'История'],
  ['catalog', 'Упражнения']
] as const;

function App() {
  const [view, setView] = useState(() => location.hash.slice(1));
  const [progress, setProgress] = useState(readProgress);
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [storageFailed, setStorageFailed] = useState(false);
  const [offlineReady, setOfflineReady] = useState(false);
  const screen = useRef<HTMLElement>(null);
  const firstRender = useRef(true);

  useEffect(() => {
    const onHash = () => setView(location.hash.slice(1));
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    window.scrollTo(0, 0);
    screen.current?.querySelector('h1')?.focus({ preventScroll: true });
  }, [view]);

  useEffect(() => {
    if (!import.meta.env.PROD || !('serviceWorker' in navigator)) return;
    navigator.serviceWorker.register('./sw.js')
      .then(() => navigator.serviceWorker.ready)
      .then(() => setOfflineReady(true))
      .catch(() => setOfflineReady(false));
  }, []);

  useEffect(() => {
    const sync = () => setProgress(readProgress());
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);

  function storeProgress(next: Progress) {
    setProgress(next);
    setStorageFailed(!saveProgress(next));
  }

  function latestProgress() {
    const saved = readProgress();
    if (saved.sessions.length > progress.sessions.length || saved.round > progress.round) return saved;
    return progress;
  }

  function start(short: boolean) {
    if (!workout) {
      const latest = latestProgress();
      const index = nextStop(latest, route.length);
      if (index === -1) return;
      setWorkout(createWorkout(index, latest.round, short));
    }
    location.hash = 'workout';
    setView('workout');
  }

  function finish(completed: Workout) {
    const entry = summarize(completed);
    const latest = latestProgress();
    if (!latest.sessions.some(item => item.stop === entry.stop && item.round === entry.round)) {
      storeProgress({ ...latest, sessions: [...latest.sessions, entry] });
    } else {
      setProgress(latest);
    }
    setWorkout(null);
    location.hash = 'map';
    setView('map');
  }

  function restart() {
    const latest = latestProgress();
    if (nextStop(latest, route.length) === -1) storeProgress({ ...latest, round: latest.round + 1 });
    else setProgress(latest);
  }

  const tab = view === 'history' || view === 'catalog' ? view : 'map';
  return <>
    <header className="bar"><div className="bar-inner">
      <a className="brand" href="#map" aria-label="Тропа, на карту">
        <img src="./icon.svg" alt=""/>ТРОПА<span> / </span><small>Домашний фитнес</small>
      </a>
      <nav aria-label="Разделы">{navigation.map(([id, label]) =>
        <a key={id} href={`#${id}`} aria-current={tab === id ? 'page' : undefined}>{label}</a>)}</nav>
    </div></header>
    <main className="page" ref={screen}>
      {storageFailed && <p role="status" className="notice">Браузер не сохранил изменения. Прогресс доступен до закрытия страницы.</p>}
      {view === 'workout' && workout
        ? <WorkoutPage workout={workout} history={progress.sessions} update={setWorkout} finish={finish}/>
        : tab === 'history' ? <HistoryPage sessions={progress.sessions}/>
        : tab === 'catalog' ? <CatalogPage/>
        : <RoutePage progress={progress} inWorkout={workout !== null} offlineReady={offlineReady} start={start} restart={restart}/>}
    </main>
  </>;
}

createRoot(document.querySelector('#root')!).render(<App/>);
