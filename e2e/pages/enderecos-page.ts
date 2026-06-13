// ─── POM: /conta/enderecos — Endereços no DB (M06, Feature 5) ───
// FASE 2 — TEST AUTHORING (🔴 RED)
// Contrato de data-testids definido pelo QA (inputs do formulário incluídos):
//   addresses-list · address-card · addresses-empty-state · add-address
//   address-form · save-address · address-form-error
//   address-input-{label|recipientName|cep|street|number|complement|district|city|state}
//   address-field-error-{campo} (mensagem de validação por campo — Cenário 5.4)
//   remove-address-{id} · set-default-address-{id} · address-default-badge

import { type Page, type Locator } from '@playwright/test'
import { type AddressPayload } from '../fixtures/m06-helpers'

export const ADDRESS_FORM_FIELDS = [
  'label',
  'recipientName',
  'cep',
  'street',
  'number',
  'complement',
  'district',
  'city',
  'state',
] as const

export class EnderecosPage {
  constructor(readonly page: Page) {}

  async goto() {
    await this.page.goto('/conta/enderecos')
    await this.page.waitForLoadState('domcontentloaded')
  }

  get addressesList(): Locator {
    return this.page.getByTestId('addresses-list')
  }

  get addressCards(): Locator {
    return this.page.getByTestId('address-card')
  }

  get emptyState(): Locator {
    return this.page.getByTestId('addresses-empty-state')
  }

  get addAddressButton(): Locator {
    return this.page.getByTestId('add-address')
  }

  get addressForm(): Locator {
    return this.page.getByTestId('address-form')
  }

  get saveButton(): Locator {
    return this.page.getByTestId('save-address')
  }

  get formError(): Locator {
    return this.page.getByTestId('address-form-error')
  }

  get defaultBadges(): Locator {
    return this.page.getByTestId('address-default-badge')
  }

  input(field: (typeof ADDRESS_FORM_FIELDS)[number]): Locator {
    return this.page.getByTestId(`address-input-${field}`)
  }

  fieldError(field: string): Locator {
    return this.page.getByTestId(`address-field-error-${field}`)
  }

  removeButton(id: string): Locator {
    return this.page.getByTestId(`remove-address-${id}`)
  }

  get removeButtons(): Locator {
    return this.page.locator('[data-testid^="remove-address-"]')
  }

  setDefaultButton(id: string): Locator {
    return this.page.getByTestId(`set-default-address-${id}`)
  }

  get setDefaultButtons(): Locator {
    return this.page.locator('[data-testid^="set-default-address-"]')
  }

  /** Abre o formulário e preenche todos os campos fornecidos. */
  async fillForm(data: Partial<AddressPayload>) {
    for (const [field, value] of Object.entries(data)) {
      if (value !== undefined) {
        await this.input(field as (typeof ADDRESS_FORM_FIELDS)[number]).fill(String(value))
      }
    }
  }
}
