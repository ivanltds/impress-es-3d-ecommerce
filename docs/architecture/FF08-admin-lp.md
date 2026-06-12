# FF08 — Arquitetura Técnica: Admin LP — Universos

> **Status:** APROVADO — pronto para G1
> **Fura-fila:** FF08 — Admin LP: Universos
> **Produzido por:** Full Stack Developer Agent (FASE 1 — Derivation)
> **Data:** 2026-06-11
> **Spec de origem:** `specs/M05-admin-lp.spec.md`
> **Stack:** Next.js 15 App Router · TypeScript strict · Tailwind CSS 4 · Prisma + Neon PostgreSQL · NextAuth.js v5 · Vercel Blob

---

## Sumário

1. [Visão Geral — Diagrama de Componentes](#1-visão-geral--diagrama-de-componentes)
2. [Schema Prisma — Model Universe Atualizado](#2-schema-prisma--model-universe-atualizado)
3. [Rotas API — Tabela e Assinaturas](#3-rotas-api--tabela-e-assinaturas)
4. [Página Admin — Estrutura de Componentes](#4-página-admin--estrutura-de-componentes)
5. [Integração Vercel Blob](#5-integração-vercel-blob)
6. [LP Changes — Interface e Lógica de Fallback](#6-lp-changes--interface-e-lógica-de-fallback)
7. [Dependências — Pacotes Novos](#7-dependências--pacotes-novos)
8. [Decisões Técnicas (DA)](#8-decisões-técnicas-da)
9. [Migração Upload de Produtos → Vercel Blob](#9-migração-upload-de-produtos--vercel-blob)

---

## 1. Visão Geral — Diagrama de Componentes

```
┌─────────────────────────────────────────────────────────────────────┐
│  Navegador (admin)                                                   │
│                                                                      │
│  /admin/universos  (Server Component — layout.tsx já faz auth)      │
│  └─ <UniversosAdminPage>  (Server Component)                        │
│       └─ <UniversosAdminClient>  (Client Component — 'use client')  │
│            ├─ <UniversoRow slug="gaming" ...>     ─┐                │
│            ├─ <UniversoRow slug="anime-nerd" ...>  │ lista 5 rows   │
│            ├─ <UniversoRow slug="casa-decor" ...>  │                │
│            ├─ <UniversoRow slug="presentes" ...>   │                │
│            └─ <UniversoRow slug="auto" ...>       ─┘                │
│                 └─ <UniversoEditDrawer>  (portal/modal)             │
│                      ├─ <ImageUploadField type="card">              │
│                      ├─ <ImageUploadField type="hero">              │
│                      ├─ <TaglineField>                              │
│                      ├─ <BulletField index={0}>                     │
│                      ├─ <BulletField index={1}>                     │
│                      └─ <BulletField index={2}>                     │
└─────────────────────────────────────────────────────────────────────┘
         │  fetch/PATCH/POST              │  fetch/PATCH/POST
         ▼                               ▼
┌──────────────────────────────────────────────────────┐
│  Next.js API Routes (App Router)                      │
│                                                       │
│  GET    /api/admin/universes                          │
│  GET    /api/admin/universes/[slug]                   │
│  PATCH  /api/admin/universes/[slug]                   │
│  POST   /api/admin/universes/[slug]/upload            │
└────────────┬─────────────────────────┬───────────────┘
             │                         │
             ▼                         ▼
    ┌─────────────────┐      ┌──────────────────────┐
    │   Prisma ORM    │      │    Vercel Blob SDK   │
    │   Neon PG DB    │      │   (@vercel/blob)     │
    │                 │      │                      │
    │  Universe.      │      │  Bucket público      │
    │  cardImageUrl   │◄─────│  URL retornada       │
    │  heroImageUrl   │      │  após put()          │
    │  tagline        │      └──────────────────────┘
    │  bullets        │
    └─────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│  Navegador (visitante LP)                                            │
│                                                                      │
│  / (page.tsx — Server Component, ISR revalidate=3600)               │
│  └─ <UniversosSection universes={universeData}>                     │
│       ├─ Pill cards: exibe <img> se cardImageUrl presente            │
│       └─ Painel direito: exibe <img> se heroImageUrl presente        │
│            fallback → decorativo (grid + glow) quando nulo          │
└─────────────────────────────────────────────────────────────────────┘
```

**Fluxo de upload em sequência:**

```
Cliente → POST /api/admin/universes/[slug]/upload
  1. Valida sessão (admin/operator)
  2. Valida MIME = image/png  → 422 se falhar
  3. Valida tamanho ≤ 5 MB    → 413 se falhar
  4. Valida magic bytes PNG   → 422 se falhar
  5. put(blobPath, bytes, { access: 'public' })  →  Vercel Blob
  6. prisma.universe.update({ cardImageUrl: blob.url })
  7. Retorna { url, type }  → 200
```

---

## 2. Schema Prisma — Model Universe Atualizado

```prisma
// ─── FF08: campos editáveis via admin ───────────────────────────────
// Motivação: RN-FF08-06 (URLs), RN-FF08-07/08 (validação), RN-FF08-10–13 (fallback LP)
model Universe {
  id           String   @id @default(cuid())
  slug         String   @unique
  name         String
  comingSoon   Boolean  @default(false)
  sortOrder    Int      @default(0)

  // FF08 — novos campos
  cardImageUrl String?  // URL pública Vercel Blob ou null → fallback decorativo no pill
  heroImageUrl String?  // URL pública Vercel Blob ou null → fallback grid+glow no painel
  tagline      String?  // quando null, usar UNIVERSE_CONFIG[slug].tagline (RN-FF08-12)
  bullets      String[] // array de 3 strings; vazio = usar UNIVERSE_DETAILS[slug].bullets (RN-FF08-13)

  products     ProductUniverse[]
  testimonials Testimonial[]

  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}
```

**Migration necessária:**

```bash
# gerar migration
npx prisma migrate dev --name ff08_universe_media_fields

# ou em produção / Vercel (sem shadow DB)
npx prisma db push
```

Os campos `cardImageUrl` e `heroImageUrl` são `String?` (nullable) — nenhum dado existente é quebrado. O campo `bullets` é `String[]` com default implícito de `[]` no PostgreSQL (array vazio), compatível com o fallback da LP.

---

## 3. Rotas API — Tabela e Assinaturas

### 3.1 Tabela de Rotas

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| `GET` | `/api/admin/universes` | admin/operator | Lista os 5 universos com todos os campos FF08 |
| `GET` | `/api/admin/universes/[slug]` | admin/operator | Retorna 1 universo pelo slug |
| `PATCH` | `/api/admin/universes/[slug]` | admin/operator | Atualiza `tagline` e `bullets` |
| `POST` | `/api/admin/universes/[slug]/upload` | admin/operator | Upload PNG → Vercel Blob → atualiza imageUrl |

### 3.2 Localização dos Arquivos

```
src/app/api/admin/universes/
├── route.ts                      ← GET /api/admin/universes
└── [slug]/
    ├── route.ts                  ← GET + PATCH /api/admin/universes/[slug]
    └── upload/
        └── route.ts              ← POST /api/admin/universes/[slug]/upload
```

### 3.3 Assinaturas Detalhadas

#### GET `/api/admin/universes`

```typescript
// Response 200
type GetUniversesResponse = UniverseAdminDTO[]

interface UniverseAdminDTO {
  id: string
  slug: string
  name: string
  comingSoon: boolean
  sortOrder: number
  cardImageUrl: string | null
  heroImageUrl: string | null
  tagline: string | null
  bullets: string[]
  updatedAt: string  // ISO 8601
}

// Response 401: { error: 'Unauthorized' }
// Response 403: { error: 'Forbidden' }
```

#### GET `/api/admin/universes/[slug]`

```typescript
// Params: slug — um dos 5 slugs fixos
// Response 200: UniverseAdminDTO (mesma interface acima)
// Response 401: { error: 'Unauthorized' }
// Response 404: { error: 'Universe not found' }
```

#### PATCH `/api/admin/universes/[slug]`

```typescript
// Request body
interface PatchUniverseBody {
  tagline: string   // obrigatório, 1–120 chars (RN-FF08-07)
  bullets: [string, string, string]  // exatamente 3 itens, cada um 5–100 chars (RN-FF08-08)
}

// Response 200
interface PatchUniverseResponse {
  slug: string
  tagline: string
  bullets: string[]
  updatedAt: string
}

// Response 400: { error: string, field?: string }  ← erros de validação
// Response 401: { error: 'Unauthorized' }
// Response 404: { error: 'Universe not found' }
```

Validação server-side obrigatória mesmo com validação client-side:
- `tagline.trim().length === 0` → `{ error: 'A tagline não pode ser vazia', field: 'tagline' }`
- `tagline.length > 120` → `{ error: 'Máximo de 120 caracteres', field: 'tagline' }`
- `bullets.length !== 3` → `{ error: 'Exatamente 3 bullets são obrigatórios', field: 'bullets' }`
- bullet com menos de 5 chars → `{ error: 'Mínimo de 5 caracteres por bullet', field: 'bullet_N' }`
- bullet com mais de 100 chars → `{ error: 'Máximo de 100 caracteres por bullet', field: 'bullet_N' }`

#### POST `/api/admin/universes/[slug]/upload`

```typescript
// Request: multipart/form-data
// FormData fields:
//   file: File          ← arquivo PNG
//   type: 'card' | 'hero'  ← qual URL atualizar

// Response 200
interface UploadResponse {
  url: string           // URL pública do Vercel Blob
  type: 'card' | 'hero'
  slug: string
}

// Response 400: { error: 'Campo type ausente ou inválido' }
// Response 401: { error: 'Unauthorized' }
// Response 404: { error: 'Universe not found' }
// Response 413: { error: 'Arquivo muito grande. Máximo permitido: 5 MB' }
// Response 422: { error: 'Apenas PNG é aceito (transparência obrigatória)' }
```

**Lógica do handler de upload (pseudocódigo):**

```typescript
export async function POST(req, { params }) {
  // 1. Auth
  const session = await auth()
  if (!isAdminOrOperator(session)) return 401

  // 2. Verificar se universo existe
  const universe = await prisma.universe.findUnique({ where: { slug: params.slug } })
  if (!universe) return 404

  // 3. Parse form data
  const formData = await req.formData()
  const file = formData.get('file') as File
  const type = formData.get('type') as string  // 'card' | 'hero'

  if (!['card', 'hero'].includes(type)) return 400

  // 4. Validar tipo MIME
  if (file.type !== 'image/png') return 422

  // 5. Validar tamanho
  if (file.size > 5 * 1024 * 1024) return 413

  // 6. Validar magic bytes (PNG = 89 50 4E 47)
  const bytes = Buffer.from(await file.arrayBuffer())
  if (!isPNG(bytes)) return 422

  // 7. Upload para Vercel Blob
  // Caminho determinístico: universes/{slug}/{type}.png
  // DA-01: pathname fixo → sobrescreve automaticamente (addRandomSuffix: false)
  const blobPath = `universes/${params.slug}/${type}.png`
  const blob = await put(blobPath, bytes, {
    access: 'public',
    contentType: 'image/png',
    addRandomSuffix: false,  // DA-01: garante URL determinística
  })

  // 8. Atualizar DB — só após upload bem-sucedido (RN-FF08-14)
  const updateField = type === 'card' ? 'cardImageUrl' : 'heroImageUrl'
  await prisma.universe.update({
    where: { slug: params.slug },
    data: { [updateField]: blob.url },
  })

  return { url: blob.url, type, slug: params.slug }
}
```

---

## 4. Página Admin — Estrutura de Componentes

### 4.1 Estrutura de Arquivos

```
src/app/admin/universos/
└── page.tsx                      ← Server Component (busca dados, passa para client)

src/components/admin/universos/
├── UniversosAdminClient.tsx      ← 'use client' — estado, lista, orchestração
├── UniversoRow.tsx               ← linha na tabela com ícones de status
├── UniversoEditDrawer.tsx        ← drawer/modal de edição (estado local)
├── ImageUploadField.tsx          ← input file + preview + botão upload
├── TaglineField.tsx              ← input text + contador + erro
└── BulletField.tsx               ← input text + contador + erro (índice 0,1,2)
```

### 4.2 Server Component (`page.tsx`)

```typescript
// src/app/admin/universos/page.tsx
// Server Component — autenticação já garantida pelo AdminLayout
import { prisma } from '@/lib/db'
import { UniversosAdminClient } from '@/components/admin/universos/UniversosAdminClient'

export default async function UniversosAdminPage() {
  const universes = await prisma.universe.findMany({
    orderBy: { sortOrder: 'asc' },
    select: {
      id: true, slug: true, name: true, comingSoon: true, sortOrder: true,
      cardImageUrl: true, heroImageUrl: true, tagline: true, bullets: true,
      updatedAt: true,
    },
  })

  return (
    <div className="p-6">
      <h1 className="font-heading text-2xl font-bold mb-6">Universos</h1>
      <UniversosAdminClient initialUniverses={universes} />
    </div>
  )
}
```

### 4.3 Client Component — Estado React

```typescript
// src/components/admin/universos/UniversosAdminClient.tsx
'use client'

interface UniverseAdminDTO {
  id: string
  slug: string
  name: string
  comingSoon: boolean
  sortOrder: number
  cardImageUrl: string | null
  heroImageUrl: string | null
  tagline: string | null
  bullets: string[]
  updatedAt: string
}

interface UniversosAdminClientProps {
  initialUniverses: UniverseAdminDTO[]
}

// Estado principal do componente:
// - universes: UniverseAdminDTO[]  (lista local, atualizada otimisticamente após PATCH/upload)
// - editingSlug: string | null     (qual drawer está aberto)
// - toast: { message: string, type: 'success' | 'error' } | null
```

**Fluxo de estado para PATCH (tagline/bullets):**

1. Usuário edita campos → estado local no `UniversoEditDrawer`
2. Clica "Salvar" → validação client-side (desabilita botão se inválido)
3. `fetch('PATCH /api/admin/universes/[slug]', body)` 
4. Sucesso → atualiza `universes` no estado pai (passa callback `onUpdate`) + exibe toast
5. Erro → exibe mensagem de erro inline

**Fluxo de estado para upload:**

1. Usuário seleciona arquivo → preview local via `URL.createObjectURL(file)`
2. Clica "Upload" → `uploadFile(file, type)` que chama POST
3. Loading indicator no botão durante fetch
4. Sucesso → `onUpdate` com nova URL + toast "Imagem atualizada"
5. Erro → mensagem inline no `ImageUploadField`

### 4.4 Componente `UniversoRow`

Exibe linha com:
- Nome do universo
- 3 ícones de status (card image, hero image, tagline):
  - `data-testid="status-card-image-{slug}"` — CheckCircle (verde) ou Circle (cinza)
  - `data-testid="status-hero-image-{slug}"` — idem
  - `data-testid="status-tagline-{slug}"` — idem
- Botão "Editar" que abre `UniversoEditDrawer`

### 4.5 Componente `UniversoEditDrawer`

Drawer lateral (ou modal) com:

```
┌─────────────────────────────────────────┐
│  Editar: Gaming                          │
├─────────────────────────────────────────┤
│  IMAGEM DO CARD                          │
│  [Preview 120×120px]  [input file PNG]  │
│  [btn-upload-card]    [error-card-image] │
├─────────────────────────────────────────┤
│  IMAGEM HERO                             │
│  [Preview 240×160px]  [input file PNG]  │
│  [btn-upload-hero]    [error-hero-image] │
├─────────────────────────────────────────┤
│  TAGLINE                                 │
│  [input-tagline]  (0/120)               │
│  [error-tagline]                         │
├─────────────────────────────────────────┤
│  BULLETS (3 campos)                      │
│  [input-bullet-0]  (0/100)              │
│  [input-bullet-1]  (0/100)              │
│  [input-bullet-2]  (0/100)              │
│  [error-bullet-N]                        │
├─────────────────────────────────────────┤
│  [btn-save-text]  Salvar conteúdo        │
└─────────────────────────────────────────┘
```

**Valores iniciais dos campos de texto:** populados com `universe.tagline ?? UNIVERSE_CONFIG[slug].tagline` e `universe.bullets.length === 3 ? universe.bullets : UNIVERSE_DETAILS[slug].bullets` — o admin vê sempre um valor, nunca um campo vazio ao abrir.

### 4.6 Adicionar "Universos" ao Nav Admin

Arquivo `/src/app/admin/layout.tsx` — adicionar item ao array `NAV`:

```typescript
{ href: '/admin/universos', label: 'Universos', icon: Globe }
// Globe importado de 'lucide-react'
```

---

## 5. Integração Vercel Blob

### 5.1 Instalação

```bash
npm install @vercel/blob
```

Variável de ambiente necessária (já configurada em projetos Vercel Blob):

```
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_...
```

Para desenvolvimento local, adicionar ao `.env.local`.

> **Nota:** O mesmo `BLOB_READ_WRITE_TOKEN` é compartilhado entre o upload de imagens de universos (`/api/admin/universes/[slug]/upload`) e o upload de imagens de produtos (`/api/admin/upload`). Ver seção 9 para detalhes da migração de produtos.

### 5.2 Uso do `put()`

```typescript
import { put } from '@vercel/blob'

// Upload com pathname determinístico (DA-01)
const blob = await put(
  `universes/${slug}/${type}.png`,   // pathname no bucket
  fileBuffer,                         // Buffer | ArrayBuffer | ReadableStream
  {
    access: 'public',                 // URL acessível sem autenticação
    contentType: 'image/png',
    addRandomSuffix: false,           // sobrescreve arquivo existente (mesmo pathname)
  }
)

// blob.url = URL pública permanente
// Exemplo: https://abc123.public.blob.vercel-storage.com/universes/gaming/card.png
```

### 5.3 URL Resultante

A URL retornada por `put()` é:
- **Permanente** — não expira
- **Pública** — acessível sem token
- **Deterministicamente sobrescrita** — `addRandomSuffix: false` + mesmo pathname garante que um segundo upload substitui o anterior sem criar arquivos órfãos (atende RN-FF08-05 adaptado para Vercel Blob)

O campo `cardImageUrl` / `heroImageUrl` no banco armazena esta URL completa (ex: `https://abc.public.blob.vercel-storage.com/universes/gaming/card.png`), não um path relativo — diferença importante em relação ao que a spec original descreve para filesystem local.

### 5.4 Exibição na LP

```tsx
// Na LP, a URL vem diretamente do campo DB (URL absoluta Vercel Blob)
// Não requer prefix — já é uma URL completa HTTPS
<img
  src={universe.cardImageUrl}    // "https://abc.public.blob.vercel-storage.com/..."
  alt={universe.name}
  data-testid={`card-universe-image-${universe.slug}`}
/>
```

Para `next/image` (opcional, mas recomendado para performance), adicionar o domínio ao `next.config.ts`:

```typescript
images: {
  remotePatterns: [
    { protocol: 'https', hostname: '*.public.blob.vercel-storage.com' },
  ],
}
```

---

## 6. LP Changes — Interface e Lógica de Fallback

### 6.1 Interface `UniverseData` Atualizada

```typescript
// src/components/universe/UniversosSection.tsx
interface UniverseData {
  slug: string
  name: string
  comingSoon: boolean
  sortOrder: number
  publishedProductCount?: number
  // FF08 — novos campos opcionais
  cardImageUrl?: string | null
  heroImageUrl?: string | null
  tagline?: string | null
  bullets?: string[] | null
}
```

### 6.2 Atualização em `page.tsx`

O `prisma.universe.findMany` já retorna todos os campos — apenas incluir os novos na transformação `universeData`:

```typescript
// src/app/page.tsx — alterar o map de normalização
const universeData = universes.length > 0
  ? universes.map((u: any) => ({
      slug: u.slug as string,
      name: (u.name || UNIVERSE_CONFIG[u.slug]?.name || u.slug) as string,
      comingSoon: Boolean(u.comingSoon),
      sortOrder: Number(u.sortOrder ?? 0),
      publishedProductCount: 0,
      // FF08: novos campos
      cardImageUrl: u.cardImageUrl ?? null,
      heroImageUrl: u.heroImageUrl ?? null,
      tagline: u.tagline ?? null,
      bullets: u.bullets ?? [],
    }))
  : Object.values(UNIVERSE_CONFIG).map(c => ({
      slug: c.slug,
      name: c.name,
      comingSoon: false,
      sortOrder: c.sortOrder,
      publishedProductCount: 0,
      cardImageUrl: null,
      heroImageUrl: null,
      tagline: null,
      bullets: [],
    }))
```

### 6.3 Lógica de Fallback em `UniversosSection.tsx`

**Tagline** (cenários 5.3 e 6.3):

```typescript
// Antes (atual):
<h3>{activeConfig?.tagline}</h3>

// Depois (FF08):
const displayTagline = activeUniverse?.tagline ?? activeConfig?.tagline ?? ''
<h3>{displayTagline}</h3>
```

**Bullets** (cenários 5.4 e 6.4):

```typescript
// Antes (atual):
const bullets = details?.bullets ?? []

// Depois (FF08):
const dbBullets = activeUniverse?.bullets
const displayBullets =
  dbBullets && dbBullets.length === 3
    ? dbBullets
    : (details?.bullets ?? [])
```

**Card image no pill** (cenários 5.1 e 6.1):

```typescript
// Dentro do map de pill cards (botão por universo)
// Antes: apenas nome do universo
// Depois: condicional — se cardImageUrl, exibe imagem; senão, continua exibindo nome

{u.cardImageUrl ? (
  <img
    src={u.cardImageUrl}
    alt={cfg?.name ?? u.name}
    data-testid={`card-universe-image-${u.slug}`}
    className="w-10 h-10 object-contain"
  />
) : null}
{cfg?.name ?? u.name}
```

**Hero image no painel direito** (cenários 5.2 e 6.2):

```typescript
// Painel direito — substituir toda a div decorativa por condicional
{activeUniverse?.heroImageUrl ? (
  // Com imagem: renderizar apenas a img, sem o decorativo
  <div className="hidden md:flex items-center justify-center rounded-2xl overflow-hidden relative"
       style={{ border: '1px solid ' + details?.accent + '30', minHeight: '320px' }}>
    <img
      src={activeUniverse.heroImageUrl}
      alt={activeConfig?.name}
      data-testid="hero-universe-image"
      className="w-full h-full object-cover"
    />
  </div>
) : (
  // Sem imagem: manter painel decorativo atual (grid + glow + nome grande)
  <div className="hidden md:flex items-center justify-center rounded-2xl overflow-hidden relative"
       style={{ background: details?.bgGradient, border: '1px solid ' + details?.accent + '30', minHeight: '320px' }}>
    {/* ... código decorativo atual sem alteração ... */}
  </div>
)}
```

---

## 7. Dependências — Pacotes Novos

| Pacote | Versão recomendada | Motivo | Instalação |
|--------|--------------------|--------|------------|
| `@vercel/blob` | `^0.27` | Upload e storage de imagens PNG dos universos (DA-01) e imagens de produtos (seção 9) | `npm install @vercel/blob` |

**Variáveis de ambiente — uso consolidado:**

| Variável | Usada por |
|----------|-----------|
| `BLOB_READ_WRITE_TOKEN` | Upload de imagens de universos (`/api/admin/universes/[slug]/upload`) **e** upload de imagens de produtos (`/api/admin/upload`) |

**Nenhum outro pacote novo é necessário.** O projeto já possui:
- `framer-motion` — animações do drawer/modal
- `lucide-react` — ícones de status
- `next-auth` v5 — autenticação
- `prisma` + `@prisma/client` — ORM

---

## 8. Decisões Técnicas (DA)

### DA-01: Storage de Imagens — Vercel Blob vs Filesystem Local

**Opção escolhida: Vercel Blob (`@vercel/blob`)**

**Alternativas consideradas:**

| Opção | Prós | Contras |
|-------|------|---------|
| A) Filesystem local `public/universes/{slug}/` | Zero custo, sem dependência extra, URL relativa simples | Não funciona em Vercel cloud (runtime read-only), não persiste entre deploys, inviável em produção |
| B) Base64 no banco (padrão existente no projeto) | Já implementado, zero nova dependência | Degrada performance da query de LP, imagens de 5 MB viram ~6.7 MB de texto, Neon PostgreSQL tem row size limits |
| **C) Vercel Blob** | URLs permanentes públicas, CDN automático, funciona em Vercel cloud, sobrescrita determinística com `addRandomSuffix: false` | Custo por GB/mês (free tier 512 MB), requer `BLOB_READ_WRITE_TOKEN` em produção |

**Justificativa:** A spec nota explicitamente que filesystem local não funciona em Vercel cloud (D3 na tabela de dependências). Vercel Blob é a solução canônica para projetos Next.js no Vercel — integração nativa, 1 pacote, URLs CDN. O padrão base64 existente (`/api/admin/upload`) funciona para imagens de produto menores (2 MB limite), mas é inadequado para imagens PNG de universos que podem ter até 5 MB.

---

### DA-02: Pathname Determinístico no Vercel Blob (`addRandomSuffix: false`)

**Opção escolhida: pathname fixo `universes/{slug}/{type}.png` com `addRandomSuffix: false`**

**Alternativas consideradas:**

| Opção | Comportamento |
|-------|---------------|
| A) Pathname fixo + `addRandomSuffix: false` | Mesmo pathname → sobrescreve objeto existente no bucket → URL permanece a mesma no banco |
| B) Pathname com timestamp/hash | Cada upload gera URL nova → banco sempre atualizado → mas deixa arquivos órfãos no bucket a cada upload |

**Justificativa:** O cenário 2.4 exige que o upload substitua a imagem anterior sem criar duplicatas (`card-2.png`, etc.). A opção A garante isso: o pathname `universes/gaming/card.png` existe uma única vez no bucket. A URL no banco permanece a mesma após o segundo upload (o conteúdo do blob muda, a URL não), o que é suficiente — o browser fará cache miss naturalmente por mudança de conteúdo.

---

### DA-03: Validação Client-Side + Server-Side Dupla para tagline/bullets

**Opção escolhida: validação em ambas as camadas**

**Alternativas consideradas:**

| Opção | Trade-offs |
|-------|------------|
| A) Só client-side | Rápido, sem round-trip; mas API vulnerável a chamadas diretas sem validação |
| B) Só server-side | Seguro; mas UX ruim — botão só bloqueia após round-trip |
| **C) Ambas** | Client-side desabilita botão imediatamente (cenários 4.3 e 4.6: `disabled` presente); server-side rejeita chamadas diretas à API |

**Justificativa:** Os cenários Gherkin exigem explicitamente que o `btn-save-text` fique com `disabled` antes mesmo de chamar a API (cenários 4.3 e 4.6: "A API não deve ser chamada"). Isso só é possível com validação client-side. A validação server-side é obrigatória por segurança. As regras de validação são idênticas em ambas as camadas.

---

### DA-04: Separação Server Component / Client Component na Página Admin

**Opção escolhida: Server Component busca dados, Client Component gerencia estado**

**Padrão utilizado:**
```
/admin/universos/page.tsx   → Server Component → await prisma.universe.findMany()
UniversosAdminClient.tsx    → 'use client' → useState + fetch para mutações
```

**Justificativa:** O AdminLayout já garante autenticação server-side (redireciona se não autenticado). A busca inicial de dados é feita server-side para evitar flash de loading. As mutações (PATCH, upload) precisam de interatividade, logo 'use client'. Este é o padrão canônico do Next.js App Router — já usado em `/admin/produtos/page.tsx` e outras páginas admin do projeto.

---

### DA-05: Estratégia de Invalidação de Cache ISR na LP

**Situação:** `page.tsx` tem `export const revalidate = 3600` (ISR de 1 hora). Após um admin salvar tagline ou fazer upload, a LP pode mostrar dados desatualizados por até 1 hora.

**Opção escolhida: revalidação via `revalidatePath` na API route após mutação bem-sucedida**

```typescript
// No final do handler PATCH e POST upload, após sucesso:
import { revalidatePath } from 'next/cache'
revalidatePath('/')  // força revalidação imediata da homepage
```

**Alternativas consideradas:**

| Opção | Trade-offs |
|-------|------------|
| A) Aguardar 1 hora (ISR natural) | Zero código extra; mas admin vê mudança imediata no painel, LP demora 1h |
| **B) `revalidatePath('/')` após mutação** | Invalidação imediata; requer import de `next/cache` nas routes |
| C) On-demand ISR via webhook externo | Overkill para este caso |

**Justificativa:** O admin espera que sua edição reflita imediatamente na LP. Chamar `revalidatePath('/')` no final dos handlers de PATCH e upload é a solução mais simples e direta. O ISR de 1 hora continua como fallback para leituras sem mutação.

---

---

## 9. Migração Upload de Produtos → Vercel Blob

### 9.1 Situação Atual

A rota `POST /api/admin/upload` (`src/app/api/admin/upload/route.ts`) opera com o seguinte fluxo:

1. Recebe `multipart/form-data` com campo `file`
2. Valida tipo MIME (JPEG, PNG, WebP, GIF) e tamanho (≤ 2 MB)
3. Valida magic bytes contra spoofing de extensão
4. Converte o buffer para string base64 e monta um data URL: `data:image/jpeg;base64,...`
5. Retorna `{ url, name, size }` — onde `url` é a data URL base64

O model `Product` armazena esse retorno diretamente no campo `images String[]`, resultando em rows do banco com conteúdo binário embutido como texto.

**Problemas identificados:**
- **DB bloat:** base64 gera ~1.37× o tamanho original em texto; num array de múltiplas imagens por produto, o row pode facilmente ultrapassar centenas de KB
- **Queries lentas:** `SELECT * FROM "Product"` retorna todo o conteúdo binário das imagens a cada query — sem índice ou cache CDN
- **Neon free tier em risco:** o Neon PostgreSQL free tier tem limite de 512 MB de armazenamento; produtos com muitas imagens aceleram o consumo

### 9.2 O Que Muda

| Aspecto | Antes | Depois |
|---------|-------|--------|
| Rota | `POST /api/admin/upload` | Mesma rota |
| Implementação interna | `bytes.toString('base64')` → data URL | `put()` do `@vercel/blob` → URL CDN |
| Resposta `url` | `data:image/jpeg;base64,...` | `https://abc.public.blob.vercel-storage.com/products/...` |
| `Product.images` armazena | Data URLs base64 | URLs absolutas CDN |
| Limite de tamanho | 2 MB | 5 MB |
| Backward compatibility | — | Imagens antigas em base64 continuam funcionando; somente novos uploads usam Blob |

O campo `url` na resposta JSON **continua existindo com o mesmo nome** — o frontend de produtos não requer alteração de contrato.

### 9.3 Código da Rota Atualizada

```typescript
// src/app/api/admin/upload/route.ts — migrado para Vercel Blob
import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { auth } from '@/lib/auth'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const MAX_SIZE = 5 * 1024 * 1024  // aumentado de 2 MB para 5 MB

const VALID_SIGNATURES = ['ffd8ff', '89504e47', '52494646', '47494638']

function validateMagicBytes(buffer: Buffer): boolean {
  const hex = buffer.slice(0, 4).toString('hex')
  return VALID_SIGNATURES.some((sig) => hex.startsWith(sig))
}

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 })

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Tipo não permitido. Use: JPG, PNG, WebP ou GIF' }, { status: 400 })
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'Arquivo muito grande. Máximo: 5MB' }, { status: 400 })
    }

    const bytes = Buffer.from(await file.arrayBuffer())
    if (!validateMagicBytes(bytes)) {
      return NextResponse.json({ error: 'Arquivo inválido — não é uma imagem real' }, { status: 400 })
    }

    // Gera pathname único com timestamp + random suffix para evitar colisões
    const ext = file.type.split('/')[1]  // jpeg, png, webp, gif
    const filename = `products/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

    const blob = await put(filename, bytes, {
      access: 'public',
      contentType: file.type,
    })

    return NextResponse.json({ url: blob.url, name: file.name, size: file.size })
  } catch (err) {
    console.error('[upload] Error:', err)
    return NextResponse.json({ error: 'Erro ao processar upload' }, { status: 500 })
  }
}
```

**Diferença de strategy em relação aos universos (DA-02):** o upload de produtos usa `addRandomSuffix` implícito (default `true`) e pathname com timestamp, pois um produto pode ter múltiplas imagens e cada upload deve criar um novo blob — não sobrescrever. Universos usam `addRandomSuffix: false` porque têm exatamente uma imagem card e uma hero por slug (pathname determinístico).

### 9.4 Compatibilidade Retroativa

Imagens de produtos já salvas no banco como data URLs base64 (`data:image/jpeg;base64,...`) **continuam funcionando** sem necessidade de migração de dados:

- `<img src={...}>` aceita tanto data URLs quanto URLs absolutas HTTPS
- `next/image` com `src` de data URL funciona sem configuração adicional
- A migração é gradual: quando o admin faz re-upload de uma imagem existente, ela passa a ser armazenada como URL CDN

Não é necessário um script de migração de dados para o lançamento.

### 9.5 Variável de Ambiente

```
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_...
```

A **mesma variável** usada para os uploads de universos (seção 5.1). Não é necessário criar token adicional — ambas as rotas compartilham o mesmo bucket Vercel Blob, segregadas por prefixo de pathname:

- Universos: `universes/{slug}/{type}.png`
- Produtos: `products/{timestamp}-{random}.{ext}`

### 9.6 Configuração `next.config.ts`

Se `next/image` for usado para renderizar imagens de produtos (verificar implementação atual em `src/app/admin/produtos/`), adicionar o domínio ao `remotePatterns`:

```typescript
// next.config.ts
images: {
  remotePatterns: [
    { protocol: 'https', hostname: '*.public.blob.vercel-storage.com' },
  ],
}
```

Este padrão já cobre **tanto universos quanto produtos** — uma única entrada é suficiente. Se já foi adicionado para a implementação dos universos (seção 5.4), nenhuma alteração adicional em `next.config.ts` é necessária.

---

## Rastreabilidade Spec ↔ Arquitetura

| Cenário Spec | Componente / Arquivo | Elemento |
|--------------|----------------------|---------|
| 1.1 — Lista 5 universos | `UniversosAdminClient` | `data-testid="admin-universos-list"` |
| 1.2 — Status por campo | `UniversoRow` | `data-testid="status-card-image-{slug}"` etc. |
| 1.3 — Auth exigida | `AdminLayout` (já existe) | `redirect('/auth/entrar')` |
| 2.1 — Upload card happy path | `POST /api/admin/universes/[slug]/upload` | Vercel Blob + Prisma update |
| 2.2 — Reject MIME inválido | Route handler upload | Checar `file.type !== 'image/png'` → 422 |
| 2.3 — Reject tamanho > 5 MB | Route handler upload | `file.size > 5MB` → 413 |
| 2.4 — Sobrescrita sem duplicata | DA-02 | `addRandomSuffix: false` |
| 3.1/3.2/3.3 — Hero upload | Mesma route, `type='hero'` | `heroImageUrl` atualizado |
| 4.1/4.4 — Salvar tagline/bullets | `PATCH /api/admin/universes/[slug]` | Validação + Prisma update |
| 4.2 — Rejeitar tagline vazia | Client + server validation | `error-tagline` + btn não chamado |
| 4.3/4.6 — Rejeitar > max chars | Client validation | `btn-save-text` disabled |
| 5.1–5.4 — Fallbacks na LP | `UniversosSection.tsx` | Lógica de fallback seção 6.3 |
| 6.1–6.4 — Dados do banco na LP | `page.tsx` + `UniversosSection.tsx` | Interface atualizada seção 6.1/6.2 |
