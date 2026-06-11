// ─── M04: Store Address by ID ───
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const { id } = await params
    const body = await request.json()
    const { name, phone, email, document, street, number, complement, neighborhood, city, state, cep, isActive } = body
    const data: Record<string, unknown> = {}
    if (name !== undefined) data.name = name
    if (phone !== undefined) data.phone = phone
    if (email !== undefined) data.email = email
    if (document !== undefined) data.document = String(document).replace(/\D/g, '')
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
  } catch (err: any) {
    console.error('[store-addresses] PATCH error:', err)
    return NextResponse.json({ error: err.message || 'Erro ao atualizar' }, { status: 500 })
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const { id } = await params
    await prisma.storeAddress.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('[store-addresses] DELETE error:', err)
    return NextResponse.json({ error: err.message || 'Erro ao deletar' }, { status: 500 })
  }
}
