# Sessão Atual

> **Metodologia:** Maestro - Agile SDD com TDD v2.0.0
> **Data da última iteração:** 2026-06-09
> **Fase atual:** FASE 0 — Specification (M01)
> **Milestone ativo:** M01 — Foundation (Épico A)
> **Gate pendente:** 🚧 G0 (Spec Approved)

---

## M00 — DISCOVERY ✅ CONCLUÍDO

Todas as 10 decisões foram resolvidas:

| # | Decisão | Resolução |
|---|---------|-----------|
| 1 | Stack | Next.js 14+ App Router |
| 2 | Gateway | Stripe + MercadoPago |
| 3 | Frete | Calculado via Correios |
| 4 | CMS | Interno (admin próprio) |
| 5 | PDP | Página dedicada com drawer no mobile |
| 6 | IP | Catálogo 100% original + política de revisão no admin |
| 7 | Coleções MVP | 5 (Gamer, Anime, Casa, Presentes, Auto) |
| 8 | SKUs | 6 famílias (porta-lata, chaveiros, abajur, organizador, geek, auto) |
| 9 | Margem | Parametrizável em tela de gestão (campo `cost_estimate`, futuro) |
| 10 | Consulta | Formulário + WhatsApp integrado |

---

## M01 — FOUNDATION (Épico A)

**Objetivo:** Setup, banco, auth, tema base, layout, home page, observabilidade.

### Histórias previstas (8)

| US | Descrição |
|----|-----------|
| M01-01 | Setup Next.js + TypeScript + Tailwind + shadcn/ui |
| M01-02 | Deploy na Vercel com preview automático |
| M01-03 | Banco Supabase + Prisma + migration inicial |
| M01-04 | Auth base (NextAuth.js v5, e-mail+senha, roles) |
| M01-05 | Tema Core/Default (design tokens, ThemeProvider) |
| M01-06 | Layout principal (Header, Footer, nav, responsivo) |
| M01-07 | Home page (hero, coleções placeholder, destaques, SEO) |
| M01-08 | Observabilidade (logging, error tracking, health check) |

---

## PRÓXIMO PASSO

Acionar **Business Analyst** para escrever a especificação Gherkin formal do M01.
O BA vai transformar as 8 histórias em cenários DADO/QUANDO/ENTÃO testáveis.

---

## DECISÕES PENDENTES

Nenhuma. M00 completo.
