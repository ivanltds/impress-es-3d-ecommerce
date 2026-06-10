# 🚨 FF02: Fluxo Integrado Lead → Pedido → Produção → Envio

> **Status:** IMPLEMENTADO
> **Sprint:** M04
> **Criado:** 2026-06-10

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
│      → CEP preenchido automaticamente (Order.cep)             │
│      → Serviços Melhor Envio carregam (se token presente)    │
│      → Mais barato pré-selecionado                            │
│      → "Comprar Etiqueta" → POST /api/admin/shipping/purchase │
│        → Compra etiqueta via API (cart → checkout → generate) │
│        → Tracking salvo no pedido                             │
│        → Order.fulfillmentStatus = "shipped"                  │
│        → SAI da produção, ENTRA no envio                      │
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
│    Cada movimento: PATCH /api/admin/shipping                  │
│      → Order.fulfillmentStatus atualizado                     │
│                                                               │
│    Ao chegar em "Entregue":                                   │
│      → Order.fulfillmentStatus = "delivered"                  │
│      → SAI dos pedidos abertos                                │
│      → Toggle "Concluídos" mostra                             │
└──────────────────────────────────────────────────────────────┘
```

---

## REGRAS DO FLUXO

| # | Regra |
|---|-------|
| R1 | Um pedido NUNCA aparece em Produção e Envio ao mesmo tempo |
| R2 | Produção termina em "Enviado p/ Entrega" → Envio começa em "Postado" |
| R3 | Status do pedido em /admin/pedidos reflete o último status do kanban |
| R4 | Pedidos abertos = fulfillmentStatus != 'delivered' |
| R5 | Todo movimento de card persiste no banco (NUNCA localStorage) |
| R6 | CEP armazenado no campo `Order.cep` (não em JSON no notes) |

---

## MAPEAMENTO DE STATUS

### Order.fulfillmentStatus

| Valor | Significa | Kanban | Pedidos |
|-------|-----------|--------|---------|
| `unfulfilled` | Pagamento ok, produção pendente | Produção (Aguardando) | Aberto |
| `in_progress` | Em produção | Produção (Em Produção/Acabamento/Embalado) | Aberto |
| `shipped` | Enviado p/ entrega | Envio (Postado/Em Trânsito) | Aberto |
| `delivered` | Entregue ao cliente | Envio (Entregue) | Concluído |

### OrderItem.productionStatus

| Valor | Significa | Coluna no Kanban |
|-------|-----------|-----------------|
| `pending` | Aguardando início | Aguardando |
| `in_progress` | Impressão em andamento | Em Produção |
| `finishing` | Lixamento/pintura | Acabamento |
| `packed` | Pronto pra envio | Embalado |
| `shipped` | Enviado | Enviado p/ Entrega |

---

## APIs ENVOLVIDAS

| API | Método | Função |
|-----|--------|--------|
| `/api/admin/leads` | GET | Lista leads |
| `/api/admin/leads` | POST | Cria lead (formulário público) |
| `/api/admin/leads` | PATCH | Atualiza status do lead |
| `/api/checkout` | POST | Cria Order + OrderItems (com CEP) |
| `/api/admin/orders` | GET | Lista pedidos |
| `/api/admin/production` | GET | Itens em produção |
| `/api/admin/production` | PATCH | Atualiza status de produção |
| `/api/admin/shipping` | GET | Pedidos em envio |
| `/api/admin/shipping` | PATCH | Atualiza status de envio |
| `/api/admin/shipping/purchase` | GET | Opções de frete (Melhor Envio) |
| `/api/admin/shipping/purchase` | POST | Compra etiqueta (Melhor Envio) |

---

## PÁGINAS

| Rota | Função | Filtro padrão |
|------|--------|---------------|
| `/admin/leads` | Kanban CRM: Novo → Em Atendimento → Aguardando Pgto → Convertido → Perdido | — |
| `/admin/pedidos` | Grid/Lista de pedidos | Abertos (toggle concluídos) |
| `/admin/producao` | Kanban 5 colunas | Pedidos pagos, não enviados |
| `/admin/envio` | Kanban 3 colunas | Pedidos enviados, não entregues |

---

## MODELO DE DADOS

### Lead (tabela)
```
id, name, email, phone, source, interestCollection, message,
status, notes, orderId, paymentLink, createdAt, updatedAt
```

### Order (tabela)
```
id, userId, orderNumber, status, paymentStatus, fulfillmentStatus,
subtotal, shippingCost, discount, total, currency, sourceChannel,
notes, themeSnapshot, cep, createdAt
```

### OrderItem (tabela)
```
id, orderId, productId, productNameSnapshot, skuSnapshot,
qty, unitPrice, customizationSnapshot, productionStatus,
productionNotes
```

---

## CHANGELOG

### 2026-06-10
- Fluxo integrado implementado
- Lead → Pedido → Produção → Envio com status em tempo real
- CEP como campo próprio na Order
- Compra de etiqueta via Melhor Envio API
- Modal de envio com seleção de serviço
- Filtro de pedidos abertos/concluídos
- Tela de envio com 3 colunas
