import { Bot, InlineKeyboard } from 'grammy'
import { env } from '../env.js'

export function createBot(): Bot {
  if (!env.botToken) {
    throw new Error('BOT_TOKEN is not set — cannot start the Telegram bot')
  }

  const bot = new Bot(env.botToken)

  bot.command('start', async (ctx) => {
    const keyboard = new InlineKeyboard()
    if (env.webappUrl) {
      keyboard.webApp('🚀 Открыть CrispyCargo', env.webappUrl)
    }

    await ctx.reply(
      [
        '👋 Добро пожаловать в *CrispyCargo*!',
        '',
        'Мы доставляем посылки из Китая — Taobao, 1688, Poizon и другие площадки — быстро, прозрачно и с честным расчётом стоимости.',
        '',
        '📦 Отслеживайте свои посылки',
        '🧮 Считайте стоимость доставки заранее',
        '📍 Получите личный адрес склада в Китае',
        '',
        'Нажмите кнопку ниже, чтобы открыть приложение.',
      ].join('\n'),
      { parse_mode: 'Markdown', reply_markup: keyboard },
    )
  })

  bot.command('help', async (ctx) => {
    await ctx.reply(
      [
        'ℹ️ *Как это работает*',
        '1. Откройте приложение и получите личный адрес склада в Китае',
        '2. Указывайте этот адрес при заказе на Taobao / 1688 / Poizon',
        '3. Следите за статусом посылки в приложении — мы уведомим вас на каждом этапе',
        '',
        `Если возникли вопросы — напишите нам: @${env.supportUsername}`,
      ].join('\n'),
      { parse_mode: 'Markdown' },
    )
  })

  bot.on('message', async (ctx) => {
    const keyboard = new InlineKeyboard()
    if (env.webappUrl) {
      keyboard.webApp('🚀 Открыть CrispyCargo', env.webappUrl)
    }
    await ctx.reply('Откройте приложение, чтобы отследить посылки или рассчитать стоимость доставки 👇', {
      reply_markup: keyboard,
    })
  })

  return bot
}

export async function configureMenuButton(bot: Bot) {
  if (!env.webappUrl) return
  await bot.api.setChatMenuButton({
    menu_button: {
      type: 'web_app',
      text: 'CrispyCargo',
      web_app: { url: env.webappUrl },
    },
  })
}
