'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { CheckCircle, Package, ArrowRight } from 'lucide-react'
import { UniverseSuggestionModal } from '@/components/checkout/UniverseSuggestionModal'

interface OrderItem {
  name: string
  qty: number
  universeSlug?: string | null
}

interface LastOrder {
  orderNumber: string
  total: number
  items: OrderItem[]
}

export default function ConfirmadoPage() {
  const { data: session } = useSession()
  const [order, setOrder] = useState<LastOrder | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem('lastOrder')
    if (stored) {
      try {
        setOrder(JSON.parse(stored) as LastOrder)
      } catch {
        // ignore malformed data
      }
    }
  }, [])

  if (!order) return null

  // DA-M06-02: universeSlug from items[0] (RN-M06-07: first item's universe)
  const suggestedSlug =
    order.items.find((i) => i.universeSlug)?.universeSlug ?? null

  const userId = (session?.user as { id?: string } | undefined)?.id ?? null
  const currentPreference =
    (session?.user as { preferredCollection?: string | null } | undefined)
      ?.preferredCollection ?? null

  return (
    <>
      <div
        className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center"
        data-testid="order-confirmation"
      >
        <CheckCircle className="mb-6 h-20 w-20 text-green-500" />
        <h1 className="font-heading text-3xl font-bold">Pedido Confirmado!</h1>
        <p className="mt-2 text-muted-foreground">
          Seu pedido foi recebido e esta sendo preparado.
        </p>
        <div className="mt-8 rounded-2xl border bg-card p-8 text-left">
          <p className="text-sm text-muted-foreground">Numero do pedido</p>
          <p className="text-2xl font-bold text-primary" data-testid="order-number">
            {order.orderNumber}
          </p>
          <div className="mt-4 space-y-2">
            {order.items.map((i, idx) => (
              <div key={idx} className="flex items-center gap-2 text-sm">
                <Package className="h-4 w-4 text-muted-foreground" />
                <span>
                  {i.name} x{i.qty}
                </span>
              </div>
            ))}
          </div>
          <p className="mt-4 text-lg font-bold">
            Total: R${' '}
            {order.total.toLocaleString('pt-BR', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
        </div>
        <Link
          href="/produtos"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground transition-all hover:scale-105"
        >
          Continuar Comprando <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {/* F4: Modal de sugestao de universo pos-checkout */}
      <UniverseSuggestionModal
        suggestedSlug={suggestedSlug}
        userId={userId}
        currentPreference={currentPreference}
      />
    </>
  )
}
