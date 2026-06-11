# 🚨 FF06: Product gallery fix + botão "Comprar Agora"

> **Status:** ✅ IMPLEMENTADO
> **Sprint:** M04
> **Criado:** 2026-06-11
> **Concluído:** 2026-06-11
> **Escopo original:** M02 (Catalog + Experience)

---

## Descrição

Correção da galeria de imagens da página de produto (que ignorava o array `images` e renderizava emoji) e adição do botão "Comprar Agora" que adiciona o item ao carrinho e navega diretamente para `/carrinho`. Escopo pertencente ao M02 mas executado durante M04.

---

## Escopo implementado

### Product Gallery (`src/components/shop/product-gallery.tsx`) — reescrito
- Renderiza `<img src={images[active]}>` na imagem principal
- Thumbnails com imagens reais
- Setas de navegação (ChevronLeft/Right) sobrepostas na imagem principal
- Indicadores de dot para múltiplas imagens
- Lightbox com imagens reais
- Fallback: ícone Package + "Sem imagem" quando `images.length === 0`

### Botão "Comprar Agora" (`src/components/shop/product-info.tsx`)
- Sem schema de personalização: adiciona ao carrinho + navega para `/carrinho`
- Com schema: abre modal de personalização com `buyNowPending=true` → ao confirmar, navega
- Label dinâmico: "Comprar Agora" ou "Personalizar e Comprar"
- Segundo botão: "Adicionar ao Carrinho" ou "Personalizar e Adicionar"

---

## Arquivos modificados

| Arquivo | Mudança |
|---------|---------|
| `src/components/shop/product-gallery.tsx` | Reescrito completo |
| `src/components/shop/product-info.tsx` | handleBuyNow, CTAs dinâmicos |

---

## Status dos Gates

| Gate | Status |
|------|--------|
| G0 | ✅ Aprovado (PO solicitou explicitamente) |
| G1 | ✅ |
| G2 | ⚠️ Sem testes formais |
| G3 | ✅ Implementado |
| G4 | 🚧 Aguardando homologação |
| G5 | 🚧 Pendente |
