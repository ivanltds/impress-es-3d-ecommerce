// POST /api/admin/universes/[slug]/upload
// Faz upload de imagem PNG para Vercel Blob e atualiza cardImageUrl ou heroImageUrl
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { put } from '@vercel/blob'

const ADMIN_ROLES = ['admin', 'operator']
const MAX_SIZE = 5 * 1024 * 1024 // 5 MB

function isAuthorized(session: unknown): boolean {
  const s = session as { user?: { role?: string } } | null
  const role = s?.user?.role
  return Boolean(s?.user && role && ADMIN_ROLES.includes(role))
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await auth()
  if (!isAuthorized(session)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { slug } = await params

  // Parse formData first so file validation can happen before DB lookup
  let formData: FormData
  try {
    formData = await req.formData()
  } catch {
    return NextResponse.json({ error: 'FormData invalido' }, { status: 400 })
  }

  const file = formData.get('file') as File | null
  const type = formData.get('type') as string | null

  if (!file) {
    return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 })
  }

  if (!type || !['card', 'hero'].includes(type)) {
    return NextResponse.json({ error: 'Campo type ausente ou invalido' }, { status: 400 })
  }

  // Validate MIME type - only PNG (before DB lookup for early rejection)
  if (file.type !== 'image/png') {
    return NextResponse.json(
      { error: 'Apenas PNG e aceito (transparencia obrigatoria)' },
      { status: 422 }
    )
  }

  // Validate size (before DB lookup for early rejection)
  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { error: 'Arquivo muito grande. Maximo permitido: 5 MB' },
      { status: 413 }
    )
  }

  // Now check universe exists
  const universe = await prisma.universe.findUnique({ where: { slug } })
  if (!universe) {
    return NextResponse.json({ error: 'Universe not found' }, { status: 404 })
  }

  const bytes = Buffer.from(await file.arrayBuffer())

  // Upload to Vercel Blob with deterministic path (no random suffix = overwrites previous)
  const blobPath = 'universes/' + slug + '/' + type + '.png'
  const blob = await put(blobPath, bytes, {
    access: 'public',
    contentType: 'image/png',
    addRandomSuffix: false,
  })

  // Update DB only after successful upload
  const updateField = type === 'card' ? 'cardImageUrl' : 'heroImageUrl'
  const updated = await prisma.universe.update({
    where: { slug },
    data: { [updateField]: blob.url },
    select: { slug: true, cardImageUrl: true, heroImageUrl: true },
  })

  return NextResponse.json(updated)
}
