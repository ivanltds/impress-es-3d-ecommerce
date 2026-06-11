// ─── Integration Tests: /api/checkout ───

import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/db', () => ({
  prisma: {
    order: {
      create: vi.fn(),
    },
    user: {
      update: vi.fn(),
    },
  },
}))

vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
}))

vi.mock('@/lib/payment-mock', () => ({
  getPaymentProvider: vi.fn(),
}))

import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'
import { getPaymentProvider } from '@/lib/payment-mock'

const MOCK_PROVIDER = {
  name: 'stripe',
  processPayment: vi.fn(),
}

const VALID_BODY = {
  items: [
    { productId: 'prod-1', name: 'Cubo 3D', qty: 1, price: 49.9 },
  ],
  shippingCost: 15,
  paymentMethod: 'stripe',
  cep: '01310-100',
  street: 'Av. Paulista',
  number: '1000',
  district: 'Bela Vista',
  city: 'São Paulo',
  state: 'SP',
  document: '12345678901',
}

function makeRequest(body: object) {
  return new Request('http://localhost/api/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('POST /api/checkout', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(getPaymentProvider).mockReturnValue(MOCK_PROVIDER as any)
  })

  it('retorna 400 quando items está vazio', async () => {
    vi.mocked(auth).mockResolvedValue(null)
    const { POST } = await import('@/app/api/checkout/route')
    const res = await POST(makeRequest({ ...VALID_BODY, items: [] }) as any)
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toMatch(/incompletos/i)
  })

  it('retorna 400 quando paymentMethod não enviado', async () => {
    vi.mocked(auth).mockResolvedValue(null)
    const { POST } = await import('@/app/api/checkout/route')
    const { paymentMethod: _, ...bodyWithoutMethod } = VALID_BODY
    const res = await POST(makeRequest(bodyWithoutMethod) as any)
    expect(res.status).toBe(400)
  })

  it('retorna 402 quando pagamento falha', async () => {
    vi.mocked(auth).mockResolvedValue(null)
    MOCK_PROVIDER.processPayment.mockResolvedValue({ success: false, transactionId: '', error: 'Cartão recusado' })

    const { POST } = await import('@/app/api/checkout/route')
    const res = await POST(makeRequest(VALID_BODY) as any)
    expect(res.status).toBe(402)
    const body = await res.json()
    expect(body.error).toBe('Cartão recusado')
  })

  it('cria pedido e retorna 201 no happy path (usuário anônimo)', async () => {
    vi.mocked(auth).mockResolvedValue(null)
    MOCK_PROVIDER.processPayment.mockResolvedValue({ success: true, transactionId: 'stripe_mock_123' })
    vi.mocked(prisma.order.create).mockResolvedValue({
      id: 'order-1',
      orderNumber: '3DP-00001',
      total: 64.9,
      items: [],
    } as any)

    const { POST } = await import('@/app/api/checkout/route')
    const res = await POST(makeRequest(VALID_BODY) as any)
    expect(res.status).toBe(201)
    const body = await res.json()
    expect(body.success).toBe(true)
    expect(body.orderNumber).toMatch(/^3DP-\d{5}$/)
    expect(body.total).toBe(64.9)
  })

  it('calcula total = subtotal + shippingCost', async () => {
    vi.mocked(auth).mockResolvedValue(null)
    MOCK_PROVIDER.processPayment.mockResolvedValue({ success: true, transactionId: 'tx' })
    vi.mocked(prisma.order.create).mockImplementation(async ({ data }) => ({
      id: 'order-1',
      orderNumber: '3DP-00002',
      total: (data as any).total,
      items: [],
    } as any))

    const { POST } = await import('@/app/api/checkout/route')
    await POST(makeRequest(VALID_BODY) as any)

    expect(prisma.order.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          subtotal: 49.9,
          shippingCost: 15,
          total: 64.9,
        }),
      })
    )
  })

  it('salva endereço estruturado no pedido', async () => {
    vi.mocked(auth).mockResolvedValue(null)
    MOCK_PROVIDER.processPayment.mockResolvedValue({ success: true, transactionId: 'tx' })
    vi.mocked(prisma.order.create).mockResolvedValue({ id: 'o1', orderNumber: '3DP-00003', total: 64.9, items: [] } as any)

    const { POST } = await import('@/app/api/checkout/route')
    await POST(makeRequest(VALID_BODY) as any)

    expect(prisma.order.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          cep: '01310-100',
          shippingStreet: 'Av. Paulista',
          shippingCity: 'São Paulo',
          shippingState: 'SP',
        }),
      })
    )
  })

  it('persiste CPF no user quando logado', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'user-1' } } as any)
    MOCK_PROVIDER.processPayment.mockResolvedValue({ success: true, transactionId: 'tx' })
    vi.mocked(prisma.order.create).mockResolvedValue({ id: 'o1', orderNumber: '3DP-00004', total: 64.9, items: [] } as any)
    vi.mocked(prisma.user.update).mockResolvedValue({} as any)

    const { POST } = await import('@/app/api/checkout/route')
    await POST(makeRequest(VALID_BODY) as any)

    expect(prisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'user-1' },
        data: { document: '12345678901' },
      })
    )
  })

  it('lança erro quando provider não existe', async () => {
    vi.mocked(auth).mockResolvedValue(null)
    vi.mocked(getPaymentProvider).mockImplementation(() => { throw new Error('Payment provider "pix" not found') })

    const { POST } = await import('@/app/api/checkout/route')
    const res = await POST(makeRequest({ ...VALID_BODY, paymentMethod: 'pix' }) as any)
    expect(res.status).toBe(500)
  })
})
