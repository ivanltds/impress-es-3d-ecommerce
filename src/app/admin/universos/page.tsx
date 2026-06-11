// /admin/universos — Server Component
// Busca universos e passa para o Client Component de edição
import { prisma } from '@/lib/db'
import { UniversosAdmin } from '@/components/admin/universos/UniversosAdmin'

export default async function UniversosAdminPage() {
  const universes = await prisma.universe.findMany({
    select: {
      id: true,
      slug: true,
      name: true,
      comingSoon: true,
      sortOrder: true,
      cardImageUrl: true,
      heroImageUrl: true,
      tagline: true,
      bullets: true,
    },
    orderBy: { sortOrder: 'asc' },
  })

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Universos</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Gerencie imagens, tagline e bullets de cada universo da loja.
        </p>
      </div>
      <UniversosAdmin universes={universes as any} />
    </div>
  )
}
