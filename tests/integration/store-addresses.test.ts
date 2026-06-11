// ─── Integration Tests: Store Addresses CRUD ───
// GET/POST  /api/admin/store-addresses
// PATCH/DELETE /api/admin/store-addresses/[id]

import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/db', () => ({
  prisma: {
    storeAddress: {
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}))

vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
}))

import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'

const FAKE_ADDRESS = {
  id: 'addr-1',
  name: 'Matriz SP',
  phone: '11999999999',
  email: 'loja@exemplo.com',
  document: '12345678000190',
  street: 'Av. Paulista',
  number: '1000',
  complement: null,
  neighborhood: 'Bela Vista',
  city: 'São Paulo',
  state: 'SP',
  cep: '01310-100',
  isActive: true,
  createdAt: new Date(),
}

// ─── GET /api/admin/store-addresses ──────────────────────────────────────────

describe('GET /api/admin/store-addresses', () => {
  beforeEach(() => vi.clearAllMocks())

  it('retorna 401 sem sessão', async () => {
    vi.mocked(auth).mockResolvedValue(null)
    const { GET } = await import('@/app/api/admin/store-addresses/route')
    const res = await GET()
    expect(res.status).toBe(401)
  })

  it('retorna lista de endereços', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'admin-1' } } as any)
    vi.mocked(prisma.storeAddress.findMany).mockResolvedValue([FAKE_ADDRESS])

    const { GET } = await import('@/app/api/admin/store-addresses/route')
    const res = await GET()
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toHaveLength(1)
    expect(body[0].name).toBe('Matriz SP')
  })

  it('retorna array vazio quando não há endereços', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'admin-1' } } as any)
    vi.mocked(prisma.storeAddress.findMany).mockResolvedValue([])

    const { GET } = await import('@/app/api/admin/store-addresses/route')
    const res = await GET()
    const body = await res.json()
    expect(body).toEqual([])
  })
})

// ─── POST /api/admin/store-addresses ─────────────────────────────────────────

describe('POST /api/admin/store-addresses', () => {
  beforeEach(() => vi.clearAllMocks())

  it('retorna 401 sem sessão', async () => {
    vi.mocked(auth).mockResolvedValue(null)
    const { POST } = await import('@/app/api/admin/store-addresses/route')
    const req = new Request('http://localhost/api/admin/store-addresses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Teste', street: 'Rua X', number: '1', city: 'SP', state: 'SP', cep: '01310100' }),
    })
    const res = await POST(req as any)
    expect(res.status).toBe(401)
  })

  it('retorna 400 quando campos obrigatórios faltam', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'admin-1' } } as any)
    const { POST } = await import('@/app/api/admin/store-addresses/route')
    const req = new Request('http://localhost/api/admin/store-addresses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Só Nome' }), // faltam street, number, city, state, cep
    })
    const res = await POST(req as any)
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toMatch(/obrigatórios/i)
  })

  it('cria endereço com dados completos', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'admin-1' } } as any)
    vi.mocked(prisma.storeAddress.create).mockResolvedValue(FAKE_ADDRESS)

    const { POST } = await import('@/app/api/admin/store-addresses/route')
    const req = new Request('http://localhost/api/admin/store-addresses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Matriz SP',
        street: 'Av. Paulista',
        number: '1000',
        city: 'São Paulo',
        state: 'sp', // minúsculo — deve ser normalizado para SP
        cep: '01310100',
      }),
    })
    const res = await POST(req as any)
    expect(res.status).toBe(201)
    // state deve ser uppercase no create
    expect(prisma.storeAddress.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ state: 'SP' }),
      })
    )
  })

  it('formata CEP no padrão XXXXX-XXX', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'admin-1' } } as any)
    vi.mocked(prisma.storeAddress.create).mockResolvedValue({ ...FAKE_ADDRESS, cep: '01310-100' })

    const { POST } = await import('@/app/api/admin/store-addresses/route')
    const req = new Request('http://localhost/api/admin/store-addresses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Teste', street: 'Rua A', number: '1',
        city: 'SP', state: 'SP', cep: '01310100', // sem hífen
      }),
    })
    await POST(req as any)
    expect(prisma.storeAddress.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ cep: '01310-100' }),
      })
    )
  })
})

// ─── PATCH /api/admin/store-addresses/[id] ───────────────────────────────────

describe('PATCH /api/admin/store-addresses/[id]', () => {
  beforeEach(() => vi.clearAllMocks())

  it('retorna 401 sem sessão', async () => {
    vi.mocked(auth).mockResolvedValue(null)
    const { PATCH } = await import('@/app/api/admin/store-addresses/[id]/route')
    const req = new Request('http://localhost/api/admin/store-addresses/addr-1', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: false }),
    })
    const res = await PATCH(req as any, { params: Promise.resolve({ id: 'addr-1' }) })
    expect(res.status).toBe(401)
  })

  it('atualiza apenas campos enviados (patch parcial)', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'admin-1' } } as any)
    vi.mocked(prisma.storeAddress.update).mockResolvedValue({ ...FAKE_ADDRESS, isActive: false })

    const { PATCH } = await import('@/app/api/admin/store-addresses/[id]/route')
    const req = new Request('http://localhost/api/admin/store-addresses/addr-1', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: false }),
    })
    const res = await PATCH(req as any, { params: Promise.resolve({ id: 'addr-1' }) })
    expect(res.status).toBe(200)
    expect(prisma.storeAddress.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'addr-1' },
        data: { isActive: false },
      })
    )
  })
})

// ─── DELETE /api/admin/store-addresses/[id] ──────────────────────────────────

describe('DELETE /api/admin/store-addresses/[id]', () => {
  beforeEach(() => vi.clearAllMocks())

  it('retorna 401 sem sessão', async () => {
    vi.mocked(auth).mockResolvedValue(null)
    const { DELETE } = await import('@/app/api/admin/store-addresses/[id]/route')
    const req = new Request('http://localhost/api/admin/store-addresses/addr-1', { method: 'DELETE' })
    const res = await DELETE(req as any, { params: Promise.resolve({ id: 'addr-1' }) })
    expect(res.status).toBe(401)
  })

  it('deleta e retorna 200', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'admin-1' } } as any)
    vi.mocked(prisma.storeAddress.delete).mockResolvedValue(FAKE_ADDRESS)

    const { DELETE } = await import('@/app/api/admin/store-addresses/[id]/route')
    const req = new Request('http://localhost/api/admin/store-addresses/addr-1', { method: 'DELETE' })
    const res = await DELETE(req as any, { params: Promise.resolve({ id: 'addr-1' }) })
    expect(res.status).toBe(200)
    expect(prisma.storeAddress.delete).toHaveBeenCalledWith({ where: { id: 'addr-1' } })
  })
})
