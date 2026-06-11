// ─── Integration Tests: Admin Products ───
// GET    /api/admin/products
// POST   /api/admin/products/create
// GET    /api/admin/products/[id]
// PATCH  /api/admin/products/[id]

import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/db', () => ({
  prisma: {
    product: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
  },
}))
vi.mock('@/lib/auth', () => ({ auth: vi.fn() }))

import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'

const AUTHED = { user: { id: 'admin-1', role: 'admin' } }
const FAKE_PRODUCT = {
  id: 'prod-1', name: 'Cubo 3D', slug: 'cubo-3d',
  shortDescription: 'Cubo decorativo', longDescription: '',
  basePrice: 49.9, categoryId: null, collectionId: null,
  images: [], isCustomizable: false, customizationLevel: 'none',
  customizationSchema: null, material: 'PLA', estimatedProductionTime: 2,
  productType: 'standard', status: 'active', createdAt: new Date(),
  category: null,
}

function req(method: string, body?: object) {
  return new Request('http://localhost/api/admin/products', {
    method, headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })
}

// ─── GET /api/admin/products ──────────────────────────────────────────────────

describe('GET /api/admin/products', () => {
  beforeEach(() => vi.clearAllMocks())

  it('retorna 401 sem sessão', async () => {
    vi.mocked(auth).mockResolvedValue(null)
    const { GET } = await import('@/app/api/admin/products/route')
    expect((await GET()).status).toBe(401)
  })

  it('retorna lista de produtos', async () => {
    vi.mocked(auth).mockResolvedValue(AUTHED as any)
    vi.mocked(prisma.product.findMany).mockResolvedValue([FAKE_PRODUCT] as any)
    const { GET } = await import('@/app/api/admin/products/route')
    const res = await GET()
    expect(res.status).toBe(200)
    expect(await res.json()).toHaveLength(1)
  })
})

// ─── POST /api/admin/products/create ─────────────────────────────────────────

describe('POST /api/admin/products/create', () => {
  beforeEach(() => vi.clearAllMocks())

  it('retorna 401 sem sessão', async () => {
    vi.mocked(auth).mockResolvedValue(null)
    const { POST } = await import('@/app/api/admin/products/create/route')
    const res = await POST(req('POST', { name: 'X', slug: 'x', shortDescription: 'X', basePrice: 10 }) as any)
    expect(res.status).toBe(401)
  })

  it('retorna 400 quando campos obrigatórios faltam', async () => {
    vi.mocked(auth).mockResolvedValue(AUTHED as any)
    const { POST } = await import('@/app/api/admin/products/create/route')
    const res = await POST(req('POST', { name: 'Só nome' }) as any)
    expect(res.status).toBe(400)
    expect((await res.json()).error).toMatch(/obrigatórios/i)
  })

  it('cria produto com dados válidos', async () => {
    vi.mocked(auth).mockResolvedValue(AUTHED as any)
    vi.mocked(prisma.product.create).mockResolvedValue(FAKE_PRODUCT as any)
    const { POST } = await import('@/app/api/admin/products/create/route')
    const res = await POST(req('POST', {
      name: 'Cubo 3D', slug: 'cubo-3d', shortDescription: 'Cubo', basePrice: 49.9,
    }) as any)
    expect(res.status).toBe(201)
    expect(prisma.product.create).toHaveBeenCalledOnce()
  })
})

// ─── GET /api/admin/products/[id] ────────────────────────────────────────────

describe('GET /api/admin/products/[id]', () => {
  beforeEach(() => vi.clearAllMocks())

  it('retorna 401 sem sessão', async () => {
    vi.mocked(auth).mockResolvedValue(null)
    const { GET } = await import('@/app/api/admin/products/[id]/route')
    const res = await GET(req('GET') as any, { params: Promise.resolve({ id: 'prod-1' }) })
    expect(res.status).toBe(401)
  })

  it('retorna 404 quando produto não existe', async () => {
    vi.mocked(auth).mockResolvedValue(AUTHED as any)
    vi.mocked(prisma.product.findUnique).mockResolvedValue(null)
    const { GET } = await import('@/app/api/admin/products/[id]/route')
    const res = await GET(req('GET') as any, { params: Promise.resolve({ id: 'nao-existe' }) })
    expect(res.status).toBe(404)
  })

  it('retorna produto quando existe', async () => {
    vi.mocked(auth).mockResolvedValue(AUTHED as any)
    vi.mocked(prisma.product.findUnique).mockResolvedValue(FAKE_PRODUCT as any)
    const { GET } = await import('@/app/api/admin/products/[id]/route')
    const res = await GET(req('GET') as any, { params: Promise.resolve({ id: 'prod-1' }) })
    expect(res.status).toBe(200)
    expect((await res.json()).slug).toBe('cubo-3d')
  })
})

// ─── PATCH /api/admin/products/[id] ──────────────────────────────────────────

describe('PATCH /api/admin/products/[id]', () => {
  beforeEach(() => vi.clearAllMocks())

  it('retorna 401 sem sessão', async () => {
    vi.mocked(auth).mockResolvedValue(null)
    const { PATCH } = await import('@/app/api/admin/products/[id]/route')
    const res = await PATCH(req('PATCH', { name: 'Novo' }) as any, { params: Promise.resolve({ id: 'prod-1' }) })
    expect(res.status).toBe(401)
  })

  it('atualiza produto', async () => {
    vi.mocked(auth).mockResolvedValue(AUTHED as any)
    vi.mocked(prisma.product.update).mockResolvedValue({ ...FAKE_PRODUCT, name: 'Cubo Atualizado' } as any)
    const { PATCH } = await import('@/app/api/admin/products/[id]/route')
    const res = await PATCH(req('PATCH', { name: 'Cubo Atualizado', slug: 'cubo-3d', shortDescription: 'X', basePrice: 59.9 }) as any, { params: Promise.resolve({ id: 'prod-1' }) })
    expect(res.status).toBe(200)
    expect(prisma.product.update).toHaveBeenCalledWith(expect.objectContaining({ where: { id: 'prod-1' } }))
  })
})
