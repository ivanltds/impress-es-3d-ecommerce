// ─── M02: Product Catalog ───
import { Suspense } from 'react'
import { prisma } from '@/lib/db'
import { ProductGrid } from '@/components/shop/product-grid'
import { ProductFilters } from '@/components/shop/product-filters'
import { ProductSearch } from '@/components/shop/product-search'
import { ProductSort } from '@/components/shop/product-sort'

interface Props {
  searchParams: Promise<{
    categoria?: string
    sort?: string
    q?: string
    min?: string
    max?: string
  }>
}

export default async function ProdutosPage({ searchParams }: Props) {
  const params = await searchParams
  const { categoria, sort, q, min, max } = params

  // Build where clause
  const where: Record<string, unknown> = { status: 'published' }
  if (categoria) {
    const cat = await prisma.category.findUnique({ where: { slug: categoria } })
    if (cat) where.categoryId = cat.id
  }
  if (q) {
    where.OR = [
      { name: { contains: q, mode: 'insensitive' } },
      { shortDescription: { contains: q, mode: 'insensitive' } },
    ]
  }
  if (min || max) {
    where.basePrice = {
      ...(min ? { gte: parseFloat(min) } : {}),
      ...(max ? { lte: parseFloat(max) } : {}),
    }
  }

  // Build orderBy
  let orderBy: Record<string, string> = { isFeatured: 'desc' }
  if (sort === 'price_asc') orderBy = { basePrice: 'asc' }
  else if (sort === 'price_desc') orderBy = { basePrice: 'desc' }
  else if (sort === 'name') orderBy = { name: 'asc' }

  const products = await prisma.product.findMany({
    where,
    orderBy,
    include: { category: true },
  })

  const categories = await prisma.category.findMany({ orderBy: { name: 'asc' } })

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-10">
        <h1 className="font-heading text-3xl font-bold md:text-4xl">Produtos</h1>
        <p className="mt-2 text-muted-foreground">
          Explore nossa coleção de produtos impressos em 3D.
        </p>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Sidebar Filters */}
        <aside className="w-full shrink-0 lg:w-60">
          <ProductSearch defaultValue={q} />
          <ProductFilters
            categories={categories}
            activeCategory={categoria}
            minPrice={min}
            maxPrice={max}
          />
        </aside>

        {/* Main Content */}
        <div className="flex-1">
          <div className="mb-6 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {products.length} produto{products.length !== 1 ? 's' : ''} encontrado{products.length !== 1 ? 's' : ''}
            </p>
            <ProductSort activeSort={sort} />
          </div>

          <Suspense fallback={<ProductSkeletons />}>
            {products.length > 0 ? (
              <ProductGrid products={products} />
            ) : (
              <EmptyState />
            )}
          </Suspense>
        </div>
      </div>
    </div>
  )
}

function ProductSkeletons() {
  return (
    <div
      className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
      data-testid="product-grid"
    >
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse rounded-2xl border bg-card p-4"
          data-testid="product-skeleton"
        >
          <div className="aspect-square rounded-xl bg-muted" />
          <div className="mt-4 h-4 w-3/4 rounded bg-muted" />
          <div className="mt-2 h-5 w-1/4 rounded bg-muted" />
        </div>
      ))}
    </div>
  )
}

function EmptyState() {
  return (
    <div
      className="flex flex-col items-center justify-center py-20 text-center"
      data-testid="empty-state"
    >
      <div className="mb-4 text-6xl text-muted-foreground/30">—</div>
      <h3 className="text-lg font-semibold">Nenhum produto encontrado</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Tente ajustar os filtros ou limpar a busca.
      </p>
    </div>
  )
}
