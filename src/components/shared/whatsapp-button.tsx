'use client'

import { MessageCircle } from 'lucide-react'
import { motion } from 'framer-motion'

export function WhatsAppButton() {
  const phone = '55'
  const message = encodeURIComponent(
    'Olá! Vi o site e quero saber mais sobre os produtos personalizados.'
  )

  return (
    <motion.a
      href={`https://wa.me/${phone}?text=${message}`}
      target="_blank"
      rel="noopener noreferrer"
      className="group fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-green-500 text-white shadow-lg transition-all hover:scale-110 hover:shadow-green-500/30"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      aria-label="Fale conosco no WhatsApp"
      data-testid="whatsapp-button"
    >
      <MessageCircle className="h-6 w-6 transition-transform group-hover:rotate-12" />
    </motion.a>
  )
}
