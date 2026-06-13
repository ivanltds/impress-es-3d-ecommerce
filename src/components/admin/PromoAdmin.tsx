'use client'

import { useState } from 'react'
import { Megaphone, Plus, Trash2, ToggleLeft, ToggleRight } from 'lucide-react'

interface PromoBannerSummary {
  id: string
  title: string
  subtitle: string | null
  startsAt: string
  endsAt: string
  isActive: boolean
  productCount: number
}

interface ProductOption {
  id: string
  name: string
  slug: string
}

interface PromoAdminProps {
  initialBanners: PromoBannerSummary[]
  allProducts: ProductOption[]
}

interface CreateForm {
  title: string
  subtitle: string
  startsAt: string
  endsAt: string
  isActive: boolean
  selectedProducts: Array<{ productId: string; sortOrder: number }>
}

const INITIAL_FORM: CreateForm = {
  title: '',
  subtitle: '',
  startsAt: '',
  endsAt: '',
  isActive: true,
  selectedProducts: [],
}

export function PromoAdmin({ initialBanners, allProducts }: PromoAdminProps) {
  const [banners, setBanners] = useState<PromoBannerSummary[]>(initialBanners)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<CreateForm>(INITIAL_FORM)
  const [formError, setFormError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setFormError(null)
    setIsSubmitting(true)

    try {
      const res = await fetch('/api/admin/promo-banners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          subtitle: form.subtitle || null,
          startsAt: form.startsAt,
          endsAt: form.endsAt,
          isActive: form.isActive,
          products: form.selectedProducts,
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setFormError((data as { error?: string }).error ?? 'Erro ao criar campanha.')
        return
      }

      const newBanner = await res.json() as PromoBannerSummary & { products: unknown[] }
      setBanners((prev) => [
        {
          id: newBanner.id,
          title: newBanner.title,
          subtitle: newBanner.subtitle,
          startsAt: typeof newBanner.startsAt === 'string' ? newBanner.startsAt : String(newBanner.startsAt),
          endsAt: typeof newBanner.endsAt === 'string' ? newBanner.endsAt : String(newBanner.endsAt),
          isActive: newBanner.isActive,
          productCount: form.selectedProducts.length,
        },
        ...prev,
      ])
      setForm(INITIAL_FORM)
      setShowForm(false)
    } catch {
      setFormError('Erro ao criar campanha.')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleToggle(id: string, currentActive: boolean) {
    const res = await fetch(`/api/admin/promo-banners/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !currentActive }),
    })
    if (res.ok) {
      setBanners((prev) =>
        prev.map((b) => (b.id === id ? { ...b, isActive: !currentActive } : b)),
      )
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Excluir esta campanha?')) return
    const res = await fetch(`/api/admin/promo-banners/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setBanners((prev) => prev.filter((b) => b.id !== id))
    }
  }

  function toggleProduct(productId: string) {
    const exists = form.selectedProducts.find((p) => p.productId === productId)
    if (exists) {
      setForm((prev) => ({
        ...prev,
        selectedProducts: prev.selectedProducts.filter((p) => p.productId !== productId),
      }))
    } else {
      setForm((prev) => ({
        ...prev,
        selectedProducts: [
          ...prev.selectedProducts,
          { productId, sortOrder: prev.selectedProducts.length },
        ],
      }))
    }
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Megaphone className="h-6 w-6 text-primary" />
          <h1 className="font-heading text-2xl font-bold">Campanhas Promocionais</h1>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-1 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
        >
          <Plus className="h-4 w-4" /> Nova Campanha
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <form onSubmit={handleCreate} className="mb-8 rounded-xl border p-6 space-y-4">
          <h2 className="font-semibold">Nova Campanha</h2>
          <input
            required
            placeholder="Título *"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full rounded-lg border px-4 py-2 text-sm"
          />
          <input
            placeholder="Subtítulo (opcional)"
            value={form.subtitle}
            onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
            className="w-full rounded-lg border px-4 py-2 text-sm"
          />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-muted-foreground">Início *</label>
              <input
                type="datetime-local"
                required
                value={form.startsAt}
                onChange={(e) => setForm({ ...form, startsAt: e.target.value })}
                className="w-full rounded-lg border px-4 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Fim *</label>
              <input
                type="datetime-local"
                required
                value={form.endsAt}
                onChange={(e) => setForm({ ...form, endsAt: e.target.value })}
                className="w-full rounded-lg border px-4 py-2 text-sm"
              />
            </div>
          </div>

          {/* Product selection */}
          <div>
            <p className="mb-2 text-sm font-semibold">Produtos da campanha</p>
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
              {allProducts.map((p) => {
                const selected = form.selectedProducts.some((sp) => sp.productId === p.id)
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => toggleProduct(p.id)}
                    className={`rounded-lg border px-3 py-2 text-left text-xs transition-all
                      ${selected ? 'border-primary bg-primary/10 font-semibold' : 'hover:border-primary/50'}`}
                  >
                    {p.name}
                  </button>
                )
              })}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {form.selectedProducts.length} produto(s) selecionado(s)
            </p>
          </div>

          {formError && <p className="text-sm text-red-500">{formError}</p>}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-primary px-6 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60"
            >
              {isSubmitting ? 'Criando...' : 'Criar Campanha'}
            </button>
            <button
              type="button"
              onClick={() => { setShowForm(false); setForm(INITIAL_FORM); setFormError(null) }}
              className="rounded-lg border px-6 py-2 text-sm font-semibold"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* Banners list */}
      <div className="space-y-4">
        {banners.length === 0 && (
          <p className="py-8 text-center text-muted-foreground">
            Nenhuma campanha cadastrada.
          </p>
        )}
        {banners.map((banner) => (
          <div key={banner.id} className="flex items-start justify-between gap-4 rounded-xl border p-4">
            <div>
              <div className="flex items-center gap-2">
                <p className="font-semibold">{banner.title}</p>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-semibold
                    ${banner.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}
                >
                  {banner.isActive ? 'Ativa' : 'Inativa'}
                </span>
              </div>
              {banner.subtitle && (
                <p className="text-sm text-muted-foreground">{banner.subtitle}</p>
              )}
              <p className="mt-1 text-xs text-muted-foreground">
                {new Date(banner.startsAt).toLocaleDateString('pt-BR')} →{' '}
                {new Date(banner.endsAt).toLocaleDateString('pt-BR')} ·{' '}
                {banner.productCount} produto(s)
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => handleToggle(banner.id, banner.isActive)}
                title={banner.isActive ? 'Desativar' : 'Ativar'}
                className="p-2 text-muted-foreground hover:text-primary"
              >
                {banner.isActive ? (
                  <ToggleRight className="h-5 w-5" />
                ) : (
                  <ToggleLeft className="h-5 w-5" />
                )}
              </button>
              <button
                onClick={() => handleDelete(banner.id)}
                className="p-2 text-muted-foreground hover:text-red-500"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
