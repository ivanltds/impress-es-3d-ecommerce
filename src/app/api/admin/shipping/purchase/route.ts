// ─── M04: Purchase Shipping Label API ───
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { purchaseLabel, getShippingServices } from '@/lib/shipping-service'

export async function GET(request: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const cep = request.nextUrl.searchParams.get('cep')
  if (!cep) return NextResponse.json({ error: 'CEP required' }, { status: 400 })

  const services = await getShippingServices(cep, [
    { name: 'Produto 3D', quantity: 1, weight: 0.3, width: 15, height: 10, length: 20 },
  ])

  return NextResponse.json(services)
}

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { orderId, cep, serviceId } = await request.json()

  if (!orderId || !cep) {
    return NextResponse.json({ error: 'orderId e cep são obrigatórios' }, { status: 400 })
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  })

  if (!order) return NextResponse.json({ error: 'Pedido não encontrado' }, { status: 404 })

  const products = order.items.map((item) => ({
    name: item.productNameSnapshot,
    quantity: item.qty,
    weight: 0.3,
    width: 15,
    height: 10,
    length: 20,
  }))

  const label = await purchaseLabel(cep, serviceId || 1, products)

  if (label) {
    // Update order with tracking info
    await prisma.order.update({
      where: { id: orderId },
      data: {
        fulfillmentStatus: 'shipped',
        notes: `Rastreio: ${label.tracking} (${label.carrier}) — Valor: R$ ${label.price.toFixed(2)}`,
      },
    })

    // Update all order items to shipped
    await prisma.orderItem.updateMany({
      where: { orderId },
      data: { productionStatus: 'shipped' },
    })

    return NextResponse.json({
      success: true,
      label: {
        tracking: label.tracking,
        carrier: label.carrier,
        price: label.price,
        url: label.url,
      },
    })
  }

  // Fallback: manual registration without label purchase
  return NextResponse.json({
    success: false,
    message: 'Não foi possível gerar a etiqueta. Verifique o token Melhor Envio.',
  })
}
