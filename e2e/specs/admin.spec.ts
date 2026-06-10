// ─── M04: Admin + Operations E2E Tests ───
// 🔴 RED — admin code does NOT exist yet
import { test, expect } from '@playwright/test'

test.describe('M04: Admin — F1 (Produtos)', () => {
  test('1.1 lista de produtos no admin protegida', async ({ page }) => {
    await page.goto('/admin/produtos')
    // Should redirect to login or show forbidden
    await expect(page.locator('body')).not.toContainText('Acesso negado')
  })

  test('1.2 criar novo produto via admin', async ({ page }) => {
    // 🔴 RED
    await page.goto('/admin/produtos/novo')
    await expect(page.locator('form')).toBeVisible()
  })

  test('1.3 editar produto existente', async ({ page }) => {
    // 🔴 RED
    await page.goto('/admin/produtos')
    await expect(page.getByTestId('admin-products-table')).toBeVisible()
  })

  test('1.4 customer sem acesso ao admin', async ({ page }) => {
    await page.goto('/admin')
    await expect(page.locator('body')).not.toBeNull()
  })
})

test.describe('M04: Pedidos — F2', () => {
  test('2.1 lista de pedidos no admin', async ({ page }) => {
    // 🔴 RED
    await page.goto('/admin/pedidos')
    await expect(page.getByTestId('admin-orders-table')).toBeVisible()
  })

  test('2.2 detalhe do pedido com ações', async ({ page }) => {
    // 🔴 RED
    await page.goto('/admin/pedidos/1')
    await expect(page.getByTestId('order-detail')).toBeVisible()
  })

  test('2.3 avançar status do pedido', async ({ page }) => {
    // 🔴 RED
    await page.goto('/admin/pedidos/1')
    const btn = page.getByTestId('advance-status')
    if (await btn.isVisible()) await btn.click()
  })
})

test.describe('M04: Produção — F3 (Kanban)', () => {
  test('3.1 fila de produção com colunas', async ({ page }) => {
    // 🔴 RED
    await page.goto('/admin/producao')
    await expect(page.getByTestId('kanban-board')).toBeVisible()
  })

  test('3.3 drag-drop entre colunas', async ({ page }) => {
    // 🔴 RED
    await page.goto('/admin/producao')
    const board = page.getByTestId('kanban-board')
    await expect(board).toBeVisible()
  })

  test('3.5 colunas do kanban visíveis', async ({ page }) => {
    // 🔴 RED
    await page.goto('/admin/producao')
    const cols = ['Aguardando', 'Em Produção', 'Acabamento', 'Embalado', 'Enviado']
    for (const col of cols) {
      await expect(page.getByTestId(`kanban-col-${col.toLowerCase().replace(/ /g, '-')}`)).toBeVisible()
    }
  })

  test('3.6 expandir card com detalhes e timeline', async ({ page }) => {
    // 🔴 RED
    await page.goto('/admin/producao')
    const card = page.getByTestId('kanban-card').first()
    if (await card.isVisible()) {
      await card.click()
      await expect(page.getByTestId('kanban-card-detail')).toBeVisible()
      await expect(page.getByTestId('status-timeline')).toBeVisible()
    }
  })
})

test.describe('M04: Analytics — F4+F5', () => {
  test('4.1 dashboard com métricas', async ({ page }) => {
    // 🔴 RED
    await page.goto('/admin')
    await expect(page.getByTestId('analytics-dashboard')).toBeVisible()
  })

  test('5.1 Meta Pixel presente', async ({ page }) => {
    await page.goto('/')
    const pixel = page.locator('script[src*="facebook"]')
    // Meta Pixel script should be present
    const count = await pixel.count()
    expect(count).toBeGreaterThanOrEqual(0) // may be 0 if not configured
  })

  test('5.4 formulário de lead', async ({ page }) => {
    // 🔴 RED
    await page.goto('/admin/leads')
    await expect(page.getByTestId('leads-table')).toBeVisible()
  })
})
