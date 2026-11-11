import { cardioTitles, exercises, route } from '../../entities/program';
import { formatTime, type Session } from '../../entities/progress';
import { Icon } from '../../shared/ui/Icon';

const dateFormat = new Intl.DateTimeFormat('ru', { day: 'numeric', month: 'short' });

export function HistoryPage({ sessions, stopIndex }: { sessions: Session[]; stopIndex?: number }) {
  const stop = stopIndex === undefined ? undefined : route[stopIndex];
  const entries = stopIndex === undefined ? sessions : sessions.filter(entry => entry.stop === stopIndex);
  return <section className="narrow">
    {stop && <a className="back" href="#map">← К карте</a>}
    <p className="eyebrow">{stop ? 'ИСТОРИЯ ОСТАНОВКИ' : 'ТВОЙ МАРШРУТ'}</p>
    <h1 tabIndex={-1}>{stop?.title ?? 'История'}<span>.</span></h1>
    <p className="subtitle">{stop ? `Занятий на этой остановке: ${entries.length}` : 'Занятия, которые ты прошёл.'}</p>
    <div className="history-list">{entries.length === 0
      ? <div className="empty"><h2>Здесь пока тихо</h2><p>Первая тренировка появится после того, как зажжёшь костёр.</p><a className="secondary" href="#map">К карте</a></div>
      : [...entries].reverse().map((entry, index) => {
        const entryStop = route[entry.stop];
        const activity = entry.cardioActivity ? cardioTitles[entry.cardioActivity] : entryStop.type;
        return <details className="history-row" key={`${entry.round}-${entry.stop}`} open={stop && index === 0 ? true : undefined}>
          <summary><span className="type-icon"><Icon name={entryStop.icon}/></span>
            <span><strong>{entryStop.title}</strong><small>{activity} · {entry.short ? 'Короткое занятие' : 'Обычное занятие'}
              {entry.partial && ' · Досрочно'}
              {entry.durationSeconds !== undefined && ` · ${formatTime(entry.durationSeconds)}`}</small></span>
            <time dateTime={new Date(entry.date).toISOString()}>{dateFormat.format(entry.date)}</time>
          </summary>
          <div className="history-detail">
            {entry.durationSeconds !== undefined && <p className="history-duration">Всё занятие · {formatTime(entry.durationSeconds)}</p>}
            {entry.elapsed !== null
            ? <>Основная часть · {formatTime(entry.elapsed)}</>
            : <><ul>{[...new Set(entry.sets.map(set => set.exercise))].map(id => {
              const sets = entry.sets.filter(set => set.exercise === id);
              return <li key={id}>{exercises[id].title} <span>{sets.map(set =>
                [set.reps === null ? '' : `${set.reps} повт.`, set.weight === null ? '' : `${set.weight} кг`]
                  .filter(Boolean).join(' · ') || 'Подход').join(' / ')}</span></li>;
            })}</ul>
            {!!entry.skipped?.length && <p className="hint">Пропущены подходы: {entry.skipped.map(id => exercises[id].title).join(', ')}.</p>}</>}
          </div>
        </details>;
      })}
    </div>
  </section>;
}
