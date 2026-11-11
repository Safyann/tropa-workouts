import { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { defaultPreferences, route, type WorkoutPreferences } from '../entities/program';
import { nextStop, progressStorageKey, readProgress, saveProgress, type Progress } from '../entities/progress';
import { createWorkout, readWorkoutDraft, saveWorkoutDraft, summarize, workoutDraftKey, type Workout } from '../features/workout';
import { CatalogPage } from '../pages/catalog';
import { HistoryPage } from '../pages/history';
import { RoutePage } from '../pages/route';
import { SettingsPage } from '../pages/settings';
import { WorkoutPage } from '../pages/workout';
import { useAppUpdate } from './useAppUpdate';
import './styles.css';

const navigation = [
  ['map', 'Карта'],
  ['history', 'История'],
  ['catalog', 'Упражнения']
] as const;

function App() {
  const [view, setView] = useState(() => location.hash.slice(1));
  const [progress, setProgress] = useState(readProgress);
  const [workout, setWorkout] = useState(() => readWorkoutDraft(progress));
  const [storageFailed, setStorageFailed] = useState(false);
  const { offlineReady, updateAvailable, requested, requestUpdate } = useAppUpdate(workout !== null);
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
    const sync = (event: StorageEvent) => {
      if (event.key !== null && event.key !== progressStorageKey && event.key !== workoutDraftKey) return;
      const saved = readProgress();
      if (event.key !== workoutDraftKey) setProgress(saved);
      setWorkout(readWorkoutDraft(saved));
    };
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

  function updateWorkout(next: Workout) {
    setWorkout(next);
    setStorageFailed(!saveWorkoutDraft(next));
  }

  function leaveWorkout() {
    setStorageFailed(!saveWorkoutDraft(null));
    setWorkout(null);
    location.hash = 'map';
    setView('map');
  }

  function start(short: boolean) {
    if (!workout) {
      const latest = latestProgress();
      const index = nextStop(latest, route.length);
      if (index === -1) return;
      updateWorkout(createWorkout(index, latest.round, short, latest.preferences));
    }
    location.hash = 'workout';
    setView('workout');
  }

  function finish(completed: Workout) {
    const entry = summarize(completed);
    const latest = latestProgress();
    if (!latest.sessions.some(item => item.stop === entry.stop && item.round === entry.round)) {
      const next = { ...latest, sessions: [...latest.sessions, entry] };
      if (!saveProgress(next)) {
        updateWorkout(completed);
        setStorageFailed(true);
        return;
      }
      setProgress(next);
    } else {
      setProgress(latest);
    }
    leaveWorkout();
  }

  function restart() {
    const latest = latestProgress();
    if (nextStop(latest, route.length) === -1) storeProgress({ ...latest, round: latest.round + 1 });
    else setProgress(latest);
  }

  function changePreferences(preferences: WorkoutPreferences) {
    storeProgress({ ...latestProgress(), preferences });
  }

  const historyMatch = /^history\/(\d+)$/.exec(view);
  const requestedStop = historyMatch ? Number(historyMatch[1]) - 1 : -1;
  const historyStop = route[requestedStop] ? requestedStop : undefined;
  const tab = view === 'history' || historyStop !== undefined ? 'history'
    : view === 'catalog' || view === 'settings' ? view : 'map';
  const screenKey = view === 'workout' && workout ? 'workout' : tab === 'history' ? view : tab;
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
      {updateAvailable && <div className="notice update-notice" role="status">
        <span>{requested && workout ? 'Приложение обновится после выхода из занятия.' : 'Доступна новая версия «Тропы».'}</span>
        <button type="button" className="secondary" onClick={requestUpdate} disabled={requested}>
          {workout ? 'Обновить после тренировки' : 'Обновить'}
        </button>
      </div>}
      <div className="screen-enter" key={screenKey}>
        {view === 'workout' && workout
          ? <WorkoutPage workout={workout} history={progress.sessions} update={updateWorkout} finish={finish} discard={leaveWorkout}/>
          : tab === 'history' ? <HistoryPage sessions={progress.sessions} stopIndex={historyStop}/>
          : tab === 'catalog' ? <CatalogPage/>
          : tab === 'settings' ? <SettingsPage preferences={progress.preferences ?? defaultPreferences} change={changePreferences}/>
          : <RoutePage progress={progress} inWorkout={workout !== null} offlineReady={offlineReady}
              start={start} restart={restart} changePreferences={changePreferences}/>}
      </div>
    </main>
  </>;
}

createRoot(document.querySelector('#root')!).render(<App/>);
