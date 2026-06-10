'use client'

// ─── M04: Admin Edit Product (with image upload) ───
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ImageUpload } from '@/components/admin/image-upload'

interface Category { id: string; name: string }

export default function AdminProdutoEditPage() {
  const router = useRouter()
  const { id } = useParams()
  const [categories, setCategories] = useState<Category[]>([])
  const [images, setImages] = useState<string[]>([])
  const [product, setProduct] = useState<Record<string, string | number | string[]>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/admin/categories').then((r) => r.json()).then(setCategories)
    fetch(`/api/admin/products/${id}`).then((r) => r.json()).then((data) => {
      setProduct(data)
      setImages(data.images || [])
      setLoading(false)
    })
  }, [id])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    const form = new FormData(e.currentTarget)
    const body = {
      name: form.get('name'),
      slug: form.get('slug'),
      shortDescription: form.get('shortDescription'),
      longDescription: form.get('longDescription'),
      basePrice: parseFloat(form.get('basePrice') as string),
      categoryId: form.get('categoryId') || null,
      collectionId: form.get('collectionId') || null,
      material: form.get('material') || '',
      customizationLevel: form.get('customizationLevel') || 'simple',
      estimatedHours: parseInt(form.get('estimatedHours') as string) || 2,
      images,
    }
    const res = await fetch(`/api/admin/products/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (res.ok) router.push('/admin/produtos')
    else { setError('Erro ao salvar'); setSaving(false) }
  }

  if (loading) return <div className="p-6">Carregando...</div>

  return (
    <div className="p-6">
      <h1 className="font-heading text-2xl font-bold">Editar Produto</h1>
      <form onSubmit={handleSubmit} className="mt-8 max-w-2xl space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div><label className="block text-sm font-medium">Nome *</label><input name="name" defaultValue={product.name as string} required className="mt-1 w-full rounded-lg border px-4 py-2.5" /></div>
          <div><label className="block text-sm font-medium">Slug *</label><input name="slug" defaultValue={product.slug as string} required className="mt-1 w-full rounded-lg border px-4 py-2.5" /></div>
        </div>
        <div><label className="block text-sm font-medium">Descrição Curta *</label><textarea name="shortDescription" defaultValue={product.shortDescription as string} required className="mt-1 w-full rounded-lg border px-4 py-2.5" rows={2} /></div>
        <div><label className="block text-sm font-medium">Descrição Longa</label><textarea name="longDescription" defaultValue={product.longDescription as string} className="mt-1 w-full rounded-lg border px-4 py-2.5" rows={3} /></div>
        <div className="grid grid-cols-3 gap-4">
          <div><label className="block text-sm font-medium">Preço (R$) *</label><input name="basePrice" type="number" step="0.01" defaultValue={product.basePrice as number} required className="mt-1 w-full rounded-lg border px-4 py-2.5" /></div>
          <div>
            <label className="block text-sm font-medium">Categoria</label>
            <select name="categoryId" defaultValue={(product.categoryId as string) || ''} className="mt-1 w-full rounded-lg border px-4 py-2.5">
              <option value="">Nenhuma</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium">Coleção</label>
            <select name="collectionId" defaultValue={(product.collectionId as string) || ''} className="mt-1 w-full rounded-lg border px-4 py-2.5">
              <option value="">Nenhuma</option>
              <option value="gamer">Gamer</option><option value="anime">Anime</option><option value="home">Casa</option><option value="gifts">Presentes</option><option value="auto">Auto</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div><label className="block text-sm font-medium">Material</label><input name="material" defaultValue={product.material as string} className="mt-1 w-full rounded-lg border px-4 py-2.5" /></div>
          <div>
            <label className="block text-sm font-medium">Personalização</label>
            <select name="customizationLevel" defaultValue={(product.customizationLevel as string) || 'simple'} className="mt-1 w-full rounded-lg border px-4 py-2.5">
              <option value="none">Sem</option><option value="simple">Simples</option><option value="moderate">Moderada</option><option value="on_request">Sob consulta</option>
            </select>
          </div>
          <div><label className="block text-sm font-medium">Tempo (h)</label><input name="estimatedHours" type="number" defaultValue={(product.estimatedProductionTime as number) || 2} className="mt-1 w-full rounded-lg border px-4 py-2.5" /></div>
        </div>

        <ImageUpload images={images} onChange={setImages} />

        {error && <p className="text-sm text-red-500">{error}</p>}

        <div className="flex gap-3 pt-4">
          <button type="submit" disabled={saving} className="rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50">{saving ? 'Salvando...' : 'Salvar'}</button>
          <button type="button" onClick={() => router.push('/admin/produtos')} className="rounded-lg border px-6 py-2.5 text-sm">Cancelar</button>
        </div>
      </form>
    </div>
  )
}
