import type { TrackingEvent } from '../types'

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('ru-RU', {
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function ProgressTimeline({ events }: { events: TrackingEvent[] }) {
  const sorted = [...events].reverse()
  return (
    <div className="relative pl-1">
      {sorted.map((event, idx) => {
        const isFirst = idx === 0
        const isLast = idx === sorted.length - 1
        const isIssue = event.status === 'issue'
        return (
          <div key={event.id} className="relative flex gap-3.5 pb-6 last:pb-0">
            {!isLast && (
              <div
                className="absolute left-[7px] top-4 bottom-0 w-px"
                style={{ background: 'var(--color-border)' }}
              />
            )}
            <div className="relative shrink-0 mt-1">
              <div
                className="w-4 h-4 rounded-full flex items-center justify-center"
                style={{
                  background: isFirst
                    ? isIssue
                      ? 'var(--color-danger)'
                      : 'var(--color-accent)'
                    : 'var(--color-surface-2)',
                  border: isFirst ? 'none' : '2px solid var(--color-border)',
                }}
              >
                {isFirst && (
                  <div
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: isIssue ? '#fff' : '#1a0f00' }}
                  />
                )}
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <p
                className="text-[14.5px] font-semibold"
                style={{ color: isFirst ? 'var(--color-text)' : 'var(--color-text-secondary)' }}
              >
                {event.title}
              </p>
              {event.description && (
                <p className="text-[12.5px] mt-0.5" style={{ color: 'var(--color-text-tertiary)' }}>
                  {event.description}
                </p>
              )}
              <p className="text-[12px] mt-1 flex items-center gap-1.5 flex-wrap" style={{ color: 'var(--color-text-tertiary)' }}>
                <span>{formatDateTime(event.timestamp)}</span>
                {event.location && (
                  <>
                    <span>·</span>
                    <span>{event.location}</span>
                  </>
                )}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
