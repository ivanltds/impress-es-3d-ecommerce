/**
 * Migração: imagens base64 no DB → Vercel Blob
 *
 * Execução:
 *   npx tsx prisma/migrate-images-to-blob.ts
 *
 * Pré-requisitos:
 *   - .env.local com BLOB_READ_WRITE_TOKEN e DATABASE_URL
 *   - npm install @vercel/blob (já instalado)
 */

import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { put } from '@vercel/blob'

const prisma = new PrismaClient()

function isBase64Image(url: string): boolean {
  return url.startsWith('data:image/')
}

function getMimeType(dataUrl: string): string {
  const match = dataUrl.match(/^data:(image\/[a-zA-Z0-9+.-]+);base64,/)
  return match ? match[1] : 'image/jpeg'
}

function getExtension(mimeType: string): string {
  const map: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
  }
  return map[mimeType] ?? 'jpg'
}

function base64ToBuffer(dataUrl: string): Buffer {
  const base64 = dataUrl.split(',')[1]
  return Buffer.from(base64, 'base64')
}

async function main() {
  console.log('🔍 Buscando produtos com imagens base64...\n')

  const products = await prisma.product.findMany({
    select: { id: true, name: true, images: true },
  })

  const toMigrate = products.filter((p) => p.images.some(isBase64Image))

  if (toMigrate.length === 0) {
    console.log('✅ Nenhuma imagem base64 encontrada. Banco já está no novo formato.')
    return
  }

  console.log(`📦 ${toMigrate.length} produto(s) com imagens base64 encontrados.\n`)

  let totalImages = 0
  let successCount = 0
  let errorCount = 0

  for (const product of toMigrate) {
    console.log(`\n📸 Produto: "${product.name}" (${product.id})`)
    const newImages: string[] = []

    for (let i = 0; i < product.images.length; i++) {
      const url = product.images[i]

      if (!isBase64Image(url)) {
        // Já é URL externa — mantém como está
        newImages.push(url)
        console.log(`   [${i + 1}] ↩ já é URL externa, mantendo`)
        continue
      }

      totalImages++
      try {
        const mimeType = getMimeType(url)
        const ext = getExtension(mimeType)
        const buffer = base64ToBuffer(url)
        const pathname = `products/${product.id}-${i + 1}.${ext}`

        console.log(`   [${i + 1}] ⬆ Fazendo upload: ${pathname} (${(buffer.length / 1024).toFixed(1)} KB)`)

        const blob = await put(pathname, buffer, {
          access: 'public',
          contentType: mimeType,
          addRandomSuffix: false,
        })

        newImages.push(blob.url)
        successCount++
        console.log(`   [${i + 1}] ✅ ${blob.url}`)
      } catch (err) {
        errorCount++
        console.error(`   [${i + 1}] ❌ Falha no upload:`, err)
        // Mantém a base64 original em caso de erro (não perde a imagem)
        newImages.push(url)
      }
    }

    // Atualiza o produto com as novas URLs
    await prisma.product.update({
      where: { id: product.id },
      data: { images: newImages },
    })

    console.log(`   ✅ Produto atualizado no banco.`)
  }

  console.log('\n─────────────────────────────────')
  console.log(`✅ Migração concluída!`)
  console.log(`   Total de imagens processadas: ${totalImages}`)
  console.log(`   Sucesso: ${successCount}`)
  console.log(`   Erros: ${errorCount}`)
  if (errorCount > 0) {
    console.log(`\n⚠️  ${errorCount} imagem(ns) com erro mantiveram o formato base64.`)
    console.log(`   Rode o script novamente para tentar novamente.`)
  }
}

main()
  .catch((err) => {
    console.error('Erro fatal:', err)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
