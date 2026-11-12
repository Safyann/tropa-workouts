import {
  defaultWeeklyGoal,
  defaultRouteWeeks,
  dumbbellWeeklyGoal,
  routeWeeks,
  weeklyGoals,
  type WorkoutPreferences,
} from '../../entities/program';
import { Select } from '../../shared/ui/Controls';
import ui from '../../shared/ui/Common.module.css';
import formStyles from '../../shared/ui/SettingsForm.module.css';
import { ScheduleSettings } from './ScheduleSettings';

export function RouteSettings({
  preferences,
  change,
}: {
  preferences: WorkoutPreferences;
  change: (preferences: WorkoutPreferences) => void;
}) {
  return (
    <>
      <p className={ui.subtitle}>
        {preferences.program
          ? 'В программе с гантелями две тренировки в неделю на протяжении четырёх недель.'
          : 'Число занятий в неделю и длительность в неделях задают длину маршрута.'}
      </p>
      <div className={ui.panel}>
        <div className={formStyles.fields}>
          <label>
            Недель в маршруте
            <Select
              value={preferences.program ? 4 : (preferences.routeWeeks ?? defaultRouteWeeks)}
              disabled={Boolean(preferences.program)}
              onChange={(event) => {
                const weeks = routeWeeks.find((value) => String(value) === event.target.value);
                if (weeks) change({ ...preferences, routeWeeks: weeks });
              }}
            >
              {routeWeeks.map((weeks) => (
                <option key={weeks} value={weeks}>
                  {weeks}
                </option>
              ))}
            </Select>
          </label>
          <label>
            Занятий в неделю
            <Select
              value={
                preferences.program
                  ? dumbbellWeeklyGoal
                  : (preferences.weeklyGoal ?? defaultWeeklyGoal)
              }
              disabled={Boolean(preferences.program)}
              onChange={(event) => {
                const weeklyGoal = weeklyGoals.find(
                  (value) => String(value) === event.target.value,
                );
                if (weeklyGoal) change({ ...preferences, weeklyGoal, schedule: undefined });
              }}
            >
              {weeklyGoals.map((goal) => (
                <option key={goal} value={goal}>
                  {goal}
                </option>
              ))}
            </Select>
          </label>
        </div>
        {preferences.schedule && !preferences.program && (
          <p className={ui.hint}>При изменении числа занятий выбери дни тренировок заново.</p>
        )}
      </div>
      <ScheduleSettings
        key={`${preferences.weeklyGoal}-${preferences.schedule?.days.join(',')}`}
        preferences={preferences}
        change={change}
      />
    </>
  );
}
