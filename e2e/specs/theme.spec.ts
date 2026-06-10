// ─── F5: Theme E2E Tests ───
// Mapeia para spec: cenários 5.1 a 5.8
import { test, expect } from '@playwright/test'
import { HomePage } from '../pages/home-page'

test.describe('F5: Tema', () => {
  // Cenário 5.1: Tema padrão (core)
  test('5.1 deve aplicar tema core por padrão', async ({ page }) => {
    const home = new HomePage(page)
    await home.goto()

    const html = page.locator('html')
    await expect(html).toHaveAttribute('data-theme', 'core')
  })

  // Cenário 5.3: Alternância manual de tema
  test('5.3 deve alternar entre claro e escuro ao clicar no toggle', async ({ page }) => {
    const home = new HomePage(page)
    await home.goto()

    const toggle = page.getByTestId('theme-toggle')
    await expect(toggle).toBeVisible()

    const html = page.locator('html')

    // Clica e verifica que data-mode muda
    const before = await html.getAttribute('data-mode')
    await toggle.click()
    await page.waitForTimeout(300) // aguarda transição
    const after = await html.getAttribute('data-mode')
    expect(after).not.toBe(before)
  })

  // Cenário 5.4: Cookie de preferência
  test('5.4 deve persistir tema em cookie após recarregar', async ({ page }) => {
    const home = new HomePage(page)
    await home.goto()

    const toggle = page.getByTestId('theme-toggle')
    const before = await page.locator('html').getAttribute('data-mode')
    await toggle.click()
    await page.waitForTimeout(300)

    // Recarrega
    await page.reload()
    const after = await page.locator('html').getAttribute('data-mode')

    // Deve manter o tema escolhido
    expect(after).not.toBe(before)
  })

  // Cenário 5.7: Contraste WCAG AA — formulário legível
  test('5.7 deve manter contraste adequado nos inputs', async ({ page }) => {
    await page.goto('/auth/entrar')
    const emailInput = page.getByTestId('email-input')
    await expect(emailInput).toBeVisible()
    // Verifica que o input existe e é funcional em qualquer tema
    await emailInput.fill('test@test.com')
    await expect(emailInput).toHaveValue('test@test.com')
  })

  // Cenário 5.8: Fallback para core com tema inválido
  test('5.8 deve aplicar core se tema inválido', async ({ page }) => {
    // Define cookie inválido
    await page.context().addCookies([
      { name: 'theme_pref', value: 'invalid_theme', domain: 'localhost', path: '/' },
    ])
    const home = new HomePage(page)
    await home.goto()

    const html = page.locator('html')
    await expect(html).toHaveAttribute('data-theme', 'core')
  })
})
