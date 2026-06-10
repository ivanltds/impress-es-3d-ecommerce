// ─── M04: Secure Image Upload ───
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import crypto from 'crypto'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const MAX_SIZE = 5 * 1024 * 1024 // 5MB

// Magic bytes for common image formats
const VALID_SIGNATURES = ['ffd8ff', '89504e47', '52494646', '47494638']

function validateMagicBytes(buffer: Buffer): boolean {
  const hex = buffer.slice(0, 4).toString('hex')
  return VALID_SIGNATURES.some((sig) => hex.startsWith(sig))
}

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 100)
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
      return NextResponse.json({ error: `Tipo não permitido. Use: ${ALLOWED_TYPES.join(', ')}` }, { status: 400 })
    }

    // Validate size
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'Arquivo muito grande. Máximo: 5MB' }, { status: 400 })
    }

    // Validate magic bytes (prevent extension spoofing)
    const bytes = Buffer.from(await file.arrayBuffer())
    if (!validateMagicBytes(bytes)) {
      return NextResponse.json({ error: 'Arquivo inválido — não é uma imagem real' }, { status: 400 })
    }

    // Generate safe filename
    const ext = path.extname(file.name).toLowerCase() || '.jpg'
    const safeName = `${crypto.randomBytes(16).toString('hex')}${ext}`
    const uploadDir = path.join(process.cwd(), 'public', 'uploads')

    // Ensure upload directory exists
    await mkdir(uploadDir, { recursive: true })
    await writeFile(path.join(uploadDir, safeName), bytes)

    const url = `/uploads/${safeName}`
    return NextResponse.json({ url, name: file.name, size: file.size })
  } catch (err) {
    console.error('[upload] Error:', err)
    return NextResponse.json({ error: 'Erro ao processar upload' }, { status: 500 })
  }
}
