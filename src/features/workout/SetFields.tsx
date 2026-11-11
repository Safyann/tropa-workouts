import { useId, type ReactNode, type RefObject } from 'react';
import type { Exercise } from '../../entities/program';
import type { SetRecord } from '../../entities/progress';
import { Button, Input } from '../../shared/ui/Controls';
import styles from './SetFields.module.css';

type SetValues = Pick<SetRecord, 'weight' | 'reps'>;
type FieldKind = keyof SetValues;

interface Adjustment {
  ref: RefObject<HTMLInputElement | null>;
  step: number;
  fallback: number;
}

function fieldName(kind: FieldKind, index?: number) {
  return index === undefined ? kind : `${kind}-${index}`;
}

export function readSetFields(data: FormData, index?: number): SetValues {
  function read(kind: FieldKind) {
    const value = data.get(fieldName(kind, index));
    return typeof value === 'string' && value !== '' ? Number(value) : null;
  }
  return { weight: read('weight'), reps: read('reps') };
}

function SetNumberField({
  kind,
  label,
  index,
  value,
  adjustment,
}: {
  kind: FieldKind;
  label: string;
  index?: number;
  value?: number | null;
  adjustment?: Adjustment;
}) {
  const inputId = useId();
  const isWeight = kind === 'weight';
  const minimum = isWeight ? 0 : 1;
  const maximum = isWeight ? undefined : Number.MAX_SAFE_INTEGER;
  const input = (
    <Input
      id={inputId}
      ref={adjustment?.ref}
      name={fieldName(kind, index)}
      type="number"
      inputMode={isWeight ? 'decimal' : 'numeric'}
      min={minimum}
      max={maximum}
      step={isWeight ? 'any' : '1'}
      defaultValue={value ?? undefined}
      placeholder={adjustment?.fallback.toString()}
    />
  );

  if (!adjustment) {
    return (
      <label>
        {label}
        {input}
      </label>
    );
  }

  const { ref, fallback, step } = adjustment;
  function adjust(direction: number) {
    const inputElement = ref.current;
    if (!inputElement) return;
    const current = Number.isFinite(inputElement.valueAsNumber)
      ? inputElement.valueAsNumber
      : fallback;
    const next = Math.min(
      maximum ?? Number.MAX_VALUE,
      Math.max(minimum, current + direction * step),
    );
    inputElement.value = String(isWeight ? Number(next.toFixed(10)) : next);
  }

  return (
    <div className={styles.field}>
      <label htmlFor={inputId}>{label}</label>
      <div className={styles.stepper}>
        <Button aria-label={`Уменьшить: ${label}`} onClick={() => adjust(-1)}>
          −
        </Button>
        {input}
        <Button aria-label={`Увеличить: ${label}`} onClick={() => adjust(1)}>
          +
        </Button>
      </div>
    </div>
  );
}

export function SetFields({
  exercise,
  showWeight = exercise?.weighted,
  index,
  values,
  adjustments,
  afterWeight,
}: {
  exercise?: Pick<Exercise, 'needs' | 'perSide' | 'weighted'>;
  showWeight?: boolean;
  index?: number;
  values?: SetValues;
  adjustments?: Record<FieldKind, Adjustment>;
  afterWeight?: ReactNode;
}) {
  return (
    <>
      {showWeight && (
        <>
          <SetNumberField
            kind="weight"
            label={exercise?.needs?.includes('dumbbells') ? 'Вес одной гантели, кг' : 'Вес, кг'}
            index={index}
            value={values?.weight}
            adjustment={adjustments?.weight}
          />
          {afterWeight}
        </>
      )}
      <SetNumberField
        kind="reps"
        label={exercise?.perSide ? 'Повторы на сторону' : 'Повторы'}
        index={index}
        value={values?.reps}
        adjustment={adjustments?.reps}
      />
    </>
  );
}
