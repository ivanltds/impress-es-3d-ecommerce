import { type Page, type Locator, expect } from '@playwright/test'

export class HomePage {
  constructor(readonly page: Page) {}

  async goto() {
    await this.page.goto('/')
    await this.page.waitForLoadState('domcontentloaded')
  }

  get heroSection(): Locator {
    return this.page.getByTestId('hero-section')
  }
  get heroTitle(): Locator {
    return this.heroSection.locator('h1')
  }
  get heroCta(): Locator {
    return this.page.getByTestId('hero-cta')
  }
  get collectionsSection(): Locator {
    return this.page.getByTestId('collections-section')
  }
  get howItWorks(): Locator {
    return this.page.getByTestId('how-it-works')
  }
  get featuredProducts(): Locator {
    return this.page.getByTestId('featured-products')
  }
  get whatsappButton(): Locator {
    return this.page.getByTestId('whatsapp-button')
  }

  getCollectionCard(slug: string): Locator {
    return this.page.getByTestId(`collection-card-${slug}`)
  }

  getStepCard(step: string): Locator {
    return this.page.getByTestId(`step-${step}`)
  }

  get featuredProductCards(): Locator {
    return this.page.getByTestId('featured-product-card')
  }

  async expectHeroVisible() {
    await expect(this.heroSection).toBeVisible()
    await expect(this.heroTitle).toBeVisible()
    await expect(this.heroCta).toBeVisible()
    await expect(this.heroCta).toHaveText('Ver Coleções')
  }
}
