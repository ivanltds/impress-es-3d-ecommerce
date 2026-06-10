'use client'

import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, Check, X, MapPin, ToggleLeft, ToggleRight } from 'lucide-react'

interface StoreAddress {
  id: string
  name: string
  street: string
  number: string
  complement?: string
  neighborhood?: string
  city: string
  state: string
  cep: string
  isActive: boolean
  createdAt: string
}

const EMPTY_FORM = {
  name: '', street: '', number: '', complement: '', neighborhood: '', city: '', state: '', cep: '',
}

function formatCepDisplay(cep: string) {
  const d = cep.replace(/\D/g, '')
  if (d.length >= 8) return `${d.slice(0,5)}-${d.slice(5,8)}`
  return cep
}

export default function EnderecosPage() {
  const [addresses, setAddresses] = useState<StoreAddress[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function load() {
    try {
      const res = await fetch('/api/admin/store-addresses')
      const data = await res.json()
      setAddresses(Array.isArray(data) ? data : [])
    } catch {}
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function openNew() {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setError('')
    setShowForm(true)
  }

  function openEdit(addr: StoreAddress) {
    setEditingId(addr.id)
    setForm({
      name: addr.name, street: addr.street, number: addr.number,
      complement: addr.complement || '', neighborhood: addr.neighborhood || '',
      city: addr.city, state: addr.state, cep: addr.cep,
    })
    setError('')
    setShowForm(true)
  }

  function cancel() {
    setShowForm(false)
    setEditingId(null)
    setForm(EMPTY_FORM)
    setError('')
  }

  async function save() {
    if (!form.name || !form.street || !form.number || !form.city || !form.state || !form.cep) {
      setError('Preencha todos os campos obrigatórios.')
      return
    }
    setSaving(true)
    setError('')
    try {
      if (editingId) {
        const res = await fetch(`/api/admin/store-addresses/${editingId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        })
        if (!res.ok) throw new Error((await res.json()).error || 'Erro ao salvar')
      } else {
        const res = await fetch('/api/admin/store-addresses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        })
        if (!res.ok) throw new Error((await res.json()).error || 'Erro ao criar')
      }
      cancel()
      await load()
    } catch (e: any) {
      setError(e.message || 'Erro inesperado')
    }
    setSaving(false)
  }

  async function toggleActive(addr: StoreAddress) {
    await fetch(`/api/admin/store-addresses/${addr.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !addr.isActive }),
    })
    setAddresses((prev) => prev.map((a) => a.id === addr.id ? { ...a, isActive: !a.isActive } : a))
  }

  async function remove(id: string) {
    if (!confirm('Remover este endereço?')) return
    await fetch(`/api/admin/store-addresses/${id}`, { method: 'DELETE' })
    setAddresses((prev) => prev.filter((a) => a.id !== id))
  }

  const field = (key: keyof typeof EMPTY_FORM, label: string, required = false, placeholder = '', className = 'col-span-2') => (
    <div className={className}>
      <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <input
        value={form[key]}
        onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
        placeholder={placeholder}
        className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
      />
    </div>
  )

  if (loading) return <div className="p-6">Carregando...</div>

  return (
    <div className="p-6 max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading text-2xl font-bold">Endereços da Loja</h1>
          <p className="text-sm text-muted-foreground mt-1">Origens para cálculo de frete e geração de etiqueta</p>
        </div>
        {!showForm && (
          <button onClick={openNew} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90">
            <Plus className="h-4 w-4" /> Novo Endereço
          </button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <div className="mb-6 rounded-2xl border-2 border-primary/20 bg-primary/5 p-5">
          <h2 className="font-semibold mb-4 text-sm">{editingId ? 'Editar Endereço' : 'Novo Endereço'}</h2>
          <div className="grid grid-cols-2 gap-3">
            {field('name', 'Nome / Apelido', true, 'ex: Osasco SP')}
            {field('cep', 'CEP', true, '06110-000', 'col-span-1')}
            {field('state', 'Estado (UF)', true, 'SP', 'col-span-1')}
            {field('street', 'Rua', true, 'Av. Paulista')}
            {field('number', 'Número', true, '100', 'col-span-1')}
            {field('complement', 'Complemento', false, 'Apto 12', 'col-span-1')}
            {field('neighborhood', 'Bairro', false, 'Centro')}
            {field('city', 'Cidade', true, 'Osasco')}
          </div>
          {error && <p className="mt-3 text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
          <div className="flex gap-2 mt-4">
            <button onClick={save} disabled={saving} className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50">
              <Check className="h-4 w-4" /> {saving ? 'Salvando...' : 'Salvar'}
            </button>
            <button onClick={cancel} className="flex items-center gap-2 rounded-lg border px-4 py-2 text-sm">
              <X className="h-4 w-4" /> Cancelar
            </button>
          </div>
        </div>
      )}

      {/* List */}
      {addresses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <MapPin className="h-12 w-12 text-muted-foreground/20 mb-3" />
          <p className="text-muted-foreground">Nenhum endereço cadastrado.</p>
          <p className="text-xs text-muted-foreground mt-1">Adicione ao menos um para usar na geração de etiquetas.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {addresses.map((addr) => (
            <div key={addr.id} className={`rounded-xl border-2 p-4 transition-all ${addr.isActive ? 'border-green-200 bg-green-50/50' : 'border-border bg-muted/20'}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 min-w-0">
                  <MapPin className={`mt-0.5 h-4 w-4 shrink-0 ${addr.isActive ? 'text-green-600' : 'text-muted-foreground'}`} />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-sm">{addr.name}</p>
                      {addr.isActive && (
                        <span className="rounded-full bg-green-100 text-green-700 text-xs px-2 py-0.5 font-medium">Ativo</span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {addr.street}, {addr.number}{addr.complement ? ` — ${addr.complement}` : ''}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {addr.neighborhood ? `${addr.neighborhood} · ` : ''}{addr.city} / {addr.state} · CEP {formatCepDisplay(addr.cep)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => toggleActive(addr)}
                    title={addr.isActive ? 'Desativar' : 'Ativar'}
                    className={`rounded-lg p-2 transition-colors ${addr.isActive ? 'text-green-600 hover:bg-green-100' : 'text-muted-foreground hover:bg-muted'}`}
                  >
                    {addr.isActive ? <ToggleRight className="h-5 w-5" /> : <ToggleLeft className="h-5 w-5" />}
                  </button>
                  <button onClick={() => openEdit(addr)} className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground">
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button onClick={() => remove(addr.id)} className="rounded-lg p-2 text-muted-foreground hover:bg-red-50 hover:text-red-600">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
