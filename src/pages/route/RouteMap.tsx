import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { programRoute, type ProgramId } from '../../entities/program';
import { Icon } from '../../shared/ui/Icon';
import { drawTrail } from './drawTrail';
import ui from '../../shared/ui/Common.module.css';
import styles from './Route.module.css';

export function RouteMap({
  program,
  next,
  totalStops,
  completedStops,
  historyStops,
}: {
  program?: ProgramId;
  next: number;
  totalStops: number;
  completedStops: ReadonlySet<number>;
  historyStops: ReadonlySet<number>;
}) {
  const route = programRoute(program);
  const track = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [scrollable, setScrollable] = useState(false);
  const points = useMemo(
    () =>
      Array.from({ length: totalStops }, (_, index) => ({
        x: totalStops === 1 ? 50 : 13 + (index / (totalStops - 1)) * 74,
        y: 55 + Math.cos(index * 1.65) * 15 - (index / totalStops) * 6,
      })),
    [totalStops],
  );
  const active = points[next === -1 ? totalStops - 1 : next];

  useEffect(() => {
    const viewport = track.current;
    const surface = canvas.current;
    if (!viewport || !surface) return;
    function paint() {
      if (!viewport || !surface) return;
      drawTrail(surface, points);
      setScrollable(viewport.scrollWidth > viewport.clientWidth);
      if (active)
        viewport.scrollLeft = (active.x / 100) * surface.clientWidth - viewport.clientWidth / 2;
    }
    paint();
    const resize = new ResizeObserver(paint);
    resize.observe(viewport);
    resize.observe(surface);
    return () => resize.disconnect();
  }, [active, points]);

  const width = totalStops > 4 ? `${totalStops * 8}rem` : '0px';

  return (
    <section className={styles.map} aria-label="Тропа костров">
      <div
        ref={track}
        className={styles.mapTrack}
        data-tab-swipe-ignore={scrollable ? '' : undefined}
        tabIndex={scrollable ? 0 : undefined}
        role={scrollable ? 'region' : undefined}
        aria-label={scrollable ? 'Карта остановок с горизонтальной прокруткой' : undefined}
      >
        <div className={styles.mapScene} style={{ minWidth: width }}>
          <canvas ref={canvas} className={styles.mapArt} aria-hidden="true" />
          <ol className={styles.markers}>
            {route.slice(0, totalStops).map((stop, index) => {
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
              const { x, y } = points[index];
              const position = { '--x': `${x}%`, '--y': `${y}%` } as CSSProperties;
              return (
                <li className={styles.marker} data-state={state} style={position} key={index}>
                  {historyStops.has(index) ? (
                    <a
                      className={`${styles.markerDot} ${styles.markerLink}`}
                      href={`#history/${program ? `${program}/` : ''}${index + 1}`}
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
