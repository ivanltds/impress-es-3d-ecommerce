// ─── Integration Tests: M05 — GET /api/universes ───
// Mapeia para spec M05, Feature 2 (Navegador de Universos) e Feature 7 (Páginas de Universo)
// FASE 2 — TEST AUTHORING (🔴 RED)
// A rota /api/universes ainda não existe — os imports irão falhar com "Cannot find module"

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

vi.mock('@/lib/db', () => ({
  prisma: {
    universe: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
    },
    product: {
      count: vi.fn(),
    },
  },
}))
vi.mock('@/lib/auth', () => ({ auth: vi.fn() }))

import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'

// ─── Fixtures ────────────────────────────────────────────────────────────────

const UNIVERSES_FIXTURE = [
  {
    id: 'u1',
    slug: 'gaming',
    name: 'Gaming',
    tagline: 'Para o gamer que existe em você',
    sortOrder: 1,
    comingSoon: false,
    ogImage: '/universes/gaming/og.jpg',
    publishedProductCount: 5,
  },
  {
    id: 'u2',
    slug: 'anime-nerd',
    name: 'Anime & Nerd',
    tagline: 'Seu universo nerd em 3D',
    sortOrder: 2,
    comingSoon: false,
    ogImage: '/universes/anime-nerd/og.jpg',
    publishedProductCount: 3,
  },
  {
    id: 'u3',
    slug: 'casa-decor',
    name: 'Casa & Decor',
    tagline: 'Personalização que decora',
    sortOrder: 3,
    comingSoon: false,
    ogImage: '/universes/casa-decor/og.jpg',
    publishedProductCount: 7,
  },
  {
    id: 'u4',
    slug: 'presentes',
    name: 'Presentes',
    tagline: 'O presente que só existe aqui',
    sortOrder: 4,
    comingSoon: false,
    ogImage: '/universes/presentes/og.jpg',
    publishedProductCount: 4,
  },
  {
    id: 'u5',
    slug: 'auto',
    name: 'Auto',
    tagline: 'Para quem vive sobre rodas',
    sortOrder: 5,
    comingSoon: true,
    ogImage: '/universes/auto/og.jpg',
    publishedProductCount: 0,
  },
]

// ─── GET /api/universes ───────────────────────────────────────────────────────

describe('GET /api/universes', () => {
  beforeEach(() => vi.clearAllMocks())

  it('retorna 200 mesmo sem autenticação (endpoint público)', async () => {
    vi.mocked(auth).mockResolvedValue(null)
    vi.mocked(prisma.universe.findMany).mockResolvedValue(UNIVERSES_FIXTURE as any)

    const { GET } = await import('@/app/api/universes/route')
    const res = await GET()
    expect(res.status).toBe(200)
  })

  it('retorna array de universos com publishedProductCount', async () => {
    vi.mocked(auth).mockResolvedValue(null)
    vi.mocked(prisma.universe.findMany).mockResolvedValue(UNIVERSES_FIXTURE as any)

    const { GET } = await import('@/app/api/universes/route')
    const res = await GET()
    const body = await res.json()

    expect(Array.isArray(body)).toBe(true)
    expect(body.length).toBe(5)
    expect(body[0]).toHaveProperty('publishedProductCount')
    expect(body[0].publishedProductCount).toBe(5)
  })

  it('ordena universos por sortOrder crescente', async () => {
    const shuffled = [...UNIVERSES_FIXTURE].reverse()
    vi.mocked(prisma.universe.findMany).mockResolvedValue(shuffled as any)

    const { GET } = await import('@/app/api/universes/route')
    const res = await GET()
    const body = await res.json()

    const orders = body.map((u: any) => u.sortOrder)
    expect(orders).toEqual([...orders].sort((a, b) => a - b))
  })

  it('universo com comingSoon: true é incluído no retorno', async () => {
    vi.mocked(prisma.universe.findMany).mockResolvedValue(UNIVERSES_FIXTURE as any)

    const { GET } = await import('@/app/api/universes/route')
    const res = await GET()
    const body = await res.json()

    const autoUniverse = body.find((u: any) => u.slug === 'auto')
    expect(autoUniverse).toBeDefined()
    expect(autoUniverse.comingSoon).toBe(true)
  })

  it('retorna array vazio se nenhum universo existe', async () => {
    vi.mocked(prisma.universe.findMany).mockResolvedValue([])

    const { GET } = await import('@/app/api/universes/route')
    const res = await GET()
    const body = await res.json()

    expect(body).toEqual([])
    expect(res.status).toBe(200)
  })

  it('retorna slug, name, tagline, ogImage, comingSoon, sortOrder em cada universo', async () => {
    vi.mocked(prisma.universe.findMany).mockResolvedValue(UNIVERSES_FIXTURE as any)

    const { GET } = await import('@/app/api/universes/route')
    const res = await GET()
    const body = await res.json()

    const gaming = body.find((u: any) => u.slug === 'gaming')
    expect(gaming).toMatchObject({
      slug: 'gaming',
      name: 'Gaming',
      tagline: expect.any(String),
      ogImage: expect.any(String),
      comingSoon: false,
      sortOrder: 1,
    })
  })

  it('universo sem produtos publicados e sem comingSoon não é filtrado pela API (filtro é no frontend)', async () => {
    const universeWithoutProducts = [
      ...UNIVERSES_FIXTURE,
      {
        id: 'u6',
        slug: 'esportes',
        name: 'Esportes',
        tagline: 'Para atletas',
        sortOrder: 6,
        comingSoon: false,
        ogImage: '/universes/esportes/og.jpg',
        publishedProductCount: 0,
      },
    ]
    vi.mocked(prisma.universe.findMany).mockResolvedValue(universeWithoutProducts as any)

    const { GET } = await import('@/app/api/universes/route')
    const res = await GET()
    const body = await res.json()

    // A API retorna todos — a lógica de ocultar (sem flag comingSoon) fica no componente
    expect(body.length).toBe(6)
  })
})
