# Riscos e Mitigação

---

| Risco | Descrição | Probabilidade | Impacto | Mitigação |
|-------|-----------|:---:|:---:|-----------|
| **Complexidade excessiva** | Lançar multiuniverso completo de uma vez | Alta | Alto | Implementar por fases; começar com 2 coleções |
| **Catálogo amplo demais** | Marketing e operação perdem foco | Alta | Alto | Limitar coleções e SKUs do MVP (5-10) |
| **Precificação errada** | Venda sem margem sustentável | Média | Crítico | Exigir cálculo de custo e margem por item desde o MVP |
| **Dependência do parceiro** | Produção e prazo ficam frágeis | Alta | Alto | Formalizar SLA, fila visível, capacidade conhecida |
| **IP de terceiros** | Risco jurídico com marcas/personagens | Média | Alto | Política de revisão de IP, catálogo próprio, consultoria jurídica |
| **Marketing iniciante** | Site pronto sem canal funcional | Alta | Crítico | Priorizar Instagram-first, analytics desde o MVP, eventos rastreáveis |
| **Abandono de carrinho** | Usuário desiste no checkout | Alta | Médio | Checkout em 3 passos, guest checkout, clareza de preço e prazo |
| **Personalização complexa** | Opções demais travam produção | Média | Alto | Níveis de customização, opções pré-definidas, validação no admin |
| **Performance mobile ruim** | Tráfego Instagram é mobile-first | Média | Alto | Mobile-first no design, otimização de imagens, Vercel edge |
| **LGPD não conformidade** | Multa ou bloqueio | Baixa | Alto | Consentimento explícito, política de privacidade, exportação de dados |

---

## Matriz de Prioridade

```
Impacto
  Alto  │  Precificação   Dependência    Marketing
        │  errada         parceiro       iniciante
        │  Complexidade   Catálogo       Performance
        │  excessiva      amplo          mobile
        │  Personalização IP terceiros
        │  complexa
        │
  Baixo │                              LGPD
        │
        └──────────────────────────────────────
              Baixa            Alta         Probabilidade
```

---

## Decisões em Aberto

O Maestro deve resolver estas decisões durante a FASE 0 (Discovery):

| # | Decisão | Impacto |
|---|---------|---------|
| 1 | Stack final (Next.js confirmado?) | Arquitetura |
| 2 | Gateway de pagamento: Stripe + MercadoPago | Receita |
| 3 | Modelo de frete: fixo, calculado, grátis? | Conversão |
| 4 | CMS interno vs headless (Strapi/Contentful) | Manutenção |
| 5 | PDP dedicada vs modal como padrão inicial | Experiência |
| 6 | Política formal para itens inspirados em IP famosa | Jurídico |
| 7 | Quais 2 coleções entram no MVP | Foco |
| 8 | Quais 5-10 SKUs entram primeiro | Produção |
| 9 | Como calcular custo e margem por item | Financeiro |
| 10 | Como lidar com pedidos sob consulta (lead → venda) | Processo |

---

## Integrações

### 🔴 Prioridade Alta (MVP)

| Integração | Função |
|-----------|--------|
| Stripe | Pagamento cartão |
| MercadoPago | Pagamento Pix, boleto |
| Google Analytics 4 | Analytics |
| Meta Pixel | Tracking de conversão Instagram |
| WhatsApp | CTA, atendimento |
| E-mail transacional (Resend/SendGrid) | Confirmação de pedido |

### 🟡 Prioridade Média (FASE 2)

| Integração | Função |
|-----------|--------|
| Cálculo de frete (Correios/Melhorenvio) | Frete dinâmico |
| CRM leve | Gestão de leads |
| Automação de atendimento | Chatbot |
| Reviews (estrelas + comentários) | Prova social |
| Busca interna avançada | Algolia ou similar |

### 🟢 Prioridade Futura (FASE 3)

| Integração | Função |
|-----------|--------|
| Instagram Shopping | Venda direta no Instagram |
| Recomendação personalizada | Upsell/cross-sell |
| Automação de CRM | Funis de e-mail |
| Preview visual 3D | Configurador avançado |
