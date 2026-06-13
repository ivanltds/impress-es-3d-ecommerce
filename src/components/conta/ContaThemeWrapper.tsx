'use client'

import { createContext, useContext, useState } from 'react'
import { UniverseThemeProvider } from '@/components/universe/UniverseThemeProvider'

interface ContaThemeWrapperProps {
  initialSlug: string | null
  children: React.ReactNode
}

interface ContaThemeContextValue {
  universeSlug: string | null
  setUniverseSlug: (slug: string) => void
}

export const ContaThemeContext = createContext<ContaThemeContextValue>({
  universeSlug: null,
  setUniverseSlug: () => {},
})

export function useContaTheme() {
  return useContext(ContaThemeContext)
}

export function ContaThemeWrapper({ initialSlug, children }: ContaThemeWrapperProps) {
  const [universeSlug, setUniverseSlug] = useState<string | null>(initialSlug)

  return (
    <ContaThemeContext.Provider value={{ universeSlug, setUniverseSlug }}>
      <div data-testid="conta-theme-wrapper">
        {universeSlug ? (
          <UniverseThemeProvider universeSlug={universeSlug}>
            {children}
          </UniverseThemeProvider>
        ) : (
          children
        )}
      </div>
    </ContaThemeContext.Provider>
  )
}
