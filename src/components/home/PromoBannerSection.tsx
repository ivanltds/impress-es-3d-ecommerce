// ─── M06: F7 — Faixa Promocional (Server Component) ───
// DA-M06-06: Server Component com no-store cache — campanhas expiradas nunca aparecem.
// RN-M06-18: campanha ativa = isActive=true AND startsAt<=now AND endsAt>=now
// RN-M06-21: sem mínimo de 3 produtos — seção não é renderizada
import Image from 'next/image'
import Link from 'next/link'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

interface ProductItem {
  id: string
  name: string
  slug: string
  basePrice: number
  images: string[]
}

async function getPromoBannerData(universeSlug: string | null): Promise<{
  type: 'campaign' | 'featured'
  title: string | null
  products: ProductItem[]
} | null> {
  const now = new Date()

  // 1. Try active campaign (RN-M06-18, RN-M06-19)
  const banner = await prisma.promoBanner.findFirst({
    where: {
      isActive: true,
      startsAt: { lte: now },
      endsAt: { gte: now },
    },
    orderBy: { startsAt: 'desc' },
    include: {
      products: {
        include: {
          product: {
            select: { id: true, name: true, slug: true, basePrice: true, images: true },
          },
        },
        orderBy: { sortOrder: 'asc' },
        take: 5,
      },
    },
  })

  if (banner && banner.products.length >= 3) {
    return {
      type: 'campaign',
      title: banner.title,
      products: banner.products.map((bp) => bp.product as ProductItem),
    }
  }

  // 2. Fallback by universe (cenário 7.2)
  const whereBase = { isFeatured: true }

  if (universeSlug) {
    const universeProducts = await prisma.product.findMany({
      where: {
        ...whereBase,
        universes: { some: { universe: { slug: universeSlug } } },
      },
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: { id: true, name: true, slug: true, basePrice: true, images: true },
    })

    if (universeProducts.length >= 3) {
      return { type: 'featured', title: null, products: universeProducts as ProductItem[] }
    }
  }

  // 3. Global fallback (cenário 7.3)
  const featured = await prisma.product.findMany({
    where: whereBase,
    take: 5,
    orderBy: { createdAt: 'desc' },
    select: { id: true, name: true, slug: true, basePrice: true, images: true },
  })

  if (featured.length < 3) return null

  return { type: 'featured', title: null, products: featured as ProductItem[] }
}

export async function PromoBannerSection() {
  const session = await auth()
  const preferredCollection =
    (session?.user as { preferredCollection?: string | null } | undefined)
      ?.preferredCollection ?? null

  const data = await getPromoBannerData(preferredCollection)

  if (!data) return null

  return (
    <section data-testid="promo-banner-section" className="bg-primary/5 border-b border-primary/10 py-10">
      <div className="container mx-auto px-4">
        {/* Campaign title (only for campaigns) */}
        {data.type === 'campaign' && data.title && (
          <div className="mb-8 text-center">
            <span className="inline-block rounded-full bg-primary/10 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-primary mb-3">
              🔥 Promoção especial
            </span>
            <h2
              data-testid="promo-banner-title"
              className="font-heading text-3xl font-extrabold tracking-tight text-foreground"
            >
              {data.title}
            </h2>
          </div>
        )}

        {/* Product cards */}
        <div className="flex justify-center gap-4 overflow-x-auto pb-2">
          {data.products.map((product, index) => (
            <div
              key={product.id}
              data-testid={`promo-banner-card-${index}`}
              className="flex w-44 shrink-0 flex-col overflow-hidden rounded-xl border bg-card shadow-sm"
            >
              {/* Image */}
              <div
                data-testid={`promo-banner-card-image-${index}`}
                className="relative h-36 w-full overflow-hidden bg-muted"
              >
                {product.images[0] ? (
                  <Image
                    src={product.images[0]}
                    alt={product.name}
                    fill
                    className="object-cover"
                    sizes="176px"
                  />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center gap-1 bg-gradient-to-br from-muted/80 to-muted-foreground/10">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-muted-foreground/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-xs text-muted-foreground/50">Sem imagem</span>
                  </div>
                )}
              </div>

              {/* Card body — flex-col para alinhar botão no fundo */}
              <div className="flex flex-1 flex-col p-3">
                {/* Name */}
                <p
                  data-testid={`promo-banner-card-name-${index}`}
                  className="line-clamp-2 flex-1 text-sm font-semibold"
                >
                  {product.name}
                </p>

                {/* Price */}
                <p
                  data-testid={`promo-banner-card-price-${index}`}
                  className="mt-1 text-sm font-bold text-primary"
                >
                  {product.basePrice.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  })}
                </p>

                {/* CTA link to PDP — mt-auto garante alinhamento mesmo com nomes de tamanhos diferentes */}
                <Link
                  data-testid={`promo-banner-card-cta-${index}`}
                  href={`/produtos/${product.slug}`}
                  className="mt-auto block rounded-lg bg-primary px-3 py-1.5 text-center text-xs font-semibold text-primary-foreground transition-all hover:scale-105"
                >
                  Ver produto
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
