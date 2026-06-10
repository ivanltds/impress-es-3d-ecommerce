'use client'

// ─── M04: Leads Kanban — Funil de Atendimento ───
import { useState, useEffect, useCallback } from 'react'
import { X, User, Phone, Calendar, MessageSquare, DollarSign, ArrowRight, Link2, ShoppingCart, CheckCircle, XCircle } from 'lucide-react'

type LeadStatus = 'novo' | 'em-atendimento' | 'aguardando-pagamento' | 'convertido' | 'perdido'

interface Lead {
  id: string
  name: string
  phone?: string
  email?: string
  source: string
  interestCollection?: string
  message: string
  status: LeadStatus
  createdAt: string
  orderId?: string
  paymentLink?: string
  notes?: string
}

const COLUMNS: { key: LeadStatus; label: string; color: string; icon: typeof User }[] = [
  { key: 'novo', label: 'Novos', color: 'bg-blue-50 border-blue-200', icon: User },
  { key: 'em-atendimento', label: 'Em Atendimento', color: 'bg-amber-50 border-amber-200', icon: MessageSquare },
  { key: 'aguardando-pagamento', label: 'Aguardando Pgto', color: 'bg-purple-50 border-purple-200', icon: DollarSign },
  { key: 'convertido', label: 'Convertido', color: 'bg-green-50 border-green-200', icon: CheckCircle },
  { key: 'perdido', label: 'Perdido', color: 'bg-gray-50 border-gray-200', icon: XCircle },
]

const COLLECTION_NAMES: Record<string, string> = {
  gamer: 'Gamer Energy', anime: 'Anime Pop', home: 'Casa & Utilidades', gifts: 'Presentes', auto: 'Auto Vintage',
}

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [selected, setSelected] = useState<Lead | null>(null)
  const [dragOver, setDragOver] = useState<LeadStatus | null>(null)
  const [orderForm, setOrderForm] = useState<{ leadId: string; name: string; price: number; description: string } | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem('leads')
    if (stored) setLeads(JSON.parse(stored))
  }, [])

  const updateLeads = useCallback((updated: Lead[]) => {
    setLeads(updated)
    localStorage.setItem('leads', JSON.stringify(updated))
  }, [])

  function moveLead(leadId: string, toStatus: LeadStatus) {
    const updated = leads.map((l) =>
      l.id === leadId ? { ...l, status: toStatus, notes: l.notes || '' } : l
    )
    updateLeads(updated)
  }

  function handleDragStart(e: React.DragEvent, leadId: string) {
    e.dataTransfer.setData('text/plain', leadId)
    const el = e.currentTarget as HTMLElement
    el.style.opacity = '0.5'
    el.addEventListener('dragend', () => { el.style.opacity = '1' }, { once: true })
  }

  function handleDrop(e: React.DragEvent, status: LeadStatus) {
    e.preventDefault()
    setDragOver(null)
    const leadId = e.dataTransfer.getData('text/plain')
    if (leadId) moveLead(leadId, status)
  }

  function createOrder(lead: Lead) {
    const orderNumber = `3DP-${Math.floor(Math.random() * 99999).toString().padStart(5, '0')}`
    const paymentLink = `${window.location.origin}/checkout?lead=${lead.id}&order=${orderNumber}`
    const updated = leads.map((l) =>
      l.id === lead.id
        ? { ...l, status: 'aguardando-pagamento' as LeadStatus, orderId: orderNumber, paymentLink, notes: `Pedido ${orderNumber} criado em ${new Date().toLocaleString('pt-BR')}` }
        : l
    )
    updateLeads(updated)

    // Also add to production kanban
    const prodItems = JSON.parse(localStorage.getItem('kanban-items') || '[]')
    prodItems.push({
      id: `prod-${Date.now()}`,
      orderNumber,
      customerName: lead.name,
      customerPhone: lead.phone,
      productNameSnapshot: orderForm?.name || lead.message.slice(0, 50),
      qty: 1,
      customizationSnapshot: JSON.stringify({ descricao: lead.message, colecao: lead.interestCollection }),
      productionStatus: 'pending',
      total: orderForm?.price || 0,
      estimatedHours: 3,
      address: '',
    })
    localStorage.setItem('kanban-items', JSON.stringify(prodItems))
    setOrderForm(null)
  }

  function markLost(lead: Lead) {
    const reason = prompt('Motivo da perda:')
    if (!reason) return
    const updated = leads.map((l) =>
      l.id === lead.id ? { ...l, status: 'perdido' as LeadStatus, notes: `Perdido: ${reason}` } : l
    )
    updateLeads(updated)
  }

  // Seed demo leads if empty
  useEffect(() => {
    const stored = localStorage.getItem('leads')
    if (!stored || JSON.parse(stored).length === 0) {
      const demo: Lead[] = [
        { id: '1', name: 'João Silva', phone: '(11) 99999-0001', source: 'instagram', interestCollection: 'gamer', message: 'Quero um porta-lata neon personalizado com meu nome "JV" e cor verde limão. Preciso para um evento dia 20.', status: 'novo', createdAt: new Date(Date.now() - 3600000).toISOString() },
        { id: '2', name: 'Maria Souza', phone: '(11) 98888-0002', source: 'whatsapp', interestCollection: 'gifts', message: 'Gostaria de 3 chaveiros com nomes diferentes para presentear minhas amigas. Cada um com uma cor.', status: 'em-atendimento', createdAt: new Date(Date.now() - 7200000).toISOString() },
      ]
      setLeads(demo)
      localStorage.setItem('leads', JSON.stringify(demo))
    }
  }, [])

  const totalLeads = leads.length

  return (
    <div className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold">Leads</h1>
          <p className="text-sm text-muted-foreground">{totalLeads} lead{totalLeads !== 1 ? 's' : ''} no funil</p>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="mt-6 grid grid-cols-5 gap-4 overflow-x-auto" data-testid="leads-table">
        {COLUMNS.map((col) => {
          const colItems = leads.filter((l) => l.status === col.key)
          return (
            <div
              key={col.key}
              className={`rounded-xl border-2 p-3 min-h-[400px] ${col.color} ${dragOver === col.key ? 'border-primary' : ''}`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(col.key) }}
              onDragLeave={() => setDragOver(null)}
              onDrop={(e) => handleDrop(e, col.key)}
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{col.label}</span>
                <span className="rounded-full bg-background px-2 py-0.5 text-xs font-bold">{colItems.length}</span>
              </div>
              {colItems.map((lead) => (
                <div
                  key={lead.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, lead.id)}
                  onClick={() => setSelected(lead)}
                  className="mb-2 cursor-pointer rounded-lg border bg-card p-3 text-sm shadow-sm transition-all hover:shadow-md"
                >
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

      {/* Expanded Lead Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setSelected(null)}>
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-card p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-xl font-bold">{selected.name}</h2>
              <button onClick={() => setSelected(null)} className="rounded-lg p-2 hover:bg-muted"><X className="h-5 w-5" /></button>
            </div>
            <div className="mt-4 space-y-4">
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{selected.phone || selected.email}</span>
                <span className="text-xs text-muted-foreground">via {selected.source}</span>
              </div>
              <div className="rounded-lg bg-muted/50 p-4">
                <p className="text-xs font-semibold uppercase text-muted-foreground">Mensagem</p>
                <p className="mt-2 text-sm leading-relaxed">{selected.message}</p>
              </div>
              {selected.interestCollection && (
                <p className="text-sm"><span className="text-muted-foreground">Coleção:</span> {COLLECTION_NAMES[selected.interestCollection] || selected.interestCollection}</p>
              )}
              {selected.paymentLink && (
                <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                  <p className="text-xs font-semibold text-green-800">Link de Pagamento</p>
                  <div className="mt-2 flex items-center gap-2">
                    <input value={selected.paymentLink} readOnly className="flex-1 rounded-lg border bg-white px-3 py-1.5 text-xs" />
                    <button onClick={() => navigator.clipboard.writeText(selected.paymentLink!)} className="rounded-lg bg-green-600 p-2 text-white"><Link2 className="h-4 w-4" /></button>
                  </div>
                </div>
              )}
              {selected.notes && <p className="text-sm text-muted-foreground">{selected.notes}</p>}

              {/* Actions */}
              <div className="flex flex-wrap gap-2 border-t pt-4">
                {selected.status === 'novo' || selected.status === 'em-atendimento' ? (
                  <>
                    <button
                      onClick={() => {
                        setOrderForm({ leadId: selected.id, name: selected.message.slice(0, 50), price: 49.9, description: selected.message })
                        moveLead(selected.id, 'em-atendimento')
                      }}
                      className="flex items-center gap-1 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground"
                    >
                      <ShoppingCart className="h-3.5 w-3.5" /> Criar Pedido
                    </button>
                    <a
                      href={`https://wa.me/${selected.phone?.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 rounded-lg bg-green-600 px-4 py-2 text-xs font-semibold text-white"
                    >
                      <Phone className="h-3.5 w-3.5" /> WhatsApp
                    </a>
                    <button
                      onClick={() => markLost(selected)}
                      className="flex items-center gap-1 rounded-lg border px-4 py-2 text-xs text-muted-foreground hover:bg-muted"
                    >
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

      {/* Order Creation Form Modal */}
      {orderForm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50" onClick={() => setOrderForm(null)}>
          <div className="w-full max-w-sm rounded-2xl bg-card p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-heading text-lg font-bold">Criar Pedido</h3>
            <p className="mt-1 text-sm text-muted-foreground">Para: {orderForm.name}</p>
            <div className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-medium">Nome do Produto</label>
                <input value={orderForm.name} onChange={(e) => setOrderForm({ ...orderForm, name: e.target.value })} className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium">Preço (R$)</label>
                <input type="number" step="0.01" value={orderForm.price} onChange={(e) => setOrderForm({ ...orderForm, price: parseFloat(e.target.value) || 0 })} className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium">Descrição</label>
                <textarea value={orderForm.description} onChange={(e) => setOrderForm({ ...orderForm, description: e.target.value })} rows={2} className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" />
              </div>
              <div className="flex gap-2 pt-2">
                <button onClick={() => createOrder(leads.find((l) => l.id === orderForm.leadId)!)} className="flex-1 rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground">
                  <DollarSign className="mr-1 inline h-4 w-4" /> Gerar Link de Pgto
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
