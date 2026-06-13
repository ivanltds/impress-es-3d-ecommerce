// ─── M02 Seed: Categories + Products ───
// IMPORTANTE: seed usa upsert — seguro rodar múltiplas vezes sem apagar dados.
// Imagens cadastradas via admin NÃO são sobrescritas.
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // ─── Universos ───
  const universeSlugs = [
    { slug: 'gaming',     name: 'Gaming',       comingSoon: false, sortOrder: 0 },
    { slug: 'anime-nerd', name: 'Anime & Nerd',  comingSoon: false, sortOrder: 1 },
    { slug: 'casa-decor', name: 'Casa & Decor',  comingSoon: false, sortOrder: 2 },
    { slug: 'presentes',  name: 'Presentes',     comingSoon: false, sortOrder: 3 },
    { slug: 'auto',       name: 'Auto',          comingSoon: true,  sortOrder: 4 },
  ]

  for (const u of universeSlugs) {
    await prisma.universe.upsert({
      where: { slug: u.slug },
      update: {},
      create: u,
    })
  }
  console.log('✓ Universos OK')

  // ─── Categories (upsert — não apaga) ───
  const categoryData = [
    { name: 'Gamer Energy',          slug: 'gamer',  description: 'Setup com atitude. Neon, energia e performance.' },
    { name: 'Anime Pop',             slug: 'anime',  description: 'Seu universo favorito em cada detalhe.' },
    { name: 'Casa & Utilidades',     slug: 'home',   description: 'Funcionalidade com design que impressiona.' },
    { name: 'Presentes Personalizados', slug: 'gifts', description: 'Presentes que contam histórias.' },
    { name: 'Auto Vintage',          slug: 'auto',   description: 'Clássicos merecem acessórios à altura.' },
  ]

  const categories: Record<string, string> = {}
  for (const c of categoryData) {
    const cat = await prisma.category.upsert({
      where: { slug: c.slug },
      update: { name: c.name, description: c.description },
      create: c,
    })
    categories[c.slug] = cat.id
  }
  console.log('✓ Categorias OK')

  // ─── Products (upsert por slug — NUNCA sobrescreve images) ───
  const productData = [
    {
      name: 'Porta-lata Neon Gamer',
      slug: 'porta-lata-neon-gamer',
      shortDescription: 'Porta-lata personalizado com estética gamer. Design neon, cores vibrantes, nome gravado.',
      longDescription: 'Feito em PLA de alta qualidade, este porta-lata transforma qualquer bebida em um statement piece. Escolha entre 6 cores neon, adicione seu nome ou gamertag gravado em baixo relevo.',
      basePrice: 49.9,
      categorySlug: 'gamer',
      collectionId: 'gamer',
      isCustomizable: true,
      customizationLevel: 'simple',
      estimatedProductionTime: 2,
      material: 'PLA Premium',
      isFeatured: true,
    },
    {
      name: 'Chaveiro Personalizado',
      slug: 'chaveiro-personalizado',
      shortDescription: 'Chaveiro com seu nome gravado. Escolha entre dezenas de formatos e cores.',
      longDescription: 'Chaveiro impresso em 3D com alta precisão. Ideal para brindes, lembranças ou uso pessoal. Mais de 20 formatos disponíveis.',
      basePrice: 19.9,
      categorySlug: 'gifts',
      collectionId: 'gifts',
      isCustomizable: true,
      customizationLevel: 'moderate',
      estimatedProductionTime: 1,
      material: 'PLA Standard',
      isFeatured: true,
    },
    {
      name: 'Abajur Lithophane 3D',
      slug: 'abajur-lithophane',
      shortDescription: 'Abajur que revela uma imagem quando aceso. Sua foto favorita transformada em arte.',
      longDescription: 'Tecnologia lithophane transforma qualquer foto em uma imagem revelada pela luz. Perfeito para presentear com fotos de família, pets ou paisagens.',
      basePrice: 89.9,
      categorySlug: 'gifts',
      collectionId: 'gifts',
      isCustomizable: true,
      customizationLevel: 'moderate',
      estimatedProductionTime: 4,
      material: 'PLA Branco Premium',
      isFeatured: true,
    },
    {
      name: 'Organizador de Mesa Modular',
      slug: 'organizador-mesa',
      shortDescription: 'Organizador modular para mesa. Encaixes precisos, design minimalista.',
      longDescription: 'Sistema modular de organização para seu desk. Módulos se encaixam com precisão milimétrica. Cabos, canetas, clipes — tudo no lugar certo.',
      basePrice: 59.9,
      categorySlug: 'home',
      collectionId: 'home',
      isCustomizable: true,
      customizationLevel: 'simple',
      estimatedProductionTime: 3,
      material: 'PLA Matte',
      isFeatured: true,
    },
    {
      name: 'Suporte para Headset',
      slug: 'suporte-headset-gamer',
      shortDescription: 'Suporte para headset com design agressivo. Perfeito para setups gamers.',
      longDescription: 'Mantenha seu headset sempre à mão com estilo. Design inspirado em armaduras futuristas, com acabamento fosco e base antiderrapante.',
      basePrice: 69.9,
      categorySlug: 'gamer',
      collectionId: 'gamer',
      isCustomizable: true,
      customizationLevel: 'simple',
      estimatedProductionTime: 3,
      material: 'PLA Premium',
      isFeatured: false,
    },
    {
      name: 'Miniatura Colecionável — Dragão',
      slug: 'miniatura-dragao',
      shortDescription: 'Dragão articulado impresso em 3D. Pintura detalhada, múltiplas cores.',
      longDescription: 'Figura colecionável de dragão com articulações móveis. Impresso em resina de alta definição com pintura à mão. Cada peça é única.',
      basePrice: 119.9,
      categorySlug: 'anime',
      collectionId: 'anime',
      isCustomizable: false,
      customizationLevel: 'none',
      estimatedProductionTime: 6,
      material: 'Resina UV',
      isFeatured: true,
    },
    {
      name: 'Placa Decorativa — Garagem',
      slug: 'placa-decorativa-garagem',
      shortDescription: 'Placa decorativa personalizada para garagem. Ideal para entusiastas de carros.',
      longDescription: 'Placa estilo vintage para decorar sua garagem ou oficina. Personalize com nome, modelo do carro e ano. Acabamento que imita metal envelhecido.',
      basePrice: 79.9,
      categorySlug: 'auto',
      collectionId: 'auto',
      isCustomizable: true,
      customizationLevel: 'moderate',
      estimatedProductionTime: 2,
      material: 'PLA Premium',
      isFeatured: false,
    },
    {
      name: 'Vaso Geométrico Decorativo',
      slug: 'vaso-geometrico',
      shortDescription: 'Vaso com design geométrico moderno. Perfeito para plantas pequenas e suculentas.',
      longDescription: "Design paramétrico com linhas limpas e ângulos precisos. Disponível em várias cores e tamanhos. À prova d'água com acabamento selado.",
      basePrice: 39.9,
      categorySlug: 'home',
      collectionId: 'home',
      isCustomizable: true,
      customizationLevel: 'simple',
      estimatedProductionTime: 2,
      material: 'PLA Premium',
      isFeatured: false,
    },
  ]

  for (const p of productData) {
    const { categorySlug, ...fields } = p
    const sharedFields = {
      ...fields,
      productType: 'simple' as const,
      categoryId: categories[categorySlug] ?? null,
    }

    await prisma.product.upsert({
      where: { slug: p.slug },
      // update: metadados apenas — images NÃO são tocadas
      update: {
        name: fields.name,
        shortDescription: fields.shortDescription,
        longDescription: fields.longDescription,
        basePrice: fields.basePrice,
        categoryId: categories[categorySlug] ?? null,
        collectionId: fields.collectionId,
        isCustomizable: fields.isCustomizable,
        customizationLevel: fields.customizationLevel,
        estimatedProductionTime: fields.estimatedProductionTime,
        material: fields.material,
        isFeatured: fields.isFeatured,
      },
      // create: inclui images: [] apenas na primeira criação
      create: { ...sharedFields, images: [] },
    })
  }
  console.log(`✓ ${productData.length} produtos OK (imagens preservadas)`)
  console.log('Seed complete!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
