'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { trackEvent } from '@/lib/analytics'

interface OrderItem {
  id: string
  productNameSnapshot: string
  skuSnapshot: string
  qty: number
  unitPrice: number
  customizationPrice: number
  customizationSnapshot: string | null
  productionStatus: string
}

interface OrderDetailOrder {
  id: string
  orderNumber: string
  status: string
  paymentStatus: string
  total: number
  subtotal: number
  shippingCost: number
  trackingCode: string | null
  createdAt: string // ISO 8601 — serialized by Server Component
  items: OrderItem[]
}

interface OrderDetailProps {
  order: OrderDetailOrder
  userId: string
}

const STATUS_MAP: Record<string, { label: string; className: string }> = {
  created:    { label: 'Criado',      className: 'bg-gray-100 text-gray-700' },
  paid:       { label: 'Pago',        className: 'bg-green-100 text-green-700' },
  processing: { label: 'Em Produção', className: 'bg-blue-100 text-blue-700' },
  shipped:    { label: 'Enviado',     className: 'bg-purple-100 text-purple-700' },
  delivered:  { label: 'Entregue',    className: 'bg-teal-100 text-teal-700' },
  cancelled:  { label: 'Cancelado',   className: 'bg-red-100 text-red-700' },
}

function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  const day = String(d.getUTCDate()).padStart(2, '0')
  const month = String(d.getUTCMonth() + 1).padStart(2, '0')
  const year = d.getUTCFullYear()
  return `${day}/${month}/${year}`
}

function parseCustomization(snapshot: string): Record<string, string> {
  try {
    return JSON.parse(snapshot) as Record<string, string>
  } catch {
    return {}
  }
}

export function OrderDetail({ order, userId }: OrderDetailProps) {
  const status = STATUS_MAP[order.status] ?? { label: order.status, className: 'bg-gray-100 text-gray-700' }

  // Cenário 6.3: emit order_detail_viewed on mount
  useEffect(() => {
    trackEvent('order_detail_viewed', {
      userId,
      orderId: order.id,
      orderStatus: order.status,
    })
  }, [userId, order.id, order.status])

  return (
    <div data-testid="order-detail" className="container mx-auto max-w-2xl px-4 py-12">
      {/* Header */}
      <div className="mb-8 flex items-center gap-4">
        <Link
          href="/conta/pedidos"
          data-testid="back-to-orders"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Voltar aos pedidos
        </Link>
      </div>

      <div className="rounded-2xl border bg-card p-8">
        {/* Order number, date, total */}
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Número do pedido</p>
            <p className="text-2xl font-bold" data-testid="order-number">
              {order.orderNumber}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Data</p>
            <p className="font-semibold" data-testid="order-date">
              {formatDate(order.createdAt)}
            </p>
          </div>
        </div>

        {/* Status badge (cenário 3.3) */}
        <div className="mb-6">
          <span
            data-testid="order-status-badge"
            className={`inline-block rounded-full px-3 py-1 text-sm font-semibold ${status.className}`}
          >
            {status.label}
          </span>
        </div>

        {/* Total (cenário 3.1) */}
        <div className="mb-6">
          <p className="text-xs text-muted-foreground">Total</p>
          <p className="text-xl font-bold" data-testid="order-total">
            {formatCurrency(order.total)}
          </p>
        </div>

        {/* Tracking (cenários 3.4, 3.5) */}
        {order.trackingCode ? (
          <div data-testid="order-tracking" className="mb-6 rounded-xl border p-4">
            <p className="text-xs text-muted-foreground">Código de rastreio</p>
            <p className="font-mono font-semibold">{order.trackingCode}</p>
            <a
              data-testid="order-tracking-link"
              href={`https://www.correios.com.br/rastreamento/${order.trackingCode}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-block text-sm text-primary hover:underline"
            >
              Rastrear pedido →
            </a>
          </div>
        ) : (
          <div data-testid="order-tracking-pending" className="mb-6 text-sm text-muted-foreground">
            Rastreio em breve — assim que seu pedido for despachado, o código aparecerá aqui.
          </div>
        )}

        {/* Items list (cenários 3.2, 3.6, 3.7) */}
        <div data-testid="order-items-list" className="space-y-4">
          <p className="font-semibold">Itens do pedido</p>
          {order.items.map((item, index) => (
            <div
              key={item.id}
              data-testid={`order-item-${index}`}
              className="rounded-xl border p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <p className="font-semibold">{item.productNameSnapshot}</p>
                  <p className="text-sm text-muted-foreground">
                    x{item.qty} · {formatCurrency(item.unitPrice)}
                  </p>
                  {item.customizationPrice > 0 && (
                    <p className="text-sm text-muted-foreground">
                      +{formatCurrency(item.customizationPrice)}
                    </p>
                  )}
                </div>
              </div>

              {/* Customization (cenários 3.6, 3.7) */}
              {item.customizationSnapshot && (
                <div
                  data-testid={`order-item-customization-${index}`}
                  className="mt-3 rounded-lg bg-muted/50 p-3 text-sm"
                >
                  <p className="mb-1 text-xs font-semibold text-muted-foreground">Personalização</p>
                  <p>
                    {Object.entries(parseCustomization(item.customizationSnapshot))
                      .map(([k, v]) => `${k}: ${v}`)
                      .join(' · ')}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
