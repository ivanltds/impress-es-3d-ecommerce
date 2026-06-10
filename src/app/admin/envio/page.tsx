'use client'

// ─── M04: Shipping Kanban ───
import { useState, useEffect, useCallback } from 'react'
import { X, Package, User, MapPin, Truck, CheckCircle, Clock } from 'lucide-react'

type ShippingStatus = 'posted' | 'in_transit' | 'delivered'

interface Shipment {
  id: string
  orderId: string
  orderNumber: string
  customerName: string
  address?: string
  trackingCode?: string
  status: ShippingStatus
  items: string
  total: number
  updatedAt: string
}

const COLUMNS: { key: ShippingStatus; label: string; color: string; icon: typeof Package }[] = [
  { key: 'posted', label: 'Postado', color: 'bg-blue-50 border-blue-200', icon: Truck },
  { key: 'in_transit', label: 'Em Trânsito', color: 'bg-purple-50 border-purple-200', icon: Clock },
  { key: 'delivered', label: 'Entregue', color: 'bg-green-50 border-green-200', icon: CheckCircle },
]

export default function EnvioPage() {
  const [shipments, setShipments] = useState<Shipment[]>([])
  const [selected, setSelected] = useState<Shipment | null>(null)
  const [dragOver, setDragOver] = useState<ShippingStatus | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/shipping')
      .then((r) => r.json())
      .then((data) => { setShipments(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const moveShipment = useCallback(async (id: string, toStatus: ShippingStatus) => {
    setShipments((prev) => prev.map((s) => (s.id === id ? { ...s, status: toStatus, updatedAt: new Date().toISOString() } : s)))
    await fetch('/api/admin/shipping', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: toStatus }),
    })
  }, [])

  function handleDragStart(e: React.DragEvent, id: string) {
    e.dataTransfer.setData('text/plain', id)
    const el = e.currentTarget as HTMLElement
    el.style.opacity = '0.5'
    el.addEventListener('dragend', () => { el.style.opacity = '1' }, { once: true })
  }

  if (loading) return <div className="p-6">Carregando envios...</div>

  return (
    <div className="p-6">
      <h1 className="font-heading text-2xl font-bold">Envio</h1>
      <div className="mt-6 grid grid-cols-3 gap-4" data-testid="shipping-board">
        {COLUMNS.map((col) => {
          const items = shipments.filter((s) => s.status === col.key)
          return (
            <div
              key={col.key}
              className={`rounded-xl border-2 p-3 min-h-[300px] ${col.color} ${dragOver === col.key ? 'border-primary' : ''}`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(col.key) }}
              onDragLeave={() => setDragOver(null)}
              onDrop={(e) => { handleDrop(e, col.key) }}
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{col.label}</span>
                <span className="rounded-full bg-background px-2 py-0.5 text-xs font-bold">{items.length}</span>
              </div>
              {items.map((s) => (
                <div key={s.id} draggable onDragStart={(e) => handleDragStart(e, s.id)} onClick={() => setSelected(s)} className="mb-2 cursor-pointer rounded-lg border bg-card p-3 text-sm shadow-sm hover:shadow-md">
                  <p className="font-semibold">{s.orderNumber}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1"><User className="h-3 w-3" /> {s.customerName}</p>
                  <p className="mt-1 text-xs text-muted-foreground truncate">{s.items}</p>
                  {s.trackingCode && <p className="mt-1 text-xs font-medium text-primary">📦 {s.trackingCode}</p>}
                </div>
              ))}
            </div>
          )
        })}
      </div>
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setSelected(null)}>
          <div className="max-h-[80vh] w-full max-w-md rounded-2xl bg-card p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-xl font-bold">{selected.orderNumber}</h2>
              <button onClick={() => setSelected(null)} className="rounded-lg p-2 hover:bg-muted"><X className="h-5 w-5" /></button>
            </div>
            <div className="mt-4 space-y-3">
              <p className="flex items-center gap-2 text-sm"><User className="h-4 w-4 text-muted-foreground" /> {selected.customerName}</p>
              {selected.address && <p className="flex items-center gap-2 text-sm"><MapPin className="h-4 w-4 text-muted-foreground" /> {selected.address}</p>}
              <p className="text-sm"><strong>Itens:</strong> {selected.items}</p>
              <p className="text-sm"><strong>Total:</strong> R$ {selected.total.toFixed(2)}</p>
              {selected.trackingCode && <p className="text-sm font-medium text-primary">Rastreio: {selected.trackingCode}</p>}
              {!selected.trackingCode && selected.status === 'posted' && (
                <input
                  placeholder="Código de rastreio"
                  onBlur={(e) => {
                    const code = e.target.value
                    if (code) {
                      setShipments((prev) => prev.map((s) => (s.id === selected.id ? { ...s, trackingCode: code } : s)))
                      fetch('/api/admin/shipping', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: selected.id, trackingCode: code }) })
                    }
                  }}
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )

  function handleDrop(e: React.DragEvent, status: ShippingStatus) {
    e.preventDefault()
    setDragOver(null)
    const id = e.dataTransfer.getData('text/plain')
    if (id) moveShipment(id, status)
  }
}
