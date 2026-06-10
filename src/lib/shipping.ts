// ─── M03: Shipping — Melhor Envio API ───
// Integração real com Correios via Melhor Envio
// Token gratuito: https://melhorenvio.com.br → Cadastro → API

export interface ShippingOption {
  id: number
  name: string
  price: number
  days: number
}

export interface StoreAddressData {
  name: string
  street: string
  number: string
  city: string
  state: string
  cep: string // formatado: "06110-000"
}

// Suporte a sandbox: defina MELHOR_ENVIO_SANDBOX=true na Vercel se usar token de teste
const MELHOR_ENVIO_URL = process.env.MELHOR_ENVIO_SANDBOX === 'true'
  ? 'https://sandbox.melhorenvio.com.br/api/v2'
  : 'https://melhorenvio.com.br/api/v2'

// Melhor Envio exige User-Agent com nome do app e e-mail do desenvolvedor
const ME_USER_AGENT = 'Impressao3DStore (ivanltds@gmail.com)'

function formatCep(cep: string): string {
  return cep.replace(/\D/g, '').replace(/^(\d{5})(\d{3})$/, '$1-$2')
}

function meHeaders(token: string) {
  return {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
    'User-Agent': ME_USER_AGENT,
  }
}

async function fetchMelhorEnvio(cep: string, fromCep?: string): Promise<ShippingOption[]> {
  const token = process.env.MELHOR_ENVIO_TOKEN

  if (!token) {
    console.warn('[shipping] MELHOR_ENVIO_TOKEN não configurado. Usando cálculo aproximado.')
    return fallbackShipping(cep)
  }

  // CEP de origem: prioriza parâmetro, fallback para env var (compatibilidade)
  const originCep = formatCep(fromCep || process.env.MELHOR_ENVIO_FROM_CEP || '06110-000')

  try {
    const body = {
      from: { postal_code: originCep },
      to: { postal_code: cep.replace(/\D/g, '') },
      products: [{ id: '1', width: 15, height: 10, length: 20, weight: 0.3, quantity: 1 }],
      options: { receipt: false, own_hand: false },
    }

    const res = await fetch(`${MELHOR_ENVIO_URL}/me/shipment/calculate`, {
      method: 'POST',
      headers: meHeaders(token),
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      console.error('[shipping] Erro na API Melhor Envio:', res.status)
      return fallbackShipping(cep)
    }

    const data = await res.json()

    return data
      .filter((item: { error?: string; price?: number }) => !item.error && item.price && Number(item.price) > 0)
      .map((item: { id: number; name: string; price: number; delivery_time?: number; custom_delivery_time?: number }) => ({
        id: Number(item.id),
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
      { id: 1, name: 'PAC — Correios', price: 14.9, days: 2 },
      { id: 2, name: 'SEDEX — Correios', price: 24.9, days: 1 },
    ]
  }

  // Interior SP
  if (['1'].includes(prefix[0])) {
    return [
      { id: 1, name: 'PAC — Correios', price: 19.9, days: 4 },
      { id: 2, name: 'SEDEX — Correios', price: 32.9, days: 2 },
    ]
  }

  // RJ, MG, ES
  if (['2'].includes(prefix[0])) {
    return [
      { id: 1, name: 'PAC — Correios', price: 26.9, days: 6 },
      { id: 2, name: 'SEDEX — Correios', price: 42.9, days: 3 },
    ]
  }

  // Sul
  if (['8', '9'].includes(prefix[0])) {
    return [
      { id: 1, name: 'PAC — Correios', price: 29.9, days: 7 },
      { id: 2, name: 'SEDEX — Correios', price: 47.9, days: 4 },
    ]
  }

  // Norte, Nordeste, Centro-Oeste
  return [
    { id: 1, name: 'PAC — Correios', price: 34.9, days: 10 },
    { id: 2, name: 'SEDEX — Correios', price: 54.9, days: 5 },
  ]
}

export async function calculateShipping(cep: string): Promise<ShippingOption[]> {
  return fetchMelhorEnvio(cep)
}

// For purchase flow — only returns real API data, no fallback
export async function getRealShippingOptions(cep: string, fromCep?: string): Promise<ShippingOption[]> {
  const token = process.env.MELHOR_ENVIO_TOKEN
  console.log('[shipping] getRealShippingOptions token present:', !!token)
  if (!token) return []

  const originCep = formatCep(fromCep || process.env.MELHOR_ENVIO_FROM_CEP || '06110-000')

  try {
    const url = `${MELHOR_ENVIO_URL}/me/shipment/calculate`
    const body = {
      from: { postal_code: originCep },
      to: { postal_code: cep.replace(/\D/g, '') },
      products: [{ id: '1', width: 15, height: 10, length: 20, weight: 0.3, quantity: 1 }],
      options: { receipt: false, own_hand: false },
    }
    console.log('[shipping] calculate request:', JSON.stringify({ url, from: originCep, to: cep }))
    const res = await fetch(url, {
      method: 'POST',
      headers: meHeaders(token),
      body: JSON.stringify(body),
    })
    const text = await res.text()
    console.log('[shipping] calculate response:', res.status, text.slice(0, 300))
    if (!res.ok) return []
    const data = JSON.parse(text)
    const result = data
      .filter((item: any) => !item.error && Number(item.price) > 0)
      .map((item: any) => ({ id: Number(item.id), name: item.name, price: Number(item.price), days: item.delivery_time || 7 }))
    console.log('[shipping] parsed services:', JSON.stringify(result))
    return result
  } catch (err) {
    console.error('[shipping] getRealShippingOptions error:', err)
    return []
  }
}

// ─── Label Purchase ───
// fromAddress: endereço de origem da loja (do BD); se omitido, usa env var de fallback
export async function purchaseLabel(
  cep: string,
  serviceId: string,
  toName: string,
  toAddress: string,
  toCity: string,
  fromAddress?: StoreAddressData
): Promise<{ tracking: string; price: number } | null> {
  const token = process.env.MELHOR_ENVIO_TOKEN
  if (!token) {
    console.warn('[shipping] MELHOR_ENVIO_TOKEN not set — cannot purchase label')
    return null
  }

  const originName = fromAddress?.name || 'Impressao 3D'
  const originStreet = fromAddress ? `${fromAddress.street}, ${fromAddress.number}` : 'Rua Exemplo, 123'
  const originCity = fromAddress?.city || 'Osasco'
  const originCep = fromAddress ? formatCep(fromAddress.cep) : formatCep(process.env.MELHOR_ENVIO_FROM_CEP || '06110-000')

  try {
    // Step 1: Add to cart
    const body = {
      from: { name: originName, address: originStreet, city: originCity, postal_code: originCep },
      to: { name: toName, address: toAddress, city: toCity, postal_code: formatCep(cep) },
      service: Number(serviceId),
      products: [{ name: 'Produto 3D', quantity: 1, weight: 0.3, width: 15, height: 10, length: 20 }],
      options: { receipt: false, own_hand: false, insurance_value: 0 },
    }

    const cartRes = await fetch(`${MELHOR_ENVIO_URL}/me/cart`, {
      method: 'POST',
      headers: meHeaders(token),
      body: JSON.stringify(body),
    })
    if (!cartRes.ok) { console.error('[shipping] Cart error:', await cartRes.text()); return null }
    const cart = await cartRes.json()
    const cartId = cart.id
    if (!cartId) return null

    // Step 2: Checkout
    const checkoutRes = await fetch(`${MELHOR_ENVIO_URL}/me/shipment/checkout`, {
      method: 'POST',
      headers: meHeaders(token),
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
      headers: meHeaders(token),
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
