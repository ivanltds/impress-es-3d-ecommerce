import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  const settings = await prisma.storeSettings.findUnique({ where: { id: 'singleton' } })
  return NextResponse.json({
    whatsappPhone: settings?.whatsappPhone ?? '',
  })
}
