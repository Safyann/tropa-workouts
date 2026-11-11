import { useState } from 'react';
import { equipmentLabels, selectableEquipment, type HomeEquipment } from '../../entities/program';
import { normalizeSearchText } from '../../shared/lib/normalizeSearchText';
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
  const terms = normalizeSearchText(query).trim().split(/\s+/).filter(Boolean);
  const matches = selectableEquipment.filter((item) => {
    const label = normalizeSearchText(equipmentLabels[item]);
    return terms.every((term) => label.includes(term));
  });

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
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Например, гантели или турник"
          />
        </label>
        <p className={`${formStyles.wide} ${styles.equipmentStatus}`} role="status">
          {matches.length
            ? `Показано позиций: ${matches.length} из ${selectableEquipment.length}`
            : 'Инвентарь не найден.'}
        </p>
        {matches.map((item) => (
          <label key={item} className={formStyles.toggle}>
            <input
              type="checkbox"
              checked={selected.includes(item)}
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
        ))}
      </div>
    </fieldset>
  );
}
