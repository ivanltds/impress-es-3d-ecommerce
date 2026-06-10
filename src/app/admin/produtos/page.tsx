// ─── M04: Admin Products List ───
import Link from 'next/link'
import { prisma } from '@/lib/db'
import { Plus, Pencil, Archive, Package } from 'lucide-react'

export default async function AdminProdutosPage() {
  const products = await prisma.product.findMany({
    include: { category: true },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="p-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold">Produtos</h1>
        <Link href="/admin/produtos/novo" className="flex items-center gap-1 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
          <Plus className="h-4 w-4" /> Novo
        </Link>
      </div>
      <div className="mt-6 overflow-x-auto rounded-xl border" data-testid="admin-products-table">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Produto</th>
              <th className="px-4 py-3 text-left font-medium">Preço</th>
              <th className="px-4 py-3 text-left font-medium">Categoria</th>
              <th className="px-4 py-3 text-left font-medium">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b hover:bg-muted/30">
                <td className="px-4 py-3 font-medium">{p.name}</td>
                <td className="px-4 py-3">R$ {p.basePrice.toFixed(2)}</td>
                <td className="px-4 py-3 text-muted-foreground">{p.category?.name || '—'}</td>
                <td className="px-4 py-3"><span className={`rounded-full px-2 py-0.5 text-xs ${p.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-muted text-muted-foreground'}`}>{p.status}</span></td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/admin/produtos/${p.id}`} className="inline-flex h-8 w-8 items-center justify-center rounded-lg hover:bg-muted"><Pencil className="h-4 w-4" /></Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
