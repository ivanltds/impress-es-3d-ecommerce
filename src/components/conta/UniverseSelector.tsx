'use client'

import { useState } from 'react'
import Image from 'next/image'
import { UNIVERSE_CONFIG, UNIVERSE_SLUGS } from '@/config/universes'
import { useContaTheme } from '@/components/conta/ContaThemeWrapper'
import { trackEvent } from '@/lib/analytics'

interface UniverseSelectorProps {
  initialSlug: string | null
  userId: string
}

export function UniverseSelector({ initialSlug, userId }: UniverseSelectorProps) {
  const [selectedSlug, setSelectedSlug] = useState<string | null>(initialSlug)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { setUniverseSlug } = useContaTheme()

  async function handleSelect(slug: string) {
    if (isLoading) return
    const previous = selectedSlug
    setIsLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/user/preference', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ universeSlug: slug }),
      })
      if (!res.ok) throw new Error('Erro ao salvar preferência')

      setSelectedSlug(slug)
      setUniverseSlug(slug)
      trackEvent('universe_preference_changed', {
        userId,
        previousUniverse: previous,
        newUniverse: slug,
        source: 'account_page',
      })
    } catch {
      setError('Não foi possível salvar sua preferência. Tente novamente.')
      setSelectedSlug(previous) // rollback visual (cenário 2.4)
    } finally {
      setIsLoading(false)
    }
  }

  const activeConfig = selectedSlug ? UNIVERSE_CONFIG[selectedSlug] : null

  return (
    <div data-testid="universe-selector">
      {/* Badge do universo ativo (cenários 1.3, 1.4) */}
      {selectedSlug && activeConfig && (
        <div
          data-testid="conta-universe-badge"
          className="mb-4 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-semibold"
        >
          {activeConfig.name}
        </div>
      )}

      {/* Loading indicator (cenário 2.6) */}
      {isLoading && (
        <div data-testid="universe-selector-loading" className="mb-4 text-sm text-muted-foreground">
          Salvando preferência...
        </div>
      )}

      {/* Error message (cenário 2.4) */}
      {error && (
        <div data-testid="universe-selector-error" className="mb-4 text-sm text-red-500">
          {error}
        </div>
      )}

      {/* Universe cards (cenário 2.1) */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {UNIVERSE_SLUGS.map((slug) => {
          const config = UNIVERSE_CONFIG[slug]
          const isActive = selectedSlug === slug
          return (
            <button
              key={slug}
              data-testid={`universe-option-${slug}`}
              aria-selected={isActive}
              role="option"
              disabled={isLoading}
              onClick={() => handleSelect(slug)}
              className={`relative flex flex-col items-center gap-2 rounded-xl border p-3 text-center transition-all
                ${isActive ? 'border-primary ring-2 ring-primary/30' : 'border-border hover:border-primary/50'}
                ${isLoading ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}
              `}
            >
              {/* Card image */}
              <div className="relative h-16 w-full overflow-hidden rounded-lg bg-muted">
                {config.cardImage ? (
                  <Image
                    src={config.cardImage}
                    alt={config.name}
                    fill
                    className="object-cover"
                    sizes="120px"
                  />
                ) : (
                  <div className="h-full w-full bg-gradient-to-br from-muted to-muted-foreground/20" />
                )}
              </div>

              <span className="text-xs font-semibold">{config.name}</span>

              {/* Active indicator (cenário 2.2) */}
              {isActive && (
                <span
                  data-testid="universe-option-active-indicator"
                  className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-primary"
                />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
