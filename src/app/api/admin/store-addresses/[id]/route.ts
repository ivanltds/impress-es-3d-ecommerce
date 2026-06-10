// ─── M04: Store Address by ID ───
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const body = await request.json()
  const { name, street, number, complement, neighborhood, city, state, cep, isActive } = body
  const data: Record<string, unknown> = {}
  if (name !== undefined) data.name = name
  if (street !== undefined) data.street = street
  if (number !== undefined) data.number = number
  if (complement !== undefined) data.complement = complement
  if (neighborhood !== undefined) data.neighborhood = neighborhood
  if (city !== undefined) data.city = city
  if (state !== undefined) data.state = state
  if (cep !== undefined) data.cep = cep.replace(/\D/g, '').replace(/^(\d{5})(\d{3})$/, '$1-$2')
  if (isActive !== undefined) data.isActive = isActive
  const address = await prisma.storeAddress.update({ where: { id }, data })
  return NextResponse.json(address)
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  await prisma.storeAddress.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
