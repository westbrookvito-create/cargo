import { NavLink } from 'react-router-dom'
import { Home, Package, Calculator, User } from 'lucide-react'
import { haptics } from '../lib/telegram'

const items = [
  { to: '/', label: 'Главная', icon: Home, end: true },
  { to: '/shipments', label: 'Посылки', icon: Package, end: false },
  { to: '/calculator', label: 'Калькулятор', icon: Calculator, end: false },
  { to: '/profile', label: 'Профиль', icon: User, end: false },
]

export function BottomNav() {
  return (
    <nav
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[560px] z-40 px-3 pb-[max(10px,env(safe-area-inset-bottom))] pt-2"
      style={{
        background: 'color-mix(in srgb, var(--color-bg) 88%, transparent)',
        backdropFilter: 'blur(16px)',
        borderTop: '1px solid var(--color-border-soft)',
      }}
    >
      <div className="flex items-stretch justify-between">
        {items.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={() => haptics.selectionChanged()}
            className="flex-1 flex flex-col items-center gap-1 py-1.5 rounded-xl"
          >
            {({ isActive }) => (
              <>
                <Icon
                  size={22}
                  strokeWidth={isActive ? 2.4 : 1.8}
                  color={isActive ? 'var(--color-accent)' : 'var(--color-text-tertiary)'}
                />
                <span
                  className="text-[10.5px] font-medium"
                  style={{ color: isActive ? 'var(--color-accent)' : 'var(--color-text-tertiary)' }}
                >
                  {label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
