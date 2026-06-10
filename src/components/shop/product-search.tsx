'use client'

import { useState, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, X } from 'lucide-react'

export function ProductSearch({ defaultValue }: { defaultValue?: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [value, setValue] = useState(defaultValue || '')

  const update = useCallback(
    (v: string) => {
      setValue(v)
      const params = new URLSearchParams(searchParams.toString())
      if (v.length >= 3) {
        params.set('q', v)
      } else {
        params.delete('q')
      }
      router.push(`/produtos?${params.toString()}`)
    },
    [router, searchParams]
  )

  return (
    <div className="relative mb-4" data-testid="product-search">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <input
        type="text"
        placeholder="Buscar produtos..."
        value={value}
        onChange={(e) => update(e.target.value)}
        className="w-full rounded-lg border py-2.5 pl-10 pr-8 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
      />
      {value && (
        <button
          onClick={() => update('')}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}
