// ─── F8: Health Check E2E Tests ───
// Mapeia para spec: cenário 8.1
import { test, expect } from '@playwright/test'

test.describe('F8: Observabilidade', () => {
  // Cenário 8.1: Health check endpoint
  test('8.1 deve retornar status ok com timestamp', async ({ request }) => {
    const response = await request.get('/api/health')
    expect(response.status()).toBe(200)

    const body = await response.json()
    expect(body).toHaveProperty('status', 'ok')
    expect(body).toHaveProperty('timestamp')
    expect(body).toHaveProperty('uptime')
  })
})
