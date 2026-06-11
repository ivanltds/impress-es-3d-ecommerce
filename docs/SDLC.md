# SDD Process with TDD — Maestro Agile SDD

> **Versão:** 2.1.0
> **Metodologia:** Maestro - Agile SDD com TDD
> **Fonte canônica:** [`SOURCE_OF_TRUTH.md`](../SOURCE_OF_TRUTH.md)
> **Última atualização:** 2026-06-09
>
> ⚠️ Este documento descreve o processo em detalhe. A autoridade final é o `SOURCE_OF_TRUTH.md`.
> Em caso de conflito, o SoT vence.

---

## 1. VISÃO GERAL DO CICLO

O ciclo Maestro Agile SDD com TDD tem 6 fases com 6 Quality Gates.
**Testes são escritos ANTES do código (Test First).**

```
FASE 0:         FASE 1:         FASE 2:           FASE 3:              FASE 4:           FASE 5:         FASE 6:
SPECIFICATION → DERIVATION  →  TEST AUTHORING →  IMPLEMENTATION    →  VERIFICATION   →  ACCEPTANCE  →  RETROSPECTIVE
   (BA)           (Dev)           (QA)              (Dev)              (QA+PO+Maestro)    (PO+Maestro)     (Maestro)
     │               │               │                 │                    │                │              │
  🚧 G0          🚧 G1          🚧 G2            🚧 G3               🚧 G4           🚧 G5          🚧 G6
  Manual         Manual         Manual            Automático           Automático      Manual         Manual
  (PO)           (PO)           (QA+Maestro)      (CI+Maestro)         (CI+QA)         (PO)           (Maestro)
     │               │               │                 │                    │                │              │
     │               │           🔴 RED           🟢 GREEN            🔵 REFACTOR         │              │
     │               │       (testes falham)   (código mínimo)     (Dev otimiza)          │              │
     └───────────────┴───────────────┴─────────────────┴────────────────────┴────────────────┴──────────────┘
```

**TDD Loop (interno às FASE 2-3):**
```
QA escreve teste → Teste FALHA (🔴 RED) → Dev escreve código mínimo → Teste PASSA (🟢 GREEN) → Dev refatora → QA confirma
     ↑                                                                                                      │
     └────────────────────────── próximo cenário Gherkin ───────────────────────────────────────────────────┘
```

---

## 2. FASES DETALHADAS

### FASE 0 — Specification

| Atributo | Valor |
|----------|-------|
| **Agente** | Business Analyst |
| **Entrada** | Milestone do PRD + `SOURCE_OF_TRUTH.md` |
| **Duração** | 1 iteração |
| **Gate** | 🚧 G0 — Spec Approved (Product Owner) |

**Processo:**
1. Maestro carrega milestone do PRD
2. Maestro aciona BA com o milestone + SoT
3. BA escreve especificação Gherkin formal em `specs/MXX-nome.spec.md`
4. BA garante: happy path + edge cases + erros cobertos, zero ambiguidades
5. Maestro revisa completude
6. Maestro apresenta spec ao Product Owner
7. Product Owner aprova (G0 ✅) ou solicita ajustes

**Checklist G0 (Maestro antes de apresentar ao PO):**
- [ ] Cada feature tem ≥1 cenário happy path
- [ ] Edge cases e erros cobertos quando aplicável
- [ ] Nenhum termo vago ("rápido", "bom", "adequado", "bonito")
- [ ] Regras de negócio do PRD refletidas nos cenários
- [ ] Cenários são independentes e testáveis isoladamente

---

### FASE 1 — Derivation

| Atributo | Valor |
|----------|-------|
| **Agente** | Full Stack Developer |
| **Entrada** | Especificação Gherkin aprovada + `SOURCE_OF_TRUTH.md` |
| **Duração** | 1 iteração |
| **Gate** | 🚧 G1 — Architecture Approved (Product Owner) |

**Processo:**
1. Maestro aciona Dev com a spec Gherkin aprovada
2. Dev lê cada cenário e deriva arquitetura
3. Dev projeta: schema Prisma, rotas, componentes, fluxo de dados
4. Dev documenta com rastreabilidade explícita (decisão → cenário Gherkin)
5. Maestro verifica: toda spec tem correspondência na arquitetura?
6. Maestro apresenta arquitetura ao PO
7. PO aprova (G1 ✅) ou solicita ajustes

**Checklist G1 (Maestro):**
- [ ] Toda feature da spec tem componentes e rotas mapeados
- [ ] Schema de banco cobre todas as entidades necessárias
- [ ] Decisões técnicas com justificativa e rastreabilidade
- [ ] Nenhuma violação da stack definida no SoT
- [ ] Responsividade considerada (mobile-first)

---

### FASE 2 — Test Authoring (TDD: RED 🔴)

| Atributo | Valor |
|----------|-------|
| **Agente** | QA Engineer |
| **Entrada** | Especificação Gherkin aprovada (G0 ✅) + Arquitetura aprovada (G1 ✅) |
| **Duração** | 1 iteração |
| **Gate** | 🚧 G2 — Tests Authored (QA + Maestro) |

**⚠️ ESTA FASE NÃO PRODUZ CÓDIGO DE APLICAÇÃO. SÓ TESTES.**

**Processo:**
1. QA lê a especificação Gherkin e a arquitetura
2. QA escreve testes E2E (Playwright) e unitários (Vitest) para TODOS os cenários
3. QA executa os testes — eles DEVEM FALHAR (🔴 RED)
4. A falha é ESPERADA e comprova que os testes são válidos
5. QA especifica os `data-testid` que o Dev deve usar
6. QA documenta cobertura: 100% dos cenários Gherkin mapeados para testes
7. Maestro verifica G2

**Saída:** Testes em `e2e/` e `tests/` + Lista de `data-testid` esperados + Relatório RED

**Checklist G2 (QA + Maestro):**
- [ ] 100% dos cenários Gherkin têm teste E2E correspondente
- [ ] Testes unitários escritos para `lib/`, `hooks/`, `actions/`
- [ ] Testes FALHAM (🔴 RED) — se passarem sem código, estão errados
- [ ] `data-testid` documentados para todos elementos interativos
- [ ] Page Object Models criados para páginas necessárias
- [ ] Testes cobrem 3 viewports: 375px, 768px, 1280px

---

### FASE 3 — Implementation (TDD: GREEN 🟢 + REFACTOR 🔵)

| Atributo | Valor |
|----------|-------|
| **Agente** | Full Stack Developer |
| **Entrada** | Testes que falham (FASE 2) + Arquitetura aprovada (FASE 1) + Spec Gherkin |
| **Duração** | 1-3 iterações |
| **Gate** | 🚧 G3 — All Tests Pass + Build Green (Automático + Maestro) |

**Processo (TDD loop por cenário Gherkin):**
1. Dev pega 1 cenário Gherkin e seu teste correspondente (que está 🔴 FALHANDO)
2. Dev escreve o **código mínimo** necessário para aquele teste passar
3. Dev executa o teste → 🟢 GREEN (passou) ou 🔴 RED (corrige e repete)
4. Dev refatora o código mantendo testes verdes (🔵 REFACTOR)
5. Dev repete para o próximo cenário
6. Ao final de todos os cenários: `npm run build` e `npm run lint`
7. Dev faz deploy preview na Vercel
8. QA re-executa suite completa para confirmação final

**Saída:** Código fonte + deploy preview + todos os testes 🟢

**Checklist G3 (automático, Maestro verifica):**
- [ ] TODOS os testes E2E passam (🟢 GREEN)
- [ ] TODOS os testes unitários passam
- [ ] `npm run build` sem erros
- [ ] `npm run lint` sem erros e sem warnings
- [ ] TypeScript strict: zero `any`, zero erros
- [ ] Deploy preview acessível
- [ ] `.env.example` atualizado
- [ ] Sem secrets, sem `console.log` de debug

---

### FASE 4 — Verification

| Atributo | Valor |
|----------|-------|
| **Agente** | QA Engineer (confirmação) + Maestro |
| **Entrada** | Deploy preview (G3 ✅) + código fonte |
| **Duração** | 1 iteração |
| **Gate** | 🚧 G4 — Verification Passed (Automação + QA) |

**Processo:**
1. QA re-executa suite completa no deploy preview
2. QA faz smoke test manual rápido
3. QA verifica regressão visual (Playwright screenshots)
4. QA gera relatório final de verificação
5. Se bugs: reporta ao Maestro → Dev corrige (FASE 3) → QA re-verifica
6. QA aprova verificação

**Saída:** Relatório final de verificação

**Checklist G4 (QA):**
- [ ] Suite E2E completa executada contra deploy preview (100% pass)
- [ ] Smoke test manual sem surpresas
- [ ] Sem regressões visuais
- [ ] Lighthouse: Performance ≥ 80, Accessibility ≥ 90
- [ ] 0 bugs 🔴 Críticos ou 🟠 Altos abertos

---

### FASE 5 — Acceptance

| Atributo | Valor |
|----------|-------|
| **Agente** | Maestro + Product Owner |
| **Entrada** | Deploy preview verificado (G4 ✅) |
| **Duração** | 1 iteração |
| **Gate** | 🚧 G5 — Deploy Approved (Product Owner) |

**Processo:**
1. Maestro apresenta deploy preview ao PO
2. PO realiza homologação manual
3. PO aprova (G5 ✅) ou solicita ajustes
4. Se ajustes: volta à FASE 3 para correções pontuais

**Checklist G5 (Product Owner):**
- [ ] Fluxos principais testados manualmente
- [ ] Layout e responsividade verificados
- [ ] Experiência de uso satisfatória

---

### FASE 6 — Retrospective

| Atributo | Valor |
|----------|-------|
| **Agente** | Maestro |
| **Entrada** | Feedback de todos |
| **Gate** | 🚧 G6 — Process Improved (Maestro) |

**Processo:**
1. Coletar feedback de BA, Dev, QA e PO
2. Identificar ≥1 melhoria concreta
3. Atualizar SDLC.md e SOURCE_OF_TRUTH.md
4. Atualizar roadmap

---

## 3. FURA-FILA

Mesmo protocolo: Maestro detecta proativamente → BA analisa impacto → PO decide (A/B/C).
Fura-fila segue o MESMO ciclo TDD (FASE 0→6). Sem atalhos.

---

## 4. REGRAS IMUTÁVEIS

1. **Specification First** — Nada se implementa sem spec Gherkin aprovada (G0 ✅)
2. **Test First (TDD)** — Testes são escritos ANTES do código (🔴 RED → 🟢 GREEN → 🔵 REFACTOR)
3. **Gate fechado = STOP** — Nenhum agente avança com gate atual fechado
4. **Human in the Loop** — Gates manuais (G0, G1, G5) só o Product Owner libera
5. **Fonte da Verdade** — `SOURCE_OF_TRUTH.md` vence qualquer outro documento
6. **Spec é contrato** — O teste verifica contra a spec, não contra o código
7. **Rastreabilidade total** — Código e testes apontam para cenários Gherkin
8. **Fura-fila detectado** — Maestro identifica proativamente
9. **Nunca pular fases** — 6 fases, cada uma com critérios de saída
10. **Melhoria contínua** — FASE 6 produz ≥1 melhoria concreta
11. **Memória de sessão** — Toda interação registrada em `memory/session-latest.md`

---

## 5. DEFINIÇÃO DE PRONTO (DoD)

- [ ] G0: Spec Gherkin aprovada pelo PO
- [ ] G1: Arquitetura aprovada pelo PO
- [ ] G2: Testes escritos (E2E + unitários), cobrem 100% spec, e FALHAM (🔴 RED)
- [ ] G3: Todos os testes passam (🟢 GREEN), build + lint OK, deploy preview funcional
- [ ] G4: QA verificou deploy preview, 0 bugs críticos/altos
- [ ] G5: PO homologou e aprovou
- [ ] G6: Retrospective concluída, processo atualizado
- [ ] Código limpo: sem `any`, sem secrets, sem debug
- [ ] Responsivo: 375px, 768px, 1280px
- [ ] Lighthouse ≥ 80 Performance, ≥ 90 Accessibility

---

## 6. PAPÉIS

| Papel | Quem | Fases | Interage com |
|-------|------|-------|-------------|
| Product Owner | Operador (humano) | G0, G1, G5 | Apenas Maestro |
| Maestro | Claude (CLAUDE.md) | Todas | PO + Agentes |
| BA | agente `business-analyst` | FASE 0 | Apenas Maestro |
| Dev | agente `fullstack-dev` | FASE 1, FASE 3 | Apenas Maestro |
| QA | agente `qa-engineer` | FASE 2, FASE 4 | Apenas Maestro |

---

## CHANGELOG

### v2.2.0 (2026-06-11) — M04 Retrospective

**Melhorias identificadas e incorporadas:**

**M1 — File Integrity Check (prevenção de truncamento)**
Constatado em M04: arquivos editados via `Write` tool em mounts Windows→Linux podem sofrer truncamento silencioso (null bytes ou EOF prematuro). O processo agora exige:
- Após todo `Write` em arquivo de rota, rodar `tail -5 <file> | cat -A` para detectar null bytes
- Se `wc -l` Linux divergir da contagem do `Read` tool, reescrever via bash heredoc
- CI (`npm run test`) captura ParseErrors de arquivos truncados — confirmar verde antes de G3

**M2 — NextRequest em testes de rotas com searchParams**
Rotas que usam `request.nextUrl.searchParams` (padrão Next.js) requerem `NextRequest` (não `Request`) nos testes de integração. Regra adicionada ao SDLC: ao escrever testes de rotas com query params, sempre usar `import { NextRequest } from 'next/server'`.

**M3 — TDD em fura-filas: nível mínimo de teste**
FF02-FF07 foram implementados sem testes prévios formais. A partir de M05: todo fura-fila deve ter pelo menos testes de integração escritos (e falhando) ANTES da implementação. Cenários Gherkin simplificados são aceitáveis; dispensa Playwright para fura-filas de escopo pequeno.

**M4 — CI obrigatório no pipeline**
A partir de M04, o CI (GitHub Actions) executa `npm run test` em todo PR/push. G3 só é liberado com o job `test` verde. Playwright E2E continua como job opcional (`continue-on-error: true`).

**Cenários postergados de M04 → Backlog M05/M07:**
- 3.7: Registrar falha de produção
- 5.1: Meta Pixel — PageView
- 5.2: Meta Pixel — evento Purchase
- 5.3: Captura de UTM nos pedidos

### v2.1.0 (2026-06-09)
- **TDD integrado:** Testes escritos ANTES do código (Test First)
- FASE 2: Test Authoring (QA escreve testes, 🔴 RED)
- FASE 3: Implementation TDD (Dev codifica até 🟢 GREEN + 🔵 REFACTOR)
- FASE 4: Verification (QA confirma)
- FASE 5: Acceptance (PO homologa)
- FASE 6: Retrospective
- 6 Quality Gates (G0-G5 renumerados)
- TDD loop documentado

### v2.0.0 (2026-06-09)
- Metodologia renomeada: Maestro - Agile SDD
- Quality Gates formais, HITL, Specs Gherkin

### v1.1.0 (2026-06-09)
- Integração PRD, fura-fila, memória de sessão

### v1.0.0 (2026-06-09)
- Estrutura inicial do SDLC
