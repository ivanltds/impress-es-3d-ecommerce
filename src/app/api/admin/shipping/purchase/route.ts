// ─── M04: Purchase Shipping Label ───
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { calculateShipping, purchaseLabel } from '@/lib/shipping'

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
  const { orderId, cep, serviceId } = await request.json()
  if (!orderId || !cep || !serviceId) return NextResponse.json({ error: 'orderId, cep e serviceId obrigatórios' }, { status: 400 })

  // Purchase the label via Melhor Envio
  const label = await purchaseLabel(cep, serviceId)
  if (!label) return NextResponse.json({ success: false, error: 'Falha ao comprar etiqueta' }, { status: 500 })

  // Update order with tracking
  await prisma.order.update({
    where: { id: orderId },
    data: {
      fulfillmentStatus: 'shipped',
      notes: `Etiqueta: ${label.tracking} — R$ ${label.price.toFixed(2)}`,
    },
  })
  await prisma.orderItem.updateMany({ where: { orderId }, data: { productionStatus: 'shipped' } })

  return NextResponse.json({ success: true, tracking: label.tracking, price: label.price })
}
