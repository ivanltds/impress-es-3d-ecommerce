# 🚨 FURA-FILA

Esta pasta contém milestones emergenciais que foram solicitados durante sprints ativas e aprovados pelo Product Owner para execução prioritária.

## Regras do Fura-Fila

1. **Solicitação:** Product Owner solicita nova funcionalidade ao Maestro durante milestone ativo
2. **Análise:** Business Analyst faz análise rápida de impacto
3. **Decisão:** Product Owner decide: (a) fura-fila agora, (b) próximo milestone, (c) backlog futuro
4. **Se aprovado como fura-fila:**
   - Milestone atual é **pausado** (não cancelado)
   - Fura-fila vira milestone ativo
   - Ao concluir, retoma milestone pausado
5. **Registro:** Cada fura-fila é documentado aqui com `FF-XX-nome.md`

---

## Índice de Fura-Filas

| # | Nome | Sprint | Status | Arquivo |
|---|------|--------|--------|---------|
| FF01 | Substituir mock de pagamento por integração real | M03 | 🗂️ BACKLOG | FF01-pagamento-real.md |
| FF02 | Fluxo integrado Lead→Pedido→Produção→Envio + Melhor Envio API | M04 | ✅ IMPLEMENTADO | FF02-fluxo-integrado.md |
| FF03 | Modal de envio ao concluir produção | M04 | ✅ IMPLEMENTADO | FF03-modal-envio.md |
| FF04 | Sistema de personalização completo (7 tipos, builder, modal, uploads) | M04 | ✅ IMPLEMENTADO | FF04-sistema-personalizacao.md |
| FF05 | Auth redirects por role + Header adaptado | M04 | ✅ IMPLEMENTADO | FF05-auth-header-por-role.md |
| FF06 | Product gallery fix + botão "Comprar Agora" | M04 | ✅ IMPLEMENTADO | FF06-product-gallery-comprar-agora.md |
| FF07 | StoreSettings — WhatsApp configurável pelo admin | M04 | ✅ IMPLEMENTADO | FF07-store-settings-whatsapp.md |

---

## Débitos Técnicos

Débitos técnicos relacionados a fura-filas estão em `PRD/debitos/`.

| # | Débito | Severidade | Status |
|---|--------|-----------|--------|
| TD01 | Saldo insuficiente Melhor Envio para etiquetas reais | 🔴 Alta | EM ABERTO |
