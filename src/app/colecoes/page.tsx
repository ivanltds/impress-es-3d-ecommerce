// ─── Placeholder — M02 Catalog ───
import Link from 'next/link'

export default function ColecoesPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <h1 className="font-heading text-3xl font-bold">Coleções</h1>
      <p className="mt-2 text-muted-foreground">
        Em breve — catálogo completo com 5 universos temáticos.
      </p>
      <Link href="/" className="mt-6 text-sm font-medium text-primary hover:underline">
        ← Voltar para Home
      </Link>
    </div>
  )
}
