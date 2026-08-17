import { useEffect, useState } from 'react'
import { getTelegram } from '../lib/telegram'

export type ThemeMode = 'dark' | 'light'

const STORAGE_KEY = 'crispycargo:theme'

function readStoredTheme(): ThemeMode | null {
  const v = localStorage.getItem(STORAGE_KEY)
  return v === 'dark' || v === 'light' ? v : null
}

export function useTelegramTheme() {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    return readStoredTheme() ?? getTelegram()?.colorScheme ?? 'dark'
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  useEffect(() => {
    const tg = getTelegram()
    if (!tg || readStoredTheme()) return
    const onChange = () => setThemeState(tg.colorScheme)
    tg.onEvent('themeChanged', onChange)
    return () => tg.offEvent('themeChanged', onChange)
  }, [])

  const setTheme = (mode: ThemeMode) => {
    localStorage.setItem(STORAGE_KEY, mode)
    setThemeState(mode)
  }

  return { theme, setTheme }
}
