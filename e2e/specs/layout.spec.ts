// ─── F6: Layout E2E Tests ───
// Mapeia para spec: cenários 6.1 a 6.7
import { test, expect } from '@playwright/test'

test.describe('F6: Layout', () => {
  // Cenário 6.1: Header com elementos principais
  test('6.1 deve exibir header com logo, nav, busca, carrinho e entrar', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByTestId('header-logo')).toBeVisible()
    await expect(page.getByTestId('header-nav')).toBeVisible()
    await expect(page.getByTestId('search-button')).toBeVisible()
    await expect(page.getByTestId('cart-button')).toBeVisible()
    await expect(page.getByTestId('login-link')).toBeVisible()
  })

  // Cenário 6.2: Header responsivo mobile — hamburguer
  test('6.2 mobile: deve mostrar hamburguer e esconder nav', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto('/')

    const hamburguer = page.getByTestId('mobile-menu-button')
    await expect(hamburguer).toBeVisible()

    // Nav desktop deve estar oculto
    const nav = page.getByTestId('header-nav')
    await expect(nav).not.toBeVisible()

    // Abre drawer
    await hamburguer.click()
    const drawer = page.getByTestId('mobile-drawer')
    await expect(drawer).toBeVisible()
  })

  // Cenário 6.3: Tablet/Desktop — nav visível, sem hamburguer
  test('6.3 desktop: nav visível, hamburguer oculto', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 })
    await page.goto('/')

    await expect(page.getByTestId('header-nav')).toBeVisible()
    await expect(page.getByTestId('mobile-menu-button')).not.toBeVisible()
  })

  // Cenário 6.4: Footer institucional
  test('6.4 deve exibir footer com links, redes e copyright', async ({ page }) => {
    await page.goto('/')
    const footer = page.getByTestId('footer')
    await expect(footer).toBeVisible()
    await expect(footer.getByText('Termos de Uso')).toBeVisible()
    await expect(footer.getByText('Política de Privacidade')).toBeVisible()
    await expect(page.getByTestId('social-instagram')).toBeVisible()
    await expect(page.getByTestId('social-whatsapp')).toBeVisible()
  })

  // Cenário 6.7: SEO — idioma pt-BR
  test('6.7 deve ter html lang="pt-BR"', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('html')).toHaveAttribute('lang', 'pt-BR')
  })
})
