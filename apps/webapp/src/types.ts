export type ShipmentStatus =
  | 'awaiting_arrival'
  | 'in_warehouse_cn'
  | 'packed'
  | 'in_transit'
  | 'customs'
  | 'in_warehouse_local'
  | 'delivered'
  | 'issue'

export type DeliveryMethod = 'avia' | 'auto' | 'express'

export type CargoCategory =
  | 'general'
  | 'clothes'
  | 'shoes'
  | 'electronics'
  | 'accessories'
  | 'battery'
  | 'liquid'
  | 'branded'

export interface TrackingEvent {
  id: string
  status: ShipmentStatus
  title: string
  description?: string
  location?: string
  timestamp: string
}

export interface ShipmentItem {
  id: string
  trackNumber: string
  cnTrackNumber?: string
  title: string
  storeName?: string
  category: CargoCategory
  status: ShipmentStatus
  deliveryMethod: DeliveryMethod
  weightKg?: number
  volumeM3?: number
  declaredValueUsd?: number
  costUsd?: number
  paid: boolean
  createdAt: string
  updatedAt: string
  etaDate?: string
  photoUrl?: string
  events: TrackingEvent[]
}

export interface WarehouseAddress {
  id: string
  city: string
  cityRu: string
  country: string
  addressLines: string[]
  personalCode?: string
  isDefault: boolean
}

export interface TariffRate {
  method: DeliveryMethod
  title: string
  subtitle: string
  pricePerKgUsd: number
  minDays: number
  maxDays: number
  minWeightKg: number
}

export interface UserProfile {
  id: string
  telegramId: number
  firstName: string
  lastName?: string
  username?: string
  photoUrl?: string
  phone?: string
  balanceUsd: number
  personalCode: string
  referralCode: string
  activeShipments: number
  totalShipments: number
  totalWeightKg: number
  memberSince: string
  language: 'ru' | 'en'
  notificationsEnabled: boolean
}

export interface FaqItem {
  id: string
  question: string
  answer: string
}
