import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type UniqueIdentifier,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  exerciseAlternatives,
  exercises,
  type ExerciseId,
  type HomeEquipment,
} from '../../entities/program';
import {
  isPending,
  moveExercise,
  replaceExercise,
  toggleSkip,
  type PlanExercise,
  type StrengthWorkout,
} from '../../features/workout';
import ui from '../../shared/ui/Common.module.css';
import styles from './WorkoutPlan.module.css';

export function WorkoutPlan({
  workout,
  update,
  choose,
}: {
  workout: StrengthWorkout;
  update: (workout: StrengthWorkout) => void;
  choose: (index: number) => void;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  const find = (id: UniqueIdentifier) => workout.plan.findIndex((item) => item.id === id);
  const title = (id: UniqueIdentifier) => exercises[workout.plan[find(id)].exercise].title;

  function dragEnd({ active, over }: DragEndEvent) {
    if (over) update(moveExercise(workout, find(active.id), find(over.id)));
  }

  return (
    <section className={styles.dayPlan} aria-label="План занятия">
      <h2>План на сегодня</h2>
      <p className={ui.hint}>
        Нажми название, чтобы выбрать упражнение, или перетащи за ручку, чтобы изменить порядок.
      </p>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={dragEnd}
        accessibility={{
          screenReaderInstructions: {
            draggable:
              'Нажми пробел, чтобы взять упражнение. Стрелки меняют позицию. Пробел сохраняет порядок, Escape отменяет.',
          },
          announcements: {
            onDragStart: ({ active }) => `Перемещаем: ${title(active.id)}.`,
            onDragOver: ({ over }) =>
              over ? `Позиция ${find(over.id) + 1} из ${workout.plan.length}.` : undefined,
            onDragEnd: ({ over }) =>
              over ? `Новая позиция ${find(over.id) + 1}.` : 'Порядок сохранён.',
            onDragCancel: () => 'Перемещение отменено.',
          },
        }}
      >
        <SortableContext
          items={workout.plan.map((item) => item.id)}
          strategy={verticalListSortingStrategy}
        >
          <ul className={ui.planList}>
            {workout.plan.map((item, index) => (
              <SortableExercise
                key={item.id}
                item={item}
                selected={workout.selected === index && !workout.timer}
                equipment={workout.equipment}
                choose={() => choose(index)}
                replace={(id) => update(replaceExercise(workout, index, id))}
                skip={() => update(toggleSkip(workout, index))}
              />
            ))}
          </ul>
        </SortableContext>
      </DndContext>
    </section>
  );
}

function SortableExercise({
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
          <button className={styles.planPick} aria-pressed={selected} onClick={choose}>
            {exercise.title}
          </button>
        ) : (
          <strong>{exercise.title}</strong>
        )}
        <span>
          {status ? `${status} · ` : ''}
          {item.completed}/{item.target}
        </span>
        <button
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
        </button>
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
                <button key={id} className={styles.alternative} onClick={() => replace(id)}>
                  <span>{exercises[id].title}</span>
                  <small>{exercises[id].gear}</small>
                </button>
              ))}
            </div>
          )}
          <button className={ui.secondary} onClick={skip}>
            Больно · пропустить
          </button>
        </details>
      )}
      {item.skipped && (
        <button className={styles.planPick} onClick={skip}>
          Вернуть в план
        </button>
      )}
    </li>
  );
}
