// ─── M04: Store Addresses API ───
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const addresses = await prisma.storeAddress.findMany({ orderBy: { createdAt: 'desc' } })
  return NextResponse.json(addresses)
}

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { name, street, number, complement, neighborhood, city, state, cep, isActive } = await request.json()
  if (!name || !street || !number || !city || !state || !cep) {
    return NextResponse.json({ error: 'Campos obrigatórios: name, street, number, city, state, cep' }, { status: 400 })
  }
  const formatted = cep.replace(/\D/g, '').replace(/^(\d{5})(\d{3})$/, '-')
  const address = await prisma.storeAddress.create({
    data: { name, street, number, complement: complement || null, neighborhood: neighborhood || null, city, state, cep: formatted, isActive: isActive ?? true },
  })
  return NextResponse.json(address)
}
