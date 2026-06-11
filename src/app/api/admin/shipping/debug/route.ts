// ─── DEBUG: Melhor Envio API diagnostic ───
// Acesse: GET /api/admin/shipping/debug?cep=01310100
// Remove esse arquivo após resolver o problema
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const cep = request.nextUrl.searchParams.get('cep') || '01310100'
  const token = process.env.MELHOR_ENVIO_TOKEN
  const sandbox = process.env.MELHOR_ENVIO_SANDBOX === 'true'
  const baseUrl = sandbox
    ? 'https://sandbox.melhorenvio.com.br/api/v2'
    : 'https://melhorenvio.com.br/api/v2'

  const body = {
    from: { postal_code: (process.env.MELHOR_ENVIO_FROM_CEP || '06110-000').replace(/\D/g, '').replace(/^(\d{5})(\d{3})$/, '$1-$2') },
    to: { postal_code: cep.replace(/\D/g, '') },
    products: [{ id: '1', width: 15, height: 10, length: 20, weight: 0.3, quantity: 1 }],
    options: { receipt: false, own_hand: false },
  }

  if (!token) {
    return NextResponse.json({ ok: false, error: 'MELHOR_ENVIO_TOKEN nao configurado na Vercel' })
  }

  try {
    const res = await fetch(`${baseUrl}/me/shipment/calculate`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        'User-Agent': 'Impressao3DStore (ivanltds@gmail.com)',
      },
      body: JSON.stringify(body),
    })

    const text = await res.text()
    let parsed: unknown
    try { parsed = JSON.parse(text) } catch { parsed = text }

    return NextResponse.json({
      ok: res.ok,
      status: res.status,
      sandbox,
      baseUrl,
      tokenPrefix: token.slice(0, 12) + '...',
      fromCep: process.env.MELHOR_ENVIO_FROM_CEP || '(não configurado — usando 06110-000)',
      cep,
      raw: parsed,
    })
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) })
  }
}
