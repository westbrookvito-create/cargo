import type { ShipmentStatus } from '../types'
import { Warehouse, Plane, Landmark, PackageCheck, Home } from 'lucide-react'

const stages: { status: ShipmentStatus; icon: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>; label: string }[] = [
  { status: 'in_warehouse_cn', icon: Warehouse, label: 'Китай' },
  { status: 'in_transit', icon: Plane, label: 'В пути' },
  { status: 'customs', icon: Landmark, label: 'Таможня' },
  { status: 'in_warehouse_local', icon: PackageCheck, label: 'Склад' },
  { status: 'delivered', icon: Home, label: 'Вручено' },
]

const order: ShipmentStatus[] = [
  'awaiting_arrival',
  'in_warehouse_cn',
  'packed',
  'in_transit',
  'customs',
  'in_warehouse_local',
  'delivered',
]

export function RouteStepper({ status }: { status: ShipmentStatus }) {
  const currentIdx = order.indexOf(status === 'issue' ? 'in_warehouse_cn' : status)

  return (
    <div className="flex items-start">
      {stages.map((stage, i) => {
        const stageIdx = order.indexOf(stage.status)
        const done = currentIdx >= stageIdx
        const isCurrent = stage.status === status || (i === stages.length - 1 && status === 'delivered' && stage.status === 'delivered')
        const Icon = stage.icon
        return (
          <div key={stage.status} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                style={{
                  background: done
                    ? 'linear-gradient(135deg, var(--color-accent), var(--color-accent-2))'
                    : 'var(--color-surface-2)',
                  boxShadow: isCurrent ? '0 0 0 4px var(--color-accent-soft)' : 'none',
                }}
              >
                <Icon size={16} strokeWidth={2.2} color={done ? '#1a0f00' : 'var(--color-text-tertiary)'} />
              </div>
              <span
                className="text-[10px] font-medium text-center leading-tight"
                style={{ color: done ? 'var(--color-text)' : 'var(--color-text-tertiary)' }}
              >
                {stage.label}
              </span>
            </div>
            {i < stages.length - 1 && (
              <div
                className="h-[2px] flex-1 -mt-4 mx-0.5 rounded-full"
                style={{
                  background:
                    currentIdx > stageIdx
                      ? 'linear-gradient(90deg, var(--color-accent), var(--color-accent-2))'
                      : 'var(--color-border)',
                }}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
