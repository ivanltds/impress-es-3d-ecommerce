'use client'

// ─── M04: Admin Orders (open by default, search, toggle closed) ───
import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { LayoutGrid, List, Search, ToggleLeft, ToggleRight, Package, Calendar, DollarSign, ChevronRight } from 'lucide-react'

interface OrderItem {
  id: string; productNameSnapshot: string; qty: number; unitPrice: number; productionStatus: string
}

interface Order {
  id: string; orderNumber: string; status: string; paymentStatus: string
  fulfillmentStatus: string; total: number; createdAt: string; items: OrderItem[]
}

const STATUS_LABELS: Record<string, string> = { paid: 'Pago', pending: 'Pendente', refunded: 'Reembolsado', failed: 'Falhou' }
const FULFILLMENT_LABELS: Record<string, string> = {
  unfulfilled: 'Não atendido', in_progress: 'Em produção',
  shipped: 'Pronto p/ Envio', awaiting_pickup: 'Aguardando Postagem', posted: 'Postado', in_transit: 'Em trânsito', delivered: 'Entregue',
}

export default function AdminPedidosPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [loading, setLoading] = useState(true)
  const [showClosed, setShowClosed] = useState(false)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetch('/api/admin/orders')
      .then((r) => r.json())
      .then((data) => { setOrders(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    let result = orders
    if (!showClosed) result = result.filter((o) => o.fulfillmentStatus !== 'delivered')
    if (search) {
      const q = search.toLowerCase()
      result = result.filter((o) => o.orderNumber.toLowerCase().includes(q) || o.items.some((i) => i.productNameSnapshot.toLowerCase().includes(q)))
    }
    return result
  }, [orders, showClosed, search])

  const openCount = orders.filter((o) => o.fulfillmentStatus !== 'delivered').length
  const total = filtered.reduce((s, o) => s + o.total, 0)

  if (loading) return <div className="p-6">Carregando...</div>

  return (
    <div className="p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold">Pedidos</h1>
          <p className="text-sm text-muted-foreground">
            {openCount} em aberto · {orders.length} total · R$ {total.toFixed(2)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              placeholder="Buscar pedido..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-48 rounded-lg border py-2 pl-9 pr-3 text-sm"
            />
          </div>
          <button
            onClick={() => setShowClosed(!showClosed)}
            className={`flex items-center gap-1 rounded-lg border px-3 py-2 text-sm ${showClosed ? 'bg-primary/10 text-primary border-primary/30' : ''}`}
          >
            {showClosed ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
            Concluídos
          </button>
          <div className="flex rounded-lg border">
            <button onClick={() => setView('grid')} className={`rounded-l-lg p-2 ${view === 'grid' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}><LayoutGrid className="h-5 w-5" /></button>
            <button onClick={() => setView('list')} className={`rounded-r-lg p-2 ${view === 'list' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}><List className="h-5 w-5" /></button>
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="mt-16 flex flex-col items-center justify-center text-center">
          <Package className="mb-4 h-16 w-16 text-muted-foreground/20" />
          <p className="text-lg font-medium">Nenhum pedido encontrado</p>
        </div>
      ) : view === 'grid' ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" data-testid="admin-orders-table">
          {filtered.map((o) => (
            <Link key={o.id} href={`/admin/pedidos/${o.id}`} className="group rounded-xl border bg-card p-5 transition-all hover:shadow-lg hover:border-primary/30">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold">{o.orderNumber}</p>
                  <p className="flex items-center gap-1 text-xs text-muted-foreground"><Calendar className="h-3 w-3" /> {new Date(o.createdAt).toLocaleDateString('pt-BR')}</p>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${o.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{STATUS_LABELS[o.paymentStatus] || o.paymentStatus}</span>
              </div>
              <div className="mt-3 space-y-1">
                {o.items.slice(0, 3).map((item) => (
                  <div key={item.id} className="flex items-center gap-2">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary/10 to-purple-500/10">
                      <Package className="h-4 w-4 text-primary/50" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm">{item.productNameSnapshot}</p>
                    </div>
                  </div>
                ))}
                {o.items.length > 3 && <p className="text-xs text-muted-foreground">+{o.items.length - 3} itens</p>}
              </div>
              <div className="mt-3 flex items-center justify-between border-t pt-3">
                <span className="font-bold text-primary"><DollarSign className="inline h-4 w-4" /> R$ {o.total.toFixed(2)}</span>
                <span className="text-xs text-muted-foreground">{FULFILLMENT_LABELS[o.fulfillmentStatus] || o.fulfillmentStatus}</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-xl border">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Nº</th>
                <th className="px-4 py-3 text-left font-medium">Data</th>
                <th className="px-4 py-3 text-left font-medium">Itens</th>
                <th className="px-4 py-3 text-left font-medium">Total</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((o) => (
                <tr key={o.id} className="border-b hover:bg-muted/30 cursor-pointer" onClick={() => window.location.href = `/admin/pedidos/${o.id}`}>
                  <td className="px-4 py-3 font-medium">{o.orderNumber}</td>
                  <td className="px-4 py-3 text-muted-foreground">{new Date(o.createdAt).toLocaleDateString('pt-BR')}</td>
                  <td className="px-4 py-3 text-xs">{o.items.map((i) => i.productNameSnapshot).join(', ')}</td>
                  <td className="px-4 py-3 font-medium">R$ {o.total.toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs ${o.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{STATUS_LABELS[o.paymentStatus]}</span>
                    <span className="ml-1 text-xs text-muted-foreground">{FULFILLMENT_LABELS[o.fulfillmentStatus]}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
