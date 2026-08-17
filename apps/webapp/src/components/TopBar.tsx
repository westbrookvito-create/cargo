import type { ReactNode } from 'react'
import { ChevronLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { haptics } from '../lib/telegram'

export function TopBar({
  title,
  back,
  right,
}: {
  title: string
  back?: boolean
  right?: ReactNode
}) {
  const navigate = useNavigate()
  return (
    <div
      className="sticky top-0 z-30 flex items-center gap-2 px-4 pt-[max(14px,env(safe-area-inset-top))] pb-3"
      style={{
        background: 'color-mix(in srgb, var(--color-bg) 85%, transparent)',
        backdropFilter: 'blur(16px)',
      }}
    >
      {back && (
        <button
          onClick={() => {
            haptics.impactOccurred('light')
            navigate(-1)
          }}
          className="w-8 h-8 -ml-1.5 flex items-center justify-center rounded-full shrink-0"
          style={{ background: 'var(--color-surface-2)' }}
        >
          <ChevronLeft size={19} color="var(--color-text)" />
        </button>
      )}
      <h1 className="text-[19px] font-bold tracking-tight flex-1 truncate">{title}</h1>
      {right}
    </div>
  )
}
