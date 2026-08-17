import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle2, Camera, ChevronDown } from 'lucide-react'
import { TopBar } from '../components/TopBar'
import { Card } from '../components/Card'
import { Button } from '../components/Button'
import { categoryLabel } from '../lib/mock-data'
import { createShipmentDeclaration } from '../lib/api'
import type { CargoCategory } from '../types'
import { haptics } from '../lib/telegram'

const categoryOptions: CargoCategory[] = [
  'general', 'clothes', 'shoes', 'electronics', 'accessories', 'battery', 'liquid', 'branded',
]

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-[12.5px] font-semibold" style={{ color: 'var(--color-text-secondary)' }}>
        {label}
      </label>
      <div className="mt-1.5">{children}</div>
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  background: 'var(--color-surface)',
  border: '1px solid var(--color-border)',
  color: 'var(--color-text)',
}

export function NewShipmentScreen() {
  const navigate = useNavigate()
  const [trackNumber, setTrackNumber] = useState('')
  const [title, setTitle] = useState('')
  const [storeName, setStoreName] = useState('')
  const [category, setCategory] = useState<CargoCategory>('general')
  const [value, setValue] = useState('')
  const [pickerOpen, setPickerOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  const canSubmit = trackNumber.trim().length >= 6 && title.trim().length >= 2

  const submit = async () => {
    if (!canSubmit || submitting) return
    setSubmitting(true)
    haptics.impactOccurred('medium')
    await createShipmentDeclaration({
      cnTrackNumber: trackNumber.trim(),
      title: title.trim(),
      storeName: storeName.trim() || undefined,
      category,
      declaredValueUsd: value ? parseFloat(value) : undefined,
    })
    setSubmitting(false)
    setDone(true)
    haptics.notificationOccurred('success')
  }

  if (done) {
    return (
      <div className="pb-28 px-6 flex flex-col items-center justify-center text-center" style={{ minHeight: '85vh' }}>
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center mb-5 animate-in"
          style={{ background: 'var(--color-success-soft)' }}
        >
          <CheckCircle2 size={38} color="var(--color-success)" />
        </div>
        <h1 className="text-[20px] font-extrabold">Посылка добавлена</h1>
        <p className="text-[14px] mt-2 max-w-[280px]" style={{ color: 'var(--color-text-secondary)' }}>
          Мы будем ждать её на складе и уведомим вас, как только она поступит и будет взвешена
        </p>
        <div className="flex gap-2.5 mt-7 w-full">
          <Button variant="secondary" fullWidth onClick={() => navigate('/')}>На главную</Button>
          <Button fullWidth onClick={() => navigate('/shipments')}>К посылкам</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="pb-32">
      <TopBar title="Новая посылка" back />

      <div className="px-4 flex flex-col gap-4">
        <p className="text-[13px] leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          Заранее заявите посылку, чтобы мы быстрее нашли и обработали её на складе в Китае
        </p>

        <Field label="Трек-номер китайской службы доставки">
          <input
            value={trackNumber}
            onChange={(e) => setTrackNumber(e.target.value)}
            placeholder="Например, SF7739284611CN"
            className="w-full rounded-xl px-3.5 py-3 text-[14px] outline-none font-mono"
            style={inputStyle}
          />
        </Field>

        <Field label="Что внутри">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Например, наушники TWS"
            className="w-full rounded-xl px-3.5 py-3 text-[14px] outline-none"
            style={inputStyle}
          />
        </Field>

        <Field label="Магазин (необязательно)">
          <input
            value={storeName}
            onChange={(e) => setStoreName(e.target.value)}
            placeholder="Taobao, 1688, Poizon..."
            className="w-full rounded-xl px-3.5 py-3 text-[14px] outline-none"
            style={inputStyle}
          />
        </Field>

        <Field label="Категория товара">
          <div className="relative">
            <button
              onClick={() => setPickerOpen((v) => !v)}
              className="w-full rounded-xl px-3.5 py-3 text-[14px] flex items-center justify-between"
              style={inputStyle}
            >
              <span>{categoryLabel(category)}</span>
              <ChevronDown size={16} color="var(--color-text-tertiary)" />
            </button>
            {pickerOpen && (
              <Card className="absolute top-full mt-1.5 left-0 right-0 z-10 p-1.5 max-h-64 overflow-y-auto">
                {categoryOptions.map((c) => (
                  <button
                    key={c}
                    onClick={() => { setCategory(c); setPickerOpen(false); haptics.selectionChanged() }}
                    className="w-full text-left px-3 py-2.5 rounded-lg text-[13.5px]"
                    style={{ background: c === category ? 'var(--color-accent-soft)' : 'transparent', color: c === category ? 'var(--color-accent)' : 'var(--color-text)' }}
                  >
                    {categoryLabel(c)}
                  </button>
                ))}
              </Card>
            )}
          </div>
        </Field>

        <Field label="Объявленная стоимость, $ (необязательно)">
          <input
            inputMode="decimal"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="0"
            className="w-full rounded-xl px-3.5 py-3 text-[14px] outline-none"
            style={inputStyle}
          />
        </Field>

        <button
          className="w-full rounded-xl px-3.5 py-6 flex flex-col items-center justify-center gap-2 border border-dashed"
          style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-tertiary)' }}
        >
          <Camera size={20} />
          <span className="text-[12.5px] font-medium">Прикрепить скриншот заказа</span>
        </button>
      </div>

      <div
        className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[560px] px-4 pb-[max(14px,env(safe-area-inset-bottom))] pt-3"
        style={{ background: 'linear-gradient(to top, var(--color-bg) 65%, transparent)' }}
      >
        <Button size="lg" fullWidth disabled={!canSubmit || submitting} onClick={submit}>
          {submitting ? 'Отправляем…' : 'Добавить посылку'}
        </Button>
      </div>
    </div>
  )
}
