// ─── Integration Tests: FF08 — POST /api/admin/upload (Vercel Blob) ───
// Mapeia para spec FF08 — migração da rota de upload de base64 para Vercel Blob
// FASE 2 — TEST AUTHORING (🔴 RED)
// A rota existente (/api/admin/upload) será MODIFICADA para usar Vercel Blob em vez de base64.
// Os testes que validam retorno de URL (não base64) vão FALHAR com a implementação atual.

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// ─── Mocks ───────────────────────────────────────────────────────────────────

vi.mock('@/lib/auth', () => ({ auth: vi.fn() }))

vi.mock('@vercel/blob', () => ({
  put: vi.fn().mockResolvedValue({
    url: 'https://mock.blob.vercel-storage.com/products/image.png',
    pathname: 'products/image.png',
  }),
}))

import { auth } from '@/lib/auth'
import { put } from '@vercel/blob'

// ─── Fixtures ────────────────────────────────────────────────────────────────

const AUTHED_ADMIN = { user: { id: 'admin-1', role: 'admin' } }

const MAX_SIZE_BYTES = 5 * 1024 * 1024 // 5MB (novo limite FF08)
const OVER_SIZE_BYTES = 5 * 1024 * 1024 + 1 // 5MB + 1 byte

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function buildUploadReq(mimeType: string, sizeBytes: number, filename = 'image.png'): Promise<NextRequest> {
  const formData = new FormData()
  const bytes = new Uint8Array(sizeBytes).fill(0)
  const file = new File([bytes], filename, { type: mimeType })
  formData.append('file', file)
  return new NextRequest('http://localhost/api/admin/upload', {
    method: 'POST',
    body: formData,
  })
}

// ─── POST /api/admin/upload ───────────────────────────────────────────────────

describe('POST /api/admin/upload (Vercel Blob)', () => {
  beforeEach(() => vi.clearAllMocks())

  // ── Autenticação ─────────────────────────────────────────────────────────

  it('retorna 401 sem autenticação', async () => {
    vi.mocked(auth).mockResolvedValue(null)

    const { POST } = await import('@/app/api/admin/upload/route')
    const req = await buildUploadReq('image/png', 1024)
    const res = await POST(req)
    expect(res.status).toBe(401)
  })

  // ── PNG — tipo aceito ─────────────────────────────────────────────────────

  it('PNG válido → chama put() e retorna { url } (não base64)', async () => {
    vi.mocked(auth).mockResolvedValue(AUTHED_ADMIN as any)

    const { POST } = await import('@/app/api/admin/upload/route')
    const req = await buildUploadReq('image/png', 512 * 1024, 'produto.png')
    const res = await POST(req)
    expect(res.status).toBe(200)

    expect(put).toHaveBeenCalledOnce()

    const body = await res.json()
    // FF08: deve retornar URL do Vercel Blob, NÃO uma string base64
    expect(body).toHaveProperty('url')
    expect(body.url).toMatch(/^https:\/\//)
    expect(body.url).not.toMatch(/^data:/)
  })

  // ── JPEG — tipo aceito ────────────────────────────────────────────────────

  it('JPEG válido → chama put() e retorna { url }', async () => {
    vi.mocked(auth).mockResolvedValue(AUTHED_ADMIN as any)
    vi.mocked(put).mockResolvedValue({
      url: 'https://mock.blob.vercel-storage.com/products/image.jpg',
      pathname: 'products/image.jpg',
    } as any)

    const { POST } = await import('@/app/api/admin/upload/route')
    const req = await buildUploadReq('image/jpeg', 512 * 1024, 'produto.jpg')
    const res = await POST(req)
    expect(res.status).toBe(200)

    expect(put).toHaveBeenCalledOnce()

    const body = await res.json()
    expect(body.url).toMatch(/^https:\/\//)
    expect(body.url).not.toMatch(/^data:/)
  })

  // ── WebP — tipo aceito ────────────────────────────────────────────────────

  it('WebP válido → chama put() e retorna { url }', async () => {
    vi.mocked(auth).mockResolvedValue(AUTHED_ADMIN as any)
    vi.mocked(put).mockResolvedValue({
      url: 'https://mock.blob.vercel-storage.com/products/image.webp',
      pathname: 'products/image.webp',
    } as any)

    const { POST } = await import('@/app/api/admin/upload/route')
    const req = await buildUploadReq('image/webp', 512 * 1024, 'produto.webp')
    const res = await POST(req)
    expect(res.status).toBe(200)

    expect(put).toHaveBeenCalledOnce()

    const body = await res.json()
    expect(body.url).toMatch(/^https:\/\//)
  })

  // ── Validação de tamanho ──────────────────────────────────────────────────

  it('arquivo PNG acima de 5 MB → retorna 400', async () => {
    vi.mocked(auth).mockResolvedValue(AUTHED_ADMIN as any)

    const { POST } = await import('@/app/api/admin/upload/route')
    const req = await buildUploadReq('image/png', OVER_SIZE_BYTES)
    const res = await POST(req)
    expect(res.status).toBe(400)

    const body = await res.json()
    expect(body).toHaveProperty('error')
    // put() NÃO deve ter sido chamado
    expect(put).not.toHaveBeenCalled()
  })

  it('arquivo PNG com exatamente 5 MB → aceito (limite inclusivo)', async () => {
    vi.mocked(auth).mockResolvedValue(AUTHED_ADMIN as any)

    const { POST } = await import('@/app/api/admin/upload/route')
    const req = await buildUploadReq('image/png', MAX_SIZE_BYTES)
    const res = await POST(req)
    expect(res.status).toBe(200)
    expect(put).toHaveBeenCalledOnce()
  })

  // ── Validação de tipo ─────────────────────────────────────────────────────

  it('tipo inválido PDF → retorna 400', async () => {
    vi.mocked(auth).mockResolvedValue(AUTHED_ADMIN as any)

    const { POST } = await import('@/app/api/admin/upload/route')
    const req = await buildUploadReq('application/pdf', 512 * 1024, 'documento.pdf')
    const res = await POST(req)
    expect(res.status).toBe(400)

    const body = await res.json()
    expect(body).toHaveProperty('error')
    expect(put).not.toHaveBeenCalled()
  })

  it('tipo inválido text/plain → retorna 400', async () => {
    vi.mocked(auth).mockResolvedValue(AUTHED_ADMIN as any)

    const { POST } = await import('@/app/api/admin/upload/route')
    const req = await buildUploadReq('text/plain', 512, 'arquivo.txt')
    const res = await POST(req)
    expect(res.status).toBe(400)

    expect(put).not.toHaveBeenCalled()
  })

  // ── Estrutura da resposta ─────────────────────────────────────────────────

  it('resposta de sucesso contém campo url com URL pública do Vercel Blob', async () => {
    vi.mocked(auth).mockResolvedValue(AUTHED_ADMIN as any)
    vi.mocked(put).mockResolvedValue({
      url: 'https://abc123.public.blob.vercel-storage.com/products/foto.png',
      pathname: 'products/foto.png',
    } as any)

    const { POST } = await import('@/app/api/admin/upload/route')
    const req = await buildUploadReq('image/png', 1024)
    const res = await POST(req)
    const body = await res.json()

    // URL deve ser string HTTPS pública — nunca data:image/...
    expect(typeof body.url).toBe('string')
    expect(body.url.startsWith('https://')).toBe(true)
    expect(body.url).not.toContain('base64')
    expect(body.url).not.toContain('data:')
  })
})
