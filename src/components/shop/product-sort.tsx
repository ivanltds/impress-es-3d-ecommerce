'use client'

import { useRouter, useSearchParams } from 'next/navigation'

export function ProductSort({ activeSort }: { activeSort?: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()

  function update(value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set('sort', value)
    } else {
      params.delete('sort')
    }
    router.push(`/produtos?${params.toString()}`)
  }

  return (
    <select
      value={activeSort || ''}
      onChange={(e) => update(e.target.value)}
      className="rounded-lg border px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
      data-testid="sort-select"
    >
      <option value="">Destaque</option>
      <option value="price_asc">Menor preço</option>
      <option value="price_desc">Maior preço</option>
      <option value="name">Nome A-Z</option>
    </select>
  )
}
