// M06: F5 - Enderecos (migracao localStorage para DB)
// Server Component: busca enderecos do DB e passa ao AddressList client component.
// Layout /conta/layout.tsx ja protege contra acesso sem auth (cenario 5.8).
// RN-M06-09: Nenhuma logica de localStorage aqui.
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { AddressList } from '@/components/conta/AddressList'

export default async function EnderecosPage() {
  const session = await auth()
  const userId = (session?.user as { id?: string } | undefined)?.id ?? ''

  const addresses = await prisma.address.findMany({
    where: { userId },
    orderBy: [{ isDefault: 'desc' }, { id: 'asc' }],
  })

  return (
    <div className="container mx-auto max-w-2xl px-4 py-12">
      <AddressList initialAddresses={addresses} />
    </div>
  )
}
