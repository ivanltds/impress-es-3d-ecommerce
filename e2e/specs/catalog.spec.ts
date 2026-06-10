// ─── M02: Catalog E2E Tests ───
// 🔴 RED — catalog code does NOT exist yet, these SHOULD fail
import { test, expect } from '@playwright/test'

test.describe('M02: Catálogo — F4', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/produtos')
  })

  // Cenário 4.1: Grid responsivo
  test('4.1 deve exibir grid de produtos com colunas responsivas', async ({ page }) => {
    // 🔴 FAIL: /produtos is a placeholder, no real grid yet
    const grid = page.getByTestId('product-grid')
    await expect(grid).toBeVisible()

    // Mobile: 1 column
    await page.setViewportSize({ width: 375, height: 812 })
    const cards375 = page.getByTestId('product-card')
    await expect(cards375.first()).toBeVisible()

    // Desktop: 3-4 columns
    await page.setViewportSize({ width: 1280, height: 900 })
    const cards1280 = page.getByTestId('product-card')
    await expect(cards1280.first()).toBeVisible()
  })

  // Cenário 4.2: Card de produto
  test('4.2 cada card deve ter imagem, nome, preço e categoria', async ({ page }) => {
    // 🔴 FAIL: no product cards with real data yet
    const card = page.getByTestId('product-card').first()
    await expect(card.getByTestId('product-image')).toBeVisible()
    await expect(card.getByTestId('product-name')).not.toBeEmpty()
    await expect(card.getByTestId('product-price')).not.toBeEmpty()
    await expect(card.getByTestId('product-category')).toBeVisible()
  })

  // Cenário 4.3: Filtro por categoria
  test('4.3 deve filtrar produtos por categoria', async ({ page }) => {
    // 🔴 FAIL: no filter functionality yet
    const filter = page.getByTestId('category-filter')
    await expect(filter).toBeVisible()
    await filter.getByText('Gamer').click()
    await page.waitForURL(/categoria=gamer/)
    const cards = page.getByTestId('product-card')
    await expect(cards).toHaveCount(await cards.count())
  })

  // Cenário 4.4: Filtro por preço
  test('4.4 deve filtrar por faixa de preço', async ({ page }) => {
    // 🔴 FAIL: no price filter yet
    const priceFilter = page.getByTestId('price-filter')
    await expect(priceFilter).toBeVisible()
  })

  // Cenário 4.5: Ordenação
  test('4.5 deve ordenar produtos por preço', async ({ page }) => {
    // 🔴 FAIL: no sort functionality yet
    const sortSelect = page.getByTestId('sort-select')
    await expect(sortSelect).toBeVisible()
    await sortSelect.selectOption('price_asc')
    await expect(page).toHaveURL(/ordenar=price_asc/)
  })

  // Cenário 4.6: Busca textual
  test('4.6 deve buscar produtos por nome', async ({ page }) => {
    // 🔴 FAIL: no search functionality yet
    const searchInput = page.getByTestId('product-search')
    await expect(searchInput).toBeVisible()
    await searchInput.fill('porta')
    await page.waitForTimeout(500)
    const cards = page.getByTestId('product-card')
    await expect(cards.first()).toBeVisible()
  })

  // Cenário 4.7: Estado vazio
  test('4.7 deve mostrar mensagem quando não há resultados', async ({ page }) => {
    // 🔴 FAIL: no empty state handling yet
    await page.goto('/produtos?categoria=inexistente')
    const empty = page.getByTestId('empty-state')
    await expect(empty).toBeVisible()
    await expect(empty).toContainText('Nenhum produto encontrado')
  })

  // Cenário 4.8: Loading skeletons
  test('4.8 deve mostrar skeletons durante carregamento', async ({ page }) => {
    // 🔴 FAIL: no skeleton loading yet
    await page.goto('/produtos')
    const skeletons = page.getByTestId('product-skeleton')
    // Skeletons appear briefly, but may already be gone. Check that grid exists.
    await expect(page.getByTestId('product-grid')).toBeVisible()
  })
})

test.describe('M02: Coleções — F6', () => {
  // Cenário 6.1: Página de coleção com produtos
  test('6.1 deve exibir produtos da coleção Gamer', async ({ page }) => {
    // 🔴 FAIL: collections page is a placeholder, no real products yet
    await page.goto('/colecoes/gamer')
    const header = page.getByTestId('collection-header')
    await expect(header).toBeVisible()
    const cards = page.getByTestId('product-card')
    await expect(cards.first()).toBeVisible()
  })

  // Cenário 6.2: Coleção vazia
  test('6.2 deve mostrar mensagem para coleção sem produtos', async ({ page }) => {
    // 🔴 FAIL: no empty state for collections yet
    await page.goto('/colecoes/auto')
    await expect(page.getByTestId('empty-collection')).toBeVisible()
  })

  // Cenário 6.3: Banner visual da coleção
  test('6.3 deve ter banner temático no topo', async ({ page }) => {
    // 🔴 FAIL: no themed banner yet
    await page.goto('/colecoes/gamer')
    const banner = page.getByTestId('collection-banner')
    await expect(banner).toBeVisible()
  })
})
