// ─── Integration Tests: FF08 — Admin Universe Routes ───
// Mapeia para spec FF08, Features 1–4
// FASE 2 — TEST AUTHORING (🔴 RED)
// As rotas /api/admin/universes/* ainda NÃO existem — os imports irão falhar com "Cannot find module"
// Comportamento RED esperado.

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// ─── Mocks ───────────────────────────────────────────────────────────────────

vi.mock('@/lib/db', () => ({
  prisma: {
    universe: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}))

vi.mock('@/lib/auth', () => ({ auth: vi.fn() }))

vi.mock('@vercel/blob', () => ({
  put: vi.fn().mockResolvedValue({
    url: 'https://mock.blob.vercel-storage.com/universes/gaming/card.png',
    pathname: 'universes/gaming/card.png',
  }),
}))

import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'
import { put } from '@vercel/blob'

// ─── Fixtures ────────────────────────────────────────────────────────────────

const AUTHED_ADMIN = { user: { id: 'admin-1', role: 'admin' } }

const UNIVERSE_FIXTURE_BASE = {
  id: 'u1',
  slug: 'gaming',
  name: 'Gaming',
  comingSoon: false,
  sortOrder: 1,
  cardImageUrl: null,
  heroImageUrl: null,
  tagline: null,
  bullets: [],
  createdAt: new Date(),
  updatedAt: new Date(),
}

const UNIVERSES_FIXTURE = [
  { ...UNIVERSE_FIXTURE_BASE, id: 'u1', slug: 'gaming', name: 'Gaming', sortOrder: 1 },
  { ...UNIVERSE_FIXTURE_BASE, id: 'u2', slug: 'anime-nerd', name: 'Anime & Nerd', sortOrder: 2 },
  { ...UNIVERSE_FIXTURE_BASE, id: 'u3', slug: 'casa-decor', name: 'Casa & Decor', sortOrder: 3 },
  { ...UNIVERSE_FIXTURE_BASE, id: 'u4', slug: 'presentes', name: 'Presentes', sortOrder: 4 },
  { ...UNIVERSE_FIXTURE_BASE, id: 'u5', slug: 'auto', name: 'Auto', sortOrder: 5, comingSoon: true },
]

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getReq(url: string) {
  return new NextRequest(url, { method: 'GET' })
}

function patchReq(url: string, body: object) {
  return new NextRequest(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

async function buildUploadRequest(url: string, mimeType: string, sizeBytes: number): Promise<NextRequest> {
  const formData = new FormData()
  const bytes = new Uint8Array(sizeBytes).fill(0)
  const file = new File([bytes], 'image.png', { type: mimeType })
  formData.append('file', file)
  formData.append('type', 'card')
  return new NextRequest(url, { method: 'POST', body: formData })
}

async function buildTypedUploadRequest(url: string, mimeType: string, sizeBytes: number, type: 'card' | 'hero'): Promise<NextRequest> {
  const formData = new FormData()
  const bytes = new Uint8Array(sizeBytes).fill(0)
  const filename = type === 'card' ? 'card.png' : 'hero.png'
  const file = new File([bytes], filename, { type: mimeType })
  formData.append('file', file)
  formData.append('type', type)
  return new NextRequest(url, { method: 'POST', body: formData })
}

// ─── GET /api/admin/universes ─────────────────────────────────────────────────

describe('GET /api/admin/universes', () => {
  beforeEach(() => vi.clearAllMocks())

  it('retorna 401 sem autenticação', async () => {
    vi.mocked(auth).mockResolvedValue(null)
    const { GET } = await import('@/app/api/admin/universes/route')
    const res = await GET(getReq('http://localhost/api/admin/universes'))
    expect(res.status).toBe(401)
  })

  it('retorna 200 com array de universos quando autenticado', async () => {
    vi.mocked(auth).mockResolvedValue(AUTHED_ADMIN as any)
    vi.mocked(prisma.universe.findMany).mockResolvedValue(UNIVERSES_FIXTURE as any)

    const { GET } = await import('@/app/api/admin/universes/route')
    const res = await GET(getReq('http://localhost/api/admin/universes'))
    expect(res.status).toBe(200)

    const body = await res.json()
    expect(Array.isArray(body)).toBe(true)
    expect(body.length).toBe(5)
  })

  it('cada universo retornado tem cardImageUrl, heroImageUrl, tagline e bullets', async () => {
    vi.mocked(auth).mockResolvedValue(AUTHED_ADMIN as any)
    vi.mocked(prisma.universe.findMany).mockResolvedValue(UNIVERSES_FIXTURE as any)

    const { GET } = await import('@/app/api/admin/universes/route')
    const res = await GET(getReq('http://localhost/api/admin/universes'))
    const body = await res.json()

    const gaming = body.find((u: any) => u.slug === 'gaming')
    expect(gaming).toBeDefined()
    expect(gaming).toHaveProperty('cardImageUrl')
    expect(gaming).toHaveProperty('heroImageUrl')
    expect(gaming).toHaveProperty('tagline')
    expect(gaming).toHaveProperty('bullets')
  })
})

// ─── GET /api/admin/universes/[slug] ─────────────────────────────────────────

describe('GET /api/admin/universes/[slug]', () => {
  beforeEach(() => vi.clearAllMocks())

  it('retorna 200 com universo gaming', async () => {
    vi.mocked(auth).mockResolvedValue(AUTHED_ADMIN as any)
    vi.mocked(prisma.universe.findUnique).mockResolvedValue(UNIVERSE_FIXTURE_BASE as any)

    const { GET } = await import('@/app/api/admin/universes/[slug]/route')
    const req = getReq('http://localhost/api/admin/universes/gaming')
    const res = await GET(req, { params: Promise.resolve({ slug: 'gaming' }) })
    expect(res.status).toBe(200)

    const body = await res.json()
    expect(body.slug).toBe('gaming')
  })

  it('retorna 404 quando slug não existe', async () => {
    vi.mocked(auth).mockResolvedValue(AUTHED_ADMIN as any)
    vi.mocked(prisma.universe.findUnique).mockResolvedValue(null)

    const { GET } = await import('@/app/api/admin/universes/[slug]/route')
    const req = getReq('http://localhost/api/admin/universes/inexistente')
    const res = await GET(req, { params: Promise.resolve({ slug: 'inexistente' }) })
    expect(res.status).toBe(404)
  })

  it('retorna 401 sem autenticação', async () => {
    vi.mocked(auth).mockResolvedValue(null)

    const { GET } = await import('@/app/api/admin/universes/[slug]/route')
    const req = getReq('http://localhost/api/admin/universes/gaming')
    const res = await GET(req, { params: Promise.resolve({ slug: 'gaming' }) })
    expect(res.status).toBe(401)
  })
})

// ─── PATCH /api/admin/universes/[slug] ───────────────────────────────────────

describe('PATCH /api/admin/universes/[slug]', () => {
  beforeEach(() => vi.clearAllMocks())

  const VALID_PATCH_BODY = {
    tagline: 'Setup épico começa aqui.',
    bullets: [
      'Miniaturas de personagens favoritos',
      'Suportes ergonômicos para setup',
      'Porta-controles e headset stands',
    ],
  }

  const UPDATED_UNIVERSE = {
    ...UNIVERSE_FIXTURE_BASE,
    tagline: 'Setup épico começa aqui.',
    bullets: [
      'Miniaturas de personagens favoritos',
      'Suportes ergonômicos para setup',
      'Porta-controles e headset stands',
    ],
  }

  it('retorna 200 e universo atualizado com tagline + bullets válidos', async () => {
    vi.mocked(auth).mockResolvedValue(AUTHED_ADMIN as any)
    vi.mocked(prisma.universe.findUnique).mockResolvedValue(UNIVERSE_FIXTURE_BASE as any)
    vi.mocked(prisma.universe.update).mockResolvedValue(UPDATED_UNIVERSE as any)

    const { PATCH } = await import('@/app/api/admin/universes/[slug]/route')
    const req = patchReq('http://localhost/api/admin/universes/gaming', VALID_PATCH_BODY)
    const res = await PATCH(req, { params: Promise.resolve({ slug: 'gaming' }) })
    expect(res.status).toBe(200)

    const body = await res.json()
    expect(body.tagline).toBe('Setup épico começa aqui.')
    expect(body.bullets).toHaveLength(3)
  })

  it('retorna 400 quando tagline está vazia', async () => {
    vi.mocked(auth).mockResolvedValue(AUTHED_ADMIN as any)

    const { PATCH } = await import('@/app/api/admin/universes/[slug]/route')
    const req = patchReq('http://localhost/api/admin/universes/gaming', {
      tagline: '',
      bullets: ['Bullet válido um', 'Bullet válido dois', 'Bullet válido três'],
    })
    const res = await PATCH(req, { params: Promise.resolve({ slug: 'gaming' }) })
    expect(res.status).toBe(400)

    const body = await res.json()
    expect(body).toHaveProperty('error')
  })

  it('retorna 400 quando tagline tem mais de 120 caracteres', async () => {
    vi.mocked(auth).mockResolvedValue(AUTHED_ADMIN as any)

    const tagline121 = 'A'.repeat(121)
    const { PATCH } = await import('@/app/api/admin/universes/[slug]/route')
    const req = patchReq('http://localhost/api/admin/universes/gaming', {
      tagline: tagline121,
      bullets: ['Bullet válido um', 'Bullet válido dois', 'Bullet válido três'],
    })
    const res = await PATCH(req, { params: Promise.resolve({ slug: 'gaming' }) })
    expect(res.status).toBe(400)
  })

  it('retorna 400 quando bullet tem menos de 5 caracteres', async () => {
    vi.mocked(auth).mockResolvedValue(AUTHED_ADMIN as any)

    const { PATCH } = await import('@/app/api/admin/universes/[slug]/route')
    const req = patchReq('http://localhost/api/admin/universes/gaming', {
      tagline: 'Tagline válida aqui.',
      bullets: ['Ok', 'Bullet válido dois', 'Bullet válido três'],
    })
    const res = await PATCH(req, { params: Promise.resolve({ slug: 'gaming' }) })
    expect(res.status).toBe(400)
  })

  it('retorna 400 quando bullet tem mais de 100 caracteres', async () => {
    vi.mocked(auth).mockResolvedValue(AUTHED_ADMIN as any)

    const bullet101 = 'B'.repeat(101)
    const { PATCH } = await import('@/app/api/admin/universes/[slug]/route')
    const req = patchReq('http://localhost/api/admin/universes/gaming', {
      tagline: 'Tagline válida aqui.',
      bullets: [bullet101, 'Bullet válido dois', 'Bullet válido três'],
    })
    const res = await PATCH(req, { params: Promise.resolve({ slug: 'gaming' }) })
    expect(res.status).toBe(400)
  })

  it('retorna 400 quando bullets tem apenas 2 itens (requer exatamente 3)', async () => {
    vi.mocked(auth).mockResolvedValue(AUTHED_ADMIN as any)

    const { PATCH } = await import('@/app/api/admin/universes/[slug]/route')
    const req = patchReq('http://localhost/api/admin/universes/gaming', {
      tagline: 'Tagline válida aqui.',
      bullets: ['Bullet válido um', 'Bullet válido dois'],
    })
    const res = await PATCH(req, { params: Promise.resolve({ slug: 'gaming' }) })
    expect(res.status).toBe(400)
  })

  it('retorna 401 sem autenticação', async () => {
    vi.mocked(auth).mockResolvedValue(null)

    const { PATCH } = await import('@/app/api/admin/universes/[slug]/route')
    const req = patchReq('http://localhost/api/admin/universes/gaming', VALID_PATCH_BODY)
    const res = await PATCH(req, { params: Promise.resolve({ slug: 'gaming' }) })
    expect(res.status).toBe(401)
  })
})

// ─── POST /api/admin/universes/[slug]/upload ──────────────────────────────────

describe('POST /api/admin/universes/[slug]/upload', () => {
  beforeEach(() => vi.clearAllMocks())

  const PNG_SIZE_VALID = 1 * 1024 * 1024 // 1MB
  const PNG_SIZE_TOO_LARGE = 6 * 1024 * 1024 // 6MB

  it('retorna 401 sem autenticação', async () => {
    vi.mocked(auth).mockResolvedValue(null)

    const { POST } = await import('@/app/api/admin/universes/[slug]/upload/route')
    const req = await buildTypedUploadRequest(
      'http://localhost/api/admin/universes/gaming/upload',
      'image/png',
      PNG_SIZE_VALID,
      'card'
    )
    const res = await POST(req, { params: Promise.resolve({ slug: 'gaming' }) })
    expect(res.status).toBe(401)
  })

  it('retorna 200, chama put() e atualiza cardImageUrl para type=card com PNG válido', async () => {
    vi.mocked(auth).mockResolvedValue(AUTHED_ADMIN as any)
    vi.mocked(prisma.universe.findUnique).mockResolvedValue(UNIVERSE_FIXTURE_BASE as any)
    vi.mocked(prisma.universe.update).mockResolvedValue({
      ...UNIVERSE_FIXTURE_BASE,
      cardImageUrl: 'https://mock.blob.vercel-storage.com/universes/gaming/card.png',
    } as any)

    const { POST } = await import('@/app/api/admin/universes/[slug]/upload/route')
    const req = await buildTypedUploadRequest(
      'http://localhost/api/admin/universes/gaming/upload',
      'image/png',
      PNG_SIZE_VALID,
      'card'
    )
    const res = await POST(req, { params: Promise.resolve({ slug: 'gaming' }) })
    expect(res.status).toBe(200)

    expect(put).toHaveBeenCalledOnce()

    const body = await res.json()
    expect(body).toHaveProperty('cardImageUrl')
  })

  it('retorna 200 e atualiza heroImageUrl para type=hero com PNG válido', async () => {
    vi.mocked(auth).mockResolvedValue(AUTHED_ADMIN as any)
    vi.mocked(prisma.universe.findUnique).mockResolvedValue(UNIVERSE_FIXTURE_BASE as any)
    vi.mocked(put).mockResolvedValue({
      url: 'https://mock.blob.vercel-storage.com/universes/gaming/hero.png',
      pathname: 'universes/gaming/hero.png',
    } as any)
    vi.mocked(prisma.universe.update).mockResolvedValue({
      ...UNIVERSE_FIXTURE_BASE,
      heroImageUrl: 'https://mock.blob.vercel-storage.com/universes/gaming/hero.png',
    } as any)

    const { POST } = await import('@/app/api/admin/universes/[slug]/upload/route')
    const req = await buildTypedUploadRequest(
      'http://localhost/api/admin/universes/gaming/upload',
      'image/png',
      PNG_SIZE_VALID,
      'hero'
    )
    const res = await POST(req, { params: Promise.resolve({ slug: 'gaming' }) })
    expect(res.status).toBe(200)

    const body = await res.json()
    expect(body).toHaveProperty('heroImageUrl')
  })

  it('retorna 422 quando arquivo enviado é JPEG (apenas PNG é aceito)', async () => {
    vi.mocked(auth).mockResolvedValue(AUTHED_ADMIN as any)

    const { POST } = await import('@/app/api/admin/universes/[slug]/upload/route')
    const req = await buildTypedUploadRequest(
      'http://localhost/api/admin/universes/gaming/upload',
      'image/jpeg',
      PNG_SIZE_VALID,
      'card'
    )
    const res = await POST(req, { params: Promise.resolve({ slug: 'gaming' }) })
    expect(res.status).toBe(422)

    const body = await res.json()
    expect(body).toHaveProperty('error')
  })

  it('retorna 413 quando arquivo PNG ultrapassa 5 MB', async () => {
    vi.mocked(auth).mockResolvedValue(AUTHED_ADMIN as any)

    const { POST } = await import('@/app/api/admin/universes/[slug]/upload/route')
    const req = await buildTypedUploadRequest(
      'http://localhost/api/admin/universes/gaming/upload',
      'image/png',
      PNG_SIZE_TOO_LARGE,
      'card'
    )
    const res = await POST(req, { params: Promise.resolve({ slug: 'gaming' }) })
    expect(res.status).toBe(413)

    const body = await res.json()
    expect(body).toHaveProperty('error')
  })
})
