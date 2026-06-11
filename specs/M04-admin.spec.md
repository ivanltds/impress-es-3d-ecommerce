# Especificação Formal — M04: Admin + Operations + Analytics 🎯 MVP

> **Formato:** Gherkin (DADO/QUANDO/ENTÃO)
> **Status:** 🟡 PARCIALMENTE IMPLEMENTADO — aguardando G4 (homologação PO)
> **Última atualização:** 2026-06-11
> **Épicos:** E (Operations) + F (Growth)

---

## FEATURE 1: Painel Admin — CRUD de Produtos

**Como** administrador
**Quero** cadastrar, editar e gerenciar produtos pelo painel
**Para** manter o catálogo atualizado sem depender de desenvolvedor

### Cenários

**Cenário 1.1: Lista de produtos no admin** ✅
```gherkin
DADO que um admin está logado
QUANDO acessar /admin/produtos
ENTÃO deve ver tabela com todos os produtos (nome, preço, categoria, status)
E deve ter botão "Novo Produto"
E cada linha deve ter ações: Editar, Duplicar, Arquivar
```

**Cenário 1.2: Criar novo produto** ✅
```gherkin
DADO que o admin está em /admin/produtos/novo
QUANDO preencher nome, slug, descrição, preço, categoria e salvar
ENTÃO o produto deve ser criado
E deve aparecer na listagem
E deve ser acessível na loja em /produtos/[slug]
```

**Cenário 1.3: Editar produto existente** ✅
```gherkin
DADO que o admin edita um produto existente
QUANDO alterar o preço e salvar
ENTÃO o novo preço deve refletir na loja imediatamente
E o histórico não deve ser perdido
```

**Cenário 1.4: Proteção de rota admin** ✅
```gherkin
DADO que um usuário com role "customer" tenta acessar /admin
QUANDO a página for carregada
ENTÃO deve receber HTTP 403 (Forbidden)
E deve ser redirecionado para /auth/entrar
```

---

## FEATURE 2: Gestão de Pedidos

**Como** administrador
**Quero** visualizar e gerenciar pedidos
**Para** acompanhar vendas e atualizar status de produção

### Cenários

**Cenário 2.1: Lista de pedidos** ✅
```gherkin
DADO que o admin acessa /admin/pedidos
QUANDO a página for carregada
ENTÃO deve ver tabela com: número, data, cliente, total, status
E deve poder filtrar por status (pago, produção, enviado)
E deve poder ordenar por data
```

**Cenário 2.2: Detalhe do pedido** ✅
```gherkin
DADO que o admin clica em um pedido
QUANDO a página de detalhe for carregada
ENTÃO deve mostrar: itens, personalizações, endereço, valor, status
E deve ter botão para avançar status
```

**Cenário 2.3: Atualizar status de produção** ✅
```gherkin
DADO que o admin está no detalhe de um pedido pago
QUANDO clicar em "Iniciar Produção"
ENTÃO o status deve mudar para "em produção"
E o cliente deve ver o novo status em /conta/pedidos
```

---

## FEATURE 3: Fila de Produção

**Como** operador
**Quero** visualizar a fila de produção
**Para** saber quais itens imprimir e em qual ordem

### Cenários

**Cenário 3.1: Fila de produção** ✅
```gherkin
DADO que o operador acessa /admin/producao
QUANDO a página for carregada
ENTÃO deve ver lista de itens agrupados por status
E a ordem deve ser: pago → em produção → acabamento → embalado
E cada item deve mostrar: produto, personalização, prazo estimado
```

**Cenário 3.2: Avançar item na fila** ✅
```gherkin
DADO que um item está com status "pago"
QUANDO o operador clicar em "Iniciar Impressão"
ENTÃO o status deve mudar para "em produção"
E o timestamp de início deve ser registrado
```

**Cenário 3.3: Kanban — arrastar item entre colunas** ✅
```gherkin
DADO que o operador está na fila de produção
QUANDO arrastar um card da coluna "pago" para "em produção"
ENTÃO o status do item deve atualizar automaticamente
E o card deve aparecer na nova coluna
E o timestamp de transição deve ser registrado
```

**Cenário 3.4: Kanban — voltar item para coluna anterior** ✅
```gherkin
DADO que um item está na coluna "em produção"
QUANDO o operador arrastar o card de volta para "pago"
ENTÃO o status deve retroceder
E uma nota deve ser registrada com o motivo da regressão
```

**Cenário 3.5: Kanban — colunas com drag-and-drop** ✅
```gherkin
DADO que o operador acessa /admin/producao
QUANDO a página for carregada
ENTÃO deve exibir colunas Kanban:
  | Aguardando (pedidos pagos)
  | Em Produção (imprimindo)
  | Acabamento (lixando/pintando)
  | Embalado (pronto pra envio)
  | Enviado (tracking)
E cada card deve mostrar: produto, cliente, prazo estimado, tempo na coluna
E cards devem ser arrastáveis entre colunas (drag and drop)
```

**Cenário 3.6: Kanban — expandir card ao clicar** ✅
```gherkin
DADO que o operador clica em um card do Kanban
QUANDO o card for clicado
ENTÃO deve expandir mostrando todos os detalhes do pedido:
  | Número do pedido
  | Nome do cliente e contato
  | Itens do pedido com quantidades
  | Personalizações aplicadas (label, valor, acréscimo, arquivos)
  | Valor total
  | Prazo estimado de produção
  | Badge de rastreio (se já enviado)
E deve ter botão para fechar o card expandido
```

**Cenário 3.7: Registrar falha de produção** ❌ NÃO IMPLEMENTADO
```gherkin
DADO que um item falhou na impressão
QUANDO o operador clicar em "Registrar Falha"
E informar o motivo
ENTÃO o item deve ser marcado como "falha"
E um novo job de produção deve ser criado automaticamente
```
> ⚠️ Movido para backlog — não priorizado no M04.

---

## FEATURE 4: Dashboard de Analytics

**Como** administrador
**Quero** ver métricas do negócio em um dashboard
**Para** tomar decisões baseadas em dados

### Cenários

**Cenário 4.1: Dashboard com métricas principais** ✅
```gherkin
DADO que o admin acessa /admin
QUANDO a página for carregada
ENTÃO deve exibir cards com:
  | Total de pedidos (semana atual)
  | Receita bruta (semana atual)
  | Ticket médio
  | Taxa de conversão por coleção
```

**Cenário 4.2: Gráfico de pedidos por semana** ✅
```gherkin
DADO que o admin está no dashboard
QUANDO a seção de gráficos for carregada
ENTÃO deve exibir gráfico de barras com pedidos das últimas 4 semanas
E cada barra deve mostrar o número de pedidos
```

**Cenário 4.3: Top produtos** ✅
```gherkin
DADO que o admin está no dashboard
QUANDO a seção de top produtos for carregada
ENTÃO deve listar os 5 produtos mais vendidos
E deve mostrar quantidade vendida e receita gerada
```

---

## FEATURE 5: Marketing Analytics

**Como** administrador
**Quero** rastrear origem de tráfego e conversões
**Para** otimizar campanhas de marketing

### Cenários

**Cenário 5.1: Meta Pixel integrado** ❌ NÃO IMPLEMENTADO
```gherkin
DADO que o visitante acessa qualquer página da loja
QUANDO a página for carregada
ENTÃO o script do Meta Pixel deve ser carregado
E eventos PageView devem ser disparados
```

**Cenário 5.2: Eventos de conversão** ❌ NÃO IMPLEMENTADO
```gherkin
DADO que um cliente finaliza uma compra
QUANDO a página de confirmação for exibida
ENTÃO o evento Purchase deve ser disparado no Meta Pixel
E deve incluir valor e moeda
```

**Cenário 5.3: Captura de UTM** ❌ NÃO IMPLEMENTADO
```gherkin
DADO que um visitante chega via link com UTM (utm_source=instagram)
QUANDO a página for carregada
ENTÃO os parâmetros UTM devem ser capturados
E devem ser persistidos no pedido ao finalizar compra
```

**Cenário 5.4: Lead capture form** ✅
```gherkin
DADO que um visitante quer um produto personalizado
QUANDO preencher o formulário "Quero algo personalizado"
ENTÃO o lead deve ser salvo com: nome, WhatsApp, coleção, mensagem
E deve aparecer na lista de leads em /admin/leads
```

---

## REGRAS DE NEGÓCIO

| ID | Regra | Status |
|----|-------|--------|
| RN-34 | Pedidos pagos entram automaticamente na fila de produção | ✅ |
| RN-50 | Eventos críticos do funil devem ser rastreados | ❌ Pendente |
| RN-51 | UTM deve ser capturada e associada ao pedido | ❌ Pendente |
| RN-52 | Meta Pixel integrado desde o MVP | ❌ Pendente |

---

## RASTREABILIDADE

| Feature | Épico | Cenários | Implementados | Pendentes |
|---------|-------|:---:|:---:|:---:|
| F1: Admin CRUD Produtos | E | 4 | 4 | 0 |
| F2: Gestão de Pedidos | E | 3 | 3 | 0 |
| F3: Fila de Produção (Kanban) | E | 7 | 6 | 1 (3.7) |
| F4: Dashboard Analytics | F | 3 | 3 | 0 |
| F5: Marketing Analytics | F | 4 | 1 | 3 (5.1, 5.2, 5.3) |
| **Total** | | **21** | **17** | **4** |

---

## FURA-FILAS EXECUTADOS DURANTE M04

| # | Feature | Status |
|---|---------|--------|
| FF02 | Fluxo integrado Lead→Pedido→Produção→Envio + Melhor Envio | ✅ |
| FF03 | Modal de envio ao concluir produção | ✅ |
| FF04 | Sistema de personalização completo (7 tipos, builder, modal, uploads) | ✅ |
| FF05 | Auth redirects por role + Header adaptado | ✅ |
| FF06 | Product gallery fix + botão "Comprar Agora" | ✅ |
| FF07 | StoreSettings — WhatsApp configurável pelo admin | ✅ |

## DÉBITOS TÉCNICOS

| # | Débito | Severidade | Status |
|---|--------|-----------|--------|
| TD01 | Saldo insuficiente Melhor Envio para etiquetas reais | 🔴 Alta | EM ABERTO |

---

## STATUS DOS GATES

| Gate | Status | Observação |
|------|--------|------------|
| G0 | ⚠️ RETROSPECTIVO | Spec não foi aprovada formalmente antes da implementação |
| G1 | ⚠️ RETROSPECTIVO | Arquitetura derivada em paralelo com código |
| G2 | ❌ NÃO EXECUTADO | Testes E2E/unitários não foram escritos antes do código |
| G3 | 🟡 PARCIAL | Build verde, mas 4 cenários da spec não implementados |
| G4 | 🚧 PENDENTE | Aguardando homologação do PO no deploy preview |
| G5 | 🚧 BLOQUEADO | Aguarda G4 |

> **Nota processo:** M04 foi executado sem o ciclo SDD formal (G0→G5). Os gates acima refletem o estado real. A retrospective (G5) deve documentar as melhorias de processo para M05.
