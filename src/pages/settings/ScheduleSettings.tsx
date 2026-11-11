import { useState } from 'react';
import {
  defaultWeeklyGoal,
  dumbbellWeeklyGoal,
  trainingWeekdays,
  type TrainingWeekday,
  type WorkoutPreferences,
} from '../../entities/program';
import { Button, Checkbox } from '../../shared/ui/Controls';
import { localDay } from '../../shared/lib/calendarDates';
import ui from '../../shared/ui/Common.module.css';
import styles from './Settings.module.css';

const labels = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];

export function ScheduleSettings({
  preferences,
  change,
}: {
  preferences: WorkoutPreferences;
  change: (preferences: WorkoutPreferences) => void;
}) {
  const savedDays = preferences.schedule?.days ?? [];
  const [days, setDays] = useState<readonly TrainingWeekday[]>(savedDays);
  const goal = preferences.program
    ? dumbbellWeeklyGoal
    : (preferences.weeklyGoal ?? defaultWeeklyGoal);
  const changed = days.length !== savedDays.length || days.some((day) => !savedDays.includes(day));

  function toggle(day: TrainingWeekday) {
    setDays((current) =>
      current.includes(day) ? current.filter((value) => value !== day) : [...current, day],
    );
  }

  return (
    <section className={ui.panel} aria-labelledby="schedule-settings-heading">
      <h2 id="schedule-settings-heading">Дни тренировок</h2>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (days.length === goal)
            change({ ...preferences, schedule: { days, start: localDay(Date.now()) } });
        }}
      >
        <fieldset className={styles.weekdays}>
          <legend>
            Выбрано {days.length} из {goal}
          </legend>
          {trainingWeekdays.map((day) => (
            <label key={day}>
              <Checkbox checked={days.includes(day)} onChange={() => toggle(day)} />
              {labels[day]}
            </label>
          ))}
        </fieldset>
        <div className={styles.dataActions}>
          <Button variant="primary" type="submit" disabled={!changed || days.length !== goal}>
            Сохранить расписание
          </Button>
          {savedDays.length > 0 && (
            <Button
              type="button"
              onClick={() => {
                setDays([]);
                change({ ...preferences, schedule: undefined });
              }}
            >
              Отключить расписание
            </Button>
          )}
        </div>
      </form>
    </section>
  );
}
