// ─── Unit Tests: M06 — src/lib/analytics.ts (trackEvent) ───
// Spec: specs/M06-customer-area.spec.md — Feature 6 (Cenários 6.1, 6.2, 6.3, 6.5)
// FASE 2 — TEST AUTHORING (🔴 RED)
// O módulo @/lib/analytics ainda não existe — os imports dinâmicos falham com
// "Cannot find module" (padrão RED estabelecido em m05-user-preference.test.ts).
//
// Contrato (arquitetura M06, seção 6 — DA-M06-05):
//   trackEvent(event: AnalyticsEventName, payload: AnalyticsPayload): void
//   - console.log('[analytics]', { event, ...payload, timestamp: ISO 8601 })
//   - nunca lança exceção (RN-M06-13)
//   - emitido apenas após sucesso da API (RN-M06-14 — coberto nos testes E2E 6.4)

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const ISO_8601 = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})$/

async function loadTrackEvent() {
  const mod = await import('@/lib/analytics')
  return mod.trackEvent as (event: string, payload: Record<string, unknown>) => void
}

describe('M06-F6: trackEvent — src/lib/analytics.ts', () => {
  let logSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
  })

  afterEach(() => {
    logSpy.mockRestore()
  })

  // Cenário 6.5: função não lança exceção quando SDK externo está ausente
  it('Cenário 6.5: não lança exceção sem SDK externo configurado', async () => {
    const trackEvent = await loadTrackEvent()

    expect(() =>
      trackEvent('universe_preference_changed', {
        userId: 'user-001',
        previousUniverse: null,
        newUniverse: 'gaming',
        source: 'account_page',
      })
    ).not.toThrow()
  })

  // Cenário 6.5: evento impresso no console com dados estruturados
  it('Cenário 6.5: emite console.log estruturado com [analytics], event e timestamp ISO 8601', async () => {
    const trackEvent = await loadTrackEvent()

    trackEvent('order_detail_viewed', {
      userId: 'user-001',
      orderId: 'order-abc',
      orderStatus: 'processing',
    })

    expect(logSpy).toHaveBeenCalledTimes(1)
    const [tag, payload] = logSpy.mock.calls[0] as [string, Record<string, unknown>]
    expect(tag).toBe('[analytics]')
    expect(payload).toMatchObject({
      event: 'order_detail_viewed',
      userId: 'user-001',
      orderId: 'order-abc',
      orderStatus: 'processing',
    })
    expect(String(payload.timestamp)).toMatch(ISO_8601)
  })

  // Cenário 6.5: o fluxo do usuário não é interrompido nem se o canal de saída falhar
  it('Cenário 6.5: não propaga exceção mesmo se console.log lançar', async () => {
    const trackEvent = await loadTrackEvent()
    logSpy.mockImplementation(() => {
      throw new Error('console quebrado')
    })

    expect(() =>
      trackEvent('universe_preference_changed', {
        userId: 'user-001',
        previousUniverse: null,
        newUniverse: 'auto',
        source: 'account_page',
      })
    ).not.toThrow()
  })

  // Cenário 6.1 (formato do payload — emissão real coberta no E2E m06-universe-selector)
  it('Cenário 6.1 (formato): universe_preference_changed com source account_page', async () => {
    const trackEvent = await loadTrackEvent()

    trackEvent('universe_preference_changed', {
      userId: 'user-001',
      previousUniverse: 'gaming',
      newUniverse: 'presentes',
      source: 'account_page',
    })

    const [, payload] = logSpy.mock.calls[0] as [string, Record<string, unknown>]
    expect(payload).toMatchObject({
      event: 'universe_preference_changed',
      userId: 'user-001',
      previousUniverse: 'gaming',
      newUniverse: 'presentes',
      source: 'account_page',
    })
    expect(String(payload.timestamp)).toMatch(ISO_8601)
  })

  // Cenário 6.2 (formato do payload — emissão real coberta no E2E m06-universe-suggestion)
  it('Cenário 6.2 (formato): universe_preference_changed com source post_checkout_suggestion', async () => {
    const trackEvent = await loadTrackEvent()

    trackEvent('universe_preference_changed', {
      userId: 'user-002',
      previousUniverse: null,
      newUniverse: 'presentes',
      source: 'post_checkout_suggestion',
    })

    const [, payload] = logSpy.mock.calls[0] as [string, Record<string, unknown>]
    expect(payload).toMatchObject({
      previousUniverse: null,
      newUniverse: 'presentes',
      source: 'post_checkout_suggestion',
    })
  })

  // Cenário 6.3 (formato do payload — emissão real coberta no E2E m06-order-detail)
  it('Cenário 6.3 (formato): order_detail_viewed com userId, orderId e orderStatus', async () => {
    const trackEvent = await loadTrackEvent()

    trackEvent('order_detail_viewed', {
      userId: 'user-003',
      orderId: 'order-xyz',
      orderStatus: 'shipped',
    })

    const [, payload] = logSpy.mock.calls[0] as [string, Record<string, unknown>]
    expect(payload).toMatchObject({
      event: 'order_detail_viewed',
      userId: 'user-003',
      orderId: 'order-xyz',
      orderStatus: 'shipped',
    })
  })

  it('trackEvent é síncrona e retorna void', async () => {
    const trackEvent = await loadTrackEvent()
    const result = trackEvent('order_detail_viewed', {
      userId: 'u',
      orderId: 'o',
      orderStatus: 's',
    })
    expect(result).toBeUndefined()
  })
})
