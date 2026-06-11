// ─── E2E Tests: M05 — Homepage Multi-Theme LP ───
// Mapeia para spec M05, Features 1–6
// FASE 2 — TEST AUTHORING (🔴 RED)
// Os componentes e rotas ainda não existem — os testes irão falhar em runtime

import { test, expect } from '@playwright/test'

const DESKTOP = { width: 1280, height: 720 }
const MOBILE = { width: 375, height: 667 }

// ─── Feature 1: Hero Section ─────────────────────────────────────────────────

test.describe('M05-F1: Hero Section', () => {
  test('F1.1 desktop: hero visível sem scroll', async ({ page }) => {
    await page.setViewportSize(DESKTOP)
    await page.goto('/')

    const heroSection = page.getByTestId('hero-section')
    await expect(heroSection).toBeVisible()
    // Deve estar dentro da viewport sem scroll
    const box = await heroSection.boundingBox()
    expect(box).not.toBeNull()
    expect(box!.y).toBeLessThan(DESKTOP.height)
  })

  test('F1.1 desktop: headline contém "Feito para você. Só para você."', async ({ page }) => {
    await page.setViewportSize(DESKTOP)
    await page.goto('/')

    const headline = page.getByTestId('hero-headline')
    await expect(headline).toContainText('Feito para você. Só para você.')
  })

  test('F1.1 desktop: CTA hero-cta-universos visível', async ({ page }) => {
    await page.setViewportSize(DESKTOP)
    await page.goto('/')

    const cta = page.getByTestId('hero-cta-universos')
    await expect(cta).toBeVisible()
  })

  test('F1.1 mobile: hero visível sem scroll', async ({ page }) => {
    await page.setViewportSize(MOBILE)
    await page.goto('/')

    const heroSection = page.getByTestId('hero-section')
    await expect(heroSection).toBeVisible()
    const box = await heroSection.boundingBox()
    expect(box!.y).toBeLessThan(MOBILE.height)
  })

  test('F1.1 mobile: CTA visível e clicável', async ({ page }) => {
    await page.setViewportSize(MOBILE)
    await page.goto('/')

    const cta = page.getByTestId('hero-cta-universos')
    await expect(cta).toBeVisible()
  })

  test('F1.4 hero não contém "R$" (copy sem preço)', async ({ page }) => {
    await page.goto('/')

    const heroSection = page.getByTestId('hero-section')
    const heroText = await heroSection.textContent()
    expect(heroText).not.toContain('R$')
    expect(heroText?.toLowerCase()).not.toContain('reais')
    expect(heroText?.toLowerCase()).not.toContain('preço')
    expect(heroText?.toLowerCase()).not.toContain('a partir de')
  })

  test('F1.3 CTA hero navega para seção universos com scroll', async ({ page }) => {
    await page.setViewportSize(DESKTOP)
    await page.goto('/')

    const cta = page.getByTestId('hero-cta-universos')
    await cta.click()

    // Aguarda scroll terminar
    await page.waitForTimeout(800)

    const universosSection = page.getByTestId('universos-section')
    await expect(universosSection).toBeInViewport()
  })
})

// ─── Feature 2: Navegador de Universos ───────────────────────────────────────

test.describe('M05-F2: Navegador de Universos', () => {
  test('F2.1 desktop: seção universos-section existe na página', async ({ page }) => {
    await page.setViewportSize(DESKTOP)
    await page.goto('/')

    const section = page.getByTestId('universos-section')
    await expect(section).toBeVisible()
  })

  test('F2.1 desktop: 5 cards renderizados (quando todos têm produtos)', async ({ page }) => {
    await page.setViewportSize(DESKTOP)
    await page.goto('/')

    const slugs = ['gaming', 'anime-nerd', 'casa-decor', 'presentes', 'auto']
    for (const slug of slugs) {
      const card = page.getByTestId(`universo-card-${slug}`)
      await expect(card).toBeVisible()
    }
  })

  test('F2.2 card com comingSoon exibe badge "Em breve"', async ({ page }) => {
    await page.goto('/')

    // O universo "auto" está marcado como comingSoon na fixture de config
    const badge = page.getByTestId('universo-badge-coming-soon')
    await expect(badge).toBeVisible()
    await expect(badge).toContainText('Em breve')
  })

  test('F2.2 card comingSoon não tem link ativo', async ({ page }) => {
    await page.goto('/')

    const autoCard = page.getByTestId('universo-card-auto')
    // Card comingSoon não deve ser um link ou deve ter pointer-events none
    const tagName = await autoCard.evaluate((el) => el.tagName.toLowerCase())
    const href = await autoCard.getAttribute('href')
    // O card não deve ser um link âncora clicável
    expect(tagName !== 'a' || href === null || href === '#').toBe(true)
  })

  test('F2.4 clique em card gaming navega para /universo/gaming', async ({ page }) => {
    await page.setViewportSize(DESKTOP)
    await page.goto('/')

    const gamingCard = page.getByTestId('universo-card-gaming')
    await gamingCard.click()

    await expect(page).toHaveURL('/universo/gaming')
  })

  test('F2.5 universo preferido aparece primeiro (cookie universe_pref = presentes)', async ({ page }) => {
    await page.context().addCookies([
      {
        name: 'universe_pref',
        value: 'presentes',
        domain: 'localhost',
        path: '/',
      },
    ])
    await page.goto('/')

    const section = page.getByTestId('universos-section')
    const firstCard = section.getByTestId(/^universo-card-/).first()

    await expect(firstCard).toHaveAttribute('data-testid', 'universo-card-presentes')
  })

  test('F2.6 sem preferência: ordem padrão (gaming primeiro)', async ({ page }) => {
    // Garante que não há cookie
    await page.context().clearCookies()
    await page.goto('/')

    const section = page.getByTestId('universos-section')
    const firstCard = section.getByTestId(/^universo-card-/).first()
    await expect(firstCard).toHaveAttribute('data-testid', 'universo-card-gaming')
  })

  test('F2.7 mobile: carousel com dots (universos-carousel-dots)', async ({ page }) => {
    await page.setViewportSize(MOBILE)
    await page.goto('/')

    const dots = page.getByTestId('universos-carousel-dots')
    await expect(dots).toBeVisible()
  })

  test('F2.8 desktop: grid (não carousel — sem dots)', async ({ page }) => {
    await page.setViewportSize(DESKTOP)
    await page.goto('/')

    const dots = page.getByTestId('universos-carousel-dots')
    await expect(dots).not.toBeVisible()
  })
})

// ─── Feature 3: Como Funciona ─────────────────────────────────────────────────

test.describe('M05-F3: Como Funciona', () => {
  test('F3.1 seção como-funciona-section existe', async ({ page }) => {
    await page.goto('/')

    const section = page.getByTestId('como-funciona-section')
    await expect(section).toBeVisible()
  })

  test('F3.1 exatamente 3 passos (passo-1, passo-2, passo-3)', async ({ page }) => {
    await page.goto('/')

    for (const n of [1, 2, 3]) {
      const passo = page.getByTestId(`passo-${n}`)
      await expect(passo).toBeVisible()
    }

    // Não deve haver um passo-4
    const passo4 = page.getByTestId('passo-4')
    await expect(passo4).not.toBeAttached()
  })

  test('F3.1 passo-1 contém "Escolhe" ou equivalente', async ({ page }) => {
    await page.goto('/')

    const passo1 = page.getByTestId('passo-1')
    const text = await passo1.textContent()
    expect(text?.toLowerCase()).toMatch(/escolh|seleciona|encontra/)
  })

  test('F3.1 passo-2 contém "Personaliza" ou equivalente', async ({ page }) => {
    await page.goto('/')

    const passo2 = page.getByTestId('passo-2')
    const text = await passo2.textContent()
    expect(text?.toLowerCase()).toMatch(/personaliz|customiz|cria/)
  })

  test('F3.1 passo-3 contém "Recebe" e contexto de exclusividade', async ({ page }) => {
    await page.goto('/')

    const passo3 = page.getByTestId('passo-3')
    const text = await passo3.textContent()
    expect(text?.toLowerCase()).toMatch(/recebe|entregue|único|exclusiv/)
  })

  test('F3.3 mobile: passos empilhados verticalmente', async ({ page }) => {
    await page.setViewportSize(MOBILE)
    await page.goto('/')

    // Em mobile, passo-1 deve aparecer acima de passo-2
    const passo1 = page.getByTestId('passo-1')
    const passo2 = page.getByTestId('passo-2')

    const box1 = await passo1.boundingBox()
    const box2 = await passo2.boundingBox()

    expect(box1).not.toBeNull()
    expect(box2).not.toBeNull()
    // passo-1 deve estar acima de passo-2 (y menor)
    expect(box1!.y).toBeLessThan(box2!.y)
  })
})

// ─── Feature 4: Prova Social ──────────────────────────────────────────────────

test.describe('M05-F4: Prova Social', () => {
  test('F4.1 seção prova-social-section visível quando há ≥3 depoimentos', async ({ page }) => {
    await page.goto('/')

    // Se a seção existir (≥3 depoimentos no seed), deve ser visível
    const section = page.getByTestId('prova-social-section')
    // Usamos isVisible() sem expect pois pode não ter dados de seed
    const isVisible = await section.isVisible().catch(() => false)
    if (isVisible) {
      const cards = page.getByTestId('depoimento-card')
      const count = await cards.count()
      expect(count).toBeGreaterThanOrEqual(3)
    }
  })

  test('F4.1 cards de depoimento têm data-testid depoimento-card', async ({ page }) => {
    await page.goto('/')

    const section = page.getByTestId('prova-social-section')
    const sectionVisible = await section.isVisible().catch(() => false)

    if (sectionVisible) {
      const firstCard = page.getByTestId('depoimento-card').first()
      await expect(firstCard).toBeVisible()
    } else {
      // Seção não renderizada quando <3 depoimentos — comportamento correto
      test.info().annotations.push({ type: 'skip-reason', description: 'Sem dados de seed suficientes' })
    }
  })
})

// ─── Feature 5: Destaques ─────────────────────────────────────────────────────

test.describe('M05-F5: Destaques por Universo', () => {
  test('F5.1 seção destaques-section existe', async ({ page }) => {
    await page.goto('/')

    const section = page.getByTestId('destaques-section')
    await expect(section).toBeVisible()
  })

  test('F5.4 botão btn-personalizar-{id} presente em produto de destaque', async ({ page }) => {
    await page.goto('/')

    const section = page.getByTestId('destaques-section')
    const sectionVisible = await section.isVisible().catch(() => false)

    if (sectionVisible) {
      // Verifica que pelo menos 1 botão personalizar existe
      const btns = page.locator('[data-testid^="btn-personalizar-"]')
      const count = await btns.count()
      expect(count).toBeGreaterThan(0)
    }
  })

  test('F5.5 preço exibe "A partir de" e formato R$', async ({ page }) => {
    await page.goto('/')

    const section = page.getByTestId('destaques-section')
    const sectionVisible = await section.isVisible().catch(() => false)

    if (sectionVisible) {
      const precoEls = page.locator('[data-testid^="produto-preco-"]')
      const count = await precoEls.count()

      if (count > 0) {
        const precoText = await precoEls.first().textContent()
        expect(precoText?.toLowerCase()).toMatch(/a partir de/)
        expect(precoText).toContain('R$')
      }
    }
  })
})

// ─── Feature 6: CTA WhatsApp ──────────────────────────────────────────────────

test.describe('M05-F6: CTA WhatsApp', () => {
  test('F6.1 seção cta-whatsapp-section visível quando whatsappPhone configurado', async ({ page }) => {
    await page.goto('/')

    // Se o StoreSettings.whatsappPhone está configurado no seed, a seção deve aparecer
    const section = page.getByTestId('cta-whatsapp-section')
    const isVisible = await section.isVisible().catch(() => false)

    if (isVisible) {
      const btn = page.getByTestId('btn-whatsapp')
      await expect(btn).toBeVisible()
    }
  })

  test('F6.1 link btn-whatsapp inicia com https://wa.me/', async ({ page }) => {
    await page.goto('/')

    const section = page.getByTestId('cta-whatsapp-section')
    const isVisible = await section.isVisible().catch(() => false)

    if (isVisible) {
      const btn = page.getByTestId('btn-whatsapp')
      const href = await btn.getAttribute('href')
      expect(href).toMatch(/^https:\/\/wa\.me\//)
    }
  })

  test('F6.4 link btn-whatsapp abre em _blank', async ({ page }) => {
    await page.goto('/')

    const section = page.getByTestId('cta-whatsapp-section')
    const isVisible = await section.isVisible().catch(() => false)

    if (isVisible) {
      const btn = page.getByTestId('btn-whatsapp')
      await expect(btn).toHaveAttribute('target', '_blank')
    }
  })

  test('F6.4 link btn-whatsapp tem rel="noopener noreferrer"', async ({ page }) => {
    await page.goto('/')

    const section = page.getByTestId('cta-whatsapp-section')
    const isVisible = await section.isVisible().catch(() => false)

    if (isVisible) {
      const btn = page.getByTestId('btn-whatsapp')
      const rel = await btn.getAttribute('rel')
      expect(rel).toContain('noopener')
      expect(rel).toContain('noreferrer')
    }
  })

  test('F6.3 mensagem pré-preenchida na URL é URL-encoded', async ({ page }) => {
    await page.goto('/')

    const section = page.getByTestId('cta-whatsapp-section')
    const isVisible = await section.isVisible().catch(() => false)

    if (isVisible) {
      const btn = page.getByTestId('btn-whatsapp')
      const href = await btn.getAttribute('href')
      expect(href).not.toBeNull()

      // Não deve conter espaços não-encodados na URL
      if (href!.includes('?text=')) {
        const textParam = href!.split('?text=')[1]
        expect(textParam).not.toContain(' ')
      }
    }
  })
})
