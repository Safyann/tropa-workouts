import { useState } from 'react';
import { exercises, type ExerciseId, type HomeEquipment } from '../../entities/program';
import { normalizeSearchText } from '../../shared/lib/normalizeSearchText';

const catalog = Object.entries(exercises).map(([id, exercise]) => ({
  id: id as ExerciseId,
  title: exercise.title,
  search: normalizeSearchText(exercise.title),
  needs: exercise.needs ?? [],
}));

export function useExerciseChoice(
  preferred: readonly ExerciseId[] = [],
  equipment?: readonly HomeEquipment[],
) {
  const [query, setQuery] = useState('');
  const [exercise, setExercise] = useState<ExerciseId>();
  const search = normalizeSearchText(query);
  const matches = catalog.filter(
    (item) =>
      (!equipment || item.needs.every((need) => equipment.includes(need))) &&
      item.search.includes(search),
  );
  const shortcuts = preferred.flatMap((id) => matches.find((item) => item.id === id) ?? []);
  const options = search || !shortcuts.length ? matches.slice(0, 15) : shortcuts;
  const selected = options.find(({ id }) => id === exercise)?.id ?? options[0]?.id;
  return {
    query,
    setQuery,
    options,
    selected,
    select: (id: ExerciseId | undefined) => setExercise(id),
  };
}

export function ExercisePicker({ choice }: { choice: ReturnType<typeof useExerciseChoice> }) {
  return (
    <>
      <label>
        Поиск упражнения
        <input
          type="search"
          value={choice.query}
          onChange={(event) => choice.setQuery(event.target.value)}
        />
      </label>
      <label>
        Упражнение
        <select
          value={choice.selected ?? ''}
          disabled={!choice.selected}
          onChange={(event) =>
            choice.select(choice.options.find(({ id }) => id === event.target.value)?.id)
          }
        >
          {!choice.selected && <option value="">Ничего не найдено</option>}
          {choice.options.map(({ id, title }) => (
            <option key={id} value={id}>
              {title}
            </option>
          ))}
        </select>
      </label>
    </>
  );
}
