import { useEffect, useState } from 'react'
import { Copy, Check, MapPin, ShieldAlert, ListChecks } from 'lucide-react'
import { TopBar } from '../components/TopBar'
import { Card } from '../components/Card'
import { fetchProfile, fetchWarehouses } from '../lib/api'
import type { UserProfile, WarehouseAddress } from '../types'
import { haptics } from '../lib/telegram'

function useCopy() {
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const copy = async (key: string, value: string) => {
    await navigator.clipboard?.writeText(value).catch(() => {})
    haptics.notificationOccurred('success')
    setCopiedKey(key)
    setTimeout(() => setCopiedKey((k) => (k === key ? null : k)), 1500)
  }
  return { copiedKey, copy }
}

const steps = [
  'Выберите склад в Китае ниже и скопируйте полный адрес',
  'При оформлении заказа на Taobao / 1688 / Poizon укажите этот адрес получателем',
  'Обязательно впишите ваш персональный код в поле "получатель" или комментарий к заказу',
  'Мы примем посылку на складе, взвесим и добавим её в ваш личный кабинет автоматически',
]

export function AddressScreen() {
  const [warehouses, setWarehouses] = useState<WarehouseAddress[] | null>(null)
  const [selected, setSelected] = useState<WarehouseAddress | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const { copiedKey, copy } = useCopy()

  useEffect(() => {
    fetchProfile().then(setProfile)
    fetchWarehouses().then((list) => {
      setWarehouses(list)
      setSelected(list.find((w) => w.isDefault) ?? list[0])
    })
  }, [])

  if (!warehouses || !selected) {
    return (
      <div className="pb-28">
        <TopBar title="Мой адрес в Китае" />
      </div>
    )
  }

  const fullAddress = selected.addressLines.join(', ')
  const code = profile?.personalCode ?? selected.personalCode ?? ''

  return (
    <div className="pb-28">
      <TopBar title="Мой адрес в Китае" />

      <div className="px-4 flex flex-col gap-4">
        <div className="flex gap-2">
          {warehouses.map((w) => {
            const active = w.id === selected.id
            return (
              <button
                key={w.id}
                onClick={() => { haptics.selectionChanged(); setSelected(w) }}
                className="flex-1"
              >
                <Card
                  className="p-3 flex flex-col items-center gap-1"
                  style={{ borderColor: active ? 'var(--color-accent)' : 'var(--color-border)' }}
                >
                  <MapPin size={16} color={active ? 'var(--color-accent)' : 'var(--color-text-tertiary)'} />
                  <span className="text-[13px] font-bold">{w.cityRu}</span>
                  {w.isDefault && (
                    <span className="text-[10px] font-semibold" style={{ color: 'var(--color-success)' }}>
                      Рекомендуем
                    </span>
                  )}
                </Card>
              </button>
            )
          })}
        </div>

        <Card
          className="p-4 relative overflow-hidden"
          style={{ background: 'linear-gradient(160deg, var(--color-accent-soft), var(--color-surface))' }}
        >
          <p className="text-[12px] font-semibold" style={{ color: 'var(--color-text-secondary)' }}>
            Ваш персональный код
          </p>
          <div className="flex items-center justify-between mt-1.5">
            <span className="text-[26px] font-black tracking-wide brand-gradient-text">{code}</span>
            <button
              onClick={() => copy('code', code)}
              className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
              style={{ background: 'var(--color-surface)' }}
            >
              {copiedKey === 'code' ? <Check size={15} color="var(--color-success)" /> : <Copy size={15} color="var(--color-text-secondary)" />}
            </button>
          </div>
          <p className="text-[11.5px] mt-2" style={{ color: 'var(--color-text-tertiary)' }}>
            Без этого кода мы не сможем определить, что посылка ваша
          </p>
        </Card>

        <Card className="p-4">
          <p className="text-[12.5px] font-semibold mb-2.5" style={{ color: 'var(--color-text-secondary)' }}>
            Адрес склада «{selected.cityRu}»
          </p>
          <div className="flex flex-col gap-2">
            {selected.addressLines.map((line, i) => (
              <div key={i} className="flex items-center justify-between gap-2">
                <p className="text-[14.5px] leading-relaxed">{line}</p>
                <button
                  onClick={() => copy(`line-${i}`, line)}
                  className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: 'var(--color-surface-2)' }}
                >
                  {copiedKey === `line-${i}` ? <Check size={12} color="var(--color-success)" /> : <Copy size={12} color="var(--color-text-secondary)" />}
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={() => copy('full', `${fullAddress}, ${code}`)}
            className="w-full mt-3.5 py-2.5 rounded-xl text-[13px] font-bold flex items-center justify-center gap-2"
            style={{ background: 'var(--color-surface-2)' }}
          >
            {copiedKey === 'full' ? <Check size={14} color="var(--color-success)" /> : <Copy size={14} />}
            Скопировать адрес целиком
          </button>
        </Card>

        <Card className="p-4">
          <p className="text-[13.5px] font-bold mb-3 flex items-center gap-2">
            <ListChecks size={16} color="var(--color-accent)" />
            Как оформить заказ
          </p>
          <div className="flex flex-col gap-3">
            {steps.map((s, i) => (
              <div key={i} className="flex gap-3">
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[11px] font-bold mt-0.5"
                  style={{ background: 'var(--color-accent-soft)', color: 'var(--color-accent)' }}
                >
                  {i + 1}
                </div>
                <p className="text-[13px] leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>{s}</p>
              </div>
            ))}
          </div>
        </Card>

        <div className="flex items-start gap-2.5 p-3.5 rounded-2xl" style={{ background: 'var(--color-warning-soft)' }}>
          <ShieldAlert size={16} color="var(--color-warning)" className="shrink-0 mt-0.5" />
          <p className="text-[12px] leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
            Посылки без персонального кода хранятся на складе 30 дней, после чего утилизируются согласно правилам сервиса.
          </p>
        </div>
      </div>
    </div>
  )
}
