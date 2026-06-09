# M01: Foundation (Épico A)

> **Fase:** 1 (MVP) | **Prioridade:** 🔴 MUST HAVE
> **Status:** ⬜ A FAZER
> **Dependências:** M00 (Discovery)
> **Responsável:** Full Stack Dev

---

## OBJETIVO

Setup completo do projeto: Next.js, TypeScript, Tailwind, Supabase, autenticação base, sistema de temas base, e observabilidade. A fundação sobre a qual todo o resto será construído.

---

## HISTÓRIAS DE USUÁRIO

### US-M01-01: Setup do Projeto
- Next.js 14+ App Router, TypeScript strict, Tailwind, shadcn/ui
- ESLint + Prettier configurados
- Estrutura de pastas padrão
- `npm run build` e `npm run lint` passando

### US-M01-02: Deploy na Vercel
- Deploy automático, preview em PRs
- Variáveis de ambiente configuradas

### US-M01-03: Banco de Dados
- Supabase (PostgreSQL), Prisma ORM
- Migration inicial com schema base (User, Session)

### US-M01-04: Sistema de Autenticação Base
- NextAuth.js v5 configurado
- Login/cadastro por e-mail + senha
- Roles: admin, operator, partner, customer
- Sessão persistente

### US-M01-05: Tema Base (Core/Default)
- Design tokens para o tema core
- ThemeProvider com suporte a troca futura
- Paleta neutra, profissional, clean
- Tailwind config com CSS variables

### US-M01-06: Layout Principal
- Header com logo, navegação, busca, carrinho
- Footer com links, redes sociais, newsletter
- Responsivo (375px, 768px, 1280px)
- Loading e error states

### US-M01-07: Home Page Estática
- Hero section com proposta de valor
- Seção de coleções/universos (placeholder)
- Seção de produtos em destaque (placeholder)
- SEO: meta tags, og:tags, title, description

### US-M01-08: Observabilidade
- Logging estruturado
- Error tracking (Sentry ou similar)
- Health check endpoint

---

## MODELO DE DADOS (M01)

- User (base)
- Session (NextAuth)
- ThemePreference

---

## CRITÉRIO DE SAÍDA

- [ ] Build e lint passando
- [ ] Deploy preview funcional
- [ ] Login funcional
- [ ] Tema core aplicado
- [ ] Home page responsiva
