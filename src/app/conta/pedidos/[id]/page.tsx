// ─── M06: F3 — Detalhe do pedido ───
// Server Component — dados buscados no servidor (RN-M06-15).
// Segurança: notFound() para pedido de outro usuário (RN-M06-04).
import { notFound } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { OrderDetail } from '@/components/conta/OrderDetail'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function OrderDetailPage({ params }: PageProps) {
  const { id: orderId } = await params
  const session = await auth()
  const userId = (session?.user as { id?: string } | undefined)?.id ?? ''

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  })

  // RN-M06-04: never expose cross-user data; 404 for both missing and unauthorized
  if (!order || order.userId !== userId) {
    notFound()
  }

  // Serialize dates for the Client Component (cenário 3.1)
  const serialized = {
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    paymentStatus: order.paymentStatus,
    total: order.total,
    subtotal: order.subtotal,
    shippingCost: order.shippingCost,
    trackingCode: order.trackingCode ?? null,
    createdAt: order.createdAt.toISOString(),
    items: order.items.map((item) => ({
      id: item.id,
      productNameSnapshot: item.productNameSnapshot,
      skuSnapshot: item.skuSnapshot,
      qty: item.qty,
      unitPrice: item.unitPrice,
      customizationPrice: item.customizationPrice,
      customizationSnapshot: item.customizationSnapshot ?? null,
      productionStatus: item.productionStatus,
    })),
  }

  return <OrderDetail order={serialized} userId={userId} />
}
