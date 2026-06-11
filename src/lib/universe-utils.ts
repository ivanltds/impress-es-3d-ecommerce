// src/lib/universe-utils.ts
// Logica pura para universos - sem side-effects, sem I/O.

import { UNIVERSE_CONFIG } from '@/config/universes'

const VALID_UNIVERSE_SLUGS = ['gaming', 'anime-nerd', 'casa-decor', 'presentes', 'auto']

// Fallback de bullets quando banco nao tem exatamente 3 itens
const UNIVERSE_BULLETS_FALLBACK: Record<string, string[]> = {
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
  'casa-decor': [
    'Vasos, porta-retratos e objetos decorativos',
    'Itens personalizados com nome ou data especial',
    'Design exclusivo que combina com qualquer ambiente',
  ],
  presentes: [
    'Presentes únicos impossíveis de achar em loja comum',
    'Personalização com nome, data ou mensagem especial',
    'Para todas as ocasiões e perfis de presenteados',
  ],
  auto: [
    'Emblemas, chaveiros e porta-chaves automotivos',
    'Decoração interna personalizada',
    'Em breve — cadastre-se para ser avisado',
  ],
}

/**
 * Retorna a tagline do universo: prefere o valor do banco, cai para o config estatico.
 * String vazia no banco e tratada como nula (usa fallback).
 */
export function getUniverseTagline(
  dbTagline: string | null | undefined,
  slug: string
): string {
  if (dbTagline && dbTagline.trim().length > 0) return dbTagline
  return UNIVERSE_CONFIG[slug]?.tagline ?? ''
}

/**
 * Retorna os bullets do universo: prefere o banco quando tem exatamente 3 itens,
 * caso contrario usa o fallback estatico.
 */
export function getUniverseBullets(
  dbBullets: string[] | null | undefined,
  slug: string
): string[] {
  if (dbBullets && dbBullets.length === 3) return [...dbBullets]
  return UNIVERSE_BULLETS_FALLBACK[slug] ?? []
}

/**
 * Reordena universos colocando o preferido no indice 0.
 * Nao muta o array original. Se a preferencia nao existe na lista, retorna ordem original.
 */
export function sortUniversesByPreference<T extends { slug: string }>(
  universes: T[],
  preferredSlug: string | null
): T[] {
  if (!preferredSlug) return [...universes]

  const idx = universes.findIndex((u) => u.slug === preferredSlug)
  if (idx <= 0) return [...universes]

  const result = [...universes]
  const [preferred] = result.splice(idx, 1)
  result.unshift(preferred)
  return result
}

/**
 * Constroi URL do WhatsApp com mensagem encodada.
 * Retorna null se phone for vazio/null/undefined.
 */
export function buildWhatsappUrl(phone: string, message: string): string | null {
  if (!phone) return null
  const encoded = encodeURIComponent(message)
  return `https://wa.me/${phone}?text=${encoded}`
}

/**
 * Determina a preferencia de universo do usuario combinando sessao (DB) e cookie.
 * Prioridade: DB (preferredCollection) > cookie.
 * Se o slug do cookie nao for valido, retorna null (slug desconhecido descartado).
 */
export function getUniversePreference(
  session: { user?: { preferredCollection?: string | null } } | null | undefined,
  cookieValue: string | null | undefined
): string | null {
  // 1. Tenta DB (usuario logado com preferencia definida)
  const dbPref = session?.user?.preferredCollection
  if (dbPref) return dbPref

  // 2. Fallback para cookie
  const cookie = cookieValue ?? null
  if (!cookie) return null

  // Validacao: slugs desconhecidos sao descartados
  if (!VALID_UNIVERSE_SLUGS.includes(cookie)) return null

  return cookie
}
