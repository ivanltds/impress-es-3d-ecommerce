'use client'

// ─── M04: Production Kanban Board (real data from DB) ───
import { useState, useEffect, useCallback } from 'react'
import { X, Clock, User, MapPin, Package } from 'lucide-react'

type Status = 'pending' | 'in_progress' | 'finishing' | 'packed' | 'shipped'

interface KanbanItem {
  id: string
  orderId: string
  orderNumber: string
  customerName: string
  customerPhone?: string
  productNameSnapshot: string
  qty: number
  customizationSnapshot?: string
  productionStatus: string
  productionNotes?: string
  total: number
  estimatedHours: number
  address?: string
}

const COLUMNS: { key: Status; label: string; color: string }[] = [
  { key: 'pending', label: 'Aguardando', color: 'bg-amber-50 border-amber-200' },
  { key: 'in_progress', label: 'Em Produção', color: 'bg-blue-50 border-blue-200' },
  { key: 'finishing', label: 'Acabamento', color: 'bg-purple-50 border-purple-200' },
  { key: 'packed', label: 'Embalado', color: 'bg-green-50 border-green-200' },
  { key: 'shipped', label: 'Enviado p/ Entrega', color: 'bg-gray-50 border-gray-200' },
]

const STATUS_MAP: Record<string, Status> = {
  pending: 'pending',
  in_progress: 'in_progress',
  finishing: 'finishing',
  packed: 'packed',
  shipped: 'shipped',
}

export default function ProducaoPage() {
  const [items, setItems] = useState<KanbanItem[]>([])
  const [selected, setSelected] = useState<KanbanItem | null>(null)
  const [dragOver, setDragOver] = useState<Status | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/production')
      .then((r) => r.json())
      .then((data) => { setItems(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const moveItem = useCallback(async (itemId: string, toStatus: Status) => {
    setItems((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, productionStatus: toStatus } : i))
    )
    await fetch('/api/admin/production', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemId, status: toStatus }),
    })
  }, [])

  function handleDragStart(e: React.DragEvent, itemId: string) {
    e.dataTransfer.setData('text/plain', itemId)
    e.dataTransfer.effectAllowed = 'move'
    const el = e.currentTarget as HTMLElement
    el.style.opacity = '0.6'
    el.addEventListener('dragend', () => { el.style.opacity = '1' }, { once: true })
  }

  function handleDrop(e: React.DragEvent, status: Status) {
    e.preventDefault()
    setDragOver(null)
    const itemId = e.dataTransfer.getData('text/plain')
    if (itemId) moveItem(itemId, status)
  }

  const itemCount = items.length

  if (loading) return <div className="p-6">Carregando produção...</div>

  return (
    <div className="p-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold">Produção</h1>
        <span className="text-sm text-muted-foreground">{itemCount} ite{itemCount !== 1 ? 'ns' : 'm'} na fila</span>
      </div>

      <div className="mt-6 grid grid-cols-5 gap-4 overflow-x-auto" data-testid="kanban-board">
        {COLUMNS.map((col) => {
          const colItems = items.filter((i) => i.productionStatus === col.key || (col.key === 'pending' && !i.productionStatus))
          return (
            <div
              key={col.key}
              className={`rounded-xl border-2 p-3 min-h-[400px] ${col.color} ${dragOver === col.key ? 'border-primary' : ''}`}
              data-testid={`kanban-col-${col.key}`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(col.key) }}
              onDragLeave={() => setDragOver(null)}
              onDrop={(e) => handleDrop(e, col.key)}
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{col.label}</span>
                <span className="rounded-full bg-background px-2 py-0.5 text-xs font-bold">{colItems.length}</span>
              </div>
              {colItems.map((item) => (
                <div
                  key={item.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, item.id)}
                  onClick={() => setSelected(item)}
                  className="mb-2 cursor-pointer rounded-lg border bg-card p-3 text-sm shadow-sm transition-all hover:shadow-md"
                  data-testid="kanban-card"
                >
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary/10 to-purple-500/10">
                      <Package className="h-4 w-4 text-primary/50" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold">{item.orderNumber}</p>
                      <p className="truncate text-xs text-muted-foreground">{item.productNameSnapshot} x{item.qty}</p>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {item.estimatedHours}h</span>
                    <span className="flex items-center gap-1"><User className="h-3 w-3" /> {item.customerName}</span>
                  </div>
                </div>
              ))}
            </div>
          )
        })}
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setSelected(null)}>
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-card p-6 shadow-2xl" onClick={(e) => e.stopPropagation()} data-testid="kanban-card-detail">
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-xl font-bold">{selected.orderNumber}</h2>
              <button onClick={() => setSelected(null)} className="rounded-lg p-2 hover:bg-muted"><X className="h-5 w-5" /></button>
            </div>
            <div className="mt-4 space-y-4">
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{selected.customerName}</span>
                {selected.customerPhone && <span className="text-muted-foreground">{selected.customerPhone}</span>}
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-xs font-semibold uppercase text-muted-foreground">Item</p>
                <p className="mt-1 font-medium">{selected.productNameSnapshot}</p>
                <p className="text-sm text-muted-foreground">Qty: {selected.qty}</p>
                {selected.customizationSnapshot && (
                  <p className="mt-1 text-xs text-primary">
                    {(() => { try { return JSON.stringify(JSON.parse(selected.customizationSnapshot)) } catch { return selected.customizationSnapshot } })()}
                  </p>
                )}
              </div>
              <div className="flex justify-between text-sm">
                <span>Pedido total: <strong>R$ {selected.total.toFixed(2)}</strong></span>
                <span>Prazo est: ~{selected.estimatedHours}h</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
