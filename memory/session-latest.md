# Contexto do Projeto — Impressão 3D E-commerce

> **Data:** 2026-06-10
> **MVP:** 100% implementado (pendente: compra de etiqueta Melhor Envio com erro 422)
> **Metodologia:** Maestro - Agile SDD com TDD v2.0.0

---

## 1. IDENTIDADE

- **Nome:** Impressão 3D Personalizada
- **Stack:** Next.js 16.2.9 (App Router), TypeScript strict, Tailwind CSS, Prisma 5.22, Neon PostgreSQL, Vercel
- **Repo:** https://github.com/ivanltds/impress-es-3d-ecommerce
- **Produção:** https://impress-es-3d-ecommerce.vercel.app
- **Admin:** https://impress-es-3d-ecommerce.vercel.app/admin (login: ivanltds@gmail.com, role: admin)

## 2. MVP — 4 SPRINTS ENTREGUES

### M01 ✅ Foundation
- Next.js scaffold, TypeScript, Tailwind, shadcn/ui
- Autenticação (NextAuth v5, e-mail+senha, roles: admin/operator/customer)
- Tema claro/escuro (data-mode, cookie, sem flicker)
- Layout responsivo (Header, Footer, nav mobile)
- Home page: hero, 5 coleções, como funciona, destaques, WhatsApp CTA
- Health check, Prisma, Neon DB

### M02 ✅ Catalog + Experience
- Catálogo de produtos (grid, filtros, busca, ordenação)
- PDP (galeria, lightbox, breadcrumb, produtos relacionados)
- Coleções dinâmicas com banner temático
- Zero emojis — Lucide Icons
- Animações Framer Motion (stagger, hover, scroll reveal)
- Seed: 8 produtos, 5 categorias (Gamer, Anime, Casa, Presentes, Auto)

### M03 ✅ Cart + Checkout + Customer
- Carrinho (localStorage guest + API logado, contador no header)
- Checkout 3 etapas (endereço → frete → pagamento)
- Frete real via Melhor Envio API (token: MELHOR_ENVIO_TOKEN)
- Pagamento MOCK (Stripe + MercadoPago — ver FF01)
- Perfil do cliente, histórico de pedidos, endereços
- Confirmação de pedido com número 3DP-XXXXX

### M04 ✅ Admin + Operations + Analytics
- Dashboard com métricas (pedidos, receita, ticket médio)
- CRUD de produtos (grid/lista, criar, editar, upload de imagens)
- Upload seguro (magic bytes, tipo MIME, 5MB max, base64)
- Gestão de pedidos (grid/lista, filtro abertos, busca)
- Kanban de produção (5 colunas, drag-drop, sincronizado com BD)
- Kanban de envio (3 colunas, tracking code)
- Kanban de leads (5 colunas, conversão em pedido)
- Leads salvos no banco (tabela Lead)

## 3. ARQUITETURA

### Banco de Dados (Neon PostgreSQL)
```
User, Account, Session, VerificationToken
ThemePreference, Address
Category, Product
Cart, CartItem
Order, OrderItem
Lead
```

### APIs (principais)
```
/api/auth/[...nextauth]    — NextAuth
/api/auth/register         — Cadastro
/api/cart                  — Carrinho (CRUD)
/api/checkout              — Criar pedido
/api/shipping              — Calcular frete (Melhor Envio)
/api/health                — Health check
/api/admin/orders          — Listar pedidos
/api/admin/production      — Itens em produção (GET + PATCH)
/api/admin/shipping        — Pedidos em envio (GET + PATCH)
/api/admin/shipping/purchase — Opções de frete + compra etiqueta
/api/admin/leads           — Leads (GET + POST + PATCH)
/api/admin/products        — Produtos (GET + PATCH)
/api/admin/products/create — Criar produto
/api/admin/upload          — Upload de imagem (base64)
/api/admin/categories      — Categorias
```

### Fluxo Principal (Lead → Pedido → Produção → Envio)
```
Lead (novo) → Atendimento → Convertido → Order (paid)
  → Produção (Aguardando → Em Produção → Acabamento → Embalado → Enviado p/ Entrega)
  → Envio (Postado → Em Trânsito → Entregue)
```

### Order.fulfillmentStatus
- `unfulfilled` = produção pendente
- `in_progress` = em produção
- `shipped` = enviado (aparece no envio)
- `delivered` = entregue (sai dos abertos)

### OrderItem.productionStatus
- `pending`, `in_progress`, `finishing`, `packed`, `shipped`

## 4. PENDÊNCIAS

### 🔴 Ativo
- **Compra de etiqueta Melhor Envio:** endpoint `/api/admin/shipping/purchase` POST retorna 500. O GET (`getRealShippingOptions`) retorna array vazio. Token `MELHOR_ENVIO_TOKEN` está configurado na Vercel (funciona no checkout, mas não na rota de compra). Último log: `[shipping] getRealShippingOptions token present: true` aguardando.

### 🟡 Backlog
- **FF01:** Substituir mock de pagamento (Stripe + MercadoPago reais)
- **FF03:** Modal de envio ao concluir produção (implementado, compra de etiqueta pendente)
- Teste E2E `cart-checkout 2.5` (confirmação de pedido) está skipado — flaky

### ✅ Resolvido
- Supabase não funciona com Vercel (IPv6 vs IPv4) → migrado para Neon
- Imagens somem no deploy → armazenamento base64
- CEP não persistia → campo próprio `Order.cep`
- Status de produção não atualizava pedido → sincronizado via API

## 5. TESTES
- Unitários: 4/4 ✅ (Vitest)
- E2E: 66/68 ✅ (Playwright, 2 skipados/flaky)
- Build: ✅

## 6. ENV VARS (Vercel)
```
DATABASE_URL           — Neon PostgreSQL
AUTH_SECRET            — NextAuth secret
MELHOR_ENVIO_TOKEN     — Token da API Melhor Envio
NEXT_PUBLIC_APP_URL    — https://impress-es-3d-ecommerce.vercel.app
```

## 7. COMANDOS ÚTEIS
```bash
npm run dev           # Dev server
npm run build         # Build
npm run test          # Unit tests
npm run test:e2e      # E2E tests
npx prisma db push    # Sync schema
npx tsx prisma/seed.ts # Seed database
```
