// ─── M04: Purchase Shipping Label ───
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { getRealShippingOptions, purchaseLabel, StoreAddressData } from '@/lib/shipping'

export async function GET(request: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const cep = request.nextUrl.searchParams.get('cep')
  const addressId = request.nextUrl.searchParams.get('addressId')
  if (!cep) return NextResponse.json({ error: 'CEP required' }, { status: 400 })

  let fromCep: string | undefined
  if (addressId) {
    const addr = await prisma.storeAddress.findUnique({ where: { id: addressId } })
    if (addr) fromCep = addr.cep
  }

  try {
    const services = await getRealShippingOptions(cep, fromCep)
    return NextResponse.json(services)
  } catch (err: any) {
    console.error('[purchase GET] services error:', err.message)
    return NextResponse.json({ error: err.message }, { status: 422 })
  }
}

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { orderId, cep, serviceId, addressId } = await request.json()
    if (!orderId || !cep || !serviceId) {
      return NextResponse.json({ error: 'orderId, cep e serviceId obrigatórios' }, { status: 400 })
    }

    // Fetch order for address details
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { user: { select: { name: true } } },
    })
    if (!order) return NextResponse.json({ error: 'Pedido não encontrado' }, { status: 404 })

    // Extract destination address info
    let toName = order.user?.name || 'Cliente'
    let toAddress = 'Endereco'
    let toCity = 'Cidade'
    try {
      if (order.notes) {
        const addr = JSON.parse(order.notes)
        toAddress = [addr.street, addr.number].filter(Boolean).join(', ') || 'Endereco'
        toCity = addr.city || 'Cidade'
      }
    } catch {}

    // Fetch origin store address from DB
    let fromAddress: StoreAddressData | undefined
    if (addressId) {
      const addr = await prisma.storeAddress.findUnique({ where: { id: addressId } })
      if (addr) {
        fromAddress = {
          name: addr.name,
          street: addr.street,
          number: addr.number,
          city: addr.city,
          state: addr.state,
          cep: addr.cep,
        }
      }
    }

    console.log('[purchase POST] payload:', { cep, serviceId, toName, toAddress, toCity, origin: fromAddress?.name, originCep: fromAddress?.cep })

    // Purchase the label via Melhor Envio API
    const result = await purchaseLabel(cep, serviceId, toName, toAddress, toCity, fromAddress)

    if (!result.success) {
      console.error('[purchase POST] label failed:', result.error)
      return NextResponse.json({ success: false, error: result.error }, { status: 422 })
    }

    console.log('[purchase POST] label OK:', JSON.stringify(result))

    // Update order with tracking
    await prisma.order.update({
      where: { id: orderId },
      data: {
        fulfillmentStatus: 'awaiting_pickup',
        notes: `Etiqueta: ${result.tracking} — R$ ${result.price.toFixed(2)}`,
      },
    })
    await prisma.orderItem.updateMany({ where: { orderId }, data: { productionStatus: 'shipped' } })

    return NextResponse.json({ success: true, tracking: result.tracking, price: result.price })
  } catch (err: any) {
    console.error('[purchase POST] unhandled error:', err)
    return NextResponse.json({ success: false, error: err.message || 'Erro interno' }, { status: 500 })
  }
}
