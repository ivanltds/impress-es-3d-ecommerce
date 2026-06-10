'use client'

import { useState } from 'react'
import { Plus, MapPin, Trash2 } from 'lucide-react'

interface Address { id: string; cep: string; street: string; number: string; district: string; city: string; state: string; isDefault: boolean }

export default function EnderecosPage() {
  const [addresses, setAddresses] = useState<Address[]>(() => {
    if (typeof window === 'undefined') return []
    const stored = localStorage.getItem('addresses')
    return stored ? JSON.parse(stored) : []
  })
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ cep: '', street: '', number: '', district: '', city: '', state: 'SP' })

  function save() {
    const newAddr: Address = { ...form, id: Date.now().toString(), isDefault: addresses.length === 0 }
    const updated = [...addresses, newAddr]
    setAddresses(updated)
    localStorage.setItem('addresses', JSON.stringify(updated))
    setShowForm(false)
    setForm({ cep: '', street: '', number: '', district: '', city: '', state: 'SP' })
  }

  function remove(id: string) {
    const updated = addresses.filter((a) => a.id !== id)
    setAddresses(updated)
    localStorage.setItem('addresses', JSON.stringify(updated))
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-12">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-3xl font-bold">Endereços</h1>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-1 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground" data-testid="add-address">
          <Plus className="h-4 w-4" /> Novo
        </button>
      </div>

      {showForm && (
        <div className="mt-6 space-y-4 rounded-xl border p-6" data-testid="address-form">
          <input placeholder="CEP" value={form.cep} onChange={(e) => setForm({ ...form, cep: e.target.value })} className="w-full rounded-lg border px-4 py-2" />
          <input placeholder="Rua" value={form.street} onChange={(e) => setForm({ ...form, street: e.target.value })} className="w-full rounded-lg border px-4 py-2" />
          <div className="grid grid-cols-3 gap-4">
            <input placeholder="Nº" value={form.number} onChange={(e) => setForm({ ...form, number: e.target.value })} className="rounded-lg border px-4 py-2" />
            <input placeholder="Bairro" value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} className="rounded-lg border px-4 py-2" />
            <input placeholder="Cidade" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="rounded-lg border px-4 py-2" />
          </div>
          <button onClick={save} className="rounded-lg bg-primary px-6 py-2 text-sm font-semibold text-primary-foreground" data-testid="save-address">Salvar</button>
        </div>
      )}

      <div className="mt-6 space-y-3" data-testid="addresses-list">
        {addresses.length === 0 && <p className="text-muted-foreground">Nenhum endereço cadastrado.</p>}
        {addresses.map((addr) => (
          <div key={addr.id} className="flex items-start gap-3 rounded-xl border p-4" data-testid="address-card">
            <MapPin className="mt-0.5 h-5 w-5 text-primary" />
            <div className="flex-1">
              <p className="font-semibold">{addr.street}, {addr.number}</p>
              <p className="text-sm text-muted-foreground">{addr.district} — {addr.city}/{addr.state} · {addr.cep}</p>
            </div>
            <button onClick={() => remove(addr.id)} className="rounded-lg p-2 text-muted-foreground hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
          </div>
        ))}
      </div>
    </div>
  )
}
