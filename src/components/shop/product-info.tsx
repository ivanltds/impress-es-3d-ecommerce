'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Clock, Ruler, Palette, ShoppingCart, Zap } from 'lucide-react'
import type { Product, Category } from '@prisma/client'
import { CustomizationModal, CustomizationSuggestion } from '@/components/shop/customization-modal'
import type { CustomizationField, CustomizationSnapshot } from '@/lib/customization'

type ProductWithCategory = Product & { category: Category | null }

function formatBRL(v: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
}

function addToCartStorage(product: ProductWithCategory, customizationPrice = 0, customizationSnapshot?: CustomizationSnapshot) {
  const cart = JSON.parse(localStorage.getItem('cart') || '[]')
  const itemPrice = product.basePrice + customizationPrice
  const existing = cart.find((i: { productId: string; customizationPrice?: number }) =>
    i.productId === product.id && !customizationSnapshot && !i.customizationPrice
  )
  if (existing && !customizationSnapshot) {
    existing.qty += 1
  } else {
    cart.push({
      id: Date.now().toString(),
      productId: product.id,
      name: product.name,
      price: itemPrice,
      basePrice: product.basePrice,
      customizationPrice,
      qty: 1,
      image: product.images?.[0] || null,
      customization: customizationSnapshot || null,
    })
  }
  localStorage.setItem('cart', JSON.stringify(cart))
  window.dispatchEvent(new Event('cart-updated'))
}

export function ProductInfo({ product }: { product: ProductWithCategory }) {
  const router = useRouter()
  const [addedFeedback, setAddedFeedback] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [buyNowPending, setBuyNowPending] = useState(false)

  const schema = product.customizationSchema as CustomizationField[] | null
  const hasSchema = schema && schema.length > 0

  function handleAddToCart() {
    if (hasSchema) {
      setBuyNowPending(false)
      setModalOpen(true)
    } else {
      addToCartStorage(product)
      setAddedFeedback(true)
      setTimeout(() => setAddedFeedback(false), 1800)
    }
  }

  function handleBuyNow() {
    if (hasSchema) {
      setBuyNowPending(true)
      setModalOpen(true)
    } else {
      addToCartStorage(product)
      router.push('/carrinho')
    }
  }

  function handleModalConfirm(snapshot: CustomizationSnapshot, customizationPrice: number) {
    addToCartStorage(product, customizationPrice, snapshot)
    setModalOpen(false)
    if (buyNowPending) {
      router.push('/carrinho')
    } else {
      setAddedFeedback(true)
      setTimeout(() => setAddedFeedback(false), 1800)
    }
  }

  return (
    <div>
      {/* Badges */}
      <div className="mb-4 flex flex-wrap gap-2">
        {product.category && (
          <span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
            {product.category.name}
          </span>
        )}
        {hasSchema && (
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            ✦ Personalizável
          </span>
        )}
      </div>

      <h1 className="font-heading text-3xl font-bold md:text-4xl">{product.name}</h1>

      <p className="mt-4 text-3xl font-bold text-primary">
        {formatBRL(product.basePrice)}
        {hasSchema && (
          <span className="ml-2 text-base font-normal text-muted-foreground">+ personalização</span>
        )}
      </p>

      <p className="mt-6 leading-relaxed text-muted-foreground">
        {product.longDescription || product.shortDescription}
      </p>

      {/* Detalhes */}
      <div className="mt-8 grid grid-cols-3 gap-4 rounded-xl border bg-muted/30 p-5">
        {product.material && (
          <div className="text-center">
            <Ruler className="mx-auto h-5 w-5 text-primary" />
            <p className="mt-1 text-xs text-muted-foreground">Material</p>
            <p className="text-sm font-medium">{product.material}</p>
          </div>
        )}
        {product.estimatedProductionTime && (
          <div className="text-center">
            <Clock className="mx-auto h-5 w-5 text-primary" />
            <p className="mt-1 text-xs text-muted-foreground">Produção</p>
            <p className="text-sm font-medium">~{product.estimatedProductionTime}h</p>
          </div>
        )}
        <div className="text-center">
          <Palette className="mx-auto h-5 w-5 text-primary" />
          <p className="mt-1 text-xs text-muted-foreground">Tipo</p>
          <p className="text-sm font-medium">
            {hasSchema ? 'Personalizável' : product.customizationLevel === 'none' ? 'Padrão' : 'Personalizável'}
          </p>
        </div>
      </div>

      {/* CTAs */}
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <button
          onClick={handleBuyNow}
          className="flex flex-1 items-center justify-center gap-2 rounded-full bg-primary py-3.5 text-sm font-semibold text-primary-foreground transition-all hover:scale-105 hover:shadow-lg hover:shadow-primary/30"
          data-testid="buy-now"
        >
          <Zap className="h-4 w-4" />
          {hasSchema ? 'Personalizar e Comprar' : 'Comprar Agora'}
        </button>

        <button
          onClick={handleAddToCart}
          className={`flex flex-1 items-center justify-center gap-2 rounded-full border py-3.5 text-sm font-semibold transition-all ${
            addedFeedback
              ? 'border-green-500 bg-green-50 text-green-700 dark:bg-green-950/30'
              : 'hover:border-primary hover:text-primary'
          }`}
          data-testid="add-to-cart"
        >
          <ShoppingCart className="h-4 w-4" />
          {addedFeedback ? '✓ Adicionado!' : hasSchema ? 'Personalizar e Adicionar' : 'Adicionar ao Carrinho'}
        </button>
      </div>

      {/* Sugestão de personalização para produtos sem schema */}
      {!hasSchema && (
        <CustomizationSuggestion productName={product.name} />
      )}

      {product.legalNotes && (
        <p className="mt-4 text-xs text-muted-foreground">{product.legalNotes}</p>
      )}

      {/* Modal de personalização */}
      {modalOpen && hasSchema && (
        <CustomizationModal
          productName={product.name}
          basePrice={product.basePrice}
          schema={schema}
          onConfirm={handleModalConfirm}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  )
}
