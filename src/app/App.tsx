import { useEffect, useRef, useState } from 'react';
import {
  defaultEquipment,
  defaultPreferences,
  route,
  type WorkoutPreferences,
} from '../entities/program';
import {
  nextStop,
  progressStorageKey,
  readProgress,
  saveProgress,
  type Progress,
  type Session,
} from '../entities/progress';
import {
  createWorkout,
  readWorkoutDraft,
  saveWorkoutDraft,
  summarize,
  syncWorkoutDraft,
  workoutDraftKey,
  type Workout,
  type WorkoutDraftState,
} from '../features/workout';
import { CatalogPage } from '../pages/catalog';
import { HistoryPage } from '../pages/history';
import { RoutePage } from '../pages/route';
import { SettingsPage } from '../pages/settings';
import { WorkoutPage } from '../pages/workout';
import { WorkoutResult } from '../pages/workout/WorkoutResult';
import { resolveRoute } from './route';
import { useAppUpdate } from './useAppUpdate';
import './styles/global.css';
import ui from '../shared/ui/Common.module.css';
import styles from './App.module.css';

const navigation = [
  ['map', 'Карта'],
  ['history', 'История'],
  ['catalog', 'Упражнения'],
] as const;

export function App() {
  const [hash, setHash] = useState(() => location.hash);
  const [progress, setProgress] = useState(readProgress);
  const [draft, setDraft] = useState<WorkoutDraftState>(() => ({
    workout: readWorkoutDraft(progress),
    saveFailed: false,
  }));
  const { workout } = draft;
  const [progressSaveFailed, setProgressSaveFailed] = useState(false);
  const { offlineReady, updateAvailable, requested, requestUpdate } = useAppUpdate(
    workout !== null,
  );
  const screenElement = useRef<HTMLElement>(null);
  const firstRender = useRef(true);
  const screen = resolveRoute(hash, workout, route.length);
  const activeTab = screen.page === 'workout' || screen.page === 'result' ? 'map' : screen.page;
  const screenKey =
    screen.page === 'history' && screen.stopIndex !== undefined
      ? `history/${screen.stopIndex + 1}`
      : screen.page;

  useEffect(() => {
    const onHash = () => setHash(location.hash);
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    window.scrollTo(0, 0);
    screenElement.current?.querySelector('h1')?.focus({ preventScroll: true });
  }, [screenKey]);

  useEffect(() => {
    const sync = (event: StorageEvent) => {
      if (event.key !== null && event.key !== progressStorageKey && event.key !== workoutDraftKey)
        return;
      const savedProgress = readProgress();
      if (event.key !== workoutDraftKey) setProgress(savedProgress);
      const draftChanged = event.key !== progressStorageKey;
      const savedDraft = readWorkoutDraft(savedProgress);
      setDraft((current) => syncWorkoutDraft(current, savedDraft, savedProgress, draftChanged));
    };
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);

  function storeProgress(next: Progress) {
    setProgress(next);
    setProgressSaveFailed(!saveProgress(next));
  }

  function latestProgress() {
    const saved = readProgress();
    if (saved.sessions.length > progress.sessions.length || saved.round > progress.round)
      return saved;
    return progress;
  }

  function updateWorkout(next: Workout) {
    setDraft({ workout: next, saveFailed: !saveWorkoutDraft(next) });
  }

  function navigate(page: 'map' | 'workout' | `result/${number}/${number}`) {
    location.hash = page;
    setHash(location.hash);
  }

  function leaveWorkout(next: 'map' | `result/${number}/${number}` = 'map') {
    setDraft({ workout: null, saveFailed: !saveWorkoutDraft(null) });
    navigate(next);
  }

  function start(short: boolean) {
    if (!workout) {
      const latest = latestProgress();
      const index = nextStop(latest, route.length);
      if (index === -1) return;
      updateWorkout(createWorkout(index, latest.round, short, latest.preferences));
    }
    navigate('workout');
  }

  function finish(completed: Workout) {
    const latest = latestProgress();
    const entry = summarize(completed, latest.preferences?.bodyWeightKg);
    if (!latest.sessions.some((item) => item.stop === entry.stop && item.round === entry.round)) {
      const next = { ...latest, sessions: [...latest.sessions, entry] };
      if (!saveProgress(next)) {
        updateWorkout(completed);
        setProgressSaveFailed(true);
        return;
      }
      setProgressSaveFailed(false);
      setProgress(next);
    } else {
      setProgress(latest);
    }
    leaveWorkout(`result/${entry.round}/${entry.stop + 1}`);
  }

  function saveResultWeight(session: Session, bodyWeightKg: number) {
    const latest = latestProgress();
    storeProgress({
      ...latest,
      preferences: { ...(latest.preferences ?? defaultPreferences), bodyWeightKg },
      sessions: latest.sessions.map((entry) =>
        entry.round === session.round && entry.stop === session.stop
          ? { ...entry, bodyWeightKg }
          : entry,
      ),
    });
  }

  function restart() {
    const latest = latestProgress();
    if (nextStop(latest, route.length) === -1)
      storeProgress({ ...latest, round: latest.round + 1 });
    else setProgress(latest);
  }

  function changePreferences(preferences: WorkoutPreferences) {
    storeProgress({ ...latestProgress(), preferences });
  }

  function renderScreen() {
    switch (screen.page) {
      case 'workout':
        return (
          <WorkoutPage
            workout={screen.workout}
            history={progress.sessions}
            update={updateWorkout}
            finish={finish}
            discard={leaveWorkout}
          />
        );
      case 'history':
        return <HistoryPage sessions={progress.sessions} stopIndex={screen.stopIndex} />;
      case 'result': {
        const session = progress.sessions.find(
          (entry) => entry.round === screen.round && entry.stop === screen.stopIndex,
        );
        return session ? (
          <WorkoutResult
            session={session}
            saveWeight={(weight) => saveResultWeight(session, weight)}
          />
        ) : (
          <section className={ui.narrow}>
            <h1 tabIndex={-1}>Занятие не найдено</h1>
            <a href="#map">К карте</a>
          </section>
        );
      }
      case 'catalog':
        return <CatalogPage equipment={progress.preferences?.equipment ?? defaultEquipment} />;
      case 'settings':
        return (
          <SettingsPage
            preferences={progress.preferences ?? defaultPreferences}
            change={changePreferences}
          />
        );
      case 'map':
        return (
          <RoutePage
            progress={progress}
            inWorkout={workout !== null}
            offlineReady={offlineReady}
            start={start}
            restart={restart}
            changePreferences={changePreferences}
          />
        );
    }
  }

  return (
    <>
      <header className={styles.bar}>
        <div className={styles.barInner}>
          <a className={styles.brand} href="#map" aria-label="Тропа, на карту">
            <img src="./icon.svg" alt="" />
            ТРОПА<span> / </span>
            <small>Домашний фитнес</small>
          </a>
          <nav className={styles.navigation} aria-label="Разделы">
            {navigation.map(([id, label]) => (
              <a key={id} href={`#${id}`} aria-current={activeTab === id ? 'page' : undefined}>
                {label}
              </a>
            ))}
          </nav>
        </div>
      </header>
      <main className={ui.page} ref={screenElement}>
        {(progressSaveFailed || draft.saveFailed) && (
          <p role="status" className={styles.notice}>
            Браузер не сохранил изменения. Прогресс доступен до закрытия страницы.
          </p>
        )}
        {updateAvailable && (
          <div className={`${styles.notice} ${styles.updateNotice}`} role="status">
            <span>
              {requested && workout
                ? 'Приложение обновится после выхода из занятия.'
                : 'Доступна новая версия «Тропы».'}
            </span>
            <button
              type="button"
              className={ui.secondary}
              onClick={requestUpdate}
              disabled={requested}
            >
              {workout ? 'Обновить после тренировки' : 'Обновить'}
            </button>
          </div>
        )}
        <div className={styles.screenEnter} key={screenKey}>
          {renderScreen()}
        </div>
      </main>
    </>
  );
}
