# M06 — Arquitetura Técnica: Personalized Customer Area

> **Status:** ✅ G1 APROVADO pelo Product Owner em 2026-06-12
> **Milestone:** M06 — Diferenciação (Fase 2)
> **Produzido por:** Full Stack Developer Agent (FASE 1 — Derivation)
> **Data:** 2026-06-12
> **Spec de origem:** `specs/M06-customer-area.spec.md`
> **Stack:** Next.js 15 App Router · TypeScript strict · Tailwind CSS 4 · shadcn/ui · Prisma ORM · Neon PostgreSQL · NextAuth.js v5 · Vercel Blob · framer-motion

---

## Sumário

1. [Decisões de Arquitetura Resolvidas (DA-M06-01 a DA-M06-06)](#1-decisões-de-arquitetura-resolvidas)
2. [Schema Delta (Prisma)](#2-schema-delta-prisma)
3. [Novas Rotas de API](#3-novas-rotas-de-api)
4. [Novas Páginas e Layouts](#4-novas-páginas-e-layouts)
5. [Novos Componentes](#5-novos-componentes)
6. [src/lib/analytics.ts](#6-srclibanalyticsts)
7. [Modificações em Arquivos Existentes](#7-modificações-em-arquivos-existentes)
8. [Ordem de Implementação (TDD)](#8-ordem-de-implementação-tdd)
9. [Rastreabilidade](#9-rastreabilidade)

---

## 1. Decisões de Arquitetura Resolvidas

### DA-M06-01 — Onde colocar o `UniverseThemeProvider` para a área `/conta`

**Decisão:** Opção (A) — `src/app/conta/layout.tsx` como Server Component que busca o usuário via `auth()` + `prisma.user.findUnique`, lê `preferredCollection` e renderiza `<ContaThemeWrapper universeSlug={preferredCollection}>` envolvendo `{children}`.

**Justificativa:** O layout do Next.js App Router é executado uma única vez por segmento de rota, aplicando-se automaticamente a todas as sub-rotas (`/conta`, `/conta/pedidos`, `/conta/pedidos/[id]`, `/conta/enderecos`). Isso resolve os cenários 1.5 e 1.6 sem duplicação: nenhuma `page.tsx` precisa instanciar o provider individualmente. O layout é Server Component, portanto a leitura do DB ocorre no servidor sem expor `preferredCollection` ao cliente.

**Impacto no código:**
- Criar `src/app/conta/layout.tsx` (novo arquivo).
- Criar `src/components/conta/ContaThemeWrapper.tsx` como Client Component (necessário para aplicar classe CSS reativa ao estado, resolver cenário 2.3 onde a mudança de universo atualiza o tema sem reload).
- O `ContaThemeWrapper` recebe `initialSlug` do Server Component e mantém estado interno, escutando eventos de atualização do `UniverseSelector`.

---

### DA-M06-02 — Como buscar o universo do produto para a sugestão pós-checkout

**Decisão:** Opção (A) — salvar `universeSlug` no snapshot do pedido armazenado no `localStorage` durante a criação do checkout.

**Justificativa:** A página `/checkout/confirmado` já lê `lastOrder` do `localStorage` (ver `src/app/checkout/confirmado/page.tsx`). Adicionar `universeSlug` ao item do pedido durante o `POST /api/checkout` (que já recebe `productId`) é a abordagem de menor custo: evita fetch adicional no client (opção B) e não exige converter a página para Server Component (opção C, que violaria a existência de `lastOrder` no localStorage). O campo `universeSlug` deve ser adicionado ao item no array `items` que o checkout API retorna, enriquecido via join com `ProductUniverse` no DB.

**Impacto no código:**
- `src/app/api/checkout/route.ts`: ao criar o pedido, buscar `ProductUniverse` para cada `productId` e incluir `universeSlug` (primeiro universo encontrado) na resposta. Salvar no `localStorage` via `lastOrder`.
- `src/app/checkout/confirmado/page.tsx`: ler `universeSlug` dos itens e passar para `UniverseSuggestionModal`.
- `src/components/checkout/UniverseSuggestionModal.tsx`: novo componente Client que recebe `suggestedSlug` e `userId` (null para guest).

---

### DA-M06-03 — Atomicidade ao marcar endereço como padrão

**Decisão:** Opção (A) — `prisma.$transaction([...])` com dois passos: (1) `updateMany` setando `isDefault = false` para todos os endereços do usuário; (2) `update` setando `isDefault = true` para o endereço alvo.

**Justificativa:** A regra de negócio RN-M06-10 é explícita: "apenas um com `isDefault = true`; operação atômica no banco". Uma transação Prisma garante que não exista estado intermediário onde dois endereços sejam padrão ou nenhum seja padrão. A opção (B) em dois passos sem transação cria janela de inconsistência em caso de falha entre os dois updates.

**Impacto no código:**
- `src/app/api/user/addresses/[id]/route.ts` (PATCH): ao receber `{ isDefault: true }`, executar `prisma.$transaction`.
- O transaction wrapper deve ser extraído para função auxiliar `setDefaultAddress(userId, addressId)` em `src/lib/address-utils.ts` para facilitar testes unitários.

---

### DA-M06-04 — Client vs Server Component para o seletor de universo

**Decisão:** Opção (A) — Client Component com `useState` + `fetch('/api/user/preference', { method: 'PATCH' })`.

**Justificativa:** Os cenários 2.3 (atualização visual imediata sem reload), 2.4 (rollback visual em caso de erro), 2.5 (estado de loading com cards desabilitados) e 2.6 (loading indicator) exigem controle de estado reativo granular. Server Actions com `useTransition` (opção B) não oferecem a mesma granularidade para o estado `isLoading` por card individual nem para rollback otimístico. O componente não necessita de SEO, portanto o custo de hidratação é aceitável.

**Impacto no código:**
- `src/components/conta/UniverseSelector.tsx`: `'use client'`, props `initialSlug: string | null`, `onUniverseChange: (slug: string) => void`.
- Usa `useState` para `selectedSlug`, `isLoading` e `error`.
- Chama `fetch('/api/user/preference', { method: 'PATCH', body: JSON.stringify({ universeSlug }) })`.
- Após sucesso, chama `onUniverseChange(slug)` para que `ContaThemeWrapper` atualize o tema.

---

### DA-M06-05 — Estrutura da função `trackEvent` em `src/lib/analytics.ts`

**Decisão:** Interface `trackEvent(event: AnalyticsEventName, properties: AnalyticsPayload): void` com type union para `AnalyticsEventName` e `console.log` como implementação inicial.

**Justificativa:** TypeScript strict (`noImplicitAny`) rejeita `Record<string, unknown>` como tipo de `event` — um string literal union garante type-safety nos call sites e documenta os eventos suportados. A função é síncrona e não lança exceção (cenário 6.5): qualquer SDK externo futuro deve ser integrado aqui sem alteração nos chamadores (RN-M06-13). O isolamento em `src/lib/analytics.ts` é a troca de SDK zero-cost.

**Impacto no código:**
- Criar `src/lib/analytics.ts` com tipos completos.
- Chamar `trackEvent(...)` apenas após confirmação de sucesso da API (cenário 6.4, RN-M06-14).

---

### DA-M06-06 — A faixa usa SSR (Server Component) ou Client Component?

**Decisão:** Opção (A) — Server Component com `cache: 'no-store'` no fetch interno ao Prisma.

**Justificativa:** A regra RN-M06-18 exige que a query de campanha ativa seja feita a cada request (sem cache estático) para que campanhas expiradas não apareçam. A opção (C) ISR introduz janela de até N segundos onde campanha expirada ainda aparece. A opção (B) Client Component expõe `/api/promotions/active` publicamente com roundtrip adicional e flash de conteúdo. O Server Component isolado (`PromoBannerSection`) não bloqueia o restante da LP porque o Next.js renderiza em streaming: o componente pode usar `<Suspense>` para não atrasar a hidratação de outras seções. O `preferredCollection` do usuário é lido via `getServerSession` no servidor (RN-M06-20).

**Impacto no código:**
- `src/components/home/PromoBannerSection.tsx`: Server Component assíncrono.
- `src/app/page.tsx`: envolver `<PromoBannerSection>` em `<Suspense fallback={<div className="h-24 animate-pulse bg-muted" />}>` logo após `<HeroSection>`.
- A query ao DB usa `prisma.promoBanner.findFirst(...)` com filtros de data sem cache.

---

## 2. Schema Delta (Prisma)

Adicionar ao final de `prisma/schema.prisma` (antes do bloco de universos M05):

```prisma
// ─── M06: Feature 7 — Faixa Promocional ─────────────────────────────────────

model PromoBanner {
  id        String               @id @default(cuid())
  title     String
  subtitle  String?
  startsAt  DateTime
  endsAt    DateTime
  isActive  Boolean              @default(true)
  products  PromoBannerProduct[]
  createdAt DateTime             @default(now())
  updatedAt DateTime             @updatedAt

  @@index([isActive, startsAt, endsAt]) // query de campanha ativa (RN-M06-18)
}

model PromoBannerProduct {
  bannerId  String
  productId String
  sortOrder Int         @default(0)

  banner    PromoBanner @relation(fields: [bannerId],  references: [id], onDelete: Cascade)
  product   Product     @relation(fields: [productId], references: [id], onDelete: Cascade)

  @@id([bannerId, productId])
  @@index([bannerId, sortOrder]) // query de produtos de um banner ordenados
}
```

Adicionar relação inversa no model `Product` existente (após a linha `universes              ProductUniverse[]`):

```prisma
  promoBanners           PromoBannerProduct[]   // ← adicionar esta linha
```

> **Migração:** Executar `npx prisma db push` após implementar. Os models `Address`, `Order`, `OrderItem` e `ProductUniverse` já existem no schema e não requerem alteração.

---

## 3. Novas Rotas de API

---

### `GET /api/promotions/active`

**Path:** `src/app/api/promotions/active/route.ts`
**Método:** GET
**Auth:** Não obrigatório (público)
**Query params:** `universeSlug?: string` (ex: `?universeSlug=gaming`)

**Response shape:**

```typescript
interface PromoBannerProductItem {
  productId: string
  sortOrder: number
  product: {
    id: string
    name: string
    slug: string
    basePrice: number
    images: string[]
  }
}

interface ActivePromoResponse {
  type: 'campaign' | 'featured'
  title: string | null       // título da campanha ou null no fallback
  products: PromoBannerProductItem['product'][]
}
```

**Lógica principal (pseudocódigo):**

```
now = new Date()

// 1. Tentar campanha ativa (RN-M06-18, RN-M06-19)
banner = prisma.promoBanner.findFirst({
  where: {
    isActive: true,
    startsAt: { lte: now },
    endsAt:   { gte: now },
  },
  orderBy: { startsAt: 'desc' },  // RN-M06-19: mais recente vence
  include: {
    products: {
      include: { product: { select: { id, name, slug, basePrice, images } } },
      orderBy: { sortOrder: 'asc' },
      take: 5,
    },
  },
})

// 2. Descartar campanha sem produtos suficientes (RN-M06-21, cenário 7.8)
if (banner && banner.products.length >= 3) {
  return { type: 'campaign', title: banner.title, products: banner.products.map(bp => bp.product) }
}

// 3. Fallback por universo (RN-M06-20, cenário 7.2)
whereClause = { status: 'published', isFeatured: true }
if (universeSlug) {
  whereClause.universes = { some: { universe: { slug: universeSlug } } }
}
featured = prisma.product.findMany({ where: whereClause, take: 5, orderBy: { createdAt: 'desc' } })

// 4. Fallback global (cenário 7.3)
if (featured.length < 3 && universeSlug) {
  featured = prisma.product.findMany({ where: { status: 'published', isFeatured: true }, take: 5 })
}

// 5. Sem conteúdo suficiente (RN-M06-21)
if (featured.length < 3) return Response 204

return { type: 'featured', title: null, products: featured }
```

---

### `GET /api/admin/promo-banners`

**Path:** `src/app/api/admin/promo-banners/route.ts`
**Método:** GET
**Auth:** Obrigatório — role `admin` ou `operator`
**Query params:** nenhum

**Response shape:**

```typescript
interface PromoBannerListItem {
  id: string
  title: string
  subtitle: string | null
  startsAt: string   // ISO 8601
  endsAt: string     // ISO 8601
  isActive: boolean
  productCount: number
  createdAt: string
}

type GetPromoBannersResponse = PromoBannerListItem[]
```

**Lógica principal:**

```
session = auth(); verificar role in ['admin','operator'] → 401/403
banners = prisma.promoBanner.findMany({
  orderBy: { createdAt: 'desc' },
  include: { _count: { select: { products: true } } },
})
return banners.map(b => ({ ...b, productCount: b._count.products }))
```

---

### `POST /api/admin/promo-banners`

**Path:** `src/app/api/admin/promo-banners/route.ts` (mesmo arquivo, método POST)
**Método:** POST
**Auth:** Obrigatório — role `admin` ou `operator`

**Request body:**

```typescript
interface CreatePromoBannerBody {
  title: string
  subtitle?: string
  startsAt: string   // ISO 8601
  endsAt: string     // ISO 8601
  isActive: boolean
  products: Array<{ productId: string; sortOrder: number }>
}
```

**Response shape:** `PromoBanner` completo com `id`, status HTTP 201.

**Lógica principal:**

```
Validar: title não vazio, startsAt < endsAt, products array válido
prisma.promoBanner.create({
  data: {
    title, subtitle, startsAt: new Date(startsAt), endsAt: new Date(endsAt), isActive,
    products: {
      create: products.map(p => ({ productId: p.productId, sortOrder: p.sortOrder }))
    }
  },
  include: { products: true }
})
return 201 com banner criado (cenário 7.6)
```

---

### `PATCH /api/admin/promo-banners/[id]`

**Path:** `src/app/api/admin/promo-banners/[id]/route.ts`
**Método:** PATCH
**Auth:** Obrigatório — role `admin` ou `operator`
**Route param:** `id` (bannerId)

**Request body:**

```typescript
interface UpdatePromoBannerBody {
  title?: string
  subtitle?: string
  startsAt?: string
  endsAt?: string
  isActive?: boolean
  // Se products é fornecido, substitui completamente os PromoBannerProduct existentes
  products?: Array<{ productId: string; sortOrder: number }>
}
```

**Response shape:** `PromoBanner` atualizado, status HTTP 200.

**Lógica principal:**

```
banner = prisma.promoBanner.findUnique({ where: { id } })
if (!banner) → 404

Se body.products fornecido:
  prisma.$transaction([
    prisma.promoBannerProduct.deleteMany({ where: { bannerId: id } }),
    prisma.promoBannerProduct.createMany({ data: products.map(...) })
  ])

prisma.promoBanner.update({ where: { id }, data: { ...campos escalares } })
return 200 (cenário 7.7)
```

---

### `DELETE /api/admin/promo-banners/[id]`

**Path:** `src/app/api/admin/promo-banners/[id]/route.ts` (mesmo arquivo, método DELETE)
**Método:** DELETE
**Auth:** Obrigatório — role `admin` ou `operator`
**Route param:** `id`

**Response shape:** `{ ok: true }`, status HTTP 200.

**Lógica principal:**

```
banner = prisma.promoBanner.findUnique({ where: { id } })
if (!banner) → 404

// Cascade delete de PromoBannerProduct garantido pelo onDelete: Cascade no schema (RN-M06-22)
prisma.promoBanner.delete({ where: { id } })
return { ok: true }
```

---

### `GET /api/user/addresses`

**Path:** `src/app/api/user/addresses/route.ts`
**Método:** GET
**Auth:** Obrigatório — usuário logado (qualquer role)

**Response shape:**

```typescript
interface AddressResponse {
  id: string
  label: string
  recipientName: string
  cep: string
  street: string
  number: string
  complement: string | null
  district: string
  city: string
  state: string
  country: string
  isDefault: boolean
}

type GetAddressesResponse = AddressResponse[]
```

**Lógica principal:**

```
session = auth(); se !session.user.id → 401
prisma.address.findMany({
  where: { userId: session.user.id },
  orderBy: [{ isDefault: 'desc' }, { id: 'asc' }]  // padrão primeiro
})
return addresses (cenário 5.1, 5.2)
```

---

### `POST /api/user/addresses`

**Path:** `src/app/api/user/addresses/route.ts` (mesmo arquivo, método POST)
**Método:** POST
**Auth:** Obrigatório — usuário logado

**Request body:**

```typescript
interface CreateAddressBody {
  label: string
  recipientName: string
  cep: string
  street: string
  number: string
  complement?: string
  district: string
  city: string
  state: string
  country?: string   // default "Brasil"
}
```

**Response shape:** `AddressResponse` completo, status HTTP 201.

**Lógica principal:**

```
session = auth(); se !session → 401
Validar campos obrigatórios: cep, street, number, district, city, state, recipientName (RN-M06-12)
Se validação falhar → 400 com { error, fields: [...] }

prisma.address.create({ data: { ...body, userId: session.user.id, isDefault: false } })
return 201 (cenário 5.3)
```

---

### `PATCH /api/user/addresses/[id]`

**Path:** `src/app/api/user/addresses/[id]/route.ts`
**Método:** PATCH
**Auth:** Obrigatório — usuário logado (dono do endereço)
**Route param:** `id`

**Request body:**

```typescript
interface UpdateAddressBody {
  label?: string
  recipientName?: string
  cep?: string
  street?: string
  number?: string
  complement?: string
  district?: string
  city?: string
  state?: string
  isDefault?: boolean
}
```

**Response shape:** `AddressResponse` atualizado, HTTP 200.

**Lógica principal:**

```
session = auth(); se !session → 401
addr = prisma.address.findUnique({ where: { id } })
if (!addr || addr.userId !== session.user.id) → 404  // não vazar existência

Se body.isDefault === true:
  setDefaultAddress(session.user.id, id)  // função utilitária com transaction (DA-M06-03)
Senão:
  prisma.address.update({ where: { id }, data: body })
return 200 (cenário 5.6)
```

---

### `DELETE /api/user/addresses/[id]`

**Path:** `src/app/api/user/addresses/[id]/route.ts` (mesmo arquivo)
**Método:** DELETE
**Auth:** Obrigatório — usuário logado (dono do endereço)
**Route param:** `id`

**Response shape:** `{ ok: true }`, HTTP 200.

**Lógica principal:**

```
session = auth(); se !session → 401
addr = prisma.address.findUnique({ where: { id } })
if (!addr || addr.userId !== session.user.id) → 404

prisma.address.delete({ where: { id } })  // hard delete (RN-M06-11)
return { ok: true } (cenário 5.5)
```

---

## 4. Novas Páginas e Layouts

---

### `src/app/conta/layout.tsx`

**Tipo:** Server Component (async)
**Props recebidas:** `{ children: React.ReactNode }`
**Dados buscados:**
- `auth()` → `session.user.id`
- `prisma.user.findUnique({ where: { id }, select: { preferredCollection: true } })`

**Componentes filhos principais:**
- `<ContaThemeWrapper initialSlug={preferredCollection}>` envolve `{children}`

**Responsabilidade:** Proteger todas as rotas `/conta/*` (redirecionar para `/auth/entrar` se não logado), buscar `preferredCollection` uma única vez para toda a área e injetar o wrapper temático. Resolve DA-M06-01 e cenários 1.1, 1.2, 1.5, 1.6.

```typescript
// Estrutura esperada
export default async function ContaLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user?.id) redirect('/auth/entrar')

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { preferredCollection: true },
  })

  return (
    <ContaThemeWrapper initialSlug={user?.preferredCollection ?? null}>
      {children}
    </ContaThemeWrapper>
  )
}
```

---

### `src/app/conta/pedidos/[id]/page.tsx`

**Tipo:** Server Component (async)
**Props recebidas:** `{ params: Promise<{ id: string }> }`
**Dados buscados:**
- `auth()` → `session.user.id`
- `prisma.order.findUnique({ where: { id: orderId }, include: { items: true } })`
- Verificar `order.userId === session.user.id` (RN-M06-04)

**Componentes filhos principais:**
- `<OrderDetail order={order} userId={session.user.id} />` — Client Component para interatividade e analytics
- Link `back-to-orders` para `/conta/pedidos`

**Responsabilidade:** Renderizar o detalhe completo de um pedido do usuário logado. Retornar `notFound()` para pedido inexistente ou de outro usuário (cenários 3.8, 3.10). Serializar `createdAt` para string ISO antes de passar ao Client Component.

**Nota de segurança (RN-M06-04):** O `notFound()` é chamado independentemente de o pedido não existir ou pertencer a outro usuário — nunca 403, para não vazar existência do recurso.

---

### `src/app/conta/pedidos/[id]/not-found.tsx`

**Tipo:** Server Component (estático)
**Props recebidas:** nenhuma
**Dados buscados:** nenhum

**Responsabilidade:** Renderizar página 404 customizada quando `notFound()` é chamado na rota de detalhe de pedido (cenários 3.8, 3.10). Deve incluir link de retorno para `/conta/pedidos` com `data-testid="back-to-orders"`.

```typescript
// Estrutura esperada
export default function OrderNotFound() {
  return (
    <div className="container mx-auto max-w-2xl px-4 py-24 text-center">
      <h1 className="font-heading text-3xl font-bold">Pedido não encontrado</h1>
      <p className="mt-4 text-muted-foreground">
        Este pedido não existe ou não pertence à sua conta.
      </p>
      <Link href="/conta/pedidos" data-testid="back-to-orders" className="mt-8 inline-block ...">
        Voltar aos pedidos
      </Link>
    </div>
  )
}
```

---

### `src/app/admin/campanhas/page.tsx`

**Tipo:** Server Component (async)
**Props recebidas:** nenhuma (page component)
**Dados buscados:**
- `auth()` → verificar role `admin`/`operator`
- `prisma.promoBanner.findMany({ orderBy: { createdAt: 'desc' }, include: { _count: { select: { products: true } } } })`
- `prisma.product.findMany({ where: { status: 'published' }, select: { id, name, slug } })` — para o form de criação

**Componentes filhos principais:**
- `<PromoAdmin initialBanners={banners} allProducts={products} />` — Client Component

**Responsabilidade:** Página de gerenciamento de campanhas promocionais. Redireciona para `/auth/entrar` se não admin/operator.

---

## 5. Novos Componentes

---

### `src/components/conta/ContaThemeWrapper.tsx`

**Tipo:** Client Component (`'use client'`)

**Props:**

```typescript
interface ContaThemeWrapperProps {
  initialSlug: string | null
  children: React.ReactNode
}
```

**Responsabilidade:** Mantém estado interno `universeSlug` (inicializado com `initialSlug`). Expõe contexto `ContaThemeContext` para que `UniverseSelector` possa notificar mudança de universo sem reload (cenário 2.3). Aplica `data-testid="conta-theme-wrapper"` e a classe CSS do tema via `UniverseThemeProvider` existente em `src/components/universe/UniverseThemeProvider.tsx`. Quando `universeSlug` é null, renderiza sem classe de tema (cenário 1.2).

**data-testid:** `conta-theme-wrapper`

```typescript
'use client'
import { createContext, useContext, useState } from 'react'
import { UniverseThemeProvider } from '@/components/universe/UniverseThemeProvider'

interface ContaThemeContextValue {
  universeSlug: string | null
  setUniverseSlug: (slug: string) => void
}

export const ContaThemeContext = createContext<ContaThemeContextValue>({
  universeSlug: null,
  setUniverseSlug: () => {},
})

export function useContaTheme() {
  return useContext(ContaThemeContext)
}

export function ContaThemeWrapper({ initialSlug, children }: ContaThemeWrapperProps) {
  const [universeSlug, setUniverseSlug] = useState<string | null>(initialSlug)

  return (
    <ContaThemeContext.Provider value={{ universeSlug, setUniverseSlug }}>
      <div data-testid="conta-theme-wrapper">
        {universeSlug
          ? <UniverseThemeProvider universeSlug={universeSlug}>{children}</UniverseThemeProvider>
          : children
        }
      </div>
    </ContaThemeContext.Provider>
  )
}
```

---

### `src/components/conta/UniverseSelector.tsx`

**Tipo:** Client Component (`'use client'`)

**Props:**

```typescript
interface UniverseSelectorProps {
  initialSlug: string | null
  userId: string
}
```

**Responsabilidade:** Exibe os 5 universos como cards visuais (cenário 2.1). Controla estado de seleção, loading e erro. Ao confirmar seleção bem-sucedida via `PATCH /api/user/preference`, chama `trackEvent('universe_preference_changed', ...)` e `setUniverseSlug` do `ContaThemeContext`. Em caso de erro, reverte estado visual (cenário 2.4).

**data-testids expostos:**
- `universe-selector` (container)
- `universe-option-{slug}` (cada card, ex: `universe-option-gaming`)
- `universe-option-active-indicator` (indicador dentro do card selecionado)
- `universe-selector-loading` (spinner durante request)
- `universe-selector-error` (mensagem de erro)
- `conta-universe-badge` (badge exibido quando há universo selecionado)

**Lógica de estado:**

```typescript
const [selectedSlug, setSelectedSlug] = useState(initialSlug)
const [isLoading, setIsLoading] = useState(false)
const [error, setError] = useState<string | null>(null)
const { setUniverseSlug } = useContaTheme()

async function handleSelect(slug: string) {
  const previous = selectedSlug
  setIsLoading(true)
  setError(null)
  try {
    const res = await fetch('/api/user/preference', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ universeSlug: slug }),
    })
    if (!res.ok) throw new Error('Erro ao salvar preferência')
    setSelectedSlug(slug)
    setUniverseSlug(slug)
    trackEvent('universe_preference_changed', {
      userId,
      previousUniverse: previous,
      newUniverse: slug,
      source: 'account_page',
    })
  } catch {
    setError('Não foi possível salvar sua preferência. Tente novamente.')
    setSelectedSlug(previous)  // rollback visual (cenário 2.4)
  } finally {
    setIsLoading(false)
  }
}
```

---

### `src/components/conta/OrderDetail.tsx`

**Tipo:** Client Component (`'use client'`) — necessário para `useEffect` do analytics

**Props:**

```typescript
interface OrderItem {
  id: string
  productNameSnapshot: string
  skuSnapshot: string
  qty: number
  unitPrice: number
  customizationPrice: number
  customizationSnapshot: string | null
  productionStatus: string
}

interface OrderDetailProps {
  order: {
    id: string
    orderNumber: string
    status: string
    paymentStatus: string
    total: number
    subtotal: number
    shippingCost: number
    trackingCode: string | null
    createdAt: string   // ISO 8601 serializado pelo Server Component pai
    items: OrderItem[]
  }
  userId: string
}
```

**Responsabilidade:** Renderizar o detalhe completo do pedido com itens, status badge, rastreio e personalização. Emitir `order_detail_viewed` no `useEffect` (cenário 6.3). Nunca editar `customizationSnapshot` (RN-M06-16). Renderizar personalização como pares chave-valor legíveis (`JSON.parse` do snapshot).

**data-testids expostos:**
- `order-detail`, `order-number`, `order-total`, `order-date`
- `order-status-badge`
- `order-tracking` (container quando trackingCode não null), `order-tracking-link`, `order-tracking-pending`
- `order-items-list`
- `order-item-{index}` (para cada item)
- `order-item-customization-{index}` (somente se customizationSnapshot não null)
- `back-to-orders`

**Mapa de status para texto legível e cor:**

```typescript
const STATUS_MAP: Record<string, { label: string; className: string }> = {
  created:    { label: 'Criado',      className: 'bg-gray-100 text-gray-700' },
  paid:       { label: 'Pago',        className: 'bg-green-100 text-green-700' },
  processing: { label: 'Em Produção', className: 'bg-blue-100 text-blue-700' },
  shipped:    { label: 'Enviado',     className: 'bg-purple-100 text-purple-700' },
  delivered:  { label: 'Entregue',    className: 'bg-teal-100 text-teal-700' },
  cancelled:  { label: 'Cancelado',   className: 'bg-red-100 text-red-700' },
}
```

---

### `src/components/conta/AddressList.tsx`

**Tipo:** Client Component (`'use client'`)

**Props:**

```typescript
interface Address {
  id: string
  label: string
  recipientName: string
  cep: string
  street: string
  number: string
  complement: string | null
  district: string
  city: string
  state: string
  isDefault: boolean
}

interface AddressListProps {
  initialAddresses: Address[]
}
```

**Responsabilidade:** Renderizar lista de endereços com cards. Gerenciar estado local sincronizado com API (add, remove, set-default). Exibir empty state (cenário 5.2). Orquestrar abertura do `AddressForm`. Chamar `DELETE /api/user/addresses/[id]` e `PATCH /api/user/addresses/[id]`.

**data-testids expostos:**
- `addresses-list`, `addresses-empty-state`
- `address-card` (cada card)
- `address-default-badge` (no card padrão)
- `remove-address-{id}`, `set-default-address-{id}`
- `add-address` (botão de abertura do form)

---

### `src/components/conta/AddressForm.tsx`

**Tipo:** Client Component (`'use client'`)

**Props:**

```typescript
interface AddressFormProps {
  onSuccess: (address: Address) => void
  onCancel: () => void
}
```

**Responsabilidade:** Formulário controlado para criação de endereço. Validação client-side dos campos obrigatórios (RN-M06-12) antes de submeter (cenário 5.4). Chamar `POST /api/user/addresses`. Em caso de erro 500, exibir `address-form-error` sem resetar campos (cenário 5.9). Nunca usar localStorage (RN-M06-09, cenário 5.3).

**data-testids expostos:**
- `address-form` (container do formulário)
- `save-address` (botão de submit)
- `address-form-error` (mensagem de erro da API)

---

### `src/components/checkout/UniverseSuggestionModal.tsx`

**Tipo:** Client Component (`'use client'`)

**Props:**

```typescript
interface UniverseSuggestionModalProps {
  suggestedSlug: string | null    // null = não exibir modal
  userId: string | null           // null = usuário guest (cenário 4.7)
  currentPreference: string | null // não-null = não exibir modal (RN-M06-06, cenário 4.4)
}
```

**Responsabilidade:** Exibir modal de sugestão de universo pós-checkout. Renderizar apenas quando: `userId !== null && currentPreference === null && suggestedSlug !== null` (RN-M06-06). Ao aceitar, chamar `PATCH /api/user/preference` e emitir `universe_preference_changed` com `source: 'post_checkout_suggestion'` (cenário 6.2). Ao dispensar, fechar sem efeitos colaterais (cenário 4.3, RN-M06-08). Usar `framer-motion` para animação de entrada/saída do modal.

**data-testids expostos:**
- `universe-suggestion-modal`
- `universe-suggestion-accept`
- `universe-suggestion-dismiss`

---

### `src/components/home/PromoBannerSection.tsx`

**Tipo:** Server Component (async) — resolve DA-M06-06

**Props:** nenhuma (busca dados internamente via Prisma e `auth()`)

**Responsabilidade:** Buscar campanha ativa ou fallback de produtos em destaque. Não renderizar nada se `products.length < 3` (RN-M06-21). Renderizar a seção com título opcional e cards de produto. Não usar cache estático (a página pai já tem `dynamic = 'force-dynamic'`, portanto a Prisma query é executada a cada request).

**data-testids expostos:**
- `promo-banner-section` (container)
- `promo-banner-title` (apenas quando `type === 'campaign'`)
- `promo-banner-card-{index}` (cada card)
- `promo-banner-card-image-{index}`
- `promo-banner-card-name-{index}`
- `promo-banner-card-price-{index}`
- `promo-banner-card-cta-{index}` (link para `/produto/{slug}`)

---

### `src/components/admin/PromoAdmin.tsx`

**Tipo:** Client Component (`'use client'`)

**Props:**

```typescript
interface PromoBannerSummary {
  id: string
  title: string
  subtitle: string | null
  startsAt: string
  endsAt: string
  isActive: boolean
  productCount: number
}

interface ProductOption {
  id: string
  name: string
  slug: string
}

interface PromoAdminProps {
  initialBanners: PromoBannerSummary[]
  allProducts: ProductOption[]
}
```

**Responsabilidade:** CRUD completo de campanhas promocionais via chamadas às APIs admin. Listar campanhas existentes. Formulário de criação (título, subtítulo opcional, período startsAt/endsAt, produtos com sortOrder). Botão de ativar/desativar (PATCH `isActive`). Botão de excluir (DELETE com confirmação). Feedback de loading e erro por operação.

---

## 6. `src/lib/analytics.ts`

```typescript
// src/lib/analytics.ts
// Instrumentação de eventos — console.log estruturado por padrão.
// Para integrar SDK externo (Amplitude, Segment, PostHog), substituir apenas
// o corpo de `trackEvent` sem alterar nenhum call site.

export type AnalyticsEventName =
  | 'universe_preference_changed'
  | 'order_detail_viewed'
  | 'universe_suggestion_shown'
  | 'universe_suggestion_accepted'
  | 'universe_suggestion_dismissed'

export interface UniversePreferenceChangedPayload {
  userId: string
  previousUniverse: string | null
  newUniverse: string
  source: 'account_page' | 'post_checkout_suggestion'
}

export interface OrderDetailViewedPayload {
  userId: string
  orderId: string
  orderStatus: string
}

export interface UniverseSuggestionPayload {
  userId: string
  suggestedUniverse: string
}

export type AnalyticsPayload =
  | UniversePreferenceChangedPayload
  | OrderDetailViewedPayload
  | UniverseSuggestionPayload

/**
 * Emite um evento de analytics.
 * Nunca lança exceção — o fluxo do usuário não deve ser interrompido (RN-M06-13, cenário 6.5).
 * Eventos são emitidos APENAS após confirmação de sucesso da operação (RN-M06-14, cenário 6.4).
 */
export function trackEvent(event: AnalyticsEventName, payload: AnalyticsPayload): void {
  try {
    const enriched = {
      event,
      ...payload,
      timestamp: new Date().toISOString(),
    }
    // Canal padrão: console.log estruturado
    console.log('[analytics]', enriched)

    // Ponto de extensão para SDK externo:
    // if (typeof window !== 'undefined' && window.analytics) {
    //   window.analytics.track(event, payload)
    // }
  } catch {
    // Silenciar exceção — nunca interromper o fluxo (cenário 6.5)
  }
}
```

---

## 7. Modificações em Arquivos Existentes

| Arquivo | O que muda |
|---------|-----------|
| `src/app/conta/page.tsx` | Remover `auth()` + redirect próprio (layout já protege). Adicionar `<UniverseSelector initialSlug={user.preferredCollection} userId={session.user.id} />`. O layout passa `preferredCollection` como prop ou `ContaThemeContext` é lido. |
| `src/app/conta/enderecos/page.tsx` | Reescrever de Client Component (localStorage) para Server Component que busca endereços via Prisma diretamente e passa `initialAddresses` para `<AddressList>`. Remover toda lógica de `localStorage` (RN-M06-09). |
| `src/app/checkout/confirmado/page.tsx` | Ler `universeSlug` dos itens de `lastOrder` no localStorage. Buscar `preferredCollection` e `userId` via `useSession()`. Renderizar `<UniverseSuggestionModal>` com as props calculadas (RN-M06-06, cenários 4.1–4.7). |
| `src/app/api/checkout/route.ts` | Ao criar o pedido, fazer `prisma.productUniverse.findFirst({ where: { productId } })` para cada item e incluir `universeSlug` (primeiro encontrado) no objeto salvo no localStorage via resposta JSON. |
| `src/app/page.tsx` | Adicionar `<Suspense fallback={<div className="h-24 animate-pulse bg-muted" />}><PromoBannerSection /></Suspense>` logo após a tag `<HeroSection />` (atende HU-07: faixa abaixo da navbar). |
| `src/app/admin/layout.tsx` | Adicionar item `{ href: '/admin/campanhas', label: 'Campanhas', icon: Megaphone }` ao array `NAV`. |
| `prisma/schema.prisma` | Adicionar models `PromoBanner`, `PromoBannerProduct` e relação inversa `promoBanners` em `Product` (ver Seção 2). |

---

## 8. Ordem de Implementação (TDD)

A sequência abaixo garante que cada etapa tem dependências satisfeitas antes de ser testada.

| # | Tarefa | Fase TDD | Arquivo(s) |
|---|--------|----------|------------|
| 1 | Schema: adicionar `PromoBanner`, `PromoBannerProduct`, relação inversa em `Product` | Schema | `prisma/schema.prisma` |
| 2 | `npx prisma db push` — aplicar schema ao banco Neon | Schema | — |
| 3 | Criar `src/lib/analytics.ts` com tipos e implementação | Unit | `src/lib/analytics.ts` |
| 4 | Criar `src/lib/address-utils.ts` com `setDefaultAddress` (transaction atômica) | Unit | `src/lib/address-utils.ts` |
| 5 | API `GET /api/user/addresses` | Integration RED | `src/app/api/user/addresses/route.ts` |
| 6 | API `POST /api/user/addresses` | Integration RED | `src/app/api/user/addresses/route.ts` |
| 7 | API `PATCH /api/user/addresses/[id]` | Integration RED | `src/app/api/user/addresses/[id]/route.ts` |
| 8 | API `DELETE /api/user/addresses/[id]` | Integration RED | `src/app/api/user/addresses/[id]/route.ts` |
| 9 | API `GET /api/promotions/active` (campanha + fallback) | Integration RED | `src/app/api/promotions/active/route.ts` |
| 10 | API `GET /api/admin/promo-banners` | Integration RED | `src/app/api/admin/promo-banners/route.ts` |
| 11 | API `POST /api/admin/promo-banners` | Integration RED | `src/app/api/admin/promo-banners/route.ts` |
| 12 | API `PATCH /api/admin/promo-banners/[id]` | Integration RED | `src/app/api/admin/promo-banners/[id]/route.ts` |
| 13 | API `DELETE /api/admin/promo-banners/[id]` | Integration RED | `src/app/api/admin/promo-banners/[id]/route.ts` |
| 14 | Componente `ContaThemeWrapper` + contexto `ContaThemeContext` | Component | `src/components/conta/ContaThemeWrapper.tsx` |
| 15 | Layout `src/app/conta/layout.tsx` | Component | `src/app/conta/layout.tsx` |
| 16 | Componente `UniverseSelector` | Component | `src/components/conta/UniverseSelector.tsx` |
| 17 | Atualizar `src/app/conta/page.tsx` | Component | `src/app/conta/page.tsx` |
| 18 | Componentes `AddressList` + `AddressForm` | Component | `src/components/conta/AddressList.tsx`, `src/components/conta/AddressForm.tsx` |
| 19 | Reescrever `src/app/conta/enderecos/page.tsx` (localStorage → DB) | Component | `src/app/conta/enderecos/page.tsx` |
| 20 | Componente `OrderDetail` com STATUS_MAP e analytics | Component | `src/components/conta/OrderDetail.tsx` |
| 21 | Página `src/app/conta/pedidos/[id]/page.tsx` + `not-found.tsx` | Component | `src/app/conta/pedidos/[id]/page.tsx`, `src/app/conta/pedidos/[id]/not-found.tsx` |
| 22 | Atualizar `POST /api/checkout` para incluir `universeSlug` na resposta | Integration | `src/app/api/checkout/route.ts` |
| 23 | Componente `UniverseSuggestionModal` com framer-motion | Component | `src/components/checkout/UniverseSuggestionModal.tsx` |
| 24 | Atualizar `src/app/checkout/confirmado/page.tsx` | Component | `src/app/checkout/confirmado/page.tsx` |
| 25 | Componente `PromoBannerSection` (Server) + integrar na homepage com Suspense | Component | `src/components/home/PromoBannerSection.tsx`, `src/app/page.tsx` |
| 26 | Componente `PromoAdmin` + página `src/app/admin/campanhas/page.tsx` + nav | Component | `src/components/admin/PromoAdmin.tsx`, `src/app/admin/campanhas/page.tsx`, `src/app/admin/layout.tsx` |

---

## 9. Rastreabilidade

| Cenário Gherkin | Arquivo(s) que o implementam |
|----------------|------------------------------|
| 1.1 — Tema aplicado ao wrapper | `src/app/conta/layout.tsx`, `src/components/conta/ContaThemeWrapper.tsx` |
| 1.2 — Sem universo, tema neutro | `src/components/conta/ContaThemeWrapper.tsx` (slug null → sem classe de tema) |
| 1.3 — Badge "Seu universo" visível | `src/components/conta/UniverseSelector.tsx` (badge `conta-universe-badge`) |
| 1.4 — Badge não aparece sem preferência | `src/components/conta/UniverseSelector.tsx` (renderizado condicionalmente) |
| 1.5 — Tema não propaga para nav/footer | `src/app/conta/layout.tsx` (wrapper é filho do layout raiz, não envolve header/footer) |
| 1.6 — Sub-rotas herdam tema | `src/app/conta/layout.tsx` (Next.js App Router aplica layout a todas as sub-rotas) |
| 2.1 — 5 cards de universo | `src/components/conta/UniverseSelector.tsx` |
| 2.2 — Card ativo com aria-selected | `src/components/conta/UniverseSelector.tsx` |
| 2.3 — Clicar salva via API e atualiza UI | `src/components/conta/UniverseSelector.tsx` + `src/app/api/user/preference/route.ts` |
| 2.4 — Erro na API faz rollback visual | `src/components/conta/UniverseSelector.tsx` (rollback de `selectedSlug`) |
| 2.5 — Sem preferência, nenhum card ativo | `src/components/conta/UniverseSelector.tsx` (initialSlug null) |
| 2.6 — Estado de loading durante request | `src/components/conta/UniverseSelector.tsx` (`isLoading` state) |
| 3.1 — Detalhe do pedido carrega | `src/app/conta/pedidos/[id]/page.tsx`, `src/components/conta/OrderDetail.tsx` |
| 3.2 — Itens com snapshot de preço | `src/components/conta/OrderDetail.tsx` |
| 3.3 — Status badge com cor | `src/components/conta/OrderDetail.tsx` (STATUS_MAP) |
| 3.4 — Rastreio quando disponível | `src/components/conta/OrderDetail.tsx` |
| 3.5 — Rastreio pending quando null | `src/components/conta/OrderDetail.tsx` (`order-tracking-pending`) |
| 3.6 — Personalização exibida | `src/components/conta/OrderDetail.tsx` (JSON.parse de customizationSnapshot) |
| 3.7 — Personalização oculta quando null | `src/components/conta/OrderDetail.tsx` (render condicional) |
| 3.8 — Cross-user retorna 404 | `src/app/conta/pedidos/[id]/page.tsx` (userId check + notFound) |
| 3.9 — Guest redirecionado para login | `src/app/conta/layout.tsx` (redirect) |
| 3.10 — ID inexistente retorna 404 | `src/app/conta/pedidos/[id]/page.tsx` (notFound) + `not-found.tsx` |
| 3.11 — Link voltar | `src/components/conta/OrderDetail.tsx` (`data-testid="back-to-orders"`) |
| 4.1 — Modal exibido pós-checkout | `src/components/checkout/UniverseSuggestionModal.tsx`, `src/app/checkout/confirmado/page.tsx` |
| 4.2 — Aceitar salva e fecha modal | `src/components/checkout/UniverseSuggestionModal.tsx` + `src/app/api/user/preference/route.ts` |
| 4.3 — Dispensar fecha sem efeito | `src/components/checkout/UniverseSuggestionModal.tsx` |
| 4.4 — Modal não exibido com preferência definida | `src/components/checkout/UniverseSuggestionModal.tsx` (currentPreference guard) |
| 4.5 — Modal não exibido sem universo no pedido | `src/app/checkout/confirmado/page.tsx` (suggestedSlug derivado null) |
| 4.6 — Múltiplos universos → sugere o primeiro | `src/app/api/checkout/route.ts` (items[0].universeSlug) |
| 4.7 — Guest não recebe modal | `src/components/checkout/UniverseSuggestionModal.tsx` (userId null guard) |
| 5.1 — Lista endereços do DB | `src/app/conta/enderecos/page.tsx`, `src/app/api/user/addresses/route.ts` |
| 5.2 — Empty state | `src/components/conta/AddressList.tsx` (`addresses-empty-state`) |
| 5.3 — Adicionar endereço persiste no DB | `src/components/conta/AddressForm.tsx`, `src/app/api/user/addresses/route.ts` |
| 5.4 — Validação client-side | `src/components/conta/AddressForm.tsx` |
| 5.5 — Remover endereço | `src/components/conta/AddressList.tsx`, `src/app/api/user/addresses/[id]/route.ts` |
| 5.6 — Marcar como padrão (atômico) | `src/components/conta/AddressList.tsx`, `src/app/api/user/addresses/[id]/route.ts`, `src/lib/address-utils.ts` |
| 5.7 — Badge padrão | `src/components/conta/AddressList.tsx` (`address-default-badge`) |
| 5.8 — Guest redirecionado | `src/app/conta/layout.tsx` |
| 5.9 — Erro API mantém dados do form | `src/components/conta/AddressForm.tsx` (sem reset em caso de erro) |
| 6.1 — Evento `universe_preference_changed` (conta) | `src/components/conta/UniverseSelector.tsx`, `src/lib/analytics.ts` |
| 6.2 — Evento `universe_preference_changed` (pós-checkout) | `src/components/checkout/UniverseSuggestionModal.tsx`, `src/lib/analytics.ts` |
| 6.3 — Evento `order_detail_viewed` | `src/components/conta/OrderDetail.tsx` (useEffect), `src/lib/analytics.ts` |
| 6.4 — Evento não emitido em erro | `src/components/conta/UniverseSelector.tsx` (trackEvent apenas dentro do bloco try, após `res.ok`) |
| 6.5 — `trackEvent` não lança exceção | `src/lib/analytics.ts` (try/catch silencioso) |
| 7.1 — Campanha ativa exibida | `src/components/home/PromoBannerSection.tsx`, `src/app/api/promotions/active/route.ts` |
| 7.2 — Fallback por universo preferido | `src/components/home/PromoBannerSection.tsx`, `src/app/api/promotions/active/route.ts` |
| 7.3 — Fallback global | `src/components/home/PromoBannerSection.tsx`, `src/app/api/promotions/active/route.ts` |
| 7.4 — Cards com imagem, nome, preço e CTA | `src/components/home/PromoBannerSection.tsx` |
| 7.5 — Campanha expirada não exibida | `src/app/api/promotions/active/route.ts` (filtro `endsAt >= now`) |
| 7.6 — Admin cria campanha | `src/app/api/admin/promo-banners/route.ts` (POST) |
| 7.7 — Admin desativa campanha | `src/app/api/admin/promo-banners/[id]/route.ts` (PATCH `isActive: false`) |
| 7.8 — Campanha sem produtos → fallback | `src/app/api/promotions/active/route.ts` (validação `products.length >= 3`) |
