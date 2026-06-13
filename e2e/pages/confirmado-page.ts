// ─── POM: /checkout/confirmado — Sugestão de universo pós-checkout (M06, Feature 4) ───
// FASE 2 — TEST AUTHORING (🔴 RED)
// O modal universe-suggestion-modal ainda não existe — falha esperada.
//
// DA-M06-02 (G1 ✅): a página lê `lastOrder` do localStorage, e cada item passa a
// carregar `universeSlug`. Os testes semeiam esse snapshot via addInitScript.

import { type Page, type Locator } from '@playwright/test'

export interface LastOrderItem {
  name: string
  qty: number
  universeSlug?: string | null
}

export interface LastOrderSnapshot {
  orderNumber: string
  total: number
  items: LastOrderItem[]
}

export class ConfirmadoPage {
  constructor(readonly page: Page) {}

  /** Semeia o snapshot `lastOrder` no localStorage antes de qualquer navegação. */
  async seedLastOrder(order: LastOrderSnapshot) {
    await this.page.addInitScript((o) => {
      window.localStorage.setItem('lastOrder', JSON.stringify(o))
    }, order)
  }

  async goto() {
    await this.page.goto('/checkout/confirmado')
    await this.page.waitForLoadState('domcontentloaded')
  }

  get orderConfirmation(): Locator {
    return this.page.getByTestId('order-confirmation')
  }

  get suggestionModal(): Locator {
    return this.page.getByTestId('universe-suggestion-modal')
  }

  get acceptButton(): Locator {
    return this.page.getByTestId('universe-suggestion-accept')
  }

  get dismissButton(): Locator {
    return this.page.getByTestId('universe-suggestion-dismiss')
  }
}
