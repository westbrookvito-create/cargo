import type { ShipmentItem, TariffRate, UserProfile, WarehouseAddress } from '../types'
import { getInitData, isInTelegram } from './telegram'
import { mockShipments, mockUser, tariffs as mockTariffs, warehouses as mockWarehouses } from './mock-data'

const API_BASE = import.meta.env.VITE_API_BASE_URL as string | undefined

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  if (!API_BASE) throw new Error('no-api-base')
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      'X-Telegram-Init-Data': getInitData(),
      ...init?.headers,
    },
  })
  if (!res.ok) throw new Error(`api-error-${res.status}`)
  return res.json() as Promise<T>
}

// Every call attempts the real API first (when configured & reachable) and
// gracefully falls back to seeded mock data — lets the mini app run standalone
// for demos/screenshots and keeps the UI usable if the backend is briefly down.

export async function fetchProfile(): Promise<UserProfile> {
  try {
    return await request<UserProfile>('/api/me')
  } catch {
    return mockUser
  }
}

export async function fetchShipments(): Promise<ShipmentItem[]> {
  try {
    return await request<ShipmentItem[]>('/api/shipments')
  } catch {
    return mockShipments
  }
}

export async function fetchShipment(id: string): Promise<ShipmentItem | undefined> {
  try {
    return await request<ShipmentItem>(`/api/shipments/${id}`)
  } catch {
    return mockShipments.find((s) => s.id === id)
  }
}

export async function createShipmentDeclaration(payload: {
  cnTrackNumber: string
  title: string
  storeName?: string
  category: string
  declaredValueUsd?: number
}): Promise<{ ok: boolean }> {
  try {
    return await request<{ ok: boolean }>('/api/shipments', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  } catch {
    // Standalone/demo mode: pretend it worked so the UI flow can be exercised.
    return { ok: true }
  }
}

export async function fetchWarehouses(): Promise<WarehouseAddress[]> {
  try {
    return await request<WarehouseAddress[]>('/api/warehouses')
  } catch {
    return mockWarehouses
  }
}

export async function fetchTariffs(): Promise<TariffRate[]> {
  try {
    return await request<TariffRate[]>('/api/tariffs')
  } catch {
    return mockTariffs
  }
}

export function backendConfigured(): boolean {
  return Boolean(API_BASE)
}

export function runningInTelegram(): boolean {
  return isInTelegram()
}
