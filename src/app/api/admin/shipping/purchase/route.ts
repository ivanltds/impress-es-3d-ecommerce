// ─── M04: Shipping Label API ───
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { calculateShipping } from '@/lib/shipping'

export async function GET(request: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const cep = request.nextUrl.searchParams.get('cep')
  if (!cep) return NextResponse.json({ error: 'CEP required' }, { status: 400 })

  const services = await calculateShipping(cep)
  return NextResponse.json(services)
}

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { orderId, trackingCode, carrier } = await request.json()

  if (!orderId) return NextResponse.json({ error: 'orderId é obrigatório' }, { status: 400 })

  // Update order with tracking info
  await prisma.order.update({
    where: { id: orderId },
    data: {
      fulfillmentStatus: 'shipped',
      notes: `Rastreio: ${trackingCode} (${carrier})`,
    },
  })

  // Update all order items to shipped
  await prisma.orderItem.updateMany({
    where: { orderId },
    data: { productionStatus: 'shipped' },
  })

  return NextResponse.json({ success: true })
}
