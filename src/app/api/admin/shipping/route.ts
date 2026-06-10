// ─── M04: Shipping API ───
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'

export async function GET() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const orders = await prisma.order.findMany({
    where: { paymentStatus: 'paid', fulfillmentStatus: { in: ['shipped', 'in_progress', 'unfulfilled'] } },
    orderBy: { createdAt: 'desc' },
    include: { items: true, user: { select: { name: true } } },
  })

  const shipments = orders.map((o) => {
    const statusMap: Record<string, string> = {
      unfulfilled: 'preparing', in_progress: 'posted', shipped: 'in_transit',
    }
    return {
      id: o.id,
      orderId: o.id,
      orderNumber: o.orderNumber,
      customerName: o.user?.name || 'Cliente',
      items: o.items.map((i) => i.productNameSnapshot).join(', '),
      total: o.total,
      status: statusMap[o.fulfillmentStatus] || 'preparing',
      updatedAt: o.createdAt.toISOString(),
    }
  })

  return NextResponse.json(shipments)
}

export async function PATCH(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id, status, trackingCode } = await req.json()

  const statusMap: Record<string, string> = {
    preparing: 'unfulfilled', posted: 'in_progress', in_transit: 'shipped', delivered: 'delivered',
  }

  await prisma.order.update({
    where: { id },
    data: {
      fulfillmentStatus: statusMap[status] || status,
    },
  })

  return NextResponse.json({ success: true })
}
