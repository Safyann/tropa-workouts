import { useEffect, useMemo, useRef, useState } from 'react';
import {
  cardioTitles,
  exercises,
  programRoute,
  type ExerciseId,
  type ProgramId,
} from '../../entities/program';
import {
  estimatedCalories,
  exerciseNote,
  effortLabels,
  exerciseProgress,
  formatTime,
  sessionIdentity,
  sessionTitle,
  type PlannedWorkout,
  type Session,
  type SessionChanges,
} from '../../entities/progress';
import { BackLink, ButtonLink } from '../../shared/ui/NavigationLinks';
import { PageTitle } from '../../shared/ui/PageTitle';
import { Button } from '../../shared/ui/Controls';
import { Icon } from '../../shared/ui/Icon';
import { localDay } from '../../shared/lib/calendarDates';
import { ExerciseProgress } from './ExerciseProgress';
import { HistoryCalendar } from './HistoryCalendar';
import { HistorySessionActions } from './HistorySessionActions';
import ui from '../../shared/ui/Common.module.css';
import styles from './History.module.css';

const dateFormat = new Intl.DateTimeFormat('ru', { day: 'numeric', month: 'short' });
const selectedDateFormat = new Intl.DateTimeFormat('ru', { dateStyle: 'long' });

const noPlans: readonly PlannedWorkout[] = [];

export function HistoryPage({
  sessions,
  stopIndex,
  program,
  planned = noPlans,
  editSession,
  deleteSession,
  reopensStop,
}: {
  sessions: Session[];
  stopIndex?: number;
  program?: ProgramId;
  planned?: readonly PlannedWorkout[];
  editSession?: (session: Session, changes: SessionChanges) => string | undefined;
  deleteSession?: (session: Session) => string | undefined;
  reopensStop?: (session: Session) => boolean;
}) {
  const [selectedExercise, setSelectedExercise] = useState<ExerciseId>();
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const progressHeading = useRef<HTMLHeadingElement>(null);
  const calendar = useRef<HTMLDetailsElement>(null);
  const dateHeading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (selectedDay !== null) dateHeading.current?.focus();
  }, [selectedDay]);
  const stop = stopIndex === undefined ? undefined : programRoute(program)[stopIndex];
  const entries = useMemo(
    () =>
      stopIndex === undefined
        ? sessions
        : sessions.filter(
            (entry) => !entry.freeId && entry.program === program && entry.stop === stopIndex,
          ),
    [sessions, stopIndex, program],
  );
  const entriesByExercise = useMemo(() => exerciseProgress(entries), [entries]);
  const visibleEntries = entries
    .filter(({ date }) => selectedDay === null || localDay(date) === selectedDay)
    .sort((first, second) => second.date - first.date);
  const applicablePlans =
    stopIndex === undefined
      ? planned
      : planned.filter((entry) => entry.program === program && entry.stop === stopIndex);
  const selectedPlans = applicablePlans.filter(({ day }) => day === selectedDay);
  const selected =
    selectedExercise && entriesByExercise.has(selectedExercise)
      ? selectedExercise
      : entriesByExercise.keys().next().value;

  function showProgress(exercise: ExerciseId) {
    setSelectedExercise(exercise);
    progressHeading.current?.focus();
  }

  const progressView = selected ? (
    <ExerciseProgress
      entriesByExercise={entriesByExercise}
      selected={selected}
      select={setSelectedExercise}
      headingRef={progressHeading}
    />
  ) : (
    !stop &&
    entries.length > 0 && (
      <section className={ui.panel}>
        <h2>Прогресс по упражнениям</h2>
        <p className={ui.subtitle}>Здесь появится динамика, когда ты запишешь вес или повторы.</p>
      </section>
    )
  );

  return (
    <section className={ui.narrow}>
      {stop && <BackLink href="#map">К карте</BackLink>}
      <p className={ui.eyebrow}>{stop ? 'ИСТОРИЯ ОСТАНОВКИ' : 'ТВОЙ МАРШРУТ'}</p>
      <PageTitle>{stop?.title ?? 'История'}</PageTitle>
      <p className={ui.subtitle}>
        {stop ? `Занятий на этой остановке: ${entries.length}` : 'Занятия, которые ты прошёл.'}
      </p>
      <details className={styles.calendarDetails} ref={calendar}>
        <summary>Календарь тренировок</summary>
        <HistoryCalendar
          sessions={entries}
          planned={applicablePlans}
          selectedDay={selectedDay}
          selectDay={(day) => {
            setSelectedDay(day);
            if (day !== null && calendar.current) calendar.current.open = false;
          }}
        />
      </details>
      <div id="history-sessions" className={styles.historyList}>
        {selectedDay !== null && (
          <div className={styles.dayFilter}>
            <h2 ref={dateHeading} tabIndex={-1}>
              Занятия за {selectedDateFormat.format(selectedDay)}
            </h2>
            <Button type="button" onClick={() => setSelectedDay(null)}>
              Все занятия
            </Button>
          </div>
        )}
        {selectedDay === null && visibleEntries.length > 0 && <h2>Последние занятия</h2>}
        {selectedPlans.map(({ stop, program }) => (
          <p className={styles.plannedWorkout} key={stop}>
            Запланировано · {programRoute(program)[stop].title}
          </p>
        ))}
        {selectedDay !== null && visibleEntries.length === 0 && selectedPlans.length === 0 ? (
          <p className={ui.subtitle}>За этот день занятий нет.</p>
        ) : selectedDay === null && visibleEntries.length === 0 ? (
          <div className={styles.empty}>
            <h2>Здесь пока тихо</h2>
            <p>Первая тренировка появится после того, как зажжёшь костёр.</p>
            <ButtonLink href="#map">К карте</ButtonLink>
          </div>
        ) : (
          visibleEntries.map((entry, index) => {
            const entryStop = programRoute(entry.program)[entry.stop];
            const calories = estimatedCalories(entry);
            const activity = entry.cardioActivity
              ? cardioTitles[entry.cardioActivity]
              : entryStop.type;
            const icon = entry.freeId
              ? entry.elapsed === null
                ? 'strength'
                : 'cardio'
              : entryStop.icon;
            return (
              <details
                className={styles.historyRow}
                key={sessionIdentity(entry)}
                open={stop && index === 0 ? true : undefined}
              >
                <summary>
                  <span className={ui.typeIcon}>
                    <Icon name={icon} />
                  </span>
                  <span>
                    <strong>{sessionTitle(entry)}</strong>
                    <small>
                      {activity} ·{' '}
                      {entry.freeId
                        ? 'Вне маршрута'
                        : entry.short
                          ? 'Короткое занятие'
                          : 'Обычное занятие'}
                      {entry.partial && ' · Досрочно'}
                      {entry.durationSeconds !== undefined &&
                        ` · ${formatTime(entry.durationSeconds)}`}
                    </small>
                  </span>
                  <time dateTime={new Date(entry.date).toISOString()}>
                    {dateFormat.format(entry.date)}
                  </time>
                </summary>
                <div className={styles.historyDetail}>
                  {entry.durationSeconds !== undefined && (
                    <p className={styles.historyDuration}>
                      Всё занятие · {formatTime(entry.durationSeconds)}
                    </p>
                  )}
                  {calories !== undefined && (
                    <p className={styles.historyDuration}>Активный расход · ≈ {calories} ккал</p>
                  )}
                  {entry.effort && (
                    <p className={styles.historyDuration}>
                      Оценка нагрузки · {effortLabels[entry.effort]}
                    </p>
                  )}
                  {entry.elapsed !== null ? (
                    <>Основная часть · {formatTime(entry.elapsed)}</>
                  ) : (
                    <>
                      <ul>
                        {[...new Set(entry.sets.map((set) => set.exercise))].map((id) => {
                          const sets = entry.sets.filter((set) => set.exercise === id);
                          const title = exercises[id]?.title ?? id;
                          const note = exerciseNote(entry.notes, id);
                          return (
                            <li key={id}>
                              {entriesByExercise.has(id) ? (
                                <Button
                                  variant="plain"
                                  className={styles.exerciseLink}
                                  type="button"
                                  onClick={() => showProgress(id)}
                                  aria-label={`Показать прогресс: ${title}`}
                                >
                                  {title}
                                </Button>
                              ) : (
                                <b>{title}</b>
                              )}{' '}
                              <span>
                                {sets
                                  .map(
                                    (set) =>
                                      [
                                        set.reps === null ? '' : `${set.reps} повт.`,
                                        set.weight === null ? '' : `${set.weight} кг`,
                                      ]
                                        .filter(Boolean)
                                        .join(' · ') || 'Подход',
                                  )
                                  .join(' / ')}
                              </span>
                              {note && <p className={styles.note}>Заметка · {note}</p>}
                            </li>
                          );
                        })}
                      </ul>
                      {!!entry.skipped?.length && (
                        <p className={ui.hint}>
                          Пропущены подходы:{' '}
                          {entry.skipped
                            .map((id) => exercises[id]?.title ?? 'Упражнение')
                            .join(', ')}
                          .
                        </p>
                      )}
                    </>
                  )}
                  {((entry.freeId && entry.elapsed === null) || entry.roundTotal) && (
                    <ButtonLink href={`#result/${sessionIdentity(entry)}`}>
                      {entry.roundTotal ? 'Итоги круга' : 'Итоги занятия'}
                    </ButtonLink>
                  )}
                  {editSession && deleteSession && (
                    <HistorySessionActions
                      session={entry}
                      save={(changes) => {
                        const error = editSession(entry, changes);
                        if (
                          !error &&
                          selectedDay !== null &&
                          localDay(changes.date) !== selectedDay
                        )
                          setSelectedDay(null);
                        return error;
                      }}
                      remove={() => deleteSession(entry)}
                      reopensStop={reopensStop?.(entry) ?? false}
                    />
                  )}
                </div>
              </details>
            );
          })
        )}
      </div>
      {progressView}
    </section>
  );
}
