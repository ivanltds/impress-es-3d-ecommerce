// ─── M04: Production API ───
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'

export async function GET() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const orders = await prisma.order.findMany({
    where: {
      paymentStatus: 'paid',
      fulfillmentStatus: { notIn: ['delivered', 'cancelled'] },
    },
    orderBy: { createdAt: 'desc' },
    include: {
      items: true,
      user: { select: { name: true, email: true, phone: true } },
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
      estimatedHours: 2, // default estimate
      address: '', // future: pull from address
    }))
  )

  return NextResponse.json(items)
}

export async function PATCH(request: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { itemId, status, notes } = await request.json()
  await prisma.orderItem.update({
    where: { id: itemId },
    data: {
      productionStatus: status,
      productionNotes: notes,
    },
  })

  return NextResponse.json({ success: true })
}
