'use client'

// ─── F7.5: WhatsApp Floating Button ───
export function WhatsAppButton() {
  const phone = '55' // placeholder — replace with actual WhatsApp number
  const message = encodeURIComponent('Olá! Vi o site e quero saber mais sobre os produtos personalizados.')

  return (
    <a
      href={`https://wa.me/${phone}?text=${message}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-green-500 text-white shadow-lg transition-transform hover:scale-110"
      aria-label="Fale conosco no WhatsApp"
      data-testid="whatsapp-button"
    >
      <span className="text-2xl">💬</span>
    </a>
  )
}
