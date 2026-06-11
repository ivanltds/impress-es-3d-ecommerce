import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'

async function getOrCreate() {
  return prisma.storeSettings.upsert({
    where: { id: 'singleton' },
    update: {},
    create: { id: 'singleton' },
  })
}

export async function GET() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const settings = await getOrCreate()
  return NextResponse.json(settings)
}

export async function PATCH(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { whatsappPhone } = await req.json()
  const settings = await prisma.storeSettings.upsert({
    where: { id: 'singleton' },
    update: { whatsappPhone: whatsappPhone ?? '' },
    create: { id: 'singleton', whatsappPhone: whatsappPhone ?? '' },
  })
  return NextResponse.json(settings)
}
