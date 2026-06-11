# 🚨 FF04: Sistema de Personalização de Produtos

> **Status:** ✅ IMPLEMENTADO
> **Sprint:** M04
> **Criado:** 2026-06-11
> **Concluído:** 2026-06-11
> **Decisão do PO:** Fura-fila aprovado e executado durante M04

---

## Descrição

Sistema completo de personalização de produtos com 7 tipos de campos, builder visual para o admin, modal interativo para o cliente, upload de arquivos de referência, precificação adicional por campo/opção e snapshot congelado por pedido.

A spec M04 mencionava "personalizações" apenas no contexto de exibição no detalhe do pedido (cenário 2.2) e no kanban (cenário 3.6). A implementação de um sistema de criação e coleta de personalizações foi um escopo não previsto.

---

## Escopo implementado

### Tipos de campo (7)
| Tipo | Descrição |
|------|-----------|
| `text` | Texto curto (input) |
| `textarea` | Texto longo (multiline) |
| `color_select` | Seleção de cor com swatch visual |
| `size_select` | Seleção de tamanho (pill buttons) |
| `option_select` | Seleção de opção genérica |
| `image_ref` | Upload de imagem de referência (JPG/PNG/WebP, máx 8MB) |
| `file_3d` | Upload de arquivo 3D (STL/OBJ/3MF, máx 20MB) |

### Admin — Builder de personalização
- Toggle para habilitar/desabilitar personalização por produto
- Adicionar/remover/reordenar campos
- Por campo: tipo, label, placeholder, obrigatório, preço adicional
- Para opções (color/size/option): label, valor, cor (hex), preço adicional
- Disponível em: `/admin/produtos/novo` e `/admin/produtos/[id]`

### Cliente — Modal de personalização
- Abre ao clicar "Personalizar e Comprar" ou "Personalizar e Adicionar"
- Renderiza cada campo conforme seu tipo
- Validação de campos obrigatórios
- Feedback de preço em tempo real (base + acréscimos)
- Upload de arquivos: erro 413 → mensagem de arquivo grande + link WhatsApp para envio manual
- Número WhatsApp lido do banco (`StoreSettings.whatsappPhone`)

### Carrinho
- Breakdown de preço: `base + personalização = total/un`
- `CustomizationSummary` colapsável: mostra cada campo com label, valor e acréscimo

### Produção (kanban)
- `CustomizationDetail` no modal de detalhe do card
- Imagens: thumbnail + link de download
- Arquivos 3D: ícone + link de download
- Total da personalização no cabeçalho da seção

### Regras de negócio
| # | Regra |
|---|-------|
| R1 | Produto sem schema vai ao carrinho normalmente + sugestão "Fale conosco" WhatsApp |
| R2 | Limite de upload: 8MB imagens, 20MB arquivos 3D |
| R3 | Se arquivo exceder limite: erro + link WhatsApp para envio manual |
| R4 | Schema editável após pedidos existentes — pedidos antigos ficam congelados no snapshot |
| R5 | `customizationSnapshot` em `OrderItem` é JSON imutável após criação do pedido |

---

## Modelo de dados adicionado

```prisma
// Product
customizationSchema Json?  // CustomizationField[] | null

// OrderItem
customizationPrice Float @default(0)  // soma dos priceAdd
// customizationSnapshot String? já existia
```

---

## Arquivos criados/modificados

| Arquivo | Mudança |
|---------|---------|
| `src/lib/customization.ts` | Tipos, FILE_LIMITS, calcCustomizationTotal |
| `src/app/api/uploads/customization/route.ts` | Upload público, 413 em arquivo grande |
| `src/components/admin/customization-builder.tsx` | Builder visual para admin |
| `src/components/shop/customization-modal.tsx` | Modal cliente + CustomizationSuggestion |
| `src/components/shop/product-info.tsx` | CTAs dinâmicos, handleBuyNow, handleModalConfirm |
| `src/app/admin/produtos/novo/page.tsx` | Toggle + CustomizationBuilder |
| `src/app/admin/produtos/[id]/page.tsx` | Carrega/salva schema existente |
| `src/app/api/admin/products/create/route.ts` | Salva customizationSchema |
| `src/app/api/admin/products/[id]/route.ts` | PATCH customizationSchema |
| `src/app/carrinho/page.tsx` | CustomizationSummary, breakdown de preço |
| `src/app/admin/producao/page.tsx` | CustomizationDetail no modal do kanban |
| `prisma/schema.prisma` | customizationSchema, customizationPrice |

---

## Status dos Gates

| Gate | Status |
|------|--------|
| G0 | ✅ Aprovado (PO validou as 3 decisões de design) |
| G1 | ✅ Aprovado |
| G2 | ⚠️ Sem testes formais (ciclo foi pulado) |
| G3 | ✅ Implementado, build verde |
| G4 | 🚧 Aguardando homologação |
| G5 | 🚧 Pendente |
