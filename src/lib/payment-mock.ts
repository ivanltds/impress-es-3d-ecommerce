// ─── M03: Payment Mock ───
// ⚠️ TECH DEBT: Substituir por Stripe + MercadoPago reais quando chaves disponíveis
// Ver: PRD/fura-fila/FF01-pagamento-real.md

export interface PaymentResult {
  success: boolean
  transactionId: string
  error?: string
}

export interface PaymentProvider {
  name: string
  processPayment(amount: number, data: Record<string, string>): Promise<PaymentResult>
}

const mockDelay = () => new Promise((r) => setTimeout(r, 800))

class MockStripeProvider implements PaymentProvider {
  name = 'stripe'

  async processPayment(amount: number, _data: Record<string, string>): Promise<PaymentResult> {
    await mockDelay()
    // Simula falha se query param mockPayment=fail
    if (typeof window !== 'undefined' && window.location.search.includes('mockPayment=fail')) {
      return { success: false, transactionId: '', error: 'Pagamento recusado. Tente novamente.' }
    }
    return { success: true, transactionId: `stripe_mock_${Date.now()}` }
  }
}

class MockMercadoPagoProvider implements PaymentProvider {
  name = 'mercadopago'

  async processPayment(amount: number, _data: Record<string, string>): Promise<PaymentResult> {
    await mockDelay()
    if (typeof window !== 'undefined' && window.location.search.includes('mockPayment=fail')) {
      return { success: false, transactionId: '', error: 'Pagamento Pix recusado.' }
    }
    return { success: true, transactionId: `mp_mock_${Date.now()}` }
  }
}

const providers: Record<string, PaymentProvider> = {
  stripe: new MockStripeProvider(),
  mercadopago: new MockMercadoPagoProvider(),
}

export function getPaymentProvider(name: string): PaymentProvider {
  const provider = providers[name]
  if (!provider) throw new Error(`Payment provider "${name}" not found`)
  return provider
}
