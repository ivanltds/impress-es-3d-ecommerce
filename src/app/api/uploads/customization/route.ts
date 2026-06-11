// ─── Upload público para personalização do cliente ───
// Sem autenticação — usado no fluxo de compra/carrinho
// Imagens até 8MB | Arquivos 3D até 20MB | Retorna data URL base64

import { NextRequest, NextResponse } from 'next/server'

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MODEL_TYPES = [
  'application/octet-stream', // .stl
  'model/stl',
  'model/obj',
  'application/sla',
]
const MODEL_EXTS = ['.stl', '.obj', '.3mf']

const IMAGE_MAX = 8 * 1024 * 1024   // 8MB
const MODEL_MAX = 20 * 1024 * 1024  // 20MB

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const kind = (formData.get('kind') as string) || 'image_ref' // image_ref | file_3d

    if (!file) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 })
    }

    const ext = '.' + file.name.split('.').pop()?.toLowerCase()
    const isImage = IMAGE_TYPES.includes(file.type)
    const is3D = MODEL_EXTS.includes(ext)

    if (kind === 'image_ref') {
      if (!isImage) {
        return NextResponse.json(
          { error: 'Formato inválido. Envie JPG, PNG ou WebP.' },
          { status: 400 }
        )
      }
      if (file.size > IMAGE_MAX) {
        return NextResponse.json(
          { error: 'too_large', maxMB: 8 },
          { status: 413 }
        )
      }
    } else if (kind === 'file_3d') {
      if (!is3D) {
        return NextResponse.json(
          { error: 'Formato inválido. Envie .STL, .OBJ ou .3MF.' },
          { status: 400 }
        )
      }
      if (file.size > MODEL_MAX) {
        return NextResponse.json(
          { error: 'too_large', maxMB: 20 },
          { status: 413 }
        )
      }
    }

    // Converte para base64 data URL
    const bytes = Buffer.from(await file.arrayBuffer())
    const mime = isImage ? file.type : 'application/octet-stream'
    const dataUrl = `data:${mime};base64,${bytes.toString('base64')}`

    return NextResponse.json({
      url: dataUrl,
      name: file.name,
      sizeMB: parseFloat((file.size / 1024 / 1024).toFixed(2)),
    })
  } catch (err) {
    console.error('[customization-upload]', err)
    return NextResponse.json({ error: 'Erro ao processar upload' }, { status: 500 })
  }
}
