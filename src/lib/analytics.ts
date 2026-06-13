// src/lib/analytics.ts
// Analytics instrumentation - structured console.log by default.
// To integrate external SDK (Amplitude, Segment, PostHog), replace only
// the body of trackEvent without changing any call sites.

export type AnalyticsEventName =
  | 'universe_preference_changed'
  | 'order_detail_viewed'
  | 'universe_suggestion_shown'
  | 'universe_suggestion_accepted'
  | 'universe_suggestion_dismissed'

export interface UniversePreferenceChangedPayload {
  userId: string
  previousUniverse: string | null
  newUniverse: string
  source: 'account_page' | 'post_checkout_suggestion'
}

export interface OrderDetailViewedPayload {
  userId: string
  orderId: string
  orderStatus: string
}

export interface UniverseSuggestionPayload {
  userId: string
  suggestedUniverse: string
}

export type AnalyticsPayload =
  | UniversePreferenceChangedPayload
  | OrderDetailViewedPayload
  | UniverseSuggestionPayload

/**
 * Emits an analytics event.
 * Never throws - user flow must not be interrupted (RN-M06-13, scenario 6.5).
 * Events are emitted ONLY after API success confirmation (RN-M06-14, scenario 6.4).
 */
export function trackEvent(event: AnalyticsEventName, payload: AnalyticsPayload): void {
  try {
    const enriched = {
      event,
      ...payload,
      timestamp: new Date().toISOString(),
    }
    // Default channel: structured console.log
    console.log('[analytics]', enriched)
  } catch {
    // Silence exception - never interrupt user flow (scenario 6.5)
  }
}
