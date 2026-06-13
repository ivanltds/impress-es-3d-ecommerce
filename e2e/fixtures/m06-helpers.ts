// ─── M06 Test Helpers — Personalized Customer Area ───
// FASE 2 — TEST AUTHORING (🔴 RED)
// Helpers compartilhados pelos specs E2E do milestone M06.
// Usa APIs já existentes (M04: /api/checkout · M05: /api/user/preference) e a
// futura API de endereços do M06 (/api/user/addresses — ainda não existe → RED).

import { type Page, expect } from '@playwright/test'

// ─── Usuários de teste ────────────────────────────────────────────────────────

export interface TestUser {
  name: string
  email: string
  password: string
}

export function uniqueUser(prefix = 'm06'): TestUser {
  const rand = Math.floor(Math.random() * 1_000_000)
  return {
    name: 'QA M06',
    email: `${prefix}-${Date.now()}-${rand}@test.com`,
    password: '12345678',
  }
}

/** Cadastra um usuário novo via UI e faz login (padrão estabelecido em auth.spec.ts). */
export async function registerAndLogin(page: Page, user: TestUser = uniqueUser()): Promise<TestUser> {
  await page.goto('/auth/cadastrar')
  await page.getByTestId('name-input').fill(user.name)
  await page.getByTestId('email-input').fill(user.email)
  await page.getByTestId('password-input').fill(user.password)
  await page.getByTestId('register-submit').click()
  await page.waitForURL('/auth/entrar?registered=true')

  await page.getByTestId('email-input').fill(user.email)
  await page.getByTestId('password-input').fill(user.password)
  await page.getByTestId('login-submit').click()
  await page.waitForURL('/')
  return user
}

/** Define o universo preferido do usuário logado via API M05 (persiste no DB + cookie). */
export async function setPreference(page: Page, slug: string): Promise<void> {
  const res = await page.request.patch('/api/user/preference', {
    data: { universeSlug: slug },
  })
  expect(res.ok(), 'PATCH /api/user/preference (M05) deveria responder 200').toBe(true)
}

// ─── Pedidos (M04 — API já existente) ─────────────────────────────────────────

export interface CheckoutItem {
  productId: string
  name: string
  sku?: string
  qty: number
  price: number
}

export const DEFAULT_ORDER_ITEMS: CheckoutItem[] = [
  { productId: 'm06-prod-suporte', name: 'Suporte Neon RGB', qty: 1, price: 89.9 },
  { productId: 'm06-prod-porta-joias', name: 'Porta Joias 3D', qty: 2, price: 45.0 },
]

/** Cria um pedido real para o usuário logado via POST /api/checkout (M04). */
export async function createOrderViaApi(
  page: Page,
  items: CheckoutItem[] = DEFAULT_ORDER_ITEMS,
  shippingCost = 0
): Promise<{ orderId: string; orderNumber: string; total: number }> {
  const res = await page.request.post('/api/checkout', {
    data: {
      items,
      shippingCost,
      paymentMethod: 'stripe',
      cep: '01310-100',
      street: 'Av. Paulista',
      number: '1000',
      district: 'Bela Vista',
      city: 'São Paulo',
      state: 'SP',
    },
  })
  expect(res.status(), 'POST /api/checkout (M04) deveria responder 201').toBe(201)
  const body = await res.json()
  return { orderId: body.orderId, orderNumber: body.orderNumber, total: body.total }
}

// ─── Endereços (M06 — API ainda não existe → chamadas falham = RED) ──────────

export interface AddressPayload {
  label: string
  recipientName: string
  cep: string
  street: string
  number: string
  complement?: string
  district: string
  city: string
  state: string
}

export const VALID_ADDRESS: AddressPayload = {
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

/** Cria endereço via POST /api/user/addresses (M06 — RED até o Dev implementar). */
export async function createAddressViaApi(
  page: Page,
  overrides: Partial<AddressPayload> = {}
): Promise<{ id: string; isDefault: boolean }> {
  const res = await page.request.post('/api/user/addresses', {
    data: { ...VALID_ADDRESS, ...overrides },
  })
  expect(res.status(), 'POST /api/user/addresses deveria responder 201').toBe(201)
  return res.json()
}

/** Marca endereço como padrão via PATCH /api/user/addresses/{id} (M06 — RED). */
export async function setDefaultAddressViaApi(page: Page, id: string): Promise<void> {
  const res = await page.request.patch(`/api/user/addresses/${id}`, {
    data: { isDefault: true },
  })
  expect(res.ok(), `PATCH /api/user/addresses/${id} deveria responder 200`).toBe(true)
}

// ─── Universos (config M05 — src/config/universes.ts) ───────────────────────

export const ALL_UNIVERSE_SLUGS = ['gaming', 'anime-nerd', 'casa-decor', 'presentes', 'auto'] as const

export const UNIVERSE_NAMES: Record<string, string> = {
  gaming: 'Gaming',
  'anime-nerd': 'Anime & Nerd',
  'casa-decor': 'Casa & Decor',
  presentes: 'Presentes',
  auto: 'Auto',
}

export const UNIVERSE_PRIMARY: Record<string, string> = {
  gaming: '#00ff41',
  'anime-nerd': '#c44dff',
  'casa-decor': '#8b6914',
  presentes: '#e8521a',
  auto: '#c0392b',
}

// ─── Utilitários de cor / CSS ────────────────────────────────────────────────

/** Normaliza '#00ff41' ou 'rgb(0, 255, 65)' para 'r,g,b' comparável. */
export function normalizeColor(value: string): string {
  const v = value.trim().toLowerCase()
  const hex = v.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/)
  if (hex) {
    let h = hex[1]
    if (h.length === 3) h = h.split('').map((c) => c + c).join('')
    const n = parseInt(h, 16)
    return `${(n >> 16) & 255},${(n >> 8) & 255},${n & 255}`
  }
  const rgb = v.match(/^rgba?\((\d+)[,\s]+(\d+)[,\s]+(\d+)/)
  if (rgb) return `${rgb[1]},${rgb[2]},${rgb[3]}`
  return v
}

/**
 * Lê o valor computado de uma CSS custom property no escopo do elemento com o
 * data-testid informado (procura no próprio elemento e nos descendentes).
 */
export async function getScopedCssVar(page: Page, rootTestId: string, varName: string): Promise<string> {
  return page.evaluate(
    ({ rootTestId, varName }) => {
      const root = document.querySelector(`[data-testid="${rootTestId}"]`)
      if (!root) return ''
      const els = [root, ...Array.from(root.querySelectorAll('*'))].slice(0, 300)
      for (const el of els) {
        const v = window.getComputedStyle(el as Element).getPropertyValue(varName).trim()
        if (v) return v
      }
      return ''
    },
    { rootTestId, varName }
  )
}

/** Retorna a primeira classe `universe_*` encontrada no subtree do testid (ou null). */
export async function findUniverseClass(page: Page, rootTestId: string): Promise<string | null> {
  return page.evaluate((testId) => {
    const root = document.querySelector(`[data-testid="${testId}"]`)
    if (!root) return null
    const els = [root, ...Array.from(root.querySelectorAll('*'))].slice(0, 300)
    for (const el of els) {
      const cls = el.getAttribute('class') ?? ''
      const m = cls.match(/universe_[a-z_]+/)
      if (m) return m[0]
    }
    return null
  }, rootTestId)
}

/**
 * Calcula o contraste WCAG (cor do texto × background efetivo) do primeiro
 * elemento de texto dentro do wrapper. Usado no Cenário 1.5 (≥ 4.5:1).
 */
export async function contrastRatioInside(page: Page, rootTestId: string): Promise<number> {
  return page.evaluate((testId) => {
    function luminance(rgb: number[]): number {
      const [r, g, b] = rgb.map((v) => {
        const c = v / 255
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
      })
      return 0.2126 * r + 0.7152 * g + 0.0722 * b
    }
    function parse(c: string): number[] | null {
      const m = c.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/)
      if (!m) return null
      if (m[4] !== undefined && parseFloat(m[4]) === 0) return null
      return [+m[1], +m[2], +m[3]]
    }
    const root = document.querySelector(`[data-testid="${testId}"]`) as HTMLElement | null
    if (!root) return 0
    const el = (root.querySelector('h1, h2, h3, p, span, a') as HTMLElement | null) ?? root
    const color = parse(window.getComputedStyle(el).color)
    if (!color) return 0
    let bg: number[] | null = null
    let cur: HTMLElement | null = el
    while (cur) {
      const b = parse(window.getComputedStyle(cur).backgroundColor)
      if (b) {
        bg = b
        break
      }
      cur = cur.parentElement
    }
    if (!bg) bg = [255, 255, 255]
    const l1 = luminance(color)
    const l2 = luminance(bg)
    return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)
  }, rootTestId)
}

// ─── Analytics (Feature 6 — console.log estruturado) ────────────────────────

export const ISO_8601 = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})$/

/**
 * Captura eventos emitidos via `console.log('[analytics]', payload)` (RN-M06-13).
 * Retorna o array mutável onde os payloads estruturados vão sendo acumulados.
 */
export function captureAnalytics(page: Page): Array<Record<string, unknown>> {
  const captured: Array<Record<string, unknown>> = []
  page.on('console', (msg) => {
    void (async () => {
      try {
        const values = await Promise.all(
          msg.args().map((a) => a.jsonValue().catch(() => null))
        )
        if (values.some((v) => v === '[analytics]')) {
          const payload = values.find((v) => v !== null && typeof v === 'object') as
            | Record<string, unknown>
            | undefined
          if (payload) captured.push(payload)
        }
      } catch {
        // página pode fechar durante a captura — ignorar
      }
    })()
  })
  return captured
}
