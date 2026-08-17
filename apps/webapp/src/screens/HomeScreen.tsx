import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Bell, Calculator, MapPinned, PackagePlus, HeadphonesIcon, ChevronRight, TrendingUp, Gift,
} from 'lucide-react'
import { TopBar } from '../components/TopBar'
import { Card } from '../components/Card'
import { ShipmentCard } from '../components/ShipmentCard'
import { RouteStepper } from '../components/RouteStepper'
import { StatusBadge } from '../components/StatusBadge'
import { Skeleton } from '../components/Skeleton'
import { fetchProfile, fetchShipments } from '../lib/api'
import { pluralizeRu } from '../lib/mock-data'
import type { ShipmentItem, UserProfile } from '../types'
import { haptics } from '../lib/telegram'

const quickActions = [
  { icon: Calculator, label: 'Калькулятор', to: '/calculator', color: 'var(--color-info)', bg: 'var(--color-info-soft)' },
  { icon: MapPinned, label: 'Мой адрес', to: '/address', color: 'var(--color-accent)', bg: 'var(--color-accent-soft)' },
  { icon: PackagePlus, label: 'Новая посылка', to: '/new-shipment', color: 'var(--color-success)', bg: 'var(--color-success-soft)' },
  { icon: HeadphonesIcon, label: 'Поддержка', to: '/support', color: 'var(--color-warning)', bg: 'var(--color-warning-soft)' },
]

export function HomeScreen() {
  const navigate = useNavigate()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [shipments, setShipments] = useState<ShipmentItem[] | null>(null)

  useEffect(() => {
    fetchProfile().then(setProfile)
    fetchShipments().then(setShipments)
  }, [])

  const active = shipments?.filter((s) => s.status !== 'delivered')
  const featured = active?.[0]
  const recent = shipments?.slice(0, 3)

  return (
    <div className="pb-28">
      <TopBar
        title={profile ? `Привет, ${profile.firstName.split(' ')[0]} 👋` : 'CrispyCargo'}
        right={
          <button
            className="w-9 h-9 rounded-full flex items-center justify-center relative shrink-0"
            style={{ background: 'var(--color-surface-2)' }}
            onClick={() => haptics.impactOccurred('light')}
          >
            <Bell size={17} color="var(--color-text)" />
            <span
              className="absolute top-1.5 right-2 w-1.5 h-1.5 rounded-full"
              style={{ background: 'var(--color-accent)' }}
            />
          </button>
        }
      />

      <div className="px-4 flex flex-col gap-5">
        {/* Hero summary card */}
        <div
          className="rounded-3xl p-5 relative overflow-hidden animate-in"
          style={{ background: 'linear-gradient(150deg, #ff7a29 0%, #ffb238 100%)' }}
        >
          <div className="absolute -right-6 -top-10 w-40 h-40 rounded-full" style={{ background: 'rgba(255,255,255,0.12)' }} />
          <div className="absolute right-8 bottom-[-40px] w-28 h-28 rounded-full" style={{ background: 'rgba(255,255,255,0.10)' }} />
          <div className="relative flex items-start justify-between">
            <div>
              <p className="text-[12.5px] font-semibold" style={{ color: 'rgba(26,15,0,0.65)' }}>Активные посылки</p>
              <p className="text-[32px] font-black leading-none mt-1" style={{ color: '#1a0f00' }}>
                {profile ? profile.activeShipments : <span className="opacity-40">—</span>}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[12.5px] font-semibold" style={{ color: 'rgba(26,15,0,0.65)' }}>Всего доставлено</p>
              <p className="text-[20px] font-extrabold leading-none mt-1" style={{ color: '#1a0f00' }}>
                {profile
                  ? `${profile.totalShipments} ${pluralizeRu(profile.totalShipments, 'посылка', 'посылки', 'посылок')}`
                  : '—'}
              </p>
            </div>
          </div>
          <button
            onClick={() => { haptics.impactOccurred('light'); navigate('/shipments') }}
            className="relative mt-5 w-full flex items-center justify-between rounded-2xl px-4 py-3"
            style={{ background: 'rgba(26,15,0,0.14)' }}
          >
            <span className="text-[13.5px] font-bold" style={{ color: '#1a0f00' }}>Все мои посылки</span>
            <ChevronRight size={17} color="#1a0f00" />
          </button>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-4 gap-2.5">
          {quickActions.map(({ icon: Icon, label, to, color, bg }) => (
            <button
              key={to}
              onClick={() => { haptics.impactOccurred('light'); navigate(to) }}
              className="flex flex-col items-center gap-1.5 py-1"
            >
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: bg }}>
                <Icon size={20} color={color} />
              </div>
              <span className="text-[10.5px] font-medium text-center leading-tight" style={{ color: 'var(--color-text-secondary)' }}>
                {label}
              </span>
            </button>
          ))}
        </div>

        {/* Featured active shipment with route stepper */}
        {shipments === null ? (
          <Skeleton className="h-44" />
        ) : featured ? (
          <Card
            interactive
            className="p-4"
            onClick={() => navigate(`/shipments/${featured.id}`)}
          >
            <div className="flex items-center justify-between mb-1">
              <p className="text-[13px] font-semibold" style={{ color: 'var(--color-text-secondary)' }}>
                Текущая посылка
              </p>
              <StatusBadge status={featured.status} compact />
            </div>
            <h3 className="text-[15.5px] font-bold mb-4">{featured.title}</h3>
            <RouteStepper status={featured.status} />
          </Card>
        ) : null}

        {/* Promo / referral banner */}
        <Card className="p-4 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0" style={{ background: 'var(--color-success-soft)' }}>
            <Gift size={20} color="var(--color-success)" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13.5px] font-semibold">Пригласи друга — получи $5</p>
            <p className="text-[12px] mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
              Бонус зачислится после первой доставки друга
            </p>
          </div>
          <ChevronRight size={17} color="var(--color-text-tertiary)" className="shrink-0" />
        </Card>

        {/* Recent shipments */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[16px] font-bold flex items-center gap-1.5">
              <TrendingUp size={16} color="var(--color-accent)" />
              Последние посылки
            </h2>
            <button
              className="text-[12.5px] font-semibold"
              style={{ color: 'var(--color-accent)' }}
              onClick={() => navigate('/shipments')}
            >
              Все
            </button>
          </div>
          <div className="flex flex-col gap-2.5">
            {shipments === null ? (
              <>
                <Skeleton className="h-32" />
                <Skeleton className="h-32" />
              </>
            ) : (
              recent!.map((s) => <ShipmentCard key={s.id} shipment={s} />)
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
