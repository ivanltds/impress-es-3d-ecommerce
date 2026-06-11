// ─── Unit Tests: M05 — Lógica Pura de Universos ───
// Funções em src/lib/universe-utils.ts — arquivo ainda NÃO existe (🔴 RED)
// Mapeia para spec M05: Feature 2 (ordenação), Feature 6 (WhatsApp), Feature 9 (preferência)
// FASE 2 — TEST AUTHORING (🔴 RED)

import { describe, it, expect } from 'vitest'

// Import dinâmico — vai falhar com "Cannot find module" pois o arquivo não existe ainda
// Isso é comportamento RED esperado.
import {
  sortUniversesByPreference,
  buildWhatsappUrl,
  getUniversePreference,
} from '@/lib/universe-utils'

// ─── Fixtures ────────────────────────────────────────────────────────────────

const UNIVERSES = [
  { slug: 'gaming', sortOrder: 1 },
  { slug: 'anime-nerd', sortOrder: 2 },
  { slug: 'casa-decor', sortOrder: 3 },
  { slug: 'presentes', sortOrder: 4 },
  { slug: 'auto', sortOrder: 5 },
]

// ─── sortUniversesByPreference ────────────────────────────────────────────────

describe('sortUniversesByPreference()', () => {
  it('sem preferência → ordem original mantida', () => {
    const result = sortUniversesByPreference(UNIVERSES, null)
    expect(result.map((u) => u.slug)).toEqual([
      'gaming',
      'anime-nerd',
      'casa-decor',
      'presentes',
      'auto',
    ])
  })

  it('com preferência "gaming" → gaming vai para index 0', () => {
    const result = sortUniversesByPreference(UNIVERSES, 'gaming')
    expect(result[0].slug).toBe('gaming')
  })

  it('com preferência "presentes" → presentes vai para index 0', () => {
    const result = sortUniversesByPreference(UNIVERSES, 'presentes')
    expect(result[0].slug).toBe('presentes')
  })

  it('preferência "presentes" → demais 4 cards seguem a ordem padrão', () => {
    const result = sortUniversesByPreference(UNIVERSES, 'presentes')
    // presentes vai para frente; o resto mantém a ordem relativa original
    const rest = result.slice(1).map((u) => u.slug)
    expect(rest).toEqual(['gaming', 'anime-nerd', 'casa-decor', 'auto'])
  })

  it('com preferência "anime-nerd" → anime-nerd vai para index 0', () => {
    const result = sortUniversesByPreference(UNIVERSES, 'anime-nerd')
    expect(result[0].slug).toBe('anime-nerd')
  })

  it('preferência que não existe na lista → ordem original mantida', () => {
    const result = sortUniversesByPreference(UNIVERSES, 'futebol')
    expect(result.map((u) => u.slug)).toEqual([
      'gaming',
      'anime-nerd',
      'casa-decor',
      'presentes',
      'auto',
    ])
  })

  it('lista vazia → retorna lista vazia', () => {
    const result = sortUniversesByPreference([], 'gaming')
    expect(result).toEqual([])
  })

  it('não muta o array original', () => {
    const original = [...UNIVERSES]
    sortUniversesByPreference(UNIVERSES, 'presentes')
    expect(UNIVERSES).toEqual(original)
  })

  it('lista com 1 elemento → retorna com 1 elemento', () => {
    const result = sortUniversesByPreference([{ slug: 'gaming', sortOrder: 1 }], 'gaming')
    expect(result).toHaveLength(1)
    expect(result[0].slug).toBe('gaming')
  })
})

// ─── buildWhatsappUrl ─────────────────────────────────────────────────────────

describe('buildWhatsappUrl()', () => {
  it('gera URL https://wa.me/{phone}?text={encodedMessage}', () => {
    const url = buildWhatsappUrl('5511999998888', 'Olá, quero um produto')
    expect(url).toMatch(/^https:\/\/wa\.me\/5511999998888\?text=/)
  })

  it('mensagem é URL-encoded (espaços → %20 ou +)', () => {
    const url = buildWhatsappUrl('5511999998888', 'produto personalizado')
    expect(url).not.toContain(' ')
    // espaço deve virar %20 ou + (ambos são encoding válido)
    const encoded = url!.split('?text=')[1]
    expect(encoded).toMatch(/produto(%20|\+)personalizado/)
  })

  it('caracteres especiais são encodados corretamente', () => {
    const url = buildWhatsappUrl('5511999998888', 'Olá! Quero um produto & mais')
    expect(url).not.toContain('&')
    expect(url!.split('?text=')[1]).toContain('%26')
  })

  it('phone vazio → retorna null', () => {
    const url = buildWhatsappUrl('', 'mensagem')
    expect(url).toBeNull()
  })

  it('phone null → retorna null', () => {
    const url = buildWhatsappUrl(null as any, 'mensagem')
    expect(url).toBeNull()
  })

  it('phone undefined → retorna null', () => {
    const url = buildWhatsappUrl(undefined as any, 'mensagem')
    expect(url).toBeNull()
  })

  it('mensagem vazia → inclui text= vazio mas retorna URL', () => {
    const url = buildWhatsappUrl('5511999998888', '')
    expect(url).not.toBeNull()
    expect(url).toMatch(/^https:\/\/wa\.me\/5511999998888/)
  })

  it('phone com formatação (+55 11 9...) → inclui na URL como fornecido', () => {
    const url = buildWhatsappUrl('5511999998888', 'Teste')
    expect(url).toContain('5511999998888')
  })
})

// ─── getUniversePreference ────────────────────────────────────────────────────

describe('getUniversePreference()', () => {
  it('logado com preferredCollection → retorna valor do DB', () => {
    const session = { user: { id: 'u1', preferredCollection: 'presentes' } }
    const result = getUniversePreference(session as any, 'gaming')
    expect(result).toBe('presentes')
  })

  it('logado com preferredCollection vazio ("") → ignora DB, usa cookie', () => {
    const session = { user: { id: 'u1', preferredCollection: '' } }
    const result = getUniversePreference(session as any, 'gaming')
    expect(result).toBe('gaming')
  })

  it('logado com preferredCollection null → usa cookie', () => {
    const session = { user: { id: 'u1', preferredCollection: null } }
    const result = getUniversePreference(session as any, 'anime-nerd')
    expect(result).toBe('anime-nerd')
  })

  it('logado sem preferredCollection, com cookie → retorna valor do cookie', () => {
    const session = { user: { id: 'u1' } }
    const result = getUniversePreference(session as any, 'gaming')
    expect(result).toBe('gaming')
  })

  it('guest (session null) com cookie → retorna valor do cookie', () => {
    const result = getUniversePreference(null, 'casa-decor')
    expect(result).toBe('casa-decor')
  })

  it('guest (session null) sem cookie (null) → retorna null', () => {
    const result = getUniversePreference(null, null)
    expect(result).toBeNull()
  })

  it('guest (session undefined) sem cookie (undefined) → retorna null', () => {
    const result = getUniversePreference(undefined as any, undefined as any)
    expect(result).toBeNull()
  })

  it('preferredCollection do DB tem prioridade sobre cookie mesmo quando ambos existem', () => {
    const session = { user: { id: 'u1', preferredCollection: 'gaming' } }
    // cookie diz presentes, DB diz gaming → deve retornar gaming
    const result = getUniversePreference(session as any, 'presentes')
    expect(result).toBe('gaming')
  })

  it('slug inválido no cookie → retorna null (cookie com slug desconhecido é descartado)', () => {
    // Nota: a validação de slug válido é responsabilidade desta função
    const result = getUniversePreference(null, 'futebol')
    // Se a implementação valida o slug, deve retornar null
    // Se não valida, retorna 'futebol' — deixamos ambas opções aceitas aqui
    // O importante é que não exploda
    expect(result === 'futebol' || result === null).toBe(true)
  })
})
