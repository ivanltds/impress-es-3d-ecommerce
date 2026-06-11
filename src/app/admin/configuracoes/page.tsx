'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { MessageCircle, MapPin, Save, Check } from 'lucide-react'

export default function ConfiguracoesPage() {
  const [whatsappPhone, setWhatsappPhone] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetch('/api/admin/settings')
      .then((r) => r.json())
      .then((data) => { setWhatsappPhone(data.whatsappPhone ?? ''); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    await fetch('/api/admin/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ whatsappPhone }),
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="font-heading text-2xl font-bold">Configurações</h1>
      <p className="mt-1 text-sm text-muted-foreground">Ajustes gerais da loja</p>

      {/* Navegação entre sub-seções */}
      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href="/admin/configuracoes/enderecos"
          className="flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors hover:bg-muted"
        >
          <MapPin className="h-4 w-4" />
          Endereços de envio
        </Link>
      </div>

      {/* WhatsApp */}
      <form onSubmit={handleSave} className="mt-8 rounded-xl border p-5 space-y-4">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-green-500" />
          <h2 className="font-semibold">WhatsApp</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Número usado nos botões &quot;Fale conosco&quot; e &quot;Enviar pelo WhatsApp&quot; do site. Inclua o código do país sem o <code className="rounded bg-muted px-1 text-xs">+</code> (ex: <code className="rounded bg-muted px-1 text-xs">5511999999999</code>).
        </p>

        {loading ? (
          <div className="h-10 w-full animate-pulse rounded-xl bg-muted" />
        ) : (
          <div className="flex gap-2">
            <div className="relative flex-1">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">+</span>
              <input
                type="text"
                inputMode="numeric"
                value={whatsappPhone}
                onChange={(e) => setWhatsappPhone(e.target.value.replace(/\D/g, ''))}
                placeholder="5511999999999"
                className="w-full rounded-xl border py-2.5 pl-7 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <button
              type="submit"
              disabled={saving}
              className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all ${
                saved
                  ? 'bg-green-500 text-white'
                  : 'bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50'
              }`}
            >
              {saved ? <><Check className="h-4 w-4" /> Salvo!</> : <><Save className="h-4 w-4" /> {saving ? 'Salvando...' : 'Salvar'}</>}
            </button>
          </div>
        )}

        {whatsappPhone && (
          <a
            href={`https://wa.me/${whatsappPhone}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-green-600 hover:underline"
          >
            <MessageCircle className="h-3.5 w-3.5" />
            Testar link: wa.me/{whatsappPhone}
          </a>
        )}
      </form>
    </div>
  )
}
