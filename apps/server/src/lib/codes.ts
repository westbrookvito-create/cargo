import crypto from 'node:crypto'

export function genPersonalCode(): string {
  const n = crypto.randomInt(1000, 9999)
  return `CC-${n}`
}

export function genReferralCode(firstName: string): string {
  const initials = firstName.replace(/[^\p{L}]/gu, '').slice(0, 2).toUpperCase() || 'CC'
  const n = crypto.randomInt(1000, 9999)
  return `${initials}${n}`
}

export function genTrackNumber(): string {
  const date = new Date()
  const y = String(date.getFullYear()).slice(2)
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  const rand = crypto.randomInt(1000, 9999)
  return `CC${y}${m}${d}${rand}`
}
