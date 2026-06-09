# M01: Fundação do Projeto

> **Sprint:** 1 | **Prioridade:** 🔴 MUST HAVE
> **Status:** ⬜ A FAZER
> **Dependências:** Nenhuma
> **Responsável:** Full Stack Dev

---

## OBJETIVO

Criar a base do projeto 3DPrint Store: estrutura Next.js, configuração de infraestrutura, tema visual e página inicial estática.

---

## HISTÓRIAS DE USUÁRIO

### US-M01-01: Setup do Projeto
**Como** desenvolvedor
**Quero** um projeto Next.js configurado com TypeScript, Tailwind e ESLint
**Para** ter uma base sólida para o desenvolvimento

**Critérios de Aceitação:**
- [ ] Projeto criado com `create-next-app` (App Router)
- [ ] TypeScript strict mode ativado
- [ ] Tailwind CSS configurado
- [ ] ESLint + Prettier configurados
- [ ] Estrutura de pastas conforme arquitetura padrão
- [ ] `npm run build` passa sem erros
- [ ] `npm run lint` passa sem erros

### US-M01-02: Deploy na Vercel
**Como** desenvolvedor
**Quero** o projeto deployado na Vercel com deploy preview automático
**Para** ter o ambiente de staging disponível para review

**Critérios de Aceitação:**
- [ ] Projeto conectado à Vercel
- [ ] Deploy automático em pushes na branch principal
- [ ] Deploy preview em pull requests
- [ ] Variáveis de ambiente configuradas na Vercel
- [ ] URL de produção funcional

### US-M01-03: Configuração do Banco de Dados
**Como** desenvolvedor
**Quero** um banco de dados PostgreSQL configurado via Supabase
**Para** persistir dados da aplicação

**Critérios de Aceitação:**
- [ ] Projeto Supabase criado
- [ ] Schema Prisma inicial configurado
- [ ] Conexão funcionando (migração inicial)
- [ ] Variáveis de ambiente documentadas em `.env.example`

### US-M01-04: Tema Visual Base
**Como** visitante
**Quero** ver uma loja com identidade visual profissional
**Para** confiar na qualidade da plataforma

**Critérios de Aceitação:**
- [ ] shadcn/ui instalado e configurado
- [ ] Tema claro/escuro (padrão: sistema operacional)
- [ ] Paleta de cores definida (primária, secundária, neutra)
- [ ] Tipografia configurada (fonte para títulos e corpo)
- [ ] Design tokens documentados em `tailwind.config.ts`

### US-M01-05: Layout Principal
**Como** visitante
**Quero** navegar pela loja com Header, Footer e navegação intuitiva
**Para** encontrar facilmente o que procuro

**Critérios de Aceitação:**
- [ ] Header com logo, menu de navegação, busca e ícone do carrinho
- [ ] Footer com links institucionais, redes sociais e newsletter
- [ ] Layout responsivo (mobile-first)
- [ ] Estados: carregando, vazio, erro

### US-M01-06: Home Page
**Como** visitante
**Quero** ver uma página inicial atraente com destaques
**Para** conhecer a loja e seus produtos principais

**Critérios de Aceitação:**
- [ ] Hero section com chamada principal
- [ ] Seção "Categorias em Destaque"
- [ ] Seção "Produtos em Destaque" (placeholder - dados mockados)
- [ ] Seção "Como Funciona" (impressão 3D explicada)
- [ ] SEO básico (meta tags, title, description)
- [ ] Responsivo (mobile, tablet, desktop)

---

## REGRAS DE NEGÓCIO

- **RN-M01-01:** A aplicação deve estar em português (Brasil) como idioma padrão
- **RN-M01-02:** Todas as páginas devem ter meta tags para SEO
- **RN-M01-03:** O layout deve funcionar em viewports de 320px a 2560px
- **RN-M01-04:** Performance: Lighthouse score ≥ 90 (Performance, Accessibility, Best Practices, SEO)

---

## MODELO DE DADOS (Prisma)

```prisma
// Schema inicial — será expandido nos próximos milestones

model User {
  id            String    @id @default(cuid())
  name          String?
  email         String?   @unique
  emailVerified DateTime?
  image         String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model Product {
  id          String   @id @default(cuid())
  name        String
  slug        String   @unique
  description String
  price       Decimal
  images      String[] // URLs do Vercel Blob
  categoryId  String?
  category    Category? @relation(fields: [categoryId], references: [id])
  inStock     Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Category {
  id       String    @id @default(cuid())
  name     String
  slug     String    @unique
  products Product[]
}
```

---

## ESTRUTURA DE ROTAS

```
/                       → Home page (hero, destaques, categorias)
/termos                 → Termos de uso
/privacidade            → Política de privacidade
```

---

## COMPONENTES PRINCIPAIS

```
Layout
├── Header
│   ├── Logo
│   ├── NavMenu
│   ├── SearchBar (visual)
│   └── CartIcon (visual)
├── Main (children)
└── Footer
    ├── FooterLinks
    ├── SocialLinks
    └── NewsletterForm (visual)

HomePage
├── HeroSection
├── FeaturedCategories
├── FeaturedProducts (mock)
└── HowItWorks
```

---

## CRITÉRIO DE CONCLUSÃO DO MILESTONE

- [ ] Todas as 6 histórias de usuário completas
- [ ] Deploy na Vercel funcional
- [ ] Build e lint passando
- [ ] QA aprovou testes
- [ ] Product Owner aprovou a home page
