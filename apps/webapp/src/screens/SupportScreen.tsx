import { useState } from 'react'
import { ChevronDown, MessageCircle, Phone } from 'lucide-react'
import { TopBar } from '../components/TopBar'
import { Card } from '../components/Card'
import { Button } from '../components/Button'
import { faqItems } from '../lib/mock-data'
import { getTelegram } from '../lib/telegram'
import { haptics } from '../lib/telegram'

export function SupportScreen() {
  const [openId, setOpenId] = useState<string | null>(faqItems[0].id)

  return (
    <div className="pb-28">
      <TopBar title="Поддержка" back />

      <div className="px-4 flex flex-col gap-4">
        <Card className="p-4 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0" style={{ background: 'var(--color-accent-soft)' }}>
            <MessageCircle size={20} color="var(--color-accent)" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[14px] font-bold">Онлайн-поддержка</p>
            <p className="text-[12px] mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
              Отвечаем в течение 15 минут, 9:00–21:00 МСК
            </p>
          </div>
        </Card>

        <div className="grid grid-cols-2 gap-2.5">
          <Button
            variant="secondary"
            icon={<MessageCircle size={16} />}
            onClick={() => {
              haptics.impactOccurred('light')
              getTelegram()?.openTelegramLink('https://t.me/crispycargo_support')
            }}
          >
            Написать боту
          </Button>
          <Button
            variant="secondary"
            icon={<Phone size={16} />}
            onClick={() => haptics.impactOccurred('light')}
          >
            Позвонить
          </Button>
        </div>

        <div>
          <h2 className="text-[15px] font-bold mb-3">Частые вопросы</h2>
          <div className="flex flex-col gap-2.5">
            {faqItems.map((item) => {
              const open = openId === item.id
              return (
                <Card key={item.id} className="p-4">
                  <button
                    onClick={() => { haptics.selectionChanged(); setOpenId(open ? null : item.id) }}
                    className="w-full flex items-center justify-between gap-3 text-left"
                  >
                    <span className="text-[14px] font-semibold">{item.question}</span>
                    <ChevronDown
                      size={17}
                      color="var(--color-text-tertiary)"
                      className="shrink-0 transition-transform"
                      style={{ transform: open ? 'rotate(180deg)' : 'none' }}
                    />
                  </button>
                  {open && (
                    <p className="text-[13px] leading-relaxed mt-3 animate-in" style={{ color: 'var(--color-text-secondary)' }}>
                      {item.answer}
                    </p>
                  )}
                </Card>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
