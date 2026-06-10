'use client'

// ─── M04: Leads Kanban (DB-persisted) ───
import { useState, useEffect, useCallback } from 'react'
import { X, Phone, Calendar, MessageSquare, DollarSign, ShoppingCart, CheckCircle, XCircle, Link2, User } from 'lucide-react'

type LeadStatus = 'novo' | 'em-atendimento' | 'aguardando-pagamento' | 'convertido' | 'perdido'

interface Lead {
  id: string; name: string; phone?: string; email?: string; source: string
  interestCollection?: string; message: string; status: LeadStatus
  createdAt: string; orderId?: string; paymentLink?: string; notes?: string
}

const COLUMNS: { key: LeadStatus; label: string; color: string }[] = [
  { key: 'novo', label: 'Novos', color: 'bg-blue-50 border-blue-200' },
  { key: 'em-atendimento', label: 'Em Atendimento', color: 'bg-amber-50 border-amber-200' },
  { key: 'aguardando-pagamento', label: 'Aguardando Pgto', color: 'bg-purple-50 border-purple-200' },
  { key: 'convertido', label: 'Convertido', color: 'bg-green-50 border-green-200' },
  { key: 'perdido', label: 'Perdido', color: 'bg-gray-50 border-gray-200' },
]

const COLLECTION_NAMES: Record<string, string> = { gamer: 'Gamer Energy', anime: 'Anime Pop', home: 'Casa & Utilidades', gifts: 'Presentes', auto: 'Auto Vintage' }

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [selected, setSelected] = useState<Lead | null>(null)
  const [dragOver, setDragOver] = useState<LeadStatus | null>(null)
  const [orderForm, setOrderForm] = useState<{ leadId: string; name: string; price: number; description: string; cep: string; street: string; number: string; district: string; city: string; paymentMethod: string } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/leads').then((r) => r.json()).then((data) => { setLeads(data); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  async function moveLead(leadId: string, toStatus: LeadStatus) {
    setLeads((prev) => prev.map((l) => (l.id === leadId ? { ...l, status: toStatus } : l)))
    await fetch('/api/admin/leads', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: leadId, status: toStatus }),
    })
  }

  function handleDragStart(e: React.DragEvent, leadId: string) {
    e.dataTransfer.setData('text/plain', leadId)
    const el = e.currentTarget as HTMLElement; el.style.opacity = '0.5'
    el.addEventListener('dragend', () => { el.style.opacity = '1' }, { once: true })
  }

  function handleDrop(e: React.DragEvent, status: LeadStatus) {
    e.preventDefault(); setDragOver(null)
    const leadId = e.dataTransfer.getData('text/plain')
    if (!leadId) return
    if (status === 'convertido') {
      // Open order form modal instead of just moving
      const lead = leads.find((l) => l.id === leadId)
      if (lead) {
        moveLead(leadId, 'em-atendimento')
        setOrderForm({ leadId: lead.id, name: lead.message.slice(0, 50), price: 49.9, description: lead.message, cep: '', street: '', number: '', district: '', city: '', paymentMethod: 'stripe' })
        setSelected(lead)
      }
    } else {
      moveLead(leadId, status)
    }
  }

  async function createOrder(lead: Lead) {
    if (!orderForm) return
    const orderNumber = `3DP-${Math.floor(Math.random() * 99999).toString().padStart(5, '0')}`
    // Create real order in DB with full address
    await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: [{ productId: 'lead', name: orderForm.name, qty: 1, price: orderForm.price, sku: 'custom' }],
        shippingCost: 0,
        paymentMethod: orderForm.paymentMethod || 'stripe',
        cep: orderForm.cep, street: orderForm.street, number: orderForm.number,
        district: orderForm.district, city: orderForm.city, state: 'SP',
      }),
    })
    const paymentLink = `${window.location.origin}/checkout?lead=${lead.id}&order=${orderNumber}`
    await fetch('/api/admin/leads', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: lead.id, status: 'convertido', orderId: orderNumber, paymentLink }),
    })
    setLeads((prev) => prev.map((l) => (l.id === lead.id ? { ...l, status: 'convertido', orderId: orderNumber, paymentLink } : l)))
    setOrderForm(null)
    // Refresh production and orders
    window.dispatchEvent(new Event('cart-updated'))
  }

  function markLost(lead: Lead) {
    const reason = prompt('Motivo da perda:')
    if (!reason) return
    moveLead(lead.id, 'perdido')
    fetch('/api/admin/leads', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: lead.id, notes: `Perdido: ${reason}` }) })
  }

  if (loading) return <div className="p-6">Carregando leads...</div>
  const totalLeads = leads.length

  return (
    <div className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold">Leads</h1>
          <p className="text-sm text-muted-foreground">{totalLeads} lead{totalLeads !== 1 ? 's' : ''} no funil</p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-5 gap-4 overflow-x-auto" data-testid="leads-table">
        {COLUMNS.map((col) => {
          const colItems = leads.filter((l) => l.status === col.key)
          return (
            <div key={col.key} className={`rounded-xl border-2 p-3 min-h-[400px] ${col.color} ${dragOver === col.key ? 'border-primary' : ''}`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(col.key) }} onDragLeave={() => setDragOver(null)} onDrop={(e) => handleDrop(e, col.key)}>
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{col.label}</span>
                <span className="rounded-full bg-background px-2 py-0.5 text-xs font-bold">{colItems.length}</span>
              </div>
              {colItems.map((lead) => (
                <div key={lead.id} draggable onDragStart={(e) => handleDragStart(e, lead.id)} onClick={() => setSelected(lead)}
                  className="mb-2 cursor-pointer rounded-lg border bg-card p-3 text-sm shadow-sm transition-all hover:shadow-md">
                  <p className="font-semibold">{lead.name}</p>
                  <p className="mt-1 truncate text-xs text-muted-foreground">{lead.message}</p>
                  <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {new Date(lead.createdAt).toLocaleDateString('pt-BR')}</span>
                    {lead.interestCollection && <span>{COLLECTION_NAMES[lead.interestCollection] || lead.interestCollection}</span>}
                  </div>
                </div>
              ))}
            </div>
          )
        })}
      </div>

      {/* Expanded Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setSelected(null)}>
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-card p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-xl font-bold">{selected.name}</h2>
              <button onClick={() => setSelected(null)} className="rounded-lg p-2 hover:bg-muted"><X className="h-5 w-5" /></button>
            </div>
            <div className="mt-4 space-y-4">
              <div className="flex items-center gap-2 text-sm"><Phone className="h-4 w-4 text-muted-foreground" /><span>{selected.phone || selected.email}</span><span className="text-xs text-muted-foreground">via {selected.source}</span></div>
              <div className="rounded-lg bg-muted/50 p-4"><p className="text-xs font-semibold uppercase text-muted-foreground">Mensagem</p><p className="mt-2 text-sm leading-relaxed">{selected.message}</p></div>
              {selected.interestCollection && <p className="text-sm"><span className="text-muted-foreground">Coleção:</span> {COLLECTION_NAMES[selected.interestCollection] || selected.interestCollection}</p>}
              {selected.paymentLink && (
                <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                  <p className="text-xs font-semibold text-green-800">Link de Pagamento</p>
                  <div className="mt-2 flex items-center gap-2">
                    <input value={selected.paymentLink} readOnly className="flex-1 rounded-lg border bg-white px-3 py-1.5 text-xs" />
                    <button onClick={() => navigator.clipboard.writeText(selected.paymentLink!)} className="rounded-lg bg-green-600 p-2 text-white"><Link2 className="h-4 w-4" /></button>
                  </div>
                </div>
              )}
              <div className="flex flex-wrap gap-2 border-t pt-4">
                {selected.status === 'novo' || selected.status === 'em-atendimento' ? (
                  <>
                    <button onClick={() => { setOrderForm({ leadId: selected.id, name: selected.message.slice(0, 50), price: 49.9, description: selected.message, cep: '', street: '', number: '', district: '', city: '', paymentMethod: 'stripe' }); moveLead(selected.id, 'em-atendimento') }}
                      className="flex items-center gap-1 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground">
                      <ShoppingCart className="h-3.5 w-3.5" /> Criar Pedido
                    </button>
                    <a href={`https://wa.me/${selected.phone?.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1 rounded-lg bg-green-600 px-4 py-2 text-xs font-semibold text-white">
                      <Phone className="h-3.5 w-3.5" /> WhatsApp
                    </a>
                    <button onClick={() => markLost(selected)} className="flex items-center gap-1 rounded-lg border px-4 py-2 text-xs text-muted-foreground hover:bg-muted">
                      <XCircle className="h-3.5 w-3.5" /> Perdido
                    </button>
                  </>
                ) : null}
                {selected.status === 'aguardando-pagamento' && (
                  <button onClick={() => moveLead(selected.id, 'convertido')} className="flex items-center gap-1 rounded-lg bg-green-600 px-4 py-2 text-xs font-semibold text-white">
                    <CheckCircle className="h-3.5 w-3.5" /> Marcar Pago
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Order Form Modal */}
      {orderForm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50" onClick={() => setOrderForm(null)}>
          <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-card p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-heading text-lg font-bold">Registrar Compra</h3>
            <div className="mt-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs font-medium">Produto *</label><input value={orderForm.name} onChange={(e) => setOrderForm({ ...orderForm, name: e.target.value })} className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" /></div>
                <div><label className="block text-xs font-medium">Preço (R$) *</label><input type="number" step="0.01" value={orderForm.price} onChange={(e) => setOrderForm({ ...orderForm, price: parseFloat(e.target.value) || 0 })} className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" /></div>
              </div>
              <div><label className="block text-xs font-medium">Descrição</label><textarea value={orderForm.description} onChange={(e) => setOrderForm({ ...orderForm, description: e.target.value })} rows={2} className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" /></div>
              <div className="border-t pt-3">
                <p className="text-xs font-semibold uppercase text-muted-foreground mb-2">Endereço de Entrega</p>
                <div className="grid grid-cols-2 gap-2">
                  <div><label className="block text-xs text-muted-foreground">CEP</label><input value={orderForm.cep} onChange={(e) => setOrderForm({ ...orderForm, cep: e.target.value })} className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" /></div>
                  <div><label className="block text-xs text-muted-foreground">Nº</label><input value={orderForm.number} onChange={(e) => setOrderForm({ ...orderForm, number: e.target.value })} className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" /></div>
                </div>
                <div className="mt-2"><label className="block text-xs text-muted-foreground">Rua</label><input value={orderForm.street} onChange={(e) => setOrderForm({ ...orderForm, street: e.target.value })} className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" /></div>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <div><label className="block text-xs text-muted-foreground">Bairro</label><input value={orderForm.district} onChange={(e) => setOrderForm({ ...orderForm, district: e.target.value })} className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" /></div>
                  <div><label className="block text-xs text-muted-foreground">Cidade</label><input value={orderForm.city} onChange={(e) => setOrderForm({ ...orderForm, city: e.target.value })} className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" /></div>
                </div>
              </div>
              <div className="border-t pt-3">
                <p className="text-xs font-semibold uppercase text-muted-foreground mb-2">Pagamento</p>
                <select value={orderForm.paymentMethod} onChange={(e) => setOrderForm({ ...orderForm, paymentMethod: e.target.value })} className="w-full rounded-lg border px-3 py-2 text-sm">
                  <option value="stripe">Cartão de Crédito</option>
                  <option value="mercadopago">Pix</option>
                </select>
              </div>
              <div className="flex gap-2 pt-2">
                <button onClick={() => createOrder(leads.find((l) => l.id === orderForm.leadId)!)} className="flex-1 rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground">
                  <DollarSign className="mr-1 inline h-4 w-4" /> Registrar Compra
                </button>
                <button onClick={() => setOrderForm(null)} className="rounded-lg border px-4 py-2.5 text-sm">Cancelar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
