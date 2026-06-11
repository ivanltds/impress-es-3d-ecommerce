'use client'

import { useState, useRef, useEffect } from 'react'

interface UniverseRow {
  id: string
  slug: string
  name: string
  comingSoon: boolean
  sortOrder: number
  cardImageUrl: string | null
  heroImageUrl: string | null
  tagline: string | null
  bullets: string[]
}

interface Props {
  universes: UniverseRow[]
}

interface FormState {
  tagline: string
  bullets: [string, string, string]
  cardFile: File | null
  heroFile: File | null
}

interface ErrorState {
  tagline?: string
  bullet0?: string
  bullet1?: string
  bullet2?: string
  cardImage?: string
  heroImage?: string
}

function StatusIcon({ filled }: { filled: boolean }) {
  return (
    <span
      className="inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold"
      style={{
        background: filled ? '#16a34a20' : '#64748b20',
        color: filled ? '#16a34a' : '#64748b',
        border: `1px solid ${filled ? '#16a34a40' : '#64748b40'}`,
      }}
    >
      {filled ? 'S' : 'N'}
    </span>
  )
}

function UniversoRowItem({
  universe,
  onToast,
}: {
  universe: UniverseRow
  onToast: (msg: string) => void
}) {
  const [open, setOpen] = useState(false)
  const [cardImageUrl, setCardImageUrl] = useState<string | null>(universe.cardImageUrl)
  const [heroImageUrl, setHeroImageUrl] = useState<string | null>(universe.heroImageUrl)
  const [saving, setSaving] = useState(false)
  const [uploadingCard, setUploadingCard] = useState(false)
  const [uploadingHero, setUploadingHero] = useState(false)

  const [form, setForm] = useState<FormState>({
    tagline: universe.tagline ?? '',
    bullets: [
      universe.bullets[0] ?? '',
      universe.bullets[1] ?? '',
      universe.bullets[2] ?? '',
    ],
    cardFile: null,
    heroFile: null,
  })

  const [errors, setErrors] = useState<ErrorState>({})

  const cardInputRef = useRef<HTMLInputElement>(null)
  const heroInputRef = useRef<HTMLInputElement>(null)

  function validateText(): ErrorState {
    const errs: ErrorState = {}
    if (!form.tagline.trim()) {
      errs.tagline = 'A tagline não pode ser vazia'
    } else if (form.tagline.length > 120) {
      errs.tagline = 'Máximo de 120 caracteres'
    }
    for (let i = 0; i < 3; i++) {
      const b = form.bullets[i]
      if (b.length < 5) {
        (errs as any)[`bullet${i}`] = 'Mínimo de 5 caracteres por bullet'
      } else if (b.length > 100) {
        (errs as any)[`bullet${i}`] = 'Máximo de 100 caracteres por bullet'
      }
    }
    return errs
  }

  const hasTextErrors = Boolean(
    (!form.tagline.trim()) ||
    form.tagline.length > 120 ||
    form.bullets.some((b) => b.length > 100) ||
    form.bullets.some((b) => b.length < 5)
  )

  async function handleSaveText() {
    const errs = validateText()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }
    setErrors({})
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/universes/${universe.slug}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tagline: form.tagline, bullets: form.bullets }),
      })
      if (!res.ok) {
        const body = await res.json()
        setErrors({ tagline: body.error })
        return
      }
      onToast('Conteúdo atualizado com sucesso')
    } finally {
      setSaving(false)
    }
  }

  async function handleUploadCard() {
    if (!form.cardFile) return
    const file = form.cardFile
    if (file.type !== 'image/png') {
      setErrors((e) => ({ ...e, cardImage: 'Apenas PNG é aceito (transparência obrigatória)' }))
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrors((e) => ({ ...e, cardImage: 'Arquivo muito grande. Máximo permitido: 5 MB' }))
      return
    }
    setErrors((e) => ({ ...e, cardImage: undefined }))
    setUploadingCard(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('type', 'card')
      const res = await fetch(`/api/admin/universes/${universe.slug}/upload`, {
        method: 'POST',
        body: fd,
      })
      if (!res.ok) {
        const body = await res.json()
        setErrors((e) => ({ ...e, cardImage: body.error }))
        return
      }
      const body = await res.json()
      setCardImageUrl(body.cardImageUrl)
      onToast('Imagem do card atualizada')
    } finally {
      setUploadingCard(false)
    }
  }

  async function handleUploadHero() {
    if (!form.heroFile) return
    const file = form.heroFile
    if (file.type !== 'image/png') {
      setErrors((e) => ({ ...e, heroImage: 'Apenas PNG é aceito (transparência obrigatória)' }))
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrors((e) => ({ ...e, heroImage: 'Arquivo muito grande. Máximo permitido: 5 MB' }))
      return
    }
    setErrors((e) => ({ ...e, heroImage: undefined }))
    setUploadingHero(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('type', 'hero')
      const res = await fetch(`/api/admin/universes/${universe.slug}/upload`, {
        method: 'POST',
        body: fd,
      })
      if (!res.ok) {
        const body = await res.json()
        setErrors((e) => ({ ...e, heroImage: body.error }))
        return
      }
      const body = await res.json()
      setHeroImageUrl(body.heroImageUrl)
      onToast('Imagem hero atualizada')
    } finally {
      setUploadingHero(false)
    }
  }

  return (
    <div
      data-testid={`universo-row-${universe.slug}`}
      className="rounded-xl border bg-card"
      style={{ borderColor: 'rgba(255,255,255,0.08)' }}
    >
      {/* Row header */}
      <div className="flex items-center gap-4 px-4 py-3">
        <div className="flex-1">
          <span className="font-semibold text-sm">{universe.name}</span>
          {universe.comingSoon && (
            <span className="ml-2 text-xs text-muted-foreground">(Em breve)</span>
          )}
        </div>

        {/* Status indicators */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <span data-testid={`status-card-image-${universe.slug}`}>
              <StatusIcon filled={!!cardImageUrl} />
            </span>
            Card
          </span>
          <span className="flex items-center gap-1">
            <span data-testid={`status-hero-image-${universe.slug}`}>
              <StatusIcon filled={!!heroImageUrl} />
            </span>
            Hero
          </span>
          <span className="flex items-center gap-1">
            <span data-testid={`status-tagline-${universe.slug}`}>
              <StatusIcon filled={!!universe.tagline} />
            </span>
            Tagline
          </span>
        </div>

        <button
          onClick={() => setOpen((o) => !o)}
          className="text-xs px-3 py-1.5 rounded-lg font-medium transition-colors"
          style={{
            background: open ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.06)',
            color: open ? '#818cf8' : '#94a3b8',
          }}
        >
          {open ? 'Fechar' : 'Editar'}
        </button>
      </div>

      {/* Edit panel */}
      {open && (
        <div
          className="px-4 pb-4 pt-2 border-t space-y-5"
          style={{ borderColor: 'rgba(255,255,255,0.06)' }}
        >
          {/* Text fields */}
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">
                Tagline
              </label>
              <input
                data-testid="input-tagline"
                type="text"
                value={form.tagline}
                onChange={(e) => {
                  setForm((f) => ({ ...f, tagline: e.target.value }))
                  if (errors.tagline) setErrors((er) => ({ ...er, tagline: undefined }))
                }}
                maxLength={130}
                className="w-full rounded-lg px-3 py-2 text-sm bg-background border focus:outline-none focus:ring-2 focus:ring-indigo-500"
                style={{ borderColor: errors.tagline ? '#ef4444' : 'rgba(255,255,255,0.12)' }}
                placeholder="Ex: Setup com atitude."
              />
              {errors.tagline && (
                <p data-testid="error-tagline" className="text-xs text-red-400 mt-1">
                  {errors.tagline}
                </p>
              )}
            </div>

            {([0, 1, 2] as const).map((i) => (
              <div key={i}>
                <label className="text-xs font-medium text-muted-foreground block mb-1">
                  Bullet {i + 1}
                </label>
                <input
                  data-testid={`input-bullet-${i}`}
                  type="text"
                  value={form.bullets[i]}
                  onChange={(e) => {
                    const val = e.target.value
                    setForm((f) => {
                      const b = [...f.bullets] as [string, string, string]
                      b[i] = val
                      return { ...f, bullets: b }
                    })
                    if ((errors as any)[`bullet${i}`]) {
                      setErrors((er) => ({ ...er, [`bullet${i}`]: undefined }))
                    }
                  }}
                  maxLength={110}
                  className="w-full rounded-lg px-3 py-2 text-sm bg-background border focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  style={{
                    borderColor: (errors as any)[`bullet${i}`]
                      ? '#ef4444'
                      : 'rgba(255,255,255,0.12)',
                  }}
                />
                {(errors as any)[`bullet${i}`] && (
                  <p data-testid={`error-bullet-${i}`} className="text-xs text-red-400 mt-1">
                    {(errors as any)[`bullet${i}`]}
                  </p>
                )}
              </div>
            ))}

            <button
              data-testid="btn-save-text"
              onClick={handleSaveText}
              disabled={saving || hasTextErrors}
              className="px-4 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: '#6366f1', color: '#fff' }}
            >
              {saving ? 'Salvando...' : 'Salvar texto'}
            </button>
          </div>

          {/* Card image upload */}
          <div
            className="pt-3 border-t space-y-2"
            style={{ borderColor: 'rgba(255,255,255,0.06)' }}
          >
            <p className="text-xs font-medium text-muted-foreground">Imagem do card (PNG)</p>
            {cardImageUrl && (
              <img
                data-testid="preview-card-image"
                src={cardImageUrl}
                alt={universe.name}
                className="w-16 h-16 object-contain rounded border"
                style={{ borderColor: 'rgba(255,255,255,0.1)' }}
              />
            )}
            <div className="flex items-center gap-2">
              <input
                data-testid="input-card-image"
                ref={cardInputRef}
                type="file"
                accept="image/png"
                className="text-xs"
                onChange={(e) => {
                  const f = e.target.files?.[0] ?? null
                  setForm((prev) => ({ ...prev, cardFile: f }))
                  setErrors((er) => ({ ...er, cardImage: undefined }))
                }}
              />
              <button
                data-testid="btn-upload-card"
                onClick={handleUploadCard}
                disabled={uploadingCard || !form.cardFile}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                style={{ background: '#475569', color: '#fff' }}
              >
                {uploadingCard ? 'Enviando...' : 'Enviar'}
              </button>
            </div>
            {errors.cardImage && (
              <p data-testid="error-card-image" className="text-xs text-red-400">
                {errors.cardImage}
              </p>
            )}
          </div>

          {/* Hero image upload */}
          <div
            className="pt-3 border-t space-y-2"
            style={{ borderColor: 'rgba(255,255,255,0.06)' }}
          >
            <p className="text-xs font-medium text-muted-foreground">Imagem hero (PNG)</p>
            {heroImageUrl && (
              <img
                data-testid="preview-hero-image"
                src={heroImageUrl}
                alt={universe.name}
                className="w-24 h-16 object-contain rounded border"
                style={{ borderColor: 'rgba(255,255,255,0.1)' }}
              />
            )}
            <div className="flex items-center gap-2">
              <input
                data-testid="input-hero-image"
                ref={heroInputRef}
                type="file"
                accept="image/png"
                className="text-xs"
                onChange={(e) => {
                  const f = e.target.files?.[0] ?? null
                  setForm((prev) => ({ ...prev, heroFile: f }))
                  setErrors((er) => ({ ...er, heroImage: undefined }))
                }}
              />
              <button
                data-testid="btn-upload-hero"
                onClick={handleUploadHero}
                disabled={uploadingHero || !form.heroFile}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                style={{ background: '#475569', color: '#fff' }}
              >
                {uploadingHero ? 'Enviando...' : 'Enviar'}
              </button>
            </div>
            {errors.heroImage && (
              <p data-testid="error-hero-image" className="text-xs text-red-400">
                {errors.heroImage}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export function UniversosAdmin({ universes }: Props) {
  const [toastMsg, setToastMsg] = useState<string | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  function showToast(msg: string) {
    setToastMsg(msg)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setToastMsg(null), 3000)
  }

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  return (
    <div>
      {toastMsg && (
        <div
          data-testid="toast-success"
          className="fixed bottom-6 right-6 z-50 rounded-xl px-4 py-3 text-sm font-semibold shadow-xl"
          style={{ background: '#16a34a', color: '#fff' }}
        >
          {toastMsg}
        </div>
      )}

      <div data-testid="admin-universos-list" className="space-y-3">
        {universes.map((u) => (
          <UniversoRowItem key={u.slug} universe={u} onToast={showToast} />
        ))}
      </div>
    </div>
  )
}
