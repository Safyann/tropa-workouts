import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  exerciseAlternatives,
  exercises,
  type ExerciseId,
  type HomeEquipment,
} from '../../entities/program';
import { isPending, type PlanExercise } from '../../features/workout';
import { Button } from '../../shared/ui/Controls';
import styles from './WorkoutPlan.module.css';

export function SortableExercise({
  item,
  selected,
  equipment,
  choose,
  replace,
  skip,
}: {
  item: PlanExercise;
  selected: boolean;
  equipment: readonly HomeEquipment[];
  choose: () => void;
  replace: (id: ExerciseId) => void;
  skip: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });
  const exercise = exercises[item.exercise];
  const pending = isPending(item);
  const alternatives = pending ? exerciseAlternatives(item.exercise, equipment, 6) : [];
  const status = item.skipped
    ? 'Пропуск'
    : item.completed === item.target
      ? 'Готово'
      : selected
        ? 'Сейчас'
        : '';
  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={styles.planItem}
      data-selected={selected || undefined}
      data-dragging={isDragging || undefined}
    >
      <div className={styles.planLine}>
        {pending ? (
          <Button
            variant="plain"
            className={styles.planPick}
            aria-pressed={selected}
            onClick={choose}
          >
            {exercise.title}
          </Button>
        ) : (
          <strong>{exercise.title}</strong>
        )}
        <span>
          {status ? `${status} · ` : ''}
          {item.completed}/{item.target}
        </span>
        <Button
          variant="plain"
          ref={setActivatorNodeRef}
          type="button"
          className={styles.dragHandle}
          {...attributes}
          {...listeners}
          aria-label={`Переместить: ${exercise.title}`}
          aria-roledescription="ручка сортировки"
          title="Перетащить упражнение"
        >
          <svg width="16" height="20" viewBox="0 0 16 20" fill="currentColor" aria-hidden="true">
            {[4, 10, 16].map((y) => (
              <g key={y}>
                <circle cx="5" cy={y} r="1.5" />
                <circle cx="11" cy={y} r="1.5" />
              </g>
            ))}
          </svg>
        </Button>
      </div>
      <small>
        {exercise.group} · {exercise.gear}
      </small>
      {pending && (
        <details className={styles.planOptions}>
          <summary>{alternatives.length ? 'Замена или пропуск' : 'Пропуск'}</summary>
          {alternatives.length > 0 && (
            <p className={styles.optionHint}>
              Если снаряд занят, выбери вариант для оставшихся подходов.
            </p>
          )}
          {alternatives.length > 0 && (
            <div className={styles.planAlternatives}>
              {alternatives.map((id) => (
                <Button key={id} className={styles.alternative} onClick={() => replace(id)}>
                  <span>{exercises[id].title}</span>
                  <small>{exercises[id].gear}</small>
                </Button>
              ))}
            </div>
          )}
          <Button onClick={skip}>Больно · пропустить</Button>
        </details>
      )}
      {item.skipped && (
        <Button variant="plain" className={styles.planPick} onClick={skip}>
          Вернуть в план
        </Button>
      )}
    </li>
  );
}
