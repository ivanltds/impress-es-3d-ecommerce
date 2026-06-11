import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { UNIVERSE_CONFIG } from '@/config/universes'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'
import { UniverseThemeProvider } from '@/components/universe/UniverseThemeProvider'
import { UniversoProdutosGrid } from '@/components/universe/UniversoProdutosGrid'
import { UniversePreferenceSetter } from '@/components/universe/UniversePreferenceSetter'
import { WhatsAppCTA } from '@/components/universe/WhatsAppCTA'

export const revalidate = 3600

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const config = UNIVERSE_CONFIG[slug]
  if (!config) return { title: 'Nao encontrado', robots: 'noindex' }
  return {
    title: config.seoTitle,
    description: config.seoDescription,
    openGraph: { images: [{ url: config.ogImage }] },
    alternates: {
      canonical: 'https://' + (process.env.NEXT_PUBLIC_DOMAIN || 'localhost:3000') + '/universo/' + slug,
    },
  }
}

export async function generateStaticParams() {
  return Object.keys(UNIVERSE_CONFIG).map((slug) => ({ slug }))
}

export default async function UniversoPage({ params }: Props) {
  const { slug } = await params
  const config = UNIVERSE_CONFIG[slug]
  if (!config) notFound()

  const session = await auth()
  void session // auth called for future use (preference setter handles client-side)

  const [products, settings] = await Promise.all([
    prisma.product.findMany({
      where: {
        status: 'active',
        universes: { some: { universe: { slug } } },
      },
      orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
    }),
    prisma.storeSettings.findFirst(),
  ])

  return (
    <UniverseThemeProvider universeSlug={slug}>
      <div data-testid={'universo-page-' + slug}>
        <UniversePreferenceSetter slug={slug} />
        <header data-testid="universo-header" className="py-16 text-center">
          <h1 className="text-4xl font-bold mb-4">{config.name}</h1>
          <p className="text-xl opacity-80">{config.tagline}</p>
        </header>
        <div data-testid="universo-cta-personalizar" className="text-center pb-8">
          <a
            href="/produtos"
            className="inline-block bg-black text-white font-bold py-4 px-8 rounded-lg text-lg hover:bg-gray-800 transition-colors"
          >
            Personalize agora
          </a>
        </div>
        <UniversoProdutosGrid products={products as any} universeSlug={slug} />
        {settings && settings.whatsappPhone && (
          <WhatsAppCTA
            whatsappPhone={settings.whatsappPhone}
            context="universo"
            universeName={config.name}
            universeWhatsappMessage={config.whatsappMessage}
          />
        )}
      </div>
    </UniverseThemeProvider>
  )
}
