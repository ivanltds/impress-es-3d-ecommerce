import type { Metadata } from 'next'

export const metadata: Metadata = {
  robots: 'noindex',
}

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Universo nao encontrado</h1>
        <p className="text-gray-600 mb-8">Este universo nao existe ou ainda nao esta disponivel.</p>
        <a href="/" className="text-blue-600 hover:underline">Voltar para a loja</a>
      </div>
    </div>
  )
}
