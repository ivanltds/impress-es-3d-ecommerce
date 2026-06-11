// src/config/universes.ts
// Fonte de verdade para dados de apresentação dos universos (DA-02 opção A).
// Tudo que não precisa de DB: visual, SEO, mensagens WhatsApp, ordem padrão.

export interface UniverseConfig {
  slug: string
  name: string
  tagline: string
  persona: string
  palette: {
    primary: string
    secondary: string
    bg: string
    text: string
  }
  fonts: {
    heading: string
    body: string
  }
  heroImage: string
  cardImage: string
  ogImage: string
  seoTitle: string
  seoDescription: string
  whatsappMessage: string
  sortOrder: number
}

export const UNIVERSE_CONFIG: Record<string, UniverseConfig> = {
  'gaming': {
    slug: 'gaming',
    name: 'Gaming',
    tagline: 'Setup com atitude. Neon, energia e performance.',
    persona: 'O Gamer (18–28)',
    palette: { primary: '#00ff41', secondary: '#ff00ff', bg: '#0a0a0a', text: '#f0f0f0' },
    fonts: { heading: 'Orbitron', body: 'Inter' },
    heroImage: '/universes/gaming/hero.jpg',
    cardImage: '/universes/gaming/card.jpg',
    ogImage: '/universes/gaming/og.jpg',
    seoTitle: 'Gaming — Produtos 3D Personalizados para Gamers',
    seoDescription: 'Impressão 3D com identidade gamer. Suportes, organizadores e acessórios personalizados para o seu setup.',
    whatsappMessage: 'Olá! Vi o universo Gaming e quero criar um produto personalizado para o meu setup!',
    sortOrder: 0,
  },
  'anime-nerd': {
    slug: 'anime-nerd',
    name: 'Anime & Nerd',
    tagline: 'Seu universo favorito em cada detalhe.',
    persona: 'Fã de Anime (16–28)',
    palette: { primary: '#c44dff', secondary: '#ff6b9d', bg: '#ffffff', text: '#1a1a1a' },
    fonts: { heading: 'Fredoka One', body: 'Nunito' },
    heroImage: '/universes/anime-nerd/hero.jpg',
    cardImage: '/universes/anime-nerd/card.jpg',
    ogImage: '/universes/anime-nerd/og.jpg',
    seoTitle: 'Anime & Nerd — Produtos 3D Personalizados para Fãs',
    seoDescription: 'Produtos impressos em 3D com referências de anime e cultura nerd. Personalize com o seu personagem favorito.',
    whatsappMessage: 'Olá! Vi o universo Anime & Nerd e quero criar um produto personalizado para minha coleção!',
    sortOrder: 1,
  },
  'casa-decor': {
    slug: 'casa-decor',
    name: 'Casa & Decor',
    tagline: 'Funcionalidade com design que impressiona.',
    persona: 'A Decoradora (25–45)',
    palette: { primary: '#8b6914', secondary: '#2c2c2c', bg: '#faf8f5', text: '#2c2c2c' },
    fonts: { heading: 'Playfair Display', body: 'Lato' },
    heroImage: '/universes/casa-decor/hero.jpg',
    cardImage: '/universes/casa-decor/card.jpg',
    ogImage: '/universes/casa-decor/og.jpg',
    seoTitle: 'Casa & Decor — Objetos 3D Personalizados para sua Casa',
    seoDescription: 'Peças decorativas e utilitários impressos em 3D com design exclusivo para sua casa.',
    whatsappMessage: 'Olá! Vi o universo Casa & Decor e quero criar uma peça personalizada para minha decoração!',
    sortOrder: 2,
  },
  'presentes': {
    slug: 'presentes',
    name: 'Presentes',
    tagline: 'Presentes que contam histórias.',
    persona: 'O Presenteador (20–50)',
    palette: { primary: '#e8521a', secondary: '#2c2c2c', bg: '#fff9f0', text: '#2c2c2c' },
    fonts: { heading: 'Merriweather', body: 'Open Sans' },
    heroImage: '/universes/presentes/hero.jpg',
    cardImage: '/universes/presentes/card.jpg',
    ogImage: '/universes/presentes/og.jpg',
    seoTitle: 'Presentes — Produtos 3D Personalizados para Presentear',
    seoDescription: 'Presentes únicos e personalizados impressos em 3D. Para quem você ama, com o nome e detalhe que só você sabe.',
    whatsappMessage: 'Olá! Vi o universo Presentes e quero criar um presente personalizado único!',
    sortOrder: 3,
  },
  'auto': {
    slug: 'auto',
    name: 'Auto',
    tagline: 'Clássicos merecem acessórios à altura.',
    persona: 'Entusiasta Auto (25–45)',
    palette: { primary: '#c0392b', secondary: '#f5f5f5', bg: '#1a1a1a', text: '#f5f5f5' },
    fonts: { heading: 'Bebas Neue', body: 'Roboto' },
    heroImage: '/universes/auto/hero.jpg',
    cardImage: '/universes/auto/card.jpg',
    ogImage: '/universes/auto/og.jpg',
    seoTitle: 'Auto — Peças 3D Personalizadas para Entusiastas',
    seoDescription: 'Acessórios e peças impressos em 3D para carros e entusiastas automotivos. Personalização de alto nível.',
    whatsappMessage: 'Olá! Vi o universo Auto e quero criar uma peça personalizada para o meu carro!',
    sortOrder: 4,
  },
}

export const UNIVERSE_SLUGS = Object.keys(UNIVERSE_CONFIG) as string[]
