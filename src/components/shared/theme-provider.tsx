'use client'

// ─── F5: ThemeProvider ───
// Atende aos cenários Gherkin: 5.1-5.8
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react'

type Theme = 'core' | 'gamer' | 'anime' | 'home' | 'gifts' | 'auto'
type Mode = 'light' | 'dark'

interface ThemeContextType {
  theme: Theme
  mode: Mode
  mounted: boolean
  setTheme: (theme: Theme) => void
  toggleMode: () => void
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'core',
  mode: 'light',
  mounted: false,
  setTheme: () => {},
  toggleMode: () => {},
})

export function useTheme() {
  return useContext(ThemeContext)
}

const VALID_THEMES: Theme[] = ['core', 'gamer', 'anime', 'home', 'gifts', 'auto']

function isValidTheme(t: string): t is Theme {
  return VALID_THEMES.includes(t as Theme)
}

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${name}=([^;]*)`)
  )
  return match ? decodeURIComponent(match[1]) : null
}

function setCookie(name: string, value: string, days = 30) {
  if (typeof document === 'undefined') return
  const expires = new Date(Date.now() + days * 864e5).toUTCString()
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`
}

function getSystemMode(): Mode {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  // ─── Start with safe server-compatible defaults ───
  const [theme, setThemeState] = useState<Theme>('core')
  const [mode, setMode] = useState<Mode>('light')
  const [mounted, setMounted] = useState(false)

  // ─── After mount, sync with client reality ───
  useEffect(() => {
    // Read persisted preferences
    const cookieTheme = getCookie('theme_pref')
    const cookieMode = getCookie('theme_mode')

    if (cookieTheme && isValidTheme(cookieTheme)) {
      setThemeState(cookieTheme)
    }
    if (cookieMode === 'dark' || cookieMode === 'light') {
      setMode(cookieMode)
    } else {
      setMode(getSystemMode())
    }
    setMounted(true)
  }, [])

  // ─── Apply theme to DOM ───
  useEffect(() => {
    if (!mounted) return
    const root = document.documentElement
    root.setAttribute('data-theme', theme)
    root.setAttribute('data-mode', mode)

    if (mode === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    setCookie('theme_pref', theme)
    setCookie('theme_mode', mode)
  }, [theme, mode, mounted])

  // ─── Listen to system preference changes ───
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = (e: MediaQueryListEvent) => {
      // Only follow system if user hasn't manually set a mode
      if (!getCookie('theme_mode')) {
        setMode(e.matches ? 'dark' : 'light')
      }
    }
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  const setTheme = useCallback((t: Theme) => {
    setThemeState(isValidTheme(t) ? t : 'core')
  }, [])

  const toggleMode = useCallback(
    () => setMode((m) => (m === 'light' ? 'dark' : 'light')),
    []
  )

  return (
    <ThemeContext.Provider
      value={{ theme, mode, mounted, setTheme, toggleMode }}
    >
      {children}
    </ThemeContext.Provider>
  )
}
