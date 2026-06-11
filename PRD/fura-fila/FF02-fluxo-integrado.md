# 🚨 FF02: Fluxo Integrado Lead → Pedido → Produção → Envio + Melhor Envio API

> **Status:** ✅ IMPLEMENTADO
> **Sprint:** M04
> **Criado:** 2026-06-10
> **Concluído:** 2026-06-11

---

## Descrição

Implementação do fluxo operacional completo ponta a ponta, incluindo integração real com a API da Melhor Envio para cotação e compra de etiquetas de envio.

---

## FLUXO COMPLETO

```
┌──────────────────────────────────────────────────────────────┐
│ 1. LEAD (cliente entra em contato)                            │
│                                                               │
│    Home → formulário "Quero Algo Personalizado"               │
│    Salvo na tabela Lead (banco)                               │
│    /admin/leads → aparece na coluna "Novos"                   │
└──────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────┐
│ 2. ATENDIMENTO (operador qualifica)                           │
│                                                               │
│    Arrasta → "Em Atendimento"                                 │
│    WhatsApp: combina produto, preço, personalização           │
│    Clica "Criar Pedido" → abre modal de registro de compra   │
│                                                               │
│    Modal: produto, preço, descrição, CEP, rua, nº,           │
│           bairro, cidade, pagamento (cartão/Pix)              │
│                                                               │
│    "Registrar Compra" → POST /api/checkout                    │
│      → Order criada (paymentStatus=paid, cep salvo)           │
│      → Lead.status = "convertido"                             │
└──────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────┐
│ 3. PEDIDOS (/admin/pedidos)                                   │
│                                                               │
│    Padrão: só pedidos abertos (fulfillmentStatus != delivered)│
│    Toggle "Concluídos" mostra todos                           │
│    Busca por nº do pedido ou nome do produto                  │
│    Grid ou lista (toggle)                                     │
│                                                               │
│    Status mostrado: Pago/Não atendido/Em produção/            │
│                     Postado/Em trânsito/Entregue              │
└──────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────┐
│ 4. PRODUÇÃO (/admin/producao)                                 │
│                                                               │
│    Kanban 5 colunas (drag-and-drop):                          │
│    Aguardando → Em Produção → Acabamento → Embalado →        │
│    Enviado p/ Entrega                                         │
│                                                               │
│    Cada movimento: PATCH /api/admin/production                │
│      → OrderItem.productionStatus atualizado                  │
│      → Order.fulfillmentStatus sincronizado                   │
│                                                               │
│    Ao arrastar pra "Enviado p/ Entrega":                      │
│      → Abre modal de envio                                    │
│      → Seleciona endereço de origem (StoreAddress)            │
│      → CEP de destino preenchível manualmente                 │
│      → Serviços Melhor Envio cotados via API                  │
│      → Mais barato pré-selecionado                            │
│      → "Comprar Etiqueta" → POST /api/admin/shipping/purchase │
│        → Cart → Checkout → Generate (API Melhor Envio)        │
│        → trackingCode salvo no OrderItem                      │
│        → Badge de rastreio aparece no card do kanban          │
│        → Order.fulfillmentStatus = "shipped"                  │
└──────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────┐
│ 5. ENVIO (/admin/envio)                                       │
│                                                               │
│    Kanban 3 colunas (drag-and-drop):                          │
│    Postado → Em Trânsito → Entregue                           │
│                                                               │
│    Só mostra pedidos com fulfillmentStatus IN                 │
│    ('shipped', 'posted', 'in_transit', 'delivered')           │
│                                                               │
│    Ao chegar em "Entregue":                                   │
│      → Order.fulfillmentStatus = "delivered"                  │
│      → SAI dos pedidos abertos                                │
└──────────────────────────────────────────────────────────────┘
```

---

## Integração Melhor Envio — Detalhes Técnicos

### Feature Flag
- `MELHOR_ENVIO_MOCK=true` → simula cotação e compra sem consumir saldo
- `MELHOR_ENVIO_MOCK=false` → produção real (exige saldo na conta)

### Fluxo API (3 etapas obrigatórias)
```
POST /api/me/cart           → adiciona itens ao carrinho (from/to/volumes/products)
POST /api/me/cart/checkout  → converte carrinho em pedido
POST /api/me/orders/generate → gera etiqueta PDF
```

### Modelo de dados adicionado
```prisma
model StoreAddress {
  id, name, phone, email, document (CPF/CNPJ)
  street, number, complement, neighborhood
  city, state (UF), cep, isActive
}

// Adicionado a User:
document String?  // CPF sem pontuação

// Adicionado a Order:
shippingStreet, shippingNumber, shippingDistrict
shippingCity, shippingState, trackingCode
```

### Dados coletados no checkout
- CPF do cliente (salvo em `User.document`)
- Endereço completo estruturado (campos individuais, não concatenados)
- UF (estado) em campo separado

### Badge de rastreio no kanban
- `ShippingTooltip`: badge azul (real) ou âmbar (MOCK) com código
- Tooltip hover: 4 passos de instrução + link melhorenvio.com.br/envios

---

## ⚠️ Débito Técnico — ver TD01

A API de compra de etiquetas requer **saldo na conta Melhor Envio**. Em ambiente de desenvolvimento/staging, o saldo é zero, resultando em erro "Saldo insuficiente". O `MELHOR_ENVIO_MOCK=true` contorna esse problema. Ver `PRD/debitos/TD01-saldo-melhor-envio.md`.

---

## Arquivos modificados

| Arquivo | Mudança |
|---------|---------|
| `prisma/schema.prisma` | StoreAddress model, User.document, Order shipping fields + trackingCode |
| `src/lib/shipping.ts` | MOCK FF, from{} CPF/CNPJ, to{} campos reais, volumes + products |
| `src/app/checkout/page.tsx` | Campo CPF + select UF |
| `src/app/api/checkout/route.ts` | Salva campos estruturados de endereço |
| `src/app/api/admin/shipping/purchase/route.ts` | Usa campos estruturados, 3 etapas API, salva trackingCode |
| `src/app/api/admin/store-addresses/route.ts` | CRUD completo com phone/email/document |
| `src/app/api/admin/store-addresses/[id]/route.ts` | PATCH com normalização de state |
| `src/app/api/admin/production/route.ts` | GET retorna trackingCode |
| `src/app/admin/producao/page.tsx` | Modal envio, ShippingTooltip, badge no kanban |
| `src/app/admin/configuracoes/enderecos/page.tsx` | CRUD visual de endereços de origem |
| `.env.example` | Documenta MELHOR_ENVIO_MOCK, MELHOR_ENVIO_TOKEN |

---

## Status dos Gates

| Gate | Status |
|------|--------|
| G0 | ✅ Aprovado (PO validou escopo) |
| G1 | ✅ Aprovado |
| G2 | ⚠️ Sem testes formais (ciclo foi pulado) |
| G3 | ✅ Build verde, funcional em MOCK |
| G4 | 🚧 Aguardando teste com saldo real (ver TD01) |
| G5 | 🚧 Pendente |
