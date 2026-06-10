import { type Page, type Locator, expect } from '@playwright/test'

export class RegisterPage {
  constructor(readonly page: Page) {}

  async goto() {
    await this.page.goto('/auth/cadastrar')
  }

  get nameInput(): Locator {
    return this.page.getByTestId('name-input')
  }
  get emailInput(): Locator {
    return this.page.getByTestId('email-input')
  }
  get passwordInput(): Locator {
    return this.page.getByTestId('password-input')
  }
  get submitButton(): Locator {
    return this.page.getByTestId('register-submit')
  }
  get errorMessage(): Locator {
    return this.page.getByTestId('register-error')
  }

  async register(name: string, email: string, password: string) {
    await this.nameInput.fill(name)
    await this.emailInput.fill(email)
    await this.passwordInput.fill(password)
    await this.submitButton.click()
  }

  async expectSuccess() {
    await this.page.waitForURL('/auth/entrar?registered=true')
  }
}

export class LoginPage {
  constructor(readonly page: Page) {}

  async goto() {
    await this.page.goto('/auth/entrar')
  }

  get emailInput(): Locator {
    return this.page.getByTestId('email-input')
  }
  get passwordInput(): Locator {
    return this.page.getByTestId('password-input')
  }
  get submitButton(): Locator {
    return this.page.getByTestId('login-submit')
  }
  get errorMessage(): Locator {
    return this.page.getByTestId('login-error')
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email)
    await this.passwordInput.fill(password)
    await this.submitButton.click()
  }

  async expectSuccess() {
    await this.page.waitForURL('/')
    await expect(this.page.getByTestId('header-logo')).toBeVisible()
  }

  async expectError(message: string) {
    await expect(this.errorMessage).toContainText(message)
  }
}
