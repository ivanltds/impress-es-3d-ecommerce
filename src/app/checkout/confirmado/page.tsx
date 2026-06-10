'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { CheckCircle, Package, ArrowRight } from 'lucide-react'

export default function ConfirmadoPage() {
  const [order, setOrder] = useState<{ orderNumber: string; total: number; items: Array<{ name: string; qty: number }> } | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem('lastOrder')
    if (stored) setOrder(JSON.parse(stored))
  }, [])

  if (!order) return null

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center" data-testid="order-confirmation">
      <CheckCircle className="mb-6 h-20 w-20 text-green-500" />
      <h1 className="font-heading text-3xl font-bold">Pedido Confirmado!</h1>
      <p className="mt-2 text-muted-foreground">Seu pedido foi recebido e está sendo preparado.</p>
      <div className="mt-8 rounded-2xl border bg-card p-8 text-left">
        <p className="text-sm text-muted-foreground">Número do pedido</p>
        <p className="text-2xl font-bold text-primary" data-testid="order-number">{order.orderNumber}</p>
        <div className="mt-4 space-y-2">
          {order.items.map((i, idx) => (
            <div key={idx} className="flex items-center gap-2 text-sm">
              <Package className="h-4 w-4 text-muted-foreground" />
              <span>{i.name} x{i.qty}</span>
            </div>
          ))}
        </div>
        <p className="mt-4 text-lg font-bold">Total: R$ {order.total.toFixed(2)}</p>
      </div>
      <Link href="/produtos" className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground transition-all hover:scale-105">
        Continuar Comprando <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  )
}
