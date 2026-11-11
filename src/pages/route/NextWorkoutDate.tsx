import { addDays, localDay } from '../../shared/lib/calendarDates';
import ui from '../../shared/ui/Common.module.css';
import styles from './Route.module.css';

const dateFormat = new Intl.DateTimeFormat('ru', {
  weekday: 'short',
  day: 'numeric',
  month: 'long',
});

function inputDate(day: number) {
  const date = new Date(day);
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-');
}

export function NextWorkoutDate({ day, move }: { day: number; move: (day: number) => void }) {
  const today = localDay(Date.now());
  const tomorrow = addDays(today, 1);
  return (
    <div className={styles.scheduleDate}>
      <p>
        {day < today ? 'Было запланировано' : 'Следующее занятие'} · {dateFormat.format(day)}
      </p>
      {day !== tomorrow && (
        <button
          className={`${ui.secondary} ${styles.tomorrow}`}
          type="button"
          onClick={() => move(tomorrow)}
        >
          Перенести на завтра
        </button>
      )}
      <details>
        <summary>Перенести занятие</summary>
        <form
          key={day}
          onSubmit={(event) => {
            event.preventDefault();
            const value = new FormData(event.currentTarget).get('day');
            if (typeof value !== 'string') return;
            const nextDay = new Date(`${value}T00:00:00`).getTime();
            if (Number.isFinite(nextDay) && nextDay >= today) move(nextDay);
          }}
        >
          <label>
            Новая дата
            <input
              name="day"
              type="date"
              min={inputDate(today)}
              defaultValue={inputDate(Math.max(day, today))}
              required
            />
          </label>
          <button className={ui.secondary} type="submit">
            Сохранить дату
          </button>
        </form>
      </details>
    </div>
  );
}
