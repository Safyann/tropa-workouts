import { useState } from 'react';
import { muscleGroups, searchKineticExercises, type HomeEquipment } from '../../entities/program';
import { CatalogTechnique } from './CatalogTechnique';
import { ButtonLink } from '../../shared/ui/NavigationLinks';
import { PageTitle } from '../../shared/ui/PageTitle';
import { Button, Checkbox, Input, Select } from '../../shared/ui/Controls';
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
      <PageTitle>Упражнения</PageTitle>
      <div className={styles.catalogFilters}>
        <label>
          Поиск упражнений
          <Input
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
          <Select
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
          </Select>
        </label>
        <label className={styles.equipmentFilter}>
          <Checkbox
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
                <ButtonLink
                  href={item.video}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`Видео техники: ${item.title}`}
                >
                  Видео ↗
                </ButtonLink>
              )}
              {item.hasCues && <CatalogTechnique id={item.id} />}
            </li>
          ))}
        </ul>
      )}
      {matches.length > limit && (
        <Button type="button" onClick={() => setLimit(limit + pageSize)}>
          Показать ещё
        </Button>
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
