// ─── Integration Tests: Settings Routes ───
// /api/admin/settings  (GET + PATCH — requer auth)
// /api/settings/public (GET — sem auth)

import { describe, it, expect, vi, beforeEach } from 'vitest'

// ─── Mocks ───────────────────────────────────────────────────────────────────

vi.mock('@/lib/db', () => ({
  prisma: {
    storeSettings: {
      upsert: vi.fn(),
      findUnique: vi.fn(),
    },
  },
}))

vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
}))

import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'

// ─── /api/admin/settings ─────────────────────────────────────────────────────

describe('GET /api/admin/settings', () => {
  beforeEach(() => vi.clearAllMocks())

  it('retorna 401 sem sessão', async () => {
    vi.mocked(auth).mockResolvedValue(null)
    const { GET } = await import('@/app/api/admin/settings/route')
    const res = await GET()
    expect(res.status).toBe(401)
    const body = await res.json()
    expect(body.error).toBe('Unauthorized')
  })

  it('retorna settings quando autenticado', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'admin-1' } } as any)
    vi.mocked(prisma.storeSettings.upsert).mockResolvedValue({
      id: 'singleton',
      whatsappPhone: '5511999999999',
      updatedAt: new Date(),
    })

    const { GET } = await import('@/app/api/admin/settings/route')
    const res = await GET()
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.whatsappPhone).toBe('5511999999999')
  })
})

describe('PATCH /api/admin/settings', () => {
  beforeEach(() => vi.clearAllMocks())

  it('retorna 401 sem sessão', async () => {
    vi.mocked(auth).mockResolvedValue(null)
    const { PATCH } = await import('@/app/api/admin/settings/route')
    const req = new Request('http://localhost/api/admin/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ whatsappPhone: '5511999999999' }),
    })
    const res = await PATCH(req as any)
    expect(res.status).toBe(401)
  })

  it('atualiza whatsappPhone quando autenticado', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'admin-1' } } as any)
    vi.mocked(prisma.storeSettings.upsert).mockResolvedValue({
      id: 'singleton',
      whatsappPhone: '5511988887777',
      updatedAt: new Date(),
    })

    const { PATCH } = await import('@/app/api/admin/settings/route')
    const req = new Request('http://localhost/api/admin/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ whatsappPhone: '5511988887777' }),
    })
    const res = await PATCH(req as any)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.whatsappPhone).toBe('5511988887777')
    expect(prisma.storeSettings.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        update: { whatsappPhone: '5511988887777' },
      })
    )
  })

  it('persiste string vazia quando whatsappPhone não enviado', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'admin-1' } } as any)
    vi.mocked(prisma.storeSettings.upsert).mockResolvedValue({
      id: 'singleton',
      whatsappPhone: '',
      updatedAt: new Date(),
    })

    const { PATCH } = await import('@/app/api/admin/settings/route')
    const req = new Request('http://localhost/api/admin/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    })
    const res = await PATCH(req as any)
    expect(res.status).toBe(200)
    expect(prisma.storeSettings.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        update: { whatsappPhone: '' },
      })
    )
  })
})

// ─── /api/settings/public ────────────────────────────────────────────────────

describe('GET /api/settings/public', () => {
  beforeEach(() => vi.clearAllMocks())

  it('retorna whatsappPhone sem autenticação', async () => {
    vi.mocked(prisma.storeSettings.findUnique).mockResolvedValue({
      id: 'singleton',
      whatsappPhone: '5511977776666',
      updatedAt: new Date(),
    })

    const { GET } = await import('@/app/api/settings/public/route')
    const res = await GET()
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.whatsappPhone).toBe('5511977776666')
  })

  it('retorna string vazia quando settings não existe', async () => {
    vi.mocked(prisma.storeSettings.findUnique).mockResolvedValue(null)

    const { GET } = await import('@/app/api/settings/public/route')
    const res = await GET()
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.whatsappPhone).toBe('')
  })

  it('não expõe outros campos do singleton', async () => {
    vi.mocked(prisma.storeSettings.findUnique).mockResolvedValue({
      id: 'singleton',
      whatsappPhone: '5511955554444',
      updatedAt: new Date(),
    })

    const { GET } = await import('@/app/api/settings/public/route')
    const res = await GET()
    const body = await res.json()
    expect(Object.keys(body)).toEqual(['whatsappPhone'])
  })
})
