// ─── M04: Admin Dashboard ───
import { prisma } from '@/lib/db'
import { BarChart3, DollarSign, ShoppingBag, TrendingUp } from 'lucide-react'

export default async function AdminDashboard() {
  const [totalOrders, paidOrders, products] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({ where: { paymentStatus: 'paid' } }),
    prisma.product.count(),
  ])

  const revenue = await prisma.order.aggregate({
    where: { paymentStatus: 'paid' },
    _sum: { total: true },
  })

  const ticketAvg = paidOrders > 0 ? (revenue._sum.total || 0) / paidOrders : 0

  const metrics = [
    { label: 'Pedidos Totais', value: totalOrders, icon: ShoppingBag },
    { label: 'Receita', value: `R$ ${(revenue._sum.total || 0).toFixed(0)}`, icon: DollarSign },
    { label: 'Ticket Médio', value: `R$ ${ticketAvg.toFixed(0)}`, icon: TrendingUp },
    { label: 'Produtos', value: products, icon: BarChart3 },
  ]

  return (
    <div className="p-6" data-testid="analytics-dashboard">
      <h1 className="font-heading text-2xl font-bold">Dashboard</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((m) => (
          <div key={m.label} className="rounded-xl border bg-card p-6">
            <div className="flex items-center gap-3">
              <m.icon className="h-5 w-5 text-primary" />
              <span className="text-sm text-muted-foreground">{m.label}</span>
            </div>
            <p className="mt-3 text-2xl font-bold">{m.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
