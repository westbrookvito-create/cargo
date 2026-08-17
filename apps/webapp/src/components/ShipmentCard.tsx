import { useNavigate } from 'react-router-dom'
import type { ShipmentItem } from '../types'
import { Card } from './Card'
import { StatusBadge } from './StatusBadge'
import { categoryLabel, formatUsd } from '../lib/mock-data'
import { ChevronRight, Weight, CalendarClock } from 'lucide-react'
import { haptics } from '../lib/telegram'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
}

export function ShipmentCard({ shipment }: { shipment: ShipmentItem }) {
  const navigate = useNavigate()
  return (
    <Card
      interactive
      className="p-4"
      onClick={() => {
        haptics.impactOccurred('light')
        navigate(`/shipments/${shipment.id}`)
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[13px] font-mono tracking-tight" style={{ color: 'var(--color-text-tertiary)' }}>
            {shipment.trackNumber}
          </p>
          <h3 className="text-[15px] font-semibold mt-0.5 truncate">{shipment.title}</h3>
          <p className="text-[12.5px] mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
            {categoryLabel(shipment.category)}
            {shipment.storeName ? ` · ${shipment.storeName}` : ''}
          </p>
        </div>
        <ChevronRight size={18} className="shrink-0 mt-1" color="var(--color-text-tertiary)" />
      </div>

      <div className="flex items-center justify-between mt-3.5">
        <StatusBadge status={shipment.status} compact />
        <div className="flex items-center gap-3 text-[12px]" style={{ color: 'var(--color-text-secondary)' }}>
          {shipment.weightKg && (
            <span className="flex items-center gap-1">
              <Weight size={12.5} /> {shipment.weightKg} кг
            </span>
          )}
          {shipment.etaDate && (
            <span className="flex items-center gap-1">
              <CalendarClock size={12.5} /> {formatDate(shipment.etaDate)}
            </span>
          )}
        </div>
      </div>

      {shipment.costUsd !== undefined && (
        <div
          className="mt-3 pt-3 flex items-center justify-between"
          style={{ borderTop: '1px solid var(--color-border-soft)' }}
        >
          <span className="text-[12.5px]" style={{ color: 'var(--color-text-secondary)' }}>
            Стоимость доставки
          </span>
          <span className="text-[14px] font-bold">{formatUsd(shipment.costUsd)}</span>
        </div>
      )}
    </Card>
  )
}
