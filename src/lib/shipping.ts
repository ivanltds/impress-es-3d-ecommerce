// ─── M03: Shipping — Melhor Envio API ───
// Integração real com Correios via Melhor Envio
// Token gratuito: https://melhorenvio.com.br → Cadastro → API

export interface ShippingOption {
  id: string
  name: string
  price: number
  days: number
}

const MELHOR_ENVIO_URL = 'https://melhorenvio.com.br/api/v2'
const FROM_CEP = '06110000'
const FROM_CEP_FORMATTED = '06110-000' // Osasco/SP — com traço para API de compra

async function fetchMelhorEnvio(cep: string): Promise<ShippingOption[]> {
  const token = process.env.MELHOR_ENVIO_TOKEN

  if (!token) {
    console.warn('[shipping] MELHOR_ENVIO_TOKEN não configurado. Usando cálculo aproximado.')
    return fallbackShipping(cep)
  }

  try {
    // Calcular frete
    const body = {
      from: { postal_code: FROM_CEP },
      to: { postal_code: cep.replace(/\D/g, '') },
      products: [{ id: '1', width: 15, height: 10, length: 20, weight: 0.3, quantity: 1 }],
      options: { receipt: false, own_hand: false },
    }

    const res = await fetch(`${MELHOR_ENVIO_URL}/me/shipment/calculate`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      console.error('[shipping] Erro na API Melhor Envio:', res.status)
      return fallbackShipping(cep)
    }

    const data = await res.json()

    return data
      .filter((item: { error?: string; price?: number }) => !item.error && item.price && item.price > 0)
      .map((item: { id: string; name: string; price: number; delivery_time?: number; custom_delivery_time?: number }) => ({
        id: String(item.id),
        name: item.name || 'Frete',
        price: Number(item.price),
        days: item.delivery_time || item.custom_delivery_time || 7,
      }))
  } catch (err) {
    console.error('[shipping] Falha ao calcular frete:', err)
    return fallbackShipping(cep)
  }
}

// ─── Fallback: cálculo aproximado baseado em Osasco/SP ───
function fallbackShipping(cep: string): ShippingOption[] {
  const digits = cep.replace(/\D/g, '')
  if (digits.length < 5) return []

  const prefix = digits.slice(0, 2)

  // Grande SP
  if (['01', '02', '03', '04', '05', '06', '07', '08', '09'].includes(prefix)) {
    return [
      { id: 'pac', name: 'PAC — Correios', price: 14.9, days: 2 },
      { id: 'sedex', name: 'SEDEX — Correios', price: 24.9, days: 1 },
    ]
  }

  // Interior SP
  if (['1'].includes(prefix[0])) {
    return [
      { id: 'pac', name: 'PAC — Correios', price: 19.9, days: 4 },
      { id: 'sedex', name: 'SEDEX — Correios', price: 32.9, days: 2 },
    ]
  }

  // RJ, MG, ES
  if (['2'].includes(prefix[0])) {
    return [
      { id: 'pac', name: 'PAC — Correios', price: 26.9, days: 6 },
      { id: 'sedex', name: 'SEDEX — Correios', price: 42.9, days: 3 },
    ]
  }

  // Sul
  if (['8', '9'].includes(prefix[0])) {
    return [
      { id: 'pac', name: 'PAC — Correios', price: 29.9, days: 7 },
      { id: 'sedex', name: 'SEDEX — Correios', price: 47.9, days: 4 },
    ]
  }

  // Norte, Nordeste, Centro-Oeste
  return [
    { id: 'pac', name: 'PAC — Correios', price: 34.9, days: 10 },
    { id: 'sedex', name: 'SEDEX — Correios', price: 54.9, days: 5 },
  ]
}

export async function calculateShipping(cep: string): Promise<ShippingOption[]> {
  return fetchMelhorEnvio(cep)
}

// ─── Label Purchase ───
export async function purchaseLabel(
  cep: string,
  serviceId: string,
  toName: string,
  toAddress: string,
  toCity: string
): Promise<{ tracking: string; price: number } | null> {
  const token = process.env.MELHOR_ENVIO_TOKEN
  if (!token) {
    console.warn('[shipping] MELHOR_ENVIO_TOKEN not set — cannot purchase label')
    return null
  }

  try {
    // Step 1: Add to cart
    const body = {
      from: { name: 'Impressao 3D', address: 'Rua Exemplo 123', city: 'Osasco', postal_code: FROM_CEP_FORMATTED },
      to: { name: toName, address: toAddress, city: toCity, postal_code: cep.replace(/\D/g, '') },
      service: Number(serviceId),
      products: [{ name: 'Produto 3D', quantity: 1, weight: 0.3, width: 15, height: 10, length: 20 }],
      options: { receipt: false, own_hand: false, insurance_value: 0 },
    }

    const cartRes = await fetch(`${MELHOR_ENVIO_URL}/me/cart`, {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    })
    if (!cartRes.ok) { console.error('[shipping] Cart error:', await cartRes.text()); return null }
    const cart = await cartRes.json()
    const cartId = cart.id
    if (!cartId) return null

    // Step 2: Checkout
    const checkoutRes = await fetch(`${MELHOR_ENVIO_URL}/me/shipment/checkout`, {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ orders: [cartId] }),
    })
    if (!checkoutRes.ok) { console.error('[shipping] Checkout error:', await checkoutRes.text()); return null }
    const checkout = await checkoutRes.json()

    // Step 3: Generate label
    console.log('[shipping] Checkout response:', JSON.stringify(checkout).slice(0, 500))
    const orderId = checkout?.purchase?.orders?.[0]?.id || checkout?.orders?.[0]?.id
    if (!orderId) { console.error('[shipping] No order ID in checkout. Full response:', JSON.stringify(checkout)); return null }

    const genRes = await fetch(`${MELHOR_ENVIO_URL}/me/shipment/generate`, {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ orders: [orderId] }),
    })
    if (!genRes.ok) { console.error('[shipping] Generate error:', await genRes.text()); return null }
    const genData = await genRes.json()
    const label = Array.isArray(genData) ? genData[0] : genData
    if (!label) return null

    return {
      tracking: label.tracking || '',
      price: label.price || 0,
    }
  } catch (err) {
    console.error('[shipping] Label purchase failed:', err)
    return null
  }
}
