'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ImageUpload } from '@/components/admin/image-upload'
import { CustomizationBuilder } from '@/components/admin/customization-builder'
import type { CustomizationField } from '@/lib/customization'

interface Category { id: string; name: string }

export default function AdminProdutoEditPage() {
  const router = useRouter()
  const { id } = useParams()
  const [categories, setCategories] = useState<Category[]>([])
  const [images, setImages] = useState<string[]>([])
  const [product, setProduct] = useState<Record<string, unknown>>({})
  const [customizationFields, setCustomizationFields] = useState<CustomizationField[]>([])
  const [hasCustomization, setHasCustomization] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/admin/categories').then((r) => r.json()).then(setCategories)
    fetch(`/api/admin/products/${id}`).then((r) => r.json()).then((data) => {
      setProduct(data)
      setImages(data.images || [])
      const schema = data.customizationSchema
      if (schema && Array.isArray(schema) && schema.length > 0) {
        setHasCustomization(true)
        setCustomizationFields(schema as CustomizationField[])
      }
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
      customizationSchema: hasCustomization && customizationFields.length > 0
        ? customizationFields
        : null,
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
          <div><label className="block text-sm font-medium">Preço Base (R$) *</label><input name="basePrice" type="number" step="0.01" defaultValue={product.basePrice as number} required className="mt-1 w-full rounded-lg border px-4 py-2.5" /></div>
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
              <option value="gamer">Gamer</option><option value="anime">Anime</option>
              <option value="home">Casa</option><option value="gifts">Presentes</option>
              <option value="auto">Auto</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div><label className="block text-sm font-medium">Material</label><input name="material" defaultValue={product.material as string} className="mt-1 w-full rounded-lg border px-4 py-2.5" /></div>
          <div>
            <label className="block text-sm font-medium">Nível de personalização</label>
            <select name="customizationLevel" defaultValue={(product.customizationLevel as string) || 'simple'} className="mt-1 w-full rounded-lg border px-4 py-2.5">
              <option value="none">Sem personalização</option>
              <option value="simple">Simples</option>
              <option value="moderate">Moderada</option>
              <option value="on_request">Sob consulta</option>
            </select>
          </div>
          <div><label className="block text-sm font-medium">Tempo est. (h)</label><input name="estimatedHours" type="number" defaultValue={(product.estimatedProductionTime as number) || 2} className="mt-1 w-full rounded-lg border px-4 py-2.5" /></div>
        </div>

        <ImageUpload images={images} onChange={setImages} />

        {/* ─── Seção de Personalização ─── */}
        <div className="rounded-xl border bg-muted/20 p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-sm font-semibold">Formulário de Personalização</h3>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Pedidos existentes mantêm as configurações anteriores. Mudanças só valem para novos pedidos.
              </p>
            </div>
            <label className="flex shrink-0 cursor-pointer items-center gap-2 text-sm">
              <div
                onClick={() => setHasCustomization((v) => !v)}
                className={`relative h-6 w-11 rounded-full transition-colors ${hasCustomization ? 'bg-primary' : 'bg-muted-foreground/30'}`}
              >
                <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${hasCustomization ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </div>
              {hasCustomization ? 'Ativado' : 'Desativado'}
            </label>
          </div>

          {hasCustomization && (
            <div className="mt-4">
              <CustomizationBuilder
                value={customizationFields}
                onChange={setCustomizationFields}
              />
            </div>
          )}
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <div className="flex gap-3 pt-4">
          <button type="submit" disabled={saving} className="rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50">{saving ? 'Salvando...' : 'Salvar'}</button>
          <button type="button" onClick={() => router.push('/admin/produtos')} className="rounded-lg border px-6 py-2.5 text-sm">Cancelar</button>
        </div>
      </form>
    </div>
  )
}
