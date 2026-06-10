// ─── M04: Purchase Shipping Label ───
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { getRealShippingOptions, purchaseLabel, StoreAddressData, CustomerData, ToAddressData } from '@/lib/shipping'

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

    // Fetch order + user for customer/address data
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: {
          select: { name: true, phone: true, email: true, document: true },
        },
      },
    })
    if (!order) return NextResponse.json({ error: 'Pedido não encontrado' }, { status: 404 })

    // Build customer data (destinatário)
    const customer: CustomerData = {
      name:     order.user?.name     || 'Cliente',
      phone:    order.user?.phone    || '',
      email:    order.user?.email    || '',
      document: order.user?.document || '',
    }

    // Build destination address from structured Order fields
    const toDetails: ToAddressData = {
      address:  order.shippingStreet   || 'Endereco',
      number:   order.shippingNumber   || 's/n',
      district: order.shippingDistrict || 'Centro',
      city:     order.shippingCity     || 'Cidade',
      state:    order.shippingState    || 'SP',
    }

    // Fetch origin store address from DB
    let fromAddress: StoreAddressData | undefined
    if (addressId) {
      const addr = await prisma.storeAddress.findUnique({ where: { id: addressId } })
      if (addr) {
        fromAddress = {
          name:         addr.name,
          phone:        addr.phone,
          email:        addr.email,
          document:     addr.document,
          street:       addr.street,
          number:       addr.number,
          neighborhood: addr.neighborhood || '',
          city:         addr.city,
          state:        addr.state,
          cep:          addr.cep,
        }
      }
    }

    console.log('[purchase POST] payload:', {
      cep, serviceId,
      customer: customer.name,
      origin: fromAddress?.name,
      toState: toDetails.state,
    })

    const result = await purchaseLabel(cep, serviceId, customer, toDetails, fromAddress)

    if (!result.success) {
      console.error('[purchase POST] label failed:', result.error)
      return NextResponse.json({ success: false, error: result.error }, { status: 422 })
    }

    console.log('[purchase POST] label OK:', JSON.stringify(result))

    // Save trackingCode in its own field; preserve existing notes
    await prisma.order.update({
      where: { id: orderId },
      data: {
        fulfillmentStatus: 'awaiting_pickup',
        trackingCode: result.tracking,
      },
    })
    await prisma.orderItem.updateMany({ where: { orderId }, data: { productionStatus: 'shipped' } })

    return NextResponse.json({ success: true, tracking: result.tracking, price: result.price })
  } catch (err: any) {
    console.error('[purchase POST] unhandled error:', err)
    return NextResponse.json({ success: false, error: err.message || 'Erro interno' }, { status: 500 })
  }
}
