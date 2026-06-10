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
  phone: string
  email: string
  document: string  // CPF ou CNPJ sem pontuação
  street: string
  number: string
  neighborhood: string
  city: string
  state: string     // UF ex: "SP"
  cep: string       // formatado: "06110-000"
}

export interface CustomerData {
  name: string
  phone?: string
  email?: string
  document?: string
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

// For purchase flow — throws on API error so caller can surface the real message
export async function getRealShippingOptions(cep: string, fromCep?: string): Promise<ShippingOption[]> {
  const token = process.env.MELHOR_ENVIO_TOKEN
  console.log('[shipping] getRealShippingOptions token present:', !!token)
  if (!token) throw new Error('MELHOR_ENVIO_TOKEN não configurado na Vercel')

  const originCep = formatCep(fromCep || process.env.MELHOR_ENVIO_FROM_CEP || '06110-000')

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
  console.log('[shipping] calculate response:', res.status, text.slice(0, 500))

  if (!res.ok) {
    // Extract readable error from Melhor Envio response
    let apiMsg = `HTTP ${res.status}`
    try {
      const errJson = JSON.parse(text)
      const firstError = errJson.errors
        ? Object.values(errJson.errors as Record<string, string[]>).flat()[0]
        : errJson.message
      if (firstError) apiMsg = firstError
    } catch {}
    throw new Error(`Melhor Envio: ${apiMsg}`)
  }

  const data = JSON.parse(text)
  // Log items with errors for debugging
  const errItems = data.filter((i: any) => i.error)
  if (errItems.length) console.log('[shipping] items with error:', JSON.stringify(errItems.map((i: any) => ({ id: i.id, name: i.name, error: i.error }))))

  const result = data
    .filter((item: any) => !item.error && Number(item.price) > 0)
    .map((item: any) => ({ id: Number(item.id), name: item.name, price: Number(item.price), days: item.delivery_time || 7 }))
  console.log('[shipping] parsed services:', JSON.stringify(result))

  if (result.length === 0 && data.length > 0) {
    // All services filtered out — show why
    const reasons = data.map((i: any) => `${i.name}: ${i.error || 'preço zero'}`).join('; ')
    throw new Error(`Nenhum serviço disponível: ${reasons}`)
  }

  return result
}

// ─── Label Purchase ───
export type LabelResult =
  | { success: true; tracking: string; price: number }
  | { success: false; error: string }

export interface ToAddressData {
  address: string   // rua
  number:  string
  district: string  // bairro
  city:     string
  state:    string  // UF ex: "SP"
}

// fromAddress: endereço de origem da loja (do BD)
// customer: dados do destinatário (nome, phone, email, document)
// toDetails: endereço completo do destinatário
export async function purchaseLabel(
  cep: string,
  serviceId: string,
  customer: CustomerData,
  toDetails: ToAddressData,
  fromAddress?: StoreAddressData
): Promise<LabelResult> {
  const token = process.env.MELHOR_ENVIO_TOKEN
  if (!token) {
    return { success: false, error: 'MELHOR_ENVIO_TOKEN não configurado na Vercel' }
  }

  // ─── FROM (origem/loja) ───
  const from = {
    name: fromAddress?.name || 'Impressao 3D',
    phone: (fromAddress?.phone || '').replace(/\D/g, '') || '11999999999',
    email: fromAddress?.email || 'loja@email.com',
    document: (fromAddress?.document || '').replace(/\D/g, '') || '00000000000',
    address: fromAddress ? fromAddress.street : 'Rua Exemplo',
    number: fromAddress?.number || 's/n',
    district: fromAddress?.neighborhood || 'Centro',
    city: fromAddress?.city || 'Osasco',
    state_abbr: fromAddress?.state || 'SP',
    country_id: 'BR',
    postal_code: fromAddress ? formatCep(fromAddress.cep) : formatCep(process.env.MELHOR_ENVIO_FROM_CEP || '06110-000'),
  }

  // ─── TO (destino/cliente) ───
  const to = {
    name: customer.name || 'Cliente',
    phone: (customer.phone || '').replace(/\D/g, '') || '11999999999',
    email: customer.email || 'cliente@email.com',
    document: (customer.document || '').replace(/\D/g, '') || '00000000000',
    address: toDetails.address || 'Endereco',
    number:   toDetails.number  || 's/n',
    district: toDetails.district || 'Centro',
    city:     toDetails.city    || 'Cidade',
    state_abbr: (toDetails.state || 'SP').toUpperCase(),
    country_id: 'BR',
    postal_code: formatCep(cep),
  }

  async function meErr(label: string, res: Response): Promise<string> {
    const txt = await res.text()
    console.error(`[shipping] ${label} HTTP ${res.status}:`, txt.slice(0, 400))
    try {
      const j = JSON.parse(txt)
      const first = j.errors ? Object.values(j.errors as Record<string, string[]>).flat()[0] : j.message
      return first ? `${label}: ${first}` : `${label}: HTTP ${res.status}`
    } catch { return `${label}: HTTP ${res.status}` }
  }

  try {
    // Step 1: Add to cart
    const body = {
      from,
      to,
      service: Number(serviceId),
      products: [{ name: 'Produto 3D', quantity: 1, unitary_value: 50, weight: 0.3, width: 15, height: 10, length: 20 }],
      options: { receipt: false, own_hand: false, insurance_value: 0 },
    }
    console.log('[shipping] cart body:', JSON.stringify({ from: body.from, to: body.to, service: body.service }))

    const cartRes = await fetch(`${MELHOR_ENVIO_URL}/me/cart`, {
      method: 'POST',
      headers: meHeaders(token),
      body: JSON.stringify(body),
    })
    if (!cartRes.ok) return { success: false, error: await meErr('Cart', cartRes) }
    const cart = await cartRes.json()
    const cartId = cart.id
    if (!cartId) return { success: false, error: `Cart: sem ID na resposta — ${JSON.stringify(cart).slice(0, 200)}` }

    // Step 2: Checkout
    const checkoutRes = await fetch(`${MELHOR_ENVIO_URL}/me/shipment/checkout`, {
      method: 'POST',
      headers: meHeaders(token),
      body: JSON.stringify({ orders: [cartId] }),
    })
    if (!checkoutRes.ok) return { success: false, error: await meErr('Checkout', checkoutRes) }
    const checkout = await checkoutRes.json()
    console.log('[shipping] checkout:', JSON.stringify(checkout).slice(0, 400))

    const meOrderId = checkout?.purchase?.orders?.[0]?.id || checkout?.orders?.[0]?.id
    if (!meOrderId) return { success: false, error: `Checkout: sem order ID — ${JSON.stringify(checkout).slice(0, 200)}` }

    // Step 3: Generate label
    const genRes = await fetch(`${MELHOR_ENVIO_URL}/me/shipment/generate`, {
      method: 'POST',
      headers: meHeaders(token),
      body: JSON.stringify({ orders: [meOrderId] }),
    })
    if (!genRes.ok) return { success: false, error: await meErr('Generate', genRes) }
    const genData = await genRes.json()
    const label = Array.isArray(genData) ? genData[0] : genData
    if (!label) return { success: false, error: 'Generate: resposta vazia' }

    return { success: true, tracking: label.tracking || '', price: label.price || 0 }
  } catch (err: any) {
    console.error('[shipping] purchaseLabel exception:', err)
    return { success: false, error: err.message || 'Erro inesperado ao comprar etiqueta' }
  }
}
