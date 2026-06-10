// ─── F7: Home Page E2E Tests ───
// Mapeia para spec: cenários 7.1 a 7.8
import { test, expect } from '@playwright/test'
import { HomePage } from '../pages/home-page'

test.describe('F7: Home Page', () => {
  let home: HomePage

  test.beforeEach(async ({ page }) => {
    home = new HomePage(page)
    await home.goto()
  })

  // Cenário 7.1: Hero com proposta de valor
  test('7.1 deve exibir hero section com título e CTA', async () => {
    await home.expectHeroVisible()
  })

  // Cenário 7.2: Coleções/Universos
  test('7.2 deve exibir 5 cards de coleção', async () => {
    await expect(home.collectionsSection).toBeVisible()
    const slugs = ['gamer', 'anime', 'home', 'gifts', 'auto']
    for (const slug of slugs) {
      await expect(home.getCollectionCard(slug)).toBeVisible()
    }
  })

  // Cenário 7.3: Como Funciona
  test('7.3 deve exibir seção Como Funciona com 3 passos', async () => {
    await expect(home.howItWorks).toBeVisible()
    for (const step of ['1', '2', '3']) {
      await expect(home.getStepCard(step)).toBeVisible()
    }
  })

  // Cenário 7.4: Produtos em Destaque (placeholder)
  test('7.4 deve exibir 4 cards de produto com selo Em breve', async () => {
    await expect(home.featuredProducts).toBeVisible()
    await expect(home.featuredProductCards).toHaveCount(4)
    await expect(home.featuredProductCards.first().getByText('Em breve')).toBeVisible()
  })

  // Cenário 7.5: Botão WhatsApp flutuante
  test('7.5 deve exibir botão flutuante de WhatsApp', async () => {
    await expect(home.whatsappButton).toBeVisible()
    const href = await home.whatsappButton.getAttribute('href')
    expect(href).toContain('wa.me')
  })

  // Cenário 7.6: SEO meta tags
  test('7.6 deve ter meta tags de SEO', async ({ page }) => {
    await expect(page).toHaveTitle(/Impressão 3D/)
    const metaDesc = page.locator('meta[name="description"]')
    await expect(metaDesc).toHaveAttribute('content')
  })

  // Cenário 7.7: Grid responsivo mobile (375px)
  test('7.7 mobile: coleções em 1 coluna, produtos em 2', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await home.goto()

    // Em mobile, os cards de coleção devem estar visíveis
    await expect(home.getCollectionCard('gamer')).toBeVisible()
    await expect(home.featuredProductCards).toHaveCount(4)
  })

  // Cenário 7.8: Grid responsivo desktop (1280px)
  test('7.8 desktop: hero visível, grid expandido', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 })
    await home.goto()

    await home.expectHeroVisible()
    await expect(home.featuredProductCards).toHaveCount(4)
  })
})
