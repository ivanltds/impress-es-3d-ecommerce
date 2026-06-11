// M04+M05: Single Product API
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const product = await prisma.product.findUnique({ where: { id } })
  if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(product)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const body = await req.json()
  const {
    name, slug, shortDescription, longDescription, basePrice,
    categoryId, collectionId, material, customizationLevel,
    estimatedHours, images, customizationSchema,
  } = body

  const product = await prisma.product.update({
    where: { id },
    data: {
      name,
      slug,
      shortDescription,
      longDescription: longDescription || '',
      basePrice,
      categoryId: categoryId || null,
      collectionId: collectionId || null,
      material: material || '',
      customizationLevel: customizationLevel || 'simple',
      isCustomizable:
        customizationLevel !== 'none' ||
        (customizationSchema && customizationSchema.length > 0),
      estimatedProductionTime: estimatedHours || 2,
      images: images || [],
      customizationSchema: customizationSchema || null,
    },
  })

  // M05: if universes[] was sent, update the M:N relation
  if (Array.isArray(body.universes)) {
    const universeRecords = await prisma.universe.findMany({
      where: { slug: { in: body.universes } },
      select: { id: true },
    })
    await prisma.productUniverse.deleteMany({ where: { productId: id } })
    if (universeRecords.length > 0) {
      await prisma.productUniverse.createMany({
        data: universeRecords.map((u: { id: string }) => ({
          productId: id,
          universeId: u.id,
        })),
      })
    }
  }

  return NextResponse.json(product)
}
