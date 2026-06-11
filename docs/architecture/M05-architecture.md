# M05 — Arquitetura Técnica: Multi-Theme Experience + LP Redesign

> **Status:** DRAFT — aguardando aprovação G1
> **Milestone:** M05 — Diferenciação (Fase 2)
> **Produzido por:** Full Stack Developer Agent (FASE 1 — Derivation)
> **Data:** 2026-06-11
> **Spec de origem:** `specs/M05-multi-theme.spec.md`
> **Stack:** Next.js 15 App Router · TypeScript strict · Tailwind CSS · shadcn/ui · Prisma ORM · Neon PostgreSQL · NextAuth.js v5

---

## Sumário

1. [Schema Prisma — Mudanças Necessárias](#1-schema-prisma--mudanças-necessárias)
2. [Rotas Next.js App Router](#2-rotas-nextjs-app-router)
3. [API Routes — Novas e Modificadas](#3-api-routes--novas-e-modificadas)
4. [Componentes Principais (novos)](#4-componentes-principais-novos)
5. [Sistema de Tema CSS](#5-sistema-de-tema-css)
6. [Persistência de Preferência de Universo](#6-persistência-de-preferência-de-universo)
7. [Estratégia de SEO e Metadados](#7-estratégia-de-seo-e-metadados)
8. [Estratégia de Revalidação](#8-estratégia-de-revalidação)
9. [Configuração Estática de Universos](#9-configuração-estática-de-universos)
10. [Migrações Necessárias](#10-migrações-necessárias)
11. [Rastreabilidade F1–F10](#11-rastreabilidade-f1f10)

---

## 1. Schema Prisma — Mudanças Necessárias

### 1.1 Decisão DA-01: Vínculo Produto ↔ Universo

**Opção escolhida: (B) Tabela de junção M:N explícita `_ProductUniverse`**

**Justificativa:** Os cenários 7.3 e 7.4 exigem queries do tipo `WHERE universe_slug = ?` sobre um conjunto potencialmente grande de produtos. A opção (A) com `String[]` no PostgreSQL exigiria operador `@>` ou `ANY()` sobre um array, o que não aproveita índice B-tree padrão — resulta em seq-scan em tabela grande. A relação M:N explícita permite `WHERE pu.universeSlug = 'gaming'` com índice convencional. O cenário 7.4 (produto em dois universos simultâneos) é um caso central da spec, não uma exceção, reforçando a necessidade de M:N.

**Não se usa `collectionId` existente** (FK singular) para universos — esse campo permanece para retrocompatibilidade com `/colecoes/[slug]` que já existe. A nova relação é independente.

### 1.2 Decisão DA-02: Configuração de Universos

**Opção escolhida: (A) Arquivo `src/config/universes.ts` para M05**

**Justificativa:** Os 5 universos são fixos neste milestone. A spec marca explicitamente "Admin UI para editar configuração de universos sem redeploy — M06+". Um arquivo TypeScript elimina latência de DB, simplifica ISR e permite tree-shaking. O campo `comingSoon` do cenário 2.2, a ordem padrão do cenário 2.6 e todos os metadados visuais vivem nesse arquivo.

### 1.3 Decisão DA-07: Model Testimonial

**Escopo M05:** Depoimentos são gerenciados via seed/migration — sem admin UI (DA-08 opta por opção A para M05). A tabela é criada para que os cenários 4.1–4.4 possam ser testados com dados reais via seed.

### 1.4 Mudanças Completas no Schema

```prisma
// ─── NOVO: model Universe ───────────────────────────────────────────────────
// Armazena apenas dados que precisam de persistência por produto.
// Configuração visual (cores, fontes, tagline) vive em src/config/universes.ts
// Motivado por: DA-02, cenários 2.1, 2.2, 2.3, 7.1, 7.2, 7.3, RN-M05-02
model Universe {
  id           String    @id @default(cuid())
  slug         String    @unique  // "gaming" | "anime-nerd" | "casa-decor" | "presentes" | "auto"
  name         String             // "Gaming" | "Anime & Nerd" | etc.
  comingSoon   Boolean   @default(false)  // cenário 2.2: badge "Em breve"
  sortOrder    Int       @default(0)      // cenário 2.6: ordem padrão na grade
  products     ProductUniverse[]
  testimonials Testimonial[]

  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt
}

// ─── NOVO: tabela de junção M:N ─────────────────────────────────────────────
// Motivado por: DA-01, cenários 7.3, 7.4, RN-M05-01
model ProductUniverse {
  productId   String
  universeId  String

  product     Product   @relation(fields: [productId],   references: [id], onDelete: Cascade)
  universe    Universe  @relation(fields: [universeId], references: [id], onDelete: Cascade)

  @@id([productId, universeId])
  @@index([universeId])   // índice para query "produtos de um universo"
  @@index([productId])    // índice para query "universos de um produto"
}

// ─── NOVO: model Testimonial ─────────────────────────────────────────────────
// Motivado por: DA-07, cenários 4.1, 4.2, 4.3, 4.4 (stretch), RN-M05-10
model Testimonial {
  id           String    @id @default(cuid())
  authorName   String
  authorPhoto  String?   // URL (Vercel Blob ou /public/)
  productPhoto String?   // URL — cenário 4.2: opcional (placeholder se ausente)
  text         String
  universeId   String?   // cenário 4.4 (stretch): filtro por universo
  universe     Universe? @relation(fields: [universeId], references: [id], onDelete: SetNull)
  isPublished  Boolean   @default(false)  // cenário 4.3: só published aparecem

  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt

  @@index([isPublished])
  @@index([universeId, isPublished])
}

// ─── MODIFICADO: model Product ───────────────────────────────────────────────
// Adicionar relação para ProductUniverse; demais campos inalterados
// collectionId permanece para não quebrar /colecoes/[slug] existente
model Product {
  // ... todos os campos existentes permanecem ...
  universes   ProductUniverse[]   // ← NOVO relacionamento M:N
}
```

### 1.5 Decisão: Collection vs. Universe

`Collection` **NÃO é renomeada nem substituída** neste milestone. A rota `/colecoes/[slug]` já existe e tem tráfego. Renomear quebraria URLs indexadas pelo Google (breaking change). `Universe` é uma entidade paralela, semanticamente distinta. Migration posterior (M06+) pode deprecar `/colecoes` se o PO decidir unificá-las.

### 1.6 Tabela de Motivação por Cenário Gherkin

| Artefato de Schema | Cenários que motivam |
|--------------------|----------------------|
| `Universe.slug` | 2.1, 2.4, 7.1, 7.2, 9.1–9.4, 10.2 |
| `Universe.comingSoon` | 2.2, 2.3, RN-M05-02 |
| `Universe.sortOrder` | 2.6, RN-M05-11 |
| `ProductUniverse` (M:N) | 7.3, 7.4, RN-M05-01, DA-01 |
| `@@index([universeId])` | 7.3 (query eficiente "produtos do universo") |
| `Testimonial.isPublished` | 4.1, 4.3 |
| `Testimonial.productPhoto` nullable | 4.2 |
| `Testimonial.universeId` nullable | 4.4 (stretch) |
| `User.preferredCollection` (existente) | 9.3, 9.4, 9.5, RN-M05-05 |

---

## 2. Rotas Next.js App Router

### Visão Geral da Estrutura de Diretórios (M05)

```
src/
  app/
    page.tsx                          ← MODIFICADO — redesign completo LP
    universo/
      [slug]/
        page.tsx                      ← NOVO — página de universo
        not-found.tsx                 ← NOVO — 404 customizado por universo
        loading.tsx                   ← NOVO — skeleton ISR
    api/
      universes/
        route.ts                      ← NOVO — GET lista universos
      user/
        preference/
          route.ts                    ← NOVO — PATCH preferência universo
  config/
    universes.ts                      ← NOVO — configuração estática
  components/
    universe/
      UniverseThemeProvider.tsx       ← NOVO — Server Component (injeção CSS)
      UniversoCard.tsx                ← NOVO — Client Component (card interativo)
      UniversosSection.tsx            ← NOVO — Server Component (grade/carousel)
      HeroSection.tsx                 ← NOVO — Server Component
      ComoFuncionaSection.tsx         ← NOVO — Server Component
      ProvaSocialSection.tsx          ← NOVO — Server Component
      DestaquesSection.tsx            ← NOVO — Server Component
      WhatsAppCTA.tsx                 ← NOVO — Client Component (lê cookie/context)
      UniversoProdutosGrid.tsx        ← NOVO — Server Component
    shared/
      whatsapp-button.tsx             ← MODIFICADO — passa phone via props
```

---

### 2.1 Rota: `/` (Homepage Redesenhada)

| Atributo | Valor |
|----------|-------|
| Arquivo | `src/app/page.tsx` |
| Tipo | `page` (Server Component) |
| Renderização | **ISR** — `export const revalidate = 3600` (1 hora) |
| Cookie lido | `universe_pref` via `cookies()` do next/headers |

**Dados consumidos (queries Prisma — executadas no Server Component):**

```typescript
// 1. WhatsApp: lido de StoreSettings (necessário para condicional RN-M05-06)
prisma.storeSettings.findUnique({ where: { id: 'singleton' } })

// 2. Produtos em destaque por universo (cenários 5.1–5.3)
// Para cada universo ativo: máximo 3 isFeatured=true
prisma.product.findMany({
  where: {
    status: 'published',
    isFeatured: true,
    universes: { some: { universe: { slug: universeSlug } } }
  },
  take: 3,
  orderBy: { createdAt: 'desc' }
})

// 3. Depoimentos (cenários 4.1–4.3)
prisma.testimonial.findMany({
  where: { isPublished: true },
  include: { universe: { select: { slug: true } } },
  orderBy: { createdAt: 'desc' }
})

// 4. Universos com contagem de produtos publicados (cenários 2.1–2.3)
prisma.universe.findMany({
  orderBy: { sortOrder: 'asc' },
  include: {
    _count: { select: { products: { where: { product: { status: 'published' } } } } }
  }
})
```

**Lógica de ordenação de universos (cenários 2.5, 2.6, 9.4):**

```typescript
// No Server Component — lê cookie server-side (sem hydration flash — DA-09)
import { cookies } from 'next/headers'

const cookieStore = await cookies()
const universePref = cookieStore.get('universe_pref')?.value ?? null

// Se usuário logado: preferência do DB tem prioridade (cenário 9.4)
// Se guest: usa cookie
// Reordena: universo preferido vai para index 0, demais mantêm sortOrder
```

**Árvore de componentes filho:**

```
page.tsx (Server Component)
  ├── HeroSection (Server Component)
  │     └── Image [priority] data-testid="hero-bg-image"
  ├── UniversosSection (Server Component)
  │     └── UniversoCard[] (Client Component — swipe/carousel em mobile)
  ├── ComoFuncionaSection (Server Component)
  ├── DestaquesSection (Server Component)
  │     └── ProductCard[] (Client Component existente — adaptado)
  ├── ProvaSocialSection (Server Component — condicional: só renderiza se ≥3 depoimentos)
  └── WhatsAppCTA (Client Component — condicional: só renderiza se phone configurado)
```

**Referências Gherkin:** F1 (1.1–1.5), F2 (2.1–2.8), F3 (3.1–3.3), F4 (4.1–4.3), F5 (5.1–5.5), F6 (6.1–6.4)

---

### 2.2 Rota: `/universo/[slug]`

| Atributo | Valor |
|----------|-------|
| Arquivo | `src/app/universo/[slug]/page.tsx` |
| Tipo | `page` (Server Component) |
| Renderização | **ISR** — `export const revalidate = 3600` |
| `generateStaticParams` | Gera paths para os 5 slugs de universo (SSG no build) |

**`generateStaticParams`:**

```typescript
export async function generateStaticParams() {
  const universes = await prisma.universe.findMany({ select: { slug: true } })
  return universes.map((u) => ({ slug: u.slug }))
}
```

**`generateMetadata` (cenários 10.2, 10.3, 10.5):**

```typescript
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const config = UNIVERSE_CONFIG[slug]  // de src/config/universes.ts
  if (!config) return { title: 'Não encontrado', robots: 'noindex' }

  return {
    title: `${config.name} — Produtos 3D Personalizados`,
    description: config.seoDescription,
    openGraph: {
      title: `${config.name} — Impressão 3D Personalizada`,
      description: config.seoDescription,
      images: [{ url: `/universes/${slug}/og.jpg` }],  // DA-10: assets em /public
    },
    alternates: {
      canonical: `https://${process.env.NEXT_PUBLIC_DOMAIN}/universo/${slug}`,  // cenário 10.5
    },
  }
}
```

**Lógica de renderização:**

```typescript
export default async function UniversoPage({ params }: Props) {
  const { slug } = await params
  const config = UNIVERSE_CONFIG[slug]

  // cenário 7.2: slug inválido → 404
  if (!config) notFound()

  // Query: produtos do universo (cenários 7.3, 7.4)
  const products = await prisma.product.findMany({
    where: {
      status: 'published',
      universes: { some: { universe: { slug } } }
    },
    include: { category: true },
    orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }]
  })

  // Cookie: set preferência (cenário 9.1) — via Server Action disparada ao montar
  // WhatsApp: carrega settings (cenário 7.6 — mensagem específica do universo)
  const settings = await prisma.storeSettings.findUnique({ where: { id: 'singleton' } })

  return (
    <UniverseThemeProvider universeSlug={slug}>
      <div data-testid={`universo-page-${slug}`}>
        {/* Header, grid de produtos, CTA WhatsApp com mensagem específica */}
      </div>
    </UniverseThemeProvider>
  )
}
```

**Árvore de componentes filho:**

```
page.tsx (Server Component)
  └── UniverseThemeProvider (Server Component — injeta CSS vars via className)
        ├── UniversoHeader (Server Component) data-testid="universo-header"
        ├── UniversoCTAPersonalizar (Server Component) data-testid="universo-cta-personalizar"
        ├── UniversoProdutosGrid (Server Component)
        │     ├── [products.length > 0] ProductCard[] (Client Component)
        │     └── [products.length === 0] UniversoEmptyState (Server Component)
        ├── WhatsAppCTA (Client Component — mensagem com nome do universo)
        └── UniversePreferenceSetter (Client Component — dispara PATCH preference)
```

**Referências Gherkin:** F7 (7.1–7.7), F8 (8.1–8.5), F9 (9.1–9.3), F10 (10.2, 10.3, 10.5)

---

### 2.3 Rota: `/universo/[slug]/not-found.tsx`

| Atributo | Valor |
|----------|-------|
| Arquivo | `src/app/universo/[slug]/not-found.tsx` |
| Tipo | `not-found` (Server Component) |
| Renderização | Static |

**Comportamento:** Chamado por `notFound()` quando o slug não existe. Retorna HTTP 404 com `<meta name="robots" content="noindex">` (cenário 10.4). Não expõe stack trace. Exibe mensagem amigável + link para homepage.

```typescript
import type { Metadata } from 'next'

export const metadata: Metadata = {
  robots: 'noindex',
}

export default function UniversoNotFound() {
  return (
    <div>
      <h1>Universo não encontrado</h1>
      <p>Este universo não existe ou ainda não está disponível.</p>
      <a href="/">Voltar para a loja</a>
    </div>
  )
}
```

**Referências Gherkin:** 7.2, 10.4

---

### 2.4 Rota: `/universo/[slug]/loading.tsx`

| Atributo | Valor |
|----------|-------|
| Arquivo | `src/app/universo/[slug]/loading.tsx` |
| Tipo | `loading` (React Suspense boundary automático) |
| Renderização | Client (skeleton) |

Exibe skeleton cards enquanto o Server Component busca dados do Prisma. Importante para LCP (cenário 1.5) e percepção de performance (RN-M05-13).

---

### 2.5 Rotas Existentes — Zero Breaking Changes

| Rota | Status | Observação |
|------|--------|------------|
| `/produtos` | Inalterada | Catálogo geral sem filtro de universo (cenário 9.6) |
| `/produtos/[slug]` | Inalterada | PDP não recebe tema de universo (RN-M05-07) |
| `/carrinho` | Inalterada | Não herda CSS vars de universo (cenário 8.3) |
| `/checkout` | Inalterada | Não herda CSS vars de universo (cenários 8.3, RN-M05-07) |
| `/colecoes/[slug]` | Inalterada | Mantida para retrocompatibilidade |
| `/(admin)/**` | Inalterada | Admin não recebe tema de universo |

---

## 3. API Routes — Novas e Modificadas

### 3.1 `GET /api/universes`

**Arquivo:** `src/app/api/universes/route.ts`

**Propósito:** Retorna lista de universos com contagem de produtos publicados. Usado pelo Client Component `UniversosSection` para hidratação progressiva e pelo filtro de depoimentos (cenário 4.4 stretch).

**Request:** `GET /api/universes`

**Response:**
```json
[
  {
    "slug": "gaming",
    "name": "Gaming",
    "comingSoon": false,
    "sortOrder": 0,
    "publishedProductCount": 12
  }
]
```

**Implementação:**
```typescript
export async function GET() {
  const universes = await prisma.universe.findMany({
    orderBy: { sortOrder: 'asc' },
    include: {
      _count: {
        select: {
          products: { where: { product: { status: 'published' } } }
        }
      }
    }
  })
  // Mapear _count para publishedProductCount
  return NextResponse.json(universes.map(u => ({
    slug: u.slug,
    name: u.name,
    comingSoon: u.comingSoon,
    sortOrder: u.sortOrder,
    publishedProductCount: u._count.products
  })))
}
```

**Cache:** `export const revalidate = 3600` — alinhado com ISR das páginas.

**Referências Gherkin:** 2.1, 2.2, 2.3, 4.4

---

### 3.2 `PATCH /api/user/preference`

**Arquivo:** `src/app/api/user/preference/route.ts`

**Propósito:** Unifica persistência de preferência de universo para guest (cookie) e logado (DB). Opção escolhida: DA-05 (B) — API Route reutilizável.

**Justificativa da escolha DA-05 (B) vs. (A):**
- Server Actions são adequadas para mutações com revalidação de cache. Aqui a operação é "fire and forget" (cenário 9.3: assíncrona, silenciosa). Uma API Route é mais testável em isolamento (testes de integração existentes no projeto seguem esse padrão) e reutilizável por `UniversePreferenceSetter` Client Component.

**Request:**
```typescript
PATCH /api/user/preference
Content-Type: application/json

{ "universeSlug": "gaming" }
```

**Lógica:**
```typescript
export async function PATCH(request: Request) {
  const { universeSlug } = await request.json()

  // Validar slug contra lista de universos válidos
  const validSlugs = ['gaming', 'anime-nerd', 'casa-decor', 'presentes', 'auto']
  if (!validSlugs.includes(universeSlug)) {
    return NextResponse.json({ error: 'Invalid universe slug' }, { status: 400 })
  }

  const session = await auth()

  // Usuário logado: salvar em DB (cenário 9.3, RN-M05-05)
  if (session?.user?.id) {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { preferredCollection: universeSlug }
    })
  }

  // Sempre: salvar cookie (guest e logado — cookie como fallback)
  // cenários 9.1, 9.2 — RN-M05-04
  const response = NextResponse.json({ ok: true })
  response.cookies.set('universe_pref', universeSlug, {
    maxAge: 60 * 60 * 24 * 30,  // 30 dias
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,              // não acessível por JS — segurança
    path: '/'
  })
  return response
}
```

**Referências Gherkin:** 9.1, 9.2, 9.3, RN-M05-04, RN-M05-05

---

### 3.3 Admin: Gestão de Universos (escopo M05 limitado)

Conforme DA-08 (opção A para M05): **não há admin UI para universos em M05**. A tabela `Universe` é populada via seed/migration. Portanto, **nenhuma API Route admin de universos é criada em M05**.

A tabela existe no banco para sustentar as relações produto↔universo, mas a configuração visual permanece no arquivo `src/config/universes.ts`. Em M06, quando o admin precisar editar sem redeploy, serão criadas as rotas `GET/POST/PATCH/DELETE /api/admin/universes`.

---

### 3.4 Admin: Gestão de Depoimentos (escopo M05 limitado)

Conforme DA-08: **sem admin UI de depoimentos em M05**. Depoimentos são inseridos via seed. Em M06: `GET/POST/PATCH/DELETE /api/admin/testimonials`.

---

### 3.5 Modificação: `GET /api/settings/public`

**Arquivo:** `src/app/api/settings/public/route.ts` — **INALTERADO**. O endpoint já existe e retorna `whatsappPhone`. Nenhuma modificação necessária para M05.

---

### 3.6 Modificação: `GET/PATCH /api/admin/products/[id]`

**Arquivo:** `src/app/api/admin/products/[id]/route.ts`

**Modificação:** Adicionar suporte para o campo `universes` (array de slugs) no payload de criação/edição de produto. Ao receber `universes: string[]`, o handler deve:

1. Buscar IDs dos universos pelos slugs via `prisma.universe.findMany({ where: { slug: { in: universes } } })`
2. Executar `prisma.productUniverse.deleteMany({ where: { productId: id } })` (limpa relações antigas)
3. Executar `prisma.productUniverse.createMany({ data: universeIds.map(uid => ({ productId: id, universeId: uid })) })`

Essa lógica permite que o admin vincule produtos a universos no formulário de admin existente.

---

## 4. Componentes Principais (novos)

### Convenções globais
- Todos os componentes: TypeScript strict, props tipadas com interface explícita
- Mobile-first em todos os estilos Tailwind
- Todos os `data-testid` listados na spec são obrigatórios

---

### 4.1 `UniverseThemeProvider`

| Atributo | Valor |
|----------|-------|
| Arquivo | `src/components/universe/UniverseThemeProvider.tsx` |
| Tipo | **Server Component** |
| Renderização | No servidor — zero JS enviado ao cliente |

**Propósito:** Injeta CSS custom properties do universo no escopo da página `/universo/[slug]` sem vazar para layout raiz (cenário 8.3, 8.5, RN-M05-14).

**Decisão DA-03 — Opção (A): CSS Modules com seletor de classe**

**Justificativa da escolha:**
- Opção (B) `style` tag inline: funciona, mas polui o HTML e não é cacheable.
- Opção (C) Tailwind CSS vars via className: Tailwind v4 suporta, mas exige configurar cada universo como tema arbitrário — mais verboso.
- Opção (A) CSS Module: o seletor `.universe-gaming { --color-primary: #00ff41 }` gerado pelo build é estático, cacheável e **scoped** — não polui `:root`. Alinhado com App Router onde Server Components não podem usar `useEffect`.

**Implementação:**

```typescript
// src/components/universe/UniverseThemeProvider.tsx
import styles from './UniverseThemeProvider.module.css'

interface Props {
  universeSlug: string
  children: React.ReactNode
}

export function UniverseThemeProvider({ universeSlug, children }: Props) {
  const themeClass = styles[`universe-${universeSlug.replace('-', '_')}`] ?? ''
  const fontClass = UNIVERSE_FONT_CLASSES[universeSlug] ?? ''

  return (
    <div className={`${themeClass} ${fontClass}`}>
      {children}
    </div>
  )
}
```

```css
/* src/components/universe/UniverseThemeProvider.module.css */
/* Cenário 8.1 */
.universe_gaming {
  --color-primary:    #00ff41;
  --color-secondary:  #ff00ff;
  --color-bg:         #0a0a0a;
  --color-text:       #f0f0f0;
  --color-card:       #111111;
  --color-border:     #1a1a1a;
  --color-accent:     #ff00ff;
}

/* Cenário 8.2 */
.universe_anime_nerd {
  --color-primary:    #c44dff;
  --color-secondary:  #ff6b9d;
  --color-bg:         #ffffff;
  --color-text:       #1a1a1a;
  --color-card:       #fff0f8;
  --color-border:     #f0d0e8;
  --color-accent:     #ff6b9d;
}

.universe_casa_decor {
  --color-primary:    #8b6914;
  --color-secondary:  #2c2c2c;
  --color-bg:         #faf8f5;
  --color-text:       #2c2c2c;
  --color-card:       #f5f0ea;
  --color-border:     #e8ddd0;
  --color-accent:     #8b6914;
}

.universe_presentes {
  --color-primary:    #e8521a;
  --color-secondary:  #2c2c2c;
  --color-bg:         #fff9f0;
  --color-text:       #2c2c2c;
  --color-card:       #fff4e8;
  --color-border:     #f0d8c0;
  --color-accent:     #e8521a;
}

.universe_auto {
  --color-primary:    #c0392b;
  --color-secondary:  #f5f5f5;
  --color-bg:         #1a1a1a;
  --color-text:       #f5f5f5;
  --color-card:       #242424;
  --color-border:     #333333;
  --color-accent:     #c0392b;
}
```

**Por que checkout/carrinho não herdam (cenário 8.3, RN-M05-07):** O `UniverseThemeProvider` envolve APENAS o conteúdo de `/universo/[slug]/page.tsx`. As rotas `/carrinho` e `/checkout` são renderizadas dentro do `RootLayout` que usa `:root` com tokens base — nunca passam pelo `UniverseThemeProvider`. As CSS vars de tema (`--color-primary` do universo) existem apenas dentro do `div` com a classe do CSS Module, não em `:root`.

**Props:**
```typescript
interface UniverseThemeProviderProps {
  universeSlug: string
  children: React.ReactNode
}
```

**data-testid:** Não tem testid próprio — é um wrapper transparente.

**Referências Gherkin:** 8.1, 8.2, 8.3, 8.4, 8.5, RN-M05-14

---

### 4.2 `UniversoCard`

| Atributo | Valor |
|----------|-------|
| Arquivo | `src/components/universe/UniversoCard.tsx` |
| Tipo | **Client Component** (`'use client'`) |
| Responsabilidade | Card interativo de universo na grade da LP |

**Necessita ser Client Component** porque:
- Em mobile, implementa scroll snap / swipe (cenário 2.7)
- Precisa de `onClick` para feedback visual antes da navegação

**Props:**
```typescript
interface UniversoCardProps {
  slug: string                    // "gaming"
  name: string                    // "Gaming"
  tagline: string                 // "Setup com atitude"
  imageUrl: string                // "/universes/gaming/card.jpg"
  comingSoon: boolean             // cenário 2.2
  isPreferred?: boolean           // cenário 2.5 — destaque visual
  accentColor: string             // "#00ff41" — borda/hover
}
```

**data-testids obrigatórios:**
- `data-testid="universo-card-{slug}"` — ex: `universo-card-gaming`
- `data-testid="universo-badge-coming-soon"` — badge (cenário 2.2, renderização condicional)

**Comportamento:**
- `comingSoon: true` → card renderizado SEM `<Link>` ativo (cenário 2.2: não clicável)
- `comingSoon: false` → `<Link href="/universo/{slug}">` envolvendo o card (cenário 2.4)

---

### 4.3 `UniversosSection`

| Atributo | Valor |
|----------|-------|
| Arquivo | `src/components/universe/UniversosSection.tsx` |
| Tipo | **Server Component** |
| Responsabilidade | Container da grade de universos; ordena pela preferência; passa dados para `UniversoCard` |

**Props:**
```typescript
interface UniversosSectionProps {
  universes: UniverseWithCount[]  // dados do DB + _count.products
  preferredSlug: string | null    // cookie/DB lido no Server Component pai
}
```

**Lógica de ordenação (cenários 2.5, 2.6):**
```typescript
const sorted = preferredSlug
  ? [
      universes.find(u => u.slug === preferredSlug),
      ...universes.filter(u => u.slug !== preferredSlug)
    ].filter(Boolean)
  : universes  // já vem ordenado por sortOrder do DB
```

**Layout responsivo (cenários 2.7, 2.8):**
- Mobile (≤ 640px): `overflow-x-auto scroll-smooth snap-x snap-mandatory flex gap-4`
- Desktop (≥ 1024px): `grid grid-cols-5 gap-6`
- `data-testid="universos-section"` no elemento raiz
- `data-testid="universos-carousel-dots"` nos dots de paginação (cenário 2.7) — esses dots são Client Component embutido

**data-testids obrigatórios:**
- `data-testid="universos-section"`
- `data-testid="universos-carousel-dots"` (mobile)

---

### 4.4 `HeroSection`

| Atributo | Valor |
|----------|-------|
| Arquivo | `src/components/universe/HeroSection.tsx` |
| Tipo | **Server Component** |
| Responsabilidade | Seção hero da LP com imagem de fundo, headline e CTA |

**Props:**
```typescript
interface HeroSectionProps {
  // Sem props dinâmicas — conteúdo é estático/configurado no arquivo
}
```

**Requisitos críticos:**
- `next/image` com `priority={true}` no hero image (cenário 1.5: LCP)
- `data-testid="hero-bg-image"` no elemento `<Image>`
- CTA faz scroll suave para `#universos-section` (cenário 1.3) — via link anchor `href="#universos-section"` (funciona sem JS com CSS `scroll-behavior: smooth`)
- Headline: "Feito para você. Só para você." (cenário 1.1)
- Conteúdo: **zero menção de preço** (cenário 1.4, RN-M05-08)

**data-testids obrigatórios:**
- `data-testid="hero-section"`
- `data-testid="hero-headline"`
- `data-testid="hero-bg-image"`
- `data-testid="hero-cta-universos"` no botão CTA

---

### 4.5 `ComoFuncionaSection`

| Atributo | Valor |
|----------|-------|
| Arquivo | `src/components/universe/ComoFuncionaSection.tsx` |
| Tipo | **Server Component** |
| Responsabilidade | 3 passos estáticos do processo de personalização |

**Conteúdo dos passos (cenário 3.2: contexto específico de impressão 3D):**
- Passo 1: "Escolhe seu universo" + descrição específica sobre escolha de coleção 3D
- Passo 2: "Personaliza com nome, cor e tamanho" + descrição sobre o formulário de personalização
- Passo 3: "Recebe em casa — único no mundo" + descrição sobre produção sob demanda

**data-testids obrigatórios:**
- `data-testid="como-funciona-section"`
- `data-testid="passo-1"`, `data-testid="passo-2"`, `data-testid="passo-3"`

**Layout mobile (cenário 3.3):** `flex flex-col gap-8 md:grid md:grid-cols-3`

---

### 4.6 `ProvaSocialSection`

| Atributo | Valor |
|----------|-------|
| Arquivo | `src/components/universe/ProvaSocialSection.tsx` |
| Tipo | **Server Component** |
| Responsabilidade | Grid de depoimentos com lógica condicional de exibição |

**Props:**
```typescript
interface ProvaSocialSectionProps {
  testimonials: Testimonial[]  // array já filtrado (isPublished=true)
}
```

**Lógica condicional (cenário 4.3):**
- Se `testimonials.length < 3` → retorna `null` (componente não renderizado)
- Se `testimonials.length >= 3` → renderiza seção

**Card de depoimento:**
- `data-testid="depoimento-card"` em cada card
- `productPhoto` presente → renderiza `<Image>` com alt descritivo
- `productPhoto` ausente → renderiza `<div data-testid="depoimento-produto-placeholder">` (cenário 4.2)

**Cenário 4.4 (stretch — filtro por universo):**
- Implementado como sub-componente Client Component `TestimonialFilter`
- `data-testid="depoimento-filtro-{slug}"` em cada botão de filtro
- Filtro atualiza lista via estado local (sem nova query — dados já carregados)
- `aria-selected="true"` no filtro ativo

**data-testids obrigatórios:**
- `data-testid="prova-social-section"`
- `data-testid="depoimento-card"`
- `data-testid="depoimento-produto-placeholder"`
- `data-testid="depoimento-filtro-{slug}"` (stretch F4.4)

---

### 4.7 `DestaquesSection`

| Atributo | Valor |
|----------|-------|
| Arquivo | `src/components/universe/DestaquesSection.tsx` |
| Tipo | **Server Component** |
| Responsabilidade | Produtos em destaque agrupados por universo |

**Props:**
```typescript
interface DestaquesSectionProps {
  destaquesByUniverse: Map<string, Product[]>  // slug → produtos (máx 3)
}
```

**Lógica condicional (cenários 5.2, 5.3):**
- Universo com 0 produtos `isFeatured` → subseção omitida (cenário 5.3)
- Universo com 1 produto → exibe apenas 1 (cenário 5.2)
- Universo com 3 produtos → exibe 3 (cenário 5.1, RN-M05-10)

**Preço exibido (cenário 5.5):** "A partir de R$ XX,XX" — basePrice sem variantes

**data-testids obrigatórios:**
- `data-testid="destaques-section"`
- `data-testid="destaques-{slug}"` por subseção (ex: `destaques-gaming`)
- `data-testid="produto-card-{productId}"` por card
- `data-testid="produto-preco-{productId}"`
- `data-testid="btn-personalizar-{productId}"` (cenário 5.4: link para `/produtos/{slug}`)

---

### 4.8 `WhatsAppCTA`

| Atributo | Valor |
|----------|-------|
| Arquivo | `src/components/universe/WhatsAppCTA.tsx` |
| Tipo | **Client Component** (`'use client'`) |
| Responsabilidade | Botão/seção WhatsApp com mensagem contextual |

**Necessita ser Client Component** para acessar o phone via contexto `StoreSettingsContext` existente (padrão já estabelecido no projeto).

**Props:**
```typescript
interface WhatsAppCTAProps {
  whatsappPhone: string         // passado pelo Server Component pai (evita fetch adicional)
  context: 'homepage' | 'universo'
  universeName?: string         // presente quando context='universo' (cenário 7.6)
}
```

**Mensagens por contexto:**
- `homepage`: "Olá! Vi o site e quero criar um produto personalizado único." (cenário 6.3)
- `universo`: `"Olá! Vi o universo ${universeName} e quero um produto personalizado!"` (cenário 7.6)

**Lógica condicional (cenários 6.1, 6.2):**
- `whatsappPhone === ''` → retorna `null` — seção inteira não renderizada

**data-testids obrigatórios:**
- `data-testid="cta-whatsapp-section"` (seção wrapper — cenário 6.1/6.2)
- `data-testid="btn-whatsapp"` no `<a>` principal (cenários 6.1, 6.3, 6.4)
- `data-testid="btn-whatsapp-universo"` no botão dentro de `UniversoEmptyState` (cenário 7.7)

**Atributos obrigatórios (cenário 6.4):** `target="_blank" rel="noopener noreferrer"`

---

### 4.9 `UniversoProdutosGrid`

| Atributo | Valor |
|----------|-------|
| Arquivo | `src/components/universe/UniversoProdutosGrid.tsx` |
| Tipo | **Server Component** |
| Responsabilidade | Grid de produtos filtrados do universo |

**Props:**
```typescript
interface UniversoProdutosGridProps {
  products: ProductWithCategory[]
  universeSlug: string
}
```

**Lógica condicional (cenário 7.7):**
- `products.length === 0` → renderiza `<UniversoEmptyState>` ao invés do grid
- Grid: `data-testid="universo-produtos-grid"`
- Empty state: `data-testid="universo-empty-state"` + botão WhatsApp `data-testid="btn-whatsapp-universo"`

**data-testids obrigatórios:**
- `data-testid="universo-produtos-grid"`
- `data-testid="universo-empty-state"`

---

### 4.10 `UniversePreferenceSetter`

| Atributo | Valor |
|----------|-------|
| Arquivo | `src/components/universe/UniversePreferenceSetter.tsx` |
| Tipo | **Client Component** (`'use client'`) |
| Responsabilidade | Dispara `PATCH /api/user/preference` ao montar (fire and forget) |

**Por que Client Component:** `useEffect` necessário para disparar a chamada após hidratação, sem bloquear a renderização da página (cenário 9.3: operação assíncrona e silenciosa).

```typescript
'use client'
import { useEffect } from 'react'

export function UniversePreferenceSetter({ slug }: { slug: string }) {
  useEffect(() => {
    // Fire and forget — sem await, sem feedback visual
    fetch('/api/user/preference', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ universeSlug: slug }),
    }).catch(() => {})  // silencia erros de rede
  }, [slug])

  return null  // não renderiza nada
}
```

**Referências Gherkin:** 9.1, 9.2, 9.3

---

## 5. Sistema de Tema CSS

### 5.1 Arquitetura de Aplicação de Tema

**Decisão DA-03 consolidada: CSS Modules com seletor de classe (Opção A)**

```
globals.css          ← tokens base (:root) — checkout/carrinho/admin usam isso
                       nunca modificado pelo tema de universo

UniverseThemeProvider.module.css  ← sobrescreve vars APENAS dentro do wrapper
                                    seletor: .universe_gaming { --color-primary: ... }
                                    escopo: div.universe_gaming e seus descendentes
```

### 5.2 CSS Custom Properties por Universo

| Variável | Propósito | Usado em |
|----------|-----------|---------|
| `--color-primary` | Cor de destaque (botões, links, badges) | cenário 8.1, 8.2 |
| `--color-secondary` | Cor complementar | gradientes, hovers |
| `--color-bg` | Background da página | cenário 8.1 (dark), 8.2 (claro) |
| `--color-text` | Cor do texto principal | contraste WCAG AA (cenário 8.6) |
| `--color-card` | Background dos cards de produto | UniversoProdutosGrid |
| `--color-border` | Bordas e divisores | cards, separadores |
| `--color-accent` | Hover states, focus rings | acessibilidade cenário 8.6 |
| `--font-heading` | Família tipográfica dos headings | cenário 8.1 (Orbitron), 8.2 (serif) |

**Variáveis de fonte são carregadas via `next/font` no `page.tsx` de cada universo (DA-04).**

### 5.3 Carregamento de Fontes por Segmento de Rota (DA-04 — Opção B)

**Decisão:** Fontes carregadas apenas no `page.tsx` de `/universo/[slug]`, não globalmente.

**Justificativa:** Carregar todas as 10 fontes (5 universos × 2 fontes/universo) globalmente em `layout.tsx` adicionaria ~200-400KB de CSS e aumentaria o LCP (impacto direto em RN-M05-13: Lighthouse ≥ 80). O App Router do Next.js 15 suporta nativamente declaração de fontes em qualquer Server Component de uma rota — cada segmento carrega apenas suas fontes.

**Implementação em `/universo/[slug]/page.tsx`:**
```typescript
import { Orbitron, Inter, Fredoka_One, Nunito, Playfair_Display,
         Lato, Merriweather, Open_Sans, Bebas_Neue, Roboto } from 'next/font/google'

// Map: slug → fontes
const UNIVERSE_FONTS = {
  'gaming':      { heading: Orbitron({ subsets: ['latin'], weight: ['700','900'], variable: '--font-heading', display: 'swap' }),
                   body: Inter({ subsets: ['latin'], variable: '--font-body', display: 'swap' }) },
  'anime-nerd':  { heading: Fredoka_One({ subsets: ['latin'], weight: ['400'], variable: '--font-heading', display: 'swap' }),
                   body: Nunito({ subsets: ['latin'], variable: '--font-body', display: 'swap' }) },
  'casa-decor':  { heading: Playfair_Display({ subsets: ['latin'], weight: ['400','700'], variable: '--font-heading', display: 'swap' }),
                   body: Lato({ subsets: ['latin'], weight: ['400','700'], variable: '--font-body', display: 'swap' }) },
  'presentes':   { heading: Merriweather({ subsets: ['latin'], weight: ['700'], variable: '--font-heading', display: 'swap' }),
                   body: Open_Sans({ subsets: ['latin'], variable: '--font-body', display: 'swap' }) },
  'auto':        { heading: Bebas_Neue({ subsets: ['latin'], weight: ['400'], variable: '--font-heading', display: 'swap' }),
                   body: Roboto({ subsets: ['latin'], weight: ['400','700'], variable: '--font-body', display: 'swap' }) },
}
```

**Nota:** Como `next/font` requer chamadas no top-level do módulo (não dentro de funções), na prática cada universo terá seu próprio `page.tsx` com as fontes declaradas no topo, ou usaremos um padrão de importação condicional via dynamic segments. O QA deve validar isso no gate G2.

### 5.4 Garantia de Isolamento (RN-M05-07, Cenário 8.3)

```
RootLayout (layout.tsx)
  └── :root { --color-primary: #2563eb }   ← tokens base sempre ativos
        ├── /carrinho/page.tsx              ← usa :root → tokens base (OK)
        ├── /checkout/page.tsx             ← usa :root → tokens base (OK)
        └── /universo/gaming/page.tsx
              └── <div class="universe_gaming">   ← sobrescreve vars APENAS aqui
                    └── { --color-primary: #00ff41 }   ← não vaza para fora do div
```

### 5.5 WCAG AA — Pares de Contraste por Universo

| Universo | Texto | Fundo | Ratio estimado | Status |
|----------|-------|-------|----------------|--------|
| Gaming | `#f0f0f0` | `#0a0a0a` | ~18.7:1 | WCAG AAA |
| Anime & Nerd | `#1a1a1a` | `#ffffff` | ~21:1 | WCAG AAA |
| Casa & Decor | `#2c2c2c` | `#faf8f5` | ~13.5:1 | WCAG AAA |
| Presentes | `#2c2c2c` | `#fff9f0` | ~12.8:1 | WCAG AAA |
| Auto | `#f5f5f5` | `#1a1a1a` | ~17.4:1 | WCAG AAA |

Todos os pares superam o mínimo WCAG AA (4.5:1) requerido pelo cenário 8.6. O QA deve validar com ferramenta automatizada no gate G4.

---

## 6. Persistência de Preferência de Universo

### 6.1 Fluxo Completo Guest + Logado

```
Visitante acessa /universo/gaming
         │
         ├─► Server Component page.tsx renderiza página
         │
         └─► Client Component UniversePreferenceSetter monta
                      │
                      └─► useEffect → PATCH /api/user/preference { universeSlug: "gaming" }
                                             │
                                             ├─► [Logado] prisma.user.update({ preferredCollection: "gaming" })
                                             │
                                             └─► [Sempre] Set-Cookie: universe_pref=gaming; MaxAge=2592000; SameSite=Lax; Secure; HttpOnly; Path=/
```

### 6.2 Esquema do Cookie

| Atributo | Valor |
|----------|-------|
| Nome | `universe_pref` |
| Valor | Slug do universo: `"gaming"` \| `"anime-nerd"` \| `"casa-decor"` \| `"presentes"` \| `"auto"` |
| `Max-Age` | `2592000` (30 dias em segundos) — cenário 9.1, RN-M05-04 |
| `SameSite` | `Lax` — cenário 9.1 |
| `Secure` | `true` em produção, `false` em desenvolvimento |
| `HttpOnly` | `true` — não acessível por JavaScript (proteção XSS) |
| `Path` | `/` — disponível em toda a aplicação |

### 6.3 Leitura do Cookie no Server Component da Homepage

```typescript
// src/app/page.tsx (Server Component)
import { cookies } from 'next/headers'
import { auth } from '@/lib/auth'

export default async function HomePage() {
  const session = await auth()
  const cookieStore = await cookies()

  let preferredSlug: string | null = null

  if (session?.user?.id) {
    // Logado: lê do DB (cenário 9.4 — DB tem prioridade sobre cookie)
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { preferredCollection: true }
    })
    preferredSlug = user?.preferredCollection ?? null
  }

  // Se logado sem preferência no DB, ou se guest: usa cookie
  if (!preferredSlug) {
    preferredSlug = cookieStore.get('universe_pref')?.value ?? null
  }

  // Passa para UniversosSection que ordena os cards
  // ...
}
```

**Sem FOUC (DA-09):** Como a leitura do cookie ocorre no Server Component durante o render, o HTML já chega ao cliente com os cards na ordem correta. Não há estado inicial errado que precise ser corrigido no cliente — eliminando o flash de ordenação.

### 6.4 Prioridade de Preferência (Cenário 9.4)

```
1. Usuário logado com preferredCollection no DB    → usa DB
2. Usuário logado sem preferredCollection no DB    → usa cookie
3. Guest com cookie universe_pref                 → usa cookie
4. Guest sem cookie                               → ordem padrão (sortOrder)
```

---

## 7. Estratégia de SEO e Metadados

### 7.1 LP Principal `/`

```typescript
// src/app/page.tsx
export const metadata: Metadata = {
  title: 'Produtos 3D Personalizados — Feito para você, só para você',
  description: 'Impressão 3D personalizada com nome, cor e tamanho. Escolha seu universo: Gaming, Anime, Casa, Presentes ou Auto. Produção sob demanda, entrega no Brasil.',
  openGraph: {
    title: 'Produtos 3D Personalizados — Feito para você, só para você',
    description: 'Personalize o seu. Impressão 3D com identidade.',
    images: [{ url: '/og-home.jpg', width: 1200, height: 630 }],  // cenário 10.1
    type: 'website',
    locale: 'pt_BR',
  },
  robots: 'index, follow',
}
```

**Cenário 10.1:** Title com proposta de valor + description com "personalização 3D" + og:image específica.

### 7.2 Páginas de Universo `/universo/[slug]`

**Via `generateMetadata()` dinâmico** (ver seção 2.2):

| Universo | Title | og:image |
|----------|-------|----------|
| gaming | `Gaming — Produtos 3D Personalizados` | `/universes/gaming/og.jpg` |
| anime-nerd | `Anime & Nerd — Produtos 3D Personalizados` | `/universes/anime-nerd/og.jpg` |
| casa-decor | `Casa & Decor — Produtos 3D Personalizados` | `/universes/casa-decor/og.jpg` |
| presentes | `Presentes — Produtos 3D Personalizados` | `/universes/presentes/og.jpg` |
| auto | `Auto — Produtos 3D Personalizados` | `/universes/auto/og.jpg` |

**Cenário 10.3:** Cada universo tem `og:image` diferente entre si e diferente da LP principal.

### 7.3 Convenção de Assets (DA-10)

```
public/
  og-home.jpg                      ← og:image da LP principal (1200×630)
  universes/
    gaming/
      og.jpg                        ← og:image gaming (1200×630) — cenário 10.3
      hero.jpg                      ← hero image da página de universo
      card.jpg                      ← imagem do card na grade LP
    anime-nerd/
      og.jpg
      hero.jpg
      card.jpg
    casa-decor/ ...
    presentes/ ...
    auto/ ...
```

Todos os assets são estáticos em `/public` para zero latência. `next/image` com `priority` no hero de cada universo.

### 7.4 Canonical URLs (Cenário 10.5)

```typescript
alternates: {
  canonical: `https://${process.env.NEXT_PUBLIC_DOMAIN}/universo/${slug}`
}
```

Sem trailing slash. `NEXT_PUBLIC_DOMAIN` configurado no Vercel (ex: `loja3dprint.com.br`). O Next.js 15 App Router emite o `<link rel="canonical">` automaticamente quando `alternates.canonical` é definido no metadata.

### 7.5 Página 404 de Universo (Cenário 10.4)

```typescript
// src/app/universo/[slug]/not-found.tsx
export const metadata: Metadata = {
  robots: 'noindex',  // cenário 10.4: noindex na 404
}
```

Zero stack trace exposto. HTTP 404 retornado pelo Next.js automaticamente quando `notFound()` é chamado.

---

## 8. Estratégia de Revalidação

**Decisão DA-06 consolidada: ISR com `revalidate = 3600` (opção B)**

**Justificativa:** Para M05 MVP, os dados (universos, depoimentos, produtos em destaque) são semi-estáticos — alterados raramente (máx. algumas vezes por dia via admin). Revalidação a cada hora é suficiente. On-demand revalidation (opção C) requer configurar webhooks ou chamar `revalidatePath()` nas APIs de admin — complexidade desnecessária agora, deferida para M06.

### 8.1 Revalidação por Rota

| Rota | `revalidate` | Trigger |
|------|-------------|---------|
| `src/app/page.tsx` | `3600` | ISR automático a cada 1h |
| `src/app/universo/[slug]/page.tsx` | `3600` | ISR automático a cada 1h |
| `src/app/api/universes/route.ts` | `3600` | ISR automático a cada 1h |

### 8.2 Revalidação On-Demand (Preparação para M06)

Quando o admin editar produtos via `/api/admin/products/[id]`, adicionar ao handler:

```typescript
// Preparado mas não ativado em M05 — placeholder para M06
import { revalidatePath, revalidateTag } from 'next/cache'

// No handler PATCH de produto:
// revalidatePath('/')
// revalidatePath(`/universo/${universeSlug}`)
// revalidateTag('products')  // se usarmos unstable_cache com tags
```

**Nota M05:** Essas chamadas NÃO são ativadas em M05. O ISR horário é suficiente. O QA não deve esperar propagação imediata após edição de produto no admin.

---

## 9. Configuração Estática de Universos

**Arquivo:** `src/config/universes.ts`

**Propósito (DA-02 opção A):** Fonte de verdade para dados de apresentação dos universos. Tudo que não precisa de DB: visual, SEO, mensagens WhatsApp, ordem padrão.

```typescript
// src/config/universes.ts

export interface UniverseConfig {
  slug: string
  name: string
  tagline: string
  persona: string
  palette: {
    primary: string
    secondary: string
    bg: string
    text: string
  }
  fonts: {
    heading: string  // nome da fonte para referência
    body: string
  }
  heroImage: string     // path em /public/universes/{slug}/hero.jpg
  cardImage: string     // path em /public/universes/{slug}/card.jpg
  ogImage: string       // path em /public/universes/{slug}/og.jpg
  seoTitle: string
  seoDescription: string
  whatsappMessage: string  // cenário 7.6 — mensagem específica
  sortOrder: number        // cenário 2.6 — ordem padrão
}

export const UNIVERSE_CONFIG: Record<string, UniverseConfig> = {
  'gaming': {
    slug: 'gaming',
    name: 'Gaming',
    tagline: 'Setup com atitude. Neon, energia e performance.',
    persona: 'O Gamer (18–28)',
    palette: { primary: '#00ff41', secondary: '#ff00ff', bg: '#0a0a0a', text: '#f0f0f0' },
    fonts: { heading: 'Orbitron', body: 'Inter' },
    heroImage: '/universes/gaming/hero.jpg',
    cardImage: '/universes/gaming/card.jpg',
    ogImage: '/universes/gaming/og.jpg',
    seoTitle: 'Gaming — Produtos 3D Personalizados para Gamers',
    seoDescription: 'Impressão 3D com identidade gamer. Suportes, organizadores e acessórios personalizados para o seu setup.',
    whatsappMessage: 'Olá! Vi o universo Gaming e quero criar um produto personalizado para o meu setup!',
    sortOrder: 0,
  },
  'anime-nerd': {
    slug: 'anime-nerd',
    name: 'Anime & Nerd',
    tagline: 'Seu universo favorito em cada detalhe.',
    persona: 'Fã de Anime (16–28)',
    palette: { primary: '#c44dff', secondary: '#ff6b9d', bg: '#ffffff', text: '#1a1a1a' },
    fonts: { heading: 'Fredoka One', body: 'Nunito' },
    heroImage: '/universes/anime-nerd/hero.jpg',
    cardImage: '/universes/anime-nerd/card.jpg',
    ogImage: '/universes/anime-nerd/og.jpg',
    seoTitle: 'Anime & Nerd — Produtos 3D Personalizados para Fãs',
    seoDescription: 'Produtos impressos em 3D com referências de anime e cultura nerd. Personalize com o seu personagem favorito.',
    whatsappMessage: 'Olá! Vi o universo Anime & Nerd e quero criar um produto personalizado para minha coleção!',
    sortOrder: 1,
  },
  'casa-decor': {
    slug: 'casa-decor',
    name: 'Casa & Decor',
    tagline: 'Funcionalidade com design que impressiona.',
    persona: 'A Decoradora (25–45)',
    palette: { primary: '#8b6914', secondary: '#2c2c2c', bg: '#faf8f5', text: '#2c2c2c' },
    fonts: { heading: 'Playfair Display', body: 'Lato' },
    heroImage: '/universes/casa-decor/hero.jpg',
    cardImage: '/universes/casa-decor/card.jpg',
    ogImage: '/universes/casa-decor/og.jpg',
    seoTitle: 'Casa & Decor — Objetos 3D Personalizados para sua Casa',
    seoDescription: 'Peças decorativas e utilitários impressos em 3D com design exclusivo para sua casa.',
    whatsappMessage: 'Olá! Vi o universo Casa & Decor e quero criar uma peça personalizada para minha decoração!',
    sortOrder: 2,
  },
  'presentes': {
    slug: 'presentes',
    name: 'Presentes',
    tagline: 'Presentes que contam histórias.',
    persona: 'O Presenteador (20–50)',
    palette: { primary: '#e8521a', secondary: '#2c2c2c', bg: '#fff9f0', text: '#2c2c2c' },
    fonts: { heading: 'Merriweather', body: 'Open Sans' },
    heroImage: '/universes/presentes/hero.jpg',
    cardImage: '/universes/presentes/card.jpg',
    ogImage: '/universes/presentes/og.jpg',
    seoTitle: 'Presentes — Produtos 3D Personalizados para Presentear',
    seoDescription: 'Presentes únicos e personalizados impressos em 3D. Para quem você ama, com o nome e detalhe que só você sabe.',
    whatsappMessage: 'Olá! Vi o universo Presentes e quero criar um presente personalizado único!',
    sortOrder: 3,
  },
  'auto': {
    slug: 'auto',
    name: 'Auto',
    tagline: 'Clássicos merecem acessórios à altura.',
    persona: 'Entusiasta Auto (25–45)',
    palette: { primary: '#c0392b', secondary: '#f5f5f5', bg: '#1a1a1a', text: '#f5f5f5' },
    fonts: { heading: 'Bebas Neue', body: 'Roboto' },
    heroImage: '/universes/auto/hero.jpg',
    cardImage: '/universes/auto/card.jpg',
    ogImage: '/universes/auto/og.jpg',
    seoTitle: 'Auto — Peças 3D Personalizadas para Entusiastas',
    seoDescription: 'Acessórios e peças impressos em 3D para carros e entusiastas automotivos. Personalização de alto nível.',
    whatsappMessage: 'Olá! Vi o universo Auto e quero criar uma peça personalizada para o meu carro!',
    sortOrder: 4,
  },
}

export const UNIVERSE_SLUGS = Object.keys(UNIVERSE_CONFIG) as string[]
```

---

## 10. Migrações Necessárias

### 10.1 Ordem de Execução das Migrations Prisma

**Migration 1: `add_universe_and_product_universe`**
```sql
-- Cria tabela Universe
CREATE TABLE "Universe" (
    "id"          TEXT NOT NULL PRIMARY KEY,
    "slug"        TEXT NOT NULL UNIQUE,
    "name"        TEXT NOT NULL,
    "comingSoon"  BOOLEAN NOT NULL DEFAULT false,
    "sortOrder"   INTEGER NOT NULL DEFAULT 0,
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"   TIMESTAMP(3) NOT NULL
);

-- Cria tabela de junção M:N
CREATE TABLE "ProductUniverse" (
    "productId"   TEXT NOT NULL,
    "universeId"  TEXT NOT NULL,
    CONSTRAINT "ProductUniverse_pkey" PRIMARY KEY ("productId", "universeId"),
    CONSTRAINT "ProductUniverse_productId_fkey"  FOREIGN KEY ("productId")  REFERENCES "Product"("id") ON DELETE CASCADE,
    CONSTRAINT "ProductUniverse_universeId_fkey" FOREIGN KEY ("universeId") REFERENCES "Universe"("id") ON DELETE CASCADE
);

CREATE INDEX "ProductUniverse_universeId_idx" ON "ProductUniverse"("universeId");
CREATE INDEX "ProductUniverse_productId_idx"  ON "ProductUniverse"("productId");
```

**Migration 2: `add_testimonial`**
```sql
CREATE TABLE "Testimonial" (
    "id"           TEXT NOT NULL PRIMARY KEY,
    "authorName"   TEXT NOT NULL,
    "authorPhoto"  TEXT,
    "productPhoto" TEXT,
    "text"         TEXT NOT NULL,
    "universeId"   TEXT,
    "isPublished"  BOOLEAN NOT NULL DEFAULT false,
    "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"    TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Testimonial_universeId_fkey" FOREIGN KEY ("universeId") REFERENCES "Universe"("id") ON DELETE SET NULL
);

CREATE INDEX "Testimonial_isPublished_idx"            ON "Testimonial"("isPublished");
CREATE INDEX "Testimonial_universeId_isPublished_idx" ON "Testimonial"("universeId", "isPublished");
```

**Seed: `seed_universes`**
```typescript
// prisma/seed.ts — inserir após migrations
await prisma.universe.createMany({
  data: [
    { slug: 'gaming',     name: 'Gaming',       comingSoon: false, sortOrder: 0 },
    { slug: 'anime-nerd', name: 'Anime & Nerd',  comingSoon: false, sortOrder: 1 },
    { slug: 'casa-decor', name: 'Casa & Decor',  comingSoon: false, sortOrder: 2 },
    { slug: 'presentes',  name: 'Presentes',     comingSoon: false, sortOrder: 3 },
    { slug: 'auto',       name: 'Auto',          comingSoon: true,  sortOrder: 4 },
  ],
  skipDuplicates: true,
})
```

**Seed: `seed_testimonials`** (mínimo 3 para ativar cenário 4.1)
```typescript
const gamingUniverse = await prisma.universe.findUnique({ where: { slug: 'gaming' } })

await prisma.testimonial.createMany({
  data: [
    { authorName: 'Carlos S.', text: 'Produto chegou perfeito, personalização incrível!', isPublished: true, universeId: gamingUniverse?.id },
    { authorName: 'Ana P.',    text: 'Presente para meu filho gamer. Ele adorou!',          isPublished: true, universeId: null },
    { authorName: 'João M.',   text: 'Qualidade surpreendente para o preço. Recomendo!',    isPublished: true, universeId: null },
  ]
})
```

### 10.2 Impacto em Dados Existentes

| Tabela | Impacto | Ação |
|--------|---------|------|
| `Product` | Nenhum — nenhum campo existente é alterado | Nenhuma |
| `Product.collectionId` | Permanece. Produtos com `collectionId` não ganham vínculo de universo automaticamente | Admin vincula manualmente no formulário de produto |
| `Collection` model | NÃO existe no schema atual — o campo `collectionId` em `Product` é uma string sem FK formal. Não há breaking change | Nenhuma |
| `User.preferredCollection` | Campo existente, já string. Passa a armazenar slug de universo (ex: "gaming") em vez de slug de coleção (ex: "gamer"). Dado existente pode ser incompatível se havia preferência salva com slug antigo (ex: "gamer" ≠ "gaming") | Script de migração de dados opcional: `UPDATE "User" SET "preferredCollection" = 'gaming' WHERE "preferredCollection" = 'gamer'` |
| `ThemePreference` | Não é utilizado pelo M05. Permanece inalterado | Nenhuma |

### 10.3 Comandos de Execução

```bash
# 1. Aplicar schema ao DB
npx prisma migrate dev --name add_universe_testimonial

# 2. Rodar seed dos universos e depoimentos
npx prisma db seed

# 3. Verificar migrações
npx prisma migrate status
```

---

## 11. Rastreabilidade F1–F10

Mapeamento completo de cada feature da spec para os artefatos de código correspondentes.

| Feature | Cenários | Arquivo(s) de código |
|---------|----------|---------------------|
| **F1: Hero Section** | 1.1, 1.2, 1.3, 1.4, 1.5 | `src/app/page.tsx`, `src/components/universe/HeroSection.tsx` |
| **F2: Navegador de Universos** | 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8 | `src/app/page.tsx`, `src/components/universe/UniversosSection.tsx`, `src/components/universe/UniversoCard.tsx`, `src/config/universes.ts` |
| **F3: Como Funciona** | 3.1, 3.2, 3.3 | `src/app/page.tsx`, `src/components/universe/ComoFuncionaSection.tsx` |
| **F4: Prova Social** | 4.1, 4.2, 4.3, 4.4 (stretch) | `src/app/page.tsx`, `src/components/universe/ProvaSocialSection.tsx`, `prisma/schema.prisma` (Testimonial), `prisma/seed.ts` |
| **F5: Destaques por Universo** | 5.1, 5.2, 5.3, 5.4, 5.5 | `src/app/page.tsx`, `src/components/universe/DestaquesSection.tsx` |
| **F6: CTA WhatsApp LP** | 6.1, 6.2, 6.3, 6.4 | `src/app/page.tsx`, `src/components/universe/WhatsAppCTA.tsx` |
| **F7: Páginas de Universo** | 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7 | `src/app/universo/[slug]/page.tsx`, `src/app/universo/[slug]/not-found.tsx`, `src/components/universe/UniversoProdutosGrid.tsx`, `src/components/universe/WhatsAppCTA.tsx`, `src/config/universes.ts` |
| **F8: Sistema de Tema Visual** | 8.1, 8.2, 8.3, 8.4, 8.5, 8.6 | `src/components/universe/UniverseThemeProvider.tsx`, `src/components/universe/UniverseThemeProvider.module.css`, `src/app/universo/[slug]/page.tsx` (fontes), `src/app/globals.css` |
| **F9: Persistência de Preferência** | 9.1, 9.2, 9.3, 9.4, 9.5, 9.6 | `src/app/api/user/preference/route.ts`, `src/components/universe/UniversePreferenceSetter.tsx`, `src/app/page.tsx` (leitura cookie), `prisma/schema.prisma` (User.preferredCollection) |
| **F10: SEO e Metadados** | 10.1, 10.2, 10.3, 10.4, 10.5 | `src/app/page.tsx` (metadata), `src/app/universo/[slug]/page.tsx` (generateMetadata), `src/app/universo/[slug]/not-found.tsx`, `src/config/universes.ts`, `public/universes/` |

### 11.1 Mapeamento de Regras de Negócio

| Regra de Negócio | Implementada em |
|-----------------|-----------------|
| RN-M05-01 (produto em múltiplos universos) | `prisma/schema.prisma` (ProductUniverse M:N) |
| RN-M05-02 (sem produtos → "Em breve" ou oculto) | `src/components/universe/UniversoCard.tsx` + `src/components/universe/UniversosSection.tsx` |
| RN-M05-03 (preferência não obrigatória) | Sem modal forçado — cenário 9.6 |
| RN-M05-04 (cookie 30 dias) | `src/app/api/user/preference/route.ts` |
| RN-M05-05 (logado: DB) | `src/app/api/user/preference/route.ts` |
| RN-M05-06 (WhatsApp condicional) | `src/components/universe/WhatsAppCTA.tsx` |
| RN-M05-07 (tema não altera checkout/carrinho) | `src/components/universe/UniverseThemeProvider.tsx` (escopo CSS Module) |
| RN-M05-08 (sem preço na LP) | `src/components/universe/HeroSection.tsx` (copy estático sem R$) |
| RN-M05-09 (SEO por universo) | `src/app/universo/[slug]/page.tsx` (generateMetadata) |
| RN-M05-10 (máx 3 destaques) | `src/app/page.tsx` (query com `take: 3`) |
| RN-M05-11 (preferido primeiro na grade) | `src/components/universe/UniversosSection.tsx` (lógica de sort) |
| RN-M05-12 (mensagem WhatsApp com universo) | `src/components/universe/WhatsAppCTA.tsx` + `src/config/universes.ts` |
| RN-M05-13 (Lighthouse ≥ 80/90) | `next/image priority`, ISR, fontes lazy por rota, CSS Modules |
| RN-M05-14 (UniverseThemeProvider scoped) | `UniverseThemeProvider.module.css` (CSS Module escoped) |

---

## Apêndice A — Arquivos Modificados vs. Criados

### Arquivos CRIADOS (novos em M05)

| Arquivo | Tipo |
|---------|------|
| `src/app/universo/[slug]/page.tsx` | Route page |
| `src/app/universo/[slug]/not-found.tsx` | Route not-found |
| `src/app/universo/[slug]/loading.tsx` | Route loading |
| `src/app/api/universes/route.ts` | API Route |
| `src/app/api/user/preference/route.ts` | API Route |
| `src/config/universes.ts` | Config estático |
| `src/components/universe/UniverseThemeProvider.tsx` | Server Component |
| `src/components/universe/UniverseThemeProvider.module.css` | CSS Module |
| `src/components/universe/UniversoCard.tsx` | Client Component |
| `src/components/universe/UniversosSection.tsx` | Server Component |
| `src/components/universe/HeroSection.tsx` | Server Component |
| `src/components/universe/ComoFuncionaSection.tsx` | Server Component |
| `src/components/universe/ProvaSocialSection.tsx` | Server Component |
| `src/components/universe/DestaquesSection.tsx` | Server Component |
| `src/components/universe/WhatsAppCTA.tsx` | Client Component |
| `src/components/universe/UniversoProdutosGrid.tsx` | Server Component |
| `src/components/universe/UniversePreferenceSetter.tsx` | Client Component |
| `public/universes/gaming/og.jpg` | Asset estático |
| `public/universes/gaming/hero.jpg` | Asset estático |
| `public/universes/gaming/card.jpg` | Asset estático |
| `public/universes/{outros slugs}/...` | Assets estáticos |
| `public/og-home.jpg` | Asset estático |

### Arquivos MODIFICADOS em M05

| Arquivo | Modificação |
|---------|-------------|
| `src/app/page.tsx` | Redesign completo LP — substitui conteúdo atual |
| `prisma/schema.prisma` | Adição de Universe, ProductUniverse, Testimonial |
| `src/app/api/admin/products/[id]/route.ts` | Suporte a campo `universes[]` no payload |
| `prisma/seed.ts` | Seed de universos e depoimentos |

### Arquivos INALTERADOS (zero breaking changes)

| Arquivo | Status |
|---------|--------|
| `src/app/produtos/page.tsx` | Inalterado |
| `src/app/produtos/[slug]/page.tsx` | Inalterado |
| `src/app/carrinho/page.tsx` | Inalterado |
| `src/app/checkout/page.tsx` | Inalterado |
| `src/app/colecoes/[slug]/page.tsx` | Inalterado |
| `src/app/(admin)/**` | Inalterado (exceto products/[id]) |
| `src/app/layout.tsx` | Inalterado |
| `src/app/globals.css` | Inalterado |
| `src/lib/auth.ts` | Inalterado |
| `src/lib/db.ts` | Inalterado |
| `src/components/shop/**` | Inalterados |
| `src/components/shared/**` | Inalterados |

---

> **Próximo passo:** Aprovação G1 pelo Product Owner.
> Após G1 aprovado, QA aciona FASE 2 (Test Authoring — RED) escrevendo testes para cada cenário Gherkin antes de qualquer implementação.
