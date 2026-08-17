import { Router } from 'express'
import { prisma } from '../lib/db.js'
import { serializeShipment } from '../lib/serialize.js'
import { genTrackNumber } from '../lib/codes.js'
import type { CargoCategory } from '@prisma/client'

export const shipmentsRouter = Router()

const CATEGORY_VALUES = new Set(['GENERAL', 'CLOTHES', 'SHOES', 'ELECTRONICS', 'ACCESSORIES', 'BATTERY', 'LIQUID', 'BRANDED'])

shipmentsRouter.get('/shipments', async (req, res) => {
  const shipments = await prisma.shipment.findMany({
    where: { userId: req.user!.id },
    include: { events: { orderBy: { timestamp: 'asc' } } },
    orderBy: { createdAt: 'desc' },
  })
  res.json(shipments.map(serializeShipment))
})

shipmentsRouter.get('/shipments/:id', async (req, res) => {
  const shipment = await prisma.shipment.findFirst({
    where: { id: req.params.id, userId: req.user!.id },
    include: { events: { orderBy: { timestamp: 'asc' } } },
  })
  if (!shipment) return res.status(404).json({ error: 'not_found' })
  res.json(serializeShipment(shipment))
})

shipmentsRouter.post('/shipments', async (req, res) => {
  const { cnTrackNumber, title, storeName, category, declaredValueUsd } = req.body ?? {}

  if (typeof cnTrackNumber !== 'string' || cnTrackNumber.trim().length < 4) {
    return res.status(400).json({ error: 'invalid_cn_track_number' })
  }
  if (typeof title !== 'string' || title.trim().length < 2) {
    return res.status(400).json({ error: 'invalid_title' })
  }

  const categoryUpper = String(category ?? 'GENERAL').toUpperCase()
  const resolvedCategory = (CATEGORY_VALUES.has(categoryUpper) ? categoryUpper : 'GENERAL') as CargoCategory

  const shipment = await prisma.shipment.create({
    data: {
      trackNumber: genTrackNumber(),
      cnTrackNumber: cnTrackNumber.trim(),
      title: title.trim(),
      storeName: typeof storeName === 'string' ? storeName.trim() : undefined,
      category: resolvedCategory,
      declaredValueUsd: typeof declaredValueUsd === 'number' ? declaredValueUsd : undefined,
      userId: req.user!.id,
      events: {
        create: {
          status: 'AWAITING_ARRIVAL',
          title: 'Заказ принят в обработку',
          description: 'Ожидаем поступление на склад',
        },
      },
    },
    include: { events: true },
  })

  res.status(201).json(serializeShipment(shipment))
})
