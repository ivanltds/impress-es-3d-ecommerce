// ─── M04: Production API (unified with Shipping) ───
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'

export async function GET() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Only show items that are NOT in shipping stage yet
  const orders = await prisma.order.findMany({
    where: {
      paymentStatus: 'paid',
      fulfillmentStatus: { notIn: ['shipped', 'posted', 'in_transit', 'delivered'] }, // not in shipping yet
    },
    orderBy: { createdAt: 'desc' },
    include: {
      items: true,
      user: { select: { name: true, phone: true } },
    },
  })

  const items = orders.flatMap((o) =>
    o.items.map((item) => ({
      id: item.id,
      orderId: o.id,
      orderNumber: o.orderNumber,
      customerName: o.user?.name || 'Cliente',
      customerPhone: o.user?.phone || '',
      productNameSnapshot: item.productNameSnapshot,
      qty: item.qty,
      customizationSnapshot: item.customizationSnapshot,
      productionStatus: item.productionStatus,
      productionNotes: item.productionNotes,
      total: o.total,
      estimatedHours: 2,
      cep: o.cep || '',
    }))
  )

  return NextResponse.json(items)
}

export async function PATCH(request: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { itemId, status, notes } = await request.json()

  // Update item production status
  await prisma.orderItem.update({
    where: { id: itemId },
    data: { productionStatus: status, productionNotes: notes },
  })

  // Sync order fulfillment status with production progress
  const item = await prisma.orderItem.findUnique({ where: { id: itemId }, select: { orderId: true } })
  if (item) {
    const orderItems = await prisma.orderItem.findMany({ where: { orderId: item.orderId } })
    const allShipped = orderItems.every((i) => i.productionStatus === 'shipped' || i.id === itemId)

    // Map production status to order fulfillment status
    const statusMap: Record<string, string> = {
      pending: 'unfulfilled',
      in_progress: 'in_progress',
      finishing: 'in_progress',
      packed: 'in_progress',
      shipped: allShipped ? 'shipped' : 'in_progress',
    }

    const fulfillmentStatus = statusMap[status] || 'unfulfilled'

    await prisma.order.update({
      where: { id: item.orderId },
      data: { fulfillmentStatus },
    })
  }

  return NextResponse.json({ success: true })
}
