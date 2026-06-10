import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { Package, ChevronRight } from 'lucide-react'
import Link from 'next/link'

export default async function PedidosPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/auth/entrar')

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    include: { items: true },
  })

  return (
    <div className="container mx-auto max-w-3xl px-4 py-12">
      <h1 className="font-heading text-3xl font-bold">Meus Pedidos</h1>
      {orders.length === 0 ? (
        <div className="mt-16 text-center" data-testid="orders-list">
          <Package className="mx-auto mb-4 h-16 w-16 text-muted-foreground/30" />
          <p className="text-muted-foreground">Nenhum pedido ainda.</p>
        </div>
      ) : (
        <div className="mt-8 space-y-4" data-testid="orders-list">
          {orders.map((order) => (
            <Link key={order.id} href={`/conta/pedidos/${order.id}`} className="flex items-center justify-between rounded-xl border p-5 transition-all hover:border-primary/50 hover:shadow-md">
              <div>
                <p className="font-semibold">{order.orderNumber}</p>
                <p className="text-sm text-muted-foreground">{new Date(order.createdAt).toLocaleDateString('pt-BR')} · {order.items.length} ite{order.items.length !== 1 ? 'ns' : 'm'} · R$ {order.total.toFixed(2)}</p>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
