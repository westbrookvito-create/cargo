import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Copy, Check, Weight, Box, DollarSign, Truck, AlertTriangle, MessageCircle } from 'lucide-react'
import { TopBar } from '../components/TopBar'
import { Card } from '../components/Card'
import { StatusBadge } from '../components/StatusBadge'
import { RouteStepper } from '../components/RouteStepper'
import { ProgressTimeline } from '../components/ProgressTimeline'
import { Button } from '../components/Button'
import { Skeleton } from '../components/Skeleton'
import { fetchShipment } from '../lib/api'
import { categoryLabel, formatUsd } from '../lib/mock-data'
import type { ShipmentItem } from '../types'
import { haptics } from '../lib/telegram'

function CopyRow({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <div className="flex items-center justify-between py-2.5">
      <div>
        <p className="text-[11.5px]" style={{ color: 'var(--color-text-tertiary)' }}>{label}</p>
        <p className="text-[13.5px] font-mono font-medium mt-0.5">{value}</p>
      </div>
      <button
        onClick={async () => {
          await navigator.clipboard?.writeText(value).catch(() => {})
          haptics.notificationOccurred('success')
          setCopied(true)
          setTimeout(() => setCopied(false), 1500)
        }}
        className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
        style={{ background: 'var(--color-surface-2)' }}
      >
        {copied ? <Check size={14} color="var(--color-success)" /> : <Copy size={14} color="var(--color-text-secondary)" />}
      </button>
    </div>
  )
}

export function ShipmentDetailScreen() {
  const { id } = useParams<{ id: string }>()
  const [shipment, setShipment] = useState<ShipmentItem | null | undefined>(null)

  useEffect(() => {
    if (!id) return
    fetchShipment(id).then((s) => setShipment(s ?? undefined))
  }, [id])

  if (shipment === undefined) {
    return (
      <div className="pb-28">
        <TopBar title="Посылка" back />
        <div className="px-4 py-10 text-center text-[14px]" style={{ color: 'var(--color-text-secondary)' }}>
          Посылка не найдена
        </div>
      </div>
    )
  }

  if (!shipment) {
    return (
      <div className="pb-28 px-4">
        <TopBar title="Посылка" back />
        <div className="flex flex-col gap-3">
          <Skeleton className="h-40" />
          <Skeleton className="h-28" />
          <Skeleton className="h-64" />
        </div>
      </div>
    )
  }

  const isIssue = shipment.status === 'issue'

  return (
    <div className="pb-32">
      <TopBar title={shipment.trackNumber} back right={<StatusBadge status={shipment.status} compact />} />

      <div className="px-4 flex flex-col gap-4">
        <div>
          <h1 className="text-[19px] font-extrabold leading-tight">{shipment.title}</h1>
          <p className="text-[13px] mt-1" style={{ color: 'var(--color-text-secondary)' }}>
            {categoryLabel(shipment.category)}
            {shipment.storeName ? ` · ${shipment.storeName}` : ''}
          </p>
        </div>

        {isIssue && (
          <div
            className="flex items-start gap-3 p-3.5 rounded-2xl"
            style={{ background: 'var(--color-danger-soft)' }}
          >
            <AlertTriangle size={18} color="var(--color-danger)" className="shrink-0 mt-0.5" />
            <div>
              <p className="text-[13.5px] font-semibold" style={{ color: 'var(--color-danger)' }}>
                Требуется ваше действие
              </p>
              <p className="text-[12.5px] mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
                {shipment.events[shipment.events.length - 1]?.description}
              </p>
            </div>
          </div>
        )}

        {shipment.status !== 'issue' && (
          <Card className="p-4">
            <RouteStepper status={shipment.status} />
          </Card>
        )}

        <div className="grid grid-cols-3 gap-2.5">
          <Card className="p-3 flex flex-col items-center text-center gap-1">
            <Weight size={16} color="var(--color-accent)" />
            <span className="text-[13.5px] font-bold">{shipment.weightKg ?? '—'} {shipment.weightKg ? 'кг' : ''}</span>
            <span className="text-[10.5px]" style={{ color: 'var(--color-text-tertiary)' }}>Вес</span>
          </Card>
          <Card className="p-3 flex flex-col items-center text-center gap-1">
            <Box size={16} color="var(--color-accent)" />
            <span className="text-[13.5px] font-bold">{shipment.volumeM3 ? `${(shipment.volumeM3 * 1000).toFixed(1)} л` : '—'}</span>
            <span className="text-[10.5px]" style={{ color: 'var(--color-text-tertiary)' }}>Объём</span>
          </Card>
          <Card className="p-3 flex flex-col items-center text-center gap-1">
            <DollarSign size={16} color="var(--color-accent)" />
            <span className="text-[13.5px] font-bold">{shipment.costUsd ? formatUsd(shipment.costUsd) : '—'}</span>
            <span className="text-[10.5px]" style={{ color: 'var(--color-text-tertiary)' }}>Доставка</span>
          </Card>
        </div>

        <Card className="px-4">
          <CopyRow label="Трек-номер CrispyCargo" value={shipment.trackNumber} />
          {shipment.cnTrackNumber && (
            <div style={{ borderTop: '1px solid var(--color-border-soft)' }}>
              <CopyRow label="Трек-номер китайской службы" value={shipment.cnTrackNumber} />
            </div>
          )}
        </Card>

        {shipment.paid === false && shipment.status !== 'delivered' && (
          <div className="flex items-center gap-2 p-3.5 rounded-2xl" style={{ background: 'var(--color-warning-soft)' }}>
            <Truck size={17} color="var(--color-warning)" className="shrink-0" />
            <p className="text-[12.5px]" style={{ color: 'var(--color-text-secondary)' }}>
              Оплата станет доступна после взвешивания на складе в Китае
            </p>
          </div>
        )}

        <div>
          <h2 className="text-[15px] font-bold mb-3">История отслеживания</h2>
          <Card className="p-4">
            <ProgressTimeline events={shipment.events} />
          </Card>
        </div>
      </div>

      <div
        className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[560px] px-4 pb-[max(14px,env(safe-area-inset-bottom))] pt-3 flex gap-2.5"
        style={{ background: 'linear-gradient(to top, var(--color-bg) 60%, transparent)' }}
      >
        {isIssue ? (
          <Button fullWidth icon={<MessageCircle size={16} />}>
            Решить вопрос со складом
          </Button>
        ) : shipment.paid && shipment.status !== 'delivered' ? (
          <Button variant="secondary" fullWidth icon={<MessageCircle size={16} />}>
            Написать в поддержку
          </Button>
        ) : shipment.status !== 'delivered' ? (
          <Button fullWidth icon={<DollarSign size={16} />}>
            Оплатить {shipment.costUsd ? formatUsd(shipment.costUsd) : ''}
          </Button>
        ) : (
          <Button variant="secondary" fullWidth icon={<MessageCircle size={16} />}>
            Написать в поддержку
          </Button>
        )}
      </div>
    </div>
  )
}
