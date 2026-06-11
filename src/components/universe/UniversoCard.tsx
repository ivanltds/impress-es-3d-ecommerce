'use client'
import Link from 'next/link'

interface Props {
  slug: string
  name: string
  tagline: string
  imageUrl: string
  comingSoon: boolean
  isPreferred?: boolean
  accentColor?: string
}

export function UniversoCard({ slug, name, tagline, imageUrl, comingSoon, isPreferred }: Props) {
  const inner = (
    <div
      data-testid={'universo-card-' + slug}
      style={{ border: isPreferred ? '2px solid currentColor' : undefined }}
      className="relative rounded-lg overflow-hidden cursor-pointer"
    >
      <img src={imageUrl} alt={name} className="w-full h-48 object-cover" />
      <div className="p-4">
        <h3 className="font-bold text-lg">{name}</h3>
        <p className="text-sm opacity-80">{tagline}</p>
      </div>
      {comingSoon && (
        <span
          data-testid="universo-badge-coming-soon"
          className="absolute top-2 right-2 bg-gray-800 text-white text-xs px-2 py-1 rounded"
        >
          Em breve
        </span>
      )}
    </div>
  )

  if (comingSoon) return inner

  return <Link href={'/universo/' + slug}>{inner}</Link>
}
