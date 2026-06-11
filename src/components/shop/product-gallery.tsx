'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, ZoomIn, X, Package } from 'lucide-react'

export function ProductGallery({ images, name }: { images: string[]; name: string }) {
  const [active, setActive] = useState(0)
  const [lightbox, setLightbox] = useState(false)

  const hasImages = images && images.length > 0

  const prev = () => setActive((a) => Math.max(0, a - 1))
  const next = () => setActive((a) => Math.min((hasImages ? images.length : 1) - 1, a + 1))

  return (
    <div>
      {/* Imagem principal */}
      <div
        className="relative aspect-square cursor-zoom-in overflow-hidden rounded-2xl bg-muted"
        onClick={() => hasImages && setLightbox(true)}
      >
        {hasImages ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={images[active]}
            alt={`${name} — foto ${active + 1}`}
            className="h-full w-full object-cover transition-opacity duration-300"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-3 text-muted-foreground">
            <Package className="h-20 w-20 opacity-20" />
            <span className="text-sm opacity-40">Sem imagem</span>
          </div>
        )}

        {hasImages && (
          <>
            <button
              className="absolute right-3 top-3 rounded-lg bg-background/80 p-2 backdrop-blur transition-colors hover:bg-background"
              onClick={(e) => { e.stopPropagation(); setLightbox(true) }}
              aria-label="Ampliar"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
            {/* Setas quando há mais de 1 foto */}
            {images.length > 1 && (
              <>
                <button
                  className="absolute left-3 top-1/2 -translate-y-1/2 rounded-lg bg-background/80 p-2 backdrop-blur transition-colors hover:bg-background disabled:opacity-30"
                  onClick={(e) => { e.stopPropagation(); prev() }}
                  disabled={active === 0}
                  aria-label="Foto anterior"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  className="absolute right-12 top-1/2 -translate-y-1/2 rounded-lg bg-background/80 p-2 backdrop-blur transition-colors hover:bg-background disabled:opacity-30"
                  onClick={(e) => { e.stopPropagation(); next() }}
                  disabled={active === images.length - 1}
                  aria-label="Próxima foto"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}
            {/* Indicador de posição */}
            {images.length > 1 && (
              <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
                {images.map((_, i) => (
                  <button
                    key={i}
                    onClick={(e) => { e.stopPropagation(); setActive(i) }}
                    className={`h-1.5 rounded-full transition-all ${i === active ? 'w-5 bg-primary' : 'w-1.5 bg-background/70'}`}
                    aria-label={`Foto ${i + 1}`}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Thumbnails */}
      {hasImages && images.length > 1 && (
        <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
          {images.map((url, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 transition-all ${
                i === active
                  ? 'border-primary shadow-md'
                  : 'border-transparent opacity-60 hover:opacity-100'
              }`}
              aria-label={`Ver foto ${i + 1}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt={`${name} — miniatura ${i + 1}`}
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightbox && hasImages && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
          onClick={() => setLightbox(false)}
        >
          <button
            className="absolute right-4 top-4 rounded-xl bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
            onClick={() => setLightbox(false)}
            aria-label="Fechar"
          >
            <X className="h-6 w-6" />
          </button>

          {images.length > 1 && (
            <button
              className="absolute left-4 top-1/2 -translate-y-1/2 rounded-xl bg-white/10 p-3 text-white transition-colors hover:bg-white/20 disabled:opacity-20"
              onClick={(e) => { e.stopPropagation(); prev() }}
              disabled={active === 0}
              aria-label="Foto anterior"
            >
              <ChevronLeft className="h-7 w-7" />
            </button>
          )}

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={images[active]}
            alt={`${name} — foto ${active + 1}`}
            className="max-h-[85vh] max-w-[85vw] rounded-xl object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />

          {images.length > 1 && (
            <button
              className="absolute right-4 top-1/2 -translate-y-1/2 rounded-xl bg-white/10 p-3 text-white transition-colors hover:bg-white/20 disabled:opacity-20"
              onClick={(e) => { e.stopPropagation(); next() }}
              disabled={active === images.length - 1}
              aria-label="Próxima foto"
            >
              <ChevronRight className="h-7 w-7" />
            </button>
          )}

          {images.length > 1 && (
            <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-2">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); setActive(i) }}
                  className={`h-2 rounded-full transition-all ${i === active ? 'w-6 bg-white' : 'w-2 bg-white/40'}`}
                  aria-label={`Foto ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
