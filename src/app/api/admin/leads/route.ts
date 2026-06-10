// ─── M04: Leads API (DB-persisted) ───
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'

export async function GET() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const leads = await prisma.lead.findMany({
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(leads)
}

export async function POST(request: NextRequest) {
  const { name, phone, email, source, interestCollection, message } = await request.json()

  const lead = await prisma.lead.create({
    data: {
      name,
      phone: phone || '',
      email: email || '',
      source: source || 'website',
      interestCollection: interestCollection || '',
      message: message || '',
    },
  })

  return NextResponse.json(lead, { status: 201 })
}

export async function PATCH(request: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id, status, notes, orderId, paymentLink } = await request.json()

  await prisma.lead.update({
    where: { id },
    data: {
      status: status || undefined,
      notes: notes || undefined,
      orderId: orderId || undefined,
      paymentLink: paymentLink || undefined,
    },
  })

  return NextResponse.json({ success: true })
}
