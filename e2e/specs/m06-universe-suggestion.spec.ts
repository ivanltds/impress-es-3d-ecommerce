// ─── E2E Tests: M06 — Feature 4: Sugestão de universo pós-checkout ───
// Spec: specs/M06-customer-area.spec.md — Cenários 4.1 a 4.7
// Inclui também Feature 6 (analytics): Cenário 6.2
// FASE 2 — TEST AUTHORING (🔴 RED)
// O modal [data-testid="universe-suggestion-modal"] ainda não existe — falha esperada.
//
// DA-M06-02 (G1 ✅): a página /checkout/confirmado lê `lastOrder` do localStorage
// e os itens carregam `universeSlug`. Os testes semeiam esse snapshot diretamente.

import { test, expect } from '@playwright/test'
import { ConfirmadoPage, type LastOrderSnapshot } from '../pages/confirmado-page'
import { registerAndLogin, setPreference, captureAnalytics, ISO_8601 } from '../fixtures/m06-helpers'

function lastOrderWith(items: LastOrderSnapshot['items']): LastOrderSnapshot {
  return { orderNumber: '3DP-90001', total: 99.9, items }
}

test.describe('M06-F4: Sugestão de universo pós-checkout', () => {
  // Cenário 4.1: Modal exibido quando usuário sem preferência compra produto com universo
  test('Cenário 4.1: modal exibido com nome do universo e botões aceitar/dispensar', async ({ page }) => {
    await registerAndLogin(page) // preferredCollection = null

    const confirmado = new ConfirmadoPage(page)
    await confirmado.seedLastOrder(
      lastOrderWith([{ name: 'Suporte Neon RGB', qty: 1, universeSlug: 'gaming' }])
    )
    await confirmado.goto()

    await expect(confirmado.suggestionModal).toBeVisible()
    await expect(confirmado.suggestionModal).toContainText('Gaming')
    await expect(confirmado.acceptButton).toBeVisible()
    await expect(confirmado.acceptButton).toContainText('Sim, quero!')
    await expect(confirmado.dismissButton).toBeVisible()
    await expect(confirmado.dismissButton).toContainText('Não, obrigado')
  })

  // Cenário 4.2: Aceitar sugestão salva preferência e fecha modal
  test('Cenário 4.2: aceitar chama PATCH com universeSlug e fecha modal sem navegar', async ({ page }) => {
    await registerAndLogin(page)

    const confirmado = new ConfirmadoPage(page)
    await confirmado.seedLastOrder(
      lastOrderWith([{ name: 'Suporte Neon RGB', qty: 1, universeSlug: 'gaming' }])
    )
    await confirmado.goto()
    await expect(confirmado.suggestionModal).toBeVisible()

    const patchPromise = page.waitForRequest(
      (req) => req.url().includes('/api/user/preference') && req.method() === 'PATCH'
    )
    await confirmado.acceptButton.click()

    const patchReq = await patchPromise
    expect(patchReq.postDataJSON()).toMatchObject({ universeSlug: 'gaming' })

    // modal fechado, sem navegação forçada
    await expect(confirmado.suggestionModal).not.toBeVisible()
    await expect(page).toHaveURL(/\/checkout\/confirmado/)
  })

  // Cenário 4.3: Dispensar sugestão fecha modal sem alterar preferência
  test('Cenário 4.3: dispensar fecha modal sem chamada à API de preferência', async ({ page }) => {
    await registerAndLogin(page)

    const preferenceCalls: string[] = []
    page.on('request', (req) => {
      if (req.url().includes('/api/user/preference')) preferenceCalls.push(req.method())
    })

    const confirmado = new ConfirmadoPage(page)
    await confirmado.seedLastOrder(
      lastOrderWith([{ name: 'Figure Anime', qty: 1, universeSlug: 'anime-nerd' }])
    )
    await confirmado.goto()
    await expect(confirmado.suggestionModal).toBeVisible()

    await confirmado.dismissButton.click()
    await expect(confirmado.suggestionModal).not.toBeVisible()

    // nenhuma chamada PATCH foi feita — preferredCollection permanece null no banco
    await page.waitForTimeout(800)
    expect(preferenceCalls.filter((m) => m === 'PATCH')).toHaveLength(0)
  })

  // Cenário 4.4: Modal NÃO exibido quando usuário já tem universo preferido
  test('Cenário 4.4: usuário com preferência definida não vê o modal', async ({ page }) => {
    await registerAndLogin(page)
    await setPreference(page, 'casa-decor')

    const confirmado = new ConfirmadoPage(page)
    await confirmado.seedLastOrder(
      lastOrderWith([{ name: 'Suporte Neon RGB', qty: 1, universeSlug: 'gaming' }])
    )
    await confirmado.goto()

    // a página de confirmação carrega normalmente…
    await expect(confirmado.orderConfirmation).toBeVisible()
    // …mas o modal não é renderizado no DOM
    await expect(confirmado.suggestionModal).not.toBeAttached()
  })

  // Cenário 4.5: Modal NÃO exibido quando nenhum produto tem universo associado
  test('Cenário 4.5: pedido sem universo associado não dispara o modal', async ({ page }) => {
    await registerAndLogin(page)

    const confirmado = new ConfirmadoPage(page)
    await confirmado.seedLastOrder(
      lastOrderWith([
        { name: 'Peça Genérica A', qty: 1, universeSlug: null },
        { name: 'Peça Genérica B', qty: 2 },
      ])
    )
    await confirmado.goto()

    await expect(confirmado.orderConfirmation).toBeVisible()
    await expect(confirmado.suggestionModal).not.toBeAttached()
  })

  // Cenário 4.6: Pedido com múltiplos universos sugere o universo do primeiro item
  test('Cenário 4.6: múltiplos universos → sugere apenas o do primeiro item (gaming)', async ({ page }) => {
    await registerAndLogin(page)

    const confirmado = new ConfirmadoPage(page)
    await confirmado.seedLastOrder(
      lastOrderWith([
        { name: 'Suporte Neon RGB', qty: 1, universeSlug: 'gaming' },
        { name: 'Figure Anime', qty: 1, universeSlug: 'anime-nerd' },
      ])
    )
    await confirmado.goto()

    await expect(confirmado.suggestionModal).toBeVisible()
    await expect(confirmado.suggestionModal).toContainText('Gaming')
    // não deve sugerir múltiplos universos ao mesmo tempo
    await expect(confirmado.suggestionModal).not.toContainText('Anime & Nerd')
  })

  // Cenário 4.7: Usuário guest não recebe modal de sugestão
  test('Cenário 4.7: guest não vê o modal mesmo com universo no pedido', async ({ page }) => {
    // sem login — visitante guest
    const confirmado = new ConfirmadoPage(page)
    await confirmado.seedLastOrder(
      lastOrderWith([{ name: 'Suporte Neon RGB', qty: 1, universeSlug: 'gaming' }])
    )
    await confirmado.goto()

    await expect(confirmado.orderConfirmation).toBeVisible()
    await expect(confirmado.suggestionModal).not.toBeAttached()
  })
})

test.describe('M06-F6: Analytics na sugestão pós-checkout', () => {
  // Cenário 6.2: Evento universe_preference_changed emitido ao aceitar sugestão
  test('Cenário 6.2: aceitar sugestão emite evento com source post_checkout_suggestion', async ({ page }) => {
    const events = captureAnalytics(page)
    await registerAndLogin(page) // preferredCollection = null

    const confirmado = new ConfirmadoPage(page)
    await confirmado.seedLastOrder(
      lastOrderWith([{ name: 'Caneca Personalizada', qty: 1, universeSlug: 'presentes' }])
    )
    await confirmado.goto()
    await expect(confirmado.suggestionModal).toBeVisible()

    const responsePromise = page.waitForResponse(
      (res) => res.url().includes('/api/user/preference') && res.request().method() === 'PATCH'
    )
    await confirmado.acceptButton.click()
    const response = await responsePromise
    expect(response.ok()).toBe(true)

    await expect
      .poll(() => events.some((e) => e.event === 'universe_preference_changed'), { timeout: 5000 })
      .toBe(true)

    const event = events.find((e) => e.event === 'universe_preference_changed')!
    expect(event).toMatchObject({
      event: 'universe_preference_changed',
      previousUniverse: null,
      newUniverse: 'presentes',
      source: 'post_checkout_suggestion',
    })
    expect(typeof event.userId).toBe('string')
    expect(String(event.timestamp)).toMatch(ISO_8601)
  })
})
