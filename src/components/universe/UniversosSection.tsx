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
    <section
      id="universos-section"
      data-testid="universos-section"
      className="py-20"
      style={{ background: 'linear-gradient(180deg, #0a0a0a 0%, #0f0f1a 100%)' }}
    >
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <p
            className="text-sm font-semibold tracking-widest uppercase mb-3"
            style={{ color: '#6366f1' }}
          >
            Para cada estilo
          </p>
          <h2 className="text-3xl md:text-5xl font-black text-white mb-4">
            Escolha seu universo
          </h2>
          <p style={{ color: '#64748b' }}>
            Cada universo tem produtos, identidade visual e experiencia feitos para o seu perfil
          </p>
        </div>
        <div
          data-testid="universos-carousel-dots"
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4"
        >
          {sorted.map((u) => {
            const config = UNIVERSE_CONFIG[u.slug]
            if (!config) return null
            return (
              <UniversoCard
                key={u.slug}
                slug={u.slug}
                name={u.name}
                tagline={config.tagline}
                imageUrl={config.cardImage}
                comingSoon={u.comingSoon}
                isPreferred={u.slug === preferredSlug}
                accentColor={config.palette.primary}
              />
            )
          })}
        </div>
      </div>
    </section>
  )
}
