// ─── M02: Dynamic Collection Page ───
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import { ProductCard } from '@/components/shop/product-card'
import { Metadata } from 'next'

const COLLECTION_NAMES: Record<string, string> = {
  gamer: 'Gamer Energy',
  anime: 'Anime Pop',
  home: 'Casa & Utilidades',
  gifts: 'Presentes Personalizados',
  auto: 'Auto Vintage',
}

const COLLECTION_BANNERS: Record<string, string> = {
  gamer: 'from-purple-900/40 via-blue-900/40 to-cyan-900/40',
  anime: 'from-pink-900/40 via-purple-900/40 to-indigo-900/40',
  home: 'from-emerald-900/40 via-teal-900/40 to-cyan-900/40',
  gifts: 'from-amber-900/40 via-orange-900/40 to-rose-900/40',
  auto: 'from-slate-900/40 via-zinc-900/40 to-stone-900/40',
}

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const name = COLLECTION_NAMES[slug]
  if (!name) return { title: 'Coleção não encontrada' }
  return { title: `${name} — Impressão 3D` }
}

export default async function ColecaoPage({ params }: Props) {
  const { slug } = await params
  const name = COLLECTION_NAMES[slug]
  if (!name) notFound()

  // Find products by collection slug
  const products = await prisma.product.findMany({
    where: { collectionId: slug, status: 'published' },
    include: { category: true },
    orderBy: { isFeatured: 'desc' },
  })

  const bannerGradient = COLLECTION_BANNERS[slug] || 'from-primary/20 to-primary/5'

  return (
    <div>
      {/* Banner */}
      <div
        className={`bg-gradient-to-r ${bannerGradient} px-4 py-20 text-center`}
        data-testid="collection-banner"
      >
        <h1 className="font-heading text-4xl font-bold text-white md:text-5xl">{name}</h1>
        <p className="mt-3 text-lg text-white/70">
          {products.length} produto{products.length !== 1 ? 's' : ''} nesta coleção
        </p>
      </div>

      <div className="container mx-auto px-4 py-12" data-testid="collection-header">
        {products.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div
            className="flex flex-col items-center justify-center py-20 text-center"
            data-testid="empty-collection"
          >
            <div className="mb-4 text-6xl text-muted-foreground/20">—</div>
            <h3 className="text-lg font-semibold">Em breve</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Produtos chegando nesta coleção.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
