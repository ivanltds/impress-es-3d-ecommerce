// ─── Unit Tests: FF08 — Funções de Fallback de Universo ───
// Testa getUniverseTagline() e getUniverseBullets() em src/lib/universe-utils.ts
// As funções ainda NÃO existem — o import vai falhar com "Cannot find module" ou erro de named export
// FASE 2 — TEST AUTHORING (🔴 RED)

import { describe, it, expect } from 'vitest'

// Import estático — vai falhar em RED pois as funções ainda não foram exportadas
import {
  getUniverseTagline,
  getUniverseBullets,
} from '@/lib/universe-utils'

// ─── Fixtures ────────────────────────────────────────────────────────────────

// Taglines definidas em UNIVERSE_CONFIG (valores de fallback estático)
const STATIC_TAGLINES: Record<string, string> = {
  gaming: 'Setup com atitude. Neon, energia e performance.',
  'anime-nerd': 'Seu universo favorito em cada detalhe.',
  'casa-decor': 'Funcionalidade com design que impressiona.',
  presentes: 'Presentes que contam histórias.',
  auto: 'Cada detalhe conta na estrada.',
}

// Bullets definidos em UNIVERSE_DETAILS / config estático (fallback)
const STATIC_BULLETS: Record<string, string[]> = {
  gaming: [
    'Suportes e organizadores de setup personalizados',
    'Miniaturas e acessórios temáticos para gamers',
    'Produtos com estética neon e identidade gamer',
  ],
  'anime-nerd': [
    'Figuras e miniaturas de personagens favoritos',
    'Objetos decorativos com referências de anime',
    'Presentes únicos para fãs de cultura nerd',
  ],
  presentes: [
    'Presentes únicos impossíveis de achar em loja comum',
    'Personalização com nome, data ou mensagem especial',
    'Para todas as ocasiões e perfis de presenteados',
  ],
}

// ─── getUniverseTagline ───────────────────────────────────────────────────────

describe('getUniverseTagline()', () => {
  it('retorna valor do banco quando não é nulo', () => {
    const dbTagline = 'Setup épico começa aqui.'
    const result = getUniverseTagline(dbTagline, 'gaming')
    expect(result).toBe('Setup épico começa aqui.')
  })

  it('retorna UNIVERSE_CONFIG tagline quando banco é null', () => {
    const result = getUniverseTagline(null, 'gaming')
    expect(result).toBe(STATIC_TAGLINES['gaming'])
    expect(result).not.toBeNull()
    expect(result.length).toBeGreaterThan(0)
  })

  it('retorna UNIVERSE_CONFIG tagline quando banco é string vazia', () => {
    const result = getUniverseTagline('', 'gaming')
    expect(result).toBe(STATIC_TAGLINES['gaming'])
    expect(result).not.toBe('')
  })

  it('retorna fallback correto para slug "anime-nerd"', () => {
    const result = getUniverseTagline(null, 'anime-nerd')
    expect(result).toBe(STATIC_TAGLINES['anime-nerd'])
  })

  it('retorna fallback correto para slug "casa-decor"', () => {
    const result = getUniverseTagline(null, 'casa-decor')
    expect(result).toBe(STATIC_TAGLINES['casa-decor'])
  })

  it('retorna o valor do banco mesmo que seja diferente do config estático', () => {
    const dbTagline = 'Valor customizado pelo admin.'
    const result = getUniverseTagline(dbTagline, 'presentes')
    // Deve retornar o valor do banco, NÃO o fallback estático
    expect(result).toBe('Valor customizado pelo admin.')
    expect(result).not.toBe(STATIC_TAGLINES['presentes'])
  })
})

// ─── getUniverseBullets ───────────────────────────────────────────────────────

describe('getUniverseBullets()', () => {
  it('retorna array do banco quando tem exatamente 3 itens', () => {
    const dbBullets = ['Bullet 1 editado', 'Bullet 2 editado', 'Bullet 3 editado']
    const result = getUniverseBullets(dbBullets, 'gaming')
    expect(result).toEqual(dbBullets)
    expect(result).toHaveLength(3)
  })

  it('retorna fallback estático quando array do banco tem 0 itens', () => {
    const result = getUniverseBullets([], 'gaming')
    expect(result).toEqual(STATIC_BULLETS['gaming'])
    expect(result).toHaveLength(3)
  })

  it('retorna fallback estático quando array do banco tem 2 itens (incompleto)', () => {
    const result = getUniverseBullets(['Bullet 1', 'Bullet 2'], 'gaming')
    // Array incompleto não deve ser usado — usar fallback
    expect(result).toEqual(STATIC_BULLETS['gaming'])
    expect(result).toHaveLength(3)
  })

  it('retorna fallback correto para slug "anime-nerd"', () => {
    const result = getUniverseBullets([], 'anime-nerd')
    expect(result).toEqual(STATIC_BULLETS['anime-nerd'])
  })

  it('retorna fallback correto para slug "presentes"', () => {
    const result = getUniverseBullets([], 'presentes')
    expect(result).toEqual(STATIC_BULLETS['presentes'])
  })

  it('retorna array do banco quando tem 3 itens, mesmo que diferentes do fallback', () => {
    const dbBullets = ['Custom A', 'Custom B', 'Custom C']
    const result = getUniverseBullets(dbBullets, 'presentes')
    expect(result).toEqual(dbBullets)
    expect(result).not.toEqual(STATIC_BULLETS['presentes'])
  })

  it('não muta o array original do banco', () => {
    const dbBullets = ['Item 1 banco', 'Item 2 banco', 'Item 3 banco']
    const original = [...dbBullets]
    getUniverseBullets(dbBullets, 'gaming')
    expect(dbBullets).toEqual(original)
  })
})
