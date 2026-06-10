// ─── M04: Admin New Product ───
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'

export default async function AdminProdutoNovoPage() {
  const categories = await prisma.category.findMany({ orderBy: { name: 'asc' } })

  async function create(formData: FormData) {
    'use server'
    const name = formData.get('name') as string
    const slug = formData.get('slug') as string
    const shortDescription = formData.get('shortDescription') as string
    const longDescription = formData.get('longDescription') as string
    const basePrice = parseFloat(formData.get('basePrice') as string)
    const categoryId = formData.get('categoryId') as string
    const collectionId = formData.get('collectionId') as string
    const material = formData.get('material') as string
    const customizationLevel = formData.get('customizationLevel') as string
    const estimatedHours = parseInt(formData.get('estimatedHours') as string) || 2

    await prisma.product.create({
      data: {
        name,
        slug,
        shortDescription,
        longDescription,
        basePrice,
        categoryId: categoryId || null,
        collectionId: collectionId || null,
        material: material || 'PLA Premium',
        customizationLevel: customizationLevel || 'simple',
        isCustomizable: customizationLevel !== 'none',
        estimatedProductionTime: estimatedHours,
        images: [],
        productType: 'simple',
      },
    })

    revalidatePath('/admin/produtos')
    redirect('/admin/produtos')
  }

  return (
    <div className="p-6" data-testid="admin-new-product">
      <h1 className="font-heading text-2xl font-bold">Novo Produto</h1>
      <form action={create} className="mt-8 max-w-2xl space-y-4">
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
          <textarea name="shortDescription" required placeholder="Breve descrição do produto..." className="mt-1 w-full rounded-lg border px-4 py-2.5" rows={2} />
        </div>
        <div>
          <label className="block text-sm font-medium">Descrição Longa</label>
          <textarea name="longDescription" placeholder="Descrição detalhada com materiais, cuidados..." className="mt-1 w-full rounded-lg border px-4 py-2.5" rows={3} />
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
              <option value="gamer">Gamer Energy</option>
              <option value="anime">Anime Pop</option>
              <option value="home">Casa & Utilidades</option>
              <option value="gifts">Presentes Personalizados</option>
              <option value="auto">Auto Vintage</option>
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
              <option value="simple">Simples (cor/tamanho)</option>
              <option value="moderate">Moderada (cor+tamanho+texto)</option>
              <option value="on_request">Sob consulta</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium">Tempo Produção (h)</label>
            <input name="estimatedHours" type="number" defaultValue={2} className="mt-1 w-full rounded-lg border px-4 py-2.5" />
          </div>
        </div>
        <div className="flex gap-3 pt-4">
          <button type="submit" className="rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground">Criar Produto</button>
          <a href="/admin/produtos" className="rounded-lg border px-6 py-2.5 text-sm">Cancelar</a>
        </div>
      </form>
    </div>
  )
}
