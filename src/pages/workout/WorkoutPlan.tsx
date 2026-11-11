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
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { exercises } from '../../entities/program';
import {
  moveExercise,
  replaceExercise,
  toggleSkip,
  type StrengthWorkout,
} from '../../features/workout';
import { SortableExercise } from './SortableExercise';
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
