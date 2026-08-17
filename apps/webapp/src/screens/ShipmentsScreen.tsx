import { useEffect, useMemo, useState } from 'react'
import { Search, PackageX, PackagePlus } from 'lucide-react'
import { TopBar } from '../components/TopBar'
import { ShipmentCard } from '../components/ShipmentCard'
import { Skeleton } from '../components/Skeleton'
import { fetchShipments } from '../lib/api'
import type { ShipmentItem, ShipmentStatus } from '../types'
import { useNavigate } from 'react-router-dom'
import { haptics } from '../lib/telegram'

type FilterKey = 'all' | 'active' | 'delivered' | 'issue'

const filters: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'Все' },
  { key: 'active', label: 'В пути' },
  { key: 'delivered', label: 'Доставлено' },
  { key: 'issue', label: 'Внимание' },
]

const activeStatuses: ShipmentStatus[] = [
  'awaiting_arrival', 'in_warehouse_cn', 'packed', 'in_transit', 'customs', 'in_warehouse_local',
]

export function ShipmentsScreen() {
  const navigate = useNavigate()
  const [shipments, setShipments] = useState<ShipmentItem[] | null>(null)
  const [filter, setFilter] = useState<FilterKey>('all')
  const [query, setQuery] = useState('')

  useEffect(() => {
    fetchShipments().then(setShipments)
  }, [])

  const filtered = useMemo(() => {
    if (!shipments) return null
    let list = shipments
    if (filter === 'active') list = list.filter((s) => activeStatuses.includes(s.status))
    if (filter === 'delivered') list = list.filter((s) => s.status === 'delivered')
    if (filter === 'issue') list = list.filter((s) => s.status === 'issue')
    if (query.trim()) {
      const q = query.trim().toLowerCase()
      list = list.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.trackNumber.toLowerCase().includes(q) ||
          s.cnTrackNumber?.toLowerCase().includes(q),
      )
    }
    return list
  }, [shipments, filter, query])

  return (
    <div className="pb-28">
      <TopBar
        title="Мои посылки"
        right={
          <button
            onClick={() => { haptics.impactOccurred('light'); navigate('/new-shipment') }}
            className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
            style={{ background: 'var(--color-accent-soft)' }}
          >
            <PackagePlus size={17} color="var(--color-accent)" />
          </button>
        }
      />

      <div className="px-4 flex flex-col gap-4">
        <div
          className="flex items-center gap-2.5 rounded-2xl px-3.5 py-2.5"
          style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
        >
          <Search size={16} color="var(--color-text-tertiary)" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Трек-номер или название"
            className="bg-transparent outline-none text-[14px] flex-1 min-w-0"
            style={{ color: 'var(--color-text)' }}
          />
        </div>

        <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4">
          {filters.map((f) => {
            const active = filter === f.key
            return (
              <button
                key={f.key}
                onClick={() => { haptics.selectionChanged(); setFilter(f.key) }}
                className="px-3.5 py-2 rounded-full text-[13px] font-semibold whitespace-nowrap shrink-0"
                style={{
                  background: active ? 'var(--color-accent)' : 'var(--color-surface-2)',
                  color: active ? '#1a0f00' : 'var(--color-text-secondary)',
                }}
              >
                {f.label}
              </button>
            )
          })}
        </div>

        <div className="flex flex-col gap-2.5">
          {filtered === null ? (
            <>
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
            </>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center text-center py-16 gap-3">
              <PackageX size={38} color="var(--color-text-tertiary)" />
              <p className="text-[14px]" style={{ color: 'var(--color-text-secondary)' }}>
                Посылки не найдены
              </p>
            </div>
          ) : (
            filtered.map((s) => <ShipmentCard key={s.id} shipment={s} />)
          )}
        </div>
      </div>
    </div>
  )
}
