'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { UNIVERSE_CONFIG } from '@/config/universes'
import { trackEvent } from '@/lib/analytics'

interface UniverseSuggestionModalProps {
  suggestedSlug: string | null      // null = do not show modal
  userId: string | null             // null = guest (cenário 4.7)
  currentPreference: string | null  // non-null = already has preference (cenário 4.4)
}

export function UniverseSuggestionModal({
  suggestedSlug,
  userId,
  currentPreference,
}: UniverseSuggestionModalProps) {
  const [isOpen, setIsOpen] = useState(true)
  const [isLoading, setIsLoading] = useState(false)

  // RN-M06-06: only show when (a) logged in, (b) no preference, (c) has suggested slug
  const shouldShow =
    userId !== null &&
    currentPreference === null &&
    suggestedSlug !== null &&
    isOpen

  if (!shouldShow) return null

  const config = suggestedSlug ? UNIVERSE_CONFIG[suggestedSlug] : null
  const universeName = config?.name ?? suggestedSlug

  async function handleAccept() {
    if (!suggestedSlug) return
    setIsLoading(true)
    try {
      const res = await fetch('/api/user/preference', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ universeSlug: suggestedSlug }),
      })
      if (res.ok) {
        trackEvent('universe_preference_changed', {
          userId: userId as string,
          previousUniverse: null,
          newUniverse: suggestedSlug,
          source: 'post_checkout_suggestion',
        })
        setIsOpen(false)
      }
    } catch {
      // silently fail — modal closes anyway
      setIsOpen(false)
    } finally {
      setIsLoading(false)
    }
  }

  function handleDismiss() {
    // RN-M06-08: dismissing has no side effects (cenário 4.3)
    setIsOpen(false)
  }

  return (
    <AnimatePresence>
      {shouldShow && (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
        >
          <div
            data-testid="universe-suggestion-modal"
            className="w-full max-w-sm rounded-2xl border bg-card p-8 text-center shadow-2xl"
          >
            <h2 className="font-heading text-xl font-bold">
              Você gostou do universo {universeName}?
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Personalize sua experiência na loja com o universo {universeName} como preferência.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <button
                data-testid="universe-suggestion-accept"
                disabled={isLoading}
                onClick={handleAccept}
                className="rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:scale-105 disabled:opacity-60"
              >
                {isLoading ? 'Salvando...' : 'Sim, quero!'}
              </button>
              <button
                data-testid="universe-suggestion-dismiss"
                disabled={isLoading}
                onClick={handleDismiss}
                className="rounded-full border px-6 py-2.5 text-sm font-semibold transition-all hover:border-primary/50 disabled:opacity-60"
              >
                Não, obrigado
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
