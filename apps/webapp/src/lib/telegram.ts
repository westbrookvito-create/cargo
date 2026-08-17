// Minimal typed wrapper around the Telegram WebApp bridge (window.Telegram.WebApp).
// Falls back to safe no-ops when running outside Telegram (e.g. plain browser / screenshots).

export interface TelegramThemeParams {
  bg_color?: string
  text_color?: string
  hint_color?: string
  link_color?: string
  button_color?: string
  button_text_color?: string
  secondary_bg_color?: string
  header_bg_color?: string
  accent_text_color?: string
  section_bg_color?: string
  section_header_text_color?: string
  subtitle_text_color?: string
  destructive_text_color?: string
}

export interface TelegramUser {
  id: number
  first_name: string
  last_name?: string
  username?: string
  language_code?: string
  photo_url?: string
}

interface HapticFeedback {
  impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void
  notificationOccurred: (type: 'error' | 'success' | 'warning') => void
  selectionChanged: () => void
}

interface MainButton {
  text: string
  color?: string
  textColor?: string
  isVisible: boolean
  isActive: boolean
  setText: (text: string) => void
  onClick: (cb: () => void) => void
  offClick: (cb: () => void) => void
  show: () => void
  hide: () => void
  enable: () => void
  disable: () => void
  showProgress: (leaveActive?: boolean) => void
  hideProgress: () => void
}

interface BackButton {
  isVisible: boolean
  onClick: (cb: () => void) => void
  offClick: (cb: () => void) => void
  show: () => void
  hide: () => void
}

interface TelegramWebApp {
  initData: string
  initDataUnsafe: {
    user?: TelegramUser
    query_id?: string
    start_param?: string
  }
  version: string
  platform: string
  colorScheme: 'light' | 'dark'
  themeParams: TelegramThemeParams
  isExpanded: boolean
  viewportHeight: number
  viewportStableHeight: number
  headerColor: string
  backgroundColor: string
  MainButton: MainButton
  BackButton: BackButton
  HapticFeedback: HapticFeedback
  ready: () => void
  expand: () => void
  close: () => void
  enableClosingConfirmation: () => void
  disableClosingConfirmation: () => void
  setHeaderColor: (color: string) => void
  setBackgroundColor: (color: string) => void
  onEvent: (event: string, cb: () => void) => void
  offEvent: (event: string, cb: () => void) => void
  openLink: (url: string) => void
  openTelegramLink: (url: string) => void
  showAlert: (message: string, cb?: () => void) => void
  showConfirm: (message: string, cb?: (ok: boolean) => void) => void
}

declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp
    }
  }
}

const noopHaptics: HapticFeedback = {
  impactOccurred: () => {},
  notificationOccurred: () => {},
  selectionChanged: () => {},
}

const noopMainButton: MainButton = {
  text: '',
  isVisible: false,
  isActive: true,
  setText: () => {},
  onClick: () => {},
  offClick: () => {},
  show: () => {},
  hide: () => {},
  enable: () => {},
  disable: () => {},
  showProgress: () => {},
  hideProgress: () => {},
}

const noopBackButton: BackButton = {
  isVisible: false,
  onClick: () => {},
  offClick: () => {},
  show: () => {},
  hide: () => {},
}

export function getTelegram(): TelegramWebApp | null {
  if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
    return window.Telegram.WebApp
  }
  return null
}

export function isInTelegram(): boolean {
  return getTelegram() !== null
}

export const haptics: HapticFeedback = new Proxy(noopHaptics, {
  get(target, prop) {
    const tg = getTelegram()
    if (tg) return Reflect.get(tg.HapticFeedback, prop, tg.HapticFeedback)
    return Reflect.get(target, prop, target)
  },
})

export function getMainButton(): MainButton {
  return getTelegram()?.MainButton ?? noopMainButton
}

export function getBackButton(): BackButton {
  return getTelegram()?.BackButton ?? noopBackButton
}

export function getTelegramUser(): TelegramUser | null {
  return getTelegram()?.initDataUnsafe.user ?? null
}

export function getInitData(): string {
  return getTelegram()?.initData ?? ''
}

export function initTelegram() {
  const tg = getTelegram()
  if (!tg) return
  tg.ready()
  tg.expand()
  tg.enableClosingConfirmation?.()
}
