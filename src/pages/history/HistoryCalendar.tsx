import { useMemo, useState } from 'react';
import type { Session } from '../../entities/progress';
import ui from '../../shared/ui/Common.module.css';
import { calendarWeeks, localDay, monthStart } from './calendarDates';
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
  selectedDay,
  selectDay,
}: {
  sessions: readonly Session[];
  selectedDay: number | null;
  selectDay: (day: number | null) => void;
}) {
  const now = Date.now();
  const latestWorkout = sessions.reduce((latest, { date }) => Math.max(latest, date), 0);
  const currentMonth = monthStart(Math.max(now, latestWorkout));
  const [month, setMonth] = useState(() => monthStart(latestWorkout || now));
  const workoutDays = useMemo(() => {
    const counts = new Map<number, number>();
    for (const { date } of sessions) {
      const day = localDay(date);
      counts.set(day, (counts.get(day) ?? 0) + 1);
    }
    return counts;
  }, [sessions]);
  const today = localDay(now);
  const weeks = calendarWeeks(month);
  const hasWorkouts = weeks.some((week) =>
    week.some((day) => day !== null && workoutDays.has(day)),
  );

  function changeMonth(offset: number) {
    setMonth(monthStart(month, offset));
    selectDay(null);
  }

  return (
    <section className={ui.panel} aria-labelledby="history-calendar-heading">
      <h2 id="history-calendar-heading">Календарь тренировок</h2>
      <div className={styles.toolbar}>
        <button
          className={ui.secondary}
          type="button"
          aria-label="Предыдущий месяц"
          onClick={() => changeMonth(-1)}
        >
          ←
        </button>
        <p className={styles.month} aria-live="polite">
          {monthFormat.format(month)}
        </p>
        <button
          className={ui.secondary}
          type="button"
          aria-label="Следующий месяц"
          onClick={() => changeMonth(1)}
          disabled={month >= currentMonth}
        >
          →
        </button>
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
                const dayOfMonth = new Date(day).getDate();
                const currentDate = day === today ? 'date' : undefined;
                return (
                  <td key={weekday}>
                    {count ? (
                      <button
                        type="button"
                        className={styles.workoutDay}
                        aria-current={currentDate}
                        aria-pressed={day === selectedDay}
                        aria-label={`${dayFormat.format(day)}, тренировок ${count}`}
                        aria-controls="history-sessions"
                        onClick={() => selectDay(day === selectedDay ? null : day)}
                      >
                        {dayOfMonth}
                      </button>
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
      <p className={styles.legend}>
        {hasWorkouts ? (
          <>
            <span className={styles.dot} aria-hidden="true" /> День с тренировкой
          </>
        ) : (
          'В этом месяце занятий нет.'
        )}
      </p>
    </section>
  );
}
