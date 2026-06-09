# PRD — Product Requirements Document

> **Versão:** 1.0.0
> **Criado em:** 2026-06-09
> **Product Owner:** Operador

---

## VISÃO DO PRODUTO

### Nome do Produto
*3DPrint Store* (nome provisório)

### Pitch (Elevator Pitch)
Um e-commerce especializado em itens de impressão 3D, onde clientes compram produtos prontos ou sob encomenda, com opções de personalização de cor, tamanho e material. Focado no consumidor final brasileiro, com experiência de compra fluida, pagamentos locais e logística integrada.

### Problema que Resolve
- Consumidores interessados em itens 3D não têm uma plataforma especializada e confiável para comprar
- Criadores 3D não têm um canal de venda direto e profissional
- Marketplaces genéricos não oferecem a experiência adequada para produtos 3D (personalização, preview 3D, prazos de produção)

### Público-Alvo

| Segmento | Descrição | Necessidade Principal |
|----------|-----------|----------------------|
| **Entusiastas de Decoração** | Pessoas que buscam itens decorativos únicos | Produtos exclusivos, personalizáveis |
| **Hobbistas** | RPG, miniaturas, cosplay | Detalhamento, variedade de escala |
| **Presenteadores** | Compradores de presentes criativos | Facilidade de compra, embalagem para presente |
| **Profissionais** | Arquitetos, designers, dentistas | Peças técnicas, precisão dimensional |

### Proposta de Valor
- Catálogo curado de itens 3D de qualidade
- Personalização em tempo real (cor, tamanho, material)
- Preço transparente (material + produção + frete)
- Rastreamento do pedido (produção → envio → entrega)
- Pagamento local (Pix, boleto, cartão)

---

## OBJETIVOS DE NEGÓCIO

| Objetivo | Métrica | Prazo |
|----------|---------|-------|
| Lançamento MVP | Loja funcional com catálogo e checkout | Sprint 4 |
| Primeira venda | Transação completa via Stripe/MercadoPago | Sprint 4 |
| 50 produtos | Catálogo com variedade de categorias | Sprint 6 |
| 100 pedidos/mês | Volume de vendas | Pós-lançamento |

---

## MÉTRICAS DE SUCESSO

| Métrica | Alvo Inicial | Alvo 6 Meses |
|---------|-------------|--------------|
| Taxa de conversão | ≥ 2% | ≥ 4% |
| Abandono de carrinho | ≤ 70% | ≤ 50% |
| Tempo até primeira compra | ≤ 3 min | ≤ 2 min |
| NPS | ≥ 60 | ≥ 75 |
| Recorrência | ≥ 15% | ≥ 30% |

---

## RESTRIÇÕES

- **Orçamento inicial:** Apenas custos de infraestrutura (Vercel free tier, Supabase free tier)
- **Prazo MVP:** 4 sprints
- **Idioma:** Português (Brasil) como primário, com estrutura para i18n futura
- **Jurisdição:** Brasil (LGPD compliance desde o dia 1)

---

## STAKEHOLDERS

| Papel | Nome/Role | Contato |
|-------|-----------|---------|
| Product Owner | Operador | Via Scrum Master |
| Scrum Master | Claude (AI) | Via chat |
| Desenvolvedor | Claude Agent (fullstack-dev) | Via Scrum Master |
| QA | Claude Agent (qa-engineer) | Via Scrum Master |
| BA | Claude Agent (business-analyst) | Via Scrum Master |
