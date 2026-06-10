// ─── M02 Seed: Categories + Products ───
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Clean existing data
  await prisma.cartItem.deleteMany()
  await prisma.cart.deleteMany()
  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.product.deleteMany()
  await prisma.category.deleteMany()

  // ─── Categories ───
  const categories = await Promise.all([
    prisma.category.create({
      data: { name: 'Gamer Energy', slug: 'gamer', description: 'Setup com atitude. Neon, energia e performance.' },
    }),
    prisma.category.create({
      data: { name: 'Anime Pop', slug: 'anime', description: 'Seu universo favorito em cada detalhe.' },
    }),
    prisma.category.create({
      data: { name: 'Casa & Utilidades', slug: 'home', description: 'Funcionalidade com design que impressiona.' },
    }),
    prisma.category.create({
      data: { name: 'Presentes Personalizados', slug: 'gifts', description: 'Presentes que contam histórias.' },
    }),
    prisma.category.create({
      data: { name: 'Auto Vintage', slug: 'auto', description: 'Clássicos merecem acessórios à altura.' },
    }),
  ])
  console.log(`Created ${categories.length} categories`)

  // ─── Products ───
  const products = await Promise.all([
    prisma.product.create({
      data: {
        name: 'Porta-lata Neon Gamer',
        slug: 'porta-lata-neon-gamer',
        shortDescription: 'Porta-lata personalizado com estética gamer. Design neon, cores vibrantes, nome gravado.',
        longDescription: 'Feito em PLA de alta qualidade, este porta-lata transforma qualquer bebida em um statement piece. Escolha entre 6 cores neon, adicione seu nome ou gamertag gravado em baixo relevo.',
        basePrice: 49.9,
        categoryId: categories[0].id,
        collectionId: 'gamer',
        productType: 'simple',
        isCustomizable: true,
        customizationLevel: 'simple',
        estimatedProductionTime: 2,
        material: 'PLA Premium',
        isFeatured: true,
        images: [],
      },
    }),
    prisma.product.create({
      data: {
        name: 'Chaveiro Personalizado',
        slug: 'chaveiro-personalizado',
        shortDescription: 'Chaveiro com seu nome gravado. Escolha entre dezenas de formatos e cores.',
        longDescription: 'Chaveiro impresso em 3D com alta precisão. Ideal para brindes, lembranças ou uso pessoal. Mais de 20 formatos disponíveis.',
        basePrice: 19.9,
        categoryId: categories[3].id,
        collectionId: 'gifts',
        productType: 'simple',
        isCustomizable: true,
        customizationLevel: 'moderate',
        estimatedProductionTime: 1,
        material: 'PLA Standard',
        isFeatured: true,
        images: [],
      },
    }),
    prisma.product.create({
      data: {
        name: 'Abajur Lithophane 3D',
        slug: 'abajur-lithophane',
        shortDescription: 'Abajur que revela uma imagem quando aceso. Sua foto favorita transformada em arte.',
        longDescription: 'Tecnologia lithophane transforma qualquer foto em uma imagem revelada pela luz. Perfeito para presentear com fotos de família, pets ou paisagens.',
        basePrice: 89.9,
        categoryId: categories[3].id,
        collectionId: 'gifts',
        productType: 'simple',
        isCustomizable: true,
        customizationLevel: 'moderate',
        estimatedProductionTime: 4,
        material: 'PLA Branco Premium',
        isFeatured: true,
        images: [],
      },
    }),
    prisma.product.create({
      data: {
        name: 'Organizador de Mesa Modular',
        slug: 'organizador-mesa',
        shortDescription: 'Organizador modular para mesa. Encaixes precisos, design minimalista.',
        longDescription: 'Sistema modular de organização para seu desk. Módulos se encaixam com precisão milimétrica. Cabos, canetas, clipes — tudo no lugar certo.',
        basePrice: 59.9,
        categoryId: categories[2].id,
        collectionId: 'home',
        productType: 'simple',
        isCustomizable: true,
        customizationLevel: 'simple',
        estimatedProductionTime: 3,
        material: 'PLA Matte',
        isFeatured: true,
        images: [],
      },
    }),
    prisma.product.create({
      data: {
        name: 'Suporte para Headset',
        slug: 'suporte-headset-gamer',
        shortDescription: 'Suporte para headset com design agressivo. Perfeito para setups gamers.',
        longDescription: 'Mantenha seu headset sempre à mão com estilo. Design inspirado em armaduras futuristas, com acabamento fosco e base antiderrapante.',
        basePrice: 69.9,
        categoryId: categories[0].id,
        collectionId: 'gamer',
        productType: 'simple',
        isCustomizable: true,
        customizationLevel: 'simple',
        estimatedProductionTime: 3,
        material: 'PLA Premium',
        isFeatured: false,
        images: [],
      },
    }),
    prisma.product.create({
      data: {
        name: 'Miniatura Colecionável — Dragão',
        slug: 'miniatura-dragao',
        shortDescription: 'Dragão articulado impresso em 3D. Pintura detalhada, múltiplas cores.',
        longDescription: 'Figura colecionável de dragão com articulações móveis. Impresso em resina de alta definição com pintura à mão. Cada peça é única.',
        basePrice: 119.9,
        categoryId: categories[1].id,
        collectionId: 'anime',
        productType: 'simple',
        isCustomizable: false,
        customizationLevel: 'none',
        estimatedProductionTime: 6,
        material: 'Resina UV',
        isFeatured: true,
        images: [],
      },
    }),
    prisma.product.create({
      data: {
        name: 'Placa Decorativa — Garagem',
        slug: 'placa-decorativa-garagem',
        shortDescription: 'Placa decorativa personalizada para garagem. Ideal para entusiastas de carros.',
        longDescription: 'Placa estilo vintage para decorar sua garagem ou oficina. Personalize com nome, modelo do carro e ano. Acabamento que imita metal envelhecido.',
        basePrice: 79.9,
        categoryId: categories[4].id,
        collectionId: 'auto',
        productType: 'simple',
        isCustomizable: true,
        customizationLevel: 'moderate',
        estimatedProductionTime: 2,
        material: 'PLA Premium',
        isFeatured: false,
        images: [],
      },
    }),
    prisma.product.create({
      data: {
        name: 'Vaso Geométrico Decorativo',
        slug: 'vaso-geometrico',
        shortDescription: 'Vaso com design geométrico moderno. Perfeito para plantas pequenas e suculentas.',
        longDescription: 'Design paramétrico com linhas limpas e ângulos precisos. Disponível em várias cores e tamanhos. À prova d\'água com acabamento selado.',
        basePrice: 39.9,
        categoryId: categories[2].id,
        collectionId: 'home',
        productType: 'simple',
        isCustomizable: true,
        customizationLevel: 'simple',
        estimatedProductionTime: 2,
        material: 'PLA Premium',
        isFeatured: false,
        images: [],
      },
    }),
  ])
  console.log(`Created ${products.length} products`)
  console.log('Seed complete!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
