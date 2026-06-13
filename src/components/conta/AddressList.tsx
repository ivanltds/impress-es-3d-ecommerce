'use client'

import { useState } from 'react'
import { MapPin, Trash2, Star } from 'lucide-react'
import { AddressForm } from '@/components/conta/AddressForm'

interface Address {
  id: string
  label: string
  recipientName: string
  cep: string
  street: string
  number: string
  complement: string | null
  district: string
  city: string
  state: string
  isDefault: boolean
}

interface AddressListProps {
  initialAddresses: Address[]
}

export function AddressList({ initialAddresses }: AddressListProps) {
  const [addresses, setAddresses] = useState<Address[]>(initialAddresses)
  const [showForm, setShowForm] = useState(false)

  async function handleRemove(id: string) {
    try {
      const res = await fetch(`/api/user/addresses/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setAddresses((prev) => prev.filter((a) => a.id !== id))
      }
    } catch {
      // silently fail — in production we'd show an error toast
    }
  }

  async function handleSetDefault(id: string) {
    try {
      const res = await fetch(`/api/user/addresses/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isDefault: true }),
      })
      if (res.ok) {
        // Optimistic update: set isDefault on all cards
        setAddresses((prev) =>
          prev.map((a) => ({ ...a, isDefault: a.id === id })),
        )
      }
    } catch {
      // silently fail
    }
  }

  function handleFormSuccess(newAddress: Address) {
    setAddresses((prev) => [...prev, newAddress])
    setShowForm(false)
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-3xl font-bold">Endereços</h1>
        <button
          data-testid="add-address"
          onClick={() => setShowForm(true)}
          className="flex items-center gap-1 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
        >
          + Novo
        </button>
      </div>

      {showForm && (
        <AddressForm
          onSuccess={handleFormSuccess}
          onCancel={() => setShowForm(false)}
        />
      )}

      {/* Addresses list (cenários 5.1, 5.2) */}
      <div data-testid="addresses-list" className="mt-6 space-y-3">
        {addresses.length === 0 && (
          <div data-testid="addresses-empty-state" className="py-8 text-center text-muted-foreground">
            Nenhum endereço cadastrado. Clique em &ldquo;Novo&rdquo; para adicionar.
          </div>
        )}

        {addresses.map((addr) => (
          <div
            key={addr.id}
            data-testid="address-card"
            className="flex items-start gap-3 rounded-xl border p-4"
          >
            <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <div className="flex-1 min-w-0">
              {addr.label && (
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-semibold text-muted-foreground">{addr.label}</p>
                  {/* Default badge (cenários 5.6, 5.7) */}
                  {addr.isDefault && (
                    <span
                      data-testid="address-default-badge"
                      className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary"
                    >
                      Padrão
                    </span>
                  )}
                </div>
              )}
              {!addr.label && addr.isDefault && (
                <span
                  data-testid="address-default-badge"
                  className="mb-1 inline-block rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary"
                >
                  Padrão
                </span>
              )}
              <p className="font-semibold">{addr.recipientName}</p>
              <p className="text-sm">
                {addr.street}, {addr.number}
                {addr.complement ? ` — ${addr.complement}` : ''}
              </p>
              <p className="text-sm text-muted-foreground">
                {addr.district} · {addr.city}/{addr.state} · {addr.cep}
              </p>
            </div>
            <div className="flex shrink-0 gap-1">
              {/* Set default button (cenário 5.6) */}
              {!addr.isDefault && (
                <button
                  data-testid={`set-default-address-${addr.id}`}
                  onClick={() => handleSetDefault(addr.id)}
                  title="Definir como padrão"
                  className="rounded-lg p-2 text-muted-foreground hover:text-primary"
                >
                  <Star className="h-4 w-4" />
                </button>
              )}
              {/* Remove button (cenário 5.5) */}
              <button
                data-testid={`remove-address-${addr.id}`}
                onClick={() => handleRemove(addr.id)}
                title="Remover endereço"
                className="rounded-lg p-2 text-muted-foreground hover:text-red-500"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
