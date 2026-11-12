import { useEffect, useRef, useState } from 'react';
import { Button } from '../shared/ui/Controls';
import { Icon } from '../shared/ui/Icon';
import styles from './OnboardingDialog.module.css';

const steps = [
  {
    icon: 'flame',
    title: 'Добро пожаловать на «Тропу»',
    description:
      '«Тропа» ведёт от одной домашней тренировки к другой. После каждого занятия на карте открывается следующая остановка.',
  },
  {
    icon: 'strength',
    title: 'Настрой маршрут под себя',
    description:
      'На карте нажми «Уровень», чтобы подобрать нагрузку. Рядом есть «Настройки». Там можно выбрать домашний инвентарь и дни тренировок.',
  },
  {
    icon: 'arrow',
    title: 'Начни с ближайшей остановки',
    description:
      'На карте нажми «Начать занятие». Если времени мало, выбери «Короткий вариант» рядом с кнопкой старта.',
  },
  {
    icon: 'cardio',
    title: 'Запиши первый подход',
    description:
      'На силовой укажи вес и повторы, затем нажми «Записать подход». Перед следующим подходом появится таймер отдыха.',
  },
  {
    icon: 'check',
    title: 'Посмотри, что получилось',
    description:
      'В конце занятия откроются итоги. Чтобы вернуться к ним и посмотреть прогресс по упражнениям, открой «Историю».',
  },
] as const;

export function OnboardingDialog({ onDismiss }: { onDismiss: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const step = steps[stepIndex];
  const isLast = stepIndex === steps.length - 1;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    dialog.showModal();
    return () => dialog.close();
  }, []);

  useEffect(() => {
    headingRef.current?.focus();
  }, [stepIndex]);

  function dismiss() {
    dialogRef.current?.close();
    onDismiss();
  }

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      aria-labelledby="onboarding-title"
      aria-describedby="onboarding-description"
      onCancel={(event) => {
        event.preventDefault();
        dismiss();
      }}
    >
      <div className={styles.scene} aria-hidden="true">
        <span className={styles.marker}>
          <Icon name={step.icon} />
        </span>
      </div>
      <div className={styles.content}>
        <div className={styles.progress} aria-hidden="true">
          {steps.map(({ title }, index) => (
            <span key={title} className={index <= stepIndex ? styles.filled : undefined} />
          ))}
        </div>
        <h2 id="onboarding-title" ref={headingRef} tabIndex={-1} className={styles.title}>
          <span className={styles.step}>
            Шаг {stepIndex + 1} из {steps.length}
          </span>
          {step.title}
        </h2>
        <p id="onboarding-description" className={styles.description}>
          {step.description}
        </p>
        <div className={styles.actions}>
          <Button variant="plain" className={styles.skip} onClick={dismiss}>
            Пропустить
          </Button>
          {stepIndex > 0 && <Button onClick={() => setStepIndex(stepIndex - 1)}>Назад</Button>}
          <Button variant="primary" onClick={isLast ? dismiss : () => setStepIndex(stepIndex + 1)}>
            {isLast ? 'Готово' : 'Далее'}
            <Icon name={isLast ? 'check' : 'arrow'} />
          </Button>
        </div>
      </div>
    </dialog>
  );
}
