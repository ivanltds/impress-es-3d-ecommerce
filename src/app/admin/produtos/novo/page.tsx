'use client'

// ─── M04: Admin New Product (with image upload) ───
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ImageUpload } from '@/components/admin/image-upload'

interface Category { id: string; name: string }

export default function AdminProdutoNovoPage() {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [images, setImages] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/admin/products')
      .then((r) => r.json())
      .then(() => {
        // Get categories from a separate API or hardcode
        // For now, use the same endpoint
      })
    // Fetch categories
    fetch('/api/admin/categories')
      .then((r) => r.json())
      .then(setCategories)
      .catch(() => {})
  }, [])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    setError('')

    const form = new FormData(e.currentTarget)
    const body: Record<string, unknown> = {
      name: form.get('name'),
      slug: form.get('slug'),
      shortDescription: form.get('shortDescription'),
      longDescription: form.get('longDescription'),
      basePrice: parseFloat(form.get('basePrice') as string),
      categoryId: form.get('categoryId') || null,
      collectionId: form.get('collectionId') || null,
      material: form.get('material') || 'PLA Premium',
      customizationLevel: form.get('customizationLevel') || 'simple',
      estimatedHours: parseInt(form.get('estimatedHours') as string) || 2,
      images,
    }

    const res = await fetch('/api/admin/products/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    if (res.ok) {
      router.push('/admin/produtos')
    } else {
      const data = await res.json()
      setError(data.error || 'Erro ao criar produto')
      setSaving(false)
    }
  }

  return (
    <div className="p-6">
      <h1 className="font-heading text-2xl font-bold">Novo Produto</h1>
      <form onSubmit={handleSubmit} className="mt-8 max-w-2xl space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Nome *</label>
            <input name="name" required placeholder="Porta-lata Neon Gamer" className="mt-1 w-full rounded-lg border px-4 py-2.5" />
          </div>
          <div>
            <label className="block text-sm font-medium">Slug *</label>
            <input name="slug" required placeholder="porta-lata-neon-gamer" className="mt-1 w-full rounded-lg border px-4 py-2.5" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium">Descrição Curta *</label>
          <textarea name="shortDescription" required placeholder="Breve descrição..." className="mt-1 w-full rounded-lg border px-4 py-2.5" rows={2} />
        </div>
        <div>
          <label className="block text-sm font-medium">Descrição Longa</label>
          <textarea name="longDescription" placeholder="Descrição detalhada..." className="mt-1 w-full rounded-lg border px-4 py-2.5" rows={3} />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium">Preço (R$) *</label>
            <input name="basePrice" type="number" step="0.01" required placeholder="49.90" className="mt-1 w-full rounded-lg border px-4 py-2.5" />
          </div>
          <div>
            <label className="block text-sm font-medium">Categoria</label>
            <select name="categoryId" className="mt-1 w-full rounded-lg border px-4 py-2.5">
              <option value="">Nenhuma</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium">Coleção</label>
            <select name="collectionId" className="mt-1 w-full rounded-lg border px-4 py-2.5">
              <option value="">Nenhuma</option>
              <option value="gamer">Gamer</option><option value="anime">Anime</option>
              <option value="home">Casa</option><option value="gifts">Presentes</option>
              <option value="auto">Auto</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium">Material</label>
            <input name="material" placeholder="PLA Premium" className="mt-1 w-full rounded-lg border px-4 py-2.5" />
          </div>
          <div>
            <label className="block text-sm font-medium">Personalização</label>
            <select name="customizationLevel" defaultValue="simple" className="mt-1 w-full rounded-lg border px-4 py-2.5">
              <option value="none">Sem personalização</option>
              <option value="simple">Simples</option>
              <option value="moderate">Moderada</option>
              <option value="on_request">Sob consulta</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium">Tempo (h)</label>
            <input name="estimatedHours" type="number" defaultValue={2} className="mt-1 w-full rounded-lg border px-4 py-2.5" />
          </div>
        </div>

        <ImageUpload images={images} onChange={setImages} />

        {error && <p className="text-sm text-red-500">{error}</p>}

        <div className="flex gap-3 pt-4">
          <button type="submit" disabled={saving} className="rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50">
            {saving ? 'Criando...' : 'Criar Produto'}
          </button>
          <button type="button" onClick={() => router.push('/admin/produtos')} className="rounded-lg border px-6 py-2.5 text-sm">Cancelar</button>
        </div>
      </form>
    </div>
  )
}
