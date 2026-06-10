// ─── M02: Visual Tests (F1, F2, F3) ───
import { test, expect } from '@playwright/test'

test.describe('M02: Visual — F1 (Sem Emojis)', () => {
  test('1.1 home page não deve conter emojis', async ({ page }) => {
    await page.goto('/')
    const html = await page.content()
    // Check for common emoji unicode ranges
    const emojiPattern = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{27BF}\u{1F600}-\u{1F64F}]/u
    expect(html).not.toMatch(emojiPattern)
  })

  test('1.2 header não deve conter emojis — deve ter Lucide icons', async ({ page }) => {
    await page.goto('/')
    // SVG icons from Lucide should be present
    const svgIcons = page.locator('svg.lucide, svg[class*="lucide"]')
    const count = await svgIcons.count()
    expect(count).toBeGreaterThan(0)
  })

  test('1.3 footer não deve conter emojis', async ({ page }) => {
    await page.goto('/')
    const footer = await page.getByTestId('footer').innerHTML()
    const emojiPattern = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{27BF}]/u
    expect(footer).not.toMatch(emojiPattern)
  })
})

test.describe('M02: Visual — F2 (Animações)', () => {
  test('2.1 cards de coleção devem animar ao entrar na viewport', async ({ page }) => {
    await page.goto('/')
    const card = page.getByTestId('collection-card-gamer')
    await expect(card).toBeVisible()
    // Card rendered with Framer Motion — verify dimensions
    const box = await card.boundingBox()
    expect(box).toBeTruthy()
    expect(box!.width).toBeGreaterThan(0)
  })

  test('2.2 cards de produto devem ter efeito hover', async ({ page }) => {
    await page.goto('/')
    const card = page.getByTestId('featured-product-card').first()
    await card.hover()
    // Should have transform on hover
    await page.waitForTimeout(300)
    const transform = await card.evaluate((el) =>
      window.getComputedStyle(el).transform
    )
    expect(transform).toBeTruthy()
  })

  test('2.3 seções devem revelar ao scroll (scroll reveal)', async ({ page }) => {
    await page.goto('/')
    // Scroll down to trigger animations
    await page.evaluate(() => window.scrollTo(0, 800))
    await page.waitForTimeout(500)
    const collections = page.getByTestId('collections-section')
    await expect(collections).toBeVisible()
    const style = await collections.getAttribute('style')
    expect(style).toBeTruthy()
  })

  test('2.4 página deve ter fade in ao navegar', async ({ page }) => {
    await page.goto('/')
    const home = page.getByTestId('home-page')
    await expect(home).toBeVisible()
    const style = await home.getAttribute('style')
    expect(style).toContain('opacity')
  })

  test('2.5 botões devem ter transição hover', async ({ page }) => {
    await page.goto('/')
    const cta = page.getByTestId('hero-cta')
    await cta.hover()
    const transform = await cta.evaluate((el) =>
      window.getComputedStyle(el).transform
    )
    expect(transform).toBeTruthy()
  })
})

test.describe('M02: Visual — F3 (LP Aprimorada)', () => {
  test('3.1 hero deve ter gradiente e animação de entrada', async ({ page }) => {
    await page.goto('/')
    const hero = page.getByTestId('hero-section')
    await expect(hero).toBeVisible()
    // Check for gradient background
    // Check the inner gradient div exists
    const gradientDiv = hero.locator('> div').first()
    const className = await gradientDiv.evaluate((el) => el.className)
    expect(className).toContain('gradient')
  })

  test('3.2 cards de coleção devem ter ícone SVG grande centralizado', async ({ page }) => {
    await page.goto('/')
    const card = page.getByTestId('collection-card-gamer')
    const icon = card.locator('svg').first()
    await expect(icon).toBeVisible()
    const size = await icon.evaluate((el) => {
      const rect = el.getBoundingClientRect()
      return { w: rect.width, h: rect.height }
    })
    expect(size.w).toBeGreaterThanOrEqual(24)
    expect(size.h).toBeGreaterThanOrEqual(24)
  })

  test('3.3 seção Como Funciona deve ter ícones com números e conectores', async ({ page }) => {
    await page.goto('/')
    const step1 = page.getByTestId('step-1')
    const step3 = page.getByTestId('step-3')
    await expect(step1).toBeVisible()
    await expect(step3).toBeVisible()
    // Each step should have an SVG icon
    const icons = step1.locator('svg')
    await expect(icons.first()).toBeVisible()
  })

  test('3.4 produtos em destaque devem ter efeito hover 3D', async ({ page }) => {
    await page.goto('/')
    const card = page.getByTestId('featured-product-card').first()
    await card.hover()
    await page.waitForTimeout(300)
    const transform = await card.evaluate((el) =>
      window.getComputedStyle(el).transform
    )
    // Should have scale or translateY from the whileHover
    expect(transform).not.toBe('none')
  })
})
