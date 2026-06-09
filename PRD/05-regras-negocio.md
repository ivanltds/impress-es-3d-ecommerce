# Regras de Negócio

---

## Produção e Estoque

| ID | Regra |
|----|-------|
| RN-01 | Produtos são majoritariamente **sob demanda** (on_demand). Estoque físico é exceção |
| RN-02 | Cada produto precisa ter **nível de personalização** definido (none, simple, moderate, on_request) |
| RN-03 | Tempo de produção estimado deve ser informado na PDP |
| RN-04 | Custo estimado por item deve ser registrado para cálculo de margem |

---

## Personalização

| ID | Regra |
|----|-------|
| RN-10 | Personalizações textuais têm **limite de caracteres** (definido por produto) |
| RN-11 | Personalização não pode inviabilizar a produção — opções são pré-definidas |
| RN-12 | Preview da personalização é por mockup/imagem estática (sem renderização 3D no MVP) |
| RN-13 | Pedidos com customização sensível podem exigir **aprovação manual** antes da produção |

---

## Temas e Experiência

| ID | Regra |
|----|-------|
| RN-20 | O tema visual **não pode alterar** regras críticas de usabilidade e checkout |
| RN-21 | Usuários sem login usam **cookie** para persistência visual |
| RN-22 | Usuários logados salvam a preferência no **perfil** |
| RN-23 | Sugestão de tema por comportamento deve ser **transparente** e revogável |
| RN-24 | Nunca trocar tema automaticamente de forma abrupta sem indicação clara |
| RN-25 | Itens que **não variam por tema**: checkout, formulários, carrinho, navegação, acessibilidade |

---

## Carrinho e Checkout

| ID | Regra |
|----|-------|
| RN-30 | Carrinho persiste para usuários logados (DB) e guest (localStorage/session) |
| RN-31 | Personalizações podem ser editadas antes do checkout |
| RN-32 | Preço final = preço base + deltas de variante + adicionais de personalização |
| RN-33 | Checkout não pode ter mais que 3 etapas (endereço → frete → pagamento) |

---

## Propriedade Intelectual

| ID | Regra |
|----|-------|
| RN-40 | Produtos com risco de IP de terceiros (marcas, personagens) devem passar por **revisão comercial/legal** antes da publicação |
| RN-41 | Política de revisão de IP documentada e aplicada no fluxo de cadastro de produto |
| RN-42 | Catálogo próprio tem preferência sobre itens inspirados em IP famosa |

---

## Analytics e Mensuração

| ID | Regra |
|----|-------|
| RN-50 | Todo evento crítico do funil deve ser rastreado (product_view, add_to_cart, begin_checkout, purchase) |
| RN-51 | Origem do tráfego (UTM) deve ser capturada e associada ao pedido |
| RN-52 | Meta Pixel deve ser integrado desde o MVP |
| RN-53 | North star: **pedidos pagos por semana** |

---

## LGPD e Consentimento

| ID | Regra |
|----|-------|
| RN-60 | Consentimento de marketing deve ser explícito (opt-in) |
| RN-61 | Usuário pode solicitar exportação ou exclusão de dados |
| RN-62 | Cookies de preferência (tema) não precisam de consentimento; cookies de analytics sim |

---

## Operação

| ID | Regra |
|----|-------|
| RN-70 | Pedido pago gera automaticamente entrada na fila de produção |
| RN-71 | Status do pedido visível para o cliente a qualquer momento |
| RN-72 | Falha de impressão (QC failed) gera registro e possível reimpressão automática |
| RN-73 | Parceiro de produção vê apenas pedidos designados a ele |
