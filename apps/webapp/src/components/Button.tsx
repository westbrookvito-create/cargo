import type { ButtonHTMLAttributes, ReactNode } from 'react'
import clsx from 'clsx'
import { haptics } from '../lib/telegram'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'md' | 'lg' | 'sm'

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  fullWidth,
  className,
  onClick,
  ...rest
}: {
  children: ReactNode
  variant?: Variant
  size?: Size
  icon?: ReactNode
  fullWidth?: boolean
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  const base =
    'inline-flex items-center justify-center gap-2 font-semibold rounded-2xl transition-all active:scale-[0.97] disabled:opacity-40 disabled:pointer-events-none select-none'

  const sizes: Record<Size, string> = {
    sm: 'text-[13px] px-3.5 py-2',
    md: 'text-[14.5px] px-4.5 py-3',
    lg: 'text-[15.5px] px-5 py-3.5',
  }

  const variantStyle: Record<Variant, React.CSSProperties> = {
    primary: {
      background: 'linear-gradient(135deg, var(--color-accent), var(--color-accent-2))',
      color: '#1a0f00',
      boxShadow: '0 6px 20px -6px rgba(255,122,41,0.55)',
    },
    secondary: {
      background: 'var(--color-surface-2)',
      color: 'var(--color-text)',
      border: '1px solid var(--color-border)',
    },
    ghost: {
      background: 'transparent',
      color: 'var(--color-text-secondary)',
    },
    danger: {
      background: 'var(--color-danger-soft)',
      color: 'var(--color-danger)',
    },
  }

  return (
    <button
      className={clsx(base, sizes[size], fullWidth && 'w-full', className)}
      style={variantStyle[variant]}
      onClick={(e) => {
        haptics.impactOccurred('light')
        onClick?.(e)
      }}
      {...rest}
    >
      {icon}
      {children}
    </button>
  )
}
