import type { FormEvent } from 'react';
import { isBodyWeight } from '../../entities/program';
import { Button, Input } from '../../shared/ui/Controls';
import styles from '../../shared/ui/SettingsForm.module.css';

export function BodyWeightForm({
  value,
  save,
}: {
  value?: number;
  save: (weight?: number) => void;
}) {
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const raw = new FormData(event.currentTarget).get('bodyWeight');
    if (raw === '') save(undefined);
    else {
      const weight = Number(raw);
      if (isBodyWeight(weight)) save(weight);
    }
  }

  return (
    <form className={styles.fields} onSubmit={submit}>
      <label>
        Вес тела, кг
        <Input
          name="bodyWeight"
          type="number"
          inputMode="decimal"
          min="0.1"
          step="any"
          defaultValue={value}
        />
      </label>
      <Button type="submit">Сохранить вес</Button>
    </form>
  );
}
