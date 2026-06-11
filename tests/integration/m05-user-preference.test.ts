// ─── Integration Tests: M05 — PATCH /api/user/preference ───
// Mapeia para spec M05, Feature 9 (Persistência de Preferência de Universo)
// FASE 2 — TEST AUTHORING (🔴 RED)
// A rota /api/user/preference ainda não existe — os imports irão falhar com "Cannot find module"

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

vi.mock('@/lib/db', () => ({
  prisma: {
    user: {
      update: vi.fn(),
    },
  },
}))
vi.mock('@/lib/auth', () => ({ auth: vi.fn() }))

import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function patchReq(body: object) {
  return new NextRequest('http://localhost/api/user/preference', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

const VALID_SLUGS = ['gaming', 'anime-nerd', 'casa-decor', 'presentes', 'auto']

// ─── PATCH /api/user/preference ───────────────────────────────────────────────

describe('PATCH /api/user/preference', () => {
  beforeEach(() => vi.clearAllMocks())

  // ── Validação de entrada ──────────────────────────────────────────────────

  it('retorna 400 quando universeSlug não é fornecido', async () => {
    vi.mocked(auth).mockResolvedValue(null)

    const { PATCH } = await import('@/app/api/user/preference/route')
    const req = patchReq({})
    const res = await PATCH(req)

    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body).toHaveProperty('error')
  })

  it('retorna 400 quando universeSlug é inválido (ex: "futebol")', async () => {
    vi.mocked(auth).mockResolvedValue(null)

    const { PATCH } = await import('@/app/api/user/preference/route')
    const req = patchReq({ universeSlug: 'futebol' })
    const res = await PATCH(req)

    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body).toHaveProperty('error')
  })

  it('retorna 400 quando universeSlug é string vazia', async () => {
    vi.mocked(auth).mockResolvedValue(null)

    const { PATCH } = await import('@/app/api/user/preference/route')
    const req = patchReq({ universeSlug: '' })
    const res = await PATCH(req)

    expect(res.status).toBe(400)
  })

  // ── Slugs válidos ─────────────────────────────────────────────────────────

  it.each(VALID_SLUGS)(
    'aceita slug válido "%s" e retorna 200',
    async (slug) => {
      vi.mocked(auth).mockResolvedValue(null)

      const { PATCH } = await import('@/app/api/user/preference/route')
      const req = patchReq({ universeSlug: slug })
      const res = await PATCH(req)

      expect(res.status).toBe(200)
    }
  )

  // ── Guest (sem sessão) ────────────────────────────────────────────────────

  it('guest (sem sessão): retorna 200 e seta cookie universe_pref', async () => {
    vi.mocked(auth).mockResolvedValue(null)

    const { PATCH } = await import('@/app/api/user/preference/route')
    const req = patchReq({ universeSlug: 'gaming' })
    const res = await PATCH(req)

    expect(res.status).toBe(200)

    const setCookie = res.headers.get('set-cookie')
    expect(setCookie).not.toBeNull()
    expect(setCookie).toContain('universe_pref=gaming')
  })

  it('guest: cookie tem maxAge = 2592000 (30 dias em segundos)', async () => {
    vi.mocked(auth).mockResolvedValue(null)

    const { PATCH } = await import('@/app/api/user/preference/route')
    const req = patchReq({ universeSlug: 'presentes' })
    const res = await PATCH(req)

    const setCookie = res.headers.get('set-cookie')
    expect(setCookie).toContain('2592000')
  })

  it('guest: cookie tem atributo SameSite=Lax', async () => {
    vi.mocked(auth).mockResolvedValue(null)

    const { PATCH } = await import('@/app/api/user/preference/route')
    const req = patchReq({ universeSlug: 'anime-nerd' })
    const res = await PATCH(req)

    const setCookie = res.headers.get('set-cookie')
    expect(setCookie?.toLowerCase()).toContain('samesite=lax')
  })

  it('guest: NÃO chama prisma.user.update (não há usuário logado)', async () => {
    vi.mocked(auth).mockResolvedValue(null)

    const { PATCH } = await import('@/app/api/user/preference/route')
    const req = patchReq({ universeSlug: 'gaming' })
    await PATCH(req)

    expect(prisma.user.update).not.toHaveBeenCalled()
  })

  // ── Usuário logado ────────────────────────────────────────────────────────

  it('logado: retorna 200', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'user-123' } } as any)
    vi.mocked(prisma.user.update).mockResolvedValue({} as any)

    const { PATCH } = await import('@/app/api/user/preference/route')
    const req = patchReq({ universeSlug: 'casa-decor' })
    const res = await PATCH(req)

    expect(res.status).toBe(200)
  })

  it('logado: seta cookie universe_pref', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'user-123' } } as any)
    vi.mocked(prisma.user.update).mockResolvedValue({} as any)

    const { PATCH } = await import('@/app/api/user/preference/route')
    const req = patchReq({ universeSlug: 'presentes' })
    const res = await PATCH(req)

    const setCookie = res.headers.get('set-cookie')
    expect(setCookie).toContain('universe_pref=presentes')
  })

  it('logado: atualiza User.preferredCollection no DB com o slug fornecido', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'user-123' } } as any)
    vi.mocked(prisma.user.update).mockResolvedValue({} as any)

    const { PATCH } = await import('@/app/api/user/preference/route')
    const req = patchReq({ universeSlug: 'auto' })
    await PATCH(req)

    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 'user-123' },
      data: { preferredCollection: 'auto' },
    })
  })

  it('logado: seta cookie E atualiza o DB (ambas as ações)', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'user-456' } } as any)
    vi.mocked(prisma.user.update).mockResolvedValue({} as any)

    const { PATCH } = await import('@/app/api/user/preference/route')
    const req = patchReq({ universeSlug: 'gaming' })
    const res = await PATCH(req)

    // Cookie setado
    const setCookie = res.headers.get('set-cookie')
    expect(setCookie).toContain('universe_pref=gaming')

    // DB atualizado
    expect(prisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'user-456' },
        data: expect.objectContaining({ preferredCollection: 'gaming' }),
      })
    )
  })

  it('logado: body de resposta confirma slug salvo', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'user-789' } } as any)
    vi.mocked(prisma.user.update).mockResolvedValue({} as any)

    const { PATCH } = await import('@/app/api/user/preference/route')
    const req = patchReq({ universeSlug: 'anime-nerd' })
    const res = await PATCH(req)

    const body = await res.json()
    expect(body).toHaveProperty('universeSlug', 'anime-nerd')
  })
})
