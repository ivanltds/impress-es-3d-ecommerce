// M06: F7 - PATCH/DELETE /api/admin/promo-banners/[id]
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

const ADMIN_ROLES = ['admin', 'operator']

function isAdmin(session: { user?: { role?: string } } | null): boolean {
  const role = (session?.user as { role?: string } | undefined)?.role
  return !!role && ADMIN_ROLES.includes(role)
}

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (!isAdmin(session as { user?: { role?: string } } | null)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params
  const body = await request.json()

  const existing = await prisma.promoBanner.findUnique({ where: { id } })
  if (!existing) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  if (Array.isArray(body.products)) {
    await prisma.$transaction([
      prisma.promoBannerProduct.deleteMany({ where: { bannerId: id } }),
      prisma.promoBannerProduct.createMany({
        data: body.products.map((p: { productId: string; sortOrder: number }) => ({
          bannerId: id,
          productId: p.productId,
          sortOrder: p.sortOrder ?? 0,
        })),
      }),
    ])
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { products: _products, ...scalarFields } = body
  const updateData: Record<string, unknown> = {}
  for (const key of ['title', 'subtitle', 'isActive', 'startsAt', 'endsAt'] as const) {
    if (key in scalarFields) {
      updateData[key] = key === 'startsAt' || key === 'endsAt'
        ? new Date(scalarFields[key] as string)
        : scalarFields[key]
    }
  }

  const updated = await prisma.promoBanner.update({
    where: { id },
    data: updateData,
    include: { products: true },
  })

  return NextResponse.json(updated)
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (!isAdmin(session as { user?: { role?: string } } | null)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params

  const existing = await prisma.promoBanner.findUnique({ where: { id } })
  if (!existing) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  await prisma.promoBanner.delete({ where: { id } })

  return NextResponse.json({ ok: true })
}
