'use client'

// ─── M04: Admin Orders — Grid + List ───
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { LayoutGrid, List, Package, Calendar, DollarSign, ChevronRight } from 'lucide-react'

interface OrderItem {
  id: string
  productNameSnapshot: string
  qty: number
  unitPrice: number
  productionStatus: string
  customizationSnapshot?: string
}

interface Order {
  id: string
  orderNumber: string
  status: string
  paymentStatus: string
  total: number
  createdAt: string
  items: OrderItem[]
  sourceChannel?: string
}

const STATUS_LABELS: Record<string, string> = {
  paid: 'Pago', pending: 'Pendente', refunded: 'Reembolsado', failed: 'Falhou',
}

export default function AdminPedidosPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/orders')
      .then((r) => r.json())
      .then((data) => { setOrders(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return <div className="p-6">Carregando...</div>

  const total = orders.reduce((s, o) => s + o.total, 0)

  return (
    <div className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold">Pedidos</h1>
          <p className="text-sm text-muted-foreground">{orders.length} pedidos · Total: R$ {total.toFixed(2)}</p>
        </div>
        <div className="flex rounded-lg border">
          <button onClick={() => setView('grid')} className={`rounded-l-lg p-2 ${view === 'grid' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}><LayoutGrid className="h-5 w-5" /></button>
          <button onClick={() => setView('list')} className={`rounded-r-lg p-2 ${view === 'list' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}><List className="h-5 w-5" /></button>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="mt-16 flex flex-col items-center justify-center text-center">
          <Package className="mb-4 h-16 w-16 text-muted-foreground/20" />
          <p className="text-lg font-medium">Nenhum pedido ainda</p>
          <p className="text-sm text-muted-foreground">Os pedidos aparecerão aqui quando os clientes comprarem.</p>
        </div>
      ) : view === 'grid' ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" data-testid="admin-orders-table">
          {orders.map((o) => (
            <Link key={o.id} href={`/admin/pedidos/${o.id}`} className="group rounded-xl border bg-card p-5 transition-all hover:shadow-lg hover:border-primary/30">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold">{o.orderNumber}</p>
                  <p className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" /> {new Date(o.createdAt).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${o.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                  {STATUS_LABELS[o.paymentStatus] || o.paymentStatus}
                </span>
              </div>
              <div className="mt-4 space-y-2">
                {o.items.slice(0, 3).map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary/10 to-purple-500/10">
                      <Package className="h-5 w-5 text-primary/50" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{item.productNameSnapshot}</p>
                      <p className="text-xs text-muted-foreground">Qty: {item.qty} · R$ {(item.unitPrice * item.qty).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
                {o.items.length > 3 && <p className="text-xs text-muted-foreground">+{o.items.length - 3} itens</p>}
              </div>
              <div className="mt-4 flex items-center justify-between border-t pt-3">
                <span className="flex items-center gap-1 text-sm font-bold"><DollarSign className="h-4 w-4 text-primary" /> R$ {o.total.toFixed(2)}</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-xl border" data-testid="admin-orders-table">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left font-medium"></th>
                <th className="px-4 py-3 text-left font-medium">Nº</th>
                <th className="px-4 py-3 text-left font-medium">Itens</th>
                <th className="px-4 py-3 text-left font-medium">Data</th>
                <th className="px-4 py-3 text-left font-medium">Total</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-b hover:bg-muted/30 cursor-pointer" onClick={() => window.location.href = `/admin/pedidos/${o.id}`}>
                  <td className="px-4 py-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary/10 to-purple-500/10">
                      <Package className="h-4 w-4 text-primary/50" />
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium">{o.orderNumber}</td>
                  <td className="px-4 py-3 text-xs">{o.items.map((i) => i.productNameSnapshot).join(', ')}</td>
                  <td className="px-4 py-3 text-muted-foreground">{new Date(o.createdAt).toLocaleDateString('pt-BR')}</td>
                  <td className="px-4 py-3 font-medium">R$ {o.total.toFixed(2)}</td>
                  <td className="px-4 py-3"><span className={`rounded-full px-2 py-0.5 text-xs ${o.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{STATUS_LABELS[o.paymentStatus] || o.paymentStatus}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
