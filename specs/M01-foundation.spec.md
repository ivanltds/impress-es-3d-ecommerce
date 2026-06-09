# Especificação Formal — M01: Foundation (Épico A)

> **Formato:** Gherkin (DADO/QUANDO/ENTÃO)
> **Status:** 🚧 G0 PENDENTE (aguardando Product Owner)
> **Derivado de:** `PRD/milestones/M01-foundation.md`
> **Responsável:** Business Analyst

---

## FEATURE 1: Setup do Projeto Next.js

**Como** desenvolvedor
**Quero** um projeto Next.js 14+ configurado com TypeScript strict, Tailwind CSS, shadcn/ui e ferramentas de qualidade
**Para** ter uma base sólida, padronizada e produtiva para todo o desenvolvimento

### Cenários

**Cenário 1.1: Projeto criado com template App Router**
```gherkin
DADO que o comando de criação do projeto é executado
QUANDO a instalação de dependências for concluída
ENTÃO deve existir um projeto Next.js 14+ com App Router habilitado
E o arquivo next.config.ts deve estar presente
E o arquivo tsconfig.json deve ter strict: true
E o Tailwind CSS deve estar configurado em tailwind.config.ts
E o shadcn/ui deve estar inicializado com components.json
```

**Cenário 1.2: Build limpo sem erros**
```gherkin
DADO que o projeto está configurado com todas as dependências
QUANDO o comando `npm run build` for executado
ENTÃO a build deve ser concluída com exit code 0
E não deve haver erros de TypeScript
E não deve haver warnings de ESLint
```

**Cenário 1.3: Lint limpo**
```gherkin
DADO que o projeto está configurado
E existem arquivos fonte em src/
QUANDO o comando `npm run lint` for executado
ENTÃO não deve haver erros de lint
E não deve haver warnings de lint
```

**Cenário 1.4: Estrutura de diretórios padronizada**
```gherkin
DADO que o projeto foi criado
QUANDO a estrutura de diretórios for inspecionada
ENTÃO deve existir src/app/ para App Router
E deve existir src/components/ui/ para componentes shadcn
E deve existir src/components/shop/ para componentes da loja
E deve existir src/components/shared/ para componentes compartilhados
E deve existir src/lib/ para utilitários e configurações
E deve existir src/hooks/ para custom hooks
E deve existir src/types/ para definições de tipo
E deve existir src/actions/ para Server Actions
```

**Cenário 1.5: Erro — TypeScript strict rejeita any**
```gherkin
DADO que o projeto está em modo strict
QUANDO um arquivo contiver o tipo `any`
ENTÃO o comando `npm run build` deve falhar
E a mensagem de erro deve indicar o uso de any
```

---

## FEATURE 2: Deploy na Vercel

**Como** desenvolvedor
**Quero** o projeto deployado na Vercel com preview automático em pull requests
**Para** ter ambiente de staging disponível para review e homologação desde o primeiro dia

### Cenários

**Cenário 2.1: Deploy de produção automático**
```gherkin
DADO que o repositório está conectado à Vercel
QUANDO um push for feito na branch principal (master)
ENTÃO o deploy de produção deve ser acionado automaticamente
E a URL de produção deve ficar acessível em até 2 minutos
E o status do deploy deve ser visível no dashboard da Vercel
```

**Cenário 2.2: Deploy preview em pull requests**
```gherkin
DADO que existe um pull request aberto
QUANDO um novo commit for adicionado ao PR
ENTÃO um deploy preview único deve ser gerado automaticamente
E a URL do preview deve ser acessível publicamente
E um comentário com a URL deve ser adicionado ao PR
```

**Cenário 2.3: Variáveis de ambiente configuradas**
```gherkin
DADO que o projeto está deployado na Vercel
QUANDO as variáveis de ambiente de produção forem verificadas
ENTÃO DATABASE_URL deve estar configurada como secret
E AUTH_SECRET deve estar configurada como secret
E NEXT_PUBLIC_APP_URL deve estar configurada
E as variáveis de ambiente locais devem estar documentadas em .env.example
```

**Cenário 2.4: Erro — Build quebrada bloqueia deploy**
```gherkin
DADO que um commit com erro de TypeScript é enviado
QUANDO a Vercel tentar fazer o deploy
ENTÃO o deploy deve falhar com status de erro
E o deploy anterior deve permanecer ativo (sem downtime)
E o log de erro deve indicar o arquivo e linha do problema
```

---

## FEATURE 3: Configuração do Banco de Dados

**Como** desenvolvedor
**Quero** um banco PostgreSQL configurado via Supabase com Prisma ORM e migration inicial
**Para** persistir dados da aplicação com schema versionado e tipado

### Cenários

**Cenário 3.1: Conexão com Supabase estabelecida**
```gherkin
DADO que o projeto Supabase está criado
E as variáveis DATABASE_URL e DIRECT_URL estão definidas no .env
QUANDO o Prisma Client for gerado com `npx prisma generate`
E uma query de health check for executada
ENTÃO a conexão deve retornar sucesso
E o resultado deve incluir a versão do PostgreSQL
```

**Cenário 3.2: Migration inicial cria tabelas base**
```gherkin
DADO que o schema Prisma contém os modelos User e ThemePreference
QUANDO `npx prisma migrate dev` for executado
ENTÃO a tabela User deve ser criada com as colunas:
  | id, name, email, password_hash, phone, role, marketing_consent,
  | preferred_theme, preferred_collection, status, created_at, updated_at
E a tabela ThemePreference deve ser criada com as colunas:
  | id, user_id, session_id, theme_key, source, last_updated
E índices únicos devem existir em User.email
E a foreign key ThemePreference.user_id → User.id deve existir
```

**Cenário 3.3: Erro — Conexão recusada com credenciais inválidas**
```gherkin
DADO que DATABASE_URL contém uma senha incorreta
QUANDO o Prisma Client tentar conectar
ENTÃO uma exceção deve ser lançada
E a mensagem de erro deve conter "authentication failed"
E a aplicação não deve iniciar
```

---

## FEATURE 4: Sistema de Autenticação Base

**Como** visitante
**Quero** criar uma conta e fazer login com e-mail e senha
**Para** acessar áreas restritas e ter meus dados persistidos

### Cenários

**Cenário 4.1: Cadastro com e-mail e senha**
```gherkin
DADO que o visitante está na página de cadastro
QUANDO preencher nome, e-mail e senha (mínimo 8 caracteres)
E submeter o formulário
ENTÃO uma conta deve ser criada com role "customer"
E o usuário deve ser redirecionado para a home page logado
E um e-mail de boas-vindas deve ser enviado
```

**Cenário 4.2: Login com credenciais válidas**
```gherkin
DADO que existe um usuário cadastrado com email "cliente@teste.com" e senha "12345678"
QUANDO o usuário preencher email e senha corretos
E submeter o formulário de login
ENTÃO a sessão deve ser criada
E o usuário deve ser redirecionado para a home page logado
E o header deve exibir o nome do usuário
```

**Cenário 4.3: Login com credenciais inválidas**
```gherkin
DADO que existe um usuário cadastrado
QUANDO o usuário preencher email correto mas senha incorreta
E submeter o formulário de login
ENTÃO uma mensagem de erro deve ser exibida: "E-mail ou senha inválidos"
E a sessão NÃO deve ser criada
E o formulário deve permanecer preenchido com o email (não a senha)
```

**Cenário 4.4: Logout**
```gherkin
DADO que o usuário está logado
QUANDO clicar no botão "Sair"
ENTÃO a sessão deve ser destruída
E o usuário deve ser redirecionado para a home page
E o header deve exibir o botão "Entrar"
```

**Cenário 4.5: Acesso a rota protegida sem login**
```gherkin
DADO que o usuário não está logado
QUANDO tentar acessar /conta/pedidos
ENTÃO deve ser redirecionado para a página de login
E após fazer login, deve ser redirecionado de volta para /conta/pedidos
```

**Cenário 4.6: Roles — Admin acessa painel**
```gherkin
DADO que existe um usuário com role "admin"
QUANDO fizer login e acessar /admin
ENTÃO deve ter acesso ao painel administrativo
```

**Cenário 4.7: Roles — Customer não acessa admin**
```gherkin
DADO que existe um usuário com role "customer"
QUANDO fizer login e tentar acessar /admin
ENTÃO deve receber HTTP 403 (Forbidden)
E uma mensagem "Acesso negado" deve ser exibida
```

**Cenário 4.8: Sessão persistente**
```gherkin
DADO que o usuário fez login
QUANDO fechar o navegador e reabrir
ENTÃO deve permanecer logado (sessão persistida via cookie HTTP-only)
```

---

## FEATURE 5: Tema Base (Core/Default)

**Como** visitante
**Quero** ver a loja com identidade visual profissional e tema que respeita minha preferência de sistema
**Para** ter uma experiência visual consistente e agradável

**Regras de negócio aplicáveis:** RN-20, RN-21, RN-22, RN-24, RN-25

### Cenários

**Cenário 5.1: Tema padrão aplicado**
```gherkin
DADO que o visitante acessa a loja pela primeira vez
E não há preferência salva
QUANDO a página for carregada
ENTÃO o tema "core" (default) deve ser aplicado
E a paleta deve ser neutra e profissional
E a tipografia deve ser limpa e legível
```

**Cenário 5.2: Tema segue preferência do sistema (claro/escuro)**
```gherkin
DADO que o visitante acessa a loja pela primeira vez
E o sistema operacional está configurado com tema escuro
QUANDO a página for carregada
ENTÃO o tema escuro deve ser aplicado automaticamente
E a transição não deve ter flicker (flash of wrong theme)
E deve existir um toggle para alternar manualmente
```

**Cenário 5.3: Alternância manual de tema**
```gherkin
DADO que o visitante está no tema escuro
QUANDO clicar no toggle de tema
ENTÃO o tema deve alternar para claro em menos de 200ms
E a transição deve ser suave (CSS transition)
E o novo tema deve persistir ao navegar entre páginas
```

**Cenário 5.4: Persistência de preferência em cookie (guest)**
```gherkin
DADO que o visitante não está logado
QUANDO selecionar o tema escuro manualmente
ENTÃO um cookie theme_pref com valor "dark" deve ser salvo
E ao recarregar a página, o tema escuro deve permanecer
```

**Cenário 5.5: Persistência de preferência no perfil (logado)**
```gherkin
DADO que o usuário está logado
QUANDO selecionar o tema "gamer" (futuro) nas configurações
ENTÃO a preferência deve ser salva na tabela ThemePreference
E em qualquer dispositivo, ao fazer login, o tema "gamer" deve ser aplicado
```

**Cenário 5.6: Design tokens via CSS variables**
```gherkin
DADO que o tema core está ativo
QUANDO os estilos forem inspecionados
ENTÃO as cores devem ser definidas por CSS custom properties (--color-primary, --color-background, etc.)
E a tipografia deve usar CSS custom properties (--font-heading, --font-body)
E os tokens devem estar documentados no arquivo de tema
```

**Cenário 5.7: Tema não altera comportamento de formulários**
```gherkin
DADO que qualquer tema está ativo
QUANDO um formulário for renderizado (login, cadastro)
ENTÃO inputs, labels e mensagens de erro devem manter mesmas dimensões e posições
E contraste de texto deve atender WCAG AA (ratio ≥ 4.5:1)
```

**Cenário 5.8: Erro — Tema inválido faz fallback para core**
```gherkin
DADO que um cookie theme_pref contém valor "tema_inexistente"
QUANDO a página for carregada
ENTÃO o sistema deve ignorar o valor inválido
E aplicar o tema "core" como fallback
E NÃO deve exibir erro para o usuário
```

---

## FEATURE 6: Layout Principal

**Como** visitante
**Quero** um layout consistente com header, footer e navegação em todas as páginas
**Para** navegar pela loja com facilidade e encontrar o que procuro

### Cenários

**Cenário 6.1: Header com elementos principais**
```gherkin
DADO que o visitante está em qualquer página da loja
QUANDO a página for carregada
ENTÃO o header deve exibir:
  | Logo da loja (canto esquerdo)
  | Links de navegação: Início, Coleções, Produtos
  | Ícone de busca (visual, funcionalidade futura)
  | Ícone do carrinho com contador de itens
  | Botão "Entrar" (se não logado) ou nome do usuário (se logado)
```

**Cenário 6.2: Header responsivo — Mobile**
```gherkin
DADO que o visitante está em dispositivo móvel (viewport < 768px)
QUANDO a página for carregada
ENTÃO os links de navegação devem ser substituídos por ícone hamburguer
E ao clicar no hamburguer, um drawer deve abrir da esquerda
E o drawer deve conter os mesmos links de navegação
E o logo deve permanecer visível
E o ícone do carrinho deve permanecer visível
```

**Cenário 6.3: Header responsivo — Tablet e Desktop**
```gherkin
DADO que o visitante está em tablet (≥768px) ou desktop (≥1280px)
QUANDO a página for carregada
ENTÃO todos os links de navegação devem estar visíveis horizontalmente
E o menu hamburguer não deve ser exibido
```

**Cenário 6.4: Footer com informações institucionais**
```gherkin
DADO que o visitante está em qualquer página
QUANDO a página for carregada
ENTÃO o footer deve exibir:
  | Links: Termos de Uso, Política de Privacidade, FAQ
  | Ícones de redes sociais (Instagram, WhatsApp)
  | Campo de newsletter (placeholder, não funcional no M01)
  | Copyright com ano atual
```

**Cenário 6.5: Loading state na transição de páginas**
```gherkin
DADO que o visitante navega de uma página para outra
QUANDO a nova página estiver carregando
ENTÃO uma barra de progresso sutil deve aparecer no topo da página
E o conteúdo anterior não deve sumir abruptamente
```

**Cenário 6.6: Error boundary em falha de renderização**
```gherkin
DADO que ocorre um erro na renderização de uma página
QUANDO o erro for capturado pelo error boundary
ENTÃO uma mensagem amigável deve ser exibida: "Algo deu errado. Tente novamente."
E o header e footer devem permanecer funcionais
E um botão "Tentar novamente" deve estar disponível
```

**Cenário 6.7: SEO — meta tags no layout**
```gherkin
DADO que qualquer página é renderizada no servidor
QUANDO o HTML for inspecionado
ENTÃO deve conter meta viewport para responsividade
E deve conter meta charset="utf-8"
E o idioma deve ser pt-BR no atributo html lang
```

---

## FEATURE 7: Home Page

**Como** visitante vindo do Instagram
**Quero** ver uma landing page que explica a proposta de valor e mostra os universos disponíveis
**Para** decidir se exploro a loja e confio na marca

### Cenários

**Cenário 7.1: Hero section com proposta de valor**
```gherkin
DADO que o visitante acessa a URL raiz "/"
QUANDO a home page for carregada
ENTÃO deve exibir uma hero section com:
  | Título principal com a proposta de valor da marca
  | Subtítulo descritivo
  | Botão CTA "Ver Coleções"
E a hero section deve ocupar no mínimo 80% da altura da viewport
```

**Cenário 7.2: Seção de Coleções/Universos**
```gherkin
DADO que o visitante está na home page
QUANDO a seção de coleções for renderizada
ENTÃO deve exibir 5 cards de coleção: Gamer, Anime, Casa, Presentes, Auto
E cada card deve conter: imagem representativa, nome da coleção, breve descrição
E cada card deve ser clicável (link para /colecoes/[slug] — placeholder no M01)
```

**Cenário 7.3: Seção "Como Funciona"**
```gherkin
DADO que o visitante está na home page
QUANDO a seção "Como Funciona" for renderizada
ENTÃO deve explicar o processo em 3 passos:
  | 1. Escolha seu produto e coleção
  | 2. Personalize com cor, tamanho e texto
  | 3. Receba em casa
E cada passo deve ter ícone, título e breve descrição
```

**Cenário 7.4: Produtos em Destaque (placeholder)**
```gherkin
DADO que o visitante está na home page
QUANDO a seção de produtos em destaque for renderizada
ENTÃO deve exibir 4 cards de produto com dados mockados
E cada card deve mostrar: imagem placeholder, nome, preço base
E deve ter um selo "Em breve" nos cards
```

**Cenário 7.5: CTA para WhatsApp**
```gherkin
DADO que o visitante está na home page
QUANDO a página for carregada
ENTÃO deve existir um botão flutuante de WhatsApp no canto inferior direito
E ao clicar, deve abrir link wa.me com mensagem pré-preenchida
```

**Cenário 7.6: SEO da Home Page**
```gherkin
DADO que a home page foi renderizada no servidor
QUANDO o HTML for inspecionado
ENTÃO deve ter <title> com nome da loja
E deve ter <meta name="description"> com até 160 caracteres
E deve ter Open Graph tags: og:title, og:description, og:image, og:url
E deve ter meta robots "index, follow"
```

**Cenário 7.7: Grid responsivo — mobile (375px)**
```gherkin
DADO que o visitante está em mobile (375px)
QUANDO a home page for renderizada
ENTÃO os cards de coleção devem estar em 1 coluna
E os cards de produtos em destaque devem estar em 2 colunas
E o texto do hero deve ser legível sem scroll horizontal
```

**Cenário 7.8: Grid responsivo — desktop (1280px)**
```gherkin
DADO que o visitante está em desktop (1280px)
QUANDO a home page for renderizada
ENTÃO os cards de coleção devem estar em grade horizontal (5 itens)
E os cards de produtos em destaque devem estar em 4 colunas
E o hero deve ter texto e imagem lado a lado
```

---

## FEATURE 8: Observabilidade

**Como** desenvolvedor
**Quero** logging estruturado e health check
**Para** diagnosticar problemas em produção rapidamente

### Cenários

**Cenário 8.1: Health check endpoint**
```gherkin
DADO que a aplicação está rodando
QUANDO uma requisição GET for feita para /api/health
ENTÃO deve retornar HTTP 200
E o corpo deve ser JSON: { "status": "ok", "timestamp": "..." }
```

**Cenário 8.2: Logging estruturado no servidor**
```gherkin
DADO que ocorre um erro em uma Server Action
QUANDO o erro for capturado
ENTÃO um log estruturado deve ser emitido com:
  | timestamp em ISO 8601
  | nível "error"
  | mensagem descritiva
  | stack trace (em desenvolvimento)
  | request ID para correlação
```

**Cenário 8.3: Log de eventos de autenticação**
```gherkin
DADO que um usuário faz login com sucesso
QUANDO a sessão for criada
ENTÃO um log nível "info" deve ser emitido contendo:
  | evento: "login_success"
  | user_id (não o email)
  | timestamp
```

---

## REGRAS DE NEGÓCIO APLICÁVEIS

| ID | Regra | Feature |
|----|-------|---------|
| RN-20 | Tema não altera comportamento crítico de checkout | F5 |
| RN-21 | Guest usa cookie para persistência visual | F5 |
| RN-22 | Logado salva preferência no perfil | F5 |
| RN-24 | Nunca trocar tema abruptamente | F5 |
| RN-25 | Itens que não variam por tema | F5 |
| RN-60 | Consentimento marketing deve ser opt-in (preparação) | F4 |
| RN-62 | Cookies de preferência não precisam de consentimento | F5 |

---

## RASTREABILIDADE

| Feature | Origem (PRD) | Cenários Gherkin | Gate alvo |
|---------|-------------|------------------|-----------|
| F1: Setup Next.js | US-M01-01 | 5 | G2 (Build) |
| F2: Deploy Vercel | US-M01-02 | 4 | G2 (Build) |
| F3: Banco de Dados | US-M01-03 | 3 | G3 (Tests) |
| F4: Autenticação Base | US-M01-04 | 8 | G3 (Tests) |
| F5: Tema Base (Core) | US-M01-05 | 8 | G3 (Tests) |
| F6: Layout Principal | US-M01-06 | 7 | G3 (Tests) |
| F7: Home Page | US-M01-07 | 8 | G3 (Tests) |
| F8: Observabilidade | US-M01-08 | 3 | G3 (Tests) |
| **Total** | **8 features** | **46 cenários** | |

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
