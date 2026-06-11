// ─── Integration Tests: Admin Orders, Leads, Categories ───

import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/db', () => ({
  prisma: {
    order: { findMany: vi.fn() },
    lead: { findMany: vi.fn(), create: vi.fn(), update: vi.fn() },
    category: { findMany: vi.fn() },
  },
}))
vi.mock('@/lib/auth', () => ({ auth: vi.fn() }))

import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'

const AUTHED = { user: { id: 'admin-1' } }

function postReq(url: string, body: object) {
  return new Request(url, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
  })
}
function patchReq(url: string, body: object) {
  return new Request(url, {
    method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
  })
}

// ─── GET /api/admin/orders ────────────────────────────────────────────────────

describe('GET /api/admin/orders', () => {
  beforeEach(() => vi.clearAllMocks())

  it('retorna 401 sem sessão', async () => {
    vi.mocked(auth).mockResolvedValue(null)
    const { GET } = await import('@/app/api/admin/orders/route')
    expect((await GET()).status).toBe(401)
  })

  it('retorna lista de pedidos com items', async () => {
    vi.mocked(auth).mockResolvedValue(AUTHED as any)
    vi.mocked(prisma.order.findMany).mockResolvedValue([
      { id: 'o1', orderNumber: '3DP-00001', total: 99.9, items: [] },
    ] as any)
    const { GET } = await import('@/app/api/admin/orders/route')
    const res = await GET()
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body[0].orderNumber).toBe('3DP-00001')
  })

  it('retorna array vazio quando sem pedidos', async () => {
    vi.mocked(auth).mockResolvedValue(AUTHED as any)
    vi.mocked(prisma.order.findMany).mockResolvedValue([])
    const { GET } = await import('@/app/api/admin/orders/route')
    expect(await (await GET()).json()).toEqual([])
  })
})

// ─── GET /api/admin/leads ─────────────────────────────────────────────────────

describe('GET /api/admin/leads', () => {
  beforeEach(() => vi.clearAllMocks())

  it('retorna 401 sem sessão', async () => {
    vi.mocked(auth).mockResolvedValue(null)
    const { GET } = await import('@/app/api/admin/leads/route')
    expect((await GET()).status).toBe(401)
  })

  it('retorna lista de leads', async () => {
    vi.mocked(auth).mockResolvedValue(AUTHED as any)
    vi.mocked(prisma.lead.findMany).mockResolvedValue([
      { id: 'l1', name: 'Maria', phone: '11999', status: 'new' },
    ] as any)
    const { GET } = await import('@/app/api/admin/leads/route')
    const res = await GET()
    expect(res.status).toBe(200)
    expect((await res.json())[0].name).toBe('Maria')
  })
})

// ─── POST /api/admin/leads (público — sem auth) ───────────────────────────────

describe('POST /api/admin/leads', () => {
  beforeEach(() => vi.clearAllMocks())

  it('cria lead sem autenticação', async () => {
    vi.mocked(prisma.lead.create).mockResolvedValue({
      id: 'l2', name: 'João', phone: '11888', email: '', source: 'website',
      interestCollection: '', message: '', status: 'new', createdAt: new Date(),
    } as any)
    const { POST } = await import('@/app/api/admin/leads/route')
    const res = await POST(postReq('http://localhost/api/admin/leads', { name: 'João', phone: '11888' }) as any)
    expect(res.status).toBe(201)
    expect(prisma.lead.create).toHaveBeenCalledOnce()
  })

  it('usa "website" como source padrão', async () => {
    vi.mocked(prisma.lead.create).mockResolvedValue({ id: 'l3' } as any)
    const { POST } = await import('@/app/api/admin/leads/route')
    await POST(postReq('http://localhost/api/admin/leads', { name: 'Ana' }) as any)
    expect(prisma.lead.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ source: 'website' }) })
    )
  })
})

// ─── PATCH /api/admin/leads ───────────────────────────────────────────────────

describe('PATCH /api/admin/leads', () => {
  beforeEach(() => vi.clearAllMocks())

  it('retorna 401 sem sessão', async () => {
    vi.mocked(auth).mockResolvedValue(null)
    const { PATCH } = await import('@/app/api/admin/leads/route')
    const res = await PATCH(patchReq('http://localhost/api/admin/leads', { id: 'l1', status: 'contacted' }) as any)
    expect(res.status).toBe(401)
  })

  it('atualiza status do lead', async () => {
    vi.mocked(auth).mockResolvedValue(AUTHED as any)
    vi.mocked(prisma.lead.update).mockResolvedValue({} as any)
    const { PATCH } = await import('@/app/api/admin/leads/route')
    const res = await PATCH(patchReq('http://localhost/api/admin/leads', { id: 'l1', status: 'contacted' }) as any)
    expect(res.status).toBe(200)
    expect(prisma.lead.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'l1' } })
    )
  })
})

// ─── GET /api/admin/categories (público) ──────────────────────────────────────

describe('GET /api/admin/categories', () => {
  beforeEach(() => vi.clearAllMocks())

  it('retorna categorias sem autenticação', async () => {
    vi.mocked(prisma.category.findMany).mockResolvedValue([
      { id: 'cat-1', name: 'Decoração' },
    ] as any)
    const { GET } = await import('@/app/api/admin/categories/route')
    const res = await GET()
    expect(res.status).toBe(200)
    expect((await res.json())[0].name).toBe('Decoração')
  })

  it('retorna array vazio quando sem categorias', async () => {
    vi.mocked(prisma.category.findMany).mockResolvedValue([])
    const { GET } = await import('@/app/api/admin/categories/route')
    expect(await (await GET()).json()).toEqual([])
  })
})
