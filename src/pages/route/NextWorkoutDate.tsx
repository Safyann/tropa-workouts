import { Button, Input } from '../../shared/ui/Controls';
import { addDays, dateInputValue, localDay } from '../../shared/lib/calendarDates';
import styles from './Route.module.css';

const dateFormat = new Intl.DateTimeFormat('ru', {
  weekday: 'short',
  day: 'numeric',
  month: 'long',
});

export function NextWorkoutDate({
  day,
  paused,
  move,
  updateSchedule,
}: {
  day: number | undefined;
  paused?: boolean;
  move: (day: number) => void;
  updateSchedule: (paused: boolean) => void;
}) {
  if (paused) {
    return (
      <div className={styles.scheduleDate}>
        <p>Расписание на паузе</p>
        <Button className={styles.tomorrow} type="button" onClick={() => updateSchedule(false)}>
          Возобновить с сегодня
        </Button>
      </div>
    );
  }
  if (day === undefined) return null;
  const today = localDay(Date.now());
  const tomorrow = addDays(today, 1);
  return (
    <div className={styles.scheduleDate}>
      <p>
        {day < today ? 'Было запланировано' : 'Следующее занятие'} · {dateFormat.format(day)}
      </p>
      {day !== tomorrow && (
        <Button className={styles.tomorrow} type="button" onClick={() => move(tomorrow)}>
          Перенести на завтра
        </Button>
      )}
      {day < today && (
        <Button className={styles.tomorrow} type="button" onClick={() => updateSchedule(false)}>
          Пересчитать даты с сегодня
        </Button>
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
            <Input
              name="day"
              type="date"
              min={dateInputValue(today)}
              defaultValue={dateInputValue(Math.max(day, today))}
              required
            />
          </label>
          <Button type="submit">Сохранить дату</Button>
        </form>
      </details>
      <Button
        variant="plain"
        className={styles.pauseSchedule}
        type="button"
        onClick={() => updateSchedule(true)}
      >
        Приостановить расписание
      </Button>
    </div>
  );
}
