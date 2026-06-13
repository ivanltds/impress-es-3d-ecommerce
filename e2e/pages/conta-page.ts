// ─── POM: /conta — Área do cliente tematizada (M06, Features 1 e 2) ───
// FASE 2 — TEST AUTHORING (🔴 RED)
// Os data-testids abaixo são o contrato que o Dev deve implementar.

import { type Page, type Locator } from '@playwright/test'

export class ContaPage {
  constructor(readonly page: Page) {}

  async goto() {
    await this.page.goto('/conta')
    await this.page.waitForLoadState('domcontentloaded')
  }

  async gotoPedidos() {
    await this.page.goto('/conta/pedidos')
    await this.page.waitForLoadState('domcontentloaded')
  }

  async gotoEnderecos() {
    await this.page.goto('/conta/enderecos')
    await this.page.waitForLoadState('domcontentloaded')
  }

  // ─── Feature 1: tema ───────────────────────────────────────────────────────

  get themeWrapper(): Locator {
    return this.page.getByTestId('conta-theme-wrapper')
  }

  get universeBadge(): Locator {
    return this.page.getByTestId('conta-universe-badge')
  }

  // ─── Feature 2: seletor de universo ───────────────────────────────────────

  get universeSelector(): Locator {
    return this.page.getByTestId('universe-selector')
  }

  /** Card de um universo específico (ex: universe-option-gaming). */
  universeOption(slug: string): Locator {
    return this.page.getByTestId(`universe-option-${slug}`)
  }

  /** Todos os 5 cards de universo (exclui o active-indicator pelo regex exato). */
  get universeOptions(): Locator {
    return this.page.getByTestId(/^universe-option-(gaming|anime-nerd|casa-decor|presentes|auto)$/)
  }

  get activeIndicator(): Locator {
    return this.page.getByTestId('universe-option-active-indicator')
  }

  get selectorLoading(): Locator {
    return this.page.getByTestId('universe-selector-loading')
  }

  get selectorError(): Locator {
    return this.page.getByTestId('universe-selector-error')
  }
}
