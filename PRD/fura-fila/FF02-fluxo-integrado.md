# 🚨 FF02: Fluxo Integrado Lead → Pedido → Produção → Envio

> **Status:** EM ANDAMENTO
> **Criado:** 2026-06-10
> **Sprint:** M04 (fura-fila)

## Cenários

### C1: Lead convertido gera pedido real
DADO que um lead está na coluna "Convertido"
QUANDO o operador clica em "Criar Pedido" e confirma
ENTÃO uma Order é criada no banco com status "paid"
E o item aparece na fila de produção (Kanban)
E o lead é marcado como "convertido"

### C2: Tela de pedidos filtra abertos por padrão
DADO que o admin acessa /admin/pedidos
QUANDO a página carrega
ENTÃO deve mostrar apenas pedidos com fulfillmentStatus != 'delivered'
E deve ter toggle "Mostrar concluídos"
E deve ter busca por número do pedido

### C3: Tela de envio com etapas
DADO que um pedido está pronto para envio
QUANDO o operador acessa /admin/envio
ENTÃO deve ver cards com etapas: Preparar → Postado → Em Trânsito → Entregue
E cada card mostra: pedido, endereço, tracking
E arrastar entre colunas atualiza o status

### C4: Fluxo integrado ponta a ponta
Lead (Convertido) → Order (paid) → Produção (pending→shipped) → Envio (preparing→delivered)
