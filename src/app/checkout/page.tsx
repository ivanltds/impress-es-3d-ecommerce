'use client'

// ─── M03: Checkout Page ───
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { ShippingOption } from '@/lib/shipping'
import { getPaymentProvider } from '@/lib/payment-mock'
import { Check, CreditCard, QrCode, ArrowLeft, ArrowRight } from 'lucide-react'

interface CartItem { id: string; productId: string; name: string; price: number; qty: number }

const UF_LIST = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG',
  'PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO',
]

export default function CheckoutPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [items, setItems] = useState<CartItem[]>([])
  const [cep, setCep] = useState('')
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([])
  const [selectedShipping, setSelectedShipping] = useState<ShippingOption | null>(null)
  const [paymentMethod, setPaymentMethod] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Address fields
  const [street, setStreet] = useState('')
  const [number, setNumber] = useState('')
  const [district, setDistrict] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('SP')
  const [document, setDocument] = useState('') // CPF sem pontuação

  useEffect(() => {
    const stored = localStorage.getItem('cart')
    if (stored) setItems(JSON.parse(stored))
  }, [])

  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0)
  const shipping = selectedShipping?.price ?? 0
  const total = subtotal + shipping

  async function handleCalcFrete() {
    const res = await fetch(`/api/shipping?cep=${cep.replace(/\D/g, '')}`)
    if (res.ok) {
      const opts = await res.json()
      setShippingOptions(opts)
      if (opts.length > 0) setSelectedShipping(opts[0])
    }
  }

  async function handleConfirm() {
    setLoading(true)
    setError('')
    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: items.map((i) => ({ productId: i.productId, name: i.name, qty: i.qty, price: i.price })),
        shippingCost: shipping,
        paymentMethod,
        cep, street, number, district, city, state,
        document: document.replace(/\D/g, ''),
      }),
    })
    const data = await res.json()
    if (res.ok && data.success) {
      localStorage.removeItem('cart')
      window.dispatchEvent(new Event('cart-updated'))
      router.push(`/checkout/confirmado?order=${data.orderNumber}`)
    } else {
      setError(data.error || 'Erro ao processar pagamento')
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-12" data-testid="checkout-page">
      <h1 className="font-heading text-3xl font-bold">Checkout</h1>

      {/* Steps indicator */}
      <div className="mt-8 flex items-center gap-4 text-sm">
        {[1, 2, 3].map((s) => (
          <div key={s} className={`flex items-center gap-2 ${step >= s ? 'text-primary' : 'text-muted-foreground'}`}>
            <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${step >= s ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>{s}</div>
            <span className="hidden sm:inline">{s === 1 ? 'Endereço' : s === 2 ? 'Frete' : 'Pagamento'}</span>
          </div>
        ))}
      </div>

      {/* Step 1: Address */}
      {step === 1 && (
        <div className="mt-8 space-y-4" data-testid="checkout-step-1">
          <div className="grid gap-4 sm:grid-cols-2">
            <input placeholder="CEP" value={cep} onChange={(e) => setCep(e.target.value)} className="rounded-lg border px-4 py-3" data-testid="cep-input" />
            <button onClick={handleCalcFrete} className="rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground" data-testid="calc-frete">Calcular Frete</button>
          </div>
          <input placeholder="Rua / Avenida" value={street} onChange={(e) => setStreet(e.target.value)} className="w-full rounded-lg border px-4 py-3" />
          <div className="grid gap-4 sm:grid-cols-3">
            <input placeholder="Número" value={number} onChange={(e) => setNumber(e.target.value)} className="rounded-lg border px-4 py-3" />
            <input placeholder="Bairro" value={district} onChange={(e) => setDistrict(e.target.value)} className="rounded-lg border px-4 py-3" />
            <input placeholder="Cidade" value={city} onChange={(e) => setCity(e.target.value)} className="rounded-lg border px-4 py-3" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <select value={state} onChange={(e) => setState(e.target.value)} className="rounded-lg border px-4 py-3 text-sm bg-background">
              {UF_LIST.map((uf) => <option key={uf} value={uf}>{uf}</option>)}
            </select>
            <input
              placeholder="CPF (somente números)"
              value={document}
              onChange={(e) => setDocument(e.target.value.replace(/\D/g, '').slice(0, 11))}
              maxLength={11}
              className="rounded-lg border px-4 py-3"
              data-testid="document-input"
            />
          </div>
        </div>
      )}

      {/* Step 2: Shipping */}
      {step === 2 && (
        <div className="mt-8 space-y-3" data-testid="checkout-step-2">
          {shippingOptions.map((opt) => (
            <button key={opt.id} onClick={() => setSelectedShipping(opt)} className={`flex w-full items-center justify-between rounded-xl border p-4 ${selectedShipping?.id === opt.id ? 'border-primary bg-primary/5' : ''}`} data-testid={`shipping-option-${opt.id}`}>
              <span>{opt.name} — até {opt.days} dias</span>
              <span className="font-semibold">R$ {opt.price.toFixed(2)}</span>
            </button>
          ))}
          {shippingOptions.length === 0 && <p className="text-sm text-muted-foreground">Digite um CEP válido na etapa anterior</p>}
        </div>
      )}

      {/* Step 3: Payment */}
      {step === 3 && (
        <div className="mt-8 space-y-4" data-testid="checkout-step-3">
          <button onClick={() => setPaymentMethod('stripe')} className={`flex w-full items-center gap-4 rounded-xl border p-5 ${paymentMethod === 'stripe' ? 'border-primary bg-primary/5' : ''}`} data-testid="payment-method-card">
            <CreditCard className="h-6 w-6 text-primary" />
            <div className="text-left"><p className="font-semibold">Cartão de Crédito</p><p className="text-sm text-muted-foreground">Pagamento processado com segurança</p></div>
          </button>
          <button onClick={() => setPaymentMethod('mercadopago')} className={`flex w-full items-center gap-4 rounded-xl border p-5 ${paymentMethod === 'mercadopago' ? 'border-primary bg-primary/5' : ''}`}>
            <QrCode className="h-6 w-6 text-primary" />
            <div className="text-left"><p className="font-semibold">Pix</p><p className="text-sm text-muted-foreground">Pagamento instantâneo</p></div>
          </button>
          {error && <p className="text-sm text-red-500" data-testid="payment-error">{error}</p>}
          <button onClick={handleConfirm} disabled={!paymentMethod || loading} className="w-full rounded-full bg-primary py-3.5 text-sm font-semibold text-primary-foreground transition-all hover:scale-105 disabled:opacity-50" data-testid="confirm-payment">
            {loading ? 'Processando...' : `Pagar R$ ${total.toFixed(2)}`}
          </button>
        </div>
      )}

      {/* Navigation + Summary */}
      <div className="mt-8 flex items-center justify-between">
        <button onClick={() => setStep(Math.max(1, step - 1))} disabled={step === 1} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground disabled:opacity-30">
          <ArrowLeft className="h-4 w-4" /> Voltar
        </button>
        {step < 3 && (
          <button onClick={() => setStep(step + 1)} className="flex items-center gap-1 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground" data-testid="checkout-next">
            Próximo <ArrowRight className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Summary sidebar */}
      <div className="mt-8 rounded-xl border bg-card p-6" data-testid="order-summary">
        <h3 className="font-semibold">Resumo do Pedido</h3>
        <div className="mt-4 space-y-2 text-sm">
          {items.map((i) => (<div key={i.id} className="flex justify-between"><span>{i.name} x{i.qty}</span><span>R$ {(i.price * i.qty).toFixed(2)}</span></div>))}
          <div className="flex justify-between border-t pt-2"><span>Subtotal</span><span data-testid="checkout-subtotal">R$ {subtotal.toFixed(2)}</span></div>
          <div className="flex justify-between"><span>Frete</span><span>R$ {shipping.toFixed(2)}</span></div>
          <div className="flex justify-between border-t pt-2 text-lg font-bold"><span>Total</span><span data-testid="checkout-total">R$ {total.toFixed(2)}</span></div>
        </div>
      </div>
    </div>
  )
}
