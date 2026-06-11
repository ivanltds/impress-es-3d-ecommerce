# 🚨 FF03: Modal de envio ao concluir produção

> **Status:** ✅ IMPLEMENTADO
> **Criado:** 2026-06-10
> **Concluído:** 2026-06-11
> **Absorvido por:** FF02 (integração completa)

## Descrição

Quando um item é movido para "Enviado p/ Entrega" na tela de produção, abre modal para registrar envio via Melhor Envio: seleção de endereço de origem, CEP de destino, cotação de serviços, compra de etiqueta.

## Implementado

- Modal abre automaticamente ao arrastar card para coluna "Enviado p/ Entrega"
- Seleção de endereço de origem (StoreAddress cadastrado)
- Input de CEP de destino + botão "Calcular"
- Lista de serviços disponíveis com preço e prazo
- Seleção de serviço + "Comprar Etiqueta" com feedback de loading
- Tratamento de erro: endereço não cadastrado → link para cadastrar
- Badge `ShippingTooltip` aparece no card após compra bem-sucedida
- Detalhes completos: ver FF02

## Arquivos

- `src/app/admin/producao/page.tsx` — modal completo + ShippingTooltip
