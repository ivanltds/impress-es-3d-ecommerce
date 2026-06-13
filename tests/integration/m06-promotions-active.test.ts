// ─── Integration Tests: M06 — GET /api/promotions/active ───
// Spec: specs/M06-customer-area.spec.md — Feature 7 (Cenários 7.1, 7.2, 7.3, 7.5, 7.8)
// Regras: RN-M06-18 (campanha ativa), RN-M06-19 (startsAt mais recente),
//         RN-M06-20 (fallback por universo), RN-M06-21 (3 a 5 cards)
// Arquitetura: docs/architecture/M06-architecture.md — Seção 3
// FASE 2 — TEST AUTHORING (🔴 RED)
// A rota ainda não existe — imports dinâmicos falham com "Cannot find module".

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

vi.mock('@/lib/db', () => ({
  prisma: {
    promoBanner: { findFirst: vi.fn() },
    product: { findMany: vi.fn() },
  },
}))

import { prisma } from '@/lib/db'

// ─── Fixtures ─────────────────────────────────────────────────────────────────

function product(id: string, overrides: Record<string, unknown> = {}) {
  return {
    id,
    name: `Produto ${id}`,
    slug: `produto-${id}`,
    basePrice: 89.9,
    images: [`/products/${id}.jpg`],
    ...overrides,
  }
}

function bannerWith(productCount: number, overrides: Record<string, unknown> = {}) {
  return {
    id: 'banner-001',
    title: 'Promoção Gamer Week',
    subtitle: null,
    startsAt: new Date('2026-06-10T00:00:00Z'),
    endsAt: new Date('2026-06-20T23:59:59Z'),
    isActive: true,
    products: Array.from({ length: productCount }, (_, i) => ({
      bannerId: 'banner-001',
      productId: `prod-00${i + 1}`,
      sortOrder: i,
      product: product(`prod-00${i + 1}`),
    })),
    ...overrides,
  }
}

function getReq(query = '') {
  return new NextRequest(`http://localhost/api/promotions/active${query}`)
}

const FEATURED_4 = [product('feat-1'), product('feat-2'), product('feat-3'), product('feat-4')]

describe('GET /api/promotions/active', () => {
  beforeEach(() => vi.clearAllMocks())

  // Cenário 7.1: campanha ativa com período vigente e produtos é retornada
  it('Cenário 7.1: retorna campanha ativa com título e produtos', async () => {
    vi.mocked(prisma.promoBanner.findFirst).mockResolvedValue(bannerWith(3) as never)

    const { GET } = await import('@/app/api/promotions/active/route')
    const res = await GET(getReq())

    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.type).toBe('campaign')
    expect(body.title).toBe('Promoção Gamer Week')
    expect(body.products).toHaveLength(3)
    // fallback não consultado quando há campanha válida
    expect(prisma.product.findMany).not.toHaveBeenCalled()
  })

  // RN-M06-18: query de campanha ativa filtra isActive + período vigente
  it('Cenário 7.1 / RN-M06-18: query filtra isActive=true e startsAt<=now<=endsAt', async () => {
    vi.mocked(prisma.promoBanner.findFirst).mockResolvedValue(bannerWith(3) as never)

    const { GET } = await import('@/app/api/promotions/active/route')
    await GET(getReq())

    expect(prisma.promoBanner.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          isActive: true,
          startsAt: expect.objectContaining({ lte: expect.any(Date) }),
          endsAt: expect.objectContaining({ gte: expect.any(Date) }),
        }),
      })
    )
  })

  // RN-M06-19: múltiplas campanhas solapadas → a de startsAt mais recente vence
  it('RN-M06-19: ordena por startsAt desc para escolher a campanha mais recente', async () => {
    vi.mocked(prisma.promoBanner.findFirst).mockResolvedValue(bannerWith(3) as never)

    const { GET } = await import('@/app/api/promotions/active/route')
    await GET(getReq())

    expect(prisma.promoBanner.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: expect.objectContaining({ startsAt: 'desc' }),
      })
    )
  })

  // Cenário 7.5: campanha expirada não retorna — a query já a exclui → fallback
  it('Cenário 7.5: sem campanha vigente (expirada) entra o fallback de destaques', async () => {
    // a query com filtro endsAt >= now não encontra a campanha expirada
    vi.mocked(prisma.promoBanner.findFirst).mockResolvedValue(null)
    vi.mocked(prisma.product.findMany).mockResolvedValue(FEATURED_4 as never)

    const { GET } = await import('@/app/api/promotions/active/route')
    const res = await GET(getReq())

    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.type).toBe('featured')
    // título da campanha expirada NÃO exibido
    expect(body.title).toBeNull()
    expect(body.products).toHaveLength(4)
    expect(prisma.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ isFeatured: true }),
      })
    )
  })

  // Cenário 7.8: campanha com menos de 3 produtos não é válida → fallback
  it('Cenário 7.8: campanha sem produtos suficientes (<3) cai no fallback', async () => {
    vi.mocked(prisma.promoBanner.findFirst).mockResolvedValue(bannerWith(0) as never)
    vi.mocked(prisma.product.findMany).mockResolvedValue(FEATURED_4 as never)

    const { GET } = await import('@/app/api/promotions/active/route')
    const res = await GET(getReq())

    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.type).toBe('featured')
    expect(body.title).toBeNull()
    expect(prisma.product.findMany).toHaveBeenCalled()
  })

  // Cenário 7.2: fallback filtrado pelo universo preferido
  it('Cenário 7.2: ?universeSlug=gaming filtra destaques do universo via ProductUniverse', async () => {
    vi.mocked(prisma.promoBanner.findFirst).mockResolvedValue(null)
    vi.mocked(prisma.product.findMany).mockResolvedValue(FEATURED_4 as never)

    const { GET } = await import('@/app/api/promotions/active/route')
    const res = await GET(getReq('?universeSlug=gaming'))

    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.type).toBe('featured')
    expect(prisma.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          isFeatured: true,
          universes: expect.objectContaining({
            some: expect.objectContaining({
              universe: expect.objectContaining({ slug: 'gaming' }),
            }),
          }),
        }),
      })
    )
  })

  // Cenário 7.3: fallback global sem filtro de universo
  it('Cenário 7.3: sem universeSlug retorna destaques globais (sem filtro de universo)', async () => {
    vi.mocked(prisma.promoBanner.findFirst).mockResolvedValue(null)
    vi.mocked(prisma.product.findMany).mockResolvedValue(FEATURED_4 as never)

    const { GET } = await import('@/app/api/promotions/active/route')
    const res = await GET(getReq())

    expect(res.status).toBe(200)
    const callArgs = vi.mocked(prisma.product.findMany).mock.calls[0][0] as {
      where?: Record<string, unknown>
    }
    expect(callArgs?.where?.universes).toBeUndefined()
  })

  // Cenário 7.3 (continuação): universo com poucos destaques → fallback global
  it('Cenário 7.3: universo com <3 destaques recorre ao fallback global', async () => {
    vi.mocked(prisma.promoBanner.findFirst).mockResolvedValue(null)
    vi.mocked(prisma.product.findMany)
      .mockResolvedValueOnce([product('feat-1'), product('feat-2')] as never) // universo: insuficiente
      .mockResolvedValueOnce(FEATURED_4 as never) // global

    const { GET } = await import('@/app/api/promotions/active/route')
    const res = await GET(getReq('?universeSlug=auto'))

    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.products).toHaveLength(4)
    expect(prisma.product.findMany).toHaveBeenCalledTimes(2)
  })

  // RN-M06-21: menos de 3 produtos no total → seção não renderizada (204)
  it('RN-M06-21: com menos de 3 produtos disponíveis responde 204 (sem conteúdo)', async () => {
    vi.mocked(prisma.promoBanner.findFirst).mockResolvedValue(null)
    vi.mocked(prisma.product.findMany).mockResolvedValue([product('feat-1'), product('feat-2')] as never)

    const { GET } = await import('@/app/api/promotions/active/route')
    const res = await GET(getReq())

    expect(res.status).toBe(204)
  })

  // RN-M06-21: máximo de 5 produtos
  it('RN-M06-21: limita a 5 produtos (take: 5)', async () => {
    vi.mocked(prisma.promoBanner.findFirst).mockResolvedValue(null)
    vi.mocked(prisma.product.findMany).mockResolvedValue(FEATURED_4 as never)

    const { GET } = await import('@/app/api/promotions/active/route')
    await GET(getReq())

    expect(prisma.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: 5 })
    )
  })
})
