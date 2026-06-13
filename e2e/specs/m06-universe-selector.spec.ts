// ─── E2E Tests: M06 — Feature 2: Seletor de universo em /conta ───
// Spec: specs/M06-customer-area.spec.md — Cenários 2.1 a 2.6
// Inclui também Feature 6 (analytics): Cenários 6.1 e 6.4
// FASE 2 — TEST AUTHORING (🔴 RED)
// O componente [data-testid="universe-selector"] ainda não existe — falha esperada.
//
// Responsividade: roda nos 3 projects (375 / 768 / 1280) do playwright.config.ts.

import { test, expect } from '@playwright/test'
import { ContaPage } from '../pages/conta-page'
import {
  registerAndLogin,
  setPreference,
  captureAnalytics,
  getScopedCssVar,
  normalizeColor,
  ALL_UNIVERSE_SLUGS,
  UNIVERSE_NAMES,
  UNIVERSE_PRIMARY,
  ISO_8601,
} from '../fixtures/m06-helpers'

test.describe('M06-F2: Seletor de universo em /conta', () => {
  // Cenário 2.1: Seletor exibe os 5 universos disponíveis como cards visuais
  test('Cenário 2.1: 5 cards de universo com nome e imagem', async ({ page }) => {
    await registerAndLogin(page)
    const conta = new ContaPage(page)
    await conta.goto()

    await expect(conta.universeSelector).toBeVisible()
    await expect(conta.universeOptions).toHaveCount(5)

    for (const slug of ALL_UNIVERSE_SLUGS) {
      const card = conta.universeOption(slug)
      await expect(card).toBeVisible()
      await expect(card).toContainText(UNIVERSE_NAMES[slug])
      // imagem representativa (cardImageUrl ou fallback)
      await expect(card.locator('img').first()).toBeAttached()
    }
  })

  // Cenário 2.2: Card do universo atual exibe indicador de seleção ativo
  test('Cenário 2.2: card casa-decor ativo com aria-selected e indicador', async ({ page }) => {
    await registerAndLogin(page)
    await setPreference(page, 'casa-decor')

    const conta = new ContaPage(page)
    await conta.goto()

    await expect(conta.universeOption('casa-decor')).toHaveAttribute('aria-selected', 'true')
    await expect(conta.universeOption('casa-decor').getByTestId('universe-option-active-indicator')).toBeVisible()

    for (const slug of ALL_UNIVERSE_SLUGS.filter((s) => s !== 'casa-decor')) {
      await expect(conta.universeOption(slug)).toHaveAttribute('aria-selected', 'false')
    }
  })

  // Cenário 2.3: Clicar em universo diferente salva preferência via API e atualiza UI
  test('Cenário 2.3: clicar em presentes chama PATCH, atualiza seleção, badge e tema sem reload', async ({ page }) => {
    await registerAndLogin(page)
    await setPreference(page, 'gaming')

    const conta = new ContaPage(page)
    await conta.goto()
    await expect(conta.universeSelector).toBeVisible()

    // marcador para garantir que não há reload completo
    await page.evaluate(() => {
      ;(window as Window & { __noReload?: boolean }).__noReload = true
    })

    const patchPromise = page.waitForRequest(
      (req) => req.url().includes('/api/user/preference') && req.method() === 'PATCH'
    )
    await conta.universeOption('presentes').click()

    // chamada PATCH com body { universeSlug: "presentes" }
    const patchReq = await patchPromise
    expect(patchReq.postDataJSON()).toMatchObject({ universeSlug: 'presentes' })

    // seleção atualizada
    await expect(conta.universeOption('presentes')).toHaveAttribute('aria-selected', 'true')
    await expect(conta.universeOption('gaming')).toHaveAttribute('aria-selected', 'false')

    // badge atualizado para "Presentes"
    await expect(conta.universeBadge).toContainText(UNIVERSE_NAMES['presentes'])

    // tema transiciona para presentes
    await expect
      .poll(async () => normalizeColor(await getScopedCssVar(page, 'conta-theme-wrapper', '--color-primary')))
      .toBe(normalizeColor(UNIVERSE_PRIMARY['presentes']))

    // sem reload completo (flag de janela sobreviveu)
    const noReload = await page.evaluate(
      () => (window as Window & { __noReload?: boolean }).__noReload === true
    )
    expect(noReload, 'a troca de tema não pode causar reload completo').toBe(true)
  })

  // Cenário 2.4: Falha na API exibe erro e mantém estado anterior
  test('Cenário 2.4: API 500 exibe erro e mantém gaming selecionado', async ({ page }) => {
    await registerAndLogin(page)
    await setPreference(page, 'gaming')

    const conta = new ContaPage(page)
    await conta.goto()
    await expect(conta.universeSelector).toBeVisible()

    // API indisponível a partir de agora
    await page.route('**/api/user/preference', (route) =>
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal Server Error' }),
      })
    )

    await conta.universeOption('anime-nerd').click()

    // mensagem de erro exibida
    await expect(conta.selectorError).toBeVisible()

    // estado anterior mantido
    await expect(conta.universeOption('gaming')).toHaveAttribute('aria-selected', 'true')
    await expect(conta.universeOption('anime-nerd')).toHaveAttribute('aria-selected', 'false')

    // tema NÃO mudou
    const primary = await getScopedCssVar(page, 'conta-theme-wrapper', '--color-primary')
    expect(normalizeColor(primary)).toBe(normalizeColor(UNIVERSE_PRIMARY['gaming']))
  })

  // Cenário 2.5: Usuário sem preferência — nenhum card aparece como ativo
  test('Cenário 2.5: sem preferência todos os cards têm aria-selected=false', async ({ page }) => {
    await registerAndLogin(page) // preferredCollection = null

    const conta = new ContaPage(page)
    await conta.goto()
    await expect(conta.universeSelector).toBeVisible()

    for (const slug of ALL_UNIVERSE_SLUGS) {
      await expect(conta.universeOption(slug)).toHaveAttribute('aria-selected', 'false')
    }
    await expect(conta.activeIndicator).not.toBeVisible()
  })

  // Cenário 2.6: Seletor exibe estado de carregamento durante requisição
  test('Cenário 2.6: loading visível e cards desabilitados durante o PATCH', async ({ page }) => {
    await registerAndLogin(page)

    const conta = new ContaPage(page)
    await conta.goto()
    await expect(conta.universeSelector).toBeVisible()

    // atrasa a resposta da API para observar o estado de loading
    await page.route('**/api/user/preference', async (route) => {
      await new Promise((r) => setTimeout(r, 1500))
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ universeSlug: 'auto' }),
      })
    })

    await conta.universeOption('auto').click()

    // enquanto a chamada está pendente
    await expect(conta.selectorLoading).toBeVisible()
    await expect(conta.universeOption('gaming')).toBeDisabled()
    await expect(conta.universeOption('auto')).toBeDisabled()

    // após sucesso, loading removido e nova seleção refletida
    await expect(conta.selectorLoading).not.toBeVisible()
    await expect(conta.universeOption('auto')).toHaveAttribute('aria-selected', 'true')
  })
})

test.describe('M06-F6: Analytics no seletor de universo', () => {
  // Cenário 6.1: Evento universe_preference_changed emitido ao trocar universo em /conta
  test('Cenário 6.1: troca com sucesso emite universe_preference_changed (source account_page)', async ({ page }) => {
    const events = captureAnalytics(page)
    await registerAndLogin(page) // sem preferência → previousUniverse: null

    const conta = new ContaPage(page)
    await conta.goto()
    await expect(conta.universeSelector).toBeVisible()

    const responsePromise = page.waitForResponse(
      (res) => res.url().includes('/api/user/preference') && res.request().method() === 'PATCH'
    )
    await conta.universeOption('gaming').click()
    const response = await responsePromise
    expect(response.ok()).toBe(true)

    await expect
      .poll(() => events.some((e) => e.event === 'universe_preference_changed'), { timeout: 5000 })
      .toBe(true)

    const event = events.find((e) => e.event === 'universe_preference_changed')!
    expect(event).toMatchObject({
      event: 'universe_preference_changed',
      previousUniverse: null,
      newUniverse: 'gaming',
      source: 'account_page',
    })
    expect(typeof event.userId).toBe('string')
    expect(String(event.userId).length).toBeGreaterThan(0)
    expect(String(event.timestamp)).toMatch(ISO_8601)
  })

  // Cenário 6.4: Eventos NÃO são emitidos em caso de erro (4xx ou 5xx)
  test('Cenário 6.4: falha 500 na troca NÃO emite universe_preference_changed', async ({ page }) => {
    const events = captureAnalytics(page)
    await registerAndLogin(page)

    const conta = new ContaPage(page)
    await conta.goto()
    await expect(conta.universeSelector).toBeVisible()

    await page.route('**/api/user/preference', (route) =>
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal Server Error' }),
      })
    )

    await conta.universeOption('gaming').click()
    await expect(conta.selectorError).toBeVisible()

    // pequena janela para garantir que nenhum evento atrasado chegue
    await page.waitForTimeout(1000)
    expect(events.filter((e) => e.event === 'universe_preference_changed')).toHaveLength(0)
  })
})
