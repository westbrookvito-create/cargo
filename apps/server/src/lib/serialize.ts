import type { Shipment, TrackingEvent, User } from '@prisma/client'

const ACTIVE_STATUSES = new Set([
  'AWAITING_ARRIVAL', 'IN_WAREHOUSE_CN', 'PACKED', 'IN_TRANSIT', 'CUSTOMS', 'IN_WAREHOUSE_LOCAL', 'ISSUE',
])

export function serializeEvent(e: TrackingEvent) {
  return {
    id: e.id,
    status: e.status.toLowerCase(),
    title: e.title,
    description: e.description ?? undefined,
    location: e.location ?? undefined,
    timestamp: e.timestamp.toISOString(),
  }
}

export function serializeShipment(s: Shipment & { events?: TrackingEvent[] }) {
  return {
    id: s.id,
    trackNumber: s.trackNumber,
    cnTrackNumber: s.cnTrackNumber ?? undefined,
    title: s.title,
    storeName: s.storeName ?? undefined,
    category: s.category.toLowerCase(),
    status: s.status.toLowerCase(),
    deliveryMethod: s.deliveryMethod.toLowerCase(),
    weightKg: s.weightKg ?? undefined,
    volumeM3: s.volumeM3 ?? undefined,
    declaredValueUsd: s.declaredValueUsd ?? undefined,
    costUsd: s.costUsd ?? undefined,
    paid: s.paid,
    createdAt: s.createdAt.toISOString(),
    updatedAt: s.updatedAt.toISOString(),
    etaDate: s.etaDate?.toISOString(),
    photoUrl: s.photoUrl ?? undefined,
    events: (s.events ?? []).map(serializeEvent),
  }
}

export function serializeUser(u: User, shipments: Shipment[]) {
  const active = shipments.filter((s) => ACTIVE_STATUSES.has(s.status)).length
  const totalWeightKg = shipments.reduce((sum, s) => sum + (s.weightKg ?? 0), 0)

  return {
    id: u.id,
    telegramId: Number(u.telegramId),
    firstName: u.firstName,
    lastName: u.lastName ?? undefined,
    username: u.username ?? undefined,
    photoUrl: u.photoUrl ?? undefined,
    phone: u.phone ?? undefined,
    balanceUsd: u.balanceUsd,
    personalCode: u.personalCode,
    referralCode: u.referralCode,
    activeShipments: active,
    totalShipments: shipments.length,
    totalWeightKg: Math.round(totalWeightKg * 10) / 10,
    memberSince: u.createdAt.toISOString(),
    language: u.languageCode,
    notificationsEnabled: u.notificationsEnabled,
  }
}
