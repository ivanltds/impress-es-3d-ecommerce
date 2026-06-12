'use client'
import { useState } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import { sortUniversesByPreference, getUniverseTagline, getUniverseBullets } from '@/lib/universe-utils'
import { UNIVERSE_CONFIG } from '@/config/universes'

interface UniverseData {
  slug: string
  name: string
  comingSoon: boolean
  sortOrder: number
  publishedProductCount?: number
  cardImageUrl?: string | null
  heroImageUrl?: string | null
  tagline?: string | null
  bullets?: string[]
}

interface Props {
  universes: UniverseData[]
  preferredSlug: string | null
}

const UNIVERSE_DETAILS: Record<string, { bullets: string[]; accent: string; bgGradient: string }> = {
  gaming: {
    bullets: ['Miniaturas e estatuetas de personagens favoritos', 'Suportes e organizadores para setup gamer', 'Porta-controles, headset stands e muito mais'],
    accent: '#4ade80',
    bgGradient: 'linear-gradient(135deg, #0a1a0a 0%, #0d0d0d 100%)',
  },
  'anime-nerd': {
    bullets: ['Figures e bustos de animes e series cult', 'Props e aderecos para cosplay', 'Decoracao geek e objetos colecionaveis'],
    accent: '#c084fc',
    bgGradient: 'linear-gradient(135deg, #1a0028 0%, #0d0d0d 100%)',
  },
  'casa-decor': {
    bullets: ['Vasos, porta-retratos e objetos decorativos', 'Itens personalizados com nome ou data especial', 'Design exclusivo que combina com qualquer ambiente'],
    accent: '#fbbf24',
    bgGradient: 'linear-gradient(135deg, #1a1408 0%, #0d0d0d 100%)',
  },
  presentes: {
    bullets: ['Presentes unicos para datas inesqueciveis', 'Personalizacao com nome, foto ou mensagem', 'Embalagem especial disponivel'],
    accent: '#f97316',
    bgGradient: 'linear-gradient(135deg, #1a0d05 0%, #0d0d0d 100%)',
  },
  auto: {
    bullets: ['Emblemas, chaveiros e porta-chaves automotivos', 'Decoracao interna personalizada', 'Em breve — cadastre-se para ser avisado'],
    accent: '#ef4444',
    bgGradient: 'linear-gradient(135deg, #1a0808 0%, #0d0d0d 100%)',
  },
}

export function UniversosSection({ universes, preferredSlug }: Props) {
  const sorted = sortUniversesByPreference(universes, preferredSlug)
  const initialSlug = sorted[0]?.slug ?? 'gaming'
  const [activeSlug, setActiveSlug] = useState<string>(initialSlug)
  const [hoveredSlug, setHoveredSlug] = useState<string | null>(null)

  const activeUniverse = sorted.find((u) => u.slug === activeSlug)
  const activeConfig = UNIVERSE_CONFIG[activeSlug]
  const details = UNIVERSE_DETAILS[activeSlug]
  const displayTagline = getUniverseTagline(activeUniverse?.tagline, activeSlug)
  const displayBullets = getUniverseBullets(activeUniverse?.bullets, activeSlug)

  return (
    <section
      id="universos-section"
      data-testid="universos-section"
      className="py-20"
      style={{ background: 'linear-gradient(180deg, #0a0a0a 0%, #0f0f1a 100%)' }}
    >
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <p className="text-sm font-semibold tracking-widest uppercase mb-3" style={{ color: '#6366f1' }}>
            Para cada estilo
          </p>
          <h2 className="text-3xl md:text-5xl font-black text-white mb-4">Escolha seu universo</h2>
          <p style={{ color: '#64748b' }}>Cada universo tem produtos, identidade visual e experiencia feitos para o seu perfil</p>
        </div>

        {/* Row de cards estilo Meshy */}
        <div className="overflow-x-auto pb-6" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          <div
            data-testid="universos-carousel-dots"
            className="flex gap-4 mx-auto"
            style={{ width: 'fit-content', minWidth: '100%', justifyContent: 'center', paddingTop: '20px' }}
          >
            {sorted.map((u) => {
              const cfg = UNIVERSE_CONFIG[u.slug]
              const det = UNIVERSE_DETAILS[u.slug]
              const isActive = u.slug === activeSlug
              const isHovered = hoveredSlug === u.slug
              const isRisen = isActive || isHovered
              const accent = det?.accent ?? '#6366f1'

              return (
                <motion.button
                  key={u.slug}
                  data-testid={'universo-card-' + u.slug}
                  onClick={() => setActiveSlug(u.slug)}
                  onMouseEnter={() => setHoveredSlug(u.slug)}
                  onMouseLeave={() => setHoveredSlug(null)}
                  className="flex-shrink-0 relative focus:outline-none select-none"
                  animate={{ scale: isActive ? 1.05 : 1 }}
                  transition={{ duration: 0.35, ease: [0.34, 1.56, 0.64, 1] }}
                  style={{ width: '160px', height: '204px', borderRadius: '20px', background: 'transparent', border: 'none', cursor: 'pointer' }}
                >
                  {/* Container do gradiente com overflow hidden isolado */}
                  <div className="absolute inset-0 overflow-hidden" style={{ borderRadius: '20px' }}>
                    <motion.div
                      className="absolute inset-0 pointer-events-none"
                      animate={{ clipPath: isRisen ? 'inset(0% 0% 0% 0% round 20px)' : 'inset(52% 0% 0% 0% round 20px)' }}
                      transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
                      style={{ background: det?.bgGradient ?? accent + '44' }}
                    />
                    {/* Label dentro do clip com overlay */}
                    <div
                      className="absolute bottom-0 inset-x-0 px-3 py-2.5 text-center"
                      style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 100%)', zIndex: 3 }}
                    >
                      <span
                        className="text-xs font-bold tracking-wide truncate block"
                        style={{ color: isRisen ? accent : 'rgba(255,255,255,0.65)' }}
                      >
                        {cfg?.name ?? u.name}
                      </span>
                    </div>
                  </div>

                  {/* Imagem vaza acima do card — sem overflow hidden aqui */}
                  <div
                    className="absolute inset-x-0 pointer-events-none"
                    style={{ top: '-20px', bottom: '44px', zIndex: 10 }}
                  >
                    {u.cardImageUrl ? (
                      <motion.img
                        src={u.cardImageUrl}
                        alt={cfg?.name ?? u.name}
                        data-testid={`card-universe-image-${u.slug}`}
                        className="w-full h-full object-contain drop-shadow-2xl"
                        animate={{ scale: isRisen ? 1.08 : 1 }}
                        transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
                      />
                    ) : (
                      <motion.span
                        className="flex items-center justify-center w-full h-full text-5xl font-black"
                        animate={{ scale: isRisen ? 1.08 : 1 }}
                        transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
                        style={{ color: accent, opacity: isRisen ? 0.6 : 0.18 }}
                      >
                        {(cfg?.name ?? u.name).slice(0, 2)}
                      </motion.span>
                    )}
                  </div>

                  {/* Badge "Em breve" */}
                  {u.comingSoon && (
                    <span
                      data-testid="universo-badge-coming-soon"
                      className="absolute top-2 right-2 text-[9px] px-1.5 py-0.5 rounded-full font-semibold"
                      style={{ background: 'rgba(255,255,255,0.14)', color: 'rgba(255,255,255,0.65)', backdropFilter: 'blur(4px)', zIndex: 20 }}
                    >
                      Em breve
                    </span>
                  )}

                  {/* Badge "Seu universo" */}
                  {u.slug === preferredSlug && isActive && (
                    <span
                      className="absolute top-2 left-2 text-[9px] px-1.5 py-0.5 rounded-full font-bold"
                      style={{ background: accent, color: '#000', zIndex: 20 }}
                    >
                      Seu universo
                    </span>
                  )}
                </motion.button>
              )
            })}
          </div>
        </div>

        {/* Painel de conteudo */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSlug}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center mt-10"
          >
            <div>
              <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: details?.accent }}>
                {activeConfig?.name}
              </p>
              <h3 className="text-3xl md:text-4xl font-black text-white mb-3">{displayTagline}</h3>
              <ul className="space-y-3 mb-8">
                {displayBullets.map((b, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span
                      className="mt-1 w-4 h-4 rounded-full flex-shrink-0 flex items-center justify-center"
                      style={{ background: details.accent + '20', border: '1px solid ' + details.accent }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: details.accent }} />
                    </span>
                    <span style={{ color: 'rgba(255,255,255,0.7)' }}>{b}</span>
                  </li>
                ))}
              </ul>
              {!activeUniverse?.comingSoon ? (
                <Link
                  href={'/universo/' + activeSlug}
                  className="inline-flex items-center gap-2 font-bold py-3 px-8 rounded-xl transition-all duration-300"
                  style={{ background: 'linear-gradient(135deg, ' + details?.accent + 'cc, ' + details?.accent + '88)', color: '#000', boxShadow: '0 0 20px ' + details?.accent + '40' }}
                >
                  Explorar {activeConfig?.name}
                  <span aria-hidden="true">&#8594;</span>
                </Link>
              ) : (
                <p className="text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>Disponivel em breve</p>
              )}
            </div>

            <div
              className="hidden md:flex items-center justify-center rounded-2xl overflow-hidden relative"
              style={{ background: details?.bgGradient, border: '1px solid ' + details?.accent + '30', minHeight: '320px' }}
            >
              {activeUniverse?.heroImageUrl ? (
                <img
                  src={activeUniverse.heroImageUrl}
                  alt={activeUniverse.name}
                  data-testid="hero-universe-image"
                  className="w-full h-full object-contain max-h-64"
                />
              ) : (
                <>
                  <div
                    className="absolute inset-0 opacity-10"
                    style={{ backgroundImage: 'linear-gradient(' + details?.accent + '40 1px, transparent 1px), linear-gradient(90deg, ' + details?.accent + '40 1px, transparent 1px)', backgroundSize: '40px 40px' }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-40 h-40 rounded-full blur-3xl" style={{ background: (details?.accent ?? '#fff') + '20' }} />
                  </div>
                  <div className="relative z-10 text-center px-8">
                    <div
                      className="text-7xl font-black opacity-5 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap"
                      style={{ color: details?.accent }}
                    >
                      {activeConfig?.name}
                    </div>
                    <div className="relative">
                      <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: details?.accent }}>Universo</p>
                      <h3 className="text-4xl font-black text-white">{activeConfig?.name}</h3>
                      <p className="mt-2 text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>{displayTagline}</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  )
}
