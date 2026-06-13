// ─── M06: F7 — Admin: Gerenciar Campanhas Promocionais ───
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { PromoAdmin } from '@/components/admin/PromoAdmin'

const ADMIN_ROLES = ['admin', 'operator']

export default async function CampanhasPage() {
  const session = await auth()
  const role = (session?.user as { role?: string } | undefined)?.role
  if (!session?.user || !role || !ADMIN_ROLES.includes(role)) {
    redirect('/auth/entrar')
  }

  const [banners, products] = await Promise.all([
    prisma.promoBanner.findMany({
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { products: true } } },
    }),
    prisma.product.findMany({
      where: { status: 'published' },
      select: { id: true, name: true, slug: true },
      orderBy: { name: 'asc' },
    }),
  ])

  const bannersForClient = banners.map((b) => ({
    id: b.id,
    title: b.title,
    subtitle: b.subtitle,
    startsAt: b.startsAt.toISOString(),
    endsAt: b.endsAt.toISOString(),
    isActive: b.isActive,
    productCount: b._count.products,
  }))

  return <PromoAdmin initialBanners={bannersForClient} allProducts={products} />
}
