# M05 — Multi-Theme Experience + LP Redesign

> **Status:** DRAFT — aguardando aprovação G0
> **Milestone:** M05 — Diferenciação (Fase 2)
> **Última atualização:** 2026-06-11
> **Business Analyst:** Agente BA (Claude)
> **Stack:** Next.js 15 App Router, TypeScript strict, Tailwind CSS, shadcn/ui, Prisma + Neon PostgreSQL, NextAuth.js v5

---

## Objetivos do Milestone

1. Redesenhar a Landing Page com foco em conversão por segmento de persona
2. Substituir a seção "Coleções" por "Universos" — 5 segmentos visuais com identidade própria
3. Criar páginas dedicadas por Universo com tema visual distinto
4. Implementar sistema de persistência de preferência de Universo (cookie / perfil)
5. Garantir jornada máxima de 3 cliques: Home → Universo → Produto → Personalização

---

## Personas e Universos

| Universo | Slug | Persona-alvo | Paleta | Tipografia |
|----------|------|-------------|--------|------------|
| Gaming | `gaming` | O Gamer (18–28) | Dark/Neon (#0a0a0a + #00ff41 + #ff00ff) | Orbitron (heading), Inter (body) |
| Anime & Nerd | `anime-nerd` | Fã de Anime (16–28) | Vibrante (#ff6b9d + #c44dff + #fff) | Fredoka One (heading), Nunito (body) |
| Casa & Decor | `casa-decor` | A Decoradora (25–45) | Clean/Warm (#faf8f5 + #8b6914 + #2c2c2c) | Playfair Display (heading), Lato (body) |
| Presentes | `presentes` | O Presenteador (20–50) | Caloroso/Celebração (#fff9f0 + #e8521a + #2c2c2c) | Merriweather (heading), Open Sans (body) |
| Auto | `auto` | Entusiasta Auto (25–45) | Sólido/Bold (#1a1a1a + #c0392b + #f5f5f5) | Bebas Neue (heading), Roboto (body) |

---

## Regras de Negócio Consolidadas

| ID | Regra |
|----|-------|
| RN-M05-01 | Um produto pode pertencer a múltiplos universos via campo `universes` (array de slugs no JSON de metadados ou coluna dedicada) |
| RN-M05-02 | Se um universo não tiver nenhum produto publicado vinculado, o card desse universo NÃO aparece na seção Universos da LP — ou exibe badge "Em breve" se configurado explicitamente |
| RN-M05-03 | Preferência de universo NÃO é obrigatória — usuário pode ignorar e navegar livremente pelo catálogo geral |
| RN-M05-04 | Guest: preferência salva em cookie `universe_pref` com TTL de 30 dias (sem consentimento adicional conforme RN-62) |
| RN-M05-05 | Logado: preferência salva em `User.preferredCollection` (campo já existente no schema) |
| RN-M05-06 | CTA WhatsApp usa `StoreSettings.whatsappPhone`; se esse campo estiver vazio, o botão WhatsApp NÃO é renderizado |
| RN-M05-07 | Tema visual NÃO altera fluxo de checkout, formulários, carrinho nem regras de acessibilidade base (contraste WCAG AA mínimo em todos os temas) |
| RN-M05-08 | Copy da LP nunca menciona preço — vende personalização e exclusividade |
| RN-M05-09 | Metadados SEO (title, description, og:image) são específicos por página de universo; a LP principal tem metadata própria |
| RN-M05-10 | Destaques por universo exibem no máximo 3 produtos `isFeatured = true` vinculados ao universo; se houver menos de 1, a seção "Destaques" daquele universo é omitida |
| RN-M05-11 | Universo preferido aparece em primeiro na grade de Universos da LP (não em posição separada) apenas quando há preferência registrada |
| RN-M05-12 | A mensagem pré-preenchida do WhatsApp deve mencionar o universo de origem se o usuário estiver em uma página de universo |
| RN-M05-13 | Lighthouse Performance ≥ 80, Accessibility ≥ 90 para LP e para cada página de universo |
| RN-M05-14 | O componente `UniverseThemeProvider` injeta CSS custom properties (`--color-primary`, `--color-bg`, `--font-heading`, etc.) no escopo da página; componentes de checkout e carrinho ignoram essas variáveis e usam design tokens base |

---

## Features e Cenários

---

### Feature 1: LP Redesign — Hero Section

**História:** Como visitante da loja, quero encontrar imediatamente a proposta de valor da marca ao chegar na homepage, para entender em segundos se o site oferece o que procuro.

---

**Cenário 1.1: Hero visível acima da dobra em desktop**
```gherkin
DADO que um visitante acessa a homepage "/"
QUANDO a página for carregada em viewport desktop (≥ 1024px)
ENTÃO o elemento [data-testid="hero-section"] deve ser visível sem scroll
E o elemento [data-testid="hero-headline"] deve conter o texto "Feito para você. Só para você."
E o elemento [data-testid="hero-cta-universos"] deve estar visível
E o elemento [data-testid="hero-cta-universos"] deve ter texto "Descubra seu Universo"
```

**Cenário 1.2: Hero visível acima da dobra em mobile**
```gherkin
DADO que um visitante acessa a homepage "/"
QUANDO a página for carregada em viewport mobile (≤ 390px)
ENTÃO o elemento [data-testid="hero-section"] deve ser visível sem scroll
E o elemento [data-testid="hero-headline"] deve estar legível (font-size ≥ 28px)
E o elemento [data-testid="hero-cta-universos"] deve ser um botão com largura ≥ 280px
```

**Cenário 1.3: CTA do Hero navega para a seção Universos**
```gherkin
DADO que um visitante está na homepage "/"
QUANDO clicar em [data-testid="hero-cta-universos"]
ENTÃO a página deve fazer scroll suave até o elemento [data-testid="universos-section"]
E o card do primeiro universo deve estar visível na viewport
```

**Cenário 1.4: Hero não menciona preço**
```gherkin
DADO que um visitante acessa a homepage "/"
QUANDO o conteúdo do [data-testid="hero-section"] for renderizado
ENTÃO não deve conter nenhuma ocorrência de "R$" ou "reais" ou "preço" ou "a partir de"
```

**Cenário 1.5: Hero com imagem de fundo carregada (LCP)**
```gherkin
DADO que um visitante acessa a homepage "/"
QUANDO a página for carregada
ENTÃO o elemento [data-testid="hero-bg-image"] deve ter atributo "priority" (Next.js Image)
E o LCP deve ser inferior a 2,5 segundos em conexão simulada 4G
```

---

### Feature 2: LP — Navegador de Universos

**História:** Como visitante, quero visualizar os 5 universos disponíveis em cards visuais atrativos, para escolher rapidamente o segmento que tem a ver comigo e chegar nos produtos certos.

---

**Cenário 2.1: Exibir os 5 cards de universo quando todos têm produtos**
```gherkin
DADO que existem produtos publicados vinculados a cada um dos 5 universos (gaming, anime-nerd, casa-decor, presentes, auto)
QUANDO um visitante acessar a homepage "/"
ENTÃO o elemento [data-testid="universos-section"] deve conter exatamente 5 cards
E cada card deve ter [data-testid="universo-card-{slug}"] (ex: "universo-card-gaming")
E cada card deve exibir: nome do universo, imagem de destaque e tagline do segmento
```

**Cenário 2.2: Card de universo sem produtos publicados exibe "Em breve"**
```gherkin
DADO que o universo "auto" não possui produtos publicados vinculados a ele
E o universo "auto" está marcado como `comingSoon: true` na configuração
QUANDO um visitante acessar a homepage "/"
ENTÃO o card [data-testid="universo-card-auto"] deve ser exibido
E deve conter o badge [data-testid="universo-badge-coming-soon"] com texto "Em breve"
E o card não deve ser clicável (sem link ativo)
```

**Cenário 2.3: Universo sem produtos e sem flag "Em breve" não aparece**
```gherkin
DADO que o universo "auto" não possui produtos publicados vinculados
E o universo "auto" não está marcado como `comingSoon: true`
QUANDO um visitante acessar a homepage "/"
ENTÃO o card [data-testid="universo-card-auto"] NÃO deve ser renderizado no DOM
E a seção deve exibir apenas 4 cards
```

**Cenário 2.4: Clique em card navega para página do universo**
```gherkin
DADO que o visitante está na homepage "/"
QUANDO clicar no [data-testid="universo-card-gaming"]
ENTÃO deve ser redirecionado para "/universo/gaming"
E a URL deve mudar para "/universo/gaming"
```

**Cenário 2.5: Universo preferido aparece em primeiro na grade**
```gherkin
DADO que o visitante possui cookie "universe_pref" com valor "presentes"
QUANDO acessar a homepage "/"
ENTÃO o primeiro card em [data-testid="universos-section"] deve ser [data-testid="universo-card-presentes"]
E os demais 4 cards devem seguir a ordem padrão configurada
```

**Cenário 2.6: Sem preferência — grade exibe universos na ordem padrão**
```gherkin
DADO que o visitante NÃO possui cookie "universe_pref"
E NÃO está logado
QUANDO acessar a homepage "/"
ENTÃO os cards de universo devem aparecer na ordem configurada: gaming, anime-nerd, casa-decor, presentes, auto
```

**Cenário 2.7: Mobile — cards em carousel horizontal**
```gherkin
DADO que um visitante acessa a homepage em viewport mobile (≤ 640px)
QUANDO a seção [data-testid="universos-section"] for renderizada
ENTÃO os cards devem estar dispostos em carousel horizontal com scroll snap
E deve haver indicador de paginação [data-testid="universos-carousel-dots"]
E deve ser possível navegar por swipe horizontal entre os cards
```

**Cenário 2.8: Desktop — cards em grid de 5 colunas ou 3+2**
```gherkin
DADO que um visitante acessa a homepage em viewport desktop (≥ 1024px)
QUANDO a seção [data-testid="universos-section"] for renderizada
ENTÃO os cards devem estar dispostos em grid (não carousel)
E todos os 5 cards devem ser visíveis sem scroll horizontal
```

---

### Feature 3: LP — Como Funciona

**História:** Como visitante que ainda não conhece a loja, quero entender o processo de personalização em 3 passos simples, para ganhar confiança de que é fácil pedir um produto único.

---

**Cenário 3.1: Seção "Como Funciona" exibe exatamente 3 passos**
```gherkin
DADO que um visitante acessa a homepage "/"
QUANDO a seção [data-testid="como-funciona-section"] for renderizada
ENTÃO deve conter exatamente 3 elementos [data-testid="passo-{n}"] (passo-1, passo-2, passo-3)
E o passo-1 deve conter texto referente a "Escolhe" ou equivalente
E o passo-2 deve conter texto referente a "Personaliza" ou equivalente
E o passo-3 deve conter texto referente a "Recebe" e "único" ou equivalente
```

**Cenário 3.2: Passos não usam ícones genéricos — texto específico**
```gherkin
DADO que a seção [data-testid="como-funciona-section"] está renderizada
QUANDO inspecionar o conteúdo de cada passo
ENTÃO nenhum passo deve conter apenas ícone sem texto descritivo
E cada passo deve ter um parágrafo com descrição específica ao contexto de impressão 3D personalizada
E nenhum passo deve usar termos genéricos como "Escolha um produto" sem contexto
```

**Cenário 3.3: Seção responsiva em mobile**
```gherkin
DADO que um visitante acessa a homepage em viewport mobile (≤ 640px)
QUANDO a seção [data-testid="como-funciona-section"] for renderizada
ENTÃO os 3 passos devem estar empilhados verticalmente (coluna única)
E cada passo deve ocupar 100% da largura disponível
```

---

### Feature 4: LP — Prova Social

**História:** Como visitante indeciso, quero ver depoimentos de clientes reais com fotos do produto recebido, para ganhar confiança de comprar algo personalizado de uma loja que não conheço.

---

**Cenário 4.1: Seção exibe mínimo de 3 depoimentos**
```gherkin
DADO que existem pelo menos 3 depoimentos publicados no sistema
QUANDO um visitante acessar a homepage "/"
ENTÃO o elemento [data-testid="prova-social-section"] deve ser visível
E deve conter ao menos 3 elementos [data-testid="depoimento-card"]
E cada card deve ter: foto do cliente, nome do cliente, texto do depoimento e foto do produto recebido
```

**Cenário 4.2: Depoimento sem foto de produto não bloqueia renderização**
```gherkin
DADO que existe um depoimento publicado sem foto do produto anexada
QUANDO a seção [data-testid="prova-social-section"] for renderizada
ENTÃO o [data-testid="depoimento-card"] desse depoimento deve ser exibido normalmente
E o slot de imagem do produto deve exibir um placeholder [data-testid="depoimento-produto-placeholder"]
```

**Cenário 4.3: Seção não é exibida quando há menos de 3 depoimentos publicados**
```gherkin
DADO que existem apenas 2 depoimentos publicados no sistema
QUANDO um visitante acessar a homepage "/"
ENTÃO o elemento [data-testid="prova-social-section"] NÃO deve ser renderizado
```

**Cenário 4.4 (Stretch): Filtrar depoimentos por universo**
```gherkin
DADO que existem depoimentos vinculados ao universo "gaming" e ao universo "presentes"
E o visitante está na homepage "/"
QUANDO clicar no filtro [data-testid="depoimento-filtro-gaming"]
ENTÃO apenas os cards vinculados ao universo "gaming" devem ser exibidos
E o filtro "gaming" deve aparecer ativo (aria-selected="true")
```

---

### Feature 5: LP — Destaques por Universo

**História:** Como visitante que escolheu seu universo na LP, quero ver os produtos mais vendidos daquele universo com um clique direto para personalizar, para encurtar minha jornada de compra.

---

**Cenário 5.1: Exibir 2 a 3 produtos destacados por universo**
```gherkin
DADO que o universo "gaming" possui 3 produtos com isFeatured=true publicados e vinculados
QUANDO um visitante acessar a homepage "/"
ENTÃO a subseção [data-testid="destaques-gaming"] dentro de [data-testid="destaques-section"] deve exibir exatamente 3 cards
E cada card deve ter [data-testid="produto-card-{productId}"]
E cada card deve conter: imagem principal, nome do produto, preço base e botão "Personalizar"
```

**Cenário 5.2: Universo com apenas 1 produto em destaque exibe apenas esse produto**
```gherkin
DADO que o universo "anime-nerd" possui apenas 1 produto com isFeatured=true publicado e vinculado
QUANDO um visitante acessar a homepage "/"
ENTÃO a subseção [data-testid="destaques-anime-nerd"] deve exibir apenas 1 card
```

**Cenário 5.3: Universo sem produto em destaque não exibe subseção**
```gherkin
DADO que o universo "presentes" não possui nenhum produto com isFeatured=true vinculado
QUANDO um visitante acessar a homepage "/"
ENTÃO o elemento [data-testid="destaques-presentes"] NÃO deve ser renderizado no DOM
```

**Cenário 5.4: Botão "Personalizar" redireciona para PDP**
```gherkin
DADO que o visitante visualiza um card de produto em destaque na seção [data-testid="destaques-section"]
QUANDO clicar no botão [data-testid="btn-personalizar-{productId}"]
ENTÃO deve ser redirecionado para "/produtos/{slug}"
E a PDP do produto deve ser carregada com o formulário de personalização visível
```

**Cenário 5.5: Preço exibido é o preço base (sem personalização)**
```gherkin
DADO que um produto tem basePrice = 89.90 e variantes com price_delta positivo
QUANDO o card desse produto for exibido em [data-testid="destaques-section"]
ENTÃO o elemento [data-testid="produto-preco-{productId}"] deve exibir "R$ 89,90"
E deve conter o prefixo "A partir de" antes do valor
```

---

### Feature 6: LP — CTA WhatsApp

**História:** Como visitante que não encontrou o produto que imagina, quero um caminho fácil para falar diretamente com a loja pelo WhatsApp, para tirar dúvidas e fazer um pedido totalmente personalizado.

---

**Cenário 6.1: Botão WhatsApp exibido quando número está configurado**
```gherkin
DADO que StoreSettings.whatsappPhone = "5511999998888"
QUANDO um visitante acessar a homepage "/"
ENTÃO o elemento [data-testid="cta-whatsapp-section"] deve ser visível
E o elemento [data-testid="btn-whatsapp"] deve estar presente
E o atributo href de [data-testid="btn-whatsapp"] deve iniciar com "https://wa.me/5511999998888"
```

**Cenário 6.2: Botão WhatsApp NÃO renderizado quando número não está configurado**
```gherkin
DADO que StoreSettings.whatsappPhone = "" (string vazia)
QUANDO um visitante acessar a homepage "/"
ENTÃO o elemento [data-testid="cta-whatsapp-section"] NÃO deve ser renderizado no DOM
```

**Cenário 6.3: Mensagem pré-preenchida na LP principal**
```gherkin
DADO que StoreSettings.whatsappPhone = "5511999998888"
E o visitante está na homepage "/"
QUANDO inspecionar o href de [data-testid="btn-whatsapp"]
ENTÃO o parâmetro "text" da URL deve conter a mensagem pré-definida da LP
E a mensagem deve incluir texto referente a "produto personalizado" ou "criação única"
E a mensagem deve estar encodada como URL (sem caracteres inválidos)
```

**Cenário 6.4: Link abre em nova aba**
```gherkin
DADO que StoreSettings.whatsappPhone está configurado
QUANDO inspecionar o elemento [data-testid="btn-whatsapp"]
ENTÃO o atributo target deve ser "_blank"
E o atributo rel deve conter "noopener noreferrer"
```

---

### Feature 7: Páginas de Universo

**História:** Como visitante que clicou em um Universo, quero ver uma página dedicada com identidade visual do meu segmento e os produtos filtrados para ele, para sentir que o site foi feito para mim.

---

**Cenário 7.1: Rota de universo válido carrega página**
```gherkin
DADO que o universo "gaming" existe e possui produtos publicados
QUANDO um visitante acessar "/universo/gaming"
ENTÃO a página deve retornar HTTP 200
E o elemento [data-testid="universo-page-gaming"] deve ser renderizado
E o elemento [data-testid="universo-header"] deve exibir o nome "Gaming"
```

**Cenário 7.2: Slug inválido retorna 404**
```gherkin
DADO que não existe universo com slug "futebol"
QUANDO um visitante acessar "/universo/futebol"
ENTÃO a resposta deve ser HTTP 404
E a página de erro 404 customizada deve ser exibida
```

**Cenário 7.3: Página lista apenas produtos vinculados ao universo**
```gherkin
DADO que existem 8 produtos publicados, dos quais 5 estão vinculados ao universo "anime-nerd"
QUANDO um visitante acessar "/universo/anime-nerd"
ENTÃO o grid de produtos [data-testid="universo-produtos-grid"] deve exibir exatamente 5 cards
E nenhum dos 3 produtos não vinculados deve aparecer na listagem
```

**Cenário 7.4: Produto vinculado a múltiplos universos aparece em ambos**
```gherkin
DADO que o produto "Suporte de Headset Neon" está vinculado aos universos "gaming" E "casa-decor"
QUANDO um visitante acessar "/universo/gaming"
ENTÃO [data-testid="universo-produtos-grid"] deve conter o card desse produto
QUANDO um visitante acessar "/universo/casa-decor"
ENTÃO [data-testid="universo-produtos-grid"] deve conter o mesmo card desse produto
```

**Cenário 7.5: CTA de personalização em destaque na página do universo**
```gherkin
DADO que o visitante está em "/universo/gaming"
QUANDO a página for renderizada
ENTÃO o elemento [data-testid="universo-cta-personalizar"] deve estar visível acima da dobra ou imediatamente após o hero
E deve conter texto referente a "Personalize" ou "Crie o seu"
```

**Cenário 7.6: CTA WhatsApp na página do universo usa mensagem específica**
```gherkin
DADO que StoreSettings.whatsappPhone = "5511999998888"
E o visitante está em "/universo/presentes"
QUANDO inspecionar o href de [data-testid="btn-whatsapp"]
ENTÃO o parâmetro "text" deve mencionar o universo "Presentes"
E a mensagem deve ser diferente da mensagem padrão da LP principal
```

**Cenário 7.7: Universo sem produtos exibe estado vazio**
```gherkin
DADO que o universo "auto" existe mas não possui produtos publicados vinculados
QUANDO um visitante acessar "/universo/auto"
ENTÃO a página deve retornar HTTP 200
E o elemento [data-testid="universo-empty-state"] deve ser exibido
E deve conter botão [data-testid="btn-whatsapp-universo"] com CTA de contato
E o grid de produtos NÃO deve ser renderizado
```

---

### Feature 8: Sistema de Tema Visual

**História:** Como visitante de um universo, quero que a experiência visual da página corresponda ao estilo do meu segmento (cores, tipografia, tom), para sentir que o site foi desenhado para pessoas como eu.

---

**Cenário 8.1: Página do universo Gaming aplica tema dark/neon**
```gherkin
DADO que o visitante acessa "/universo/gaming"
QUANDO o componente UniverseThemeProvider for montado
ENTÃO a propriedade CSS "--color-primary" no escopo da página deve ser "#00ff41" (ou equivalente neon)
E a propriedade "--color-bg" deve ser "#0a0a0a" (ou dark equivalente)
E o heading principal deve usar a fonte "Orbitron" ou fonte tech configurada para gaming
```

**Cenário 8.2: Página do universo Casa & Decor aplica tema clean/warm**
```gherkin
DADO que o visitante acessa "/universo/casa-decor"
QUANDO o componente UniverseThemeProvider for montado
ENTÃO a propriedade CSS "--color-bg" no escopo da página deve ser uma cor clara/quente
E o heading principal deve usar fonte serif (ex: Playfair Display)
E o tema não deve ter elementos neon ou cores saturadas
```

**Cenário 8.3: Checkout e carrinho NÃO herdam variáveis de tema do universo**
```gherkin
DADO que o visitante navegou por "/universo/gaming" e adicionou um produto ao carrinho
QUANDO acessar "/carrinho" ou "/checkout"
ENTÃO os componentes de carrinho e checkout devem usar os design tokens base (não as CSS vars do tema gaming)
E o contraste WCAG AA deve ser mantido (≥ 4.5:1 para texto normal)
```

**Cenário 8.4: Troca de universo atualiza tema sem recarregar a página inteira**
```gherkin
DADO que o visitante está em "/universo/gaming"
QUANDO clicar em um link para "/universo/presentes" (ex: via navegação)
ENTÃO o tema visual deve transicionar para o tema do universo "presentes"
E a URL deve ser "/universo/presentes"
E nenhum recarregamento completo da página deve ocorrer (SPA navigation via Next.js Router)
```

**Cenário 8.5: UniverseThemeProvider não afeta o layout raiz da LP**
```gherkin
DADO que o visitante acessa a homepage "/"
QUANDO o layout principal for renderizado
ENTÃO as CSS vars do tema base (core/neutral) devem estar ativas
E os elementos de nav, rodapé e checkout devem usar o tema base, independente de preferência salva
```

**Cenário 8.6: Cada tema passa na verificação de acessibilidade mínima**
```gherkin
DADO que qualquer página de universo está renderizada
QUANDO executar auditoria de contraste nos elementos de texto principal
ENTÃO a relação de contraste entre texto e fundo deve ser ≥ 4.5:1 (WCAG AA nível AA)
E tamanho de fonte mínimo de corpo: 16px
E todos os botões devem ter estado de foco visível
```

---

### Feature 9: Persistência de Preferência de Universo

**História:** Como visitante recorrente, quero que o site lembre meu universo preferido sem precisar logar, e como cliente logado quero que minha preferência seja salva no meu perfil.

---

**Cenário 9.1: Guest — preferência salva em cookie ao visitar página de universo**
```gherkin
DADO que o visitante NÃO está logado
QUANDO acessar "/universo/gaming"
ENTÃO o cookie "universe_pref" deve ser criado com valor "gaming"
E o cookie deve ter max-age equivalente a 30 dias
E o cookie deve ter atributo SameSite=Lax e Secure em produção
```

**Cenário 9.2: Guest — preferência anterior substituída ao visitar outro universo**
```gherkin
DADO que o visitante possui cookie "universe_pref" = "gaming"
QUANDO acessar "/universo/presentes"
ENTÃO o cookie "universe_pref" deve ser atualizado para "presentes"
E o TTL deve ser renovado por mais 30 dias
```

**Cenário 9.3: Logado — preferência salva no banco ao visitar página de universo**
```gherkin
DADO que o visitante está logado com userId = "user-123"
QUANDO acessar "/universo/anime-nerd"
ENTÃO o campo "preferredCollection" do User "user-123" deve ser atualizado para "anime-nerd" no banco
E a operação deve ocorrer de forma assíncrona (sem bloquear carregamento da página)
E não deve haver mensagem de confirmação visível para o usuário (ação silenciosa)
```

**Cenário 9.4: Preferência do perfil tem prioridade sobre cookie**
```gherkin
DADO que o visitante possui cookie "universe_pref" = "gaming"
E está logado com preferredCollection = "presentes" no perfil
QUANDO acessar a homepage "/"
ENTÃO o primeiro card em [data-testid="universos-section"] deve ser [data-testid="universo-card-presentes"]
E a preferência de "gaming" do cookie deve ser ignorada para a ordenação
```

**Cenário 9.5: Usuário logado sem preferência — sem ordenação especial**
```gherkin
DADO que o visitante está logado
E o campo preferredCollection no User é null
E não há cookie "universe_pref"
QUANDO acessar a homepage "/"
ENTÃO os cards de universo devem aparecer na ordem padrão configurada
E nenhum universo deve receber destaque especial
```

**Cenário 9.6: Preferência não é obrigatória — usuário pode ignorar**
```gherkin
DADO que o visitante NÃO possui preferência de universo (cookie ou perfil)
QUANDO navegar diretamente para "/produtos" ou para o catálogo geral
ENTÃO a listagem deve exibir todos os produtos publicados sem filtro de universo
E nenhum prompt ou modal forçando escolha de universo deve ser exibido
```

---

### Feature 10: SEO e Metadados por Universo

**História:** Como responsável pelo crescimento da loja, quero que cada página de universo tenha metadados SEO específicos, para que buscas segmentadas (ex: "presente personalizado 3D") encontrem a página certa.

---

**Cenário 10.1: LP principal tem metadata premium**
```gherkin
DADO que um crawler ou usuário acessa "/"
QUANDO os metadados da página forem inspecionados
ENTÃO o `<title>` deve ser diferente do padrão genérico e conter proposta de valor
E o `<meta name="description">` deve mencionar personalização 3D
E o `<meta property="og:image">` deve apontar para imagem específica da loja (não placeholder)
E o `<meta property="og:title">` deve coincidir com o `<title>` da página
```

**Cenário 10.2: Página de universo tem title específico**
```gherkin
DADO que um visitante acessa "/universo/gaming"
QUANDO os metadados da página forem inspecionados
ENTÃO o `<title>` deve conter o nome do universo (ex: "Gaming" ou "Gamer")
E deve ser diferente do title da LP principal
E deve conter termo relacionado a personalização ou impressão 3D
```

**Cenário 10.3: Cada universo tem og:image diferente**
```gherkin
DADO que cada universo tem uma imagem de OpenGraph configurada
QUANDO comparar o valor de `<meta property="og:image">` entre "/universo/gaming" e "/universo/anime-nerd"
ENTÃO os valores devem ser diferentes entre si
E ambos devem ser diferentes do og:image da LP principal
```

**Cenário 10.4: Metadados de universo inexistente retornam 404 sem expor erro**
```gherkin
DADO que o slug "futebol" não é um universo válido
QUANDO um crawler acessar "/universo/futebol"
ENTÃO a resposta deve ser HTTP 404
E a página de erro não deve expor stack trace ou mensagem de sistema
E o `<meta name="robots">` deve conter "noindex" na página 404
```

**Cenário 10.5: canonical correto para evitar duplicate content**
```gherkin
DADO que a página "/universo/gaming" pode ser acessada de diferentes formas
QUANDO os metadados forem inspecionados
ENTÃO o elemento `<link rel="canonical">` deve apontar para "https://[domínio]/universo/gaming"
E não deve haver trailing slash divergente ou variação de capitalização
```

---

## Decisões de Arquitetura em Aberto (para o Dev resolver na FASE 1)

| # | Decisão | Contexto | Opções | Recomendação |
|---|---------|----------|--------|--------------|
| DA-01 | Como modelar vínculo produto ↔ universo no Prisma | O model `Product` tem `collectionId` (FK singular). Múltiplos universos por produto exigem N:M | (A) Array JSON `universes String[]` na tabela Product — simples, sem migração complexa. (B) Tabela `_ProductUniverse` (M:M explícita) — relacional, filtrável. | Recomendado: (B) M:M para permitir queries eficientes `WHERE universe = ?` sem JSON parse |
| DA-02 | Onde armazenar configuração dos universos (nome, tagline, og:image, comingSoon, ordem) | Universos são semi-estáticos mas precisam de gestão | (A) Arquivo `config/universes.ts` — zero DB, deploy-time. (B) Tabela `Universe` no banco — admin pode editar sem redeploy. | Recomendado: (A) para M05 (agilidade); migrar para (B) em M06 se admin precisar editar |
| DA-03 | Mecanismo de injeção de CSS vars por universo | UniverseThemeProvider precisa aplicar tema sem vazar para componentes globais | (A) CSS Modules com seletor `.universe-gaming { --color-primary: ... }` na page. (B) CSS-in-JS via `style` tag inline no elemento raiz. (C) Tailwind CSS vars via className no body/root do page.tsx | Recomendado: (A) — alinhado com App Router, sem runtime overhead |
| DA-04 | Carregamento de fontes por universo | Cada universo usa fontes diferentes — carregar todas simultaneamente é custoso | (A) `next/font` com cada fonte pré-carregada globalmente. (B) `next/font` carregado apenas no page.tsx de cada universo (lazy per-route). | Recomendado: (B) — Next.js 15 App Router suporta fontes por segment |
| DA-05 | Persistência de preferência de universo (guest) | Server Action ou API Route para set do cookie? | (A) Server Action no page.tsx do universo — simple, sem API adicional. (B) API Route `PATCH /api/user/preference` — reutilizável para guest e logado. | Recomendado: (B) — unifica lógica guest/logado, testável isoladamente |
| DA-06 | Estratégia de revalidação dos dados da LP | LP consome: destaques, depoimentos, configuração de universos — dados semi-estáticos | (A) `revalidate = 60` (ISR a cada 60s). (B) `revalidate = 3600` (ISR hourly). (C) On-demand revalidation via webhook quando produto é editado. | Recomendado: (B) para MVP, migrar para (C) quando admin precisar de propagação imediata |
| DA-07 | Modelo de dados para depoimentos (Prova Social) | Não existe model `Testimonial` no schema atual | Criar model `Testimonial` com: id, authorName, authorPhoto, productPhoto, text, universeSlug?, isPublished, createdAt | Criar tabela no Prisma; admin CRUD em M05 ou M06? Esclarecer escopo. |
| DA-08 | Admin para gerenciar conteúdo da LP | Depoimentos, ordem de universos, og:images precisam de algum management | (A) Via código (arquivos estáticos) — zero admin UI. (B) Admin panel básico em M05. (C) Headless CMS (Sanity, Contentful) — M06+. | Recomendado: (A) para depoimentos mock em M05, UI básica em M06 |
| DA-09 | Comportamento do cookie `universe_pref` em SSR | Server Component precisa ler o cookie para ordenar universos sem hydration flash | Usar `cookies()` do Next.js nos Server Components da homepage; seeding do estado no client via `initialData` | Confirmar que não há flickering (FOUC) na ordenação dos cards |
| DA-10 | Tratamento de imagens dos universos | Hero images, og:images e card images por universo precisam ser servidas com performance | Usar Vercel Blob ou `/public/universes/{slug}/` para assets estáticos; `next/image` com `priority` para hero e first cards | Definir convenção de nomenclatura de assets por universo |

---

## Cobertura Mínima de `data-testid`

| Elemento | data-testid | Feature |
|----------|-------------|---------|
| Seção Hero | `hero-section` | F1 |
| Headline principal | `hero-headline` | F1 |
| Imagem de fundo hero | `hero-bg-image` | F1 |
| CTA "Descubra seu Universo" | `hero-cta-universos` | F1 |
| Seção Universos | `universos-section` | F2 |
| Card de universo | `universo-card-{slug}` | F2 |
| Badge "Em breve" | `universo-badge-coming-soon` | F2 |
| Dots do carousel (mobile) | `universos-carousel-dots` | F2 |
| Seção Como Funciona | `como-funciona-section` | F3 |
| Passo individual | `passo-{n}` (1, 2, 3) | F3 |
| Seção Prova Social | `prova-social-section` | F4 |
| Card de depoimento | `depoimento-card` | F4 |
| Placeholder foto produto | `depoimento-produto-placeholder` | F4 |
| Filtro de depoimento | `depoimento-filtro-{slug}` | F4 |
| Seção Destaques | `destaques-section` | F5 |
| Subseção por universo | `destaques-{slug}` | F5 |
| Card de produto | `produto-card-{productId}` | F5 |
| Preço do produto | `produto-preco-{productId}` | F5 |
| Botão Personalizar | `btn-personalizar-{productId}` | F5 |
| Seção CTA WhatsApp | `cta-whatsapp-section` | F6 |
| Botão WhatsApp | `btn-whatsapp` | F6 |
| Página do universo | `universo-page-{slug}` | F7 |
| Header do universo | `universo-header` | F7 |
| Grid de produtos do universo | `universo-produtos-grid` | F7 |
| CTA personalizar no universo | `universo-cta-personalizar` | F7 |
| Estado vazio do universo | `universo-empty-state` | F7 |
| WhatsApp no universo | `btn-whatsapp-universo` | F7 |

---

## Escopo NÃO incluído em M05 (Backlog M06+)

- Conteúdo dinâmico por comportamento de navegação (ex: "você visitou Gaming, veja esses produtos")
- Recomendação de universo por ML ou perfil de compra
- A/B test de headlines ou CTAs
- Conteúdo editorial por universo (blog, lookbook, tutoriais)
- Admin UI para gerenciar depoimentos (M06)
- Admin UI para editar configuração de universos sem redeploy (M06)
- Universo "Auto" com conteúdo completo (depende de catálogo — liberado quando produtos forem cadastrados)
- Internacionalização (pt-BR only)

---

> **Próximo passo após G0:** Acionar Dev (FASE 1 — Derivation) para derivar arquitetura técnica a partir desta spec.
