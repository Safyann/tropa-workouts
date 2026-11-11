import { useEffect, useRef, type CSSProperties } from 'react';
import { route } from '../../entities/program';
import { Icon } from '../../shared/ui/Icon';
import ui from '../../shared/ui/Common.module.css';
import styles from './Route.module.css';

const markerPositions = [
  [15.3, 76.4],
  [38.1, 53.6],
  [61.9, 60],
  [81.9, 25.1],
] as const;

export function RouteMap({
  next,
  totalStops,
  completedStops,
  historyStops,
}: {
  next: number;
  totalStops: number;
  completedStops: ReadonlySet<number>;
  historyStops: ReadonlySet<number>;
}) {
  const track = useRef<HTMLDivElement>(null);
  const stopsPerSegment = markerPositions.length;
  const segmentCount = Math.ceil(totalStops / stopsPerSegment);
  const activeSegment = next === -1 ? segmentCount - 1 : Math.floor(next / stopsPerSegment);
  const scrollable = segmentCount > 1;

  useEffect(() => {
    const viewport = track.current;
    if (viewport) viewport.scrollLeft = activeSegment * viewport.clientWidth;
  }, [activeSegment, segmentCount]);

  return (
    <section className={styles.map} aria-label="Тропа костров">
      <div
        ref={track}
        className={styles.mapTrack}
        tabIndex={scrollable ? 0 : undefined}
        role={scrollable ? 'region' : undefined}
        aria-label={scrollable ? 'Карта остановок с горизонтальной прокруткой' : undefined}
      >
        {Array.from({ length: segmentCount }, (_, segment) => {
          const first = segment * stopsPerSegment;
          return (
            <div className={styles.mapSegment} key={first}>
              <img className={styles.mapArt} src="./map.svg" alt="" />
              <ol className={styles.markers} start={first + 1}>
                {route
                  .slice(first, Math.min(first + stopsPerSegment, totalStops))
                  .map((stop, offset) => {
                    const index = first + offset;
                    const state = completedStops.has(index)
                      ? 'done'
                      : index === next
                        ? 'current'
                        : 'locked';
                    const status = {
                      done: 'Пройдено',
                      current: 'Следующее занятие',
                      locked: 'Закрыто',
                    }[state];
                    const [x, y] = markerPositions[offset];
                    const position = { '--x': `${x}%`, '--y': `${y}%` } as CSSProperties;
                    return (
                      <li className={styles.marker} data-state={state} style={position} key={index}>
                        {historyStops.has(index) ? (
                          <a
                            className={`${styles.markerDot} ${styles.markerLink}`}
                            href={`#history/${index + 1}`}
                            aria-label={`История остановки «${stop.title}»`}
                            title="Открыть историю"
                          >
                            <Icon name="flame" />
                          </a>
                        ) : (
                          <span className={styles.markerDot}>
                            <Icon name={state === 'locked' ? 'lock' : 'flame'} />
                          </span>
                        )}
                        <span className={styles.markerLabel}>
                          <b>{index + 1}</b> <span className={styles.markerName}>{stop.title}</span>
                          <span className={ui.srOnly}> — {status}</span>
                        </span>
                      </li>
                    );
                  })}
              </ol>
            </div>
          );
        })}
      </div>
      <div className={styles.mapCaption}>
        <strong>Тропа костров</strong>
        {scrollable && <span>Прокрути карту вбок ↔</span>}
      </div>
      <div className={styles.mapLegend}>
        <span className={styles.signal} /> Пройдено {completedStops.size} из {totalStops}
      </div>
    </section>
  );
}
