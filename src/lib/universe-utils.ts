// src/lib/universe-utils.ts
// Lógica pura para universos — sem side-effects, sem I/O.

const VALID_UNIVERSE_SLUGS = ['gaming', 'anime-nerd', 'casa-decor', 'presentes', 'auto']

/**
 * Reordena universos colocando o preferido no índice 0.
 * Não muta o array original. Se a preferência não existe na lista, retorna ordem original.
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
 * Constrói URL do WhatsApp com mensagem encodada.
 * Retorna null se phone for vazio/null/undefined.
 */
export function buildWhatsappUrl(phone: string, message: string): string | null {
  if (!phone) return null
  const encoded = encodeURIComponent(message)
  return `https://wa.me/${phone}?text=${encoded}`
}

/**
 * Determina a preferência de universo do usuário combinando sessão (DB) e cookie.
 * Prioridade: DB (preferredCollection) > cookie.
 * Se o slug do cookie não for válido, retorna null (slug desconhecido descartado).
 */
export function getUniversePreference(
  session: { user?: { preferredCollection?: string | null } } | null | undefined,
  cookieValue: string | null | undefined
): string | null {
  // 1. Tenta DB (usuário logado com preferência definida)
  const dbPref = session?.user?.preferredCollection
  if (dbPref) return dbPref

  // 2. Fallback para cookie
  const cookie = cookieValue ?? null
  if (!cookie) return null

  // Validação: slugs desconhecidos são descartados
  if (!VALID_UNIVERSE_SLUGS.includes(cookie)) return null

  return cookie
}
