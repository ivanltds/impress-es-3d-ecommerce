// ─── M03: Shipping API ───
import { NextRequest, NextResponse } from 'next/server'
import { calculateShipping } from '@/lib/shipping'

export async function GET(request: NextRequest) {
  const cep = request.nextUrl.searchParams.get('cep')
  if (!cep) {
    return NextResponse.json({ error: 'CEP é obrigatório' }, { status: 400 })
  }
  const options = await calculateShipping(cep)
  return NextResponse.json(options)
}
