// ─── M03: Cart + Checkout E2E Tests ───
import { test, expect } from '@playwright/test'

test.describe('M03: Carrinho — F1', () => {
  test('1.1 deve adicionar produto ao carrinho e mostrar contagem', async ({ page }) => {
    await page.goto('/produtos/porta-lata-neon-gamer')
    const addBtn = page.getByTestId('add-to-cart')
    await expect(addBtn).toBeVisible()
    await addBtn.click()
    // Cart count in header should appear
    const cartCount = page.getByTestId('cart-count')
    await expect(cartCount).toBeVisible()
    await expect(cartCount).toHaveText('1')
  })

  test('1.4 deve alterar quantidade no carrinho', async ({ page }) => {
    await page.goto('/produtos/porta-lata-neon-gamer')
    await page.getByTestId('add-to-cart').click()
    await page.goto('/carrinho')

    // Use decrease/increase buttons
    const decrease = page.getByTestId('cart-item-qty-decrease').first()
    const increase = page.locator('button:has(.lucide-plus)').first()
    await increase.click()
    await increase.click()
    const qty = page.getByTestId('cart-item-qty').first()
    await expect(qty).toHaveText('3')
  })

  test('1.5 deve remover item do carrinho', async ({ page }) => {
    await page.goto('/produtos/porta-lata-neon-gamer')
    await page.getByTestId('add-to-cart').click()
    await page.goto('/carrinho')
    const removeBtn = page.getByTestId('remove-item').first()
    await removeBtn.click()
    await expect(page.getByTestId('cart-empty')).toBeVisible()
  })

  test('1.6 deve mostrar carrinho vazio', async ({ page }) => {
    await page.goto('/carrinho')
    await expect(page.getByTestId('cart-empty')).toBeVisible()
    await expect(page.getByTestId('browse-products-link')).toBeVisible()
  })
})

test.describe('M03: Checkout — F2', () => {
  test('2.1 checkout deve ter 3 etapas', async ({ page }) => {
    await page.goto('/produtos/porta-lata-neon-gamer')
    await page.getByTestId('add-to-cart').click()
    await page.goto('/checkout')
    await expect(page.getByTestId('checkout-step-1')).toBeVisible()
    await page.getByTestId('checkout-next').click()
    await expect(page.getByTestId('checkout-step-2')).toBeVisible()
    await page.getByTestId('checkout-next').click()
    await expect(page.getByTestId('checkout-step-3')).toBeVisible()
  })

  test('2.2 resumo do pedido deve estar visível', async ({ page }) => {
    await page.goto('/produtos/porta-lata-neon-gamer')
    await page.getByTestId('add-to-cart').click()
    await page.goto('/checkout')
    await expect(page.getByTestId('order-summary')).toBeVisible()
    await expect(page.getByTestId('checkout-subtotal')).toBeVisible()
    await expect(page.getByTestId('checkout-total')).toBeVisible()
  })

  test.skip('2.3 frete deve calcular com CEP válido', async ({ page }) => {
    await page.goto('/produtos/porta-lata-neon-gamer')
    await page.getByTestId('add-to-cart').click()
    await page.goto('/checkout')
    await page.getByTestId('cep-input').fill('01001000')
    await page.getByTestId('calc-frete').click()
    await page.waitForTimeout(1000)
    // Shipping options appear after async calculation
    const opts = page.locator('[data-testid="shipping-option-pac"]')
    await expect(opts).toBeVisible({ timeout: 5000 })
  })

  test('2.5 confirmação deve mostrar número do pedido', async ({ page }) => {
    await page.goto('/produtos/porta-lata-neon-gamer')
    await page.getByTestId('add-to-cart').click()
    await page.goto('/checkout')
    await page.getByTestId('cep-input').fill('01001000')
    await page.getByTestId('calc-frete').click()
    await page.waitForTimeout(1000)
    await page.getByTestId('checkout-next').click()
    await page.getByTestId('checkout-next').click()
    await page.getByTestId('payment-method-card').click()
    await page.getByTestId('confirm-payment').click()
    await page.waitForURL(/confirmado/)
    await expect(page.getByTestId('order-confirmation')).toBeVisible()
    await expect(page.getByTestId('order-number')).toContainText('3DP-')
  })
})

test.describe('M03: Cliente — F3', () => {
  test('3.2 perfil redireciona para login se não autenticado', async ({ page }) => {
    await page.goto('/conta')
    await page.waitForURL(/auth\/entrar/)
  })

  test('3.3 histórico de pedidos redireciona para login', async ({ page }) => {
    await page.goto('/conta/pedidos')
    await page.waitForURL(/auth\/entrar/)
  })

  test('3.5 página de endereços carrega', async ({ page }) => {
    await page.goto('/conta/enderecos')
    await expect(page.getByTestId('addresses-list')).toBeVisible()
    await expect(page.getByTestId('add-address')).toBeVisible()
  })
})
