'use client'

import { useState, useRef } from 'react'
import { Upload, X, Image as ImageIcon, AlertTriangle } from 'lucide-react'

interface Props {
  images: string[]
  onChange: (urls: string[]) => void
}

export function ImageUpload({ images, onChange }: Props) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    // Client-side validation
    if (!file.type.startsWith('image/')) {
      setError('Apenas imagens são permitidas')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Imagem muito grande. Máximo: 5MB')
      return
    }

    setUploading(true)
    setError('')

    const form = new FormData()
    form.append('file', file)

    try {
      const res = await fetch('/api/admin/upload', { method: 'POST', body: form })
      const data = await res.json()
      if (res.ok) {
        onChange([...images, data.url])
      } else {
        setError(data.error || 'Erro no upload')
      }
    } catch {
      setError('Erro ao conectar com o servidor')
    }
    setUploading(false)
  }

  function remove(index: number) {
    onChange(images.filter((_, i) => i !== index))
  }

  return (
    <div>
      <label className="block text-sm font-medium mb-2">Imagens do Produto</label>

      {/* Current images */}
      {images.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-3">
          {images.map((url, i) => (
            <div key={i} className="group relative h-24 w-24 overflow-hidden rounded-lg border bg-muted">
              {url.startsWith('http') || url.startsWith('/') ? (
                <img src={url} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center"><ImageIcon className="h-8 w-8 text-muted-foreground/40" /></div>
              )}
              <button
                type="button"
                onClick={() => remove(i)}
                className="absolute right-1 top-1 rounded-full bg-red-500 p-0.5 text-white opacity-0 transition-opacity group-hover:opacity-100"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload button */}
      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={handleFile} className="hidden" />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="flex items-center gap-2 rounded-lg border-2 border-dashed px-4 py-3 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-primary disabled:opacity-50"
      >
        {uploading ? (
          <>⏳ Enviando...</>
        ) : (
          <><Upload className="h-4 w-4" /> Selecionar Imagem</>
        )}
      </button>

      {error && (
        <p className="mt-2 flex items-center gap-1 text-xs text-red-500">
          <AlertTriangle className="h-3 w-3" /> {error}
        </p>
      )}
      <p className="mt-1 text-xs text-muted-foreground">JPG, PNG, WebP ou GIF. Máximo 5MB.</p>
    </div>
  )
}
