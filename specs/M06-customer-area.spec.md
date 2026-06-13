# M06 — Personalized Customer Area — Especificação Gherkin

> **Status:** ✅ G0 APROVADO pelo Product Owner em 2026-06-12
> **Milestone:** M06 — Diferenciação (Fase 2)
> **Última atualização:** 2026-06-12 (Feature 7 adicionada)
> **Business Analyst:** Agente BA (Claude)
> **Stack:** Next.js 15 App Router, TypeScript strict, Tailwind CSS 4, shadcn/ui, Prisma + Neon PostgreSQL, NextAuth.js, Vercel Blob

---

## Metadados

| Atributo | Valor |
|----------|-------|
| **Milestone** | M06 — Personalized Customer Area |
| **Fase do roadmap** | FASE 2 — Diferenciação |
| **Milestone anterior** | M05 — Multi-Theme Experience (concluído ✅) |
| **Milestone seguinte** | M07 — Growth Engine |
| **Objetivo principal** | Tornar a área `/conta` uma experiência tematizada, migrar endereços para o DB, adicionar detalhe de pedido, sugestão de universo pós-checkout e instrumentação básica de analytics |
| **Dependências críticas** | `PATCH /api/user/preference` (M05 ✅), `GET /api/universes` (M05 ✅), `UniverseThemeProvider` (M05 ✅), `UNIVERSE_CONFIG` em `src/config/universes.ts` (M05 ✅), `User.preferredCollection` no schema (M05 ✅), model `Address` no schema (M03 ✅) |
| **Dívida técnica resolvida** | `/conta/enderecos` — migrar de `localStorage` para DB (model `Address` já existe no schema desde M03, nunca foi utilizado pela página do cliente) |
| **Total de cenários** | 52 (44 originais + 8 Feature 7) |

---

## Histórias de Usuário

| ID | História |
|----|---------|
| HU-01 | Como cliente logado com universo favorito definido, quero que minha área `/conta` exiba as cores e identidade visual do meu universo, para sentir que a experiência foi feita para mim |
| HU-02 | Como cliente logado, quero ver e trocar meu universo favorito diretamente na minha área de conta, sem precisar navegar para a homepage |
| HU-03 | Como cliente logado, quero acessar o detalhe de um pedido específico em `/conta/pedidos/[id]` com itens, status, total, rastreio e personalização, para acompanhar meu pedido sem precisar contatar o suporte |
| HU-04 | Como cliente que acabou de concluir uma compra sem universo preferido definido, quero receber uma sugestão do universo do produto comprado, para personalizar minha experiência futura com um clique |
| HU-05 | Como cliente logado, quero gerenciar meus endereços de entrega com dados salvos no banco (e não no localStorage), para que meus endereços apareçam em qualquer dispositivo |
| HU-06 | Como produto manager, quero que eventos-chave de preferência e visualização sejam instrumentados com `console.log` estruturado e preparados para integração futura, para ter visibilidade de comportamento sem depender de SDK externo |
| HU-07 | Como visitante ou cliente logado na homepage, quero ver uma faixa de produtos em destaque personalizada abaixo da navbar, para descobrir produtos relevantes ao meu universo de interesse ou as campanhas promocionais ativas |

---

## Cenários Gherkin por História

---

### Feature 1: Área `/conta` tematizada

**HU-01:** Como cliente logado com universo favorito definido, quero que minha área `/conta` exiba as cores e identidade visual do meu universo.

---

**Cenário 1.1: Área `/conta` aplica tema do universo preferido do usuário logado**
```gherkin
DADO que o usuário está logado com userId = "user-001"
E o campo preferredCollection do User "user-001" = "gaming"
QUANDO acessar "/conta"
ENTÃO o elemento [data-testid="conta-theme-wrapper"] deve estar presente no DOM
E o elemento [data-testid="conta-theme-wrapper"] deve ter a classe CSS correspondente ao tema "gaming"
E a CSS custom property "--color-primary" no escopo do wrapper deve refletir a cor primária do universo gaming (#00ff41 ou equivalente configurado)
```

**Cenário 1.2: Área `/conta` sem universo preferido usa tema base neutro**
```gherkin
DADO que o usuário está logado com userId = "user-002"
E o campo preferredCollection do User "user-002" é null
QUANDO acessar "/conta"
ENTÃO o elemento [data-testid="conta-theme-wrapper"] deve estar presente
E nenhuma classe de tema de universo deve ser aplicada ao wrapper
E o layout deve usar os design tokens base do projeto (sem variáveis de universo)
```

**Cenário 1.3: Badge "Seu universo" é exibido no perfil quando universo está definido**
```gherkin
DADO que o usuário está logado com preferredCollection = "anime-nerd"
QUANDO acessar "/conta"
ENTÃO o elemento [data-testid="conta-universe-badge"] deve estar visível
E deve conter o nome do universo (ex: "Anime & Nerd")
E deve ter data-testid="conta-universe-badge"
```

**Cenário 1.4: Badge "Seu universo" não aparece quando preferência não está definida**
```gherkin
DADO que o usuário está logado com preferredCollection = null
QUANDO acessar "/conta"
ENTÃO o elemento [data-testid="conta-universe-badge"] NÃO deve ser renderizado no DOM
```

**Cenário 1.5: Tema da área `/conta` NÃO se propaga para navegação global nem para o footer**
```gherkin
DADO que o usuário está logado com preferredCollection = "auto"
QUANDO acessar "/conta"
ENTÃO o elemento de navegação global (fora de [data-testid="conta-theme-wrapper"]) deve usar os design tokens base
E o footer deve usar os design tokens base
E o contraste WCAG AA (≥ 4.5:1) deve ser mantido em todos os elementos de texto dentro do wrapper
```

**Cenário 1.6: Sub-rotas de `/conta` herdam o tema do wrapper**
```gherkin
DADO que o usuário está logado com preferredCollection = "presentes"
QUANDO acessar "/conta/pedidos"
ENTÃO o elemento [data-testid="conta-theme-wrapper"] deve estar presente na página
E a CSS custom property "--color-primary" no escopo deve refletir o tema "presentes"
QUANDO acessar "/conta/enderecos"
ENTÃO o mesmo wrapper temático deve estar ativo
```

---

### Feature 2: Seletor de universo em `/conta`

**HU-02:** Como cliente logado, quero ver e trocar meu universo favorito diretamente na minha área de conta.

---

**Cenário 2.1: Seletor exibe os 5 universos disponíveis como cards visuais**
```gherkin
DADO que o usuário está logado e acessa "/conta"
QUANDO a seção [data-testid="universe-selector"] for renderizada
ENTÃO deve exibir exatamente 5 cards de universo
E cada card deve ter [data-testid="universe-option-{slug}"] (ex: "universe-option-gaming")
E cada card deve exibir: nome do universo e imagem representativa (cardImageUrl ou fallback)
```

**Cenário 2.2: Card do universo atual exibe indicador de seleção ativo**
```gherkin
DADO que o usuário está logado com preferredCollection = "casa-decor"
QUANDO a seção [data-testid="universe-selector"] for renderizada
ENTÃO o card [data-testid="universe-option-casa-decor"] deve ter atributo aria-selected="true"
E deve exibir o indicador [data-testid="universe-option-active-indicator"] dentro do card
E os demais cards devem ter aria-selected="false"
```

**Cenário 2.3: Clicar em universo diferente salva preferência via API e atualiza UI**
```gherkin
DADO que o usuário está logado com preferredCollection = "gaming"
E está na página "/conta" com [data-testid="universe-selector"] visível
QUANDO clicar no card [data-testid="universe-option-presentes"]
ENTÃO deve ser feita uma chamada PATCH para "/api/user/preference" com body { universeSlug: "presentes" }
E o card [data-testid="universe-option-presentes"] deve receber aria-selected="true"
E o card [data-testid="universe-option-gaming"] deve receber aria-selected="false"
E o badge [data-testid="conta-universe-badge"] deve atualizar para "Presentes"
E o tema visual da página deve transicionar para o tema do universo "presentes" sem reload completo
```

**Cenário 2.4: Falha na API ao trocar universo exibe mensagem de erro e mantém estado anterior**
```gherkin
DADO que o usuário está logado com preferredCollection = "gaming"
E a API "/api/user/preference" está indisponível (retorna 500)
QUANDO clicar no card [data-testid="universe-option-anime-nerd"]
ENTÃO o elemento [data-testid="universe-selector-error"] deve ser exibido com mensagem de erro
E o card [data-testid="universe-option-gaming"] deve manter aria-selected="true"
E o tema da página NÃO deve mudar
```

**Cenário 2.5: Usuário sem preferência — nenhum card aparece como ativo**
```gherkin
DADO que o usuário está logado com preferredCollection = null
QUANDO a seção [data-testid="universe-selector"] for renderizada
ENTÃO todos os 5 cards devem ter aria-selected="false"
E nenhum [data-testid="universe-option-active-indicator"] deve estar visível
```

**Cenário 2.6: Seletor exibe estado de carregamento durante requisição**
```gherkin
DADO que o usuário está logado e clica em [data-testid="universe-option-auto"]
ENQUANTO a chamada PATCH para "/api/user/preference" estiver pendente
ENTÃO o elemento [data-testid="universe-selector-loading"] deve estar visível
E os cards de universo devem estar desabilitados (não clicáveis) durante o loading
QUANDO a resposta da API retornar com sucesso
ENTÃO o estado de loading deve ser removido e a UI deve refletir a nova seleção
```

---

### Feature 3: Página de detalhe do pedido `/conta/pedidos/[id]`

**HU-03:** Como cliente logado, quero acessar o detalhe de um pedido específico com itens, status, total, rastreio e personalização.

---

**Cenário 3.1: Página de detalhe carrega pedido existente do usuário logado**
```gherkin
DADO que o usuário está logado com userId = "user-001"
E existe um Order com id = "order-abc" pertencente ao userId "user-001"
QUANDO acessar "/conta/pedidos/order-abc"
ENTÃO a página deve retornar HTTP 200
E o elemento [data-testid="order-detail"] deve estar presente
E o elemento [data-testid="order-number"] deve exibir o orderNumber do pedido
E o elemento [data-testid="order-total"] deve exibir o total formatado em R$ com 2 casas decimais
E o elemento [data-testid="order-date"] deve exibir a data de criação no formato dd/mm/aaaa
```

**Cenário 3.2: Itens do pedido são exibidos com snapshot de nome, quantidade e preço unitário**
```gherkin
DADO que o pedido "order-abc" contém 2 OrderItems:
  | productNameSnapshot | qty | unitPrice | customizationPrice |
  | "Suporte Neon RGB"  |  1  |   89.90   |        10.00       |
  | "Porta Joias 3D"    |  2  |   45.00   |         0.00       |
QUANDO acessar "/conta/pedidos/order-abc"
ENTÃO o elemento [data-testid="order-items-list"] deve conter exatamente 2 itens
E cada item deve ter [data-testid="order-item-{index}"] (order-item-0, order-item-1)
E o item "Suporte Neon RGB" deve exibir preço unitário "R$ 89,90" e personalização "+R$ 10,00"
E o item "Porta Joias 3D" deve exibir quantidade "x2" e preço unitário "R$ 45,00"
E o adicional de personalização zerado NÃO deve ser exibido para o segundo item
```

**Cenário 3.3: Status do pedido é exibido com badge de cor correspondente**
```gherkin
DADO que o pedido "order-abc" tem status = "processing"
QUANDO acessar "/conta/pedidos/order-abc"
ENTÃO o elemento [data-testid="order-status-badge"] deve ser visível
E deve conter o texto legível correspondente ao status (ex: "Em Produção")
E deve aplicar a cor/estilo correspondente ao status "processing"
```

**Cenário 3.4: Código de rastreio é exibido quando disponível**
```gherkin
DADO que o pedido "order-abc" tem trackingCode = "BR123456789BR"
QUANDO acessar "/conta/pedidos/order-abc"
ENTÃO o elemento [data-testid="order-tracking"] deve estar visível
E deve conter o código "BR123456789BR"
E deve exibir um link ou botão [data-testid="order-tracking-link"] que abre o rastreio em nova aba
```

**Cenário 3.5: Código de rastreio não é exibido quando não disponível**
```gherkin
DADO que o pedido "order-abc" tem trackingCode = null
QUANDO acessar "/conta/pedidos/order-abc"
ENTÃO o elemento [data-testid="order-tracking"] NÃO deve ser renderizado no DOM
E deve exibir o elemento [data-testid="order-tracking-pending"] com texto indicando que o rastreio ainda não foi gerado
```

**Cenário 3.6: Personalização do item é exibida quando presente**
```gherkin
DADO que o OrderItem tem customizationSnapshot = '{"nome":"João","cor":"azul"}'
QUANDO o item for renderizado em "/conta/pedidos/order-abc"
ENTÃO o elemento [data-testid="order-item-customization-{index}"] deve estar visível
E deve exibir os campos da personalização em formato legível (ex: "Nome: João · Cor: azul")
```

**Cenário 3.7: Personalização não exibida quando o item não tem customização**
```gherkin
DADO que o OrderItem tem customizationSnapshot = null
QUANDO o item for renderizado em "/conta/pedidos/order-abc"
ENTÃO o elemento [data-testid="order-item-customization-{index}"] NÃO deve ser renderizado
```

**Cenário 3.8: Usuário não pode acessar pedido de outro usuário**
```gherkin
DADO que o usuário está logado com userId = "user-002"
E o pedido "order-abc" pertence ao userId "user-001" (outro usuário)
QUANDO acessar "/conta/pedidos/order-abc"
ENTÃO a resposta deve ser HTTP 404
E a página de erro 404 deve ser exibida sem expor dados do pedido alheio
```

**Cenário 3.9: Usuário não logado é redirecionado para login**
```gherkin
DADO que o visitante não está logado
QUANDO tentar acessar "/conta/pedidos/order-abc"
ENTÃO deve ser redirecionado para "/auth/entrar"
E a URL de retorno deve ser preservada no redirect (ex: via callbackUrl)
```

**Cenário 3.10: Pedido com id inexistente retorna 404**
```gherkin
DADO que o usuário está logado com userId = "user-001"
E não existe nenhum pedido com id = "order-xyz"
QUANDO acessar "/conta/pedidos/order-xyz"
ENTÃO a resposta deve ser HTTP 404
E a página de erro 404 customizada deve ser exibida
```

**Cenário 3.11: Link "Voltar aos pedidos" navega para `/conta/pedidos`**
```gherkin
DADO que o usuário está em "/conta/pedidos/order-abc"
QUANDO clicar no elemento [data-testid="back-to-orders"]
ENTÃO deve ser redirecionado para "/conta/pedidos"
```

---

### Feature 4: Sugestão de universo pós-checkout

**HU-04:** Como cliente que acabou de concluir uma compra sem universo preferido definido, quero receber uma sugestão do universo do produto comprado.

---

**Cenário 4.1: Modal de sugestão é exibido na confirmação quando usuário não tem preferência e produto tem universo**
```gherkin
DADO que o usuário está logado com preferredCollection = null
E o pedido recém-confirmado contém ao menos 1 OrderItem cujo produto pertence ao universo "gaming"
QUANDO acessar "/checkout/confirmado" após finalizar o pedido
ENTÃO o elemento [data-testid="universe-suggestion-modal"] deve ser exibido
E deve conter o nome do universo sugerido: "Gaming"
E deve exibir botão [data-testid="universe-suggestion-accept"] com texto "Sim, quero!"
E deve exibir botão [data-testid="universe-suggestion-dismiss"] com texto "Não, obrigado"
```

**Cenário 4.2: Aceitar sugestão salva preferência e fecha modal**
```gherkin
DADO que o modal [data-testid="universe-suggestion-modal"] está visível com sugestão "gaming"
QUANDO o usuário clicar em [data-testid="universe-suggestion-accept"]
ENTÃO deve ser feita uma chamada PATCH para "/api/user/preference" com body { universeSlug: "gaming" }
E o modal deve ser fechado
E nenhuma navegação forçada deve ocorrer (usuário permanece na página de confirmação)
```

**Cenário 4.3: Dispensar sugestão fecha modal sem alterar preferência**
```gherkin
DADO que o modal [data-testid="universe-suggestion-modal"] está visível com sugestão "anime-nerd"
QUANDO o usuário clicar em [data-testid="universe-suggestion-dismiss"]
ENTÃO o modal deve ser fechado sem fazer chamada para "/api/user/preference"
E o campo preferredCollection do usuário deve permanecer null no banco
```

**Cenário 4.4: Modal NÃO é exibido quando usuário já tem universo preferido definido**
```gherkin
DADO que o usuário está logado com preferredCollection = "casa-decor"
E o pedido contém produto do universo "gaming"
QUANDO acessar "/checkout/confirmado"
ENTÃO o elemento [data-testid="universe-suggestion-modal"] NÃO deve ser renderizado no DOM
```

**Cenário 4.5: Modal NÃO é exibido quando nenhum produto do pedido tem universo associado**
```gherkin
DADO que o usuário está logado com preferredCollection = null
E todos os OrderItems do pedido têm produtos sem universo associado (ProductUniverse vazio)
QUANDO acessar "/checkout/confirmado"
ENTÃO o elemento [data-testid="universe-suggestion-modal"] NÃO deve ser renderizado
```

**Cenário 4.6: Quando pedido tem produtos de múltiplos universos, o universo do primeiro item é sugerido**
```gherkin
DADO que o pedido contém itens dos universos "gaming" (item 1) e "anime-nerd" (item 2)
E o usuário está logado com preferredCollection = null
QUANDO acessar "/checkout/confirmado"
ENTÃO o modal [data-testid="universe-suggestion-modal"] deve sugerir o universo "gaming"
E não deve sugerir múltiplos universos ao mesmo tempo
```

**Cenário 4.7: Usuário guest (não logado) não recebe modal de sugestão**
```gherkin
DADO que o visitante NÃO está logado
E finalizou um pedido como guest
QUANDO acessar "/checkout/confirmado"
ENTÃO o elemento [data-testid="universe-suggestion-modal"] NÃO deve ser renderizado
```

---

### Feature 5: Endereços no banco de dados (migração de localStorage para DB)

**HU-05:** Como cliente logado, quero gerenciar meus endereços de entrega com dados persistidos no banco.

---

**Cenário 5.1: Página `/conta/enderecos` exibe endereços do usuário logado vindos do DB**
```gherkin
DADO que o usuário está logado com userId = "user-001"
E existem 2 Address no banco vinculados ao userId "user-001"
QUANDO acessar "/conta/enderecos"
ENTÃO o elemento [data-testid="addresses-list"] deve conter exatamente 2 cards
E cada card deve ter [data-testid="address-card"]
E os dados exibidos devem corresponder aos registros do banco (não ao localStorage)
```

**Cenário 5.2: Usuário sem endereços cadastrados vê estado vazio**
```gherkin
DADO que o usuário está logado com userId = "user-002"
E não existe nenhum Address no banco vinculado ao userId "user-002"
QUANDO acessar "/conta/enderecos"
ENTÃO o elemento [data-testid="addresses-list"] deve estar presente
E deve exibir o elemento [data-testid="addresses-empty-state"] com mensagem indicando ausência de endereços
```

**Cenário 5.3: Adicionar novo endereço persiste no banco e exibe na lista**
```gherkin
DADO que o usuário está logado e está em "/conta/enderecos"
QUANDO clicar em [data-testid="add-address"]
E preencher o formulário [data-testid="address-form"] com dados válidos:
  | Campo | Valor |
  | label | "Casa" |
  | recipientName | "Maria Silva" |
  | cep | "01310-100" |
  | street | "Av. Paulista" |
  | number | "1000" |
  | complement | "Apto 42" |
  | district | "Bela Vista" |
  | city | "São Paulo" |
  | state | "SP" |
E clicar em [data-testid="save-address"]
ENTÃO deve ser feita uma chamada POST para "/api/user/addresses" com os dados do formulário
E o novo endereço deve aparecer na lista [data-testid="addresses-list"]
E o registro deve existir na tabela Address do banco associado ao userId do usuário logado
E o localStorage NÃO deve ser utilizado para armazenar o endereço
```

**Cenário 5.4: Campos obrigatórios do formulário de endereço são validados antes do envio**
```gherkin
DADO que o usuário está com o formulário [data-testid="address-form"] aberto
QUANDO clicar em [data-testid="save-address"] com os campos "cep", "street", "number", "city" e "state" vazios
ENTÃO o formulário NÃO deve ser enviado
E mensagens de validação devem ser exibidas nos campos obrigatórios faltantes
E nenhuma chamada para "/api/user/addresses" deve ser feita
```

**Cenário 5.5: Remover endereço exclui o registro do banco**
```gherkin
DADO que o usuário está em "/conta/enderecos" com 2 endereços listados
QUANDO clicar no botão [data-testid="remove-address-{id}"] do primeiro endereço
ENTÃO deve ser feita uma chamada DELETE para "/api/user/addresses/{id}"
E o card do endereço removido deve desaparecer da lista [data-testid="addresses-list"]
E o registro deve ser excluído da tabela Address no banco
```

**Cenário 5.6: Marcar endereço como padrão atualiza flag isDefault**
```gherkin
DADO que o usuário tem 2 endereços, o primeiro com isDefault = true e o segundo com isDefault = false
QUANDO clicar em [data-testid="set-default-address-{id}"] do segundo endereço
ENTÃO deve ser feita uma chamada PATCH para "/api/user/addresses/{id}" com body { isDefault: true }
E o card do segundo endereço deve exibir o indicador [data-testid="address-default-badge"]
E o card do primeiro endereço deve ter o indicador [data-testid="address-default-badge"] removido
E no banco, o segundo endereço deve ter isDefault = true e o primeiro deve ter isDefault = false
```

**Cenário 5.7: Endereço padrão exibe badge visual diferenciado**
```gherkin
DADO que o usuário tem endereços cadastrados e o primeiro tem isDefault = true
QUANDO acessar "/conta/enderecos"
ENTÃO o card do endereço padrão deve conter [data-testid="address-default-badge"]
E os cards dos outros endereços NÃO devem ter o badge
```

**Cenário 5.8: Usuário não logado é redirecionado para login ao tentar acessar endereços**
```gherkin
DADO que o visitante não está logado
QUANDO tentar acessar "/conta/enderecos"
ENTÃO deve ser redirecionado para "/auth/entrar"
```

**Cenário 5.9: Erro da API ao salvar endereço exibe mensagem de erro sem perder os dados do formulário**
```gherkin
DADO que a API "/api/user/addresses" retorna HTTP 500 ao tentar criar um endereço
QUANDO o usuário preencher e submeter o formulário [data-testid="address-form"]
ENTÃO o elemento [data-testid="address-form-error"] deve ser exibido com mensagem de erro
E os campos do formulário devem manter os valores preenchidos pelo usuário (sem reset)
E a lista de endereços deve permanecer inalterada
```

---

### Feature 6: Analytics — instrumentação de eventos

**HU-06:** Como product manager, quero que eventos-chave sejam instrumentados com `console.log` estruturado e preparados para integração futura.

---

**Cenário 6.1: Evento `universe_preference_changed` é emitido ao trocar universo em `/conta`**
```gherkin
DADO que o usuário está logado e está no seletor de universo em "/conta"
QUANDO clicar em [data-testid="universe-option-gaming"] para trocar o universo
E a chamada PATCH para "/api/user/preference" retornar sucesso
ENTÃO um evento deve ser emitido no console com o seguinte formato:
  {
    event: "universe_preference_changed",
    userId: "<id do usuário>",
    previousUniverse: "<slug anterior ou null>",
    newUniverse: "gaming",
    source: "account_page",
    timestamp: "<ISO 8601>"
  }
E o evento deve ser chamado via função utilitária `trackEvent("universe_preference_changed", payload)`
E a ausência de SDK externo NÃO deve causar erros (a função deve ser no-op se SDK não estiver configurado)
```

**Cenário 6.2: Evento `universe_preference_changed` é emitido ao aceitar sugestão pós-checkout**
```gherkin
DADO que o modal [data-testid="universe-suggestion-modal"] está visível com sugestão "presentes"
QUANDO o usuário aceitar a sugestão clicando em [data-testid="universe-suggestion-accept"]
E a chamada PATCH retornar sucesso
ENTÃO um evento deve ser emitido com:
  {
    event: "universe_preference_changed",
    userId: "<id do usuário>",
    previousUniverse: null,
    newUniverse: "presentes",
    source: "post_checkout_suggestion",
    timestamp: "<ISO 8601>"
  }
```

**Cenário 6.3: Evento `order_detail_viewed` é emitido ao acessar página de detalhe do pedido**
```gherkin
DADO que o usuário está logado e acessa "/conta/pedidos/order-abc"
QUANDO a página for carregada com sucesso (HTTP 200)
ENTÃO um evento deve ser emitido com o seguinte formato:
  {
    event: "order_detail_viewed",
    userId: "<id do usuário>",
    orderId: "order-abc",
    orderStatus: "<status atual do pedido>",
    timestamp: "<ISO 8601>"
  }
```

**Cenário 6.4: Eventos NÃO são emitidos em caso de erro (4xx ou 5xx)**
```gherkin
DADO que a troca de universo falha com HTTP 500
QUANDO o usuário tenta trocar o universo em "/conta"
ENTÃO o evento "universe_preference_changed" NÃO deve ser emitido
E o evento só deve ser emitido após confirmação de sucesso da API
```

**Cenário 6.5: Função `trackEvent` não lança exceção quando SDK externo está ausente**
```gherkin
DADO que nenhum SDK de analytics externo está configurado no ambiente
QUANDO qualquer evento rastreado for emitido via `trackEvent`
ENTÃO nenhuma exceção deve ser lançada
E o evento deve ser impresso no console com `console.log` contendo os dados estruturados
E o fluxo de usuário NÃO deve ser interrompido
```


---

### Feature 7: Faixa promocional personalizada na LP

**HU-07:** Como visitante ou cliente logado na homepage, quero ver uma faixa de produtos em destaque personalizada abaixo da navbar, para descobrir produtos relevantes ao meu universo de interesse ou as campanhas promocionais ativas.

---

**Cenário 7.1: Campanha ativa é exibida na faixa com título, produtos e período vigente**
```gherkin
DADO que existe uma PromoBanner com:
  | campo    | valor                    |
  | isActive | true                     |
  | startsAt | 2026-06-10T00:00:00Z     |
  | endsAt   | 2026-06-20T23:59:59Z     |
  | title    | "Promoção Gamer Week"    |
E a data atual está entre startsAt e endsAt
E a campanha possui ao menos 1 PromoBannerProduct associado
QUANDO acessar "/"
ENTÃO o elemento [data-testid="promo-banner-section"] deve estar presente no DOM
E o elemento [data-testid="promo-banner-title"] deve exibir "Promoção Gamer Week"
E o elemento [data-testid="promo-banner-card-0"] deve estar visível
```

**Cenário 7.2: Fallback para produtos em destaque do universo preferido quando não há campanha ativa**
```gherkin
DADO que não existe nenhuma PromoBanner com isActive = true E período vigente
E o usuário está logado com User.preferredCollection = "gaming"
E existem Products com isFeatured = true associados ao universo "gaming" via ProductUniverse
QUANDO acessar "/"
ENTÃO o elemento [data-testid="promo-banner-section"] deve estar presente
E os cards exibidos devem corresponder a produtos com isFeatured = true do universo "gaming"
E o elemento [data-testid="promo-banner-title"] NÃO deve exibir título de campanha
```

**Cenário 7.3: Fallback global quando não há campanha ativa nem universo preferido definido**
```gherkin
DADO que não existe nenhuma PromoBanner com isActive = true E período vigente
E o usuário não está logado OU o User.preferredCollection é null
E existem Products com isFeatured = true em qualquer universo
QUANDO acessar "/"
ENTÃO o elemento [data-testid="promo-banner-section"] deve estar presente
E os cards exibidos devem corresponder a produtos com isFeatured = true (sem filtro de universo)
```

**Cenário 7.4: Cards da faixa exibem imagem, nome, preço e botão de navegação para o PDP**
```gherkin
DADO que a faixa está renderizada com ao menos um card (campanha ou fallback)
QUANDO o card no índice 0 for renderizado
ENTÃO o elemento [data-testid="promo-banner-card-image-0"] deve estar presente com src preenchido
E o elemento [data-testid="promo-banner-card-name-0"] deve exibir o nome do produto
E o elemento [data-testid="promo-banner-card-price-0"] deve exibir o preço no formato "R$ X,XX"
E o elemento [data-testid="promo-banner-card-cta-0"] deve ser um link com href apontando para "/produto/{slug}"
```

**Cenário 7.5: Campanha expirada não é exibida — fallback entra automaticamente**
```gherkin
DADO que existe uma PromoBanner com isActive = true mas endsAt anterior à data atual
E existem Products com isFeatured = true
QUANDO acessar "/"
ENTÃO o elemento [data-testid="promo-banner-section"] deve exibir os produtos em destaque (fallback)
E o título da campanha expirada NÃO deve ser exibido
E a PromoBanner expirada NÃO deve ser considerada como campanha ativa
```

**Cenário 7.6: Admin cria campanha com produtos — faixa exibe a campanha após startsAt**
```gherkin
DADO que um usuário admin está autenticado
QUANDO fizer POST para "/api/admin/promo-banners" com body:
  {
    "title": "Anime Fest",
    "startsAt": "<data atual - 1h>",
    "endsAt": "<data atual + 7 dias>",
    "isActive": true,
    "products": [{ "productId": "prod-001", "sortOrder": 0 }]
  }
ENTÃO a resposta deve ser HTTP 201 com o objeto PromoBanner criado, incluindo id
E ao acessar "/", o elemento [data-testid="promo-banner-title"] deve exibir "Anime Fest"
E o card [data-testid="promo-banner-card-0"] deve corresponder ao produto "prod-001"
```

**Cenário 7.7: Admin desativa campanha via PATCH — fallback entra imediatamente**
```gherkin
DADO que existe uma PromoBanner ativa com id = "banner-001" sendo exibida na LP
QUANDO um usuário admin fizer PATCH para "/api/admin/promo-banners/banner-001" com body { "isActive": false }
ENTÃO a resposta deve ser HTTP 200
E ao acessar "/", o elemento [data-testid="promo-banner-section"] deve exibir o fallback (produtos isFeatured)
E o título "banner-001" NÃO deve aparecer na faixa
```

**Cenário 7.8: Campanha com 0 produtos não é exibida — fallback entra**
```gherkin
DADO que existe uma PromoBanner com isActive = true, período vigente, mas sem nenhum PromoBannerProduct associado
E existem Products com isFeatured = true
QUANDO acessar "/"
ENTÃO o elemento [data-testid="promo-banner-section"] deve exibir o fallback (produtos isFeatured)
E a campanha vazia NÃO deve ser considerada válida para exibição
```

---

## Regras de Negócio

| ID | Regra |
|----|-------|
| RN-M06-01 | O tema da área `/conta` é derivado de `User.preferredCollection` (campo DB), nunca do cookie `universe_pref`. O cookie é usado apenas na homepage para ordenação. |
| RN-M06-02 | O `UniverseThemeProvider` envolve apenas o conteúdo da área `/conta`; navegação global, header e footer usam sempre o tema base. |
| RN-M06-03 | A troca de universo pelo seletor em `/conta` aciona `PATCH /api/user/preference`, que persiste no DB e no cookie simultaneamente (comportamento herdado do M05). |
| RN-M06-04 | A página `/conta/pedidos/[id]` exige que o `orderId` pertença ao `userId` da sessão ativa; qualquer acesso cross-user retorna HTTP 404 (nunca 403, para não vazar a existência do pedido). |
| RN-M06-05 | O `trackingCode` em `Order` é opcional; a UI deve tratar null graciosamente exibindo "Rastreio em breve" ou equivalente. |
| RN-M06-06 | A sugestão de universo pós-checkout é exibida apenas quando: (a) usuário está logado, (b) `User.preferredCollection` é null, e (c) ao menos 1 item do pedido pertence a um universo via relação `ProductUniverse`. |
| RN-M06-07 | Quando um pedido tem produtos de múltiplos universos, apenas o universo do primeiro `OrderItem` (índice 0 da lista de items) é sugerido. |
| RN-M06-08 | A sugestão pós-checkout é uma ação opcional e irrecusável: dispensar (dismiss) não salva nada, não pergunta novamente na mesma sessão, e não cria efeitos colaterais. |
| RN-M06-09 | O model `Address` já existe no schema desde M03. A página `/conta/enderecos` deve migrar de localStorage para DB sem alteração no schema. Todas as operações CRUD passam por APIs autenticadas. |
| RN-M06-10 | Um usuário pode ter múltiplos endereços, mas apenas um com `isDefault = true`. Ao marcar um endereço como padrão, todos os outros do mesmo usuário devem ter `isDefault = false` (operação atômica no banco). |
| RN-M06-11 | A exclusão de endereço é uma operação definitiva (hard delete). Não há soft delete para endereços de usuário. |
| RN-M06-12 | Campos obrigatórios para criação de endereço: `cep`, `street`, `number`, `district`, `city`, `state`, `recipientName`. Campos opcionais: `complement`, `label`. |
| RN-M06-13 | O sistema de analytics usa `console.log` estruturado como canal de saída por padrão. A função `trackEvent(eventName, payload)` deve estar isolada em `src/lib/analytics.ts` para facilitar troca futura de SDK sem alterações nos componentes. |
| RN-M06-14 | Eventos de analytics são emitidos apenas após confirmação de sucesso da operação. Nunca emitir evento otimisticamente antes da resposta da API. |
| RN-M06-15 | A página `/conta/pedidos/[id]` é um Server Component; os dados são buscados no servidor e não expostos via API pública. |
| RN-M06-16 | O `customizationSnapshot` em `OrderItem` é JSON congelado no momento da compra. A UI deve renderizá-lo como pares chave-valor legíveis; nunca deve ser editável pelo cliente. |
| RN-M06-17 | A sugestão de universo pós-checkout usa dados já disponíveis na página de confirmação (order do localStorage + ProductUniverse via API). Não deve bloquear o carregamento da página principal de confirmação. |
| RN-M06-18 | Uma campanha ativa é definida por: `PromoBanner.isActive = true` AND `startsAt <= NOW()` AND `endsAt >= NOW()`. A query deve ser feita no servidor a cada request (sem cache estático) para garantir que campanhas expiradas não sejam exibidas. |
| RN-M06-19 | A faixa exibe apenas uma campanha por vez. Se houver múltiplas campanhas com período solapado e `isActive = true`, deve ser exibida a de `startsAt` mais recente. |
| RN-M06-20 | O fallback por universo preferido usa `User.preferredCollection` da sessão (campo DB, via `getServerSession`). O cookie `universe_pref` NÃO é usado para a faixa. |
| RN-M06-21 | A faixa exibe entre 3 e 5 cards. Se a campanha ou o fallback retornar menos de 3 produtos, a seção `promo-banner-section` não deve ser renderizada (evitar carrossel com conteúdo insuficiente). |
| RN-M06-22 | A exclusão de uma PromoBanner (DELETE) deve realizar cascade delete nos registros `PromoBannerProduct` associados (garantido pela relação `onDelete: Cascade` no schema). |

---

## Modelo de Dados (apenas deltas)

O schema atual já contém os models `User`, `Address`, `Order`, `OrderItem`, `Universe` e `ProductUniverse`. Nenhum novo model precisa ser criado para M06.

### Delta 1: Nenhuma alteração de schema necessária

O model `Address` (já existente desde M03) suporta todos os campos necessários para a Feature 5:

```prisma
// Já existe no schema — nenhuma migração necessária
model Address {
  id            String  @id @default(cuid())
  userId        String
  label         String  // "Casa", "Trabalho" — campo a ser usado na UI
  recipientName String  // obrigatório no formulário de cliente
  cep           String
  street        String
  number        String
  complement    String?
  district      String
  city          String
  state         String
  country       String  @default("Brasil")
  isDefault     Boolean @default(false)
  user          User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  // Nota: campo createdAt e updatedAt ausentes no schema atual — NÃO adicionar como delta de M06
}
```

### Delta 2: Novas APIs REST necessárias (sem schema change)

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/api/user/addresses` | Lista endereços do usuário logado |
| `POST` | `/api/user/addresses` | Cria novo endereço para o usuário logado |
| `PATCH` | `/api/user/addresses/[id]` | Atualiza endereço (ex: setar isDefault) |
| `DELETE` | `/api/user/addresses/[id]` | Remove endereço do usuário logado |

### Delta 3: Nova rota de página

| Rota | Tipo | Descrição |
|------|------|-----------|
| `/conta/pedidos/[id]/page.tsx` | Server Component | Detalhe do pedido — nova página |
| `/conta/layout.tsx` | Server Component (novo ou existente) | Layout compartilhado com `UniverseThemeProvider` para toda a área `/conta` |

### Delta 4: Novo arquivo de analytics

| Arquivo | Descrição |
|---------|-----------|
| `src/lib/analytics.ts` | Função `trackEvent(eventName: string, payload: Record<string, unknown>): void` — console.log estruturado, extensível para SDK futuro |

### Delta 5: Novos models para Feature 7 — Faixa Promocional

```prisma
model PromoBanner {
  id        String               @id @default(cuid())
  title     String
  subtitle  String?
  startsAt  DateTime
  endsAt    DateTime
  isActive  Boolean              @default(true)
  products  PromoBannerProduct[]
  createdAt DateTime             @default(now())
  updatedAt DateTime             @updatedAt
}

model PromoBannerProduct {
  bannerId  String
  productId String
  sortOrder Int         @default(0)
  banner    PromoBanner @relation(fields: [bannerId], references: [id], onDelete: Cascade)
  product   Product     @relation(fields: [productId], references: [id], onDelete: Cascade)
  @@id([bannerId, productId])
  @@index([bannerId, sortOrder])
}
```

> **Nota de migração:** O model `Product` existente deve receber a relação inversa `promoBanners PromoBannerProduct[]` para compatibilidade com o Prisma Client.

### Delta 6: Novas APIs REST para Feature 7

**Endpoint público:**

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/api/promotions/active` | Retorna a campanha ativa com seus produtos OU os produtos `isFeatured = true` do universo indicado. Query param opcional: `?universeSlug=gaming`. Retorna no máximo 5 produtos. |

**Endpoints admin:**

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/api/admin/promo-banners` | Lista todas as campanhas (ativas e inativas), ordenadas por `createdAt` desc |
| `POST` | `/api/admin/promo-banners` | Cria nova campanha com produtos associados. Corpo: `{ title, subtitle?, startsAt, endsAt, isActive, products: [{ productId, sortOrder }] }` |
| `PATCH` | `/api/admin/promo-banners/[id]` | Atualiza campos da campanha (incluindo `isActive`, `endsAt`). Suporta substituição parcial dos produtos. |
| `DELETE` | `/api/admin/promo-banners/[id]` | Remove a campanha e todos os `PromoBannerProduct` em cascade. |

---

## Data-testids obrigatórios

| Elemento | data-testid | Feature | Página |
|----------|-------------|---------|--------|
| Wrapper temático da área `/conta` | `conta-theme-wrapper` | F1 | `/conta`, `/conta/*` |
| Badge do universo ativo | `conta-universe-badge` | F1 | `/conta` |
| Seção seletora de universo | `universe-selector` | F2 | `/conta` |
| Card de opção de universo | `universe-option-{slug}` | F2 | `/conta` |
| Indicador de universo selecionado | `universe-option-active-indicator` | F2 | `/conta` |
| Estado de loading do seletor | `universe-selector-loading` | F2 | `/conta` |
| Mensagem de erro do seletor | `universe-selector-error` | F2 | `/conta` |
| Container do detalhe do pedido | `order-detail` | F3 | `/conta/pedidos/[id]` |
| Número do pedido | `order-number` | F3 | `/conta/pedidos/[id]` |
| Total do pedido | `order-total` | F3 | `/conta/pedidos/[id]` |
| Data do pedido | `order-date` | F3 | `/conta/pedidos/[id]` |
| Badge de status do pedido | `order-status-badge` | F3 | `/conta/pedidos/[id]` |
| Código de rastreio | `order-tracking` | F3 | `/conta/pedidos/[id]` |
| Link do rastreio | `order-tracking-link` | F3 | `/conta/pedidos/[id]` |
| Texto "rastreio pendente" | `order-tracking-pending` | F3 | `/conta/pedidos/[id]` |
| Lista de itens do pedido | `order-items-list` | F3 | `/conta/pedidos/[id]` |
| Item individual do pedido | `order-item-{index}` | F3 | `/conta/pedidos/[id]` |
| Dados de personalização do item | `order-item-customization-{index}` | F3 | `/conta/pedidos/[id]` |
| Link voltar aos pedidos | `back-to-orders` | F3 | `/conta/pedidos/[id]` |
| Modal de sugestão de universo | `universe-suggestion-modal` | F4 | `/checkout/confirmado` |
| Botão aceitar sugestão | `universe-suggestion-accept` | F4 | `/checkout/confirmado` |
| Botão dispensar sugestão | `universe-suggestion-dismiss` | F4 | `/checkout/confirmado` |
| Lista de endereços | `addresses-list` | F5 | `/conta/enderecos` |
| Card de endereço | `address-card` | F5 | `/conta/enderecos` |
| Estado vazio de endereços | `addresses-empty-state` | F5 | `/conta/enderecos` |
| Botão adicionar endereço | `add-address` | F5 | `/conta/enderecos` |
| Formulário de endereço | `address-form` | F5 | `/conta/enderecos` |
| Botão salvar endereço | `save-address` | F5 | `/conta/enderecos` |
| Mensagem de erro do formulário | `address-form-error` | F5 | `/conta/enderecos` |
| Botão remover endereço | `remove-address-{id}` | F5 | `/conta/enderecos` |
| Botão marcar como padrão | `set-default-address-{id}` | F5 | `/conta/enderecos` |
| Badge de endereço padrão | `address-default-badge` | F5 | `/conta/enderecos` |
| Seção da faixa promocional | `promo-banner-section` | F7 | `/` (homepage) |
| Título da campanha ativa | `promo-banner-title` | F7 | `/` (homepage) |
| Card de produto na faixa (índice) | `promo-banner-card-{index}` | F7 | `/` (homepage) |
| Imagem do card da faixa | `promo-banner-card-image-{index}` | F7 | `/` (homepage) |
| Nome do produto no card | `promo-banner-card-name-{index}` | F7 | `/` (homepage) |
| Preço do produto no card | `promo-banner-card-price-{index}` | F7 | `/` (homepage) |
| Botão "Ver produto" (link PDP) | `promo-banner-card-cta-{index}` | F7 | `/` (homepage) |

---

## Decisões de Arquitetura em Aberto (para o Dev resolver na FASE 1)

| # | Decisão | Contexto | Opções | Recomendação |
|---|---------|----------|--------|--------------|
| DA-M06-01 | Onde colocar o `UniverseThemeProvider` para a área `/conta` | Todas as sub-rotas de `/conta` devem herdar o tema; o provider precisa do `preferredCollection` do usuário logado | (A) `app/conta/layout.tsx` como Server Component que busca o usuário e injeta o provider. (B) Cada `page.tsx` instancia o provider individualmente. | Recomendado: (A) — layout compartilhado elimina duplicação e garante tema consistente em todas as sub-rotas |
| DA-M06-02 | Como buscar o universo do produto para a sugestão pós-checkout | A página `/checkout/confirmado` é Client Component e lê o pedido do localStorage; precisa saber o universo do produto | (A) Adicionar `universeSlug` no snapshot do pedido salvo no localStorage durante o checkout. (B) Fazer fetch de `/api/universes` e `/api/products/{id}` no client após montar a página. (C) Server Component com fetch do DB. | Recomendado: (A) — simplifica a página de confirmação; exige salvar `universeSlug` no item do pedido durante criação do checkout |
| DA-M06-03 | Atomicidade ao marcar endereço como padrão | Ao marcar um endereço como padrão, todos os outros devem ser desmarcados em uma única operação | (A) Transaction Prisma: `prisma.$transaction([updateMany(false), update(true)])`. (B) Lógica em dois passos sem transação (risco de inconsistência). | Recomendado: (A) — transação atômica obrigatória para RN-M06-10 |
| DA-M06-04 | Client vs Server Component para o seletor de universo | O seletor precisa de estado reativo (loading, seleção otimística, erro) | (A) Client Component com `useState` + fetch via `fetch('/api/user/preference', {method:'PATCH'})`. (B) Server Action com `useTransition`. | Recomendado: (A) — mais simples para o estado de loading e feedback visual imediato |
| DA-M06-05 | Estrutura da função `trackEvent` em `src/lib/analytics.ts` | Deve ser extensível para SDK futuro (ex: Amplitude, Segment) sem alterações nos chamadores | Interface: `trackEvent(event: string, properties: Record<string, unknown>): void`. Implementação atual: `console.log('[analytics]', { event, ...properties, timestamp: new Date().toISOString() })`. Futura: troca o corpo da função. | Confirmar que TypeScript strict aceita `Record<string, unknown>` como tipo de payload |
| DA-M06-06 | A faixa usa SSR (Server Component) ou Client Component com fetch no browser? | A faixa precisa de dados dinâmicos (campanha ativa ou isFeatured por universo). A decisão impacta cache, performance e personalização por usuário | (A) **Server Component** com `fetch` no servidor a cada request — dados sempre frescos, sem flash de conteúdo, URL da API não exposta ao cliente. Desvantagem: sem cache estático, ligeiramente mais lento no TTFB. (B) **Client Component** com `useEffect` + `fetch('/api/promotions/active')` no browser — permite mostrar skeleton/loading, mas expõe a API publicamente e adiciona roundtrip após hidratação. (C) **Server Component com `revalidate`** (ISR) — cache de N segundos, mas campanha expirada pode aparecer por até N segundos após o endsAt. | Recomendado: (A) Server Component sem cache (`cache: 'no-store'`) — garante que campanhas expiradas não apareçam e que o `preferredCollection` do usuário logado seja lido corretamente no servidor via `getServerSession`. O componente deve ser isolado (`PromoBannerSection`) para não bloquear o restante da LP |

---

> **Próximo passo após G0:** Acionar Dev (FASE 1 — Derivation) para derivar arquitetura técnica a partir desta spec, com foco especial nas decisões DA-M06-01, DA-M06-02 e DA-M06-03.
