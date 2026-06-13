// ─── M06: F7 — GET/POST /api/admin/promo-banners ───
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

const ADMIN_ROLES = ['admin', 'operator']

function isAdmin(session: { user?: { role?: string } } | null): boolean {
  const role = (session?.user as { role?: string } | undefined)?.role
  return !!role && ADMIN_ROLES.includes(role)
}

export async function GET() {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (!isAdmin(session as { user?: { role?: string } } | null)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const banners = await prisma.promoBanner.findMany({
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { products: true } } },
  })

  const result = banners.map((b) => ({
    id: b.id,
    title: b.title,
    subtitle: b.subtitle,
    startsAt: b.startsAt.toISOString(),
    endsAt: b.endsAt.toISOString(),
    isActive: b.isActive,
    productCount: b._count.products,
    createdAt: b.createdAt.toISOString(),
  }))

  return NextResponse.json(result)
}

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (!isAdmin(session as { user?: { role?: string } } | null)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await request.json()
  const { title, subtitle, startsAt, endsAt, isActive, products } = body

  // Validate
  if (!title || String(title).trim() === '') {
    return NextResponse.json({ error: 'title é obrigatório' }, { status: 400 })
  }
  if (!startsAt || !endsAt || new Date(startsAt) >= new Date(endsAt)) {
    return NextResponse.json({ error: 'startsAt deve ser anterior a endsAt' }, { status: 400 })
  }

  const banner = await prisma.promoBanner.create({
    data: {
      title: String(title).trim(),
      subtitle: subtitle ?? null,
      startsAt: new Date(startsAt),
      endsAt: new Date(endsAt),
      isActive: isActive ?? true,
      products: {
        create: (products ?? []).map((p: { productId: string; sortOrder: number }) => ({
          productId: p.productId,
          sortOrder: p.sortOrder ?? 0,
        })),
      },
    },
    include: { products: true },
  })

  return NextResponse.json(banner, { status: 201 })
}
