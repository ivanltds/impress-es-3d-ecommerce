// ─── M04: Store Addresses API ───
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const addresses = await prisma.storeAddress.findMany({ orderBy: { createdAt: 'desc' } })
    return NextResponse.json(addresses)
  } catch (err: any) {
    console.error('[store-addresses] GET error:', err)
    return NextResponse.json({ error: err.message || 'Erro ao buscar endereços' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const body = await request.json()
    const { name, phone, email, document, street, number, complement, neighborhood, city, state, cep, isActive } = body
    if (!name || !street || !number || !city || !state || !cep) {
      return NextResponse.json({ error: 'Campos obrigatórios: name, street, number, city, state, cep' }, { status: 400 })
    }
    const formatted = cep.replace(/\D/g, '').replace(/^(\d{5})(\d{3})$/, '$1-$2')
    const address = await prisma.storeAddress.create({
      data: {
        name,
        phone:        phone        || '',
        email:        email        || '',
        document:     (document || '').replace(/\D/g, ''),
        street, number,
        complement:   complement   || null,
        neighborhood: neighborhood || null,
        city, state: String(state).toUpperCase(),
        cep: formatted,
        isActive: isActive ?? true,
      },
    })
    return NextResponse.json(address, { status: 201 })
  } catch (err: any) {
    console.error('[store-addresses] POST error:', err)
    return NextResponse.json({ error: err.message || 'Erro ao criar endereço' }, { status: 500 })
  }
}
