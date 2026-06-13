// ─── M06: F7 — GET /api/promotions/active ───
// Returns active campaign or featured products fallback.
// RN-M06-18: campaign must be isActive=true AND startsAt<=now AND endsAt>=now
// RN-M06-19: if multiple active, use most recent startsAt
// RN-M06-20: fallback uses preferredCollection from session, NOT cookie
// RN-M06-21: minimum 3 products; return 204 if fewer available
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  const now = new Date()
  const { searchParams } = new URL(request.url)
  const universeSlug = searchParams.get('universeSlug')

  // 1. Try active campaign (RN-M06-18, RN-M06-19)
  const banner = await prisma.promoBanner.findFirst({
    where: {
      isActive: true,
      startsAt: { lte: now },
      endsAt: { gte: now },
    },
    orderBy: { startsAt: 'desc' },
    include: {
      products: {
        include: {
          product: {
            select: { id: true, name: true, slug: true, basePrice: true, images: true },
          },
        },
        orderBy: { sortOrder: 'asc' },
        take: 5,
      },
    },
  })

  // 2. Campaign valid only if it has >= 3 products (RN-M06-21, cenário 7.8)
  if (banner && banner.products.length >= 3) {
    return NextResponse.json({
      type: 'campaign',
      title: banner.title,
      products: banner.products.map((bp) => bp.product),
    })
  }

  // 3. Fallback by universe (RN-M06-20, cenário 7.2)
  const whereBase = { isFeatured: true }

  if (universeSlug) {
    const universeFiltered = await prisma.product.findMany({
      where: {
        ...whereBase,
        universes: { some: { universe: { slug: universeSlug } } },
      },
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: { id: true, name: true, slug: true, basePrice: true, images: true },
    })

    // If enough universe-specific products, return them
    if (universeFiltered.length >= 3) {
      return NextResponse.json({ type: 'featured', title: null, products: universeFiltered })
    }

    // 4. Not enough universe products — fall back to global (cenário 7.3 continuation)
    const globalFeatured = await prisma.product.findMany({
      where: whereBase,
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: { id: true, name: true, slug: true, basePrice: true, images: true },
    })

    if (globalFeatured.length < 3) {
      return new NextResponse(null, { status: 204 })
    }

    return NextResponse.json({ type: 'featured', title: null, products: globalFeatured })
  }

  // 5. Global fallback — no universe slug (cenário 7.3)
  const featured = await prisma.product.findMany({
    where: whereBase,
    take: 5,
    orderBy: { createdAt: 'desc' },
    select: { id: true, name: true, slug: true, basePrice: true, images: true },
  })

  if (featured.length < 3) {
    return new NextResponse(null, { status: 204 })
  }

  return NextResponse.json({ type: 'featured', title: null, products: featured })
}
