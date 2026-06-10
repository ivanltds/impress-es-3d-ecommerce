// ─── M04: Admin Order Detail ───
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'

export default async function AdminPedidoDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const order = await prisma.order.findUnique({ where: { id }, include: { items: true } })
  if (!order) notFound()

  return (
    <div className="p-6" data-testid="order-detail">
      <h1 className="font-heading text-2xl font-bold">Pedido {order.orderNumber}</h1>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border p-6">
          <h3 className="font-semibold">Items</h3>
          <div className="mt-4 space-y-3">
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between border-b pb-3 text-sm">
                <div>
                  <p className="font-medium">{item.productNameSnapshot}</p>
                  <p className="text-xs text-muted-foreground">SKU: {item.skuSnapshot} · Qty: {item.qty}</p>
                  {item.customizationSnapshot && <p className="text-xs text-primary">{item.customizationSnapshot}</p>}
                </div>
                <p className="font-medium">R$ {(item.unitPrice * item.qty).toFixed(2)}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <div className="rounded-xl border p-6">
            <h3 className="font-semibold">Financeiro</h3>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between"><span>Subtotal</span><span>R$ {order.subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between"><span>Frete</span><span>R$ {order.shippingCost.toFixed(2)}</span></div>
              <div className="flex justify-between border-t pt-2 font-bold text-lg"><span>Total</span><span>R$ {order.total.toFixed(2)}</span></div>
            </div>
            <div className="mt-4 flex gap-2">
              <span className="rounded-full bg-green-100 px-3 py-1 text-xs text-green-700">{order.paymentStatus}</span>
              <span className="rounded-full bg-blue-100 px-3 py-1 text-xs text-blue-700">{order.fulfillmentStatus}</span>
            </div>
          </div>
          <div className="rounded-xl border p-6">
            <h3 className="font-semibold">Canal</h3>
            <p className="mt-2 text-sm text-muted-foreground">{order.sourceChannel || 'Direto'}</p>
            <p className="mt-1 text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleString('pt-BR')}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
