import type { NextFunction, Request, Response } from 'express'
import { prisma } from '../lib/db.js'
import { verifyInitData } from '../lib/verifyInitData.js'
import { env } from '../env.js'
import type { User } from '@prisma/client'
import { genPersonalCode, genReferralCode } from '../lib/codes.js'

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: User
    }
  }
}

const DEV_SKIP_AUTH = process.env.DEV_SKIP_AUTH === 'true'

export async function telegramAuth(req: Request, res: Response, next: NextFunction) {
  const initData = req.header('X-Telegram-Init-Data') ?? ''
  const parsed = verifyInitData(initData, env.botToken)

  if (!parsed) {
    if (DEV_SKIP_AUTH) {
      req.user = await upsertUser({
        id: 999_000_001,
        first_name: 'Тестовый',
        last_name: 'Пользователь',
        username: 'dev_tester',
      })
      return next()
    }
    return res.status(401).json({ error: 'invalid_init_data' })
  }

  req.user = await upsertUser(parsed.user)
  next()
}

async function upsertUser(tgUser: { id: number; first_name: string; last_name?: string; username?: string; photo_url?: string; language_code?: string }): Promise<User> {
  const telegramId = String(tgUser.id)
  const existing = await prisma.user.findUnique({ where: { telegramId } })
  if (existing) {
    return prisma.user.update({
      where: { telegramId },
      data: {
        firstName: tgUser.first_name,
        lastName: tgUser.last_name,
        username: tgUser.username,
        photoUrl: tgUser.photo_url,
      },
    })
  }
  return prisma.user.create({
    data: {
      telegramId,
      firstName: tgUser.first_name,
      lastName: tgUser.last_name,
      username: tgUser.username,
      photoUrl: tgUser.photo_url,
      languageCode: tgUser.language_code ?? 'ru',
      personalCode: genPersonalCode(),
      referralCode: genReferralCode(tgUser.first_name),
    },
  })
}
