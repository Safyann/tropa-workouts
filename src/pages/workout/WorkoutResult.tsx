import {
  effortLabels,
  estimatedCalories,
  formatTime,
  sessionTitle,
  TrainingSummary,
  type Effort,
  type Session,
  type TrainingReport,
} from '../../entities/progress';
import { BodyWeightForm } from '../../features/workout/BodyWeightForm';
import { WorkoutComparison } from './WorkoutComparison';
import { WorkoutTemplateForm } from './WorkoutTemplateForm';
import ui from '../../shared/ui/Common.module.css';
import styles from './Workout.module.css';

export function WorkoutResult({
  session,
  history,
  saveWeight,
  saveEffort,
  templateTitle,
  saveTemplate,
  roundSummary,
}: {
  session: Session;
  history: readonly Session[];
  saveWeight: (weight: number) => void;
  saveEffort: (effort: Effort | undefined) => void;
  templateTitle?: string;
  saveTemplate: (title: string) => boolean;
  roundSummary?: { report: TrainingReport; goal: number };
}) {
  const calories = estimatedCalories(session);

  return (
    <section className={ui.narrow}>
      <h1 tabIndex={-1}>
        Итоги занятия<span>.</span>
      </h1>
      {session.freeId && <p className={ui.subtitle}>{sessionTitle(session)} · вне маршрута</p>}
      <div className={styles.step}>
        <p className={ui.eyebrow}>ВСЁ ЗАНЯТИЕ</p>
        {session.durationSeconds !== undefined ? (
          <>
            <p className={styles.clock}>{formatTime(session.durationSeconds)}</p>
            <p className={ui.hint}>От начала до завершения, включая паузы.</p>
          </>
        ) : (
          <p>Длительность не записана.</p>
        )}
        {calories !== undefined && (
          <p>
            <strong>≈ {calories} ккал</strong> активного расхода
          </p>
        )}
        {calories === undefined && session.activeCaloriesPerKg !== undefined && (
          <>
            <p>Укажи вес тела, чтобы получить примерный расход калорий.</p>
            <BodyWeightForm
              save={(weight) => {
                if (weight !== undefined) saveWeight(weight);
              }}
            />
          </>
        )}
      </div>
      <WorkoutComparison session={session} history={history} />
      {roundSummary && (
        <section className={ui.panel}>
          <h2>Итоги круга</h2>
          <TrainingSummary
            report={roundSummary.report}
            goal={roundSummary.goal}
            comparisonLabel="Изменения за круг"
          />
          <p className={ui.hint}>
            На карте можно повторить программу, изменить частоту или выбрать другой маршрут.
          </p>
        </section>
      )}
      {session.freeId && session.elapsed === null && session.sets.length > 0 && (
        <WorkoutTemplateForm key={session.freeId} title={templateTitle} save={saveTemplate} />
      )}
      <fieldset className={styles.effort}>
        <legend>Как далась тренировка?</legend>
        {(Object.keys(effortLabels) as Effort[]).map((effort) => (
          <button
            key={effort}
            className={ui.secondary}
            type="button"
            aria-pressed={session.effort === effort}
            onClick={() => saveEffort(session.effort === effort ? undefined : effort)}
          >
            {effortLabels[effort]}
          </button>
        ))}
      </fieldset>
      <a className={ui.secondary} href="#map">
        К карте
      </a>{' '}
      <a className={ui.secondary} href="#history">
        История занятий
      </a>
    </section>
  );
}
