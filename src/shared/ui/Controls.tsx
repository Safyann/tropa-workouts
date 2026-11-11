import type { ComponentPropsWithRef } from 'react';
import ui from './Common.module.css';
import styles from './Controls.module.css';

type ButtonProps = ComponentPropsWithRef<'button'> & {
  variant?: 'primary' | 'secondary' | 'plain';
};

export function Button({
  variant = 'secondary',
  type = 'button',
  className,
  ...props
}: ButtonProps) {
  const variantClass = variant === 'plain' ? undefined : ui[variant];
  return (
    <button
      {...props}
      type={type}
      className={[variantClass, className].filter(Boolean).join(' ')}
    />
  );
}

export function Input({ type, className, ...props }: ComponentPropsWithRef<'input'>) {
  const fieldClass = type === 'file' ? undefined : styles.field;
  return (
    <input {...props} type={type} className={[fieldClass, className].filter(Boolean).join(' ')} />
  );
}

export function Checkbox({ className, ...props }: Omit<ComponentPropsWithRef<'input'>, 'type'>) {
  return (
    <input
      {...props}
      type="checkbox"
      className={[styles.checkbox, className].filter(Boolean).join(' ')}
    />
  );
}

export function Select({ className, ...props }: ComponentPropsWithRef<'select'>) {
  return <select {...props} className={[styles.field, className].filter(Boolean).join(' ')} />;
}
