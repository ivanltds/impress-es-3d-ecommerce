// ─── M04: Admin Edit Product ───
import { notFound, redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'

export default async function AdminProdutoEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const product = await prisma.product.findUnique({ where: { id }, include: { category: true } })
  if (!product) notFound()

  const categories = await prisma.category.findMany()

  async function save(formData: FormData) {
    'use server'
    const name = formData.get('name') as string
    const slug = formData.get('slug') as string
    const shortDescription = formData.get('shortDescription') as string
    const basePrice = parseFloat(formData.get('basePrice') as string)
    const categoryId = formData.get('categoryId') as string

    await prisma.product.update({
      where: { id },
      data: { name, slug, shortDescription, basePrice, categoryId: categoryId || null },
    })
    revalidatePath('/admin/produtos')
    redirect('/admin/produtos')
  }

  return (
    <div className="p-6" data-testid="admin-edit-product">
      <h1 className="font-heading text-2xl font-bold">Editar Produto</h1>
      <form action={save} className="mt-8 max-w-xl space-y-4">
        <div>
          <label className="block text-sm font-medium">Nome</label>
          <input name="name" defaultValue={product.name} required className="mt-1 w-full rounded-lg border px-4 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium">Slug</label>
          <input name="slug" defaultValue={product.slug} required className="mt-1 w-full rounded-lg border px-4 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium">Descrição Curta</label>
          <textarea name="shortDescription" defaultValue={product.shortDescription} required className="mt-1 w-full rounded-lg border px-4 py-2" rows={3} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Preço (R$)</label>
            <input name="basePrice" type="number" step="0.01" defaultValue={product.basePrice} required className="mt-1 w-full rounded-lg border px-4 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium">Categoria</label>
            <select name="categoryId" defaultValue={product.categoryId || ''} className="mt-1 w-full rounded-lg border px-4 py-2">
              <option value="">Nenhuma</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        </div>
        <div className="flex gap-3">
          <button type="submit" className="rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground">Salvar</button>
          <a href="/admin/produtos" className="rounded-lg border px-6 py-2.5 text-sm">Cancelar</a>
        </div>
      </form>
    </div>
  )
}
