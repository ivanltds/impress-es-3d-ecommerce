'use client'

// ─── M04: Production Kanban Board ───
import { useState, useEffect, useCallback } from 'react'
import { X, Clock, User, MapPin, Calendar } from 'lucide-react'

type Status = 'aguardando' | 'em-producao' | 'acabamento' | 'embalado' | 'enviado'

interface OrderItem {
  id: string
  productNameSnapshot: string
  qty: number
  customizationSnapshot?: string
  productionStatus: string
  productionNotes?: string
}

interface KanbanItem {
  id: string
  orderNumber: string
  customerName: string
  customerPhone?: string
  items: OrderItem[]
  status: Status
  address?: string
  total: number
  estimatedHours: number
  timeInColumn: string
  history: { from: string; to: string; at: string }[]
}

const COLUMNS: { key: Status; label: string; color: string }[] = [
  { key: 'aguardando', label: 'Aguardando', color: 'bg-amber-50 border-amber-200' },
  { key: 'em-producao', label: 'Em Produção', color: 'bg-blue-50 border-blue-200' },
  { key: 'acabamento', label: 'Acabamento', color: 'bg-purple-50 border-purple-200' },
  { key: 'embalado', label: 'Embalado', color: 'bg-green-50 border-green-200' },
  { key: 'enviado', label: 'Enviado', color: 'bg-gray-50 border-gray-200' },
]

export default function ProducaoPage() {
  const [items, setItems] = useState<KanbanItem[]>([])
  const [selected, setSelected] = useState<KanbanItem | null>(null)
  const [dragOver, setDragOver] = useState<Status | null>(null)

  useEffect(() => {
    // Load from localStorage for demo
    const stored = localStorage.getItem('kanban-items')
    if (stored) {
      setItems(JSON.parse(stored))
    } else {
      // Seed demo data
      const demo: KanbanItem[] = [
        { id: '1', orderNumber: '3DP-00123', customerName: 'João Silva', customerPhone: '(11) 99999-0001', items: [{ id: 'i1', productNameSnapshot: 'Porta-lata Neon Gamer', qty: 1, customizationSnapshot: '{"Cor":"Verde Neon","Texto":"JV"}', productionStatus: 'aguardando' }], status: 'aguardando', address: 'Rua A, 123 - Osasco/SP', total: 49.9, estimatedHours: 2, timeInColumn: '2h', history: [{ from: 'pago', to: 'aguardando', at: '2026-06-10T10:00' }] },
        { id: '2', orderNumber: '3DP-00124', customerName: 'Maria Souza', customerPhone: '(11) 98888-0002', items: [{ id: 'i2', productNameSnapshot: 'Chaveiro Personalizado', qty: 3, customizationSnapshot: '{"Nome":"Maria"}', productionStatus: 'em-producao' }], status: 'em-producao', address: 'Rua B, 456 - São Paulo/SP', total: 59.7, estimatedHours: 3, timeInColumn: '1h', history: [{ from: 'aguardando', to: 'em-producao', at: '2026-06-10T11:00' }] },
        { id: '3', orderNumber: '3DP-00125', customerName: 'Pedro Costa', items: [{ id: 'i3', productNameSnapshot: 'Abajur Lithophane', qty: 1, customizationSnapshot: '', productionStatus: 'acabamento' }], status: 'acabamento', address: 'Rua C, 789 - Campinas/SP', total: 89.9, estimatedHours: 4, timeInColumn: '30min', history: [{ from: 'em-producao', to: 'acabamento', at: '2026-06-10T12:00' }] },
      ]
      setItems(demo)
      localStorage.setItem('kanban-items', JSON.stringify(demo))
    }
  }, [])

  const moveItem = useCallback((itemId: string, toStatus: Status) => {
    setItems((prev) => {
      const updated = prev.map((i) => {
        if (i.id !== itemId) return i
        return {
          ...i,
          status: toStatus,
          timeInColumn: 'agora',
          history: [...i.history, { from: i.status, to: toStatus, at: new Date().toISOString() }],
        }
      })
      localStorage.setItem('kanban-items', JSON.stringify(updated))
      return updated
    })
  }, [])

  function handleDragStart(e: React.DragEvent, itemId: string) {
    e.dataTransfer.setData('text/plain', itemId)
    e.dataTransfer.effectAllowed = 'move'
    // Prevent the card from becoming transparent while dragging
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

  return (
    <div className="p-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold">Produção</h1>
        <span className="text-sm text-muted-foreground">{items.length} ite{items.length !== 1 ? 'ns' : 'm'} na fila</span>
      </div>

      {/* Kanban Board */}
      <div className="mt-6 grid grid-cols-5 gap-4 overflow-x-auto" data-testid="kanban-board">
        {COLUMNS.map((col) => {
          const colItems = items.filter((i) => i.status === col.key)
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
                  <p className="font-semibold">{item.orderNumber}</p>
                  <p className="text-xs text-muted-foreground">{item.items[0]?.productNameSnapshot}</p>
                  <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {item.estimatedHours}h</span>
                    <span>{item.timeInColumn}</span>
                  </div>
                </div>
              ))}
            </div>
          )
        })}
      </div>

      {/* Expanded Card Modal */}
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
                <p className="text-xs font-semibold uppercase text-muted-foreground">Itens</p>
                {selected.items.map((item) => (
                  <div key={item.id} className="mt-2 flex justify-between text-sm">
                    <span>{item.productNameSnapshot} x{item.qty}</span>
                    {item.customizationSnapshot && <span className="text-xs text-muted-foreground">{JSON.parse(item.customizationSnapshot).Cor || JSON.parse(item.customizationSnapshot).Nome || ''}</span>}
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{selected.address || '—'}</span>
              </div>

              <div className="flex justify-between text-sm">
                <span>Total: <strong>R$ {selected.total.toFixed(2)}</strong></span>
                <span>Prazo: ~{selected.estimatedHours}h</span>
              </div>

              {/* Timeline */}
              <div className="border-t pt-4" data-testid="status-timeline">
                <p className="text-xs font-semibold uppercase text-muted-foreground">Histórico</p>
                <div className="mt-3 space-y-3">
                  {selected.history.map((h, idx) => (
                    <div key={idx} className="flex gap-3 text-sm">
                      <div className="flex flex-col items-center">
                        <div className="h-2.5 w-2.5 rounded-full bg-primary" />
                        {idx < selected.history.length - 1 && <div className="w-0.5 flex-1 bg-muted" />}
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">{new Date(h.at).toLocaleString('pt-BR')}</p>
                        <p>{h.from} → <span className="font-medium">{h.to}</span></p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
