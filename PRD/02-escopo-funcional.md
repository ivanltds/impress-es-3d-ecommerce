# Escopo Funcional

> **12 módulos** que compõem o produto completo. O MVP (FASE 1) implementa os módulos 1-8 + 11-12.

---

## 1. LANDING PAGE PRINCIPAL

A home funciona como LP principal da marca: proposta de valor, universos, produtos em destaque, explicação da personalização e CTAs. Reforça o site como hub complementar ao Instagram.

### Seções

- Hero principal com proposta clara
- Destaque dos universos/coleções
- Bloco "como funciona a personalização"
- Produtos em destaque
- Prova social (futura)
- CTA para compra e CTA para pedido personalizado
- FAQ
- Rodapé com políticas, contato e redes

---

## 2. LPs POR NICHO/COLEÇÃO

Cada nicho tem experiência visual própria, mesma fundação funcional.

### Nichos previstos

| Nicho | Tema |
|-------|------|
| Gamer/Energético | Cores vibrantes, estética neon/tech |
| Anime/Geek | Ilustrativo, colecionável, pop |
| Casa e Utilidades | Clean, funcional, material-focused |
| Presentes Personalizados | Emocional, data-driven, occasion-based |
| Automotivo/Carros Antigos | Vintage, mecânico, comunidade |

### Cada LP deve ter

- Identidade visual específica
- Headline contextual
- Grid/lista de produtos
- Filtros simples
- Storytelling do nicho
- CTA para compra
- CTA para contato/WhatsApp
- Espaço para itens personalizáveis

---

## 3. CATÁLOGO DE PRODUTOS

Descoberta simples e rápida, especialmente mobile. Tráfego inicial de social commerce.

### Requisitos

- Lista de produtos por coleção
- Cards com: imagem, nome, preço inicial, badges, prazo estimado
- Filtros: categoria, tema, personalização, faixa de preço
- Ordenação básica
- Busca textual
- Destaques: "mais vendidos", "novos", "personalizáveis"

---

## 4. PDP / MODAL DE PRODUTO

MVP pode iniciar com modal detalhado, evolutivo para PDP dedicada.

### Conteúdo mínimo

- Galeria de imagens
- Descrição curta e longa
- Variações (cor, tamanho, material)
- Opções de personalização
- Materiais e cuidados
- Prazo estimado de produção
- Observações legais
- Preço base e adicionais
- CTA "adicionar ao carrinho"
- CTA "pedir customização especial"

---

## 5. CONFIGURADOR SIMPLES DE PERSONALIZAÇÃO

Personalização controlada e de baixa complexidade. Sem renderização 3D avançada.

### Requisitos

- Escolha de cor
- Escolha de tamanho (quando aplicável)
- Campo de nome ou texto curto (limite de caracteres)
- Seleção de tema (quando aplicável)
- Extras/brindes
- Campo de observações
- Preview simples por mockup ou imagem (quando existir)

### Níveis de personalização por produto

| Nível | Descrição |
|-------|-----------|
| Nenhuma | Produto fixo, sem opções |
| Simples | 1-2 opções (ex: cor) |
| Moderada | Múltiplas opções + texto |
| Sob consulta | Lead → atendimento humano |

---

## 6. CARRINHO

Claro, editável, consistente desktop/mobile. Reduz abandono.

### Requisitos

- Adicionar e remover itens
- Editar quantidade
- Editar personalizações antes do checkout
- Campo de cupom (futuro)
- Resumo: subtotal, frete, total
- CTA para checkout

---

## 7. CADASTRO, LOGIN E CONTA

Simples o suficiente para não travar a primeira compra, robusto para sustentar recompra.

### Requisitos

- Cadastro por e-mail e senha
- Login
- Recuperação de senha
- Perfil do cliente
- Gerenciamento de endereços
- Preferências visuais (tema)
- Histórico de pedidos
- Consentimentos e preferências LGPD

---

## 8. CHECKOUT E PAGAMENTO

Prioriza conversão e clareza. Poucos passos, forte legibilidade mobile.

### Requisitos

- Checkout web responsivo
- Dados pessoais
- Endereço de entrega
- Resumo do pedido
- Escolha de frete
- Integração com gateway de pagamento (Stripe + MercadoPago)
- Confirmação de pedido
- E-mail transacional

---

## 9. ÁREA DO CLIENTE PERSONALIZADA

Diferencial do produto. Área logada assume estética preferida do cliente.

### Regras

- Sem login: preferência visual em cookie
- Logado: preferência salva no perfil
- Sem preferência manual: sugerir tema por comportamento/histórico
- Nunca trocar tema abruptamente sem indicação

### Áreas cobertas pelo tema

- Painel de pedidos
- Perfil
- Configurações
- Wishlist (futura)
- Elementos decorativos e copy contextual

---

## 10. PAINEL ADMINISTRATIVO

Backoffice mínimo desde o MVP para autonomia operacional.

### Requisitos

- CRUD de produtos
- CRUD de coleções e categorias
- Gerenciamento de variações
- Regras de personalização
- Gerenciamento de pedidos
- Gestão básica de clientes
- Área de banners/coleções
- Conteúdo institucional básico

### Permissões

- Admin geral
- Operador
- Parceiro de produção
- Atendimento

---

## 11. MÓDULO OPERACIONAL DE PRODUÇÃO

Esteira operacional simples para controle de prazo, qualidade e comunicação.

### Requisitos

- Fila de pedidos
- Status: novo → pago → em preparação → em impressão → acabamento → embalado → enviado → concluído
- Observações operacionais
- Tempo estimado por item
- Custo estimado por item
- Registro de reimpressão ou falha
- Designação de parceiro/máquina (futuro)

---

## 12. MÓDULO DE MARKETING BÁSICO

MVP nasce mensurável. A principal insegurança estratégica é marketing.

### Requisitos

- Captura de leads
- Identificação da origem do tráfego
- Suporte a UTM
- Eventos analíticos
- Integração com Meta Pixel
- CTA para WhatsApp
- Formulário "quero algo personalizado"

### North star inicial

**Pedidos pagos por semana.**
