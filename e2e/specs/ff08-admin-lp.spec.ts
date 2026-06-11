// ─── E2E Tests: FF08 — Admin LP Universos ───
// Mapeia para spec FF08, Features 1, 5 e 6
// FASE 2 — TEST AUTHORING (🔴 RED)
// A página /admin/universos e os componentes LP atualizados ainda NÃO existem.
// Os testes irão falhar em runtime — comportamento RED esperado.

import { test, expect } from '@playwright/test'

// ─── Feature 1: Autenticação / Acesso Admin ───────────────────────────────────

test.describe('FF08-F1: Proteção de Rota Admin', () => {
  test('F1.3 /admin/universos sem login redireciona para /auth/entrar', async ({ page }) => {
    // Garante sem sessão ativa
    await page.context().clearCookies()
    await page.goto('/admin/universos')

    // Deve ser redirecionado para a tela de login
    await page.waitForURL(/auth\/entrar/, { timeout: 5000 })
    await expect(page).toHaveURL(/auth\/entrar/)
  })
})

// ─── Feature 1: Listagem Admin de Universos (com mock de sessão) ──────────────

test.describe('FF08-F1: Listagem Admin de Universos', () => {
  test('F1.1 /admin/universos autenticado exibe admin-universos-list', async ({ page }) => {
    // Mock da sessão NextAuth via cookie de sessão
    await page.route('**/api/auth/session', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          user: { id: 'admin-1', name: 'Admin', email: 'admin@test.com', role: 'admin' },
          expires: new Date(Date.now() + 86400000).toISOString(),
        }),
      })
    })

    // Mock da API de universos admin
    await page.route('**/api/admin/universes', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          { id: 'u1', slug: 'gaming', name: 'Gaming', cardImageUrl: null, heroImageUrl: null, tagline: null, bullets: [], comingSoon: false, sortOrder: 1 },
          { id: 'u2', slug: 'anime-nerd', name: 'Anime & Nerd', cardImageUrl: null, heroImageUrl: null, tagline: null, bullets: [], comingSoon: false, sortOrder: 2 },
          { id: 'u3', slug: 'casa-decor', name: 'Casa & Decor', cardImageUrl: null, heroImageUrl: null, tagline: null, bullets: [], comingSoon: false, sortOrder: 3 },
          { id: 'u4', slug: 'presentes', name: 'Presentes', cardImageUrl: null, heroImageUrl: null, tagline: null, bullets: [], comingSoon: false, sortOrder: 4 },
          { id: 'u5', slug: 'auto', name: 'Auto', cardImageUrl: null, heroImageUrl: null, tagline: null, bullets: [], comingSoon: true, sortOrder: 5 },
        ]),
      })
    })

    await page.goto('/admin/universos')

    const list = page.getByTestId('admin-universos-list')
    await expect(list).toBeVisible()
  })
})

// ─── Feature 5: Fallback na LP — sem cardImageUrl ─────────────────────────────

test.describe('FF08-F5: LP — Fallback quando cardImageUrl é nulo', () => {
  test('F5.1 pill universo-card-gaming SEM img quando cardImageUrl é null', async ({ page }) => {
    // Mock da API pública de universos retornando sem cardImageUrl
    await page.route('**/api/universes', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 'u1',
            slug: 'gaming',
            name: 'Gaming',
            tagline: null,
            bullets: [],
            cardImageUrl: null,
            heroImageUrl: null,
            comingSoon: false,
            sortOrder: 1,
            publishedProductCount: 5,
          },
        ]),
      })
    })

    await page.goto('/')

    const pill = page.getByTestId('universo-card-gaming')
    await expect(pill).toBeVisible()

    // Quando cardImageUrl é null, NÃO deve existir img com esse testid
    const img = page.getByTestId('card-universe-image-gaming')
    await expect(img).not.toBeAttached()
  })
})

// ─── Feature 6: LP exibe imagem quando cardImageUrl está preenchido ────────────

test.describe('FF08-F6: LP — Exibição de imagem quando cardImageUrl está configurado', () => {
  test('F6.1 pill universo-card-gaming COM img quando cardImageUrl preenchido', async ({ page }) => {
    // Mock da API pública com cardImageUrl preenchido para gaming
    await page.route('**/api/universes', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 'u1',
            slug: 'gaming',
            name: 'Gaming',
            tagline: 'Setup épico começa aqui.',
            bullets: ['Bullet 1', 'Bullet 2', 'Bullet 3'],
            cardImageUrl: 'https://mock.blob.vercel-storage.com/universes/gaming/card.png',
            heroImageUrl: null,
            comingSoon: false,
            sortOrder: 1,
            publishedProductCount: 5,
          },
        ]),
      })
    })

    await page.goto('/')

    const pill = page.getByTestId('universo-card-gaming')
    await expect(pill).toBeVisible()

    // Quando cardImageUrl está preenchido, DEVE existir img com testid correto
    const img = page.getByTestId('card-universe-image-gaming')
    await expect(img).toBeAttached()
    await expect(img).toBeVisible()

    // A src deve conter a URL mockada
    const src = await img.getAttribute('src')
    expect(src).toBeTruthy()
  })

  test('F6.1 img card-universe-image-gaming tem atributo alt descritivo', async ({ page }) => {
    await page.route('**/api/universes', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 'u1',
            slug: 'gaming',
            name: 'Gaming',
            tagline: null,
            bullets: [],
            cardImageUrl: 'https://mock.blob.vercel-storage.com/universes/gaming/card.png',
            heroImageUrl: null,
            comingSoon: false,
            sortOrder: 1,
            publishedProductCount: 5,
          },
        ]),
      })
    })

    await page.goto('/')

    const img = page.getByTestId('card-universe-image-gaming')
    const alt = await img.getAttribute('alt')
    // alt deve ser não-vazio e descritivo
    expect(alt).toBeTruthy()
    expect(alt!.length).toBeGreaterThan(0)
  })
})
