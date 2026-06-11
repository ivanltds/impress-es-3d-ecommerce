# Session Latest — 3DPrint Store

## Data: 2026-06-11 (atualizado)

## Milestone Ativo: M04 (Fulfillment)
## Fase: Implementação concluída (aguardando deploy + teste)
## Gate Pendente: G3 (testes passando) → G4 (QA verifica deploy preview)

---

## Último Progresso

### Feature: Melhor Envio — integração completa ✅
Todos os erros de validação da API foram resolvidos. O Cart step agora sucede.
Último erro confirmado pelo PO: "saldo insuficiente" no Checkout — significa que Cart passou!

Arquivos modificados (Melhor Envio + schema + UI):
- `prisma/schema.prisma` — `User.document`, `Order.shippingStreet/Number/District/City/State/trackingCode`
- `src/lib/shipping.ts` — MOCK FF, from{} CPF/CNPJ, to{} real address, volumes + products, options completas
- `src/app/checkout/page.tsx` — campo CPF + select UF
- `src/app/api/checkout/route.ts` — salva campos estruturados de endereço
- `src/app/api/admin/shipping/purchase/route.ts` — usa campos estruturados, salva trackingCode separado
- `src/app/api/admin/store-addresses/route.ts` (POST) — inclui phone/email/document, normaliza state uppercase
- `src/app/api/admin/store-addresses/[id]/route.ts` (PATCH) — inclui phone/email/document, normaliza state uppercase
- `src/app/api/admin/production/route.ts` — GET retorna `trackingCode`
- `.env.example` — documenta MELHOR_ENVIO_MOCK

### Feature: Tracking code no kanban ✅
`src/app/admin/producao/page.tsx` — badge de rastreio + tooltip de instrução de entrega
- Componente `ShippingTooltip`: badge colorido (azul = real, âmbar = MOCK)
- Tooltip hover/click: 4 passos de instrução + link direto melhorenvio.com.br/envios
- Badge aparece nas cards da coluna "Enviado p/ Entrega" e no modal de detalhe
- Após `confirmShipping` bem-sucedido, estado local atualizado com `trackingCode: data.tracking`

### Feature: Sistema de personalização completo ✅
Arquivos criados/modificados:
- `src/lib/customization.ts` — tipos, FILE_LIMITS, calcCustomizationTotal
- `src/app/api/uploads/customization/route.ts` — upload de arquivos (413 p/ arquivos grandes)
- `src/components/admin/customization-builder.tsx` — builder visual p/ admin
- `src/components/shop/customization-modal.tsx` — modal do cliente + CustomizationSuggestion
- `src/components/shop/product-info.tsx` — CTAs dinâmicos, handleBuyNow, handleModalConfirm
- `src/app/admin/produtos/novo/page.tsx` — toggle + CustomizationBuilder
- `src/app/admin/produtos/[id]/page.tsx` — carrega/salva schema
- `src/app/api/admin/products/create/route.ts` — salva customizationSchema
- `src/app/api/admin/products/[id]/route.ts` — PATCH customizationSchema
- `src/app/carrinho/page.tsx` — CustomizationSummary colapsável, breakdown de preço
- `src/app/admin/producao/page.tsx` — CustomizationDetail no modal de detalhe do kanban
- `prisma/schema.prisma` — `customizationSchema Json?`, `customizationPrice Float @default(0)`

### Users/DB management ✅
- `kaiquebezerramqs@gmail.com` → admin
- `igorltdz@gmail.com` criado como admin (senha: 12345678)
- Todos os pedidos e leads deletados

### Auth redirects + Header ✅
- Admin login → `/admin`, cliente → `/produtos`
- Header: "Olá, {nome}" + dropdown por role (admin vs cliente)
- `src/components/shared/providers.tsx` — SessionProvider wrapper
- `src/app/layout.tsx` — usa Providers

### Product gallery fix ✅
- `src/components/shop/product-gallery.tsx` — reescrito para usar images[] real

---

## Bloqueios / Pendências

1. **`prisma db push`** — usuário deve rodar localmente:
   ```
   npx prisma db push
   npx prisma generate
   ```

2. **`MELHOR_ENVIO_MOCK=true`** — definir na Vercel para testar sem saldo real

3. **Commit + push** — usuário deve executar:
   ```
   git add -A
   git commit -m "feat(M04): Melhor Envio completo — mock FF, address fields, tracking badge com tooltip"
   git push
   ```

4. **Testes E2E** — 2 flaky/skipped ainda pendentes.

5. **Pagamento real** (Stripe/MercadoPago) — backlog FF01.

---

## Próximo Passo Sugerido

1. Rodar `npx prisma db push` (adiciona colunas novas no Neon)
2. Definir `MELHOR_ENVIO_MOCK=true` na Vercel
3. Commit + push → deploy preview
4. Testar fluxo completo: checkout com CPF+UF → produção → envio → badge de rastreio no kanban
