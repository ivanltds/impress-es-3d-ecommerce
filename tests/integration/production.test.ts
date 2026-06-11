// ─── Integration Tests: /api/admin/production ───

import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/db', () => ({
  prisma: {
    order: {
      findMany: vi.fn(),
      update: vi.fn(),
    },
    orderItem: {
      update: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
    },
  },
}))

vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
}))

import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'

const FAKE_ORDER = {
  id: 'order-1',
  orderNumber: '3DP-00001',
  total: 99.9,
  cep: '01310-100',
  trackingCode: null,
  items: [
    {
      id: 'item-1',
      productNameSnapshot: 'Cubo 3D',
      qty: 1,
      customizationSnapshot: null,
      productionStatus: 'pending',
      productionNotes: null,
    },
  ],
  user: { name: 'Ivan', phone: '11999999999' },
}

// ─── GET /api/admin/production ────────────────────────────────────────────────

describe('GET /api/admin/production', () => {
  beforeEach(() => vi.clearAllMocks())

  it('retorna 401 sem sessão', async () => {
    vi.mocked(auth).mockResolvedValue(null)
    const { GET } = await import('@/app/api/admin/production/route')
    const res = await GET()
    expect(res.status).toBe(401)
    const body = await res.json()
    expect(body.error).toBe('Unauthorized')
  })

  it('retorna lista de items com campos esperados', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'admin-1' } } as any)
    vi.mocked(prisma.order.findMany).mockResolvedValue([FAKE_ORDER] as any)

    const { GET } = await import('@/app/api/admin/production/route')
    const res = await GET()
    expect(res.status).toBe(200)
    const items = await res.json()
    expect(items).toHaveLength(1)

    const item = items[0]
    expect(item).toMatchObject({
      id: 'item-1',
      orderId: 'order-1',
      orderNumber: '3DP-00001',
      customerName: 'Ivan',
      productNameSnapshot: 'Cubo 3D',
      productionStatus: 'pending',
      total: 99.9,
    })
  })

  it('usa "Cliente" como fallback quando user é null', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'admin-1' } } as any)
    vi.mocked(prisma.order.findMany).mockResolvedValue([
      { ...FAKE_ORDER, user: null },
    ] as any)

    const { GET } = await import('@/app/api/admin/production/route')
    const res = await GET()
    const items = await res.json()
    expect(items[0].customerName).toBe('Cliente')
  })

  it('filtra pedidos que já estão em fase de envio', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'admin-1' } } as any)
    vi.mocked(prisma.order.findMany).mockResolvedValue([])

    const { GET } = await import('@/app/api/admin/production/route')
    await GET()

    expect(prisma.order.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          fulfillmentStatus: expect.objectContaining({ notIn: expect.arrayContaining(['shipped', 'posted']) }),
        }),
      })
    )
  })

  it('retorna array vazio quando não há pedidos', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'admin-1' } } as any)
    vi.mocked(prisma.order.findMany).mockResolvedValue([])

    const { GET } = await import('@/app/api/admin/production/route')
    const res = await GET()
    const items = await res.json()
    expect(items).toEqual([])
  })
})

// ─── PATCH /api/admin/production ─────────────────────────────────────────────

describe('PATCH /api/admin/production', () => {
  beforeEach(() => vi.clearAllMocks())

  it('retorna 401 sem sessão', async () => {
    vi.mocked(auth).mockResolvedValue(null)
    const { PATCH } = await import('@/app/api/admin/production/route')
    const req = new Request('http://localhost/api/admin/production', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemId: 'item-1', status: 'in_progress' }),
    })
    const res = await PATCH(req as any)
    expect(res.status).toBe(401)
  })

  it('atualiza productionStatus do item', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'admin-1' } } as any)
    vi.mocked(prisma.orderItem.update).mockResolvedValue({} as any)
    vi.mocked(prisma.orderItem.findUnique).mockResolvedValue({ orderId: 'order-1' } as any)
    vi.mocked(prisma.orderItem.findMany).mockResolvedValue([
      { id: 'item-1', productionStatus: 'in_progress' },
    ] as any)
    vi.mocked(prisma.order.update).mockResolvedValue({} as any)

    const { PATCH } = await import('@/app/api/admin/production/route')
    const req = new Request('http://localhost/api/admin/production', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemId: 'item-1', status: 'in_progress' }),
    })
    const res = await PATCH(req as any)
    expect(res.status).toBe(200)
    expect(prisma.orderItem.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'item-1' },
        data: expect.objectContaining({ productionStatus: 'in_progress' }),
      })
    )
  })

  it('sincroniza fulfillmentStatus do pedido para "in_progress" quando item vai para packed', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'admin-1' } } as any)
    vi.mocked(prisma.orderItem.update).mockResolvedValue({} as any)
    vi.mocked(prisma.orderItem.findUnique).mockResolvedValue({ orderId: 'order-1' } as any)
    vi.mocked(prisma.orderItem.findMany).mockResolvedValue([
      { id: 'item-1', productionStatus: 'packed' },
    ] as any)
    vi.mocked(prisma.order.update).mockResolvedValue({} as any)

    const { PATCH } = await import('@/app/api/admin/production/route')
    const req = new Request('http://localhost/api/admin/production', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemId: 'item-1', status: 'packed' }),
    })
    await PATCH(req as any)

    expect(prisma.order.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'order-1' },
        data: { fulfillmentStatus: 'in_progress' },
      })
    )
  })

  it('sincroniza fulfillmentStatus para "shipped" quando todos os items foram enviados', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'admin-1' } } as any)
    vi.mocked(prisma.orderItem.update).mockResolvedValue({} as any)
    vi.mocked(prisma.orderItem.findUnique).mockResolvedValue({ orderId: 'order-1' } as any)
    // Todos os outros items também são 'shipped'
    vi.mocked(prisma.orderItem.findMany).mockResolvedValue([
      { id: 'item-1', productionStatus: 'pending' }, // será atualizado para 'shipped'
      { id: 'item-2', productionStatus: 'shipped' },
    ] as any)
    vi.mocked(prisma.order.update).mockResolvedValue({} as any)

    const { PATCH } = await import('@/app/api/admin/production/route')
    const req = new Request('http://localhost/api/admin/production', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemId: 'item-1', status: 'shipped' }),
    })
    await PATCH(req as any)

    expect(prisma.order.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { fulfillmentStatus: 'shipped' },
      })
    )
  })
})
