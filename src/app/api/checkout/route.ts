// M04: Checkout API - Create Order
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
    const {
      items, shippingCost, paymentMethod,
      cep, street, number, district, city, state, document,
    } = body

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

    // If user is logged in and provided document (CPF), persist it
    if (userId && document) {
      await prisma.user.update({ where: { id: userId }, data: { document } }).catch(() => {})
    }

    // DA-M06-02: Enrich items with universeSlug for post-checkout suggestion (F4)
    // Guard against missing prisma.productUniverse (e.g. in test envs with partial mock)
    const enrichedItems = await Promise.all(
      items.map(async (i: { productId: string; name: string; sku?: string; qty: number; price: number }) => {
        try {
          if (!prisma.productUniverse) return { ...i, universeSlug: null }
          const pu = await prisma.productUniverse.findFirst({
            where: { productId: i.productId },
            include: { universe: { select: { slug: true } } },
          })
          return { ...i, universeSlug: pu?.universe?.slug ?? null }
        } catch {
          return { ...i, universeSlug: null }
        }
      })
    )

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
        cep:              cep      || null,
        shippingStreet:   street   || null,
        shippingNumber:   number   || null,
        shippingDistrict: district || null,
        shippingCity:     city     || null,
        shippingState:    state    || null,
        items: {
          create: enrichedItems.map((i) => ({
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

    // Include universeSlug in response so confirmado page can read it from localStorage
    const itemsForStorage = enrichedItems.map((i) => ({
      name: i.name,
      qty: i.qty,
      universeSlug: i.universeSlug,
    }))

    return NextResponse.json(
      {
        success: true,
        orderNumber: order.orderNumber,
        orderId: order.id,
        total,
        items: itemsForStorage,
      },
      { status: 201 },
    )
  } catch (err) {
    console.error('[checkout] Error:', err)
    return NextResponse.json({ error: 'Erro ao criar pedido' }, { status: 500 })
  }
}
