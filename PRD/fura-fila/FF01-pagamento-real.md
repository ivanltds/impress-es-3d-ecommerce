# 🚨 FF01: Substituir mock de pagamento por integração real

> **Status:** BACKLOG
> **Criado:** 2026-06-10 (M03)
> **Bloqueio:** Chaves de API do Stripe e MercadoPago não disponíveis

## Descrição
Substituir o mock de pagamento (`src/lib/payment-mock.ts`) pelas integrações reais:
- Stripe (cartão de crédito)
- MercadoPago (Pix)
- Webhooks de confirmação

## Tarefas
1. Obter chaves de API (Stripe test + MercadoPago test)
2. Configurar webhooks
3. Substituir mock por chamadas reais
4. Testar fluxo completo ponta a ponta
5. Atualizar documentação
