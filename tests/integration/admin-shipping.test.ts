// ─── Integration Tests: Admin Shipping ───
// GET/PATCH /api/admin/shipping
// GET/POST  /api/admin/shipping/purchase

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

vi.mock('@/lib/db', () => ({
  prisma: {
    order: { findMany: vi.fn(), update: vi.fn(), findUnique: vi.fn() },
    storeAddress: { findUnique: vi.fn() },
  },
}))
vi.mock('@/lib/auth', () => ({ auth: vi.fn() }))
vi.mock('@/lib/shipping', () => ({
  getRealShippingOptions: vi.fn(),
  purchaseLabel: vi.fn(),
}))

import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'
import { getRealShippingOptions, purchaseLabel } from '@/lib/shipping'

const AUTHED = { user: { id: 'admin-1' } }

const FAKE_ORDER = {
  id: 'order-1', orderNumber: '3DP-00001', total: 99.9,
  fulfillmentStatus: 'awaiting_pickup', createdAt: new Date(),
  trackingCode: null,
  shippingStreet: 'Av. Paulista', shippingNumber: '1000',
  shippingDistrict: 'Bela Vista', shippingCity: 'São Paulo', shippingState: 'SP',
  cep: '01310-100',
  user: { name: 'Ivan', phone: '11999', email: 'ivan@test.com', document: '12345678901' },
  items: [{ productNameSnapshot: 'Cubo 3D' }],
}

function patchReq(body: object) {
  return new Request('http://localhost/api/admin/shipping', {
    method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
  })
}

// ─── GET /api/admin/shipping ──────────────────────────────────────────────────

describe('GET /api/admin/shipping', () => {
  beforeEach(() => vi.clearAllMocks())

  it('retorna 401 sem sessão', async () => {
    vi.mocked(auth).mockResolvedValue(null)
    const { GET } = await import('@/app/api/admin/shipping/route')
    expect((await GET()).status).toBe(401)
  })

  it('retorna apenas pedidos em fase de envio', async () => {
    vi.mocked(auth).mockResolvedValue(AUTHED as any)
    vi.mocked(prisma.order.findMany).mockResolvedValue([
      { ...FAKE_ORDER, fulfillmentStatus: 'posted', items: [{ productNameSnapshot: 'Cubo' }], user: { name: 'Ivan' } },
    ] as any)
    const { GET } = await import('@/app/api/admin/shipping/route')
    const res = await GET()
    expect(res.status).toBe(200)
    const shipments = await res.json()
    expect(shipments[0].status).toBe('posted')
    expect(shipments[0].orderNumber).toBe('3DP-00001')
  })

  it('mapeia fulfillmentStatus delivered → status delivered', async () => {
    vi.mocked(auth).mockResolvedValue(AUTHED as any)
    vi.mocked(prisma.order.findMany).mockResolvedValue([
      { ...FAKE_ORDER, fulfillmentStatus: 'delivered', items: [], user: { name: 'X' } },
    ] as any)
    const { GET } = await import('@/app/api/admin/shipping/route')
    const shipments = await (await GET()).json()
    expect(shipments[0].status).toBe('delivered')
  })
})

// ─── PATCH /api/admin/shipping ────────────────────────────────────────────────

describe('PATCH /api/admin/shipping', () => {
  beforeEach(() => vi.clearAllMocks())

  it('retorna 401 sem sessão', async () => {
    vi.mocked(auth).mockResolvedValue(null)
    const { PATCH } = await import('@/app/api/admin/shipping/route')
    expect((await PATCH(patchReq({ id: 'order-1', status: 'in_transit' }) as any)).status).toBe(401)
  })

  it('atualiza fulfillmentStatus do pedido', async () => {
    vi.mocked(auth).mockResolvedValue(AUTHED as any)
    vi.mocked(prisma.order.update).mockResolvedValue({} as any)
    const { PATCH } = await import('@/app/api/admin/shipping/route')
    const res = await PATCH(patchReq({ id: 'order-1', status: 'in_transit' }) as any)
    expect(res.status).toBe(200)
    expect(prisma.order.update).toHaveBeenCalledWith({
      where: { id: 'order-1' },
      data: { fulfillmentStatus: 'in_transit' },
    })
  })
})

// ─── GET /api/admin/shipping/purchase (cotação) ───────────────────────────────

describe('GET /api/admin/shipping/purchase', () => {
  beforeEach(() => vi.clearAllMocks())

  it('retorna 401 sem sessão', async () => {
    vi.mocked(auth).mockResolvedValue(null)
    const { GET } = await import('@/app/api/admin/shipping/purchase/route')
    const req = new NextRequest('http://localhost/api/admin/shipping/purchase?cep=01310100')
    expect((await GET(req as any)).status).toBe(401)
  })

  it('retorna 400 quando CEP não fornecido', async () => {
    vi.mocked(auth).mockResolvedValue(AUTHED as any)
    const { GET } = await import('@/app/api/admin/shipping/purchase/route')
    const req = new NextRequest('http://localhost/api/admin/shipping/purchase')
    expect((await GET(req as any)).status).toBe(400)
  })

  it('retorna cotações quando CEP fornecido', async () => {
    vi.mocked(auth).mockResolvedValue(AUTHED as any)
    vi.mocked(getRealShippingOptions).mockResolvedValue([
      { id: 1, name: 'PAC', price: 15.5, deliveryTime: 5 },
    ] as any)
    const { GET } = await import('@/app/api/admin/shipping/purchase/route')
    const req = new NextRequest('http://localhost/api/admin/shipping/purchase?cep=01310100')
    const res = await GET(req as any)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body[0].name).toBe('PAC')
  })
})

// ─── POST /api/admin/shipping/purchase (compra etiqueta) ─────────────────────

describe('POST /api/admin/shipping/purchase', () => {
  beforeEach(() => vi.clearAllMocks())

  it('retorna 401 sem sessão', async () => {
    vi.mocked(auth).mockResolvedValue(null)
    const { POST } = await import('@/app/api/admin/shipping/purchase/route')
    const req = new Request('http://localhost/api/admin/shipping/purchase', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId: 'o1', cep: '01310100', serviceId: 1 }),
    })
    expect((await POST(req as any)).status).toBe(401)
  })

  it('retorna 400 quando campos obrigatórios faltam', async () => {
    vi.mocked(auth).mockResolvedValue(AUTHED as any)
    const { POST } = await import('@/app/api/admin/shipping/purchase/route')
    const req = new Request('http://localhost/api/admin/shipping/purchase', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId: 'o1' }), // falta cep e serviceId
    })
    expect((await POST(req as any)).status).toBe(400)
  })

  it('retorna 404 quando pedido não existe', async () => {
    vi.mocked(auth).mockResolvedValue(AUTHED as any)
    vi.mocked(prisma.order.findUnique).mockResolvedValue(null)
    const { POST } = await import('@/app/api/admin/shipping/purchase/route')
    const req = new Request('http://localhost/api/admin/shipping/purchase', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId: 'nao-existe', cep: '01310100', serviceId: 1 }),
    })
    expect((await POST(req as any)).status).toBe(404)
  })

  it('compra etiqueta e retorna trackingCode', async () => {
    vi.mocked(auth).mockResolvedValue(AUTHED as any)
    vi.mocked(prisma.order.findUnique).mockResolvedValue(FAKE_ORDER as any)
    vi.mocked(prisma.storeAddress.findUnique).mockResolvedValue(null)
    vi.mocked(purchaseLabel).mockResolvedValue({ trackingCode: 'BR123456789' } as any)
    vi.mocked(prisma.order.update).mockResolvedValue({} as any)

    const { POST } = await import('@/app/api/admin/shipping/purchase/route')
    const req = new Request('http://localhost/api/admin/shipping/purchase', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId: 'order-1', cep: '01310-100', serviceId: 1 }),
    })
    const res = await POST(req as any)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.trackingCode).toBe('BR123456789')
  })
})
