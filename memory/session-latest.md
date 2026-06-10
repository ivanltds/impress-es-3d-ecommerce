# Sessão Atual

> **Metodologia:** Maestro - Agile SDD com TDD v2.0.0
> **Data da última iteração:** 2026-06-10
> **Milestone ativo:** M01 ✅ → **M02 próximo**
> **Fase atual:** G6 — Retrospective concluída

---

## GATES M01

| Gate | Status |
|------|--------|
| G0 | ✅ Spec Approved |
| G1 | ✅ Architecture Approved |
| G2 | ✅ Tests Authored (29 testes) |
| G3 | ✅ All Tests Pass + Build Green |
| G4 | ✅ Verification Passed |
| G5 | ✅ Deploy Approved |
| G6 | ✅ Retrospective concluída |

---

## RETROSPECTIVE M01

### ✅ O que funcionou bem

1. **Spec Gherkin como contrato** — A spec de 46 cenários guiou todas as fases sem ambiguidade
2. **TDD detectou bugs antes do PO** — O bug UntrustedHost foi pego nos testes, não em produção
3. **Quality Gates** — Cada gate conteve problemas na sua fase. Nada vazou
4. **Deploy preview early** — Fazer deploy no meio da sprint expôs a incompatibilidade Supabase+Vercel cedo
5. **Separação de papéis** — BA, Dev, QA cada um no seu escopo, sem pisar no trabalho alheio

### ❌ O que melhorar

1. **Supabase vs Vercel** — Perdemos ~2h debugando conectividade que não funciona (IPv6 vs IPv4)
2. **Tema dark/light** — CSS specificity causou bug que só apareceu em produção
3. **FASE 2 fora de ordem** — Testes foram escritos depois do código, não antes. O ciclo TDD foi adaptado

### 🔧 Ações concretas

1. **Banco em produção:** Neon (us-east-2) por padrão. Supabase só local
2. **Adicionar ao SDLC:** FASE 1.5 — Smoke test de conectividade banco↔Vercel ANTES de implementar
3. **Adicionar ao SDLC:** CSS deve usar atributos (`data-mode`), não classes, pra evitar conflito com @media
4. **Template de PRD:** Atualizar com a decisão Neon > Supabase pra Vercel

---

## PRÓXIMO SPRINT: M02 — Catalog + Experience

**Objetivo:** Catálogo de produtos, página de detalhe (PDP), filtros, busca, 5 coleções temáticas.

**Épicos:** B (Experience) + C (Commerce — Produto)
