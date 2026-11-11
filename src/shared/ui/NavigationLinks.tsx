import type { ComponentPropsWithRef } from 'react';
import ui from './Common.module.css';

type LinkProps = ComponentPropsWithRef<'a'> & { href: string };

export function BackLink({ children, ...props }: Omit<LinkProps, 'className'>) {
  return (
    <a {...props} className={ui.back}>
      ← {children}
    </a>
  );
}

export function ButtonLink({ className, ...props }: LinkProps) {
  return <a {...props} className={[ui.secondary, className].filter(Boolean).join(' ')} />;
}
