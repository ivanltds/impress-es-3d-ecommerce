'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'

interface StoreSettings {
  whatsappPhone: string
}

const StoreSettingsContext = createContext<StoreSettings>({ whatsappPhone: '' })

export function StoreSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<StoreSettings>({ whatsappPhone: '' })

  useEffect(() => {
    fetch('/api/settings/public')
      .then((r) => r.json())
      .then((data) => setSettings({ whatsappPhone: data.whatsappPhone ?? '' }))
      .catch(() => {})
  }, [])

  return (
    <StoreSettingsContext.Provider value={settings}>
      {children}
    </StoreSettingsContext.Provider>
  )
}

export function useStoreSettings() {
  return useContext(StoreSettingsContext)
}
