// ─── E2E Tests: M06 — Feature 7: Faixa promocional personalizada na LP ───
// Spec: specs/M06-customer-area.spec.md — Cenários 7.2, 7.3, 7.4 (display E2E)
// FASE 2 — TEST AUTHORING (🔴 RED)
// A seção [data-testid="promo-banner-section"] ainda não existe — falha esperada.
//
// Cobertura complementar (estados de campanha que exigem controle de DB):
//   - Cenários 7.1, 7.5, 7.8 → tests/integration/m06-promotions-active.test.ts
//   - Cenários 7.6, 7.7      → tests/integration/m06-admin-promo-banners.test.ts
// O seed atual não possui PromoBanner nem usuário admin, portanto o estado da LP
// nos testes abaixo é o fallback de produtos isFeatured (seed tem ≥ 3).

import { test, expect } from '@playwright/test'
import { PromoBannerSection } from '../pages/promo-banner-section'
import { registerAndLogin, setPreference } from '../fixtures/m06-helpers'

test.describe('M06-F7: Faixa promocional na homepage', () => {
  // Cenário 7.3: Fallback global sem campanha ativa nem universo preferido
  test('Cenário 7.3: guest vê fallback global com 3 a 5 cards e sem título de campanha', async ({ page }) => {
    const promo = new PromoBannerSection(page)
    await promo.gotoHome()

    await expect(promo.section).toBeAttached()

    const count = await promo.cards.count()
    expect(count, 'faixa exibe entre 3 e 5 cards (RN-M06-21)').toBeGreaterThanOrEqual(3)
    expect(count).toBeLessThanOrEqual(5)

    // sem campanha ativa no seed → título de campanha não exibido
    await expect(promo.title).not.toBeVisible()
  })

  // Cenário 7.2: Fallback por universo preferido do usuário logado
  test('Cenário 7.2: logado com preferredCollection=gaming vê a faixa de destaque', async ({ page }) => {
    await registerAndLogin(page)
    await setPreference(page, 'gaming')

    const promo = new PromoBannerSection(page)
    await promo.gotoHome()

    await expect(promo.section).toBeAttached()
    const count = await promo.cards.count()
    expect(count).toBeGreaterThanOrEqual(3)
    expect(count).toBeLessThanOrEqual(5)
    // sem campanha ativa → título de campanha não exibido
    await expect(promo.title).not.toBeVisible()
    // a correspondência exata produto↔universo (isFeatured + ProductUniverse)
    // é verificada na camada de integração: m06-promotions-active.test.ts
  })

  // Cenário 7.4: Cards exibem imagem, nome, preço e CTA para o PDP
  test('Cenário 7.4: card 0 tem imagem com src, nome, preço R$ X,XX e CTA para PDP', async ({ page }) => {
    const promo = new PromoBannerSection(page)
    await promo.gotoHome()

    await expect(promo.card(0)).toBeVisible()

    // imagem presente com src preenchido
    await expect(promo.cardImage(0)).toBeAttached()
    const src = await promo.cardImage(0).getAttribute('src')
    expect(src, 'imagem do card deve ter src preenchido').toBeTruthy()

    // nome do produto
    await expect(promo.cardName(0)).not.toBeEmpty()

    // preço no formato "R$ X,XX"
    await expect(promo.cardPrice(0)).toContainText(/R\$\s?\d+(\.\d{3})*,\d{2}/)

    // CTA é link para o PDP do produto
    // ⚠️ A spec cita "/produto/{slug}", mas a rota PDP existente é "/produtos/[slug]".
    //    Ambiguidade reportada ao Maestro — o teste aceita ambas até decisão do PO.
    const href = await promo.cardCta(0).getAttribute('href')
    expect(href).toMatch(/\/produtos?\/[\w-]+/)
  })

  // Cenário 7.6 (guard de segurança — complemento E2E):
  // a criação de campanhas é restrita a admin; sem sessão a API deve recusar.
  // O fluxo completo de criação (201 + exibição na LP) está coberto em
  // tests/integration/m06-admin-promo-banners.test.ts (Cenários 7.6 e 7.7).
  test('Cenário 7.6 (guard): POST /api/admin/promo-banners sem sessão é recusado', async ({ page }) => {
    const res = await page.request.post('/api/admin/promo-banners', {
      data: {
        title: 'Tentativa sem auth',
        startsAt: new Date(Date.now() - 3600_000).toISOString(),
        endsAt: new Date(Date.now() + 7 * 24 * 3600_000).toISOString(),
        isActive: true,
        products: [{ productId: 'prod-001', sortOrder: 0 }],
      },
    })
    expect([401, 403]).toContain(res.status())
  })

  // Responsividade explícita exigida pela tarefa: 375 / 768 / 1280
  test('Faixa responsiva: seção e card 0 visíveis em 375, 768 e 1280', async ({ page }) => {
    const promo = new PromoBannerSection(page)

    for (const viewport of [
      { width: 375, height: 812 },
      { width: 768, height: 1024 },
      { width: 1280, height: 900 },
    ]) {
      await page.setViewportSize(viewport)
      await promo.gotoHome()
      await expect(promo.section, `seção visível em ${viewport.width}px`).toBeAttached()
      await expect(promo.card(0), `card 0 visível em ${viewport.width}px`).toBeVisible()
    }
  })
})
