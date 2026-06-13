// ─── POM: /conta/pedidos/[id] — Detalhe do pedido (M06, Feature 3) ───
// FASE 2 — TEST AUTHORING (🔴 RED)
// A página ainda não existe — navegação retorna 404 até o Dev implementar.

import { type Page, type Locator, type Response } from '@playwright/test'

export class OrderDetailPage {
  constructor(readonly page: Page) {}

  /** Navega para o detalhe e retorna a Response (para asserções de status HTTP). */
  async goto(orderId: string): Promise<Response | null> {
    const response = await this.page.goto(`/conta/pedidos/${orderId}`)
    await this.page.waitForLoadState('domcontentloaded')
    return response
  }

  get orderDetail(): Locator {
    return this.page.getByTestId('order-detail')
  }

  get orderNumber(): Locator {
    return this.page.getByTestId('order-number')
  }

  get orderTotal(): Locator {
    return this.page.getByTestId('order-total')
  }

  get orderDate(): Locator {
    return this.page.getByTestId('order-date')
  }

  get statusBadge(): Locator {
    return this.page.getByTestId('order-status-badge')
  }

  get tracking(): Locator {
    return this.page.getByTestId('order-tracking')
  }

  get trackingLink(): Locator {
    return this.page.getByTestId('order-tracking-link')
  }

  get trackingPending(): Locator {
    return this.page.getByTestId('order-tracking-pending')
  }

  get itemsList(): Locator {
    return this.page.getByTestId('order-items-list')
  }

  /** Itens individuais (order-item-0, order-item-1, ...). */
  get items(): Locator {
    return this.page.getByTestId(/^order-item-\d+$/)
  }

  item(index: number): Locator {
    return this.page.getByTestId(`order-item-${index}`)
  }

  itemCustomization(index: number): Locator {
    return this.page.getByTestId(`order-item-customization-${index}`)
  }

  get backToOrders(): Locator {
    return this.page.getByTestId('back-to-orders')
  }
}
