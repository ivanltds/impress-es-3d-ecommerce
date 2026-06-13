// ─── M06: Conta Layout — aplica tema do universo preferido a toda a área /conta ───
// DA-M06-01: Server Component que busca preferredCollection e injeta ContaThemeWrapper
// Cenários: 1.1, 1.2, 1.5, 1.6, 3.9, 5.8
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { ContaThemeWrapper } from '@/components/conta/ContaThemeWrapper'

export default async function ContaLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user?.id) {
    redirect('/auth/entrar')
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { preferredCollection: true },
  })

  return (
    <ContaThemeWrapper initialSlug={user?.preferredCollection ?? null}>
      {children}
    </ContaThemeWrapper>
  )
}
