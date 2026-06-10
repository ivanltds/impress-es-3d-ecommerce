# 🚨 FF02: Fluxo Integrado Lead → Pedido → Produção → Envio

> **Status:** EM ANDAMENTO

---

## FLUXO COMPLETO (ponta a ponta)

```
┌─────────────────────────────────────────────────────────────────────┐
│ 1. LEAD (cliente entra em contato)                                  │
│    Home → "Quero Algo Personalizado" → formulário salvo no banco   │
│    /admin/leads → aparece na coluna "Novos"                         │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 2. ATENDIMENTO (operador qualifica o lead)                          │
│    Arrasta → "Em Atendimento" → conversa no WhatsApp               │
│    Define produto, preço, personalização                            │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 3. CONVERSÃO (lead vira pedido real)                                │
│    Arrasta → "Convertido" → ABRE MODAL DE REGISTRO DE COMPRA       │
│    Modal: nome, produto, preço, CEP, endereço, pagamento           │
│    Ao confirmar:                                                     │
│      → Cria Order no banco (paymentStatus=paid)                     │
│      → Cria OrderItems (productionStatus=pending)                   │
│      → Lead.status = "convertido"                                   │
│      → Aparece em /admin/pedidos como "Pago / Não atendido"        │
│      → Aparece em /admin/producao na coluna "Aguardando"           │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 4. PRODUÇÃO (impressão 3D)                                          │
│    /admin/producao — Kanban 5 colunas:                              │
│    Aguardando → Em Produção → Acabamento → Embalado → Enviado p/ Entrega │
│    Cada movimento atualiza OrderItem.productionStatus               │
│    Ao chegar em "Enviado p/ Entrega":                               │
│      → API verifica: TODOS os items do pedido estão shipped?       │
│      → SIM → Order.fulfillmentStatus = "shipped"                    │
│      → Item SAI da produção                                         │
│      → Order aparece em /admin/envio                                │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 5. ENVIO (logística)                                                │
│    /admin/envio — Kanban 4 colunas:                                 │
│    Preparar → Postado → Em Trânsito → Entregue                     │
│    Cada movimento atualiza Order.fulfillmentStatus                  │
│    Ao chegar em "Entregue":                                         │
│      → Order.fulfillmentStatus = "delivered"                        │
│      → Sai dos pedidos abertos em /admin/pedidos                   │
│      → Toggle "Concluídos" mostra o pedido                          │
└─────────────────────────────────────────────────────────────────────┘
```

## REGRAS DO FLUXO

| # | Regra |
|---|-------|
| R1 | Um pedido NUNCA aparece em Produção e Envio ao mesmo tempo |
| R2 | Produção termina em "Enviado p/ Entrega" → Envio começa em "Preparar" |
| R3 | Status do pedido em /admin/pedidos reflete o último status do kanban |
| R4 | Pedidos abertos = fulfillmentStatus != 'delivered' |
| R5 | Cada movimento de card persiste no banco (nunca localStorage) |

## STATUS DO PEDIDO (Order)

| fulfillmentStatus | Significa | Visível em |
|-------------------|-----------|------------|
| `unfulfilled` | Pagamento ok, produção pendente | Pedidos (abertos) + Produção |
| `shipped` | Produção concluída, em logística | Pedidos (abertos) + Envio |
| `delivered` | Entregue ao cliente | Pedidos (concluídos) |

## API ENVOLVIDAS

| API | Método | Função |
|-----|--------|--------|
| `/api/admin/leads` | PATCH | Atualiza status do lead |
| `/api/checkout` | POST | Cria Order + OrderItems |
| `/api/admin/production` | PATCH | Atualiza productionStatus do item |
| `/api/admin/shipping` | PATCH | Atualiza fulfillmentStatus do pedido |
