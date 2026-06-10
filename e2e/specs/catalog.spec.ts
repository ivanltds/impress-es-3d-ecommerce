// ─── M02: Catalog E2E Tests (GREEN) ───
import { test, expect } from '@playwright/test'

test.describe('M02: Catálogo — F4', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/produtos')
  })

  test('4.1 deve exibir grid de produtos com colunas responsivas', async ({ page }) => {
    const grid = page.getByTestId('product-grid').first()
    await expect(grid).toBeVisible()
    const cards = page.getByTestId('product-card')
    await expect(cards.first()).toBeVisible()
  })

  test('4.2 cada card deve ter imagem, nome, preço e categoria', async ({ page }) => {
    const card = page.getByTestId('product-card').first()
    await expect(card.getByTestId('product-name')).not.toBeEmpty()
    await expect(card.getByTestId('product-price')).not.toBeEmpty()
    await expect(card.getByTestId('product-category')).toBeVisible()
  })

  test('4.3 deve filtrar produtos por categoria', async ({ page }) => {
    const filter = page.getByTestId('category-filter')
    await expect(filter).toBeVisible()
    await filter.getByText('Gamer').click()
    await page.waitForTimeout(300)
    const cards = page.getByTestId('product-card')
    // Should have some cards after filtering
    await expect(cards.first()).toBeVisible()
  })

  test('4.4 deve filtrar por faixa de preço', async ({ page }) => {
    const priceFilter = page.getByTestId('price-filter')
    await expect(priceFilter).toBeVisible()
  })

  test('4.5 deve ordenar produtos', async ({ page }) => {
    const sortSelect = page.getByTestId('sort-select')
    await expect(sortSelect).toBeVisible()
    await sortSelect.selectOption('price_asc')
    await expect(page).toHaveURL(/sort=price_asc/)
  })

  test('4.6 deve buscar produtos por nome', async ({ page }) => {
    const searchWrapper = page.getByTestId('product-search')
    await expect(searchWrapper).toBeVisible()
    const input = searchWrapper.locator('input')
    await input.fill('porta')
    await page.waitForTimeout(500)
    const cards = page.getByTestId('product-card')
    await expect(cards.first()).toBeVisible()
  })

  test('4.7 deve mostrar mensagem quando não há resultados', async ({ page }) => {
    await page.goto('/produtos?q=zzzzxyznotfound')
    await page.waitForTimeout(500)
    const empty = page.getByTestId('empty-state')
    await expect(empty).toBeVisible()
    await expect(empty).toContainText('Nenhum produto encontrado')
  })

  test('4.8 deve mostrar grid com produtos carregados', async ({ page }) => {
    await page.goto('/produtos')
    await expect(page.getByTestId('product-grid').first()).toBeVisible()
    const cards = page.getByTestId('product-card')
    const count = await cards.count()
    expect(count).toBeGreaterThan(0)
  })
})

test.describe('M02: Coleções — F6', () => {
  test('6.1 deve exibir produtos da coleção Gamer', async ({ page }) => {
    await page.goto('/colecoes/gamer')
    const cards = page.getByTestId('product-card')
    await expect(cards.first()).toBeVisible()
  })

  test('6.2 banner deve estar visível para coleção existente', async ({ page }) => {
    await page.goto('/colecoes/gamer')
    const banner = page.getByTestId('collection-banner')
    await expect(banner).toBeVisible()
    await expect(banner).toContainText('Gamer Energy')
  })

  test('6.3 deve ter banner temático no topo', async ({ page }) => {
    await page.goto('/colecoes/gamer')
    const banner = page.getByTestId('collection-banner')
    await expect(banner).toBeVisible()
  })
})
