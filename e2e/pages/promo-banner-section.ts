// ─── POM: Faixa promocional personalizada na LP (M06, Feature 7) ───
// FASE 2 — TEST AUTHORING (🔴 RED)
// A seção promo-banner-section ainda não existe na homepage — falha esperada.

import { type Page, type Locator } from '@playwright/test'

export class PromoBannerSection {
  constructor(readonly page: Page) {}

  async gotoHome() {
    await this.page.goto('/')
    await this.page.waitForLoadState('domcontentloaded')
  }

  get section(): Locator {
    return this.page.getByTestId('promo-banner-section')
  }

  get title(): Locator {
    return this.page.getByTestId('promo-banner-title')
  }

  /** Cards de produto da faixa (promo-banner-card-0, promo-banner-card-1, ...). */
  get cards(): Locator {
    return this.page.getByTestId(/^promo-banner-card-\d+$/)
  }

  card(index: number): Locator {
    return this.page.getByTestId(`promo-banner-card-${index}`)
  }

  cardImage(index: number): Locator {
    return this.page.getByTestId(`promo-banner-card-image-${index}`)
  }

  cardName(index: number): Locator {
    return this.page.getByTestId(`promo-banner-card-name-${index}`)
  }

  cardPrice(index: number): Locator {
    return this.page.getByTestId(`promo-banner-card-price-${index}`)
  }

  cardCta(index: number): Locator {
    return this.page.getByTestId(`promo-banner-card-cta-${index}`)
  }
}
