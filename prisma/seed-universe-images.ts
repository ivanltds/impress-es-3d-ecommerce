/**
 * seed-universe-images.ts
 * Baixa imagens do Unsplash (CC0 / free commercial use) e sobe para
 * o Vercel Blob como heroImageUrl de cada universo no DB.
 *
 * Uso:
 *   npx tsx --env-file=.env.local prisma/seed-universe-images.ts
 *
 * Requer no .env.local (ou como env vars):
 *   BLOB_READ_WRITE_TOKEN
 *   DATABASE_URL
 */

import { put } from '@vercel/blob'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// ─── Dados base dos universos (espelho de prisma/seed.ts) ─────────────────
const UNIVERSE_BASE: Record<string, { name: string; comingSoon: boolean; sortOrder: number }> = {
  gaming:       { name: 'Gaming',       comingSoon: false, sortOrder: 0 },
  'anime-nerd': { name: 'Anime & Nerd', comingSoon: false, sortOrder: 1 },
  'casa-decor': { name: 'Casa & Decor', comingSoon: false, sortOrder: 2 },
  presentes:    { name: 'Presentes',    comingSoon: false, sortOrder: 3 },
  auto:         { name: 'Auto',         comingSoon: true,  sortOrder: 4 },
}

// ─── Seleção de imagens do Unsplash (free / sem restrição comercial) ───────
// Formato: https://images.unsplash.com/photo-{ID}?w=1200&q=80
const IMAGES: Record<string, { id: string; desc: string }> = {
  gaming: {
    id: 'photo-1542751371-adc38448a05e',
    desc: 'pessoa em cadeira gamer com monitor neon',
  },
  'anime-nerd': {
    id: 'photo-1621478374422-35206faeddfb',
    desc: 'figure anime feminina vestido amarelo',
  },
  'casa-decor': {
    id: 'photo-1580064141068-f42c18d153f5',
    desc: 'vaso cerâmica bege sobre mesa',
  },
  presentes: {
    id: 'photo-1625552187571-7ee60ac43d2b',
    desc: 'duas mãos trocando caixa de presente',
  },
  auto: {
    id: 'photo-1556982962-dc0ee0f77f47',
    desc: 'câmbio de carro close-up dramático',
  },
}

// ─── Helpers ──────────────────────────────────────────────────────────────
function unsplashUrl(photoId: string, w = 1200, q = 80): string {
  return `https://images.unsplash.com/${photoId}?w=${w}&q=${q}&auto=format&fit=crop`
}

async function downloadImage(url: string): Promise<Buffer> {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'deepclaude-seed/1.0' },
  })
  if (!res.ok) throw new Error(`HTTP ${res.status} ao baixar ${url}`)
  const buf = Buffer.from(await res.arrayBuffer())
  console.log(`  ↓ baixado ${(buf.length / 1024).toFixed(0)} KB`)
  return buf
}

// ─── Main ──────────────────────────────────────────────────────────────────
async function main() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error('BLOB_READ_WRITE_TOKEN não definido. Execute com --env-file=.env.local')
  }

  console.log('🌄  Iniciando seed de imagens de herói dos universos...\n')

  for (const [slug, cfg] of Object.entries(IMAGES)) {
    console.log(`📦  [${slug}] ${cfg.desc}`)

    // 1. Garante que o universo existe (upsert)
    const base = UNIVERSE_BASE[slug]
    await prisma.universe.upsert({
      where: { slug },
      update: {},
      create: {
        slug,
        name: base.name,
        comingSoon: base.comingSoon,
        sortOrder: base.sortOrder,
      },
    })

    // 2. Baixa imagem
    const imgUrl = unsplashUrl(cfg.id)
    console.log(`  → ${imgUrl}`)
    let imageBuffer: Buffer
    try {
      imageBuffer = await downloadImage(imgUrl)
    } catch (err) {
      console.error(`  ✗ Erro ao baixar: ${err}`)
      continue
    }

    // 3. Sobe para Vercel Blob
    const blobPath = `universes/${slug}/hero.jpg`
    let blobUrl: string
    try {
      const result = await put(blobPath, imageBuffer, {
        access: 'public',
        contentType: 'image/jpeg',
        addRandomSuffix: false,
      })
      blobUrl = result.url
      console.log(`  ↑ blob: ${blobUrl}`)
    } catch (err) {
      console.error(`  ✗ Erro no blob put(): ${err}`)
      continue
    }

    // 4. Atualiza DB
    try {
      await prisma.universe.update({
        where: { slug },
        data: { heroImageUrl: blobUrl },
      })
      console.log(`  ✓ heroImageUrl atualizado no DB\n`)
    } catch (err) {
      console.error(`  ✗ Erro no Prisma update(): ${err}\n`)
    }
  }

  console.log('✅  Seed de imagens concluído!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
