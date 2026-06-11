# 🔴 TD01: Saldo insuficiente para compra de etiquetas — Melhor Envio

> **Tipo:** Débito Técnico Operacional
> **Severidade:** 🔴 Alta — bloqueia o fluxo real de envio em produção
> **Status:** EM ABERTO
> **Criado:** 2026-06-11
> **Relacionado a:** FF02, FF03

---

## Descrição

A conta Melhor Envio usada para integração não possui saldo suficiente para comprar etiquetas reais. O passo `POST /api/me/cart/checkout` retorna erro `"Saldo insuficiente"`, bloqueando a geração de etiquetas.

O fluxo de 3 etapas da API foi implementado e validado (Cart → Checkout → Generate). O erro "saldo insuficiente" no Checkout **confirma que o Cart passou com sucesso** — a integração técnica está correta.

---

## Impacto

| Cenário | Impacto |
|---------|---------|
| Ambiente dev/staging sem saldo | Não é possível comprar etiqueta real |
| Deploy preview sem `MELHOR_ENVIO_MOCK=true` | Erro na tela ao tentar enviar |
| Produção sem saldo na conta | Operação bloqueada — admin não consegue gerar etiqueta |

---

## Contorno atual

`MELHOR_ENVIO_MOCK=true` na Vercel/`.env.local` faz o sistema gerar um código de rastreio simulado (`MOCK-XXXXXX`) sem consumir saldo. Permite testar todo o fluxo operacional exceto a etiqueta real.

```env
MELHOR_ENVIO_MOCK=true   # contorna o problema em dev/staging
MELHOR_ENVIO_MOCK=false  # produção real — exige saldo
```

---

## Resolução necessária

### Opção A — Recarregar saldo (recomendada para produção)
1. Acessar https://melhorenvio.com.br
2. Conta → Saldo → Adicionar crédito (mínimo R$ 10,00)
3. Remover `MELHOR_ENVIO_MOCK=true` da Vercel (ou definir `=false`)
4. Testar compra de etiqueta ponta a ponta

### Opção B — Usar conta sandbox (para testes)
- Melhor Envio oferece ambiente sandbox em https://sandbox.melhorenvio.com.br
- Gerar token sandbox separado
- Adicionar `MELHOR_ENVIO_SANDBOX=true` como FF no código (não implementado ainda)

---

## Checklist de resolução

- [ ] Recarregar saldo na conta Melhor Envio (mín. R$ 10)
- [ ] Definir `MELHOR_ENVIO_MOCK=false` em produção
- [ ] Testar compra de etiqueta real (Cart → Checkout → Generate)
- [ ] Confirmar que PDF da etiqueta é gerado
- [ ] Confirmar que `trackingCode` é salvo no banco
- [ ] Confirmar badge de rastreio aparece no kanban
- [ ] Marcar TD01 como RESOLVIDO

---

## Quando resolver

Antes de onboarding dos primeiros clientes reais. Enquanto a loja estiver em testes internos, o MOCK é suficiente.
