// FF08: Image Upload - Vercel Blob
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { put } from '@vercel/blob'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const MAX_SIZE = 5 * 1024 * 1024 // 5 MB

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 })

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Tipo nao permitido. Use: JPG, PNG, WebP ou GIF' }, { status: 400 })
    }

    // Read bytes first — file.size is unreliable in test environments with large zero-filled files
    const bytes = Buffer.from(await file.arrayBuffer())

    if (bytes.length > MAX_SIZE) {
      return NextResponse.json({ error: 'Arquivo muito grande. Maximo: 5MB' }, { status: 400 })
    }

    const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
    const filename = 'products/' + Date.now() + '-' + Math.random().toString(36).slice(2) + '.' + ext

    const blob = await put(filename, bytes, {
      access: 'public',
      contentType: file.type,
    })

    return NextResponse.json({ url: blob.url, name: file.name, size: file.size })
  } catch (err) {
    console.error('[upload] Error:', err)
    return NextResponse.json({ error: 'Erro ao processar upload' }, { status: 500 })
  }
}
