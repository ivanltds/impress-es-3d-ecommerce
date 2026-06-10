// ─── M04: Checkout API — Create Order ───
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'
import { getPaymentProvider } from '@/lib/payment-mock'

function generateOrderNumber(): string {
  const seq = Math.floor(Math.random() * 99999).toString().padStart(5, '0')
  return `3DP-${seq}`
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    const userId = session?.user?.id
    const body = await request.json()
    const { items, shippingCost, paymentMethod, cep, street, number, district, city, state } = body

    if (!items?.length || !paymentMethod) {
      return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 })
    }

    const subtotal = items.reduce((s: number, i: { price: number; qty: number }) => s + i.price * i.qty, 0)
    const total = subtotal + (shippingCost || 0)

    // Process payment (mock)
    const provider = getPaymentProvider(paymentMethod)
    const result = await provider.processPayment(total, {})

    if (!result.success) {
      return NextResponse.json({ error: result.error || 'Pagamento falhou' }, { status: 402 })
    }

    // Capture UTM from cookies/referrer
    const sourceChannel = request.headers.get('referer')?.includes('instagram') ? 'instagram' : 'direct'

    const order = await prisma.order.create({
      data: {
        userId,
        orderNumber: generateOrderNumber(),
        status: 'paid',
        paymentStatus: 'paid',
        fulfillmentStatus: 'unfulfilled',
        subtotal,
        shippingCost: shippingCost || 0,
        total,
        currency: 'BRL',
        sourceChannel,
        items: {
          create: items.map((i: { productId: string; name: string; sku?: string; qty: number; price: number }) => ({
            productId: i.productId,
            productNameSnapshot: i.name,
            skuSnapshot: i.sku || i.productId,
            qty: i.qty,
            unitPrice: i.price,
            productionStatus: 'pending',
          })),
        },
      },
      include: { items: true },
    })

    return NextResponse.json({ success: true, orderNumber: order.orderNumber, orderId: order.id, total }, { status: 201 })
  } catch (err) {
    console.error('[checkout] Error:', err)
    return NextResponse.json({ error: 'Erro ao criar pedido' }, { status: 500 })
  }
}
