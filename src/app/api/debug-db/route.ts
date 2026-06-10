import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1 AS connected`
    return NextResponse.json({ db: 'connected', url: process.env.DATABASE_URL ? 'SET' : 'NOT SET' })
  } catch (err) {
    return NextResponse.json({
      db: 'error',
      url: process.env.DATABASE_URL ? 'SET' : 'NOT SET',
      error: err instanceof Error ? err.message : String(err),
    })
  }
}
