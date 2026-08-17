import type { ShipmentStatus } from '../types'
import { statusLabel } from '../lib/mock-data'
import {
  Clock, Warehouse, PackageCheck, Plane, Landmark, CheckCircle2, AlertTriangle, Box,
} from 'lucide-react'

const config: Record<ShipmentStatus, { color: string; bg: string; icon: React.ComponentType<{ size?: number; className?: string }> }> = {
  awaiting_arrival: { color: 'var(--color-text-secondary)', bg: 'var(--color-surface-2)', icon: Clock },
  in_warehouse_cn: { color: 'var(--color-info)', bg: 'var(--color-info-soft)', icon: Warehouse },
  packed: { color: 'var(--color-info)', bg: 'var(--color-info-soft)', icon: Box },
  in_transit: { color: 'var(--color-accent)', bg: 'var(--color-accent-soft)', icon: Plane },
  customs: { color: 'var(--color-warning)', bg: 'var(--color-warning-soft)', icon: Landmark },
  in_warehouse_local: { color: 'var(--color-accent)', bg: 'var(--color-accent-soft)', icon: PackageCheck },
  delivered: { color: 'var(--color-success)', bg: 'var(--color-success-soft)', icon: CheckCircle2 },
  issue: { color: 'var(--color-danger)', bg: 'var(--color-danger-soft)', icon: AlertTriangle },
}

export function StatusBadge({ status, compact }: { status: ShipmentStatus; compact?: boolean }) {
  const { color, bg, icon: Icon } = config[status]
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full font-medium whitespace-nowrap"
      style={{
        color,
        background: bg,
        padding: compact ? '4px 9px' : '6px 12px',
        fontSize: compact ? 11.5 : 12.5,
      }}
    >
      <Icon size={compact ? 12 : 13} />
      {statusLabel(status)}
    </span>
  )
}
