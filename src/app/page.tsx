// Homepage - M05 LP Redesign + M06 PromoBanner
// Server Component with force-dynamic
import { Suspense } from 'react'
import { cookies } from 'next/headers'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { getUniversePreference } from '@/lib/universe-utils'
import { UNIVERSE_CONFIG, UNIVERSE_SLUGS } from '@/config/universes'
import { HeroSection } from '@/components/universe/HeroSection'
import { UniversosSection } from '@/components/universe/UniversosSection'
import { ComoFuncionaSection } from '@/components/universe/ComoFuncionaSection'
import { DestaquesSection } from '@/components/universe/DestaquesSection'
import { ProvaSocialSection } from '@/components/universe/ProvaSocialSection'
import { WhatsAppCTA } from '@/components/universe/WhatsAppCTA'
import { PromoBannerSection } from '@/components/home/PromoBannerSection'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const cookieStore = await cookies()
  const universeCookie = cookieStore.get('universe_pref')?.value ?? null
  const session = await auth()
  const preferredSlug = getUniversePreference(session as never, universeCookie)

  const [universes, settings, testimonials] = await Promise.all([
    prisma.universe.findMany({ orderBy: { sortOrder: 'asc' } }),
    prisma.storeSettings.findFirst(),
    prisma.testimonial.findMany({
      where: { isPublished: true },
      orderBy: { createdAt: 'desc' },
      take: 6,
    }),
  ])

  // Featured products per universe (max 3 each)
  const universeProducts = await Promise.all(
    UNIVERSE_SLUGS.map(async (slug) => {
      const products = await prisma.product.findMany({
        where: {
          status: 'active',
          isFeatured: true,
          universes: { some: { universe: { slug } } },
        },
        take: 3,
        orderBy: { createdAt: 'desc' },
      })
      return { universeSlug: slug, products: products as never[] }
    })
  )

  // Normalize universe data shape for UniversosSection
  const universeData = universes.length > 0
    ? (universes as never[]).map((u: never) => ({
        slug: (u as { slug: string }).slug,
        name: ((u as { name?: string; slug: string }).name
          || (UNIVERSE_CONFIG[(u as { slug: string }).slug]
            ? UNIVERSE_CONFIG[(u as { slug: string }).slug].name
            : (u as { slug: string }).slug)) as string,
        comingSoon: Boolean((u as { comingSoon?: boolean }).comingSoon),
        sortOrder: Number((u as { sortOrder?: number }).sortOrder ?? 0),
        publishedProductCount: 0,
        cardImageUrl: (u as { cardImageUrl?: string | null }).cardImageUrl ?? null,
        heroImageUrl: (u as { heroImageUrl?: string | null }).heroImageUrl ?? null,
        tagline: (u as { tagline?: string | null }).tagline ?? null,
        bullets: (u as { bullets?: string[] }).bullets ?? [],
      }))
    : Object.values(UNIVERSE_CONFIG).map((c) => ({
        slug: c.slug,
        name: c.name,
        comingSoon: false,
        sortOrder: c.sortOrder,
        publishedProductCount: 0,
        cardImageUrl: null,
        heroImageUrl: null,
        tagline: null,
        bullets: [] as string[],
      }))

  return (
    <main>
      {/* F7: Faixa promocional personalizada — acima do hero para máxima visibilidade */}
      <Suspense fallback={<div className="h-24 animate-pulse bg-muted" />}>
        <PromoBannerSection />
      </Suspense>
      <HeroSection preferredSlug={preferredSlug} />
      <UniversosSection universes={universeData} preferredSlug={preferredSlug} />
      <ComoFuncionaSection />
      <DestaquesSection universeProducts={universeProducts} />
      <ProvaSocialSection testimonials={testimonials as never[]} />
      {settings && settings.whatsappPhone && (
        <WhatsAppCTA
          whatsappPhone={settings.whatsappPhone}
          context="homepage"
        />
      )}
    </main>
  )
}
