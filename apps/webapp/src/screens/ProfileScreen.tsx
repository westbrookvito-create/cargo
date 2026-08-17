import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  MapPinned, Gift, Bell, Globe, Moon, Sun, HeadphonesIcon, ShieldCheck, ChevronRight, Wallet, Package, Weight, Copy, Check,
} from 'lucide-react'
import { TopBar } from '../components/TopBar'
import { Card } from '../components/Card'
import { fetchProfile } from '../lib/api'
import { formatUsd, formatMonthYearRu } from '../lib/mock-data'
import type { UserProfile } from '../types'
import { haptics } from '../lib/telegram'
import { useTelegramTheme } from '../hooks/useTelegramTheme'

function MenuRow({
  icon: Icon, label, value, onClick, danger,
}: { icon: React.ComponentType<{ size?: number; color?: string }>; label: string; value?: React.ReactNode; onClick?: () => void; danger?: boolean }) {
  return (
    <button onClick={onClick} className="w-full flex items-center gap-3 py-3">
      <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: danger ? 'var(--color-danger-soft)' : 'var(--color-surface-2)' }}>
        <Icon size={16} color={danger ? 'var(--color-danger)' : 'var(--color-text-secondary)'} />
      </div>
      <span className="flex-1 text-left text-[14px] font-medium" style={{ color: danger ? 'var(--color-danger)' : 'var(--color-text)' }}>
        {label}
      </span>
      {value}
      <ChevronRight size={16} color="var(--color-text-tertiary)" />
    </button>
  )
}

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <div
      onClick={(e) => { e.stopPropagation(); haptics.selectionChanged(); onChange(!on) }}
      className="w-10 h-6 rounded-full flex items-center px-0.5 shrink-0 mr-1"
      style={{ background: on ? 'var(--color-accent)' : 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}
    >
      <div
        className="w-4.5 h-4.5 rounded-full bg-white transition-transform"
        style={{ width: 18, height: 18, transform: on ? 'translateX(16px)' : 'translateX(0)' }}
      />
    </div>
  )
}

export function ProfileScreen() {
  const navigate = useNavigate()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [notifications, setNotifications] = useState(true)
  const [copied, setCopied] = useState(false)
  const { theme, setTheme } = useTelegramTheme()

  useEffect(() => {
    fetchProfile().then((p) => { setProfile(p); setNotifications(p.notificationsEnabled) })
  }, [])

  const initials = profile ? `${profile.firstName[0]}${profile.lastName?.[0] ?? ''}` : ''

  return (
    <div className="pb-28">
      <TopBar title="Профиль" />

      <div className="px-4 flex flex-col gap-4">
        <Card className="p-4 flex items-center gap-3.5">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-[19px] font-black shrink-0"
            style={{ background: 'linear-gradient(135deg, var(--color-accent), var(--color-accent-2))', color: '#1a0f00' }}
          >
            {initials || '—'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[16px] font-bold truncate">
              {profile ? `${profile.firstName} ${profile.lastName ?? ''}` : '—'}
            </p>
            <p className="text-[13px] truncate" style={{ color: 'var(--color-text-secondary)' }}>
              {profile?.username ? `@${profile.username}` : ''}
            </p>
          </div>
        </Card>

        <div className="grid grid-cols-3 gap-2.5">
          <Card className="p-3 flex flex-col items-center gap-1 text-center">
            <Package size={16} color="var(--color-accent)" />
            <span className="text-[15px] font-extrabold">{profile?.totalShipments ?? '—'}</span>
            <span className="text-[10px]" style={{ color: 'var(--color-text-tertiary)' }}>Посылок</span>
          </Card>
          <Card className="p-3 flex flex-col items-center gap-1 text-center">
            <Weight size={16} color="var(--color-accent)" />
            <span className="text-[15px] font-extrabold">{profile?.totalWeightKg ?? '—'}</span>
            <span className="text-[10px]" style={{ color: 'var(--color-text-tertiary)' }}>Кг всего</span>
          </Card>
          <Card className="p-3 flex flex-col items-center gap-1 text-center">
            <Wallet size={16} color="var(--color-accent)" />
            <span className="text-[15px] font-extrabold">{profile ? formatUsd(profile.balanceUsd) : '—'}</span>
            <span className="text-[10px]" style={{ color: 'var(--color-text-tertiary)' }}>Баланс</span>
          </Card>
        </div>

        <Card
          className="p-4 flex items-center gap-3.5"
          onClick={async () => {
            if (!profile) return
            await navigator.clipboard?.writeText(profile.referralCode).catch(() => {})
            haptics.notificationOccurred('success')
            setCopied(true)
            setTimeout(() => setCopied(false), 1500)
          }}
          interactive
        >
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0" style={{ background: 'var(--color-success-soft)' }}>
            <Gift size={20} color="var(--color-success)" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13.5px] font-semibold">Реферальный код</p>
            <p className="text-[12px] mt-0.5 font-mono" style={{ color: 'var(--color-text-secondary)' }}>
              {profile?.referralCode ?? '—'}
            </p>
          </div>
          {copied ? <Check size={17} color="var(--color-success)" /> : <Copy size={17} color="var(--color-text-tertiary)" />}
        </Card>

        <Card className="px-4">
          <div style={{ borderColor: 'var(--color-border-soft)' }}>
            <MenuRow icon={MapPinned} label="Мой адрес в Китае" onClick={() => navigate('/address')} />
          </div>
          <div style={{ borderTop: '1px solid var(--color-border-soft)' }}>
            <MenuRow
              icon={Bell}
              label="Уведомления"
              value={<Toggle on={notifications} onChange={setNotifications} />}
            />
          </div>
          <div style={{ borderTop: '1px solid var(--color-border-soft)' }}>
            <MenuRow
              icon={theme === 'dark' ? Moon : Sun}
              label="Тёмная тема"
              value={<Toggle on={theme === 'dark'} onChange={(v) => setTheme(v ? 'dark' : 'light')} />}
            />
          </div>
          <div style={{ borderTop: '1px solid var(--color-border-soft)' }}>
            <MenuRow icon={Globe} label="Язык" value={<span className="text-[13px] mr-1" style={{ color: 'var(--color-text-tertiary)' }}>Русский</span>} />
          </div>
        </Card>

        <Card className="px-4">
          <MenuRow icon={HeadphonesIcon} label="Поддержка и FAQ" onClick={() => navigate('/support')} />
          <div style={{ borderTop: '1px solid var(--color-border-soft)' }}>
            <MenuRow icon={ShieldCheck} label="Условия и запрещённые товары" />
          </div>
        </Card>

        <p className="text-center text-[11.5px] mt-1" style={{ color: 'var(--color-text-tertiary)' }}>
          CrispyCargo · с нами с {profile ? formatMonthYearRu(profile.memberSince) : '—'}
        </p>
      </div>
    </div>
  )
}
