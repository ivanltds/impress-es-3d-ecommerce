// ─── E2E Tests: M06 — Feature 3: Detalhe do pedido /conta/pedidos/[id] ───
// Spec: specs/M06-customer-area.spec.md — Cenários 3.1, 3.2*, 3.3*, 3.5, 3.7, 3.8, 3.9, 3.10, 3.11
// Inclui também Feature 6 (analytics): Cenário 6.3
// FASE 2 — TEST AUTHORING (🔴 RED)
// A página /conta/pedidos/[id] ainda não existe — falha esperada (404 / timeout).
//
// (*) Cenários 3.2, 3.3, 3.4 e 3.6 dependem de dados que a API de checkout atual
// não permite criar via E2E (customizationPrice, customizationSnapshot, status
// "processing", trackingCode). A cobertura COMPLETA desses cenários está em
// tests/integration/m06-order-detail.test.tsx (component test do OrderDetail).
// Aqui ficam as variantes E2E alcançáveis com pedido real criado via /api/checkout.

import { test, expect } from '@playwright/test'
import { OrderDetailPage } from '../pages/order-detail-page'
import {
  registerAndLogin,
  createOrderViaApi,
  captureAnalytics,
  DEFAULT_ORDER_ITEMS,
  ISO_8601,
} from '../fixtures/m06-helpers'

test.describe('M06-F3: Página de detalhe do pedido', () => {
  // Cenário 3.1: Página de detalhe carrega pedido existente do usuário logado
  test('Cenário 3.1: carrega pedido do usuário com número, total e data formatados', async ({ page }) => {
    await registerAndLogin(page)
    // subtotal: 89.90 + 2 × 45.00 = 179.90
    const { orderId, orderNumber } = await createOrderViaApi(page, DEFAULT_ORDER_ITEMS)

    const detail = new OrderDetailPage(page)
    const response = await detail.goto(orderId)

    expect(response?.status()).toBe(200)
    await expect(detail.orderDetail).toBeAttached()
    await expect(detail.orderNumber).toContainText(orderNumber)
    // total formatado em R$ com 2 casas decimais
    await expect(detail.orderTotal).toContainText(/R\$\s?179,90/)
    // data de criação no formato dd/mm/aaaa
    await expect(detail.orderDate).toContainText(/\d{2}\/\d{2}\/\d{4}/)
  })

  // Cenário 3.2 (variante E2E): itens com snapshot de nome, quantidade e preço unitário
  test('Cenário 3.2 (E2E): lista exibe 2 itens com nome, quantidade e preço unitário', async ({ page }) => {
    await registerAndLogin(page)
    const { orderId } = await createOrderViaApi(page, DEFAULT_ORDER_ITEMS)

    const detail = new OrderDetailPage(page)
    await detail.goto(orderId)

    await expect(detail.itemsList).toBeAttached()
    await expect(detail.items).toHaveCount(2)

    await expect(detail.item(0)).toContainText('Suporte Neon RGB')
    await expect(detail.item(0)).toContainText(/R\$\s?89,90/)

    await expect(detail.item(1)).toContainText('Porta Joias 3D')
    await expect(detail.item(1)).toContainText('x2')
    await expect(detail.item(1)).toContainText(/R\$\s?45,00/)
    // adicional de personalização zerado NÃO deve ser exibido
    await expect(detail.item(1)).not.toContainText(/\+\s?R\$\s?0,00/)
  })

  // Cenário 3.3 (variante E2E): badge de status visível com texto legível
  test('Cenário 3.3 (E2E): badge de status visível com texto legível (paid → Pago)', async ({ page }) => {
    await registerAndLogin(page)
    const { orderId } = await createOrderViaApi(page)

    const detail = new OrderDetailPage(page)
    await detail.goto(orderId)

    await expect(detail.statusBadge).toBeVisible()
    // pedido criado via /api/checkout nasce com status "paid"
    await expect(detail.statusBadge).toContainText('Pago')
  })

  // Cenário 3.5: Código de rastreio não exibido quando não disponível
  test('Cenário 3.5: sem trackingCode exibe order-tracking-pending', async ({ page }) => {
    await registerAndLogin(page)
    const { orderId } = await createOrderViaApi(page) // trackingCode = null em pedido novo

    const detail = new OrderDetailPage(page)
    await detail.goto(orderId)

    await expect(detail.orderDetail).toBeAttached()
    await expect(detail.tracking).not.toBeAttached()
    await expect(detail.trackingPending).toBeVisible()
    await expect(detail.trackingPending).toContainText(/rastreio/i)
  })

  // Cenário 3.7: Personalização não exibida quando item não tem customização
  test('Cenário 3.7: item sem customizationSnapshot não renderiza bloco de personalização', async ({ page }) => {
    await registerAndLogin(page)
    const { orderId } = await createOrderViaApi(page) // itens sem customização

    const detail = new OrderDetailPage(page)
    await detail.goto(orderId)

    await expect(detail.itemsList).toBeAttached()
    await expect(detail.itemCustomization(0)).not.toBeAttached()
    await expect(detail.itemCustomization(1)).not.toBeAttached()
  })

  // Cenário 3.8: Usuário não pode acessar pedido de outro usuário
  test('Cenário 3.8: pedido de outro usuário retorna 404 sem expor dados', async ({ page, context }) => {
    // usuário A cria o pedido
    await registerAndLogin(page)
    const { orderId, orderNumber } = await createOrderViaApi(page)

    // troca para usuário B
    await context.clearCookies()
    await registerAndLogin(page)

    const detail = new OrderDetailPage(page)
    const response = await detail.goto(orderId)

    expect(response?.status()).toBe(404)
    await expect(detail.orderDetail).not.toBeAttached()
    // não vaza dados do pedido alheio
    await expect(page.locator('body')).not.toContainText(orderNumber)
    await expect(page.locator('body')).not.toContainText('Suporte Neon RGB')
  })

  // Cenário 3.9: Usuário não logado é redirecionado para login
  test('Cenário 3.9: guest é redirecionado para /auth/entrar com callbackUrl', async ({ page }) => {
    await page.goto('/conta/pedidos/order-abc')
    await page.waitForURL(/\/auth\/entrar/)

    // URL de retorno preservada no redirect
    const url = page.url()
    expect(url).toContain('callbackUrl')
    expect(decodeURIComponent(url)).toContain('/conta/pedidos')
  })

  // Cenário 3.10: Pedido com id inexistente retorna 404
  test('Cenário 3.10: id inexistente retorna 404 com página customizada', async ({ page }) => {
    await registerAndLogin(page)

    const detail = new OrderDetailPage(page)
    const response = await detail.goto('order-inexistente-xyz')

    expect(response?.status()).toBe(404)
    // página 404 customizada com link de retorno (not-found.tsx)
    await expect(detail.backToOrders).toBeVisible()
  })

  // Cenário 3.11: Link "Voltar aos pedidos" navega para /conta/pedidos
  test('Cenário 3.11: back-to-orders navega para /conta/pedidos', async ({ page }) => {
    await registerAndLogin(page)
    const { orderId } = await createOrderViaApi(page)

    const detail = new OrderDetailPage(page)
    await detail.goto(orderId)

    await expect(detail.backToOrders).toBeVisible()
    await detail.backToOrders.click()
    await expect(page).toHaveURL(/\/conta\/pedidos\/?$/)
  })
})

test.describe('M06-F6: Analytics no detalhe do pedido', () => {
  // Cenário 6.3: Evento order_detail_viewed é emitido ao acessar a página
  test('Cenário 6.3: order_detail_viewed emitido ao carregar a página com sucesso', async ({ page }) => {
    const events = captureAnalytics(page)
    await registerAndLogin(page)
    const { orderId } = await createOrderViaApi(page)

    const detail = new OrderDetailPage(page)
    const response = await detail.goto(orderId)
    expect(response?.status()).toBe(200)

    await expect
      .poll(() => events.some((e) => e.event === 'order_detail_viewed'), { timeout: 5000 })
      .toBe(true)

    const event = events.find((e) => e.event === 'order_detail_viewed')!
    expect(event).toMatchObject({
      event: 'order_detail_viewed',
      orderId,
    })
    expect(typeof event.userId).toBe('string')
    expect(typeof event.orderStatus).toBe('string')
    expect(String(event.orderStatus).length).toBeGreaterThan(0)
    expect(String(event.timestamp)).toMatch(ISO_8601)
  })
})
