'use client'
import Link from 'next/link'
import { UNIVERSE_CONFIG } from '@/config/universes'

interface Props {
  slug: string
  name: string
  tagline: string
  imageUrl: string
  comingSoon: boolean
  isPreferred?: boolean
  accentColor?: string
}

const UNIVERSE_GRADIENTS: Record<string, { from: string; to: string; text: string }> = {
  'gaming':     { from: '#0a0a0a', to: '#0a1a0a', text: '#00ff41' },
  'anime-nerd': { from: '#1a0028', to: '#2d0040', text: '#c44dff' },
  'casa-decor': { from: '#1a1408', to: '#2c2210', text: '#d4a04a' },
  'presentes':  { from: '#1a0d05', to: '#2c1a0a', text: '#e8521a' },
  'auto':       { from: '#0d0d0d', to: '#1a0808', text: '#c0392b' },
}

export function UniversoCard({ slug, name, tagline, comingSoon, isPreferred }: Props) {
  const config = UNIVERSE_CONFIG[slug]
  const grad = UNIVERSE_GRADIENTS[slug] ?? { from: '#111', to: '#222', text: '#fff' }

  const borderStyle = isPreferred
    ? { border: '2px solid ' + grad.text, boxShadow: '0 0 20px ' + grad.text + '40' }
    : { border: '1px solid rgba(255,255,255,0.1)' }

  const inner = (
    <div
      data-testid={'universo-card-' + slug}
      className="relative rounded-2xl overflow-hidden group cursor-pointer transition-all duration-300"
      style={{
        background: 'linear-gradient(135deg, ' + grad.from + ' 0%, ' + grad.to + ' 100%)',
        minHeight: '200px',
        ...borderStyle,
      }}
    >
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: 'radial-gradient(ellipse at top, ' + grad.text + '20 0%, transparent 60%)' }}
      />
      <div className="relative z-10 p-6 flex flex-col h-full min-h-[200px]">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black mb-4"
          style={{ background: grad.text + '20', color: grad.text }}
        >
          {slug.slice(0, 2).toUpperCase()}
        </div>
        <h3 className="font-black text-xl mb-2" style={{ color: grad.text }}>
          {name}
        </h3>
        <p className="text-sm flex-1" style={{ color: 'rgba(255,255,255,0.6)' }}>
          {config ? config.tagline : tagline}
        </p>
        {!comingSoon && (
          <div
            className="mt-4 text-xs font-semibold flex items-center gap-1 group-hover:gap-2 transition-all"
            style={{ color: grad.text }}
          >
            Explorar <span>&#8594;</span>
          </div>
        )}
      </div>
      {comingSoon && (
        <span
          data-testid="universo-badge-coming-soon"
          className="absolute top-3 right-3 text-xs px-3 py-1 rounded-full font-bold"
          style={{
            background: 'rgba(255,255,255,0.1)',
            color: 'rgba(255,255,255,0.6)',
            border: '1px solid rgba(255,255,255,0.2)',
          }}
        >
          Em breve
        </span>
      )}
      {isPreferred && (
        <div
          className="absolute top-3 left-3 text-xs px-2 py-0.5 rounded-full font-bold"
          style={{ background: grad.text, color: '#000' }}
        >
          Seu universo
        </div>
      )}
    </div>
  )

  if (comingSoon) return inner
  return <Link href={'/universo/' + slug} className="block">{inner}</Link>
}
