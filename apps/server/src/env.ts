import 'dotenv/config'

function required(name: string, fallback?: string): string {
  const v = process.env[name] ?? fallback
  if (v === undefined) {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return v
}

export const env = {
  botToken: process.env.BOT_TOKEN ?? '',
  webappUrl: process.env.WEBAPP_URL ?? '',
  port: Number(process.env.PORT ?? 8080),
  corsOrigin: process.env.CORS_ORIGIN ?? '*',
  webhookUrl: process.env.WEBHOOK_URL ?? '',
  supportUsername: process.env.SUPPORT_USERNAME ?? 'crispycargo_support',
  nodeEnv: process.env.NODE_ENV ?? 'development',
}

export function requireBotToken(): string {
  return required('BOT_TOKEN')
}
