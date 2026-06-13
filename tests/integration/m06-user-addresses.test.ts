// ─── Integration Tests: M06 — APIs /api/user/addresses ───
// Spec: specs/M06-customer-area.spec.md — Feature 5 (Cenários 5.1, 5.3, 5.4, 5.5, 5.6)
// Arquitetura: docs/architecture/M06-architecture.md — Seção 3
// FASE 2 — TEST AUTHORING (🔴 RED)
// As rotas ainda não existem — os imports dinâmicos falham com "Cannot find module"
// (padrão RED estabelecido em m05-user-preference.test.ts).

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

vi.mock('@/lib/db', () => {
  const prisma = {
    address: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
      delete: vi.fn(),
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

const ADDR_USER_001 = {
  id: 'addr-1',
  userId: 'user-001',
  label: 'Casa',
  recipientName: 'Maria Silva',
  cep: '01310-100',
  street: 'Av. Paulista',
  number: '1000',
  complement: 'Apto 42',
  district: 'Bela Vista',
  city: 'São Paulo',
  state: 'SP',
  country: 'Brasil',
  isDefault: true,
}

const ADDR_2_USER_001 = { ...ADDR_USER_001, id: 'addr-2', label: 'Trabalho', isDefault: false }

const VALID_BODY = {
  label: 'Casa',
  recipientName: 'Maria Silva',
  cep: '01310-100',
  street: 'Av. Paulista',
  number: '1000',
  complement: 'Apto 42',
  district: 'Bela Vista',
  city: 'São Paulo',
  state: 'SP',
}

function jsonReq(url: string, method: string, body?: object) {
  return new NextRequest(`http://localhost${url}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
}

const paramsFor = (id: string) => ({ params: Promise.resolve({ id }) })

// ─── GET /api/user/addresses ──────────────────────────────────────────────────

describe('GET /api/user/addresses', () => {
  beforeEach(() => vi.clearAllMocks())

  it('retorna 401 sem sessão', async () => {
    vi.mocked(auth).mockResolvedValue(null as never)

    const { GET } = await import('@/app/api/user/addresses/route')
    const res = await GET()
    expect(res.status).toBe(401)
  })

  // Cenário 5.1: endereços do usuário logado vindos do DB
  it('Cenário 5.1: retorna apenas os endereços do usuário da sessão', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'user-001' } } as never)
    vi.mocked(prisma.address.findMany).mockResolvedValue([ADDR_USER_001, ADDR_2_USER_001] as never)

    const { GET } = await import('@/app/api/user/addresses/route')
    const res = await GET()

    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toHaveLength(2)
    expect(prisma.address.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ userId: 'user-001' }),
      })
    )
  })
})

// ─── POST /api/user/addresses ─────────────────────────────────────────────────

describe('POST /api/user/addresses', () => {
  beforeEach(() => vi.clearAllMocks())

  it('retorna 401 sem sessão', async () => {
    vi.mocked(auth).mockResolvedValue(null as never)

    const { POST } = await import('@/app/api/user/addresses/route')
    const res = await POST(jsonReq('/api/user/addresses', 'POST', VALID_BODY))
    expect(res.status).toBe(401)
  })

  // Cenário 5.4 (server-side): campos obrigatórios — RN-M06-12
  it('Cenário 5.4: retorna 400 quando campos obrigatórios faltam e não cria registro', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'user-001' } } as never)

    const { POST } = await import('@/app/api/user/addresses/route')
    // sem cep, street, number, district, city, state, recipientName
    const res = await POST(jsonReq('/api/user/addresses', 'POST', { label: 'Casa' }))

    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body).toHaveProperty('error')
    expect(prisma.address.create).not.toHaveBeenCalled()
  })

  it('Cenário 5.4: complement e label são opcionais (RN-M06-12) — cria com 201', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'user-001' } } as never)
    vi.mocked(prisma.address.create).mockResolvedValue(ADDR_USER_001 as never)

    const { POST } = await import('@/app/api/user/addresses/route')
    const { complement: _c, label: _l, ...required } = VALID_BODY
    const res = await POST(jsonReq('/api/user/addresses', 'POST', required))

    expect(res.status).toBe(201)
  })

  // Cenário 5.3: cria endereço associado ao userId da sessão
  it('Cenário 5.3: cria endereço no DB vinculado ao userId do usuário logado', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'user-001' } } as never)
    vi.mocked(prisma.address.create).mockResolvedValue(ADDR_USER_001 as never)

    const { POST } = await import('@/app/api/user/addresses/route')
    const res = await POST(jsonReq('/api/user/addresses', 'POST', VALID_BODY))

    expect(res.status).toBe(201)
    expect(prisma.address.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          userId: 'user-001',
          cep: '01310-100',
          street: 'Av. Paulista',
          number: '1000',
          city: 'São Paulo',
          state: 'SP',
        }),
      })
    )
    const body = await res.json()
    expect(body).toHaveProperty('id')
  })
})

// ─── PATCH /api/user/addresses/[id] ──────────────────────────────────────────

describe('PATCH /api/user/addresses/[id]', () => {
  beforeEach(() => vi.clearAllMocks())

  it('retorna 401 sem sessão', async () => {
    vi.mocked(auth).mockResolvedValue(null as never)

    const { PATCH } = await import('@/app/api/user/addresses/[id]/route')
    const res = await PATCH(jsonReq('/api/user/addresses/addr-1', 'PATCH', { isDefault: true }), paramsFor('addr-1'))
    expect(res.status).toBe(401)
  })

  it('retorna 404 quando o endereço não existe', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'user-001' } } as never)
    vi.mocked(prisma.address.findUnique).mockResolvedValue(null)

    const { PATCH } = await import('@/app/api/user/addresses/[id]/route')
    const res = await PATCH(jsonReq('/api/user/addresses/addr-x', 'PATCH', { isDefault: true }), paramsFor('addr-x'))
    expect(res.status).toBe(404)
  })

  it('retorna 404 quando o endereço pertence a outro usuário (não vaza existência)', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'user-002' } } as never)
    vi.mocked(prisma.address.findUnique).mockResolvedValue(ADDR_USER_001 as never) // dono: user-001

    const { PATCH } = await import('@/app/api/user/addresses/[id]/route')
    const res = await PATCH(jsonReq('/api/user/addresses/addr-1', 'PATCH', { isDefault: true }), paramsFor('addr-1'))
    expect(res.status).toBe(404)
  })

  // Cenário 5.6: marcar como padrão — atômico (RN-M06-10 / DA-M06-03)
  it('Cenário 5.6: isDefault=true executa transação que desmarca os demais e marca o alvo', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'user-001' } } as never)
    vi.mocked(prisma.address.findUnique).mockResolvedValue(ADDR_2_USER_001 as never)
    vi.mocked(prisma.address.updateMany).mockResolvedValue({ count: 1 } as never)
    vi.mocked(prisma.address.update).mockResolvedValue({ ...ADDR_2_USER_001, isDefault: true } as never)

    const { PATCH } = await import('@/app/api/user/addresses/[id]/route')
    const res = await PATCH(jsonReq('/api/user/addresses/addr-2', 'PATCH', { isDefault: true }), paramsFor('addr-2'))

    expect(res.status).toBe(200)
    // operação atômica
    expect(prisma.$transaction).toHaveBeenCalled()
    // todos os endereços do usuário desmarcados
    expect(prisma.address.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ userId: 'user-001' }),
        data: expect.objectContaining({ isDefault: false }),
      })
    )
    // endereço alvo marcado como padrão
    expect(prisma.address.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ id: 'addr-2' }),
        data: expect.objectContaining({ isDefault: true }),
      })
    )
  })

  it('atualiza campos comuns (ex: label) sem transação de default', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'user-001' } } as never)
    vi.mocked(prisma.address.findUnique).mockResolvedValue(ADDR_USER_001 as never)
    vi.mocked(prisma.address.update).mockResolvedValue({ ...ADDR_USER_001, label: 'Escritório' } as never)

    const { PATCH } = await import('@/app/api/user/addresses/[id]/route')
    const res = await PATCH(jsonReq('/api/user/addresses/addr-1', 'PATCH', { label: 'Escritório' }), paramsFor('addr-1'))

    expect(res.status).toBe(200)
    expect(prisma.address.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ id: 'addr-1' }),
        data: expect.objectContaining({ label: 'Escritório' }),
      })
    )
  })
})

// ─── DELETE /api/user/addresses/[id] ─────────────────────────────────────────

describe('DELETE /api/user/addresses/[id]', () => {
  beforeEach(() => vi.clearAllMocks())

  it('retorna 401 sem sessão', async () => {
    vi.mocked(auth).mockResolvedValue(null as never)

    const { DELETE } = await import('@/app/api/user/addresses/[id]/route')
    const res = await DELETE(jsonReq('/api/user/addresses/addr-1', 'DELETE'), paramsFor('addr-1'))
    expect(res.status).toBe(401)
  })

  it('retorna 404 quando o endereço pertence a outro usuário', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'user-002' } } as never)
    vi.mocked(prisma.address.findUnique).mockResolvedValue(ADDR_USER_001 as never)

    const { DELETE } = await import('@/app/api/user/addresses/[id]/route')
    const res = await DELETE(jsonReq('/api/user/addresses/addr-1', 'DELETE'), paramsFor('addr-1'))

    expect(res.status).toBe(404)
    expect(prisma.address.delete).not.toHaveBeenCalled()
  })

  // Cenário 5.5: exclusão definitiva (hard delete — RN-M06-11)
  it('Cenário 5.5: exclui o registro do banco (hard delete) e retorna 200', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'user-001' } } as never)
    vi.mocked(prisma.address.findUnique).mockResolvedValue(ADDR_USER_001 as never)
    vi.mocked(prisma.address.delete).mockResolvedValue(ADDR_USER_001 as never)

    const { DELETE } = await import('@/app/api/user/addresses/[id]/route')
    const res = await DELETE(jsonReq('/api/user/addresses/addr-1', 'DELETE'), paramsFor('addr-1'))

    expect(res.status).toBe(200)
    expect(prisma.address.delete).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ id: 'addr-1' }) })
    )
  })
})
