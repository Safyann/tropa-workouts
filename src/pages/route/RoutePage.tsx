import {
  cardioActivity,
  cardioTitles,
  defaultPreferences,
  defaultWeeklyGoal,
  dumbbellProgramTitle,
  dumbbellWeeklyGoal,
  equipmentLabels,
  defaultEquipment,
  levels,
  programRoute,
  workoutDetail,
  type WorkoutPreferences,
  type ProgramId,
} from '../../entities/program';
import {
  nextStop,
  plannedWorkouts,
  savedProgramRound,
  routeLength,
  trainingReport,
  TrainingSummary,
  weeklyReport,
  type Progress,
} from '../../entities/progress';
import { ButtonLink } from '../../shared/ui/NavigationLinks';
import { PageTitle } from '../../shared/ui/PageTitle';
import { Button } from '../../shared/ui/Controls';
import { Icon } from '../../shared/ui/Icon';
import { DayPreview } from './DayPreview';
import { MuscleGroupPicker } from './MuscleGroupPicker';
import { NextWorkoutDate } from './NextWorkoutDate';
import { RouteMap } from './RouteMap';
import { WorkoutSettings } from './WorkoutSettings';
import ui from '../../shared/ui/Common.module.css';
import styles from './Route.module.css';

interface Props {
  progress: Progress;
  activeStop?: number;
  offlineReady: boolean;
  start: (short: boolean) => void;
  restart: () => void;
  changePreferences: (preferences: WorkoutPreferences) => void;
  moveWorkout?: (day: number) => void;
  updateSchedule?: (paused: boolean) => void;
  chooseProgram?: (program: ProgramId | undefined) => void;
}

export function RoutePage({
  progress,
  activeStop,
  offlineReady,
  start,
  restart,
  changePreferences,
  moveWorkout,
  updateSchedule,
  chooseProgram,
}: Props) {
  const preferences = progress.preferences ?? defaultPreferences;
  const program = preferences.program;
  const route = programRoute(program);
  const inWorkout = activeStop !== undefined;
  const totalStops = routeLength(progress, activeStop);
  const next = nextStop(progress, totalStops);
  const stop = route[next];
  const nextDate = plannedWorkouts(progress, activeStop)[0]?.day;
  const routeSessions = progress.sessions.filter(
    (session) => !session.freeId && session.program === program,
  );
  const roundSessions = routeSessions.filter((session) => session.round === progress.round);
  const completedStops = new Set(roundSessions.map(({ stop }) => stop));
  const historyStops = new Set(routeSessions.map(({ stop }) => stop));
  const week = weeklyReport(progress.sessions);
  const count = week.workouts;
  const canResumeProgram =
    savedProgramRound(progress, program ? undefined : 'dumbbell') !== undefined;
  const goal = program ? dumbbellWeeklyGoal : (preferences.weeklyGoal ?? defaultWeeklyGoal);
  const hasDumbbells = (preferences.equipment ?? defaultEquipment).includes('dumbbells');
  const equipment = (preferences.equipment ?? defaultEquipment).map(
    (item) => equipmentLabels[item],
  );
  return (
    <>
      <div className={styles.intro}>
        <div>
          <p className={ui.eyebrow}>
            <span className={styles.signal} />{' '}
            {program ? 'ПРОГРАММА 02 / ДОМА' : 'ПРОГРАММА 01 / ДОМА'}
          </p>
          <PageTitle>{program ? dumbbellProgramTitle : 'Войти в ритм'}</PageTitle>
          <p className={ui.subtitle}>
            {program
              ? 'Две силовые в неделю. Чередуй тренировки А и Б.'
              : 'Чередуй силовые и кардио в своём темпе.'}
          </p>
        </div>
        <div className={styles.week}>
          <p className={styles.weekLabel}>ЦЕЛЬ НЕДЕЛИ</p>
          <strong>
            {count}
            <span className={styles.goal}> / {goal}</span>
          </strong>
          <span className={styles.weekDots} aria-hidden="true">
            {Array.from({ length: goal }, (_, index) => (
              <i key={index} className={count > index ? styles.filled : undefined} />
            ))}
          </span>
          <a className={styles.weekSettings} href="#settings">
            Настройки профиля
          </a>
        </div>
      </div>
      <div className={styles.dashboard}>
        <section className={styles.nextCard}>
          <p className={ui.eyebrow}>
            {stop ? `ОСТАНОВКА ${next + 1} / ${totalStops}` : 'МАРШРУТ ЗАВЕРШЁН'}
          </p>
          <span className={styles.stopIcon}>
            <Icon name={stop?.icon ?? 'check'} />
          </span>
          <h2>{stop?.title ?? 'Все костры горят'}</h2>
          {stop && preferences.schedule && moveWorkout && updateSchedule && (
            <NextWorkoutDate
              day={nextDate}
              paused={preferences.schedule.paused}
              move={moveWorkout}
              updateSchedule={updateSchedule}
            />
          )}
          {stop ? (
            <>
              {!inWorkout && (
                <>
                  <p className={styles.sessionType}>
                    {stop.icon === 'cardio'
                      ? cardioTitles[cardioActivity(preferences.equipment)]
                      : stop.type}
                  </p>
                  <p className={styles.sessionDetail}>
                    {workoutDetail(stop, false, preferences)} · {levels[preferences.level].title}
                  </p>
                </>
              )}
              {!program && !inWorkout && stop.icon === 'strength' && (
                <MuscleGroupPicker preferences={preferences} change={changePreferences} />
              )}
              <div className={styles.cardActions}>
                <Button variant="primary" onClick={() => start(false)}>
                  {inWorkout ? 'Продолжить занятие' : 'Начать занятие'} <Icon name="arrow" />
                </Button>
                {!inWorkout && <Button onClick={() => start(true)}>Короткий вариант</Button>}
              </div>
              {!inWorkout && (
                <>
                  {!program && !progress.sessions.length && !preferences.equipment && (
                    <div className={styles.equipmentIntro}>
                      <p className={ui.hint}>Подбери план под свой домашний инвентарь.</p>
                      <ButtonLink href="#settings">Выбрать инвентарь</ButtonLink>
                      <Button
                        type="button"
                        onClick={() => changePreferences({ ...preferences, equipment: [] })}
                      >
                        Без инвентаря
                      </Button>
                    </div>
                  )}
                  <WorkoutSettings preferences={preferences} change={changePreferences} />
                  <DayPreview key={next} stop={stop} preferences={preferences} />
                </>
              )}
            </>
          ) : (
            <>
              <p className={styles.sessionType}>Итоги круга</p>
              <TrainingSummary
                report={trainingReport(roundSessions)}
                goal={totalStops}
                comparisonLabel="Изменения за круг"
              />
              <div className={styles.cardActions}>
                <Button variant="primary" onClick={restart}>
                  Новый круг <Icon name="arrow" />
                </Button>
                <ButtonLink href="#settings">Настройки частоты и расписания</ButtonLink>
              </div>
            </>
          )}
          <ButtonLink className={styles.freeLink} href="#free">
            Записать занятие вне маршрута
          </ButtonLink>
        </section>
        <RouteMap
          program={program}
          next={next}
          totalStops={totalStops}
          completedStops={completedStops}
          historyStops={historyStops}
        />
      </div>
      <section className={ui.panel}>
        <h2>Итоги недели</h2>
        <TrainingSummary
          report={week}
          goal={goal}
          comparisonLabel="Изменения к предыдущим занятиям"
        />
        {week.workouts !== week.routeWorkouts && (
          <p className={ui.hint}>Занятий из маршрутов · {week.routeWorkouts}</p>
        )}
      </section>
      {chooseProgram && (
        <section className={ui.panel}>
          <h2>{program ? 'Стартовый маршрут «Войти в ритм»' : dumbbellProgramTitle}</h2>
          <p className={ui.subtitle}>
            {program
              ? 'Гибкий круг с силовыми и кардио.'
              : 'Восемь силовых тренировок. Понадобятся гантели и место для упражнений на полу.'}
          </p>
          <p className={ui.hint}>У каждой программы свой круг и расписание.</p>
          {inWorkout ? (
            <p className={ui.hint}>Заверши начатое занятие, чтобы сменить программу.</p>
          ) : !program && !hasDumbbells ? (
            <ButtonLink href="#settings">Отметить гантели в настройках</ButtonLink>
          ) : (
            <Button type="button" onClick={() => chooseProgram(program ? undefined : 'dumbbell')}>
              {program
                ? canResumeProgram
                  ? 'Вернуться к стартовому маршруту'
                  : 'Начать стартовый маршрут'
                : canResumeProgram
                  ? 'Вернуться к программе с гантелями'
                  : 'Начать программу с гантелями'}
            </Button>
          )}
        </section>
      )}
      <footer className={ui.foot}>
        <span>{equipment.join(' · ') || 'Без инвентаря'}</span>
        <span>
          {offlineReady
            ? 'Маршрут доступен без сети · история в этом браузере'
            : 'Прогресс хранится в этом браузере'}
        </span>
      </footer>
    </>
  );
}
