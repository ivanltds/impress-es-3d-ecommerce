# Especificação Formal — M01: Fundação do Projeto

> **Formato:** Gherkin (Given/When/Then)
> **Status:** 🚧 G0 PENDENTE (aguardando aprovação do Product Owner)
> **Derivado de:** `PRD/milestones/M01-fundacao.md`
> **Responsável:** Business Analyst

---

## FEATURE 1: Setup do Projeto Next.js

**Como** desenvolvedor
**Quero** um projeto Next.js configurado com TypeScript, Tailwind e ferramentas de qualidade
**Para** ter uma base sólida e padronizada para o desenvolvimento

### Cenários

**Cenário 1.1: Criação do projeto com template padrão**
```gherkin
DADO que o comando de criação do projeto é executado
QUANDO a instalação for concluída
ENTÃO deve existir um projeto Next.js 14+ com App Router
E deve ter TypeScript configurado em modo strict
E deve ter Tailwind CSS instalado e configurado
E deve ter ESLint configurado
```

**Cenário 1.2: Build limpo**
```gherkin
DADO que o projeto está configurado
QUANDO o comando `npm run build` for executado
ENTÃO a build deve ser concluída com sucesso
E não deve haver erros de TypeScript
E não deve haver warnings de ESLint
```

**Cenário 1.3: Estrutura de pastas padronizada**
```gherkin
DADO que o projeto está criado
QUANDO a estrutura de diretórios for inspecionada
ENTÃO deve existir a pasta `src/app/` para App Router
E deve existir a pasta `src/components/` organizada em `ui/`, `shop/`, `shared/`
E deve existir a pasta `src/lib/` para utilitários
E deve existir a pasta `src/hooks/` para custom hooks
E deve existir a pasta `src/types/` para definições de tipo
E deve existir a pasta `src/actions/` para Server Actions
```

---

## FEATURE 2: Deploy na Vercel

**Como** desenvolvedor
**Quero** o projeto deployado na Vercel com preview automático
**Para** ter um ambiente de staging disponível para review e homologação

### Cenários

**Cenário 2.1: Deploy de produção funcional**
```gherkin
DADO que o projeto está conectado à Vercel
QUANDO um push for feito na branch principal
ENTÃO o deploy de produção deve ser acionado automaticamente
E a URL de produção deve estar acessível publicamente
```

**Cenário 2.2: Deploy preview em pull requests**
```gherkin
DADO que existe um pull request aberto
QUANDO um novo commit for adicionado ao PR
ENTÃO um deploy preview deve ser gerado automaticamente
E a URL do preview deve ser única para aquele PR
```

**Cenário 2.3: Variáveis de ambiente configuradas**
```gherkin
DADO que o projeto está na Vercel
QUANDO as variáveis de ambiente forem verificadas
ENTÃO DATABASE_URL deve estar configurada
E AUTH_SECRET deve estar configurada
E as variáveis de ambiente devem estar documentadas em `.env.example`
```

---

## FEATURE 3: Configuração do Banco de Dados

**Como** desenvolvedor
**Quero** um banco de dados PostgreSQL configurado via Supabase com ORM Prisma
**Para** persistir dados da aplicação de forma estruturada

### Cenários

**Cenário 3.1: Conexão com banco de dados**
```gherkin
DADO que o Supabase está configurado
E as variáveis DATABASE_URL e DIRECT_URL estão definidas
QUANDO o Prisma Client for gerado e uma query simples for executada
ENTÃO a conexão deve ser estabelecida com sucesso
E a query deve retornar resultados sem erros
```

**Cenário 3.2: Schema inicial criado**
```gherkin
DADO que o Prisma está configurado
QUANDO a migration inicial for executada
ENTÃO as tabelas User, Product e Category devem ser criadas no banco
E os relacionamentos devem estar corretos
E os índices devem existir nas colunas únicas (email, slug)
```

---

## FEATURE 4: Tema Visual Base

**Como** visitante da loja
**Quero** ver uma loja com identidade visual profissional e tema responsivo
**Para** confiar na qualidade da plataforma e ter uma boa experiência

### Cenários

**Cenário 4.1: Tema claro/escuro**
```gherkin
DADO que o visitante acessa a loja pela primeira vez
QUANDO a página for carregada
ENTÃO o tema deve seguir a preferência do sistema operacional (claro ou escuro)
E deve existir um toggle para alternar entre temas manualmente
E a alternância deve ser instantânea (sem flicker)
```

**Cenário 4.2: Paleta de cores da marca**
```gherkin
DADO que o tema está aplicado
QUANDO os componentes da loja forem renderizados
ENTÃO deve existir uma cor primária definida e consistente em botões, links e destaques
E deve existir uma cor secundária para elementos de suporte
E as cores devem atender contraste WCAG AA (ratio ≥ 4.5:1 para texto)
```

**Cenário 4.3: shadcn/ui configurado**
```gherkin
DADO que o projeto está configurado
QUANDO os componentes do shadcn/ui forem importados
ENTÃO Button, Card, Input, e Dialog devem estar disponíveis e estilizados com o tema
E novos componentes devem ser adicionáveis via `npx shadcn-ui add`
```

**Cenário 4.4: Tipografia**
```gherkin
DADO que o tema está configurado
QUANDO o conteúdo textual for renderizado
ENTÃO deve haver uma fonte para títulos (headings h1-h6)
E deve haver uma fonte para corpo de texto
E as fontes devem carregar sem bloqueio de renderização (font-display: swap)
```

---

## FEATURE 5: Layout Principal

**Como** visitante
**Quero** navegar pela loja com Header, Footer e navegação consistentes
**Para** encontrar facilmente o que procuro em qualquer página

### Cenários

**Cenário 5.1: Header com navegação**
```gherkin
DADO que o visitante está em qualquer página da loja
QUANDO a página for carregada
ENTÃO o header deve exibir o logo da loja no canto esquerdo
E deve exibir links de navegação (Início, Produtos, Categorias)
E deve exibir um ícone de carrinho no canto direito
E deve exibir um campo de busca (visual, não funcional no M01)
```

**Cenário 5.2: Header responsivo mobile**
```gherkin
DADO que o visitante está em um dispositivo móvel (viewport < 768px)
QUANDO a página for carregada
ENTÃO o menu de navegação deve ser substituído por um menu hamburguer
E o menu hamburguer deve abrir um drawer com os links ao ser clicado
E o logo deve permanecer visível
```

**Cenário 5.3: Footer institucional**
```gherkin
DADO que o visitante está em qualquer página da loja
QUANDO a página for carregada
ENTÃO o footer deve exibir links para Termos de Uso e Política de Privacidade
E deve exibir ícones de redes sociais
E deve exibir um campo de newsletter (visual, não funcional no M01)
E deve exibir o copyright com ano atual
```

**Cenário 5.4: Estados do layout**
```gherkin
DADO que o visitante navega entre páginas
QUANDO uma transição de rota ocorrer
ENTÃO deve haver um indicador de carregamento (loading state) no topo da página
E se ocorrer um erro, deve ser exibida uma mensagem amigável (error state)
```

---

## FEATURE 6: Home Page

**Como** visitante
**Quero** ver uma página inicial atraente com seções de destaque
**Para** conhecer a loja e seus produtos principais rapidamente

### Cenários

**Cenário 6.1: Hero Section**
```gherkin
DADO que o visitante acessa a URL raiz "/"
QUANDO a home page for carregada
ENTÃO deve exibir uma hero section com título principal da loja
E deve ter um subtítulo descritivo
E deve ter um botão de call-to-action (ex: "Ver Produtos")
E a hero section deve ocupar a altura total da viewport no primeiro carregamento (100vh)
```

**Cenário 6.2: Categorias em Destaque**
```gherkin
DADO que o visitante está na home page
QUANDO a seção de categorias for renderizada
ENTÃO deve exibir 3-4 categorias em cards com imagem e nome
E cada card deve ser clicável (link para a categoria, mesmo que destino seja placeholder no M01)
```

**Cenário 6.3: Produtos em Destaque**
```gherkin
DADO que o visitante está na home page
QUANDO a seção de produtos em destaque for renderizada
ENTÃO deve exibir um grid de 4-8 produtos mockados
E cada card de produto deve mostrar: imagem placeholder, nome, preço
E deve ter um botão "Ver detalhes" em cada card
```

**Cenário 6.4: Seção "Como Funciona"**
```gherkin
DADO que o visitante está na home page
QUANDO a seção "Como Funciona" for renderizada
ENTÃO deve explicar o processo de impressão 3D em 3-4 passos ilustrados
E cada passo deve ter ícone, título e breve descrição
```

**Cenário 6.5: SEO**
```gherkin
DADO que a home page está renderizada
QUANDO o HTML for inspecionado
ENTÃO deve ter tag `<title>` com nome da loja
E deve ter meta description relevante
E deve ter meta viewport para responsividade
E deve ter Open Graph tags (og:title, og:description, og:image)
```

**Cenário 6.6: Responsividade da Home Page**
```gherkin
DADO que o visitante está na home page
QUANDO a viewport for alterada para mobile (375px), tablet (768px) e desktop (1280px)
ENTÃO todas as seções devem se reorganizar adequadamente
E o grid de produtos deve ajustar colunas (1 col mobile, 2 cols tablet, 4 cols desktop)
E os cards de categoria devem ajustar colunas proporcionalmente
E nenhum conteúdo deve ser cortado ou inacessível
```

---

## REGRAS DE NEGÓCIO

| ID | Regra | Aplica-se a |
|----|-------|------------|
| RN-M01-01 | A aplicação deve estar em português (Brasil) como idioma padrão | Todo o conteúdo textual |
| RN-M01-02 | Toda página deve ter meta tags para SEO (title, description, og) | Todas as páginas |
| RN-M01-03 | O layout deve funcionar em viewports de 320px a 2560px | Todas as páginas e componentes |
| RN-M01-04 | Lighthouse: Performance ≥ 90, Accessibility ≥ 90, Best Practices ≥ 90, SEO ≥ 90 | Home page |

---

## RASTREABILIDADE

| Feature | Histórias de Origem (PRD) | Cenários Gherkin | GATE |
|---------|--------------------------|------------------|------|
| F1: Setup Next.js | US-M01-01 | 3 | G0 |
| F2: Deploy Vercel | US-M01-02 | 3 | G0 |
| F3: Banco de Dados | US-M01-03 | 2 | G0 |
| F4: Tema Visual | US-M01-04 | 4 | G0 |
| F5: Layout Principal | US-M01-05 | 4 | G0 |
| F6: Home Page | US-M01-06 | 6 | G0 |
| **Total** | **6 features** | **22 cenários** | |

---

## STATUS DOS GATES

| Gate | Status | Data | Aprovado por |
|------|--------|------|-------------|
| 🚧 G0 | PENDENTE | - | - |
| 🚧 G1 | BLOQUEADO | - | - |
| 🚧 G2 | BLOQUEADO | - | - |
| 🚧 G3 | BLOQUEADO | - | - |
| 🚧 G4 | BLOQUEADO | - | - |
| 🚧 G5 | BLOQUEADO | - | - |
