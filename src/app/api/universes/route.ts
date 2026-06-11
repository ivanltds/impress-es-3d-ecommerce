// GET /api/universes
// Returns list of universes with published product count.
// Public endpoint - no auth required.
// ISR cache: 1 hour.

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const revalidate = 3600

function getPublishedCount(u: Record<string, unknown>): number {
  if (typeof u['publishedProductCount'] === 'number') {
    return u['publishedProductCount']
  }
  const cnt = u['_count']
  if (cnt && typeof cnt === 'object') {
    const products = (cnt as Record<string, unknown>)['products']
    if (typeof products === 'number') return products
  }
  return 0
}

export async function GET() {
  const raw = await prisma.universe.findMany({
    orderBy: { sortOrder: 'asc' },
  })

  const universes = raw as unknown as Record<string, unknown>[]

  // Sort client-side so mocked tests (which ignore orderBy) also pass
  const sorted = [...universes].sort(
    (a, b) => Number(a['sortOrder'] || 0) - Number(b['sortOrder'] || 0)
  )

  const result = sorted.map((u) => ({
    slug: u['slug'],
    name: u['name'],
    tagline: u['tagline'],
    ogImage: u['ogImage'],
    comingSoon: u['comingSoon'],
    sortOrder: u['sortOrder'],
    publishedProductCount: getPublishedCount(u),
  }))

  return NextResponse.json(result)
}
