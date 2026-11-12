import { useEffect, useRef, useState } from 'react';
import {
  defaultEquipment,
  defaultPreferences,
  exercises,
  route,
  type WorkoutPreferences,
  type ProgramId,
} from '../entities/program';
import {
  nextStop,
  nextRoundNumber,
  editSavedSession,
  mergeProgressBackup,
  parseProgress,
  plannedWorkouts,
  progressStorageKey,
  readProgress,
  readSavedProgress,
  routeLength,
  saveProgress,
  sessionIdentity,
  switchProgram,
  trainingReport,
  workoutTemplateTitleLimit,
  type Effort,
  type Progress,
  type Session,
  type SessionChanges,
} from '../entities/progress';
import {
  createWorkout,
  prepareRestSound,
  readFreeStrengthDraft,
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
import { RoadmapPage } from '../pages/roadmap';
import { RoutePage } from '../pages/route';
import { SettingsPage } from '../pages/settings';
import { WorkoutPage } from '../pages/workout';
import { FreeWorkoutPage } from '../pages/workout/FreeWorkoutPage';
import { WorkoutResult } from '../pages/workout/WorkoutResult';
import { OnboardingDialog } from './OnboardingDialog';
import { dismissOnboarding, hasDismissedOnboarding } from './onboardingStorage';
import { resolveRoute } from './route';
import { Button } from '../shared/ui/Controls';
import { localDay } from '../shared/lib/calendarDates';
import { useAppUpdate } from './useAppUpdate';
import { useTabSwipe } from './useTabSwipe';
import { useTheme } from './useTheme';
import './styles/global.css';
import ui from '../shared/ui/Common.module.css';
import styles from './App.module.css';

const navigation = [
  ['map', 'Карта'],
  ['history', 'История'],
  ['catalog', 'Упражнения'],
  ['roadmap', 'Планы'],
] as const;

export function App() {
  const { theme, changeTheme } = useTheme();
  const [hash, setHash] = useState(() => location.hash);
  const [progress, setProgress] = useState(readProgress);
  const [draft, setDraft] = useState<WorkoutDraftState>(() => ({
    workout: readWorkoutDraft(progress),
    saveFailed: false,
  }));
  const { workout } = draft;
  const totalStops = routeLength(progress, workout?.index);
  const [progressSaveFailed, setProgressSaveFailed] = useState(false);
  const { offlineReady, updateAvailable, requested, requestUpdate } = useAppUpdate(
    workout !== null,
  );
  const screenElement = useRef<HTMLElement>(null);
  const firstRender = useRef(true);
  const screen = resolveRoute(hash, workout, route.length);
  const [onboarding, setOnboarding] = useState<'first-run' | 'replay' | null>(() => {
    if (
      screen.page !== 'map' ||
      hasDismissedOnboarding() ||
      workout ||
      readSavedProgress() ||
      readFreeStrengthDraft()
    )
      return null;
    return 'first-run';
  });
  const activeTab = ['workout', 'result', 'free', 'free-result'].includes(screen.page)
    ? 'map'
    : screen.page;
  const tabIndex = navigation.findIndex(([id]) => id === screen.page);
  const tabSwipe = useTabSwipe(tabIndex >= 0, (offset) => {
    const next = navigation[tabIndex + offset];
    if (next) location.hash = next[0];
  });
  const historyScreenKey =
    screen.page === 'history' && screen.stopIndex !== undefined
      ? `history/${screen.program ?? 'home'}/${screen.stopIndex + 1}`
      : screen.page;
  const screenKey =
    screen.page === 'settings' && screen.section ? `settings/${screen.section}` : historyScreenKey;

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

  function storeProgress(next: Progress, requireSaved = false) {
    const saved = saveProgress(next);
    if (saved || !requireSaved) setProgress(next);
    setProgressSaveFailed(!saved);
    return saved;
  }

  function latestProgress() {
    return progressSaveFailed ? progress : (readSavedProgress() ?? progress);
  }

  function updateWorkout(next: Workout) {
    setDraft({ workout: next, saveFailed: !saveWorkoutDraft(next) });
  }

  function navigate(page: 'map' | 'workout' | `result/${string}`) {
    location.hash = page;
    setHash(location.hash);
  }

  function leaveWorkout(next: 'map' | `result/${number}/${number}` = 'map') {
    setDraft({ workout: null, saveFailed: !saveWorkoutDraft(null) });
    navigate(next);
  }

  function start(short: boolean) {
    if (progress.preferences?.restSound) prepareRestSound();
    if (!workout) {
      const latest = latestProgress();
      const index = nextStop(latest, routeLength(latest));
      if (index === -1) return;
      updateWorkout(createWorkout(index, latest.round, short, latest.preferences));
    }
    navigate('workout');
  }

  function finish(completed: Workout) {
    const latest = latestProgress();
    const entry = summarize(completed, latest.preferences?.bodyWeightKg);
    if (!latest.sessions.some((item) => sessionIdentity(item) === sessionIdentity(entry))) {
      const next = { ...latest, sessions: [...latest.sessions, entry] };
      const total = routeLength(latest, completed.index);
      if (isCurrentRouteSession(entry, latest) && nextStop(next, total) === -1)
        entry.roundTotal = total;
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

  function saveFreeWorkout(session: Omit<Session, 'round'>) {
    const latest = latestProgress();
    const entry = { ...session, round: latest.round };
    if (
      !latest.sessions.some((item) => sessionIdentity(item) === sessionIdentity(entry)) &&
      !storeProgress({ ...latest, sessions: [...latest.sessions, entry] }, true)
    )
      return false;
    navigate(`result/${sessionIdentity(entry)}`);
    return true;
  }

  function saveTemplate(session: Session, title: string) {
    if (!session.freeId || session.elapsed !== null) return false;
    const name = title.trim().slice(0, workoutTemplateTitleLimit);
    const ids = [...new Set(session.sets.map(({ exercise }) => exercise))].filter((id) =>
      Object.hasOwn(exercises, id),
    );
    if (!name || !ids.length) return false;
    const latest = latestProgress();
    const templates = (latest.templates ?? []).filter(({ id }) => id !== session.freeId);
    return storeProgress(
      { ...latest, templates: [...templates, { id: session.freeId, title: name, exercises: ids }] },
      true,
    );
  }

  function removeTemplate(id: string) {
    const latest = latestProgress();
    return storeProgress(
      { ...latest, templates: (latest.templates ?? []).filter((template) => template.id !== id) },
      true,
    );
  }

  function roundReportFor(session: Session) {
    if (session.freeId) return;
    const current = isCurrentRouteSession(session, progress);
    const goal = current ? routeLength(progress) : session.roundTotal;
    if (!goal || (current && nextStop(progress, goal) !== -1)) return;
    const sessions = progress.sessions.filter(
      (entry) =>
        !entry.freeId && entry.round === session.round && entry.program === session.program,
    );
    return { goal, report: trainingReport(sessions) };
  }

  function saveResultWeight(session: Session, bodyWeightKg: number) {
    const latest = latestProgress();
    storeProgress({
      ...latest,
      preferences: { ...(latest.preferences ?? defaultPreferences), bodyWeightKg },
      sessions: latest.sessions.map((entry) =>
        sessionIdentity(entry) === sessionIdentity(session) ? { ...entry, bodyWeightKg } : entry,
      ),
    });
  }

  function saveResultEffort(session: Session, effort: Effort | undefined) {
    const latest = latestProgress();
    storeProgress({
      ...latest,
      sessions: latest.sessions.map((entry) =>
        sessionIdentity(entry) === sessionIdentity(session) ? { ...entry, effort } : entry,
      ),
    });
  }

  function editHistorySession(session: Session, changes: SessionChanges) {
    const latest = latestProgress();
    const next = editSavedSession(latest, sessionIdentity(session), changes);
    if (!next) return 'Занятие уже удалено.';
    if (!storeProgress(next, true)) return 'Браузер не сохранил изменения.';
  }

  function isCurrentRouteSession(session: Session, source: Progress) {
    return (
      !session.freeId &&
      session.round === source.round &&
      session.program === source.preferences?.program
    );
  }

  function withoutSession(source: Progress, session: Session): Progress {
    return {
      ...source,
      sessions: source.sessions.filter(
        (entry) => sessionIdentity(entry) !== sessionIdentity(session),
      ),
    };
  }

  function reopensStop(session: Session) {
    return (
      isCurrentRouteSession(session, progress) &&
      session.stop < routeLength(withoutSession(progress, session))
    );
  }

  function deleteHistorySession(session: Session) {
    const latest = latestProgress();
    const currentRoute = isCurrentRouteSession(session, latest);
    // Удаление предыдущей остановки меняет порядок прохождения и может сделать черновик недействительным.
    if (currentRoute && (workout || readWorkoutDraft(latest)))
      return 'Заверши начатую тренировку перед удалением занятия из текущего маршрута.';
    const next = withoutSession(latest, session);
    if (currentRoute) next.movedWorkout = undefined;
    if (!storeProgress(next, true)) return 'Браузер не удалил занятие.';
  }

  function restart() {
    const latest = latestProgress();
    if (workout || nextStop(latest, routeLength(latest)) !== -1) return;
    const preferences = latest.preferences;
    const schedule = preferences?.schedule;
    storeProgress({
      ...latest,
      round: nextRoundNumber(latest),
      movedWorkout: undefined,
      preferences:
        preferences && schedule
          ? { ...preferences, schedule: { ...schedule, start: localDay(Date.now()) } }
          : preferences,
    });
  }

  function chooseProgram(program: ProgramId | undefined) {
    const latest = latestProgress();
    if (workout || readWorkoutDraft(latest) || program === latest.preferences?.program) return;
    storeProgress(switchProgram(latest, program));
  }

  function changePreferences(preferences: WorkoutPreferences) {
    const latest = latestProgress();
    const prior = latest.preferences?.schedule;
    const next = preferences.schedule;
    const sameSchedule =
      prior?.start === next?.start &&
      prior?.days.join(',') === next?.days.join(',') &&
      prior?.paused === next?.paused;
    storeProgress({
      ...latest,
      preferences,
      movedWorkout: sameSchedule ? latest.movedWorkout : undefined,
    });
  }

  function moveWorkout(day: number) {
    const latest = latestProgress();
    const next = plannedWorkouts(latest, workout?.index)[0];
    if (next && day >= localDay(Date.now()))
      storeProgress({ ...latest, movedWorkout: { round: latest.round, stop: next.stop, day } });
  }

  function updateSchedule(paused: boolean) {
    const latest = latestProgress();
    const preferences = latest.preferences;
    const schedule = preferences?.schedule;
    if (!preferences || !schedule) return;
    storeProgress({
      ...latest,
      movedWorkout: undefined,
      preferences: {
        ...preferences,
        schedule: {
          ...schedule,
          start: paused ? schedule.start : localDay(Date.now()),
          paused: paused || undefined,
        },
      },
    });
  }

  function restoreBackup(contents: string) {
    const backup = parseProgress(contents, true);
    if (!backup) return 'Не удалось восстановить историю. Выбери файл резервной копии «Тропы».';
    const latest = latestProgress();
    if (workout || readWorkoutDraft(latest))
      return 'Заверши текущее занятие перед восстановлением истории.';
    const merged = mergeProgressBackup(latest, backup);
    if (!storeProgress(merged, true)) return 'Браузер не сохранил восстановленную историю.';
    const added = merged.sessions.length - latest.sessions.length;
    return added
      ? `История восстановлена. Добавлено занятий: ${added}.`
      : 'Резервная копия загружена. Новых занятий нет.';
  }

  function renderScreen() {
    switch (screen.page) {
      case 'workout':
        return (
          <WorkoutPage
            workout={screen.workout}
            totalStops={totalStops}
            restSound={progress.preferences?.restSound}
            history={progress.sessions}
            update={updateWorkout}
            finish={finish}
            discard={leaveWorkout}
          />
        );
      case 'history':
        return (
          <HistoryPage
            sessions={progress.sessions}
            stopIndex={screen.stopIndex}
            program={screen.program}
            planned={plannedWorkouts(progress, workout?.index)}
            editSession={editHistorySession}
            deleteSession={deleteHistorySession}
            reopensStop={reopensStop}
          />
        );
      case 'free':
        return (
          <FreeWorkoutPage
            save={saveFreeWorkout}
            templates={progress.templates}
            removeTemplate={removeTemplate}
          />
        );
      case 'result':
      case 'free-result': {
        const session = progress.sessions.find((entry) =>
          screen.page === 'free-result'
            ? entry.freeId === screen.freeId
            : !entry.freeId && entry.round === screen.round && entry.stop === screen.stopIndex,
        );
        return session ? (
          <WorkoutResult
            session={session}
            history={progress.sessions}
            saveWeight={(weight) => saveResultWeight(session, weight)}
            saveEffort={(effort) => saveResultEffort(session, effort)}
            templateTitle={progress.templates?.find(({ id }) => id === session.freeId)?.title}
            saveTemplate={(title) => saveTemplate(session, title)}
            roundSummary={roundReportFor(session)}
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
      case 'roadmap':
        return <RoadmapPage />;
      case 'settings':
        return (
          <SettingsPage
            section={screen.section}
            theme={theme}
            changeTheme={changeTheme}
            preferences={progress.preferences ?? defaultPreferences}
            change={changePreferences}
            progress={progress}
            restore={restoreBackup}
            openOnboarding={() => setOnboarding('replay')}
          />
        );
      case 'map':
        return (
          <RoutePage
            progress={progress}
            activeStop={workout?.index}
            offlineReady={offlineReady}
            start={start}
            restart={restart}
            changePreferences={changePreferences}
            moveWorkout={moveWorkout}
            updateSchedule={updateSchedule}
            chooseProgram={chooseProgram}
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
      <main className={ui.page} ref={screenElement} {...tabSwipe}>
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
            <Button type="button" onClick={requestUpdate} disabled={requested}>
              {workout ? 'Обновить после тренировки' : 'Обновить'}
            </Button>
          </div>
        )}
        <div className={styles.screenEnter} key={screenKey}>
          {renderScreen()}
        </div>
      </main>
      {((onboarding === 'first-run' && screen.page === 'map') || onboarding === 'replay') && (
        <OnboardingDialog
          onDismiss={() => {
            dismissOnboarding();
            setOnboarding(null);
            if (onboarding === 'first-run') {
              screenElement.current?.querySelector('h1')?.focus({ preventScroll: true });
            }
          }}
        />
      )}
    </>
  );
}
