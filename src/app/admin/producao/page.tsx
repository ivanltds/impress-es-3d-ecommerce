'use client'

import { useState, useEffect, useCallback } from 'react'
import { X, Clock, User, Package, MapPin, Truck, Info, ExternalLink } from 'lucide-react'

type Status = 'pending' | 'in_progress' | 'finishing' | 'packed' | 'shipped'

interface KanbanItem {
  id: string; orderId: string; orderNumber: string; customerName: string
  customerPhone?: string; productNameSnapshot: string; qty: number
  customizationSnapshot?: string; productionStatus: string; productionNotes?: string
  total: number; estimatedHours: number; cep?: string; trackingCode?: string
}

interface StoreAddress {
  id: string; name: string; street: string; number: string; city: string; state: string; cep: string; isActive: boolean
}

const COLUMNS: { key: Status; label: string; color: string }[] = [
  { key: 'pending', label: 'Aguardando', color: 'bg-amber-50 border-amber-200' },
  { key: 'in_progress', label: 'Em Produção', color: 'bg-blue-50 border-blue-200' },
  { key: 'finishing', label: 'Acabamento', color: 'bg-purple-50 border-purple-200' },
  { key: 'packed', label: 'Embalado', color: 'bg-green-50 border-green-200' },
  { key: 'shipped', label: 'Enviado p/ Entrega', color: 'bg-gray-50 border-gray-200' },
]

// ─── Tooltip de instrução de entrega ───
function ShippingTooltip({ tracking }: { tracking: string }) {
  const [open, setOpen] = useState(false)
  const isMock = tracking.startsWith('MOCK')
  return (
    <div className="relative inline-flex items-center gap-1">
      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-mono font-semibold ${isMock ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
        <Truck className="h-3 w-3" />
        {tracking}
        {isMock && <span className="ml-1 rounded bg-amber-200 px-1 text-[10px]">MOCK</span>}
      </span>
      <button
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onClick={(e) => { e.stopPropagation(); setOpen((v) => !v) }}
        className="rounded-full p-0.5 text-muted-foreground hover:text-foreground"
      >
        <Info className="h-3.5 w-3.5" />
      </button>
      {open && (
        <div className="absolute bottom-full left-0 z-50 mb-2 w-72 rounded-xl border bg-card p-4 shadow-xl text-xs leading-relaxed"
          onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
          <p className="font-bold text-sm mb-2 flex items-center gap-1.5">
            <Truck className="h-4 w-4 text-primary" /> O que fazer com esta etiqueta
          </p>
          {isMock ? (
            <p className="text-amber-700 bg-amber-50 rounded-lg p-2 mb-2">
              ⚠️ Etiqueta simulada (MOCK). Nenhum frete real foi comprado. Ative saldo na Melhor Envio para ir a produção.
            </p>
          ) : null}
          <ol className="space-y-1.5 text-muted-foreground list-none">
            <li className="flex gap-2"><span className="shrink-0 font-bold text-foreground">1.</span> Acesse <strong>melhorenvio.com.br</strong> → Meus Envios → localize este código de rastreio.</li>
            <li className="flex gap-2"><span className="shrink-0 font-bold text-foreground">2.</span> Imprima a etiqueta e cole na embalagem lacrada.</li>
            <li className="flex gap-2"><span className="shrink-0 font-bold text-foreground">3.</span> Poste na agência dos Correios ou transportadora indicada na etiqueta.</li>
            <li className="flex gap-2"><span className="shrink-0 font-bold text-foreground">4.</span> O cliente receberá o rastreio automaticamente pelo Melhor Envio.</li>
          </ol>
          <a
            href="https://melhorenvio.com.br/envios"
            target="_blank" rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="mt-3 flex items-center gap-1 text-primary font-semibold hover:underline"
          >
            <ExternalLink className="h-3 w-3" /> Abrir Melhor Envio
          </a>
        </div>
      )}
    </div>
  )
}

export default function ProducaoPage() {
  const [items, setItems] = useState<KanbanItem[]>([])
  const [selected, setSelected] = useState<KanbanItem | null>(null)
  const [dragOver, setDragOver] = useState<Status | null>(null)
  const [loading, setLoading] = useState(true)
  const [shippingForm, setShippingForm] = useState<KanbanItem | null>(null)
  const [shippingCep, setShippingCep] = useState('')
  const [shippingServices, setShippingServices] = useState<Array<{ id: number; name: string; price: number; days: number }>>([])
  const [selectedService, setSelectedService] = useState<number>(0)
  const [selectedServicePrice, setSelectedServicePrice] = useState<number>(0)
  const [purchasing, setPurchasing] = useState(false)
  const [servicesError, setServicesError] = useState('')
  const [storeAddresses, setStoreAddresses] = useState<StoreAddress[]>([])
  const [selectedAddressId, setSelectedAddressId] = useState<string>('')

  useEffect(() => {
    fetch('/api/admin/production')
      .then((r) => r.json())
      .then((data) => { setItems(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  async function fetchServices(cep: string, addressId: string) {
    if (!addressId) { setServicesError('Selecione um endereço de origem antes de calcular o frete.'); return }
    setServicesError(''); setShippingServices([])
    try {
      const res = await fetch(`/api/admin/shipping/purchase?cep=${cep.replace(/\D/g, '')}&addressId=${addressId}`)
      const data = await res.json()
      if (res.ok && Array.isArray(data) && data.length > 0) {
        setShippingServices(data)
        const cheapest = data.reduce((a: any, b: any) => (a.price < b.price ? a : b))
        setSelectedService(cheapest.id); setSelectedServicePrice(cheapest.price)
      } else {
        setServicesError(data.error || 'Nenhum serviço disponível. Verifique o token Melhor Envio na Vercel.')
      }
    } catch { setServicesError('Erro de conexão ao consultar frete') }
  }

  const moveItem = useCallback(async (itemId: string, toStatus: Status) => {
    if (toStatus === 'shipped') {
      const item = items.find((i) => i.id === itemId)
      if (item) {
        const addrRes = await fetch('/api/admin/store-addresses')
        const addrs: StoreAddress[] = await addrRes.json()
        const active = addrs.filter((a) => a.isActive)
        setStoreAddresses(active)
        const defaultAddr = active.length === 1 ? active[0].id : ''
        setSelectedAddressId(defaultAddr)
        setShippingForm(item); setShippingServices([]); setSelectedService(0); setServicesError('')
        const orderCep = (item as any).cep || ''
        setShippingCep(orderCep)
        if (orderCep && orderCep.length >= 5 && defaultAddr) fetchServices(orderCep, defaultAddr)
      }
      return
    }
    setItems((prev) => prev.map((i) => (i.id === itemId ? { ...i, productionStatus: toStatus } : i)))
    await fetch('/api/admin/production', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ itemId, status: toStatus }) })
  }, [items])

  function handleDrop(e: React.DragEvent, status: Status) {
    e.preventDefault(); setDragOver(null)
    const itemId = e.dataTransfer.getData('text/plain')
    if (itemId) moveItem(itemId, status)
  }

  async function confirmShipping() {
    if (!shippingForm || !selectedService || !shippingCep || !selectedAddressId) return
    setPurchasing(true)
    const itemId = shippingForm.id
    const res = await fetch('/api/admin/shipping/purchase', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId: shippingForm.orderId, cep: shippingCep, serviceId: String(selectedService), addressId: selectedAddressId }),
    })
    const data = await res.json()
    if (data.success) {
      setItems((prev) => prev.map((i) => (i.id === itemId ? { ...i, productionStatus: 'shipped', trackingCode: data.tracking } : i)))
      await fetch('/api/admin/production', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ itemId, status: 'shipped' }) })
    } else {
      setServicesError(data.error || 'Falha ao comprar etiqueta')
      setPurchasing(false); return
    }
    setShippingForm(null); setPurchasing(false)
  }

  function handleDragStart(e: React.DragEvent, itemId: string) {
    e.dataTransfer.setData('text/plain', itemId)
    e.dataTransfer.effectAllowed = 'move'
    const el = e.currentTarget as HTMLElement
    el.style.opacity = '0.6'
    el.addEventListener('dragend', () => { el.style.opacity = '1' }, { once: true })
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
            <div key={col.key} className={`rounded-xl border-2 p-3 min-h-[400px] ${col.color} ${dragOver === col.key ? 'border-primary' : ''}`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(col.key) }} onDragLeave={() => setDragOver(null)} onDrop={(e) => handleDrop(e, col.key)}>
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{col.label}</span>
                <span className="rounded-full bg-background px-2 py-0.5 text-xs font-bold">{colItems.length}</span>
              </div>
              {colItems.map((item) => (
                <div key={item.id} draggable onDragStart={(e) => handleDragStart(e, item.id)} onClick={() => setSelected(item)}
                  className="mb-2 cursor-pointer rounded-lg border bg-card p-3 text-sm shadow-sm transition-all hover:shadow-md" data-testid="kanban-card">
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
                  {/* Etiqueta de rastreio — visível só na coluna "Enviado" */}
                  {col.key === 'shipped' && item.trackingCode && (
                    <div className="mt-2 pt-2 border-t" onClick={(e) => e.stopPropagation()}>
                      <ShippingTooltip tracking={item.trackingCode} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )
        })}
      </div>

      {/* Shipping Modal */}
      {shippingForm && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50" onClick={() => setShippingForm(null)}>
          <div className="w-full max-w-md rounded-2xl bg-card p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="font-heading text-lg font-bold">Registrar Envio</h3>
              <button onClick={() => setShippingForm(null)} className="rounded-lg p-2 hover:bg-muted"><X className="h-5 w-5" /></button>
            </div>
            <div className="mt-4 space-y-3">
              <p className="text-sm"><strong>Pedido:</strong> {shippingForm.orderNumber}</p>
              <p className="text-sm"><strong>Cliente:</strong> {shippingForm.customerName}</p>
              <p className="text-sm"><strong>Produto:</strong> {shippingForm.productNameSnapshot} x{shippingForm.qty}</p>

              <div className="border-t pt-3 space-y-3">
                <div>
                  <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">
                    <MapPin className="inline h-3 w-3 mr-1" />Endereço de Origem
                  </label>
                  {storeAddresses.length === 0 ? (
                    <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2">
                      Nenhum endereço ativo. <a href="/admin/configuracoes/enderecos" className="underline font-semibold">Cadastrar agora →</a>
                    </p>
                  ) : (
                    <select value={selectedAddressId} onChange={(e) => { setSelectedAddressId(e.target.value); setShippingServices([]); setSelectedService(0); setServicesError('') }} className="w-full rounded-lg border px-3 py-2 text-sm">
                      <option value="">— selecione o endereço de origem —</option>
                      {storeAddresses.map((a) => (<option key={a.id} value={a.id}>{a.name} — {a.city}/{a.state} · CEP {a.cep}</option>))}
                    </select>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">CEP de Entrega</label>
                  <div className="flex gap-2">
                    <input value={shippingCep} onChange={(e) => setShippingCep(e.target.value)} placeholder="01001000" className="flex-1 rounded-lg border px-3 py-2 text-sm" />
                    <button type="button" onClick={() => { if (shippingCep && shippingCep.length >= 5 && selectedAddressId) fetchServices(shippingCep, selectedAddressId) }} disabled={!selectedAddressId || shippingCep.length < 5} className="rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground disabled:opacity-40">Calcular</button>
                  </div>
                </div>
              </div>

              {shippingServices.length > 0 && (
                <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                  <p className="text-xs font-semibold text-green-800 mb-1">Serviços disponíveis</p>
                  {shippingServices.map((s) => (
                    <label key={s.id} className={`flex items-center justify-between mt-2 p-2 rounded-lg cursor-pointer text-sm ${selectedService === s.id ? 'bg-white border border-primary' : ''}`}>
                      <div className="flex items-center gap-2">
                        <input type="radio" name="service" checked={selectedService === s.id} onChange={() => { setSelectedService(s.id); setSelectedServicePrice(s.price) }} />
                        <span>{s.name} — até {s.days} dias</span>
                      </div>
                      <span className="font-semibold">R$ {s.price.toFixed(2)}</span>
                    </label>
                  ))}
                </div>
              )}

              {servicesError && <p className="text-xs text-amber-600 bg-amber-50 rounded-lg p-3">{servicesError}</p>}

              <div className="flex gap-2 pt-3">
                <button onClick={confirmShipping} disabled={purchasing || !selectedService || !selectedAddressId} className="flex-1 rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50">
                  {purchasing ? 'Comprando etiqueta...' : selectedService > 0 ? `Comprar Etiqueta — R$ ${selectedServicePrice.toFixed(2)}` : 'Selecione um serviço'}
                </button>
                <button onClick={() => setShippingForm(null)} className="rounded-lg border px-4 py-2.5 text-sm">Cancelar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
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
                {selected.customizationSnapshot && <p className="mt-1 text-xs text-primary">{(() => { try { return JSON.stringify(JSON.parse(selected.customizationSnapshot)) } catch { return selected.customizationSnapshot } })()}</p>}
              </div>
              <div className="flex justify-between text-sm">
                <span>Pedido total: <strong>R$ {selected.total.toFixed(2)}</strong></span>
                <span>Prazo est: ~{selected.estimatedHours}h</span>
              </div>
              {selected.trackingCode && (
                <div className="rounded-lg border bg-muted/30 p-3">
                  <p className="text-xs font-semibold uppercase text-muted-foreground mb-2">Etiqueta de Envio</p>
                  <ShippingTooltip tracking={selected.trackingCode} />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
