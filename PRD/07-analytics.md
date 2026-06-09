# Analytics e Métricas

---

## NORTH STAR

**Pedidos pagos por semana.**

Toda decisão de produto deve ser avaliada contra esta métrica.

---

## MÉTRICAS DE NEGÓCIO

| Métrica | Descrição | Frequência |
|---------|-----------|------------|
| Receita bruta | Soma de `Order.total` com payment_status = paid | Semanal |
| Margem por produto | (Preço - Custo estimado) / Preço | Por produto |
| Ticket médio | Receita / Número de pedidos | Semanal |
| Conversão por coleção | Pedidos / Visitas à coleção | Semanal |
| Tempo médio até pagamento | Checkout iniciado → payment.success | Monitoramento |
| Tempo médio de produção | Job criado → Job concluído | Monitoramento |
| Taxa de erro/reimpressão | Jobs com QC failed / Total jobs | Semanal |
| Recompra | Clientes com >1 pedido / Total clientes | Mensal |

---

## MÉTRICAS DE PRODUTO (FUNIL)

| Etapa | Evento | Meta |
|-------|--------|------|
| Visita à home/LP | `page_view` | — |
| Visita à coleção | `collection_view` | CTR da home > 30% |
| Visualização de produto | `product_view` | — |
| Início de personalização | `customization_started` | — |
| Personalização concluída | `customization_completed` | Taxa de conclusão > 80% |
| Add to cart | `add_to_cart` | — |
| Checkout iniciado | `begin_checkout` | — |
| Checkout concluído | `payment_success` | Conversão de carrinho > 50% |
| Pedido criado | `order_created` | — |
| Tema selecionado | `theme_selected` | — |
| Lead capturado | `custom_request_submitted` | — |
| Login | `login` | — |
| Cadastro | `signup` | — |

---

## EVENTOS ANALÍTICOS

### Eventos de Página

```
page_view            → { page, collection, theme }
collection_view      → { collection_slug, theme }
product_view         → { product_id, product_slug, collection }
```

### Eventos de Ação

```
customization_started    → { product_id, customization_level }
customization_completed  → { product_id, fields_used[] }
add_to_cart             → { product_id, variant_id, price, qty, has_customization }
remove_from_cart        → { product_id, reason? }
begin_checkout          → { cart_total, item_count }
payment_success         → { order_id, total, provider, payment_method }
order_created           → { order_id, total, item_count, source_channel }
```

### Eventos de Experiência

```
theme_selected          → { theme_key, source (manual/suggested/default) }
custom_request_submitted → { collection?, source }
```

### Eventos de Usuário

```
login                   → { method (email/google) }
signup                  → { source_channel }
```

---

## INTEGRAÇÕES DE TRACKING

| Ferramenta | Eventos | Prioridade |
|-----------|---------|------------|
| Meta Pixel | PageView, ViewContent, AddToCart, InitiateCheckout, Purchase | 🔴 Alta |
| Google Analytics 4 | Todos os eventos | 🔴 Alta |
| UTM | Captura em page_view, associada ao pedido | 🔴 Alta |
| Custom events | Todos os listados acima | 🟡 Média |

---

## ORIGEM DE TRÁFEGO (UTM)

Campos capturados e persistidos no pedido (`Order.source_channel`):

- `utm_source` (ex: instagram, facebook, google)
- `utm_medium` (ex: social, cpc, organic)
- `utm_campaign` (ex: lancamento_gamer, natal_2026)
- `utm_content` (ex: post_carrossel, story_link)
- `utm_term` (se aplicável)

---

## DASHBOARDS SUGERIDOS

### Dashboard de Negócio (Product Owner)
- Pedidos por semana (north star)
- Receita semanal
- Ticket médio
- Conversão por coleção
- Origens de tráfego

### Dashboard Operacional (Admin)
- Pedidos por status
- Tempo médio de produção
- Taxa de falha (QC)
- Fila do parceiro

### Dashboard de Marketing (Futuro)
- Funil completo (visit → purchase)
- ROAS por campanha
- Custo por lead
- Conversão por origem
