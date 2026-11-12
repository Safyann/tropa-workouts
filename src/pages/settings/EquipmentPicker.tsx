import { useState } from 'react';
import { equipmentLabels, selectableEquipment, type HomeEquipment } from '../../entities/program';
import { Checkbox, Input } from '../../shared/ui/Controls';
import { normalizeSearchText } from '../../shared/lib/normalizeSearchText';
import { equipmentGroups } from './equipmentGroups';
import styles from './Settings.module.css';
import formStyles from '../../shared/ui/SettingsForm.module.css';

export function EquipmentPicker({
  selected,
  change,
}: {
  selected: readonly HomeEquipment[];
  change: (equipment: HomeEquipment[]) => void;
}) {
  const [query, setQuery] = useState('');
  const selectedItems = new Set(selected);
  const terms = normalizeSearchText(query).trim().split(/\s+/).filter(Boolean);
  const searching = terms.length > 0;
  const groups = equipmentGroups
    .map(({ id, title, items }) => ({
      id,
      title,
      items: searching
        ? items.filter((item) => {
            const label = normalizeSearchText(equipmentLabels[item]);
            return terms.every((term) => label.includes(term));
          })
        : items,
    }))
    .filter(({ items }) => items.length > 0);
  const matchCount = groups.reduce((count, { items }) => count + items.length, 0);
  const selectedCount = selectableEquipment.filter((item) => selectedItems.has(item)).length;
  const searchStatus = matchCount ? `Найдено позиций: ${matchCount}` : 'Инвентарь не найден.';

  return (
    <fieldset className={styles.homeEquipment}>
      <legend>Инвентарь дома</legend>
      <p className={styles.equipmentHint}>
        Отметь доступный инвентарь. Приложение учтёт его в силовом плане по группам мышц и в фильтре
        «Мой инвентарь» в каталоге.
      </p>
      <div className={formStyles.fields}>
        <label className={formStyles.wide}>
          Поиск инвентаря
          <Input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Например, гантели или турник"
          />
        </label>
        <p className={`${formStyles.wide} ${styles.equipmentStatus}`} role="status">
          {searching
            ? searchStatus
            : `Выбрано позиций: ${selectedCount} из ${selectableEquipment.length}`}
        </p>
      </div>
      <div className={styles.equipmentGroups}>
        {groups.map(({ id, title, items }) => {
          const count = items.filter((item) => selectedItems.has(item)).length;
          const choices = (
            <ul className={styles.equipmentChoices}>
              {items.map((item) => (
                <li key={item}>
                  <label>
                    <Checkbox
                      checked={selectedItems.has(item)}
                      onChange={(event) =>
                        change(
                          event.target.checked
                            ? [...selected, item]
                            : selected.filter((value) => value !== item),
                        )
                      }
                    />
                    {equipmentLabels[item]}
                  </label>
                </li>
              ))}
            </ul>
          );

          return searching ? (
            <div key={id} className={styles.equipmentGroup}>
              <h2>{title}</h2>
              {choices}
            </div>
          ) : (
            <details key={id} className={styles.equipmentGroup}>
              <summary>
                {title}{' '}
                <small>
                  · выбрано {count} из {items.length}
                </small>
              </summary>
              {choices}
            </details>
          );
        })}
      </div>
    </fieldset>
  );
}
