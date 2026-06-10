// ─── M04: Admin Layout (auth-protected) ───
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import Link from 'next/link'
import { LayoutDashboard, Package, ShoppingBag, ClipboardList, BarChart3, Users, Truck } from 'lucide-react'

const ADMIN_ROLES = ['admin', 'operator']

const NAV = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/produtos', label: 'Produtos', icon: Package },
  { href: '/admin/pedidos', label: 'Pedidos', icon: ShoppingBag },
  { href: '/admin/producao', label: 'Produção', icon: ClipboardList },
  { href: '/admin/envio', label: 'Envio', icon: Truck },
  { href: '/admin/leads', label: 'Leads', icon: Users },
]

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  const role = (session?.user as { role?: string } | undefined)?.role

  if (!session?.user || !role || !ADMIN_ROLES.includes(role)) {
    redirect('/auth/entrar')
  }

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-56 shrink-0 border-r bg-muted/20 md:block">
        <div className="flex h-14 items-center border-b px-4">
          <Link href="/admin" className="font-heading text-sm font-bold">Admin</Link>
        </div>
        <nav className="p-3">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}
