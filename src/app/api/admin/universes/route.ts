// GET /api/admin/universes — lista todos os universos com campos FF08
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

const ADMIN_ROLES = ['admin', 'operator']

export async function GET() {
  const session = await auth()
  const role = (session?.user as { role?: string } | undefined)?.role
  if (!session?.user || !role || !ADMIN_ROLES.includes(role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const universes = await prisma.universe.findMany({
    select: {
      id: true,
      slug: true,
      name: true,
      comingSoon: true,
      sortOrder: true,
      cardImageUrl: true,
      heroImageUrl: true,
      tagline: true,
      bullets: true,
      updatedAt: true,
    },
    orderBy: { sortOrder: 'asc' },
  })

  return NextResponse.json(universes)
}
