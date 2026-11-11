import { useState } from 'react';
import {
  ExerciseInstructions,
  muscleGroups,
  searchKineticExercises,
  type HomeEquipment,
  type KineticExerciseId,
} from '../../entities/program';
import ui from '../../shared/ui/Common.module.css';
import styles from './Catalog.module.css';

const pageSize = 12;

export function CatalogPage({ equipment }: { equipment: readonly HomeEquipment[] }) {
  const [query, setQuery] = useState('');
  const [group, setGroup] = useState('');
  const [limit, setLimit] = useState(pageSize);
  const [ownEquipmentOnly, setOwnEquipmentOnly] = useState(false);
  const matches = searchKineticExercises(query, group, ownEquipmentOnly ? equipment : undefined);

  return (
    <section className={ui.narrow}>
      <h1 tabIndex={-1}>
        Упражнения<span>.</span>
      </h1>
      <div className={styles.catalogFilters}>
        <label>
          Поиск упражнений
          <input
            type="search"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setLimit(pageSize);
            }}
            placeholder="Жим гантелей лёжа"
            maxLength={100}
          />
        </label>
        <label>
          Основная группа мышц
          <select
            value={group}
            onChange={(event) => {
              setGroup(event.target.value);
              setLimit(pageSize);
            }}
          >
            <option value="">Все группы</option>
            {muscleGroups.map((value) => (
              <option value={value} key={value}>
                {value}
              </option>
            ))}
          </select>
        </label>
        <label className={styles.equipmentFilter}>
          <input
            type="checkbox"
            checked={ownEquipmentOnly}
            onChange={(event) => {
              setOwnEquipmentOnly(event.target.checked);
              setLimit(pageSize);
            }}
          />
          Мой инвентарь
        </label>
      </div>
      <p aria-live="polite" className={styles.catalogStatus}>
        {matches.length ? `Найдено упражнений: ${matches.length}` : 'Упражнения не найдены.'}
      </p>
      {matches.length > 0 && (
        <ul className={styles.catalogList}>
          {matches.slice(0, limit).map((item) => (
            <li className={styles.catalogItem} key={item.id}>
              <div>
                <strong>{item.title}</strong>
                <small>{[...item.groups, item.gear].join(' · ')}</small>
              </div>
              {item.video && (
                <a
                  className={ui.secondary}
                  href={item.video}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`Видео техники: ${item.title}`}
                >
                  Видео ↗
                </a>
              )}
              {item.hasCues && <CatalogTechnique id={item.id} />}
            </li>
          ))}
        </ul>
      )}
      {matches.length > limit && (
        <button className={ui.secondary} type="button" onClick={() => setLimit(limit + pageSize)}>
          Показать ещё
        </button>
      )}
      <footer className={ui.foot}>
        <a href="https://github.com/kinetic-place/exercises-json" target="_blank" rel="noreferrer">
          Каталог Kinetic ↗
        </a>
        <a href="./kinetic-license.txt">Лицензия MIT</a>
      </footer>
    </section>
  );
}

function CatalogTechnique({ id }: { id: KineticExerciseId }) {
  const [opened, setOpened] = useState(false);
  return (
    <details
      className={styles.catalogTechnique}
      onToggle={(event) => {
        if (event.currentTarget.open) setOpened(true);
      }}
    >
      <summary>Техника выполнения</summary>
      {opened && <ExerciseInstructions source={id} ordered />}
    </details>
  );
}
