# Especificação Formal — M02: Catálogo + Experience

> **Formato:** Gherkin (DADO/QUANDO/ENTÃO)
> **Status:** 🚧 G0 PENDENTE (aguardando Product Owner)
> **Derivado de:** `PRD/02-escopo-funcional.md` (módulos 1-5), `PRD/06-temas-experiencia.md`
> **Épicos:** B (Experience) + C (Commerce — Produto)

---

## REQUISITOS TRANSVERSAIS (APLICAM-SE A TODAS AS FEATURES)

### Visual & Experiência

- **RN-V01:** Zero emojis em toda a interface. Substituir por ícones profissionais (Lucide React)
- **RN-V02:** Animações de entrada com Framer Motion (fade, slide, scale) em cards, seções e páginas
- **RN-V03:** Efeitos hover em todos elementos interativos (cards, botões, links) — scale, shadow, glow
- **RN-V04:** Animações de scroll (reveal on scroll) para seções da landing page
- **RN-V05:** Transições suaves entre páginas (page transitions)
- **RN-V06:** Estética moderna, clean, tecnológica — paleta com tons de azul, cinza, branco com gradientes sutis
- **RN-V07:** Landing page mais impactante: hero com parallax, seções com stagger animation, cards com hover 3D

---

## FEATURE 1: Correção Visual — Remover Emojis (Fura-fila M01)

**Como** visitante
**Quero** uma interface profissional com ícones reais, não emojis
**Para** transmitir qualidade, modernidade e confiança na marca

### Cenários

**Cenário 1.1: Home page sem emojis**
```gherkin
DADO que o visitante acessa a home page
QUANDO qualquer elemento for renderizado
ENTÃO nenhum emoji Unicode (U+1F300–U+1F9FF) deve estar presente no HTML
E ícones devem ser do pacote Lucide React
E cada ícone deve ter tamanho e cor consistentes com o design system
```

**Cenário 1.2: Coleções com ícones profissionais**
```gherkin
DADO que a seção de coleções é renderizada
QUANDO os cards de coleção forem exibidos
ENTÃO cada card deve ter um ícone SVG do Lucide representativo da coleção
E o ícone deve animar ao passar o mouse (scale 1.1 + cor primária)
```

**Cenário 1.3: Header e Footer sem emojis**
```gherkin
DADO que o visitante navega por qualquer página
QUANDO header e footer forem renderizados
ENTÃO ícones de busca, carrinho, tema e redes sociais devem ser Lucide Icons
E o toggle de tema deve mostrar ícone Sun/Moon do Lucide
```

---

## FEATURE 2: Animações e Efeitos Visuais

**Como** visitante
**Quero** uma experiência visual rica com animações fluidas e efeitos interativos
**Para** sentir que estou em um site moderno e tecnológico

### Cenários

**Cenário 2.1: Animação de entrada nos cards de produto**
```gherkin
DADO que o visitante carrega uma página com grid de produtos
QUANDO os cards entrarem na viewport
ENTÃO cada card deve animar com fade + slide up (Framer Motion)
E os cards devem aparecer em stagger (50ms de atraso entre cada)
```

**Cenário 2.2: Efeito hover nos cards de produto**
```gherkin
DADO que o visitante passa o mouse sobre um card de produto
QUANDO o hover for detectado
ENTÃO o card deve escalar levemente (scale 1.03)
E deve aparecer uma sombra sutil (shadow-lg)
E a imagem deve ter um efeito de brilho (brightness 1.05)
E a transição deve durar 200ms com ease-out
```

**Cenário 2.3: Animação de scroll na landing page**
```gherkin
DADO que o visitante faz scroll na home page
QUANDO cada seção entrar na viewport
ENTÃO a seção deve revelar com animação (fade up ou slide)
E a hero section deve ter efeito parallax sutil (background move slower)
```

**Cenário 2.4: Transição entre páginas**
```gherkin
DADO que o visitante navega de uma página para outra
QUANDO a navegação ocorrer
ENTÃO a nova página deve entrar com fade in
E o conteúdo anterior deve sair sem flicker
```

**Cenário 2.5: Efeito hover nos botões**
```gherkin
DADO que o visitante interage com botões de ação
QUANDO o hover for detectado
ENTÃO o botão deve ter transição suave de cor (200ms)
E um leve scale (1.02)
```

---

## FEATURE 3: Landing Page Aprimorada

**Como** visitante vindo do Instagram
**Quero** uma landing page impactante e visualmente rica
**Para** ser impressionado nos primeiros segundos e confiar na marca

### Cenários

**Cenário 3.1: Hero section com parallax**
```gherkin
DADO que o visitante acessa a home page
QUANDO a hero section for renderizada
ENTÃO deve ter um background com gradiente ou imagem sutil
E o texto deve ter animação de entrada (fade up + slide)
E o scroll deve revelar um efeito parallax (background move 50% slower)
E o título deve usar tipografia bold com tracking ajustado
```

**Cenário 3.2: Seção de coleções com stagger animation**
```gherkin
DADO que o visitante faz scroll até a seção de coleções
QUANDO os cards entrarem na viewport
ENTÃO cada card deve aparecer com stagger (100ms entre eles)
E cada card deve ter ícone SVG grande e centralizado
E hover deve mostrar borda colorida com transição suave
```

**Cenário 3.3: Seção "Como Funciona" com ícones e linha do tempo**
```gherkin
DADO que o visitante faz scroll até "Como Funciona"
QUANDO a seção for renderizada
ENTÃO cada passo deve ter ícone circular com número
E uma linha conectora entre os passos (desktop)
E os ícones devem colorir sequencialmente ao entrar na viewport
```

**Cenário 3.4: Seção de produtos em destaque com cards 3D**
```gherkin
DADO que o visitante visualiza os produtos em destaque
QUANDO o mouse passar sobre um card
ENTÃO o card deve inclinar sutilmente (transform: rotateY 2deg)
E a imagem deve ter efeito de brilho
E o preço deve destacar em negrito com cor primária
```

---

## FEATURE 4: Catálogo de Produtos

**Como** visitante
**Quero** navegar por uma lista de produtos com filtros e busca
**Para** encontrar rapidamente o que desejo comprar

### Cenários

**Cenário 4.1: Grid de produtos responsivo**
```gherkin
DADO que o visitante acessa a página de produtos
QUANDO a página for carregada
ENTÃO deve exibir um grid de cards de produto
E o grid deve ter 1 coluna em mobile (375px)
E o grid deve ter 2 colunas em tablet (768px)
E o grid deve ter 3 ou 4 colunas em desktop (1280px)
E cada card deve conter: imagem, nome, preço base, categoria
```

**Cenário 4.2: Card de produto com informações completas**
```gherkin
DADO que um card de produto é renderizado
QUANDO o card for inspecionado
ENTÃO deve exibir imagem principal do produto
E deve exibir nome do produto
E deve exibir preço formatado em BRL
E deve exibir badge da categoria
E deve exibir selo "Personalizável" se aplicável
E deve ter link para a página de detalhe
```

**Cenário 4.3: Filtro por categoria**
```gherkin
DADO que o visitante está na página de produtos
QUANDO selecionar uma categoria no filtro lateral
ENTÃO apenas produtos daquela categoria devem ser exibidos
E a URL deve refletir o filtro (?categoria=gamer)
E o filtro ativo deve estar destacado visualmente
```

**Cenário 4.4: Filtro por faixa de preço**
```gherkin
DADO que o visitante está na página de produtos
QUANDO ajustar o filtro de preço (min — max)
ENTÃO apenas produtos naquela faixa devem ser exibidos
E o grid deve atualizar sem recarregar a página
```

**Cenário 4.5: Ordenação de produtos**
```gherkin
DADO que o visitante quer ordenar os produtos
QUANDO selecionar uma opção de ordenação (preço, nome, destaque)
ENTÃO os produtos devem reordenar conforme a seleção
E a ordenação padrão deve ser por destaque
```

**Cenário 4.6: Busca textual**
```gherkin
DADO que o visitante digita na barra de busca
QUANDO o termo tiver 3 ou mais caracteres
ENTÃO os produtos devem filtrar em tempo real
E produtos cujo nome ou descrição contenham o termo devem aparecer
E o grid deve mostrar "Nenhum produto encontrado" se não houver resultados
```

**Cenário 4.7: Estado vazio — sem produtos**
```gherkin
DADO que uma busca ou filtro não retorna resultados
QUANDO o grid for renderizado
ENTÃO deve exibir mensagem "Nenhum produto encontrado"
E deve sugerir limpar os filtros
E deve ter um ícone ilustrativo (Lucide SearchX)
```

**Cenário 4.8: Loading state do grid**
```gherkin
DADO que os produtos estão carregando
QUANDO a página for acessada
ENTÃO deve exibir 8 cards skeleton (placeholder pulsando)
E os skeletons devem ter o mesmo tamanho dos cards reais
```

---

## FEATURE 5: Página de Detalhe do Produto (PDP)

**Como** visitante
**Quero** ver informações detalhadas de um produto com galeria de imagens
**Para** decidir se compro e entender as opções de personalização

### Cenários

**Cenário 5.1: Página de detalhe com URL própria**
```gherkin
DADO que o visitante clica em um produto
QUANDO a navegação ocorrer
ENTÃO deve ser redirecionado para /produtos/[slug]
E a URL deve ser amigável (slug do produto)
E o título da página deve conter o nome do produto
```

**Cenário 5.2: Galeria de imagens**
```gherkin
DADO que o visitante está na PDP
QUANDO a página for carregada
ENTÃO deve exibir uma galeria com as imagens do produto
E a imagem principal deve ser grande e centralizada
E thumbnails abaixo devem permitir selecionar a imagem principal
E ao clicar na imagem, deve abrir lightbox com zoom
```

**Cenário 5.3: Informações do produto**
```gherkin
DADO que o visitante está na PDP
QUANDO a página for carregada
ENTÃO deve exibir: nome, preço base, descrição curta
E deve exibir: material, tempo estimado de produção
E deve exibir: nível de personalização disponível
E deve ter botão "Adicionar ao Carrinho" (visual no M02, funcional no M03)
```

**Cenário 5.4: Badge de personalização**
```gherkin
DADO que o produto aceita personalização
QUANDO a PDP for renderizada
ENTÃO deve exibir badge "✨ Personalizável" próximo ao preço
E deve listar as opções disponíveis (cor, tamanho, texto)
```

**Cenário 5.5: SEO da PDP**
```gherkin
DADO que a PDP é renderizada no servidor
QUANDO o HTML for inspecionado
ENTÃO deve ter meta title com nome do produto
E deve ter meta description com a descrição curta
E deve ter Open Graph tags com a imagem principal do produto
E deve ter structured data (JSON-LD Product)
```

**Cenário 5.6: Navegação relacionada**
```gherkin
DADO que o visitante está na PDP
QUANDO a página for carregada
ENTÃO deve exibir seção "Produtos Relacionados" abaixo
E os produtos relacionados devem ser da mesma categoria
E deve ter breadcrumb: Home > Coleção > Produto
```

---

## FEATURE 6: Coleções Dinâmicas

**Como** visitante
**Quero** acessar páginas de coleção com identidade visual própria
**Para** explorar produtos dentro do meu universo de interesse

### Cenários

**Cenário 6.1: Página de coleção com produtos**
```gherkin
DADO que o visitante acessa /colecoes/[slug]
QUANDO a página for carregada
ENTÃO deve exibir o nome e descrição da coleção
E deve exibir grid de produtos daquela coleção
E o título da página deve ser o nome da coleção
```

**Cenário 6.2: Coleção vazia**
```gherkin
DADO que uma coleção não tem produtos cadastrados
QUANDO a página for acessada
ENTÃO deve exibir mensagem "Em breve — produtos chegando"
E deve ter um ícone ilustrativo grande
```

**Cenário 6.3: Header visual da coleção**
```gherkin
DADO que o visitante está na página de coleção
QUANDO a página for carregada
ENTÃO deve ter um banner/header com fundo temático (gradiente ou cor)
E o título da coleção deve estar em destaque
E deve ter uma breve descrição do universo
```

---

## FEATURE 7: Seed de Dados

**Como** desenvolvedor
**Quero** dados de exemplo para popular o catálogo
**Para** testar e demonstrar as funcionalidades

### Cenários

**Cenário 7.1: Seed de categorias**
```gherkin
DADO que o banco de dados está vazio
QUANDO o script de seed for executado
ENTÃO devem ser criadas 5 categorias: Gamer, Anime, Casa, Presentes, Auto
E cada categoria deve ter slug, nome e descrição
```

**Cenário 7.2: Seed de produtos**
```gherkin
DADO que as categorias existem
QUANDO o script de seed for executado
ENTÃO devem ser criados pelo menos 8 produtos
E cada produto deve ter: nome, slug, descrição, preço, categoria, imagens placeholder
E pelo menos 4 produtos devem ter is_customizable = true
E os produtos devem ser distribuídos entre as 5 categorias
```

**Cenário 7.3: Imagens placeholder profissionais**
```gherkin
DADO que os produtos são criados pelo seed
QUANDO as imagens forem inspecionadas
ENTÃO devem usar placeholder visual profissional (via unsplash ou similar)
E não devem usar emojis ou imagens genéricas de baixa qualidade
```

---

## REGRAS DE NEGÓCIO

| ID | Regra |
|----|-------|
| RN-01 | Produtos são majoritariamente sob demanda |
| RN-V01 | Zero emojis em todo o site |
| RN-V02 | Animações com Framer Motion em cards, seções, páginas |
| RN-V03 | Efeitos hover em todos elementos interativos |
| RN-V04 | Scroll reveal nas seções da landing page |
| RN-V05 | Page transitions suaves |
| RN-V06 | Estética moderna, clean, tecnológica |
| RN-10 | Cada produto tem nível de personalização definido |

---

## RASTREABILIDADE

| Feature | Origem (PRD) | Cenários Gherkin |
|---------|-------------|:---:|
| F1: Remover Emojis | Fura-fila M01 | 3 |
| F2: Animações & Efeitos | RN-V01 a V07 | 5 |
| F3: LP Aprimorada | Módulo 1 (PRD) | 4 |
| F4: Catálogo | Módulo 3 (PRD) | 8 |
| F5: PDP | Módulo 4 (PRD) | 6 |
| F6: Coleções Dinâmicas | Módulo 2 (PRD) | 3 |
| F7: Seed de Dados | Infraestrutura | 3 |
| **Total** | **7 features** | **32 cenários** |

---

## STATUS DOS GATES

| Gate | Status | Data | Aprovado por |
|------|--------|------|-------------|
| 🚧 G0 | PENDENTE | - | 👑 Product Owner |
| 🚧 G1 | BLOQUEADO | - | - |
| 🚧 G2 | BLOQUEADO | - | - |
| 🚧 G3 | BLOQUEADO | - | - |
| 🚧 G4 | BLOQUEADO | - | - |
| 🚧 G5 | BLOQUEADO | - | - |
| 🚧 G6 | BLOQUEADO | - | - |
