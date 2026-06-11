'use client'
// Client Component — WhatsApp CTA button
// Renders null if whatsappPhone is empty

import { buildWhatsappUrl } from '@/lib/universe-utils'

interface Props {
  whatsappPhone: string
  context?: string
  universeName?: string
  universeWhatsappMessage?: string
}

export function WhatsAppCTA({ whatsappPhone, universeName, universeWhatsappMessage }: Props) {
  if (!whatsappPhone) return null

  const message = universeWhatsappMessage
    || ('Ola! Tenho interesse em produtos personalizados' + (universeName ? ' de ' + universeName : '') + '!')

  const url = buildWhatsappUrl(whatsappPhone, message)
  if (!url) return null

  return (
    <section data-testid="cta-whatsapp-section" className="py-12 text-center">
      <h2 className="text-2xl font-bold mb-4">Ficou com duvida?</h2>
      <p className="text-gray-600 mb-8">Fale com a gente pelo WhatsApp</p>
      <a
        data-testid="btn-whatsapp"
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-8 rounded-lg text-lg transition-colors"
      >
        Falar no WhatsApp
      </a>
    </section>
  )
}
