import express from 'express'
import cors from 'cors'
import { webhookCallback } from 'grammy'
import { env } from './env.js'
import { telegramAuth } from './middleware/telegramAuth.js'
import { meRouter } from './routes/me.js'
import { shipmentsRouter } from './routes/shipments.js'
import { configRouter } from './routes/config.js'
import { createBot, configureMenuButton } from './bot/bot.js'

const app = express()
app.use(cors({ origin: env.corsOrigin }))
app.use(express.json())

app.get('/health', (_req, res) => res.json({ ok: true, service: 'crispycargo-server' }))

app.use('/api', telegramAuth, meRouter)
app.use('/api', telegramAuth, shipmentsRouter)
app.use('/api', configRouter)

async function start() {
  if (env.botToken) {
    const bot = createBot()

    if (env.webhookUrl) {
      app.use(`/bot/${env.botToken}`, webhookCallback(bot, 'express'))
      await bot.api.setWebhook(`${env.webhookUrl}/bot/${env.botToken}`)
      console.log('Bot running in webhook mode:', env.webhookUrl)
    } else {
      bot.start()
      console.log('Bot running in long-polling mode')
    }

    await configureMenuButton(bot).catch((err) => {
      console.warn('Could not set chat menu button (check WEBAPP_URL / bot privacy settings):', err.message)
    })
  } else {
    console.warn('BOT_TOKEN not set — starting API only, without the Telegram bot')
  }

  app.listen(env.port, () => {
    console.log(`CrispyCargo API listening on port ${env.port}`)
  })
}

start().catch((err) => {
  console.error('Failed to start server:', err)
  process.exit(1)
})
