// Server Component — featured products per universe
import Link from 'next/link'
import { UNIVERSE_CONFIG } from '@/config/universes'

interface Product {
  id: string
  name: string
  basePrice: number
  images: string[]
  slug: string
}

interface UniverseProducts {
  universeSlug: string
  products: Product[]
}

interface Props {
  universeProducts: UniverseProducts[]
}

export function DestaquesSection({ universeProducts }: Props) {
  const hasAny = universeProducts.some((u) => u.products.length > 0)
  if (!hasAny) return null

  return (
    <section data-testid="destaques-section" className="py-16 bg-gray-50">
      <h2 className="text-2xl font-bold text-center mb-12">Destaques por universo</h2>
      {universeProducts.map(({ universeSlug, products }) => {
        if (products.length === 0) return null
        const config = UNIVERSE_CONFIG[universeSlug]
        return (
          <div key={universeSlug} data-testid={'destaques-' + universeSlug} className="mb-12">
            <h3 className="text-xl font-semibold px-4 mb-6">
              {config ? config.name : universeSlug}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-4 max-w-6xl mx-auto">
              {products.slice(0, 3).map((p) => (
                <div key={p.id} data-testid={'produto-card-' + p.id} className="bg-white rounded-lg shadow overflow-hidden">
                  {p.images[0] && (
                    <img src={p.images[0]} alt={p.name} className="w-full h-48 object-cover" />
                  )}
                  <div className="p-4">
                    <h4 className="font-semibold mb-2">{p.name}</h4>
                    <p data-testid={'produto-preco-' + p.id} className="text-lg font-bold mb-4">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(p.basePrice)}
                    </p>
                    <Link
                      href={'/produtos/' + p.slug}
                      data-testid={'btn-personalizar-' + p.id}
                      className="block text-center bg-black text-white py-2 px-4 rounded hover:bg-gray-800 transition-colors"
                    >
                      Personalizar
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </section>
  )
}
