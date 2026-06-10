// ─── M04: Melhor Envio Label Purchase ───
const MELHOR_ENVIO_URL = 'https://melhorenvio.com.br/api/v2'
const FROM_CEP = '06110000' // Osasco/SP

function getToken(): string | null {
  return process.env.MELHOR_ENVIO_TOKEN || null
}

interface ShippingProduct {
  name: string
  quantity: number
  weight: number
  width: number
  height: number
  length: number
}

export interface ShippingLabel {
  id: string
  tracking: string
  carrier: string
  price: number
  status: string
  url: string
}

// Step 1: Add to cart
async function addToCart(
  serviceId: number,
  toCep: string,
  products: ShippingProduct[]
): Promise<string | null> {
  const token = getToken()
  if (!token) return null

  const res = await fetch(`${MELHOR_ENVIO_URL}/me/cart`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      from: { postal_code: FROM_CEP },
      to: { postal_code: toCep.replace(/\D/g, '') },
      service: serviceId,
      products: products.map((p) => ({
        name: p.name,
        quantity: p.quantity,
        weight: p.weight,
        width: p.width,
        height: p.height,
        length: p.length,
      })),
      options: { receipt: false, own_hand: false, insurance_value: 0 },
    }),
  })

  if (!res.ok) {
    console.error('[shipping] Cart error:', await res.text())
    return null
  }
  const data = await res.json()
  return data.id
}

// Step 2: Checkout
async function checkoutCart(cartId: string): Promise<{ orderId: string } | null> {
  const token = getToken()
  if (!token) return null

  const res = await fetch(`${MELHOR_ENVIO_URL}/me/shipment/checkout`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ orders: [cartId] }),
  })

  if (!res.ok) {
    console.error('[shipping] Checkout error:', await res.text())
    return null
  }
  return res.json()
}

// Step 3: Generate label
async function generateLabel(orderId: string): Promise<ShippingLabel | null> {
  const token = getToken()
  if (!token) return null

  const res = await fetch(`${MELHOR_ENVIO_URL}/me/shipment/generate`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ orders: [orderId] }),
  })

  if (!res.ok) {
    console.error('[shipping] Generate error:', await res.text())
    return null
  }
  const data = await res.json()

  if (data && Array.isArray(data) && data.length > 0) {
    const label = data[0]
    return {
      id: label.id,
      tracking: label.tracking || '',
      carrier: label.service?.name || 'Correios',
      price: label.price || 0,
      status: label.status || '',
      url: label.url || '',
    }
  }
  return null
}

// Public API: purchase a shipping label
export async function purchaseLabel(
  toCep: string,
  serviceId: number,
  products: ShippingProduct[]
): Promise<ShippingLabel | null> {
  const token = getToken()
  if (!token) {
    console.warn('[shipping] MELHOR_ENVIO_TOKEN not set — skipping label purchase')
    return null
  }

  try {
    // Step 1: Add to cart
    const cartId = await addToCart(serviceId, toCep, products)
    if (!cartId) return null

    // Step 2: Checkout
    const checkout = await checkoutCart(cartId)
    if (!checkout) return null

    // Step 3: Generate label
    const label = await generateLabel(checkout.orderId)
    return label
  } catch (err) {
    console.error('[shipping] Label purchase failed:', err)
    return null
  }
}

// Calculate available shipping services
export async function getShippingServices(toCep: string, products: ShippingProduct[]) {
  const token = getToken()
  if (!token) return []

  try {
    const res = await fetch(`${MELHOR_ENVIO_URL}/me/shipment/calculate`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        from: { postal_code: FROM_CEP },
        to: { postal_code: toCep.replace(/\D/g, '') },
        products,
      }),
    })

    if (!res.ok) return []
    const data = await res.json()

    return data
      .filter((item: { error?: string; price?: number }) => !item.error && item.price)
      .map((item: { id: number; name: string; price: number; delivery_time: number }) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        days: item.delivery_time,
      }))
  } catch {
    return []
  }
}
