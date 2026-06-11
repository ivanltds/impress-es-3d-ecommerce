'use client'
// Client Component — fire-and-forget PATCH /api/user/preference on mount
import { useEffect } from 'react'

interface Props {
  slug: string
}

export function UniversePreferenceSetter({ slug }: Props) {
  useEffect(() => {
    fetch('/api/user/preference', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ universeSlug: slug }),
    }).catch(() => {
      // fire-and-forget: ignore errors
    })
  }, [slug])

  return null
}
