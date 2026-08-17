import { Router } from 'express'
import { prisma } from '../lib/db.js'

export const configRouter = Router()

configRouter.get('/warehouses', async (_req, res) => {
  const warehouses = await prisma.warehouse.findMany({ orderBy: { isDefault: 'desc' } })
  res.json(
    warehouses.map((w) => ({
      id: w.id,
      city: w.city,
      cityRu: w.cityRu,
      country: w.country,
      addressLines: JSON.parse(w.addressLines) as string[],
      isDefault: w.isDefault,
    })),
  )
})

configRouter.get('/tariffs', async (_req, res) => {
  const tariffs = await prisma.tariff.findMany()
  res.json(
    tariffs.map((t) => ({
      method: t.method.toLowerCase(),
      title: t.title,
      subtitle: t.subtitle,
      pricePerKgUsd: t.pricePerKgUsd,
      minDays: t.minDays,
      maxDays: t.maxDays,
      minWeightKg: t.minWeightKg,
    })),
  )
})
