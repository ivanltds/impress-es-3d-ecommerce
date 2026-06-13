// ─── E2E Tests: M06 — Feature 1: Área /conta tematizada ───
// Spec: specs/M06-customer-area.spec.md — Cenários 1.1 a 1.6
// FASE 2 — TEST AUTHORING (🔴 RED)
// O wrapper [data-testid="conta-theme-wrapper"] ainda não existe — falha esperada
// (assertion/timeout), não erro de script.
//
// Responsividade: este spec roda nos 3 projects do playwright.config.ts
// (mobile 375 · tablet 768 · desktop 1280).

import { test, expect } from '@playwright/test'
import { ContaPage } from '../pages/conta-page'
import {
  registerAndLogin,
  setPreference,
  getScopedCssVar,
  findUniverseClass,
  normalizeColor,
  contrastRatioInside,
  UNIVERSE_PRIMARY,
  UNIVERSE_NAMES,
} from '../fixtures/m06-helpers'

test.describe('M06-F1: Área /conta tematizada', () => {
  // Cenário 1.1: Área /conta aplica tema do universo preferido do usuário logado
  test('Cenário 1.1: /conta aplica tema do universo preferido (gaming)', async ({ page }) => {
    await registerAndLogin(page)
    await setPreference(page, 'gaming')

    const conta = new ContaPage(page)
    await conta.goto()

    // wrapper presente no DOM
    await expect(conta.themeWrapper).toBeAttached()

    // classe CSS correspondente ao tema gaming aplicada no escopo do wrapper
    const themeClass = await findUniverseClass(page, 'conta-theme-wrapper')
    expect(themeClass, 'wrapper deve carregar a classe de tema universe_gaming').toContain('universe_gaming')

    // --color-primary reflete a cor primária do universo gaming (#00ff41)
    const primary = await getScopedCssVar(page, 'conta-theme-wrapper', '--color-primary')
    expect(normalizeColor(primary)).toBe(normalizeColor(UNIVERSE_PRIMARY['gaming']))
  })

  // Cenário 1.2: Área /conta sem universo preferido usa tema base neutro
  test('Cenário 1.2: sem universo preferido usa tema base neutro', async ({ page }) => {
    await registerAndLogin(page) // usuário novo → preferredCollection = null

    const conta = new ContaPage(page)
    await conta.goto()

    await expect(conta.themeWrapper).toBeAttached()

    // nenhuma classe de tema de universo aplicada
    const themeClass = await findUniverseClass(page, 'conta-theme-wrapper')
    expect(themeClass, 'sem preferência não pode haver classe universe_*').toBeNull()

    // sem variáveis de universo no escopo (design tokens base do projeto)
    const primary = await getScopedCssVar(page, 'conta-theme-wrapper', '--color-primary')
    expect(primary).toBe('')
  })

  // Cenário 1.3: Badge "Seu universo" é exibido quando universo está definido
  test('Cenário 1.3: badge do universo visível com preferredCollection = anime-nerd', async ({ page }) => {
    await registerAndLogin(page)
    await setPreference(page, 'anime-nerd')

    const conta = new ContaPage(page)
    await conta.goto()

    await expect(conta.universeBadge).toBeVisible()
    await expect(conta.universeBadge).toContainText(UNIVERSE_NAMES['anime-nerd'])
  })

  // Cenário 1.4: Badge não aparece quando preferência não está definida
  test('Cenário 1.4: badge NÃO renderizado sem preferência', async ({ page }) => {
    await registerAndLogin(page) // preferredCollection = null

    const conta = new ContaPage(page)
    await conta.goto()

    await expect(conta.themeWrapper).toBeAttached()
    await expect(conta.universeBadge).not.toBeAttached()
  })

  // Cenário 1.5: Tema NÃO se propaga para navegação global nem para o footer
  test('Cenário 1.5: tema não propaga para nav global/footer e contraste AA é mantido', async ({ page }) => {
    await registerAndLogin(page)
    await setPreference(page, 'auto')

    const conta = new ContaPage(page)
    await conta.goto()

    await expect(conta.themeWrapper).toBeAttached()

    const propagation = await page.evaluate(() => {
      const wrapper = document.querySelector('[data-testid="conta-theme-wrapper"]')
      const header = document.querySelector('header')
      const footer = document.querySelector('[data-testid="footer"]')
      return {
        headerExists: !!header,
        footerExists: !!footer,
        headerInsideWrapper: !!(wrapper && header && wrapper.contains(header)),
        footerInsideWrapper: !!(wrapper && footer && wrapper.contains(footer)),
        headerThemed: !!header?.closest('[class*="universe_"]'),
        footerThemed: !!footer?.closest('[class*="universe_"]'),
      }
    })

    // navegação global usa design tokens base (fora do wrapper, sem classe de universo)
    expect(propagation.headerExists).toBe(true)
    expect(propagation.headerInsideWrapper).toBe(false)
    expect(propagation.headerThemed).toBe(false)

    // footer usa design tokens base
    expect(propagation.footerExists).toBe(true)
    expect(propagation.footerInsideWrapper).toBe(false)
    expect(propagation.footerThemed).toBe(false)

    // contraste WCAG AA (≥ 4.5:1) dentro do wrapper
    const ratio = await contrastRatioInside(page, 'conta-theme-wrapper')
    expect(ratio).toBeGreaterThanOrEqual(4.5)
  })

  // Cenário 1.6: Sub-rotas de /conta herdam o tema do wrapper
  test('Cenário 1.6: /conta/pedidos e /conta/enderecos herdam o tema (presentes)', async ({ page }) => {
    await registerAndLogin(page)
    await setPreference(page, 'presentes')

    const conta = new ContaPage(page)

    // /conta/pedidos
    await conta.gotoPedidos()
    await expect(conta.themeWrapper).toBeAttached()
    const primaryPedidos = await getScopedCssVar(page, 'conta-theme-wrapper', '--color-primary')
    expect(normalizeColor(primaryPedidos)).toBe(normalizeColor(UNIVERSE_PRIMARY['presentes']))

    // /conta/enderecos — mesmo wrapper temático ativo
    await conta.gotoEnderecos()
    await expect(conta.themeWrapper).toBeAttached()
    const primaryEnderecos = await getScopedCssVar(page, 'conta-theme-wrapper', '--color-primary')
    expect(normalizeColor(primaryEnderecos)).toBe(normalizeColor(UNIVERSE_PRIMARY['presentes']))
  })
})
