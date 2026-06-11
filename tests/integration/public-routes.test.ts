// ─── Integration Tests: Rotas Públicas ───
// GET  /api/health
// GET  /api/shipping
// POST /api/auth/register
// GET  /api/cart  (guest + authed)
// POST /api/cart
// DELETE /api/cart

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

vi.mock('@/lib/db', () => ({
  prisma: {
    user: { findUnique: vi.fn(), create: vi.fn(), update: vi.fn() },
    cart: { findUnique: vi.fn(), create: vi.fn() },
    cartItem: { create: vi.fn(), update: vi.fn(), findUnique: vi.fn(), delete: vi.fn() },
  },
}))
vi.mock('@/lib/auth', () => ({ auth: vi.fn() }))
vi.mock('@/lib/shipping', () => ({ calculateShipping: vi.fn() }))
vi.mock('bcryptjs', () => ({ default: { hash: vi.fn().mockResolvedValue('hashed_pw') } }))

import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'
import { calculateShipping } from '@/lib/shipping'

// ─── GET /api/health ──────────────────────────────────────────────────────────

describe('GET /api/health', () => {
  it('retorna status ok sem autenticação', async () => {
    const { GET } = await import('@/app/api/health/route')
    const res = await GET()
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.status).toBe('ok')
    expect(body).toHaveProperty('timestamp')
    expect(body).toHaveProperty('uptime')
  })
})

// ─── GET /api/shipping ────────────────────────────────────────────────────────

describe('GET /api/shipping', () => {
  beforeEach(() => vi.clearAllMocks())

  it('retorna 400 sem CEP', async () => {
    const { GET } = await import('@/app/api/shipping/route')
    const req = new NextRequest('http://localhost/api/shipping')
    const res = await GET(req as any)
    expect(res.status).toBe(400)
    expect((await res.json()).error).toMatch(/CEP/i)
  })

  it('retorna opções de frete com CEP válido', async () => {
    vi.mocked(calculateShipping).mockResolvedValue([
      { id: 1, name: 'PAC', price: 18.5, days: 7 },
    ] as any)
    const { GET } = await import('@/app/api/shipping/route')
    const req = new NextRequest('http://localhost/api/shipping?cep=01310100')
    const res = await GET(req as any)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body[0].name).toBe('PAC')
    expect(calculateShipping).toHaveBeenCalledWith('01310100')
  })
})

// ─── POST /api/auth/register ──────────────────────────────────────────────────

describe('POST /api/auth/register', () => {
  beforeEach(() => vi.clearAllMocks())

  function req(body: object) {
    return new Request('http://localhost/api/auth/register', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
    })
  }

  it('retorna 400 quando e-mail não enviado', async () => {
    const { POST } = await import('@/app/api/auth/register/route')
    const res = await POST(req({ password: '12345678' }))
    expect(res.status).toBe(400)
  })

  it('retorna 400 quando senha tem menos de 8 caracteres', async () => {
    const { POST } = await import('@/app/api/auth/register/route')
    const res = await POST(req({ email: 'a@b.com', password: '123' }))
    expect(res.status).toBe(400)
  })

  it('retorna 409 quando e-mail já cadastrado', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: 'u1' } as any)
    const { POST } = await import('@/app/api/auth/register/route')
    const res = await POST(req({ email: 'ja@existe.com', password: '12345678' }))
    expect(res.status).toBe(409)
    expect((await res.json()).error).toMatch(/já está cadastrado/i)
  })

  it('cria usuário com role "customer" e retorna 201', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null)
    vi.mocked(prisma.user.create).mockResolvedValue({
      id: 'u2', email: 'novo@user.com', role: 'customer',
    } as any)
    const { POST } = await import('@/app/api/auth/register/route')
    const res = await POST(req({ name: 'Novo', email: 'novo@user.com', password: '12345678' }))
    expect(res.status).toBe(201)
    const body = await res.json()
    expect(body.email).toBe('novo@user.com')
    expect(prisma.user.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ role: 'customer' }) })
    )
  })

  it('não retorna passwordHash na resposta', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null)
    vi.mocked(prisma.user.create).mockResolvedValue({ id: 'u3', email: 'a@b.com' } as any)
    const { POST } = await import('@/app/api/auth/register/route')
    const res = await POST(req({ email: 'a@b.com', password: '12345678' }))
    const body = await res.json()
    expect(body).not.toHaveProperty('passwordHash')
  })
})

// ─── GET /api/cart ────────────────────────────────────────────────────────────

describe('GET /api/cart', () => {
  beforeEach(() => vi.clearAllMocks())

  it('retorna { items: [] } para guest (sem sessão)', async () => {
    vi.mocked(auth).mockResolvedValue(null)
    const { GET } = await import('@/app/api/cart/route')
    const res = await GET()
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ items: [] })
  })

  it('retorna carrinho do usuário autenticado', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'u1' } } as any)
    vi.mocked(prisma.cart.findUnique).mockResolvedValue({
      id: 'cart-1', userId: 'u1', items: [{ id: 'ci-1', productId: 'p1', qty: 2 }],
    } as any)
    const { GET } = await import('@/app/api/cart/route')
    const res = await GET()
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.items).toHaveLength(1)
  })

  it('retorna { items: [] } quando usuário não tem carrinho', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'u2' } } as any)
    vi.mocked(prisma.cart.findUnique).mockResolvedValue(null)
    const { GET } = await import('@/app/api/cart/route')
    const body = await (await GET()).json()
    expect(body).toEqual({ items: [] })
  })
})

// ─── POST /api/cart ───────────────────────────────────────────────────────────

describe('POST /api/cart', () => {
  beforeEach(() => vi.clearAllMocks())

  const ITEM = { productId: 'p1', qty: 1, unitPrice: 49.9 }

  function postReq(body: object) {
    return new Request('http://localhost/api/cart', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
    })
  }

  it('retorna item guest sem persistir no banco', async () => {
    vi.mocked(auth).mockResolvedValue(null)
    const { POST } = await import('@/app/api/cart/route')
    const res = await POST(postReq(ITEM) as any)
    expect(res.status).toBe(201)
    const body = await res.json()
    expect(body.id).toMatch(/^guest_/)
    expect(prisma.cartItem.create).not.toHaveBeenCalled()
  })

  it('persiste item no banco para usuário autenticado', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'u1' } } as any)
    vi.mocked(prisma.cart.findUnique).mockResolvedValue({ id: 'cart-1' } as any)
    vi.mocked(prisma.cartItem.create).mockResolvedValue({ id: 'ci-1', ...ITEM } as any)
    const { POST } = await import('@/app/api/cart/route')
    const res = await POST(postReq(ITEM) as any)
    expect(res.status).toBe(201)
    expect(prisma.cartItem.create).toHaveBeenCalledOnce()
  })

  it('cria carrinho se usuário não tem um ainda', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'u2' } } as any)
    vi.mocked(prisma.cart.findUnique).mockResolvedValue(null)
    vi.mocked(prisma.cart.create).mockResolvedValue({ id: 'cart-new' } as any)
    vi.mocked(prisma.cartItem.create).mockResolvedValue({ id: 'ci-2' } as any)
    const { POST } = await import('@/app/api/cart/route')
    await POST(postReq(ITEM) as any)
    expect(prisma.cart.create).toHaveBeenCalledOnce()
  })
})

// ─── DELETE /api/cart ─────────────────────────────────────────────────────────

describe('DELETE /api/cart', () => {
  beforeEach(() => vi.clearAllMocks())

  function delReq(body: object) {
    return new Request('http://localhost/api/cart', {
      method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
    })
  }

  it('retorna { removed: true } para guest (sem banco)', async () => {
    vi.mocked(auth).mockResolvedValue(null)
    const { DELETE } = await import('@/app/api/cart/route')
    const res = await DELETE(delReq({ itemId: 'ci-1' }) as any)
    expect(res.status).toBe(200)
    expect((await res.json()).removed).toBe(true)
    expect(prisma.cartItem.delete).not.toHaveBeenCalled()
  })

  it('deleta item do banco para usuário autenticado', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'u1' } } as any)
    vi.mocked(prisma.cartItem.delete).mockResolvedValue({} as any)
    const { DELETE } = await import('@/app/api/cart/route')
    await DELETE(delReq({ itemId: 'ci-1' }) as any)
    expect(prisma.cartItem.delete).toHaveBeenCalledWith({ where: { id: 'ci-1' } })
  })
})
