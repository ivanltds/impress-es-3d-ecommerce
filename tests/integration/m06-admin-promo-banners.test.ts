// ─── Integration Tests: M06 — APIs /api/admin/promo-banners ───
// Spec: specs/M06-customer-area.spec.md — Feature 7 (Cenários 7.6 e 7.7) + RN-M06-22
// Arquitetura: docs/architecture/M06-architecture.md — Seção 3
// FASE 2 — TEST AUTHORING (🔴 RED)
// As rotas ainda não existem — imports dinâmicos falham com "Cannot find module".

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

vi.mock('@/lib/db', () => {
  const prisma = {
    promoBanner: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    promoBannerProduct: {
      deleteMany: vi.fn(),
      createMany: vi.fn(),
    },
    $transaction: vi.fn(),
  }
  prisma.$transaction.mockImplementation(async (arg: unknown) => {
    if (typeof arg === 'function') return (arg as (tx: typeof prisma) => unknown)(prisma)
    return Promise.all(arg as Promise<unknown>[])
  })
  return { prisma }
})
vi.mock('@/lib/auth', () => ({ auth: vi.fn() }))

import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const ADMIN_SESSION = { user: { id: 'admin-1', role: 'admin' } }
const CUSTOMER_SESSION = { user: { id: 'user-001', role: 'customer' } }

const NOW = Date.now()
const HOUR = 3600_000
const DAY = 24 * HOUR

const CREATE_BODY = {
  title: 'Anime Fest',
  startsAt: new Date(NOW - HOUR).toISOString(),
  endsAt: new Date(NOW + 7 * DAY).toISOString(),
  isActive: true,
  products: [{ productId: 'prod-001', sortOrder: 0 }],
}

const FAKE_BANNER = {
  id: 'banner-001',
  title: 'Anime Fest',
  subtitle: null,
  startsAt: new Date(NOW - HOUR),
  endsAt: new Date(NOW + 7 * DAY),
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  products: [{ bannerId: 'banner-001', productId: 'prod-001', sortOrder: 0 }],
}

function jsonReq(url: string, method: string, body?: object) {
  return new NextRequest(`http://localhost${url}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
}

const paramsFor = (id: string) => ({ params: Promise.resolve({ id }) })

// ─── GET /api/admin/promo-banners ─────────────────────────────────────────────

describe('GET /api/admin/promo-banners', () => {
  beforeEach(() => vi.clearAllMocks())

  it('retorna 401 sem sessão', async () => {
    vi.mocked(auth).mockResolvedValue(null as never)

    const { GET } = await import('@/app/api/admin/promo-banners/route')
    const res = await GET()
    expect(res.status).toBe(401)
  })

  it('recusa usuário sem role admin/operator', async () => {
    vi.mocked(auth).mockResolvedValue(CUSTOMER_SESSION as never)

    const { GET } = await import('@/app/api/admin/promo-banners/route')
    const res = await GET()
    expect([401, 403]).toContain(res.status)
  })

  it('lista campanhas ordenadas por createdAt desc', async () => {
    vi.mocked(auth).mockResolvedValue(ADMIN_SESSION as never)
    vi.mocked(prisma.promoBanner.findMany).mockResolvedValue([
      { ...FAKE_BANNER, _count: { products: 1 } },
    ] as never)

    const { GET } = await import('@/app/api/admin/promo-banners/route')
    const res = await GET()

    expect(res.status).toBe(200)
    expect(prisma.promoBanner.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: expect.objectContaining({ createdAt: 'desc' }),
      })
    )
  })
})

// ─── POST /api/admin/promo-banners ────────────────────────────────────────────

describe('POST /api/admin/promo-banners', () => {
  beforeEach(() => vi.clearAllMocks())

  it('retorna 401 sem sessão', async () => {
    vi.mocked(auth).mockResolvedValue(null as never)

    const { POST } = await import('@/app/api/admin/promo-banners/route')
    const res = await POST(jsonReq('/api/admin/promo-banners', 'POST', CREATE_BODY))
    expect(res.status).toBe(401)
  })

  // Cenário 7.6: admin cria campanha com produtos
  it('Cenário 7.6: admin cria campanha → 201 com objeto PromoBanner incluindo id', async () => {
    vi.mocked(auth).mockResolvedValue(ADMIN_SESSION as never)
    vi.mocked(prisma.promoBanner.create).mockResolvedValue(FAKE_BANNER as never)

    const { POST } = await import('@/app/api/admin/promo-banners/route')
    const res = await POST(jsonReq('/api/admin/promo-banners', 'POST', CREATE_BODY))

    expect(res.status).toBe(201)
    const body = await res.json()
    expect(body).toHaveProperty('id')
    expect(body.title).toBe('Anime Fest')

    // produtos associados criados junto com a campanha
    expect(prisma.promoBanner.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          title: 'Anime Fest',
          isActive: true,
          products: expect.objectContaining({
            create: expect.arrayContaining([
              expect.objectContaining({ productId: 'prod-001', sortOrder: 0 }),
            ]),
          }),
        }),
      })
    )
  })

  it('retorna 400 com title vazio', async () => {
    vi.mocked(auth).mockResolvedValue(ADMIN_SESSION as never)

    const { POST } = await import('@/app/api/admin/promo-banners/route')
    const res = await POST(jsonReq('/api/admin/promo-banners', 'POST', { ...CREATE_BODY, title: '' }))

    expect(res.status).toBe(400)
    expect(prisma.promoBanner.create).not.toHaveBeenCalled()
  })

  it('retorna 400 quando startsAt >= endsAt', async () => {
    vi.mocked(auth).mockResolvedValue(ADMIN_SESSION as never)

    const { POST } = await import('@/app/api/admin/promo-banners/route')
    const res = await POST(
      jsonReq('/api/admin/promo-banners', 'POST', {
        ...CREATE_BODY,
        startsAt: new Date(NOW + 7 * DAY).toISOString(),
        endsAt: new Date(NOW - HOUR).toISOString(),
      })
    )

    expect(res.status).toBe(400)
    expect(prisma.promoBanner.create).not.toHaveBeenCalled()
  })
})

// ─── PATCH /api/admin/promo-banners/[id] ──────────────────────────────────────

describe('PATCH /api/admin/promo-banners/[id]', () => {
  beforeEach(() => vi.clearAllMocks())

  it('retorna 401 sem sessão', async () => {
    vi.mocked(auth).mockResolvedValue(null as never)

    const { PATCH } = await import('@/app/api/admin/promo-banners/[id]/route')
    const res = await PATCH(
      jsonReq('/api/admin/promo-banners/banner-001', 'PATCH', { isActive: false }),
      paramsFor('banner-001')
    )
    expect(res.status).toBe(401)
  })

  it('retorna 404 para campanha inexistente', async () => {
    vi.mocked(auth).mockResolvedValue(ADMIN_SESSION as never)
    vi.mocked(prisma.promoBanner.findUnique).mockResolvedValue(null)

    const { PATCH } = await import('@/app/api/admin/promo-banners/[id]/route')
    const res = await PATCH(
      jsonReq('/api/admin/promo-banners/banner-xyz', 'PATCH', { isActive: false }),
      paramsFor('banner-xyz')
    )
    expect(res.status).toBe(404)
  })

  // Cenário 7.7: admin desativa campanha
  it('Cenário 7.7: PATCH isActive=false → 200 e campanha desativada no DB', async () => {
    vi.mocked(auth).mockResolvedValue(ADMIN_SESSION as never)
    vi.mocked(prisma.promoBanner.findUnique).mockResolvedValue(FAKE_BANNER as never)
    vi.mocked(prisma.promoBanner.update).mockResolvedValue({ ...FAKE_BANNER, isActive: false } as never)

    const { PATCH } = await import('@/app/api/admin/promo-banners/[id]/route')
    const res = await PATCH(
      jsonReq('/api/admin/promo-banners/banner-001', 'PATCH', { isActive: false }),
      paramsFor('banner-001')
    )

    expect(res.status).toBe(200)
    expect(prisma.promoBanner.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ id: 'banner-001' }),
        data: expect.objectContaining({ isActive: false }),
      })
    )
  })

  it('PATCH com products substitui os PromoBannerProduct existentes (transação)', async () => {
    vi.mocked(auth).mockResolvedValue(ADMIN_SESSION as never)
    vi.mocked(prisma.promoBanner.findUnique).mockResolvedValue(FAKE_BANNER as never)
    vi.mocked(prisma.promoBanner.update).mockResolvedValue(FAKE_BANNER as never)
    vi.mocked(prisma.promoBannerProduct.deleteMany).mockResolvedValue({ count: 1 } as never)
    vi.mocked(prisma.promoBannerProduct.createMany).mockResolvedValue({ count: 2 } as never)

    const { PATCH } = await import('@/app/api/admin/promo-banners/[id]/route')
    const res = await PATCH(
      jsonReq('/api/admin/promo-banners/banner-001', 'PATCH', {
        products: [
          { productId: 'prod-002', sortOrder: 0 },
          { productId: 'prod-003', sortOrder: 1 },
        ],
      }),
      paramsFor('banner-001')
    )

    expect(res.status).toBe(200)
    expect(prisma.promoBannerProduct.deleteMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ bannerId: 'banner-001' }) })
    )
    expect(prisma.promoBannerProduct.createMany).toHaveBeenCalled()
  })
})

// ─── DELETE /api/admin/promo-banners/[id] ─────────────────────────────────────

describe('DELETE /api/admin/promo-banners/[id]', () => {
  beforeEach(() => vi.clearAllMocks())

  it('retorna 401 sem sessão', async () => {
    vi.mocked(auth).mockResolvedValue(null as never)

    const { DELETE } = await import('@/app/api/admin/promo-banners/[id]/route')
    const res = await DELETE(
      jsonReq('/api/admin/promo-banners/banner-001', 'DELETE'),
      paramsFor('banner-001')
    )
    expect(res.status).toBe(401)
  })

  it('retorna 404 para campanha inexistente', async () => {
    vi.mocked(auth).mockResolvedValue(ADMIN_SESSION as never)
    vi.mocked(prisma.promoBanner.findUnique).mockResolvedValue(null)

    const { DELETE } = await import('@/app/api/admin/promo-banners/[id]/route')
    const res = await DELETE(
      jsonReq('/api/admin/promo-banners/banner-xyz', 'DELETE'),
      paramsFor('banner-xyz')
    )
    expect(res.status).toBe(404)
  })

  // RN-M06-22: cascade delete de PromoBannerProduct garantido pelo schema
  it('RN-M06-22: DELETE remove a campanha (cascade nos PromoBannerProduct via schema)', async () => {
    vi.mocked(auth).mockResolvedValue(ADMIN_SESSION as never)
    vi.mocked(prisma.promoBanner.findUnique).mockResolvedValue(FAKE_BANNER as never)
    vi.mocked(prisma.promoBanner.delete).mockResolvedValue(FAKE_BANNER as never)

    const { DELETE } = await import('@/app/api/admin/promo-banners/[id]/route')
    const res = await DELETE(
      jsonReq('/api/admin/promo-banners/banner-001', 'DELETE'),
      paramsFor('banner-001')
    )

    expect(res.status).toBe(200)
    expect(prisma.promoBanner.delete).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ id: 'banner-001' }) })
    )
  })
})
