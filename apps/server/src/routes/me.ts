import { Router } from 'express'
import { prisma } from '../lib/db.js'
import { serializeUser } from '../lib/serialize.js'

export const meRouter = Router()

meRouter.get('/me', async (req, res) => {
  const user = req.user!
  const shipments = await prisma.shipment.findMany({ where: { userId: user.id } })
  res.json(serializeUser(user, shipments))
})
