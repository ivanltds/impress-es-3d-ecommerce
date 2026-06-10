// ─── M03: Cart API ───
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'

interface CartItemInput {
  productId: string
  variantId?: string
  qty: number
  unitPrice: number
  customizationPayload?: string
}

// GET — read cart
export async function GET() {
  const session = await auth()
  const userId = session?.user?.id

  if (userId) {
    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: { items: true },
    })
    return NextResponse.json(cart ?? { items: [] })
  }
  // Guest: return empty (client uses localStorage)
  return NextResponse.json({ items: [] })
}

// POST — add item
export async function POST(request: NextRequest) {
  const session = await auth()
  const userId = session?.user?.id
  const body: CartItemInput = await request.json()

  if (userId) {
    let cart = await prisma.cart.findUnique({ where: { userId } })
    if (!cart) {
      cart = await prisma.cart.create({ data: { userId, sessionId: '' } })
    }
    const item = await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId: body.productId,
        variantId: body.variantId,
        qty: body.qty,
        unitPrice: body.unitPrice,
        customizationPayload: body.customizationPayload,
        lineTotal: body.qty * body.unitPrice,
      },
    })
    return NextResponse.json(item, { status: 201 })
  }
  // Guest: client handles localStorage
  return NextResponse.json({ ...body, id: `guest_${Date.now()}` }, { status: 201 })
}

// PATCH — update quantity
export async function PATCH(request: NextRequest) {
  const session = await auth()
  const userId = session?.user?.id
  const { itemId, qty } = await request.json()

  if (userId && itemId) {
    const item = await prisma.cartItem.update({
      where: { id: itemId },
      data: { qty, lineTotal: qty * (await prisma.cartItem.findUnique({ where: { id: itemId } }))!.unitPrice },
    })
    return NextResponse.json(item)
  }
  return NextResponse.json({ itemId, qty })
}

// DELETE — remove item
export async function DELETE(request: NextRequest) {
  const session = await auth()
  const userId = session?.user?.id
  const { itemId } = await request.json()

  if (userId && itemId) {
    await prisma.cartItem.delete({ where: { id: itemId } })
  }
  return NextResponse.json({ removed: true })
}
