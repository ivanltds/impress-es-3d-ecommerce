// ─── M04: Image Upload (base64 storage) ───
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const MAX_SIZE = 2 * 1024 * 1024 // 2MB for base64 storage

const VALID_SIGNATURES = ['ffd8ff', '89504e47', '52494646', '47494638']

function validateMagicBytes(buffer: Buffer): boolean {
  const hex = buffer.slice(0, 4).toString('hex')
  return VALID_SIGNATURES.some((sig) => hex.startsWith(sig))
}

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 })

    // Validate type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: `Tipo não permitido. Use: JPG, PNG, WebP ou GIF` }, { status: 400 })
    }

    // Validate size
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'Arquivo muito grande. Máximo: 2MB' }, { status: 400 })
    }

    // Validate magic bytes (prevent extension spoofing)
    const bytes = Buffer.from(await file.arrayBuffer())
    if (!validateMagicBytes(bytes)) {
      return NextResponse.json({ error: 'Arquivo inválido — não é uma imagem real' }, { status: 400 })
    }

    // Convert to base64 data URL (works everywhere, no disk dependency)
    const b64 = bytes.toString('base64')
    const url = `data:${file.type};base64,${b64}`

    return NextResponse.json({ url, name: file.name, size: file.size })
  } catch (err) {
    console.error('[upload] Error:', err)
    return NextResponse.json({ error: 'Erro ao processar upload' }, { status: 500 })
  }
}
