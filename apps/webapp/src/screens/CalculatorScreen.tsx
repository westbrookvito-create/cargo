import { useEffect, useMemo, useState } from 'react'
import { Plane, Truck, Zap, Info } from 'lucide-react'
import { TopBar } from '../components/TopBar'
import { Card } from '../components/Card'
import { Button } from '../components/Button'
import { formatUsd, categoryLabel } from '../lib/mock-data'
import { fetchTariffs } from '../lib/api'
import type { CargoCategory, DeliveryMethod, TariffRate } from '../types'
import { haptics } from '../lib/telegram'
import { useNavigate } from 'react-router-dom'

const methodIcons: Record<DeliveryMethod, React.ComponentType<{ size?: number; color?: string }>> = {
  express: Zap,
  avia: Plane,
  auto: Truck,
}

const categories: { key: CargoCategory; multiplier: number; note?: string }[] = [
  { key: 'general', multiplier: 1 },
  { key: 'clothes', multiplier: 1 },
  { key: 'shoes', multiplier: 1.05 },
  { key: 'electronics', multiplier: 1 },
  { key: 'accessories', multiplier: 1 },
  { key: 'battery', multiplier: 1.2, note: 'Требуется маркировка Wh' },
  { key: 'liquid', multiplier: 1.15, note: 'Требуется декларация' },
  { key: 'branded', multiplier: 1.1, note: 'Возможна доп. проверка' },
]

const MIN_CHARGE_USD = 5

export function CalculatorScreen() {
  const navigate = useNavigate()
  const [weight, setWeight] = useState('2.5')
  const [category, setCategory] = useState<CargoCategory>('general')
  const [method, setMethod] = useState<DeliveryMethod>('avia')
  const [tariffs, setTariffs] = useState<TariffRate[] | null>(null)

  useEffect(() => {
    fetchTariffs().then(setTariffs)
  }, [])

  const weightNum = Math.max(0, parseFloat(weight.replace(',', '.')) || 0)
  const tariff = tariffs?.find((t) => t.method === method)
  const cat = categories.find((c) => c.key === category)!

  const { subtotal, total, belowMin } = useMemo(() => {
    if (!tariff) return { subtotal: 0, total: 0, belowMin: false }
    const belowMin = weightNum > 0 && weightNum < tariff.minWeightKg
    const effectiveWeight = Math.max(weightNum, tariff.minWeightKg)
    const subtotal = effectiveWeight * tariff.pricePerKgUsd * cat.multiplier
    const total = Math.max(subtotal, MIN_CHARGE_USD)
    return { subtotal, total, belowMin }
  }, [weightNum, tariff, cat])

  if (!tariffs || !tariff) {
    return (
      <div className="pb-28">
        <TopBar title="Калькулятор доставки" />
      </div>
    )
  }

  return (
    <div className="pb-28">
      <TopBar title="Калькулятор доставки" />

      <div className="px-4 flex flex-col gap-5">
        <Card className="p-4">
          <label className="text-[12.5px] font-semibold" style={{ color: 'var(--color-text-secondary)' }}>
            Вес посылки, кг
          </label>
          <div className="flex items-center gap-3 mt-2">
            <input
              inputMode="decimal"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="text-[30px] font-black bg-transparent outline-none w-32"
              style={{ color: 'var(--color-text)' }}
            />
            <span className="text-[16px] font-semibold" style={{ color: 'var(--color-text-tertiary)' }}>кг</span>
          </div>
          <input
            type="range"
            min={0.1}
            max={30}
            step={0.1}
            value={weightNum}
            onChange={(e) => setWeight(e.target.value)}
            className="w-full mt-3"
            style={{ ['--range-progress' as string]: `${((weightNum - 0.1) / (30 - 0.1)) * 100}%` }}
          />
        </Card>

        <div>
          <p className="text-[13px] font-semibold mb-2.5" style={{ color: 'var(--color-text-secondary)' }}>
            Категория товара
          </p>
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => {
              const active = c.key === category
              return (
                <button
                  key={c.key}
                  onClick={() => { haptics.selectionChanged(); setCategory(c.key) }}
                  className="px-3.5 py-2 rounded-full text-[12.5px] font-semibold"
                  style={{
                    background: active ? 'var(--color-accent)' : 'var(--color-surface-2)',
                    color: active ? '#1a0f00' : 'var(--color-text-secondary)',
                  }}
                >
                  {categoryLabel(c.key)}
                </button>
              )
            })}
          </div>
          {cat.note && (
            <p className="flex items-center gap-1.5 text-[12px] mt-2.5" style={{ color: 'var(--color-warning)' }}>
              <Info size={13} /> {cat.note}
            </p>
          )}
        </div>

        <div>
          <p className="text-[13px] font-semibold mb-2.5" style={{ color: 'var(--color-text-secondary)' }}>
            Способ доставки
          </p>
          <div className="flex flex-col gap-2.5">
            {tariffs.map((t) => {
              const Icon = methodIcons[t.method]
              const active = t.method === method
              return (
                <button
                  key={t.method}
                  onClick={() => { haptics.selectionChanged(); setMethod(t.method) }}
                  className="text-left"
                >
                  <Card
                    className="p-3.5 flex items-center gap-3.5"
                    style={{
                      borderColor: active ? 'var(--color-accent)' : 'var(--color-border)',
                      boxShadow: active ? 'var(--shadow-glow)' : 'var(--shadow-card)',
                    }}
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: active ? 'var(--color-accent-soft)' : 'var(--color-surface-2)' }}
                    >
                      <Icon size={18} color={active ? 'var(--color-accent)' : 'var(--color-text-secondary)'} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-bold">{t.title}</p>
                      <p className="text-[12px]" style={{ color: 'var(--color-text-secondary)' }}>
                        {t.subtitle} · {t.minDays}-{t.maxDays} дней
                      </p>
                    </div>
                    <p className="text-[14px] font-extrabold shrink-0" style={{ color: 'var(--color-accent)' }}>
                      ${t.pricePerKgUsd}/кг
                    </p>
                  </Card>
                </button>
              )
            })}
          </div>
        </div>

        <Card className="p-4">
          <div className="flex items-center justify-between text-[13px]">
            <span style={{ color: 'var(--color-text-secondary)' }}>
              {Math.max(weightNum, tariff.minWeightKg).toFixed(1)} кг × {formatUsd(tariff.pricePerKgUsd)}
              {cat.multiplier !== 1 ? ` × ${cat.multiplier}` : ''}
            </span>
            <span>{formatUsd(subtotal)}</span>
          </div>
          {belowMin && (
            <p className="text-[11.5px] mt-1.5" style={{ color: 'var(--color-text-tertiary)' }}>
              Минимальный вес для тарифа «{tariff.title}» — {tariff.minWeightKg} кг
            </p>
          )}
          <div className="flex items-center justify-between mt-3 pt-3" style={{ borderTop: '1px solid var(--color-border-soft)' }}>
            <span className="text-[15px] font-bold">Итого к оплате</span>
            <span className="text-[24px] font-black brand-gradient-text">{formatUsd(total)}</span>
          </div>
        </Card>

        <Button size="lg" fullWidth onClick={() => navigate('/new-shipment')}>
          Оформить посылку по этому тарифу
        </Button>
      </div>
    </div>
  )
}
