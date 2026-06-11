'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight, ChevronDown, FileText } from 'lucide-react'
import type { CustomizationValue } from '@/lib/customization'

interface CartItem {
  id: string
  productId: string
  name: string
  price: number        // basePrice + customizationPrice
  basePrice?: number
  customizationPrice?: number
  qty: number
  image?: string | null
  customization?: CustomizationValue[] | null
}

function formatBRL(v: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
}

function CustomizationSummary({ items }: { items: CustomizationValue[] }) {
  const [open, setOpen] = useState(false)
  const price = items.reduce((s, i) => s + (i.priceAdd || 0), 0)

  return (
    <div className="mt-2">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 text-xs text-primary hover:underline"
      >
        <FileText className="h-3 w-3" />
        Ver personalização {price > 0 && `(+${formatBRL(price)})`}
        <ChevronDown className={`h-3 w-3 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="mt-2 space-y-1.5 rounded-xl border bg-muted/30 px-3 py-2.5">
          {items.map((v) => (
            <div key={v.fieldId} className="flex items-start justify-between gap-2 text-xs">
              <div className="min-w-0">
                <span className="font-medium text-muted-foreground">{v.label}:</span>{' '}
                <span className="text-foreground">
                  {v.fieldType === 'image_ref' || v.fieldType === 'file_3d'
                    ? <span className="italic">{v.displayValue}</span>
                    : v.displayValue}
                </span>
              </div>
              {v.priceAdd > 0 && (
                <span className="shrink-0 text-primary font-semibold">+{formatBRL(v.priceAdd)}</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function CarrinhoPage() {
  const [items, setItems] = useState<CartItem[]>([])

  useEffect(() => {
    const stored = localStorage.getItem('cart')
    if (stored) setItems(JSON.parse(stored))
  }, [])

  function updateCart(newItems: CartItem[]) {
    setItems(newItems)
    localStorage.setItem('cart', JSON.stringify(newItems))
    window.dispatchEvent(new Event('cart-updated'))
  }

  function updateQty(id: string, delta: number) {
    updateCart(
      items.map((i) => (i.id === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i))
    )
  }

  function removeItem(id: string) {
    updateCart(items.filter((i) => i.id !== id))
  }

  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0)
  const shipping = items.length > 0 ? 15.9 : 0
  const total = subtotal + shipping

  if (items.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center" data-testid="cart-empty">
        <ShoppingBag className="mb-4 h-16 w-16 text-muted-foreground/30" />
        <h1 className="font-heading text-2xl font-bold">Seu carrinho está vazio</h1>
        <p className="mt-2 text-muted-foreground">Adicione produtos para começar.</p>
        <Link href="/produtos" className="mt-6 text-primary hover:underline" data-testid="browse-products-link">
          Ver Produtos
        </Link>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      <h1 className="font-heading text-3xl font-bold">Carrinho</h1>
      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_300px]">
        <div className="space-y-4" data-testid="cart-items">
          {items.map((item) => (
            <div key={item.id} className="rounded-xl border p-4">
              <div className="flex items-start gap-4">
                {/* Thumbnail */}
                {item.image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.image} alt={item.name} className="h-16 w-16 shrink-0 rounded-lg object-cover" />
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold">{item.name}</h3>
                  {/* Preço com breakdown de personalização */}
                  {item.customizationPrice && item.customizationPrice > 0 ? (
                    <div className="text-sm text-muted-foreground mt-0.5">
                      <span>{formatBRL(item.basePrice || 0)}</span>
                      <span className="text-primary"> + {formatBRL(item.customizationPrice)} pers.</span>
                      <span className="font-semibold text-foreground"> = {formatBRL(item.price)}/un</span>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">{formatBRL(item.price)}/un</p>
                  )}
                  {/* Resumo de personalização */}
                  {item.customization && item.customization.length > 0 && (
                    <CustomizationSummary items={item.customization} />
                  )}
                </div>
                <div className="flex flex-col items-end gap-3">
                  <p className="font-semibold" data-testid="cart-line-total">{formatBRL(item.price * item.qty)}</p>
                  <div className="flex items-center gap-2">
                    <button onClick={() => updateQty(item.id, -1)} className="rounded-lg border p-1.5 hover:bg-muted" data-testid="cart-item-qty-decrease">
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-8 text-center text-sm font-medium" data-testid="cart-item-qty">{item.qty}</span>
                    <button onClick={() => updateQty(item.id, 1)} className="rounded-lg border p-1.5 hover:bg-muted">
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <button onClick={() => removeItem(item.id)} className="rounded-lg p-1 text-muted-foreground hover:text-red-500" data-testid="remove-item">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-xl border bg-card p-6" data-testid="order-summary">
          <h3 className="font-semibold">Resumo</h3>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between"><span>Subtotal</span><span data-testid="checkout-subtotal">{formatBRL(subtotal)}</span></div>
            <div className="flex justify-between"><span>Frete</span><span>{formatBRL(shipping)}</span></div>
            <div className="flex justify-between border-t pt-2 font-semibold text-lg"><span>Total</span><span data-testid="checkout-total">{formatBRL(total)}</span></div>
          </div>
          <Link
            href="/checkout"
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground transition-all hover:scale-105 hover:shadow-lg"
          >
            Finalizar Compra <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}
