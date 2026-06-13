// @vitest-environment jsdom
// ─── Component Tests: M06 — OrderDetail (src/components/conta/OrderDetail.tsx) ───
// Spec: specs/M06-customer-area.spec.md — Feature 3 (Cenários 3.1*, 3.2, 3.3, 3.4,
// 3.5, 3.6, 3.7, 3.11) + Feature 6 (Cenário 6.3)
// FASE 2 — TEST AUTHORING (🔴 RED)
// O componente ainda não existe — o import dinâmico falha com "Cannot find module".
//
// Estes testes cobrem as variações de dados que o E2E não consegue criar via
// /api/checkout (customizationPrice, customizationSnapshot, status arbitrário,
// trackingCode). Props conforme arquitetura M06 (Seção 5 — OrderDetail).

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import type { ComponentType } from 'react'

// Spy criado via vi.hoisted para não depender do módulo @/lib/analytics (que ainda
// não existe). O factory do vi.mock só é avaliado quando o componente importar o
// módulo (GREEN). Em RED, os testes falham no import dinâmico do componente.
const { trackEventMock } = vi.hoisted(() => ({ trackEventMock: vi.fn() }))
vi.mock('@/lib/analytics', () => ({ trackEvent: trackEventMock }))

// ─── Fixtures (contrato de props da arquitetura M06) ─────────────────────────

interface OrderItemFixture {
  id: string
  productNameSnapshot: string
  skuSnapshot: string
  qty: number
  unitPrice: number
  customizationPrice: number
  customizationSnapshot: string | null
  productionStatus: string
}

interface OrderFixture {
  id: string
  orderNumber: string
  status: string
  paymentStatus: string
  total: number
  subtotal: number
  shippingCost: number
  trackingCode: string | null
  createdAt: string
  items: OrderItemFixture[]
}

function makeItem(overrides: Partial<OrderItemFixture> = {}): OrderItemFixture {
  return {
    id: 'item-1',
    productNameSnapshot: 'Suporte Neon RGB',
    skuSnapshot: 'SKU-001',
    qty: 1,
    unitPrice: 89.9,
    customizationPrice: 0,
    customizationSnapshot: null,
    productionStatus: 'pending',
    ...overrides,
  }
}

function makeOrder(overrides: Partial<OrderFixture> = {}): OrderFixture {
  return {
    id: 'order-abc',
    orderNumber: '3DP-00042',
    status: 'processing',
    paymentStatus: 'paid',
    total: 199.9,
    subtotal: 189.9,
    shippingCost: 10,
    trackingCode: null,
    createdAt: '2026-06-10T12:00:00.000Z',
    items: [makeItem()],
    ...overrides,
  }
}

// Especificador em variável + @vite-ignore: a resolução acontece em RUNTIME,
// fazendo cada teste falhar com "Cannot find module" (RED granular) em vez de
// quebrar a coleta da suíte no transform do Vite.
const ORDER_DETAIL_MODULE = '@/components/conta/' + 'OrderDetail'

async function loadOrderDetail(): Promise<ComponentType<{ order: OrderFixture; userId: string }>> {
  const mod = await import(/* @vite-ignore */ ORDER_DETAIL_MODULE)
  return (mod.OrderDetail ?? mod.default) as ComponentType<{ order: OrderFixture; userId: string }>
}

describe('M06-F3: OrderDetail — componente de detalhe do pedido', () => {
  beforeEach(() => vi.clearAllMocks())
  afterEach(() => cleanup())

  // Cenário 3.1 (formatação): número, total em R$ com 2 casas e data dd/mm/aaaa
  it('Cenário 3.1: exibe orderNumber, total formatado em R$ e data dd/mm/aaaa', async () => {
    const OrderDetail = await loadOrderDetail()
    render(<OrderDetail order={makeOrder()} userId="user-001" />)

    expect(screen.getByTestId('order-detail')).toBeInTheDocument()
    expect(screen.getByTestId('order-number')).toHaveTextContent('3DP-00042')
    expect(screen.getByTestId('order-total')).toHaveTextContent(/R\$\s?199,90/)
    expect(screen.getByTestId('order-date')).toHaveTextContent(/10\/06\/2026/)
  })

  // Cenário 3.2: itens com snapshot de nome, quantidade, preço unitário e personalização
  it('Cenário 3.2: 2 itens com nome, qty, preço unitário e adicional de personalização', async () => {
    const OrderDetail = await loadOrderDetail()
    const order = makeOrder({
      items: [
        makeItem({
          id: 'item-1',
          productNameSnapshot: 'Suporte Neon RGB',
          qty: 1,
          unitPrice: 89.9,
          customizationPrice: 10,
        }),
        makeItem({
          id: 'item-2',
          productNameSnapshot: 'Porta Joias 3D',
          qty: 2,
          unitPrice: 45,
          customizationPrice: 0,
        }),
      ],
    })
    render(<OrderDetail order={order} userId="user-001" />)

    const list = screen.getByTestId('order-items-list')
    expect(list).toBeInTheDocument()

    const item0 = screen.getByTestId('order-item-0')
    const item1 = screen.getByTestId('order-item-1')
    expect(screen.queryByTestId('order-item-2')).not.toBeInTheDocument()

    // item 0: nome, preço unitário e personalização +R$ 10,00
    expect(item0).toHaveTextContent('Suporte Neon RGB')
    expect(item0.textContent).toMatch(/R\$\s?89,90/)
    expect(item0.textContent).toMatch(/\+\s?R\$\s?10,00/)

    // item 1: quantidade x2 e preço unitário
    expect(item1).toHaveTextContent('Porta Joias 3D')
    expect(item1.textContent).toMatch(/x\s?2/)
    expect(item1.textContent).toMatch(/R\$\s?45,00/)
    // adicional de personalização zerado NÃO é exibido
    expect(item1.textContent).not.toMatch(/\+\s?R\$\s?0,00/)
  })

  // Cenário 3.3: badge de status com texto legível e estilo correspondente
  it('Cenário 3.3: status processing exibe badge "Em Produção" com estilo próprio', async () => {
    const OrderDetail = await loadOrderDetail()
    render(<OrderDetail order={makeOrder({ status: 'processing' })} userId="user-001" />)

    const badge = screen.getByTestId('order-status-badge')
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveTextContent('Em Produção')
    const processingClass = badge.className

    cleanup()

    // estilo do badge muda conforme o status
    render(<OrderDetail order={makeOrder({ status: 'cancelled' })} userId="user-001" />)
    const cancelledBadge = screen.getByTestId('order-status-badge')
    expect(cancelledBadge).toHaveTextContent('Cancelado')
    expect(cancelledBadge.className).not.toBe(processingClass)
  })

  it('Cenário 3.3: mapeia os demais status para texto legível', async () => {
    const OrderDetail = await loadOrderDetail()
    const expected: Array<[string, string]> = [
      ['paid', 'Pago'],
      ['shipped', 'Enviado'],
      ['delivered', 'Entregue'],
    ]
    for (const [status, label] of expected) {
      render(<OrderDetail order={makeOrder({ status })} userId="user-001" />)
      expect(screen.getByTestId('order-status-badge')).toHaveTextContent(label)
      cleanup()
    }
  })

  // Cenário 3.4: código de rastreio exibido quando disponível
  it('Cenário 3.4: trackingCode presente exibe código e link em nova aba', async () => {
    const OrderDetail = await loadOrderDetail()
    render(
      <OrderDetail order={makeOrder({ trackingCode: 'BR123456789BR' })} userId="user-001" />
    )

    const tracking = screen.getByTestId('order-tracking')
    expect(tracking).toBeInTheDocument()
    expect(tracking).toHaveTextContent('BR123456789BR')

    const link = screen.getByTestId('order-tracking-link')
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('target', '_blank')
  })

  // Cenário 3.5: rastreio pendente quando trackingCode = null
  it('Cenário 3.5: trackingCode null não renderiza order-tracking e mostra pendente', async () => {
    const OrderDetail = await loadOrderDetail()
    render(<OrderDetail order={makeOrder({ trackingCode: null })} userId="user-001" />)

    expect(screen.queryByTestId('order-tracking')).not.toBeInTheDocument()
    const pending = screen.getByTestId('order-tracking-pending')
    expect(pending).toBeInTheDocument()
    expect(pending.textContent?.toLowerCase()).toMatch(/rastreio/)
  })

  // Cenário 3.6: personalização exibida em formato legível (RN-M06-16)
  it('Cenário 3.6: customizationSnapshot renderizado como pares chave-valor legíveis', async () => {
    const OrderDetail = await loadOrderDetail()
    const order = makeOrder({
      items: [
        makeItem({ customizationSnapshot: '{"nome":"João","cor":"azul"}', customizationPrice: 10 }),
      ],
    })
    render(<OrderDetail order={order} userId="user-001" />)

    const customization = screen.getByTestId('order-item-customization-0')
    expect(customization).toBeInTheDocument()
    expect(customization.textContent).toMatch(/nome/i)
    expect(customization).toHaveTextContent('João')
    expect(customization.textContent).toMatch(/cor/i)
    expect(customization).toHaveTextContent('azul')
  })

  // Cenário 3.7: personalização não renderizada quando snapshot = null
  it('Cenário 3.7: item sem customizationSnapshot não renderiza o bloco', async () => {
    const OrderDetail = await loadOrderDetail()
    render(<OrderDetail order={makeOrder()} userId="user-001" />)

    expect(screen.queryByTestId('order-item-customization-0')).not.toBeInTheDocument()
  })

  // Cenário 3.11: link de volta para a lista de pedidos
  it('Cenário 3.11: back-to-orders aponta para /conta/pedidos', async () => {
    const OrderDetail = await loadOrderDetail()
    render(<OrderDetail order={makeOrder()} userId="user-001" />)

    const back = screen.getByTestId('back-to-orders')
    expect(back).toBeInTheDocument()
    expect(back).toHaveAttribute('href', '/conta/pedidos')
  })

  // Cenário 6.3: evento order_detail_viewed emitido ao montar (useEffect)
  it('Cenário 6.3: emite order_detail_viewed com userId, orderId e orderStatus', async () => {
    const OrderDetail = await loadOrderDetail()
    render(<OrderDetail order={makeOrder({ status: 'processing' })} userId="user-001" />)

    expect(trackEventMock).toHaveBeenCalledWith(
      'order_detail_viewed',
      expect.objectContaining({
        userId: 'user-001',
        orderId: 'order-abc',
        orderStatus: 'processing',
      })
    )
  })
})
