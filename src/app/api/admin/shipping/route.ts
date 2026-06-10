// ─── M04: Shipping API (continuation of Production) ───
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'

export async function GET() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Only show orders that have reached shipping stage
  const orders = await prisma.order.findMany({
    where: {
      paymentStatus: 'paid',
      fulfillmentStatus: { in: ['shipped', 'delivered'] },
    },
    orderBy: { createdAt: 'desc' },
    include: { items: true, user: { select: { name: true } } },
  })

  const shipments = orders.map((o) => {
    // Map fulfillmentStatus to shipping kanban column
    const shippingStatus =
      o.fulfillmentStatus === 'delivered' ? 'delivered' : 'posted'
    return {
      id: o.id,
      orderId: o.id,
      orderNumber: o.orderNumber,
      customerName: o.user?.name || 'Cliente',
      items: o.items.map((i) => i.productNameSnapshot).join(', '),
      total: o.total,
      status: shippingStatus,
      updatedAt: o.createdAt.toISOString(),
    }
  })

  return NextResponse.json(shipments)
}

export async function PATCH(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id, status } = await req.json()

  // Map shipping kanban columns to DB fulfillmentStatus
  const statusMap: Record<string, string> = {
    posted: 'shipped',
    in_transit: 'shipped',
    delivered: 'delivered',
  }
  const dbStatus = statusMap[status] || 'shipped'

  await prisma.order.update({
    where: { id },
    data: { fulfillmentStatus: dbStatus },
  })

  return NextResponse.json({ success: true })
}
