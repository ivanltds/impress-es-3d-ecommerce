# Session Latest — 3DPrint Store

## Data: 2026-06-11

## Milestone Ativo: M04 (Admin + Operations + Analytics)
## Fase: Implementação concluída — 🚧 G4 pendente (homologação PO)
## Gate Pendente: G4 — Product Owner homologa deploy preview

---

## Scorecard M04

| Feature | Cenários | Implementados |
|---------|:---:|:---:|
| F1: Admin CRUD Produtos | 4 | 4 ✅ |
| F2: Gestão de Pedidos | 3 | 3 ✅ |
| F3: Fila de Produção (Kanban) | 7 | 6 ✅ / 1 ❌ (3.7 falha) |
| F4: Dashboard Analytics | 3 | 3 ✅ |
| F5: Marketing Analytics | 4 | 1 ✅ / 3 ❌ (Pixel, UTM) |
| **Total spec** | **21** | **17 ✅ / 4 ❌** |

Fura-filas executados: FF02, FF03, FF04, FF05, FF06, FF07 (todos ✅)
Débitos: TD01 (saldo Melhor Envio)

---

## Funcionalidades implementadas (completo)

### M04 core
- Admin CRUD produtos (criar, editar, listar, arquivar)
- Gestão de pedidos com filtro abertos/concluídos
- Kanban produção 5 colunas com drag-and-drop
- Dashboard analytics (métricas, gráfico, top produtos)
- Lead capture form + kanban de leads

### FF02 — Fluxo integrado + Melhor Envio
- Fluxo Lead → Pedido → Produção → Envio
- API Melhor Envio: Cart → Checkout → Generate (3 etapas)
- StoreAddress: endereços de origem cadastráveis
- CPF no checkout, campos de endereço estruturados no Order
- MELHOR_ENVIO_MOCK=true para dev sem saldo

### FF03 — Modal de envio
- Modal abre ao arrastar para "Enviado p/ Entrega"
- Seleção de endereço de origem + CEP + cotação + compra
- Badge ShippingTooltip (azul=real, âmbar=MOCK) no kanban

### FF04 — Sistema de personalização
- 7 tipos de campo (text, textarea, color_select, size_select, option_select, image_ref, file_3d)
- Builder visual admin + Modal cliente
- Upload de arquivos (8MB img / 20MB 3D) com fallback WhatsApp
- Precificação adicional por campo/opção
- Snapshot congelado no pedido
- CustomizationDetail no modal do kanban

### FF05 — Auth redirects + Header
- Admin login → /admin, cliente → /produtos
- Header: "Olá, {nome}", dropdown por role
- SessionProvider + StoreSettingsProvider no layout

### FF06 — Product gallery + Comprar Agora
- Galeria de produto corrigida (imagens reais, lightbox, thumbnails)
- Botão "Comprar Agora" → adiciona + navega para /carrinho

### FF07 — StoreSettings + WhatsApp
- Model StoreSettings singleton no banco
- /admin/configuracoes: campo WhatsApp + link de teste
- useStoreSettings() hook para componentes

---

## Pendências operacionais

| # | Pendência | Prioridade |
|---|-----------|-----------|
| TD01 | Recarregar saldo Melhor Envio (mín R$10) | 🔴 Antes do go-live |
| — | `npx prisma db push && npx prisma generate` | 🔴 Imediato |
| — | `MELHOR_ENVIO_MOCK=true` na Vercel | 🟡 Para staging |
| — | `NEXT_PUBLIC_WHATSAPP_PHONE` pode ser removida (substituída pelo DB) | 🟢 Limpeza |
| — | Commit + push de todas as mudanças | 🔴 Imediato |

```bash
npx prisma db push
npx prisma generate
git add -A
git commit -m "feat(M04): sistema completo — personalização, auth, settings, fura-filas documentados"
git push
```

---

## Cenários pendentes da spec M04 (backlog)

- 3.7: Registrar falha de produção
- 5.1: Meta Pixel — PageView
- 5.2: Meta Pixel — evento Purchase
- 5.3: Captura de UTM nos pedidos

---

## Próximo passo

**G4:** PO homologa deploy preview do M04 completo.
Após G4 → G5 (retrospective) → M05 ou endereçar cenários pendentes.
