// GET + PATCH /api/admin/universes/[slug]
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

const ADMIN_ROLES = ['admin', 'operator']

function isAuthorized(session: unknown): boolean {
  const s = session as { user?: { role?: string } } | null
  const role = s?.user?.role
  return Boolean(s?.user && role && ADMIN_ROLES.includes(role))
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await auth()
  if (!isAuthorized(session)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { slug } = await params
  const universe = await prisma.universe.findUnique({
    where: { slug },
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
  })

  if (!universe) {
    return NextResponse.json({ error: 'Universe not found' }, { status: 404 })
  }

  return NextResponse.json(universe)
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await auth()
  if (!isAuthorized(session)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { slug } = await params

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }

  const { tagline, bullets } = body as { tagline?: unknown; bullets?: unknown }

  // Validate tagline
  if (typeof tagline !== 'string' || tagline.trim().length === 0) {
    return NextResponse.json({ error: 'A tagline não pode ser vazia', field: 'tagline' }, { status: 400 })
  }
  if (tagline.length > 120) {
    return NextResponse.json({ error: 'Máximo de 120 caracteres', field: 'tagline' }, { status: 400 })
  }

  // Validate bullets
  if (!Array.isArray(bullets) || bullets.length !== 3) {
    return NextResponse.json({ error: 'Exatamente 3 bullets são obrigatórios', field: 'bullets' }, { status: 400 })
  }
  for (let i = 0; i < 3; i++) {
    const b = bullets[i]
    if (typeof b !== 'string') {
      return NextResponse.json({ error: 'Cada bullet deve ser uma string', field: `bullet_${i}` }, { status: 400 })
    }
    if (b.length < 5) {
      return NextResponse.json({ error: 'Mínimo de 5 caracteres por bullet', field: `bullet_${i}` }, { status: 400 })
    }
    if (b.length > 100) {
      return NextResponse.json({ error: 'Máximo de 100 caracteres por bullet', field: `bullet_${i}` }, { status: 400 })
    }
  }

  const existing = await prisma.universe.findUnique({ where: { slug } })
  if (!existing) {
    return NextResponse.json({ error: 'Universe not found' }, { status: 404 })
  }

  const updated = await prisma.universe.update({
    where: { slug },
    data: { tagline: tagline.trim(), bullets: bullets as string[] },
    select: { slug: true, tagline: true, bullets: true, updatedAt: true },
  })

  return NextResponse.json(updated)
}
