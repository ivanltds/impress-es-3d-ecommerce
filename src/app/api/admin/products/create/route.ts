// ─── M04: Create Product API ───
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { name, slug, shortDescription, longDescription, basePrice, categoryId, collectionId, material, customizationLevel, estimatedHours, images } = body

  if (!name || !slug || !shortDescription || !basePrice) {
    return NextResponse.json({ error: 'Campos obrigatórios: nome, slug, descrição curta, preço' }, { status: 400 })
  }

  const product = await prisma.product.create({
    data: {
      name,
      slug,
      shortDescription,
      longDescription: longDescription || '',
      basePrice,
      categoryId: categoryId || null,
      collectionId: collectionId || null,
      material: material || 'PLA Premium',
      customizationLevel: customizationLevel || 'simple',
      isCustomizable: customizationLevel !== 'none',
      estimatedProductionTime: estimatedHours || 2,
      images: images || [],
      productType: 'simple',
    },
  })

  return NextResponse.json(product, { status: 201 })
}
