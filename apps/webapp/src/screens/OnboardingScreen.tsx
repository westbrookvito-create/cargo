import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Package, Calculator, MapPinned, BellRing, ChevronRight } from 'lucide-react'
import { Button } from '../components/Button'
import { haptics } from '../lib/telegram'

const slides = [
  {
    icon: Package,
    title: 'Отслеживайте карго\nиз Китая в один клик',
    text: 'Все ваши посылки из Taobao, 1688 и Poizon — в едином трекере со статусами на каждом этапе пути.',
  },
  {
    icon: MapPinned,
    title: 'Личный адрес\nсклада в Китае',
    text: 'Указывайте персональный адрес при заказе — мы примем, проверим и объединим все посылки в один груз.',
  },
  {
    icon: Calculator,
    title: 'Прозрачный расчёт\nстоимости',
    text: 'Считайте стоимость доставки по весу и категории заранее — без скрытых платежей и сюрпризов.',
  },
  {
    icon: BellRing,
    title: 'Уведомления\nна каждом этапе',
    text: 'Бот пришлёт сообщение, как только груз тронется в путь, пройдёт таможню или прибудет на выдачу.',
  },
]

export function OnboardingScreen({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(0)
  const navigate = useNavigate()
  const slide = slides[step]
  const Icon = slide.icon
  const isLast = step === slides.length - 1

  const next = () => {
    haptics.impactOccurred('medium')
    if (isLast) {
      onDone()
      navigate('/')
    } else {
      setStep((s) => s + 1)
    }
  }

  return (
    <div className="flex flex-col min-h-screen px-6 pt-[max(20px,env(safe-area-inset-top))] pb-[max(24px,env(safe-area-inset-bottom))]">
      <div className="flex items-center gap-2 pt-2">
        <div className="w-8 h-8 rounded-xl brand-gradient-bg flex items-center justify-center font-black text-[15px]" style={{ color: '#1a0f00' }}>
          C
        </div>
        <span className="font-extrabold text-[16px] tracking-tight">CrispyCargo</span>
      </div>

      <button
        onClick={() => { onDone(); navigate('/') }}
        className="absolute right-6 top-[max(24px,env(safe-area-inset-top))] text-[13px] font-medium"
        style={{ color: 'var(--color-text-tertiary)' }}
      >
        Пропустить
      </button>

      <div className="flex-1 flex flex-col items-center justify-center text-center gap-7 -mt-8">
        <div
          className="w-28 h-28 rounded-[32px] flex items-center justify-center animate-in"
          key={step}
          style={{
            background: 'linear-gradient(160deg, var(--color-accent-soft), transparent)',
            border: '1px solid var(--color-border)',
          }}
        >
          <Icon size={44} color="var(--color-accent)" strokeWidth={1.6} />
        </div>
        <div className="animate-in" key={`t-${step}`}>
          <h1 className="text-[24px] font-extrabold leading-tight whitespace-pre-line tracking-tight">
            {slide.title}
          </h1>
          <p className="mt-3 text-[14.5px] leading-relaxed max-w-[320px] mx-auto" style={{ color: 'var(--color-text-secondary)' }}>
            {slide.text}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center gap-1.5 mb-6">
        {slides.map((_, i) => (
          <div
            key={i}
            className="h-1.5 rounded-full transition-all"
            style={{
              width: i === step ? 20 : 6,
              background: i === step ? 'var(--color-accent)' : 'var(--color-border)',
            }}
          />
        ))}
      </div>

      <Button size="lg" fullWidth onClick={next} icon={isLast ? undefined : <ChevronRight size={18} />}>
        {isLast ? 'Начать пользоваться' : 'Далее'}
      </Button>
    </div>
  )
}
