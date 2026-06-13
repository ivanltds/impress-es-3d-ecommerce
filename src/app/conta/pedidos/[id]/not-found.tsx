// ─── M06: F3 — 404 para detalhe de pedido inexistente ou de outro usuário ───
// Cenários: 3.8, 3.10
import Link from 'next/link'

export default function OrderNotFound() {
  return (
    <div className="container mx-auto max-w-2xl px-4 py-24 text-center">
      <h1 className="font-heading text-3xl font-bold">Pedido não encontrado</h1>
      <p className="mt-4 text-muted-foreground">
        Este pedido não existe ou não pertence à sua conta.
      </p>
      <Link
        href="/conta/pedidos"
        data-testid="back-to-orders"
        className="mt-8 inline-block rounded-full bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground transition-all hover:scale-105"
      >
        Voltar aos pedidos
      </Link>
    </div>
  )
}
