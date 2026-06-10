'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import type { Category } from '@prisma/client'

interface Props {
  categories: Category[]
  activeCategory?: string
  minPrice?: string
  maxPrice?: string
}

export function ProductFilters({ categories, activeCategory, minPrice, maxPrice }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()

  function updateParams(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.push(`/produtos?${params.toString()}`)
  }

  return (
    <div className="space-y-6">
      {/* Categories */}
      <div data-testid="category-filter">
        <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Categorias
        </h4>
        <div className="space-y-1">
          <button
            onClick={() => updateParams('categoria', '')}
            className={`block w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
              !activeCategory
                ? 'bg-primary/10 font-medium text-primary'
                : 'text-muted-foreground hover:bg-muted'
            }`}
          >
            Todas
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => updateParams('categoria', cat.slug)}
              className={`block w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                activeCategory === cat.slug
                  ? 'bg-primary/10 font-medium text-primary'
                  : 'text-muted-foreground hover:bg-muted'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div data-testid="price-filter">
        <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Preço
        </h4>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Min"
            defaultValue={minPrice}
            onBlur={(e) => updateParams('min', e.target.value)}
            className="w-full rounded-lg border px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <input
            type="number"
            placeholder="Max"
            defaultValue={maxPrice}
            onBlur={(e) => updateParams('max', e.target.value)}
            className="w-full rounded-lg border px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>
    </div>
  )
}
