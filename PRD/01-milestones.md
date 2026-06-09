# Milestones de Entrega

> **Versão:** 1.0.0
> **Última atualização:** 2026-06-09
>
> Cada milestone é implementado em um sprint. Milestones são sequenciais e cumulativos.
> O escopo detalhado de cada milestone está em `PRD/milestones/MXX-nome.md`.

---

## VISÃO GERAL DO ROADMAP

```
M01: Fundação         M02: Catálogo        M03: Carrinho        M04: Checkout
    [Sprint 1]           [Sprint 2]           [Sprint 3]           [Sprint 4]
    ─────────            ─────────            ─────────            ─────────
    • Setup              • Listagem           • Carrinho           • Stripe
    • Tema               • Detalhe            • Quantidade         • MercadoPago
    • Layout base        • Filtros            • Persistência       • Resumo
    • Home page          • Categorias         • Cupom              • Confirmação
                         • Busca                                   • E-mail
```

```
M05: Autenticação    M06: Admin            M07: Perfil           M08: Pós-venda
    [Sprint 5]           [Sprint 6]           [Sprint 7]           [Sprint 8]
    ─────────            ─────────            ─────────            ─────────
    • Login              • Dashboard          • Histórico          • Rastreio
    • Cadastro           • CRUD produtos      • Endereços          • Avaliações
    • Google OAuth       • Pedidos            • Favoritos          • Pós-venda
    • Recuperação        • Gestão estoque                          • Devolução
```

---

## LISTA DE MILESTONES

### 🔴 M01: Fundação do Projeto → [detalhes](milestones/M01-fundacao.md)
**Sprint:** 1 | **Prioridade:** MUST HAVE
**Descrição:** Setup do projeto Next.js, configuração da Vercel, Supabase, tema visual base (Tailwind + shadcn/ui), layout principal e home page estática.
**Critério de aceitação:** Projeto rodando na Vercel com home page responsiva.

### 🟡 M02: Catálogo de Produtos → [detalhes](milestones/M02-catalogo.md)
**Sprint:** 2 | **Prioridade:** MUST HAVE
**Descrição:** Listagem de produtos com grid responsivo, página de detalhe com fotos, filtros por categoria/material/preço, busca textual.
**Critério de aceitação:** Usuário navega, filtra e visualiza detalhes de produtos.

### 🟡 M03: Carrinho de Compras → [detalhes](milestones/M03-carrinho.md)
**Sprint:** 3 | **Prioridade:** MUST HAVE
**Descrição:** Adicionar/remover itens, alterar quantidade, persistir carrinho (localStorage + DB para logado), mini-carrinho, página do carrinho, cupons de desconto.
**Critério de aceitação:** Usuário gerencia itens e cupons no carrinho.

### 🔴 M04: Checkout & Pagamento → [detalhes](milestones/M04-checkout.md)
**Sprint:** 4 | **Prioridade:** MUST HAVE
**Descrição:** Fluxo de checkout (endereço, frete, pagamento), integração Stripe, integração MercadoPago (Pix), resumo do pedido, página de confirmação, e-mail transacional.
**Critério de aceitação:** Usuário finaliza compra com pagamento processado. 🎯 **MVP!**

### 🟢 M05: Autenticação → [detalhes](milestones/M05-autenticacao.md)
**Sprint:** 5 | **Prioridade:** SHOULD HAVE
**Descrição:** Login/cadastro com e-mail, login Google OAuth, recuperação de senha, sessão persistente, zonas protegidas (admin, perfil).
**Critério de aceitação:** Usuário cria conta, faz login e acessa áreas restritas.

### 🟢 M06: Painel Admin → [detalhes](milestones/M06-admin.md)
**Sprint:** 6 | **Prioridade:** SHOULD HAVE
**Descrição:** Dashboard com métricas, CRUD de produtos (com upload de imagens), gestão de pedidos (status, tracking), gestão de estoque.
**Critério de aceitação:** Admin gerencia produtos e pedidos pelo painel.

### 🔵 M07: Área do Cliente → [detalhes](milestones/M07-perfil.md)
**Sprint:** 7 | **Prioridade:** COULD HAVE
**Descrição:** Histórico de pedidos, gerenciamento de endereços, lista de favoritos/wishlist, dados cadastrais.
**Critério de aceitação:** Cliente acessa histórico e gerencia preferências.

### 🔵 M08: Pós-venda & Fidelização → [detalhes](milestones/M08-posvenda.md)
**Sprint:** 8 | **Prioridade:** COULD HAVE
**Descrição:** Rastreamento de pedido, avaliações de produto (estrelas + comentários), fotos nas avaliações, programa de fidelidade simples, e-mail de abandono de carrinho.
**Critério de aceitação:** Cliente avalia produtos e acompanha entrega.

---

## 🚨 FURA-FILA

Milestones emergenciais ou solicitados durante sprints ativas. São priorizados acima do milestone atual quando aprovados pelo Product Owner.

Nenhum fura-fila registrado até o momento.
Ver pasta: `PRD/fura-fila/`

---

## CONVENÇÕES

- **Prioridade:** 🔴 MUST HAVE → 🟡 SHOULD HAVE → 🟢 COULD HAVE → 🔵 NICE TO HAVE
- **Cada sprint = 1 milestone** (exceto fura-fila que pode ser paralelo)
- **Nunca se inicia um milestone antes do anterior estar concluído**
- **Milestones são cumulativos** — M03 inclui tudo de M01+M02
- **MVP = M01 + M02 + M03 + M04** (4 sprints)
