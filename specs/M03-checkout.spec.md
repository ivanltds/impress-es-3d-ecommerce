# Especificação Formal — M03: Carrinho + Checkout + Cliente

> **Formato:** Gherkin (DADO/QUANDO/ENTÃO)
> **Status:** 🚧 G1 — Arquitetura documentada
> **Épicos:** C (Commerce) + D (Customer)

---

## ARQUITETURA DERIVADA (FASE 1)

### Decisões técnicas

| Decisão | Justificativa | Cenários |
|----------|---------------|:---:|
| **Cart API Routes** (`/api/cart`) | REST para operações CRUD de carrinho. Server Components para leitura, Server Actions para mutations | 1.1-1.7 |
| **Checkout Server Action** (`src/actions/checkout.ts`) | Single action que cria Order + OrderItems em transação | 2.1-2.6 |
| **Payment Mock** (`src/lib/payment-mock.ts`) | Interface `PaymentProvider` com implementações mock. Substituível por Stripe/MercadoPago quando chaves disponíveis | 4.1-4.3 |
| **Shipping Mock** (`src/lib/shipping-mock.ts`) | Mock do Correios. Retorna PAC/SEDEX com valores fixos. Substituível por API real | 2.3 |
| **E-mail Mock** (`src/lib/email-mock.ts`) | Loga no console. Substituível por Resend/SendGrid | 2.5 |
| **Guest Cart** (`localStorage`) | Persistência client-side para não-logados. Sincroniza ao logar | 1.2, 1.3 |
| **DB Cart** (tabelas existentes) | Cart e CartItem já no schema Prisma. Usuário logado persiste no banco | 1.3 |

### Rotas novas

| Rota | Método | Função |
|------|--------|--------|
| `/api/cart` | GET, POST, PATCH, DELETE | CRUD do carrinho |
| `/carrinho` | GET | Página do carrinho |
| `/checkout` | GET | Página de checkout |
| `/api/checkout` | POST | Finalizar pedido |
| `/conta` | GET | Perfil do cliente |
| `/conta/pedidos` | GET | Histórico de pedidos |
| `/conta/pedidos/[id]` | GET | Detalhe do pedido |
| `/conta/enderecos` | GET/POST | Gerenciar endereços |

### Fluxo de dados

```
[Add to Cart] → Cart API → localStorage (guest) / DB (logado)
[Checkout]    → Server Action → cria Order → Payment Mock → confirma
[Perfil]      → Server Component → dados do User + CustomerProfile
[Pedidos]     → Server Component → Order.findMany(userId)
```

---

*... (cenários Gherkin da FASE 0 abaixo)*

## FEATURE 1: Carrinho de Compras

**Como** visitante
**Quero** adicionar produtos ao carrinho e gerenciá-los antes de comprar
**Para** revisar minhas escolhas e finalizar a compra com segurança

### Cenários

**Cenário 1.1: Adicionar produto ao carrinho**
```gherkin
DADO que o visitante está na página de detalhe de um produto
QUANDO clicar em "Adicionar ao Carrinho"
ENTÃO o produto deve ser adicionado ao carrinho
E o ícone do carrinho no header deve mostrar a contagem de itens
E uma confirmação visual deve aparecer (toast ou animação)
```

**Cenário 1.2: Carrinho persiste para guest (localStorage)**
```gherkin
DADO que um visitante não logado adiciona itens ao carrinho
QUANDO fechar e reabrir o navegador
ENTÃO os itens devem permanecer no carrinho
E a contagem no header deve refletir os itens salvos
```

**Cenário 1.3: Carrinho persiste para usuário logado (banco)**
```gherkin
DADO que um usuário logado adiciona itens ao carrinho
QUANDO fizer login em outro dispositivo
ENTÃO os itens do carrinho devem estar sincronizados
```

**Cenário 1.4: Alterar quantidade no carrinho**
```gherkin
DADO que o visitante está na página do carrinho
QUANDO aumentar ou diminuir a quantidade de um item
ENTÃO o subtotal da linha deve atualizar
E o total do carrinho deve recalcular
```

**Cenário 1.5: Remover item do carrinho**
```gherkin
DADO que o visitante está na página do carrinho
QUANDO clicar em remover um item
ENTÃO o item deve ser removido
E o total deve atualizar
E uma mensagem "Item removido" deve aparecer
```

**Cenário 1.6: Carrinho vazio**
```gherkin
DADO que o carrinho está vazio
QUANDO o visitante acessar a página do carrinho
ENTÃO deve exibir mensagem "Seu carrinho está vazio"
E deve ter um link para "Ver Produtos"
```

**Cenário 1.7: Mini carrinho no header**
```gherkin
DADO que existem itens no carrinho
QUANDO o visitante clicar no ícone do carrinho
ENTÃO deve abrir um dropdown com resumo dos itens
E deve mostrar nome, preço e quantidade de cada item
E deve ter link "Ver Carrinho"
```

---

## FEATURE 2: Checkout

**Como** cliente
**Quero** finalizar minha compra informando endereço, frete e pagamento
**Para** receber meus produtos em casa

### Cenários

**Cenário 2.1: Checkout multi-step**
```gherkin
DADO que o visitante tem itens no carrinho
QUANDO clicar em "Finalizar Compra"
ENTÃO deve ser direcionado para o checkout em etapas:
  | Passo 1: Endereço de entrega
  | Passo 2: Método de frete
  | Passo 3: Pagamento e confirmação
```

**Cenário 2.2: Resumo do pedido no checkout**
```gherkin
DADO que o cliente está no checkout
QUANDO qualquer etapa for exibida
ENTÃO deve mostrar um resumo lateral com:
  | Itens do pedido
  | Subtotal
  | Frete (calculado)
  | Total
```

**Cenário 2.3: Cálculo de frete (mock Correios)**
```gherkin
DADO que o cliente informou o CEP
QUANDO o CEP for válido (8 dígitos)
ENTÃO as opções de frete mockadas devem ser exibidas (PAC, SEDEX)
E o valor do frete deve ser adicionado ao total
```

**Cenário 2.4: Seleção de pagamento (mock)**
```gherkin
DADO que o cliente está na etapa de pagamento
QUANDO escolher o método de pagamento
ENTÃO deve ter opções: Cartão de Crédito e Pix (ambos mockados)
E o botão de finalizar deve estar disponível
```

**Cenário 2.5: Confirmação do pedido**
```gherkin
DADO que o pagamento mock foi processado com sucesso
QUANDO o retorno for recebido
ENTÃO deve exibir página de confirmação com:
  | Número do pedido (3DP-XXXXX)
  | Itens comprados
  | Endereço de entrega
  | Prazo estimado
```

**Cenário 2.6: Erro no pagamento**
```gherkin
DADO que o pagamento falhou (mock configurado para falha)
QUANDO o erro for retornado
ENTÃO deve exibir mensagem de erro clara
E o pedido NÃO deve ser criado
E o carrinho deve ser preservado para nova tentativa
```

---

## FEATURE 3: Cadastro e Login

**Como** visitante
**Quero** criar uma conta e acessar meu perfil
**Para** acompanhar meus pedidos e ter uma experiência personalizada

### Cenários

**Cenário 3.1: Cadastro durante o checkout**
```gherkin
DADO que o visitante não logado finaliza uma compra
QUANDO o pagamento for concluído
ENTÃO deve ser oferecida a opção de criar conta
E os dados do checkout devem preencher o cadastro automaticamente
```

**Cenário 3.2: Perfil do cliente**
```gherkin
DADO que o usuário está logado
QUANDO acessar /conta
ENTÃO deve ver: nome, e-mail, telefone
E deve ter opção de editar cada campo
```

**Cenário 3.3: Histórico de pedidos**
```gherkin
DADO que o usuário está logado
QUANDO acessar /conta/pedidos
ENTÃO deve ver lista de pedidos com: número, data, status, total
E cada pedido deve ser clicável para ver detalhes
```

**Cenário 3.4: Detalhe do pedido**
```gherkin
DADO que o usuário clica em um pedido
QUANDO a página de detalhe for carregada
ENTÃO deve mostrar: itens, endereço, status, tracking (se disponível)
```

**Cenário 3.5: Gerenciamento de endereços**
```gherkin
DADO que o usuário está logado
QUANDO acessar /conta/enderecos
ENTÃO deve poder: adicionar, editar, remover endereços
E deve poder marcar um endereço como padrão
```

---

## FEATURE 4: Integração de Pagamento (MOCK)

**Como** cliente
**Quero** pagar com cartão de crédito ou Pix
**Para** escolher a forma mais conveniente

### Cenários

**Cenário 4.1: Pagamento mockado — cartão**
```gherkin
DADO que o cliente seleciona cartão de crédito
QUANDO preencher os dados do cartão e confirmar
ENTÃO o pagamento deve ser simulado com sucesso (mock Stripe)
E o pedido deve ser criado com status "pago"
E o mock deve estar claramente identificado no código para substituição futura
```

**Cenário 4.2: Pagamento mockado — Pix**
```gherkin
DADO que o cliente seleciona Pix
QUANDO confirmar o pagamento
ENTÃO o pagamento deve ser simulado com sucesso (mock MercadoPago)
E o pedido deve ser criado com status "pago"
E o mock deve estar claramente identificado no código para substituição futura
```

**Cenário 4.3: Falha no pagamento mockado**
```gherkin
DADO que o cliente está na etapa de pagamento
QUANDO o mock for configurado para simular falha
ENTÃO deve exibir mensagem de erro
E o pedido NÃO deve ser criado
E o carrinho deve ser preservado
```

### ⚠️ TECH DEBT — MOCK DE PAGAMENTO

> Stripe e MercadoPago estão **mockados** por falta de chaves de API.
> O mock será substituído pela integração real quando as chaves forem obtidas.
> Tarefa: `PRD/fura-fila/FF01-pagamento-real.md`

---

## REGRAS DE NEGÓCIO

| ID | Regra |
|----|-------|
| RN-30 | Carrinho persiste para usuários logados (DB) e guest (localStorage) |
| RN-31 | Ao fazer login, carrinho guest é mesclado com carrinho do usuário |
| RN-32 | Preço final = preço base + deltas de variante + adicionais de personalização |
| RN-33 | Checkout não pode ter mais que 3 etapas |
| RN-34 | Pedidos pagos entram automaticamente na fila de produção |
| RN-35 | Todo pedido deve ter número único no formato 3DP-XXXXX |

---

## RASTREABILIDADE

| Feature | Origem (PRD) | Cenários |
|---------|-------------|:---:|
| F1: Carrinho | Módulo 6 (PRD) | 7 |
| F2: Checkout | Módulo 8 (PRD) | 6 |
| F3: Cadastro e Login | Módulo 7 (PRD) | 5 |
| F4: Pagamento | Módulo 8 (PRD) | 3 |
| **Total** | **4 features** | **21 cenários** |

---

## STATUS DOS GATES

| Gate | Status |
|------|--------|
| 🚧 G0 | ✅ Spec Approved |
| 🚧 G1 | ✅ Architecture Approved |
| 🚧 G2 | BLOQUEADO |
| 🚧 G3 | BLOQUEADO |
| 🚧 G4 | BLOQUEADO |
| 🚧 G5 | BLOQUEADO |
| 🚧 G6 | BLOQUEADO |
