'use client'

// ─── M04: Admin Products — Grid + List ───
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { LayoutGrid, List, Plus, Pencil, Package, DollarSign, Tag } from 'lucide-react'

interface Product {
  id: string
  name: string
  slug: string
  shortDescription: string
  basePrice: number
  status: string
  isCustomizable: boolean
  isFeatured: boolean
  category?: { id: string; name: string } | null
  images: string[]
}

export default function AdminProdutosPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/products')
      .then((r) => r.json())
      .then((data) => { setProducts(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return <div className="p-6">Carregando...</div>

  return (
    <div className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold">Produtos</h1>
          <p className="text-sm text-muted-foreground">{products.length} produto{products.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border">
            <button onClick={() => setView('grid')} className={`rounded-l-lg p-2 ${view === 'grid' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}><LayoutGrid className="h-5 w-5" /></button>
            <button onClick={() => setView('list')} className={`rounded-r-lg p-2 ${view === 'list' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}><List className="h-5 w-5" /></button>
          </div>
          <Link href="/admin/produtos/novo" className="flex items-center gap-1 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
            <Plus className="h-4 w-4" /> Novo
          </Link>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="mt-16 flex flex-col items-center justify-center text-center">
          <Package className="mb-4 h-16 w-16 text-muted-foreground/20" />
          <p className="text-lg font-medium">Nenhum produto cadastrado</p>
          <Link href="/admin/produtos/novo" className="mt-4 text-sm text-primary hover:underline">Criar primeiro produto</Link>
        </div>
      ) : view === 'grid' ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" data-testid="admin-products-table">
          {products.map((p) => (
            <Link key={p.id} href={`/admin/produtos/${p.id}`} className="group rounded-xl border bg-card transition-all hover:shadow-lg hover:border-primary/30 overflow-hidden">
              <div className="aspect-square bg-gradient-to-br from-primary/5 to-purple-500/5 flex items-center justify-center relative">
                {p.images && p.images.length > 0 ? (
                  <img src={p.images[0]} alt={p.name} className="absolute inset-0 h-full w-full object-cover transition-transform group-hover:scale-105" />
                ) : (
                  <Package className="h-16 w-16 text-primary/20 transition-transform group-hover:scale-110" />
                )}
                {p.isCustomizable && (
                  <span className="absolute left-3 top-3 rounded-full bg-primary/90 px-2 py-0.5 text-[10px] font-medium text-primary-foreground z-10">Personalizável</span>
                )}
                {p.isFeatured && (
                  <span className="absolute right-3 top-3 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-700 z-10">Destaque</span>
                )}
              </div>
              <div className="p-4">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  {p.category && <span className="flex items-center gap-0.5"><Tag className="h-3 w-3" />{p.category.name}</span>}
                </div>
                <h3 className="mt-1 font-heading text-sm font-semibold line-clamp-1">{p.name}</h3>
                <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{p.shortDescription}</p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="flex items-center gap-1 text-sm font-bold text-primary"><DollarSign className="h-4 w-4" /> R$ {p.basePrice.toFixed(2)}</span>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${p.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-muted text-muted-foreground'}`}>{p.status === 'published' ? 'Publicado' : p.status}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-xl border" data-testid="admin-products-table">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left font-medium"></th>
                <th className="px-4 py-3 text-left font-medium">Produto</th>
                <th className="px-4 py-3 text-left font-medium">Preço</th>
                <th className="px-4 py-3 text-left font-medium">Categoria</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-b hover:bg-muted/30 cursor-pointer" onClick={() => window.location.href = `/admin/produtos/${p.id}`}>
                  <td className="px-4 py-3">
                    {p.images && p.images.length > 0 ? (
                      <img src={p.images[0]} alt={p.name} className="h-8 w-8 rounded-lg object-cover" />
                    ) : (
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary/10 to-purple-500/10">
                        <Package className="h-4 w-4 text-primary/50" />
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.slug}</p>
                  </td>
                  <td className="px-4 py-3 font-medium">R$ {p.basePrice.toFixed(2)}</td>
                  <td className="px-4 py-3 text-muted-foreground">{p.category?.name || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs ${p.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-muted text-muted-foreground'}`}>
                      {p.status === 'published' ? 'Publicado' : p.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/admin/produtos/${p.id}`} onClick={(e) => e.stopPropagation()} className="inline-flex h-8 w-8 items-center justify-center rounded-lg hover:bg-muted">
                      <Pencil className="h-4 w-4" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
