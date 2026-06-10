// ─── M03: Customer Profile ───
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { User, Mail, Phone } from 'lucide-react'

export default async function ContaPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/auth/entrar')

  const user = await prisma.user.findUnique({ where: { id: session.user.id } })

  return (
    <div className="container mx-auto max-w-2xl px-4 py-12">
      <h1 className="font-heading text-3xl font-bold">Minha Conta</h1>
      <div className="mt-8 rounded-2xl border bg-card p-8" data-testid="profile-section">
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <User className="h-5 w-5 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Nome</p>
              <p className="font-semibold" data-testid="profile-name">{user?.name || '—'}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Mail className="h-5 w-5 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">E-mail</p>
              <p className="font-semibold" data-testid="profile-email">{user?.email || '—'}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Phone className="h-5 w-5 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Telefone</p>
              <p className="font-semibold">{user?.phone || '—'}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <a href="/conta/pedidos" className="rounded-xl border p-6 transition-all hover:border-primary/50 hover:shadow-md">
          <h3 className="font-semibold">Meus Pedidos</h3>
          <p className="mt-1 text-sm text-muted-foreground">Histórico de compras</p>
        </a>
        <a href="/conta/enderecos" className="rounded-xl border p-6 transition-all hover:border-primary/50 hover:shadow-md">
          <h3 className="font-semibold">Endereços</h3>
          <p className="mt-1 text-sm text-muted-foreground">Gerenciar endereços de entrega</p>
        </a>
      </div>
    </div>
  )
}
