import { exercises, route } from '../../entities/program';
import { formatTime, type Session } from '../../entities/progress';
import { Icon } from '../../shared/ui/Icon';

const dateFormat = new Intl.DateTimeFormat('ru', { day: 'numeric', month: 'short' });

export function HistoryPage({ sessions }: { sessions: Session[] }) {
  return <section className="narrow"><p className="eyebrow">ТВОЙ МАРШРУТ</p>
    <h1 tabIndex={-1}>История<span>.</span></h1>
    <p className="subtitle">Занятия, которые ты прошёл.</p>
    <div className="history-list">{sessions.length === 0
      ? <div className="empty"><h2>Здесь пока тихо</h2><p>Первая тренировка появится после того, как зажжёшь костёр.</p><a className="secondary" href="#map">К карте</a></div>
      : [...sessions].reverse().map(entry => {
        const stop = route[entry.stop];
        return <details className="history-row" key={`${entry.round}-${entry.stop}`}>
          <summary><span className="type-icon"><Icon name={stop.icon}/></span>
            <span><strong>{stop.title}</strong><small>{stop.type} · {entry.short ? 'Короткое занятие' : 'Обычное занятие'}</small></span>
            <time dateTime={new Date(entry.date).toISOString()}>{dateFormat.format(entry.date)}</time>
          </summary>
          <div className="history-detail">{entry.elapsed !== null
            ? <>Время на эллипсе: {formatTime(entry.elapsed)}</>
            : <ul>{stop.icon === 'strength' && stop.moves.map(id => {
              const sets = entry.sets.filter(set => set.exercise === id);
              return sets.length > 0 && <li key={id}>{exercises[id].title} <span>{sets.map(set =>
                [set.reps === null ? '' : `${set.reps} повт.`, set.weight === null ? '' : `${set.weight} кг`]
                  .filter(Boolean).join(' · ') || 'Подход').join(' / ')}</span></li>;
            })}</ul>}
          </div>
        </details>;
      })}
    </div>
  </section>;
}
