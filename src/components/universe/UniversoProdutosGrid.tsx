// Server Component — grid of products filtered by universe
import Link from 'next/link'

interface Product {
  id: string
  name: string
  basePrice: number
  images: string[]
  slug: string
}

interface Props {
  products: Product[]
  universeSlug: string
}

export function UniversoProdutosGrid({ products, universeSlug: _ }: Props) {
  if (products.length === 0) {
    return (
      <div data-testid="universo-empty-state" className="text-center py-16">
        <p className="text-xl text-gray-500">Nenhum produto disponivel neste universo ainda.</p>
        <Link href="/produtos" className="mt-4 inline-block text-blue-600 hover:underline">
          Ver todos os produtos
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((p) => (
          <div key={p.id} className="bg-white rounded-lg shadow overflow-hidden">
            {p.images[0] && (
              <img src={p.images[0]} alt={p.name} className="w-full h-48 object-cover" />
            )}
            <div className="p-4">
              <h3 className="font-semibold mb-2">{p.name}</h3>
              <p className="font-bold mb-4">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(p.basePrice)}
              </p>
              <Link
                href={'/produtos/' + p.slug}
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
}
