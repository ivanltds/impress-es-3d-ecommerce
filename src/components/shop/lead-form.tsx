'use client'

import { useState } from 'react'
import { X, Send, Sparkles, MessageCircle } from 'lucide-react'

export function LeadForm({ onClose }: { onClose?: () => void }) {
  const [name, setName] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [collection, setCollection] = useState('')
  const [message, setMessage] = useState('')
  const [sent, setSent] = useState(false)

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const lead = {
      id: Date.now().toString(),
      name,
      phone: whatsapp,
      interestCollection: collection,
      message,
      source: 'website',
      status: 'novo',
      createdAt: new Date().toISOString(),
    }
    const existing = JSON.parse(localStorage.getItem('leads') || '[]')
    existing.push(lead)
    localStorage.setItem('leads', JSON.stringify(existing))
    setSent(true)
    if (onClose) setTimeout(onClose, 2000)
  }

  if (sent) {
    return (
      <div className="rounded-2xl border bg-card p-8 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <Send className="h-8 w-8 text-green-600" />
        </div>
        <h3 className="mt-4 font-heading text-xl font-bold">Recebemos seu pedido!</h3>
        <p className="mt-2 text-sm text-muted-foreground">Entraremos em contato pelo WhatsApp em até 24h.</p>
      </div>
    )
  }

  return (
    <div className="relative rounded-2xl border bg-card p-8" data-testid="lead-form">
      {onClose && (
        <button onClick={onClose} className="absolute right-4 top-4 rounded-lg p-1 hover:bg-muted">
          <X className="h-5 w-5" />
        </button>
      )}
      <div className="flex items-center gap-2 mb-6">
        <Sparkles className="h-5 w-5 text-primary" />
        <h3 className="font-heading text-lg font-bold">Quero Algo Personalizado</h3>
      </div>
      <form onSubmit={submit} className="space-y-4">
        <input placeholder="Seu nome" value={name} onChange={(e) => setName(e.target.value)} required className="w-full rounded-lg border px-4 py-2.5 text-sm" />
        <input placeholder="WhatsApp (com DDD)" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} required className="w-full rounded-lg border px-4 py-2.5 text-sm" />
        <select value={collection} onChange={(e) => setCollection(e.target.value)} className="w-full rounded-lg border px-4 py-2.5 text-sm">
          <option value="">Qual coleção te interessa?</option>
          <option value="gamer">Gamer Energy</option>
          <option value="anime">Anime Pop</option>
          <option value="home">Casa & Utilidades</option>
          <option value="gifts">Presentes Personalizados</option>
          <option value="auto">Auto Vintage</option>
        </select>
        <textarea placeholder="Descreva o que você imagina..." value={message} onChange={(e) => setMessage(e.target.value)} required rows={3} className="w-full rounded-lg border px-4 py-2.5 text-sm" />
        <button type="submit" className="flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground transition-all hover:scale-105">
          Enviar <MessageCircle className="h-4 w-4" />
        </button>
      </form>
    </div>
  )
}
