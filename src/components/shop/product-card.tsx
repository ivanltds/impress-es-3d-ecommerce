'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Star } from 'lucide-react'
import type { Product, Category } from '@prisma/client'

type ProductWithCategory = Product & { category: Category | null }

export function ProductCard({ product }: { product: ProductWithCategory }) {
  return (
    <motion.div whileHover={{ scale: 1.02, y: -2 }}>
      <Link
        href={`/produtos/${product.slug}`}
        className="group flex flex-col overflow-hidden rounded-2xl border bg-card transition-shadow hover:shadow-xl"
        data-testid="product-card"
      >
        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-muted">
          {product.images && product.images.length > 0 ? (
            <img
              src={product.images[0]}
              alt={product.name}
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none'
                ;(e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden')
              }}
            />
          ) : null}
          <div className={`flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/5 to-purple-500/5 transition-colors group-hover:from-primary/10 group-hover:to-purple-500/10 ${product.images && product.images.length > 0 ? 'hidden' : ''}`}>
            <div className="text-6xl text-primary/20 transition-transform group-hover:scale-110">
              <Star className="h-16 w-16" />
            </div>
          </div>
          {product.isCustomizable && (
            <span className="absolute left-3 top-3 rounded-full bg-primary/90 px-3 py-1 text-xs font-medium text-primary-foreground backdrop-blur">
              Personalizável
            </span>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-1 flex-col p-5">
          <div className="mb-2 flex items-center gap-2">
            {product.category && (
              <span
                className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground"
                data-testid="product-category"
              >
                {product.category.name}
              </span>
            )}
          </div>

          <h3
            className="font-heading text-base font-semibold leading-snug"
            data-testid="product-name"
          >
            {product.name}
          </h3>

          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
            {product.shortDescription}
          </p>

          <div className="mt-auto flex items-center justify-between pt-4">
            <p
              className="text-lg font-bold text-primary"
              data-testid="product-price"
            >
              {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              }).format(product.basePrice)}
            </p>
            {product.estimatedProductionTime && (
              <span className="text-xs text-muted-foreground">
                ~{product.estimatedProductionTime}h
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
