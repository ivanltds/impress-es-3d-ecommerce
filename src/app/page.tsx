// Homepage — M05 LP Redesign
// Server Component with ISR (1 hour)
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

export const revalidate = 3600

export default async function HomePage() {
  const cookieStore = await cookies()
  const universeCookie = cookieStore.get('universe_pref')?.value ?? null
  const session = await auth()
  const preferredSlug = getUniversePreference(session as any, universeCookie)

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
      return { universeSlug: slug, products: products as any[] }
    })
  )

  // Normalize universe data shape for UniversosSection
  // Fallback: se banco vazio, usar config estatica (DB recem-criado sem seed)
  // FF08: incluir campos novos (cardImageUrl, heroImageUrl, tagline, bullets)
  const universeData = universes.length > 0
    ? (universes as any[]).map((u: any) => ({
        slug: u.slug as string,
        name: (u.name || (UNIVERSE_CONFIG[u.slug] ? UNIVERSE_CONFIG[u.slug].name : u.slug)) as string,
        comingSoon: Boolean(u.comingSoon),
        sortOrder: Number(u.sortOrder ?? 0),
        publishedProductCount: 0,
        cardImageUrl: u.cardImageUrl ?? null,
        heroImageUrl: u.heroImageUrl ?? null,
        tagline: u.tagline ?? null,
        bullets: u.bullets ?? [],
      }))
    : Object.values(UNIVERSE_CONFIG).map(c => ({
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
      <HeroSection preferredSlug={preferredSlug} />
      <UniversosSection universes={universeData} preferredSlug={preferredSlug} />
      <ComoFuncionaSection />
      <DestaquesSection universeProducts={universeProducts} />
      <ProvaSocialSection testimonials={testimonials as any[]} />
      {settings && settings.whatsappPhone && (
        <WhatsAppCTA
          whatsappPhone={settings.whatsappPhone}
          context="homepage"
        />
      )}
    </main>
  )
}
