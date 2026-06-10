'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export function ProductGallery({ images, name }: { images: string[]; name: string }) {
  const [active, setActive] = useState(0)
  const [lightbox, setLightbox] = useState(false)

  const displayImages = images.length > 0 ? images : ['/placeholder-product.jpg']

  return (
    <div>
      {/* Main Image */}
      <div
        className="relative aspect-square cursor-pointer overflow-hidden rounded-2xl bg-muted"
        onClick={() => setLightbox(true)}
      >
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/5 to-purple-500/5 text-8xl text-primary/20">
          📦
        </div>
        <button className="absolute right-4 top-4 rounded-lg bg-background/80 p-2 backdrop-blur transition-colors hover:bg-background">
          <ZoomIn className="h-5 w-5" />
        </button>
      </div>

      {/* Thumbnails */}
      {displayImages.length > 1 && (
        <div className="mt-4 flex gap-3">
          {displayImages.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`h-20 w-20 overflow-hidden rounded-lg border-2 transition-colors ${
                i === active ? 'border-primary' : 'border-transparent hover:border-muted-foreground/30'
              }`}
            >
              <div className="flex h-full w-full items-center justify-center bg-muted text-2xl text-muted-foreground">
                {i + 1}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur"
            onClick={() => setLightbox(false)}
          >
            <button
              className="absolute left-4 top-4 rounded-lg p-2 text-muted-foreground hover:text-foreground"
              onClick={() => setLightbox(false)}
            >
              ✕
            </button>
            <button
              className="absolute left-4 top-1/2 -translate-y-1/2 rounded-lg p-3 text-muted-foreground hover:text-foreground"
              onClick={(e) => { e.stopPropagation(); setActive(Math.max(0, active - 1)) }}
            >
              <ChevronLeft className="h-8 w-8" />
            </button>
            <div className="flex h-[80vh] w-[80vw] items-center justify-center text-[20rem] text-primary/10">
              📦
            </div>
            <button
              className="absolute right-4 top-1/2 -translate-y-1/2 rounded-lg p-3 text-muted-foreground hover:text-foreground"
              onClick={(e) => { e.stopPropagation(); setActive(Math.min(displayImages.length - 1, active + 1)) }}
            >
              <ChevronRight className="h-8 w-8" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
