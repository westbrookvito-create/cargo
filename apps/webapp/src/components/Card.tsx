import type { HTMLAttributes, ReactNode } from 'react'
import clsx from 'clsx'

export function Card({
  children,
  className,
  interactive,
  ...rest
}: { children: ReactNode; interactive?: boolean } & HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx(
        'rounded-2xl border transition-transform',
        interactive && 'active:scale-[0.98] cursor-pointer',
        className,
      )}
      style={{
        background: 'var(--color-surface)',
        borderColor: 'var(--color-border)',
        boxShadow: 'var(--shadow-card)',
      }}
      {...rest}
    >
      {children}
    </div>
  )
}
