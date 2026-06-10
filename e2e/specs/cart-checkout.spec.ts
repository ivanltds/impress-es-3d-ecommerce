// ─── M03: Cart + Checkout E2E Tests ───
// 🔴 RED — cart/checkout code does NOT exist yet
import { test, expect } from '@playwright/test'

test.describe('M03: Carrinho — F1', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/produtos/porta-lata-neon-gamer')
  })

  test('1.1 deve adicionar produto ao carrinho e mostrar contagem', async ({ page }) => {
    // 🔴 RED: add to cart button doesn't exist yet
    const addBtn = page.getByTestId('add-to-cart')
    await expect(addBtn).toBeVisible()
    await addBtn.click()

    // Toast confirmation
    const toast = page.getByTestId('toast-success')
    await expect(toast).toBeVisible()
    await expect(toast).toContainText('adicionado')

    // Cart count in header
    const cartCount = page.getByTestId('cart-count')
    await expect(cartCount).toHaveText('1')
  })

  test('1.4 deve alterar quantidade no carrinho', async ({ page }) => {
    // 🔴 RED: cart page doesn't exist yet with quantity controls
    // First add item
    await page.getByTestId('add-to-cart').click()
    await page.getByTestId('cart-button').click()
    await page.waitForURL('/carrinho')

    const qtyInput = page.getByTestId('cart-item-qty').first()
    await qtyInput.fill('3')
    await page.getByTestId('update-cart').click()

    const lineTotal = page.getByTestId('cart-line-total').first()
    await expect(lineTotal).toBeVisible()
  })

  test('1.5 deve remover item do carrinho', async ({ page }) => {
    // 🔴 RED
    await page.getByTestId('add-to-cart').click()
    await page.goto('/carrinho')

    const removeBtn = page.getByTestId('remove-item').first()
    await removeBtn.click()
    await expect(page.getByTestId('cart-empty')).toBeVisible()
    await expect(page.getByTestId('cart-empty')).toContainText('vazio')
  })

  test('1.6 deve mostrar carrinho vazio', async ({ page }) => {
    // 🔴 RED
    await page.goto('/carrinho')
    await expect(page.getByTestId('cart-empty')).toBeVisible()
    await expect(page.getByTestId('browse-products-link')).toBeVisible()
  })

  test('1.7 mini carrinho no header deve abrir dropdown', async ({ page }) => {
    // 🔴 RED
    // Add an item first
    await page.goto('/produtos/porta-lata-neon-gamer')
    await page.getByTestId('add-to-cart').click()

    const cartBtn = page.getByTestId('cart-button')
    await cartBtn.click()
    const miniCart = page.getByTestId('mini-cart-dropdown')
    await expect(miniCart).toBeVisible()
  })
})

test.describe('M03: Checkout — F2', () => {
  test('2.1 checkout deve ter 3 etapas', async ({ page }) => {
    // 🔴 RED: checkout page doesn't exist yet
    // Add item first
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
    // 🔴 RED
    await page.goto('/checkout')
    await expect(page.getByTestId('order-summary')).toBeVisible()
    await expect(page.getByTestId('checkout-subtotal')).toBeVisible()
    await expect(page.getByTestId('checkout-total')).toBeVisible()
  })

  test('2.3 frete deve calcular com CEP válido', async ({ page }) => {
    // 🔴 RED
    await page.goto('/checkout')
    await page.getByTestId('cep-input').fill('01001000')
    await page.getByTestId('calc-frete').click()
    await expect(page.getByTestId('shipping-options')).toBeVisible()
  })

  test('2.5 confirmação deve mostrar número do pedido', async ({ page }) => {
    // 🔴 RED
    await page.goto('/checkout')
    // Fill shipping
    await page.getByTestId('cep-input').fill('01001000')
    await page.getByTestId('calc-frete').click()
    await page.getByTestId('shipping-option-pac').click()
    await page.getByTestId('checkout-next').click()
    await page.getByTestId('checkout-next').click()
    // Payment step
    await page.getByTestId('payment-method-card').click()
    await page.getByTestId('confirm-payment').click()

    await expect(page.getByTestId('order-confirmation')).toBeVisible()
    await expect(page.getByTestId('order-number')).toContainText('3DP-')
  })

  test('2.6 erro de pagamento deve mostrar mensagem', async ({ page }) => {
    // 🔴 RED
    await page.goto('/checkout?mockPayment=fail')
    await page.getByTestId('payment-method-card').click()
    await page.getByTestId('confirm-payment').click()

    await expect(page.getByTestId('payment-error')).toBeVisible()
    await expect(page.getByTestId('cart-items')).toBeVisible() // preserved
  })
})

test.describe('M03: Cliente — F3', () => {
  test('3.2 perfil deve mostrar dados do usuário', async ({ page }) => {
    // 🔴 RED: /conta page doesn't exist yet
    await page.goto('/conta')
    await expect(page.getByTestId('profile-name')).toBeVisible()
    await expect(page.getByTestId('profile-email')).toBeVisible()
  })

  test('3.3 histórico de pedidos deve listar compras', async ({ page }) => {
    // 🔴 RED
    await page.goto('/conta/pedidos')
    await expect(page.getByTestId('orders-list')).toBeVisible()
  })

  test('3.5 endereços deve permitir CRUD', async ({ page }) => {
    // 🔴 RED
    await page.goto('/conta/enderecos')
    await expect(page.getByTestId('addresses-list')).toBeVisible()
    await page.getByTestId('add-address').click()
    await page.getByTestId('address-form').fill({
      cep: '01001000',
      street: 'Rua Teste',
      number: '123',
      district: 'Centro',
      city: 'São Paulo',
      state: 'SP',
    })
    await page.getByTestId('save-address').click()
    await expect(page.getByTestId('address-card').first()).toBeVisible()
  })
})
