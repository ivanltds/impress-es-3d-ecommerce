// Server Component — universe grid/carousel on homepage
import { sortUniversesByPreference } from '@/lib/universe-utils'
import { UNIVERSE_CONFIG } from '@/config/universes'
import { UniversoCard } from './UniversoCard'

interface UniverseData {
  slug: string
  name: string
  comingSoon: boolean
  sortOrder: number
  publishedProductCount?: number
}

interface Props {
  universes: UniverseData[]
  preferredSlug: string | null
}

export function UniversosSection({ universes, preferredSlug }: Props) {
  const sorted = sortUniversesByPreference(universes, preferredSlug)

  return (
    <section data-testid="universos-section" className="py-12">
      <h2 className="text-2xl font-bold text-center mb-8">Escolha seu universo</h2>
      <div
        data-testid="universos-carousel-dots"
        className="flex overflow-x-auto gap-4 px-4 snap-x snap-mandatory"
      >
        {sorted.map((u) => {
          const config = UNIVERSE_CONFIG[u.slug]
          return (
            <div key={u.slug} className="snap-start shrink-0 w-64">
              <UniversoCard
                slug={u.slug}
                name={u.name}
                tagline={config ? config.tagline : ''}
                imageUrl={config ? config.cardImage : ''}
                comingSoon={u.comingSoon}
                isPreferred={u.slug === preferredSlug}
                accentColor={config ? config.palette.primary : ''}
              />
            </div>
          )
        })}
      </div>
    </section>
  )
}
