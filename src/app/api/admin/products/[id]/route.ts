// M04+M05: Single Product API
import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
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

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Body JSON inválido' }, { status: 400 })
  }

  const {
    name, slug, shortDescription, longDescription, basePrice,
    categoryId, collectionId, material, customizationLevel,
    estimatedHours, images, customizationSchema,
  } = body as {
    name?: string; slug?: string; shortDescription?: string; longDescription?: string
    basePrice?: number; categoryId?: string; collectionId?: string; material?: string
    customizationLevel?: string; estimatedHours?: number; images?: string[]
    customizationSchema?: unknown
  }

  let product: Awaited<ReturnType<typeof prisma.product.update>>
  try {
    product = await prisma.product.update({
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
          (Array.isArray(customizationSchema) && customizationSchema.length > 0),
        estimatedProductionTime: estimatedHours || 2,
        images: images || [],
        customizationSchema: customizationSchema ?? Prisma.DbNull,
      },
    })
  } catch (err) {
    console.error('[PATCH /api/admin/products/:id] prisma.update failed:', err)
    const msg = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: 'Falha ao atualizar produto: ' + msg }, { status: 500 })
  }

  // M05: if universes[] was sent, update the M:N relation
  if (Array.isArray(body.universes)) {
    try {
      const universeRecords = await prisma.universe.findMany({
        where: { slug: { in: body.universes as string[] } },
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
    } catch (err) {
      console.error('[PATCH /api/admin/products/:id] universe sync failed:', err)
      const msg = err instanceof Error ? err.message : String(err)
      return NextResponse.json({ error: 'Produto salvo mas universos falharam: ' + msg }, { status: 500 })
    }
  }

  return NextResponse.json(product)
}
