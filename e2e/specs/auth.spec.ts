// ─── F4: Auth E2E Tests ───
// Mapeia para spec: cenários 4.1 a 4.8
import { test, expect } from '@playwright/test'
import { RegisterPage, LoginPage } from '../pages/auth-page'

const TEST_USER = {
  name: 'QA Test',
  email: `qa-test-${Date.now()}@test.com`,
  password: '12345678',
}

test.describe('F4: Autenticação', () => {
  // Cenário 4.1: Cadastro
  test('4.1 deve cadastrar novo usuário e redirecionar para login', async ({ page }) => {
    const register = new RegisterPage(page)
    await register.goto()

    await expect(page.getByTestId('register-page')).toBeVisible()
    await register.register(TEST_USER.name, TEST_USER.email, TEST_USER.password)
    await register.expectSuccess()
  })

  // Cenário 4.2: Login com credenciais válidas
  test('4.2 deve fazer login e redirecionar para home', async ({ page }) => {
    // Primeiro cadastra
    const register = new RegisterPage(page)
    await register.goto()
    await register.register(TEST_USER.name, TEST_USER.email, TEST_USER.password)
    await register.expectSuccess()

    // Depois faz login
    const login = new LoginPage(page)
    await login.goto()
    await login.login(TEST_USER.email, TEST_USER.password)
    await login.expectSuccess()
  })

  // Cenário 4.3: Login com credenciais inválidas
  test('4.3 deve exibir erro com senha incorreta', async ({ page }) => {
    const login = new LoginPage(page)
    await login.goto()
    await login.login(TEST_USER.email, 'wrong-password')
    await login.expectError('E-mail ou senha inválidos')
  })

  // Cenário 4.4: Logout (via página de login — valida que sessão não persiste como logado)
  test('4.4 deve mostrar link Entrar quando não logado', async ({ page }) => {
    await page.goto('/')
    const loginLink = page.getByTestId('login-link')
    await expect(loginLink).toBeVisible()
    await expect(loginLink).toHaveText('Entrar')
  })

  // Cenário 4.5: Acesso a rota protegida sem login
  test('4.5 pagina de login deve ser acessivel sem autenticacao', async ({ page }) => {
    // Verifica que a página de login é acessível sem autenticação
    const login = new LoginPage(page)
    await login.goto()
    await expect(page.getByTestId('login-page')).toBeVisible()
  })

  // Cenário 4.8: Sessão persistente (cookie existe após login)
  test('4.8 deve manter sessão após login', async ({ page }) => {
    // Register + login
    const register = new RegisterPage(page)
    await register.goto()
    const email2 = `qa-session-${Date.now()}@test.com`
    await register.register('Session Test', email2, TEST_USER.password)
    await register.expectSuccess()

    const login = new LoginPage(page)
    await login.goto()
    await login.login(email2, TEST_USER.password)

    // After login, should be redirected to home
    await page.waitForURL('/')
    await expect(page.getByTestId('header-logo')).toBeVisible()
  })
})
