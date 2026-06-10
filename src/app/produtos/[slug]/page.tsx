// ─── M02: Product Detail Page ───
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import { ProductGallery } from '@/components/shop/product-gallery'
import { ProductInfo } from '@/components/shop/product-info'
import { ProductCard } from '@/components/shop/product-card'
import type { Metadata } from 'next'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const product = await prisma.product.findUnique({ where: { slug } })
  if (!product) return { title: 'Produto não encontrado' }
  return {
    title: product.name,
    description: product.shortDescription,
    openGraph: {
      title: product.name,
      description: product.shortDescription,
      type: 'website',
    },
  }
}

export default async function ProdutoPage({ params }: Props) {
  const { slug } = await params
  const product = await prisma.product.findUnique({
    where: { slug },
    include: { category: true },
  })

  if (!product) notFound()

  const related = await prisma.product.findMany({
    where: {
      categoryId: product.categoryId,
      id: { not: product.id },
    },
    take: 4,
    include: { category: true },
  })

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Breadcrumb */}
      <nav className="mb-8 text-sm text-muted-foreground">
        <a href="/" className="hover:text-primary">Home</a>
        <span className="mx-2">/</span>
        {product.category && (
          <>
            <a href={`/colecoes/${product.category.slug}`} className="hover:text-primary">
              {product.category.name}
            </a>
            <span className="mx-2">/</span>
          </>
        )}
        <span className="text-foreground">{product.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        <ProductGallery images={product.images} name={product.name} />
        <ProductInfo product={product} />
      </div>

      {/* Related Products */}
      {related.length > 0 && (
        <section className="mt-20">
          <h2 className="font-heading text-2xl font-bold">Produtos Relacionados</h2>
          <div className="mt-6 grid grid-cols-2 gap-6 md:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
