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

  // Fetch order for address details
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { user: { select: { name: true } } },
  })
  if (!order) return NextResponse.json({ error: 'Pedido não encontrado' }, { status: 404 })

  // Extract address info
  let toName = order.user?.name || 'Cliente'
  let toAddress = 'Endereco'
  let toCity = 'Cidade'
  try {
    if (order.notes) {
      const addr = JSON.parse(order.notes)
      toAddress = [addr.street, addr.number].filter(Boolean).join(', ') || 'Endereco'
      toCity = addr.city || 'Cidade'
    }
  } catch {}

  console.log('[purchase] Attempting purchase with:', { cep, serviceId, toName, toAddress, toCity })

  // Purchase the label via Melhor Envio
  const label = await purchaseLabel(cep, serviceId, toName, toAddress, toCity)
  if (!label) {
    console.error('[purchase] Label purchase returned null')
    return NextResponse.json({ success: false, error: 'Falha ao comprar etiqueta. Verifique os logs do servidor.' }, { status: 500 })
  }
  console.log('[purchase] Label purchased:', JSON.stringify(label))

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
