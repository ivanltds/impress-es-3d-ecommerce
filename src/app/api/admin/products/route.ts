// ─── M04: Admin Products API ───
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'

export async function GET() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const products = await prisma.product.findMany({
    orderBy: { createdAt: 'desc' },
    include: { category: { select: { id: true, name: true } } },
  })

  return NextResponse.json(products)
}
