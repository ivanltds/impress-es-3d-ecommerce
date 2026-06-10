// ─── M04: Admin Orders List ───
import Link from 'next/link'
import { prisma } from '@/lib/db'
import { Eye } from 'lucide-react'

export default async function AdminPedidosPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    include: { items: true },
  })

  const statusLabel: Record<string, string> = {
    paid: 'Pago', pending: 'Pendente', refunded: 'Reembolsado', failed: 'Falhou',
    created: 'Criado', in_production: 'Em Produção', shipped: 'Enviado', delivered: 'Entregue',
  }

  return (
    <div className="p-6">
      <h1 className="font-heading text-2xl font-bold">Pedidos</h1>
      <div className="mt-6 overflow-x-auto rounded-xl border" data-testid="admin-orders-table">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Nº</th>
              <th className="px-4 py-3 text-left font-medium">Data</th>
              <th className="px-4 py-3 text-left font-medium">Itens</th>
              <th className="px-4 py-3 text-left font-medium">Total</th>
              <th className="px-4 py-3 text-left font-medium">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-b hover:bg-muted/30">
                <td className="px-4 py-3 font-medium">{o.orderNumber}</td>
                <td className="px-4 py-3 text-muted-foreground">{new Date(o.createdAt).toLocaleDateString('pt-BR')}</td>
                <td className="px-4 py-3">{o.items.length}</td>
                <td className="px-4 py-3 font-medium">R$ {o.total.toFixed(2)}</td>
                <td className="px-4 py-3"><span className={`rounded-full px-2 py-0.5 text-xs ${o.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : 'bg-muted text-muted-foreground'}`}>{statusLabel[o.paymentStatus] || o.paymentStatus}</span></td>
                <td className="px-4 py-3 text-right"><Link href={`/admin/pedidos/${o.id}`} className="inline-flex h-8 w-8 items-center justify-center rounded-lg hover:bg-muted"><Eye className="h-4 w-4" /></Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
