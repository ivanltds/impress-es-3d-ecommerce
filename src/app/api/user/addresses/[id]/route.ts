// M06: F5 - PATCH/DELETE /api/user/addresses/[id]
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { setDefaultAddress } from '@/lib/address-utils'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const body = await request.json()

  const existing = await prisma.address.findUnique({ where: { id } })
  if (!existing || existing.userId !== session.user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  if (body.isDefault === true) {
    await setDefaultAddress(session.user.id, id)
    const updated = await prisma.address.findUnique({ where: { id } })
    return NextResponse.json(updated)
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { isDefault: _isDefault, userId: _userId, ...safeFields } = body
  const updated = await prisma.address.update({
    where: { id },
    data: safeFields,
  })

  return NextResponse.json(updated)
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  const existing = await prisma.address.findUnique({ where: { id } })
  if (!existing || existing.userId !== session.user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  await prisma.address.delete({ where: { id } })

  return NextResponse.json({ ok: true })
}
