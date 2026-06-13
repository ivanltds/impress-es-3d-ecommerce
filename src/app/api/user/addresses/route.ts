// ─── M06: F5 — GET/POST /api/user/addresses ───
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

const REQUIRED_FIELDS = ['cep', 'street', 'number', 'district', 'city', 'state', 'recipientName'] as const

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const addresses = await prisma.address.findMany({
    where: { userId: session.user.id },
    orderBy: [{ isDefault: 'desc' }, { id: 'asc' }],
  })

  return NextResponse.json(addresses)
}

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()

  // Validate required fields (RN-M06-12)
  const missing = REQUIRED_FIELDS.filter((f) => !body[f] || String(body[f]).trim() === '')
  if (missing.length > 0) {
    return NextResponse.json(
      { error: 'Campos obrigatórios ausentes', fields: missing },
      { status: 400 },
    )
  }

  const address = await prisma.address.create({
    data: {
      userId: session.user.id,
      label: body.label ?? '',
      recipientName: body.recipientName,
      cep: body.cep,
      street: body.street,
      number: body.number,
      complement: body.complement ?? null,
      district: body.district,
      city: body.city,
      state: body.state,
      country: body.country ?? 'Brasil',
      isDefault: false,
    },
  })

  return NextResponse.json(address, { status: 201 })
}
