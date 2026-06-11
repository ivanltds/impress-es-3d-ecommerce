'use client'

import { SessionProvider } from 'next-auth/react'
import { ThemeProvider } from '@/components/shared/theme-provider'
import { StoreSettingsProvider } from '@/components/shared/store-settings-provider'
import type { ReactNode } from 'react'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider>
        <StoreSettingsProvider>{children}</StoreSettingsProvider>
      </ThemeProvider>
    </SessionProvider>
  )
}
