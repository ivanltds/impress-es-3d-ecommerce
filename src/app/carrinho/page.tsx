'use client'

// ─── M03: Cart Page ───
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight } from 'lucide-react'

interface CartItem {
  id: string
  productId: string
  name: string
  price: number
  qty: number
  image?: string
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
    const updated = items
      .map((i) => (i.id === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i))
    updateCart(updated)
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
            <div key={item.id} className="flex items-center gap-4 rounded-xl border p-4">
              <div className="flex-1">
                <h3 className="font-semibold">{item.name}</h3>
                <p className="text-sm text-muted-foreground">R$ {item.price.toFixed(2)}</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => updateQty(item.id, -1)} className="rounded-lg border p-1.5 hover:bg-muted" data-testid="cart-item-qty-decrease">
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-8 text-center text-sm font-medium" data-testid="cart-item-qty">{item.qty}</span>
                <button onClick={() => updateQty(item.id, 1)} className="rounded-lg border p-1.5 hover:bg-muted">
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <p className="w-20 text-right font-semibold" data-testid="cart-line-total">R$ {(item.price * item.qty).toFixed(2)}</p>
              <button onClick={() => removeItem(item.id)} className="rounded-lg p-2 text-muted-foreground hover:text-red-500" data-testid="remove-item">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
        <div className="rounded-xl border bg-card p-6" data-testid="order-summary">
          <h3 className="font-semibold">Resumo</h3>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between"><span>Subtotal</span><span data-testid="checkout-subtotal">R$ {subtotal.toFixed(2)}</span></div>
            <div className="flex justify-between"><span>Frete</span><span>R$ {shipping.toFixed(2)}</span></div>
            <div className="flex justify-between border-t pt-2 font-semibold text-lg"><span>Total</span><span data-testid="checkout-total">R$ {total.toFixed(2)}</span></div>
          </div>
          <Link href="/checkout" className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground transition-all hover:scale-105 hover:shadow-lg">
            Finalizar Compra <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}
