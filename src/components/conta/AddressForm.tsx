'use client'

import { useState } from 'react'

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

interface AddressFormProps {
  onSuccess: (address: Address) => void
  onCancel: () => void
}

interface FormState {
  label: string
  recipientName: string
  cep: string
  street: string
  number: string
  complement: string
  district: string
  city: string
  state: string
}

const INITIAL_FORM: FormState = {
  label: '',
  recipientName: '',
  cep: '',
  street: '',
  number: '',
  complement: '',
  district: '',
  city: '',
  state: 'SP',
}

const REQUIRED_FIELDS: Array<keyof FormState> = [
  'recipientName',
  'cep',
  'street',
  'number',
  'district',
  'city',
  'state',
]

const FIELD_LABELS: Record<keyof FormState, string> = {
  label: 'Rótulo',
  recipientName: 'Nome do destinatário',
  cep: 'CEP',
  street: 'Rua',
  number: 'Número',
  complement: 'Complemento',
  district: 'Bairro',
  city: 'Cidade',
  state: 'Estado',
}

export function AddressForm({ onSuccess, onCancel }: AddressFormProps) {
  const [form, setForm] = useState<FormState>(INITIAL_FORM)
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof FormState, string>>>({})
  const [apiError, setApiError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  function validate(): boolean {
    const errors: Partial<Record<keyof FormState, string>> = {}
    for (const field of REQUIRED_FIELDS) {
      if (!form[field] || form[field].trim() === '') {
        errors[field] = `${FIELD_LABELS[field]} é obrigatório`
      }
    }
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    // Client-side validation (cenário 5.4)
    if (!validate()) return

    setIsSubmitting(true)
    setApiError(null)

    try {
      const res = await fetch('/api/user/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          complement: form.complement || null,
        }),
      })

      if (!res.ok) {
        // Cenário 5.9: keep form values on error
        const data = await res.json().catch(() => ({}))
        setApiError((data as { error?: string }).error ?? 'Erro ao salvar endereço. Tente novamente.')
        return
      }

      const address = await res.json() as Address
      onSuccess(address)
    } catch {
      setApiError('Erro ao salvar endereço. Tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  function field(name: keyof FormState, placeholder: string, className = 'w-full') {
    return (
      <div className={className}>
        <input
          placeholder={placeholder}
          value={form[name]}
          onChange={(e) => {
            setForm({ ...form, [name]: e.target.value })
            if (fieldErrors[name]) {
              setFieldErrors((prev) => ({ ...prev, [name]: undefined }))
            }
          }}
          className={`w-full rounded-lg border px-4 py-2 text-sm ${fieldErrors[name] ? 'border-red-500' : ''}`}
        />
        {fieldErrors[name] && (
          <p className="mt-1 text-xs text-red-500">{fieldErrors[name]}</p>
        )}
      </div>
    )
  }

  return (
    <form
      data-testid="address-form"
      onSubmit={handleSubmit}
      className="mt-6 space-y-4 rounded-xl border p-6"
    >
      {field('label', 'Rótulo (ex: Casa, Trabalho)')}
      {field('recipientName', 'Nome do destinatário *')}
      {field('cep', 'CEP *')}
      {field('street', 'Rua *')}
      <div className="grid grid-cols-3 gap-4">
        {field('number', 'Nº *', '')}
        {field('district', 'Bairro *', '')}
        {field('city', 'Cidade *', '')}
      </div>
      {field('state', 'Estado *')}
      {field('complement', 'Complemento (opcional)')}

      {/* API error (cenário 5.9) */}
      {apiError && (
        <p data-testid="address-form-error" className="text-sm text-red-500">
          {apiError}
        </p>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          data-testid="save-address"
          className="rounded-lg bg-primary px-6 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60"
        >
          {isSubmitting ? 'Salvando...' : 'Salvar'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border px-6 py-2 text-sm font-semibold"
        >
          Cancelar
        </button>
      </div>
    </form>
  )
}
