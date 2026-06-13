// ─── E2E Tests: M06 — Feature 5: Endereços no banco de dados ───
// Spec: specs/M06-customer-area.spec.md — Cenários 5.1 a 5.9
// FASE 2 — TEST AUTHORING (🔴 RED)
// A nova página /conta/enderecos (DB) e a API /api/user/addresses ainda não
// existem — falha esperada (404 / timeout), não erro de script.
//
// ⚠️ Nota: o teste M03 "3.5 página de endereços carrega" (cart-checkout.spec.ts)
// espera que guest acesse /conta/enderecos. O Cenário 5.8 do M06 muda esse
// comportamento (redirect para login). Conflito reportado ao Maestro.

import { test, expect } from '@playwright/test'
import { EnderecosPage } from '../pages/enderecos-page'
import {
  registerAndLogin,
  createAddressViaApi,
  setDefaultAddressViaApi,
  VALID_ADDRESS,
} from '../fixtures/m06-helpers'

test.describe('M06-F5: Endereços persistidos no DB', () => {
  // Cenário 5.1: Página exibe endereços do usuário logado vindos do DB
  test('Cenário 5.1: lista exibe os 2 endereços do banco', async ({ page }) => {
    await registerAndLogin(page)
    await createAddressViaApi(page, { label: 'Casa' })
    await createAddressViaApi(page, { label: 'Trabalho', street: 'Rua Augusta', number: '500' })

    const enderecos = new EnderecosPage(page)
    await enderecos.goto()

    await expect(enderecos.addressesList).toBeAttached()
    await expect(enderecos.addressCards).toHaveCount(2)
    // dados correspondem aos registros do banco
    await expect(enderecos.addressesList).toContainText('Av. Paulista')
    await expect(enderecos.addressesList).toContainText('Rua Augusta')
  })

  // Cenário 5.2: Usuário sem endereços cadastrados vê estado vazio
  test('Cenário 5.2: estado vazio para usuário sem endereços', async ({ page }) => {
    await registerAndLogin(page) // usuário novo, sem endereços

    const enderecos = new EnderecosPage(page)
    await enderecos.goto()

    await expect(enderecos.addressesList).toBeAttached()
    await expect(enderecos.emptyState).toBeVisible()
    await expect(enderecos.addressCards).toHaveCount(0)
  })

  // Cenário 5.3: Adicionar novo endereço persiste no banco e exibe na lista
  test('Cenário 5.3: adicionar endereço chama POST, exibe na lista e não usa localStorage', async ({ page }) => {
    await registerAndLogin(page)

    const enderecos = new EnderecosPage(page)
    await enderecos.goto()

    await enderecos.addAddressButton.click()
    await expect(enderecos.addressForm).toBeVisible()
    await enderecos.fillForm(VALID_ADDRESS)

    const postPromise = page.waitForRequest(
      (req) => req.url().includes('/api/user/addresses') && req.method() === 'POST'
    )
    await enderecos.saveButton.click()

    // POST para /api/user/addresses com os dados do formulário
    const postReq = await postPromise
    expect(postReq.postDataJSON()).toMatchObject({
      label: 'Casa',
      recipientName: 'Maria Silva',
      cep: '01310-100',
      street: 'Av. Paulista',
      number: '1000',
      city: 'São Paulo',
      state: 'SP',
    })

    // novo endereço aparece na lista
    await expect(enderecos.addressCards).toHaveCount(1)
    await expect(enderecos.addressesList).toContainText('Av. Paulista')

    // registro existe no banco (verificado via API autenticada)
    const apiRes = await page.request.get('/api/user/addresses')
    expect(apiRes.ok()).toBe(true)
    const saved = await apiRes.json()
    expect(saved).toHaveLength(1)
    expect(saved[0]).toMatchObject({ street: 'Av. Paulista', number: '1000' })

    // localStorage NÃO é utilizado para armazenar o endereço (RN-M06-09)
    const localStorageAddresses = await page.evaluate(() => window.localStorage.getItem('addresses'))
    expect(localStorageAddresses).toBeNull()
  })

  // Cenário 5.4: Campos obrigatórios validados antes do envio
  test('Cenário 5.4: submit com obrigatórios vazios não envia e mostra validação', async ({ page }) => {
    await registerAndLogin(page)

    const apiCalls: string[] = []
    page.on('request', (req) => {
      if (req.url().includes('/api/user/addresses') && req.method() === 'POST') {
        apiCalls.push(req.url())
      }
    })

    const enderecos = new EnderecosPage(page)
    await enderecos.goto()
    await enderecos.addAddressButton.click()
    await expect(enderecos.addressForm).toBeVisible()

    // cep, street, number, city e state vazios → clica salvar
    await enderecos.saveButton.click()

    // mensagens de validação nos campos obrigatórios faltantes
    for (const field of ['cep', 'street', 'number', 'city', 'state'] as const) {
      await expect(enderecos.fieldError(field)).toBeVisible()
    }

    // formulário NÃO enviado — nenhuma chamada à API
    await page.waitForTimeout(800)
    expect(apiCalls).toHaveLength(0)
  })

  // Cenário 5.5: Remover endereço exclui o registro do banco
  test('Cenário 5.5: remover endereço chama DELETE e some da lista', async ({ page }) => {
    await registerAndLogin(page)
    const addr1 = await createAddressViaApi(page, { label: 'Casa' })
    await createAddressViaApi(page, { label: 'Trabalho' })

    const enderecos = new EnderecosPage(page)
    await enderecos.goto()
    await expect(enderecos.addressCards).toHaveCount(2)

    const deletePromise = page.waitForRequest(
      (req) => req.url().includes(`/api/user/addresses/${addr1.id}`) && req.method() === 'DELETE'
    )
    await enderecos.removeButton(addr1.id).click()
    await deletePromise

    // card removido da lista
    await expect(enderecos.addressCards).toHaveCount(1)

    // registro excluído do banco (verificado via API autenticada)
    const apiRes = await page.request.get('/api/user/addresses')
    const remaining = await apiRes.json()
    expect(remaining).toHaveLength(1)
    expect(remaining[0].id).not.toBe(addr1.id)
  })

  // Cenário 5.6: Marcar endereço como padrão atualiza flag isDefault
  test('Cenário 5.6: set-default chama PATCH e badge migra de card (atômico no DB)', async ({ page }) => {
    await registerAndLogin(page)
    const addr1 = await createAddressViaApi(page, { label: 'Casa' })
    await setDefaultAddressViaApi(page, addr1.id) // primeiro: isDefault = true
    const addr2 = await createAddressViaApi(page, { label: 'Trabalho' }) // segundo: false

    const enderecos = new EnderecosPage(page)
    await enderecos.goto()
    await expect(enderecos.addressCards).toHaveCount(2)
    await expect(enderecos.defaultBadges).toHaveCount(1)

    const patchPromise = page.waitForRequest(
      (req) => req.url().includes(`/api/user/addresses/${addr2.id}`) && req.method() === 'PATCH'
    )
    await enderecos.setDefaultButton(addr2.id).click()

    const patchReq = await patchPromise
    expect(patchReq.postDataJSON()).toMatchObject({ isDefault: true })

    // badge aparece no segundo e some do primeiro (apenas 1 badge — RN-M06-10)
    await expect(enderecos.defaultBadges).toHaveCount(1)
    const cardWithBadge = enderecos.addressCards.filter({
      has: page.getByTestId('address-default-badge'),
    })
    await expect(cardWithBadge).toContainText('Trabalho')

    // no banco: segundo true, primeiro false (verificado via API autenticada)
    const apiRes = await page.request.get('/api/user/addresses')
    const all: Array<{ id: string; isDefault: boolean }> = await apiRes.json()
    expect(all.find((a) => a.id === addr2.id)?.isDefault).toBe(true)
    expect(all.find((a) => a.id === addr1.id)?.isDefault).toBe(false)
  })

  // Cenário 5.7: Endereço padrão exibe badge visual diferenciado
  test('Cenário 5.7: badge apenas no card do endereço padrão', async ({ page }) => {
    await registerAndLogin(page)
    const addr1 = await createAddressViaApi(page, { label: 'Casa' })
    await setDefaultAddressViaApi(page, addr1.id)
    await createAddressViaApi(page, { label: 'Trabalho' })

    const enderecos = new EnderecosPage(page)
    await enderecos.goto()

    await expect(enderecos.addressCards).toHaveCount(2)
    // exatamente 1 badge, dentro do card padrão
    await expect(enderecos.defaultBadges).toHaveCount(1)
    const cardWithBadge = enderecos.addressCards.filter({
      has: page.getByTestId('address-default-badge'),
    })
    await expect(cardWithBadge).toContainText('Casa')
  })

  // Cenário 5.8: Usuário não logado é redirecionado para login
  test('Cenário 5.8: guest é redirecionado para /auth/entrar', async ({ page }) => {
    await page.goto('/conta/enderecos')
    await page.waitForURL(/\/auth\/entrar/)
    expect(page.url()).toMatch(/\/auth\/entrar/)
  })

  // Cenário 5.9: Erro da API ao salvar exibe mensagem sem perder dados do formulário
  test('Cenário 5.9: API 500 exibe address-form-error e preserva campos', async ({ page }) => {
    await registerAndLogin(page)

    const enderecos = new EnderecosPage(page)
    await enderecos.goto()
    await expect(enderecos.addressCards).toHaveCount(0)

    // simula indisponibilidade apenas do POST de criação
    await page.route('**/api/user/addresses', async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Internal Server Error' }),
        })
      } else {
        await route.fallback()
      }
    })

    await enderecos.addAddressButton.click()
    await enderecos.fillForm(VALID_ADDRESS)
    await enderecos.saveButton.click()

    // mensagem de erro exibida
    await expect(enderecos.formError).toBeVisible()

    // campos mantêm os valores preenchidos (sem reset)
    await expect(enderecos.input('cep')).toHaveValue('01310-100')
    await expect(enderecos.input('street')).toHaveValue('Av. Paulista')
    await expect(enderecos.input('recipientName')).toHaveValue('Maria Silva')

    // lista permanece inalterada
    await expect(enderecos.addressCards).toHaveCount(0)
  })
})
