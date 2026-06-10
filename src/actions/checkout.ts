'use server'

// ─── M03: Checkout Server Action ───
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'
import { getPaymentProvider } from '@/lib/payment-mock'

function generateOrderNumber(): string {
  const seq = Math.floor(Math.random() * 99999).toString().padStart(5, '0')
  return `3DP-${seq}`
}

export async function createOrder(formData: FormData) {
  const session = await auth()
  const userId = session?.user?.id

  const shippingId = Number(formData.get('shippingId'))
  const cep = formData.get('cep') as string
  const street = formData.get('street') as string
  const number = formData.get('number') as string
  const district = formData.get('district') as string
  const city = formData.get('city') as string
  const state = formData.get('state') as string
  const paymentMethod = formData.get('paymentMethod') as string
  const itemsJson = formData.get('items') as string

  if (!paymentMethod || !itemsJson) {
    return { success: false, error: 'Dados incompletos para o checkout' }
  }

  const items = JSON.parse(itemsJson) as Array<{
    productId: string
    name: string
    sku: string
    qty: number
    price: number
  }>

  const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0)
  const shippingCost = shippingId === 2 ? 29.9 : 15.9
  const total = subtotal + shippingCost

  // Process payment
  const provider = getPaymentProvider(paymentMethod)
  const result = await provider.processPayment(total, {})

  if (!result.success) {
    return { success: false, error: result.error }
  }

  // Create order
  const order = await prisma.order.create({
    data: {
      userId,
      orderNumber: generateOrderNumber(),
      status: 'paid',
      paymentStatus: 'paid',
      fulfillmentStatus: 'unfulfilled',
      subtotal,
      shippingCost,
      total,
      currency: 'BRL',
      items: {
        create: items.map((i) => ({
          productId: i.productId,
          productNameSnapshot: i.name,
          skuSnapshot: i.sku,
          qty: i.qty,
          unitPrice: i.price,
          productionStatus: 'pending',
        })),
      },
    },
  })

  return { success: true, orderId: order.id, orderNumber: order.orderNumber, total }
}
