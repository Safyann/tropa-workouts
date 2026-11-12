import { useMemo, useState } from 'react';
import type { PlannedWorkout, Session } from '../../entities/progress';
import { Button } from '../../shared/ui/Controls';
import { calendarWeeks, localDay, monthStart } from '../../shared/lib/calendarDates';
import styles from './HistoryCalendar.module.css';

const monthFormat = new Intl.DateTimeFormat('ru', { month: 'long', year: 'numeric' });
const dayFormat = new Intl.DateTimeFormat('ru', { dateStyle: 'long' });
const weekdays = [
  ['Пн', 'Понедельник'],
  ['Вт', 'Вторник'],
  ['Ср', 'Среда'],
  ['Чт', 'Четверг'],
  ['Пт', 'Пятница'],
  ['Сб', 'Суббота'],
  ['Вс', 'Воскресенье'],
] as const;

export function HistoryCalendar({
  sessions,
  planned,
  selectedDay,
  selectDay,
}: {
  sessions: readonly Session[];
  planned: readonly PlannedWorkout[];
  selectedDay: number | null;
  selectDay: (day: number | null) => void;
}) {
  const now = Date.now();
  const latestWorkout = sessions.reduce((latest, { date }) => Math.max(latest, date), 0);
  const latestPlanned = planned.reduce((latest, { day }) => Math.max(latest, day), 0);
  const currentMonth = monthStart(Math.max(now, latestWorkout, latestPlanned));
  const [month, setMonth] = useState(() => monthStart(planned.length ? now : latestWorkout || now));
  const workoutDays = useMemo(() => {
    const counts = new Map<number, number>();
    for (const { date } of sessions) {
      const day = localDay(date);
      counts.set(day, (counts.get(day) ?? 0) + 1);
    }
    return counts;
  }, [sessions]);
  const plannedDays = new Set(planned.map(({ day }) => day));
  const today = localDay(now);
  const weeks = calendarWeeks(month);
  const hasWorkouts = weeks.some((week) =>
    week.some((day) => day !== null && workoutDays.has(day)),
  );
  const hasPlanned = weeks.some((week) => week.some((day) => day !== null && plannedDays.has(day)));

  function changeMonth(offset: number) {
    setMonth(monthStart(month, offset));
    selectDay(null);
  }

  return (
    <>
      <div className={styles.toolbar}>
        <Button type="button" aria-label="Предыдущий месяц" onClick={() => changeMonth(-1)}>
          ←
        </Button>
        <p className={styles.month} aria-live="polite">
          {monthFormat.format(month)}
        </p>
        <Button
          type="button"
          aria-label="Следующий месяц"
          onClick={() => changeMonth(1)}
          disabled={month >= currentMonth}
        >
          →
        </Button>
      </div>
      <table className={styles.calendar} aria-label={monthFormat.format(month)}>
        <thead>
          <tr>
            {weekdays.map(([short, long]) => (
              <th key={short} scope="col" abbr={long}>
                {short}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {weeks.map((week, index) => (
            <tr key={index}>
              {week.map((day, weekday) => {
                if (day === null) return <td key={weekday} />;
                const count = workoutDays.get(day);
                const isPlanned = plannedDays.has(day);
                const dayOfMonth = new Date(day).getDate();
                const currentDate = day === today ? 'date' : undefined;
                return (
                  <td key={weekday}>
                    {count || isPlanned ? (
                      <Button
                        variant="plain"
                        type="button"
                        className={styles.workoutDay}
                        aria-current={currentDate}
                        aria-pressed={day === selectedDay}
                        data-planned={isPlanned || undefined}
                        data-completed={Boolean(count) || undefined}
                        aria-label={`${dayFormat.format(day)}${count ? `, выполнено ${count}` : ''}${isPlanned ? ', есть план' : ''}`}
                        aria-controls="history-sessions"
                        onClick={() => selectDay(day === selectedDay ? null : day)}
                      >
                        {dayOfMonth}
                      </Button>
                    ) : (
                      <span className={styles.day} aria-current={currentDate}>
                        {dayOfMonth}
                      </span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <div className={styles.legends}>
        {hasWorkouts && (
          <p className={styles.legend}>
            <span className={styles.dot} aria-hidden="true" /> Выполнено
          </p>
        )}
        {hasPlanned && (
          <p className={styles.legend}>
            <span className={styles.plannedDot} aria-hidden="true" /> Запланировано
          </p>
        )}
        {!hasWorkouts && !hasPlanned && <p className={styles.legend}>В этом месяце занятий нет.</p>}
      </div>
    </>
  );
}
