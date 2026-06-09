# SOURCE OF TRUTH — E-commerce Impressão 3D Personalizada

> **Metodologia:** Maestro - Agile SDD com TDD
> **Versão:** 2.0.0
> **Última atualização:** 2026-06-09
>
> ⚠️ **ESTE DOCUMENTO É A FONTE CANÔNICA DO PROJETO.**
> Nenhum agente, artefato ou decisão tem precedência sobre o que está escrito aqui.
> Em caso de conflito, este documento vence. Sempre.

---

## 1. IDENTIDADE DO PROJETO

| Atributo | Valor |
|----------|-------|
| **Nome** | E-commerce de Impressão 3D Personalizada |
| **Pitch** | E-commerce escalável de produtos impressos em 3D com foco em experiência personalizada — múltiplos nichos (gamer, anime, casa, presentes, automotivo), personalização acessível, aquisição via Instagram e site próprio como hub |
| **Stack** | Next.js 14+ (App Router), TypeScript strict, Tailwind CSS, shadcn/ui, Supabase, Prisma, Stripe + MercadoPago |
| **Host** | Vercel |
| **Idioma** | pt-BR |
| **Público** | Jovens e adultos brasileiros — gamers, geeks, entusiastas de decoração, compradores de presentes, comunidades automotivas |

---

## 2. METODOLOGIA: MAESTRO - AGILE SDD

### 2.1 O que é

Maestro - Agile SDD é uma metodologia de desenvolvimento **Specification-Driven**, com **Human-in-the-Loop** obrigatório e **Quality Gates** bloqueantes, orquestrada por um agente central chamado **Maestro**.

### 2.2 Valores

| Valor | Significado |
|-------|-------------|
| **Specification First** | Nada se implementa sem especificação formal aprovada por humano |
| **Human in the Loop** | Toda decisão de avanço entre fases é bloqueada até um humano liberar |
| **Quality is Non-Negotiable** | Nenhum Quality Gate pode ser bypassado ou marcado como "parcial" |
| **Transparency by Default** | Todo artefato, decisão e mudança é versionado, rastreável e justificado |
| **Continuous Improvement** | Cada ciclo termina com uma retrospective que melhora o próprio processo |

### 2.3 Princípios

| # | Princípio | Regra |
|---|-----------|-------|
| **P1** | Spec é contrato | O que está na especificação formal é o que será implementado e testado |
| **P2** | Gate fechado = STOP | Nenhum agente avança para a fase seguinte com gate atual fechado |
| **P3** | Uma fonte da verdade | `SOURCE_OF_TRUTH.md` é canônico; todo outro documento é complementar |
| **P4** | Approval é humano | Automação (build, lint, testes) informa, mas não substitui decisão humana |
| **P5** | Falhe rápido | Problemas de especificação encontrados na FASE 0 custam 10x menos que na FASE 3 |
| **P6** | Rastro completo | Toda decisão de design, trade-off ou mudança de escopo tem justificativa documentada e linkada ao requisito |
| **P7** | Fura-fila é detectado, não solicitado | O Maestro identifica proativamente desvios de escopo e os trata como fura-fila |

### 2.4 O Ciclo SDD com TDD

```
ESPECIFICAÇÃO → DERIVAÇÃO → TESTES PRIMEIRO → IMPLEMENTAÇÃO → VERIFICAÇÃO → ACEITAÇÃO
   (Spec)        (Derive)    (Test First)     (TDD: RED)      (Verify)      (Accept)
   FASE 0         FASE 1        FASE 2          FASE 3         FASE 4         FASE 5
      │              │             │               │              │              │
  🚧 G0          🚧 G1         🚧 G2           🚧 G3          🚧 G4          🚧 G5
  (Spec          (Arch         (Tests          (All Tests     (Deploy        (Process
   Approved)      Approved)     Authored)       Pass +         Approved)      Improved)
                                                Build Green)
      │              │             │               │              │              │
      │              │         🔴 RED          🟢 GREEN       🔵 REFACTOR      │
      │              │     (QA escreve      (Dev codifica    (Dev refatora)    │
      │              │      testes,          até passar,                         │
      │              │      eles FALHAM)     build verde)                        │
      └──────────────┴─────────────┴───────────────┴──────────────┴──────────────┘
```

**TDD Cycle (interno às FASE 2-3):**
```
QA escreve teste → Teste FALHA (🔴 RED) → Dev escreve código mínimo → Teste PASSA (🟢 GREEN) → Dev refatora → QA confirma
     ↑                                                                                                │
     └────────────────────── próximo cenário Gherkin ─────────────────────────────────────────────────┘
```

---

## 3. PAPÉIS & RESPONSABILIDADES

### 3.1 Product Owner (Humano)
- **Quem:** Operador (você)
- **Responsabilidades:**
  - Define e prioriza milestones
  - Aprova ou rejeita especificações (GATE 0)
  - Aprova ou rejeita arquitetura (GATE 1)
  - Aprova ou rejeita entrega final (GATE 4)
  - Única pessoa que pode liberar Quality Gates manuais
- **Interação:** Comunica-se APENAS com o Maestro

### 3.2 Maestro (Agente Central)
- **Quem:** Claude, atuando como `CLAUDE.md`
- **Como invocar:** O operador se dirige a ele como "Maestro"
- **Responsabilidades:**
  - Orquestrar o ciclo SDD do início ao fim
  - Garantir que nenhum gate seja pulado
  - Detectar proativamente solicitações de fura-fila
  - Acionar agentes especializados na ordem correta
  - Consolidar outputs e reportar ao Product Owner
  - Manter `SOURCE_OF_TRUTH.md`, `memory/session-latest.md` e `docs/SDLC.md`
- **Regra:** O Maestro NUNCA aprova um Quality Gate — apenas o humano aprova

### 3.3 Business Analyst (Agente)
- **Arquivo:** `.claude/agents/business-analyst.md`
- **Quando acionado:** FASE 0 (Specification)
- **Responsabilidades:**
  - Refinar milestones em especificações Gherkin formais
  - Garantir que toda spec é testável e não ambígua
  - Documentar regras de negócio como parte da spec
  - Analisar impacto de fura-filas
- **Entrada:** Milestone do PRD ou solicitação de fura-fila
- **Saída:** Especificação formal em `specs/MXX-nome.spec.md`

### 3.4 Full Stack Developer (Agente)
- **Arquivo:** `.claude/agents/fullstack-dev.md`
- **Quando acionado:** FASE 1 (Derivation) e FASE 3 (Implementation — TDD)
- **Responsabilidades:**
  - Derivar arquitetura da especificação formal
  - Implementar código que faz os testes existentes passarem (TDD: GREEN + REFACTOR)
  - Seguir o ciclo RED→GREEN→REFACTOR por cenário
  - Garantir build e lint verdes
- **Entrada:** Especificação formal aprovada + Testes que falham (da FASE 2)
- **Saída:** Código fonte + deploy preview + todos os testes verdes

### 3.5 QA Engineer (Agente)
- **Arquivo:** `.claude/agents/qa-engineer.md`
- **Quando acionado:** FASE 2 (Test Authoring) e FASE 4 (Verification)
- **Responsabilidades:**
  - Escrever testes E2E e unitários ANTES do código (TDD: RED)
  - Garantir que os testes falham apropriadamente (provando que são válidos)
  - Após implementação, re-executar suite completa para confirmação
  - Reportar bugs com severidade e rastreabilidade à spec
- **Entrada:** Especificação formal + Arquitetura aprovada
- **Saída:** Testes que falham (FASE 2) + Relatório de verificação final (FASE 4)

---

## 4. GOVERNANCE

### 4.1 Human-in-the-Loop (HITL)

**Regra absoluta:** Todo Quality Gate manual (G0, G1, G4) exige ação explícita do Product Owner. O Maestro NUNCA decide "aprovado" pelo humano.

**Protocolo de aprovação:**
1. Maestro apresenta o artefato completo ao Product Owner
2. Maestro faz uma pergunta explícita de aprovação (Sim/Não/Ajustes)
3. Product Owner responde explicitamente
4. Maestro documenta a decisão no `memory/session-latest.md`
5. Se "Ajustes", Maestro retorna o trabalho ao agente relevante com os apontamentos

**⚠️ O Maestro nunca interpreta silêncio ou ambiguidade como aprovação.**

### 4.2 Quality Gates

| Gate | Nome | O que verifica | Quem libera | Automático? |
|------|------|---------------|-------------|-------------|
| **G0** | Spec Approved | Especificação Gherkin completa, sem ambiguidades, todos os cenários cobertos | Product Owner | ❌ Manual |
| **G1** | Architecture Approved | Arquitetura cobre toda a spec, decisões justificadas, sem violações de stack | Product Owner | ❌ Manual |
| **G2** | Tests Authored (RED) | QA escreveu testes E2E + unitários baseados na spec. Testes existem e **FALHAM** (código ainda não implementado). Cobre 100% cenários Gherkin | QA + Maestro | ❌ Manual |
| **G3** | All Tests Pass + Build Green (GREEN) | Dev implementou código que faz TODOS os testes passarem. Build + Lint verdes. Deploy preview funcional. Zero regressões | Automação + Maestro | ⚡ Automático |
| **G4** | Deploy Approved | Homologação manual no deploy preview, smoke test visual, regressão check | Product Owner | ❌ Manual |
| **G5** | Process Improved | Retrospective concluída, melhorias documentadas, SOURCE_OF_TRUTH atualizado, SDLC versionado | Maestro | ❌ Manual |

### 4.3 Regras dos Gates

1. **Um gate fechado bloqueia toda a pipeline.** Nenhum agente avança enquanto o gate atual não estiver `✅ APROVADO`.
2. **Gates não são parciais.** Um gate está 100% aprovado ou está fechado. Não existe "aprovado com ressalvas".
3. **Gates são sequenciais.** G2 só é verificado depois de G1 aprovado. G3 só depois de G2.
4. **Falha em gate automático (G2, G3) retorna ao agente responsável** com o log de falha.
5. **Falha em gate manual (G0, G1, G4) gera ajustes documentados** que o agente deve endereçar.

---

## 5. PROCESSO MAESTRO - AGILE SDD

### FASE 0: Specification
**Agente:** Business Analyst
**Entrada:** Milestone do PRD (`PRD/milestones/MXX-nome.md`)
**Processo:**
1. Maestro carrega o milestone
2. Maestro aciona Business Analyst com o milestone
3. BA escreve especificação Gherkin formal em `specs/MXX-nome.spec.md`
4. BA garante: cada história tem cenários Gherkin, cada regra de negócio está na spec, não há ambiguidades
5. Maestro revisa completude da spec
6. Maestro apresenta spec ao Product Owner para aprovação
**Saída:** `specs/MXX-nome.spec.md`
**Gate:** 🚧 G0 — Spec Approved (Product Owner)

### FASE 1: Derivation
**Agente:** Full Stack Developer
**Entrada:** Especificação formal aprovada (`specs/MXX-nome.spec.md`)
**Processo:**
1. Maestro aciona Full Stack Developer com a spec
2. Dev deriva arquitetura DA especificação (modelo de dados, componentes, rotas)
3. Dev documenta decisões de design com justificativa e rastreabilidade à spec
4. Maestro revisa cobertura: toda spec tem correspondência na arquitetura?
5. Maestro apresenta arquitetura ao Product Owner para aprovação
**Saída:** Arquitetura documentada (no milestone PRD)
**Gate:** 🚧 G1 — Architecture Approved (Product Owner)

### FASE 2: Test Authoring (TDD: RED 🔴)
**Agente:** QA Engineer
**Entrada:** Especificação Gherkin aprovada (G0 ✅) + Arquitetura aprovada (G1 ✅)
**Processo:**
1. QA lê cada cenário Gherkin na especificação
2. QA escreve testes E2E (Playwright) e unitários (Vitest) para TODOS os cenários
3. QA executa os testes — eles DEVEM FALHAR (🔴 RED), pois o código ainda não existe
4. Falha esperada comprova que os testes são válidos (testam o que deveriam)
5. QA garante: 100% dos cenários Gherkin têm teste correspondente
6. QA garante: `data-testid` estão especificados para elementos interativos
7. Maestro verifica G2: testes existem, cobrem 100% da spec, e falham apropriadamente
**Saída:** Testes E2E em `e2e/` + Testes unitários em `tests/` + Lista de `data-testid` esperados
**Gate:** 🚧 G2 — Tests Authored (QA + Maestro)

### FASE 3: Implementation (TDD: GREEN 🟢 + REFACTOR 🔵)
**Agente:** Full Stack Developer
**Entrada:** Testes que falham (FASE 2) + Arquitetura aprovada (FASE 1)
**Processo (TDD loop por cenário):**
1. Dev pega um cenário Gherkin e seu teste correspondente (que está FALHANDO)
2. Dev escreve o **código mínimo** necessário para aquele teste passar (🟢 GREEN)
3. Dev executa o teste — se passar, avança; se falhar, corrige
4. Dev refatora o código mantendo o teste verde (🔵 REFACTOR)
5. Dev repete para o próximo cenário
6. Dev garante: `npm run build` passa, `npm run lint` passa
7. Dev faz deploy preview na Vercel
8. QA re-executa suite completa para confirmar que TUDO passa
**Saída:** Código fonte + deploy preview URL + todos os testes verdes
**Gate:** 🚧 G3 — All Tests Pass + Build Green (Automação + Maestro verifica)

### FASE 4: Verification & Acceptance
**Agente:** QA Engineer (confirmação) + Product Owner (homologação)
**Entrada:** Deploy preview com todos os testes passando (G3 ✅)
**Processo:**
1. Maestro apresenta deploy preview ao Product Owner
2. Product Owner faz homologação manual (smoke test, visual, fluxos)
3. Product Owner aprova ou solicita ajustes
4. Se ajustes: volta à FASE 3 (apenas para os ajustes pontuais no código)
5. Se aprovado: milestone marcado como CONCLUÍDO
**Saída:** Milestone aprovado
**Gate:** 🚧 G4 — Deploy Approved (Product Owner)

### FASE 5: Retrospective
**Agente:** Maestro
**Entrada:** Feedback de todos os agentes e Product Owner
**Processo:**
1. Maestro coleta: O que funcionou? O que melhorar? Ações?
2. Maestro identifica ao menos 1 melhoria concreta no processo
3. Maestro atualiza `docs/SDLC.md` (nova versão)
4. Maestro atualiza `SOURCE_OF_TRUTH.md` se necessário
5. Maestro atualiza `PRD/01-milestones.md` (milestone concluído)
6. Maestro prepara próximo milestone
**Saída:** SDLC atualizado, SOURCE_OF_TRUTH atualizado, próximo milestone apontado
**Gate:** 🚧 G5 — Process Improved (Maestro)

---

## 6. FURA-FILA

### 6.1 O Maestro Detecta

⚠️ **O Product Owner nem sempre avisa que está fazendo um fura-fila.** O Maestro deve **identificar proativamente** quando uma solicitação é um fura-fila e tratá-la como tal.

**Gatilhos de detecção:**
- Solicitação de funcionalidade não prevista no milestone atual
- Mudança de escopo em feature já especificada
- "Já que estamos aqui, aproveita e faz X"
- "Seria bom se também tivesse Y"
- Qualquer adição não mapeada na especificação aprovada

### 6.2 Protocolo de Fura-Fila

1. **DETECTAR:** Maestro identifica que a solicitação é um desvio do milestone atual
2. **SINALIZAR:** Maestro alerta o Product Owner: "⚠️ Isso é um fura-fila. O milestone atual é MXX. Esta feature não está nele."
3. **ANALISAR:** Maestro aciona Business Analyst para análise rápida:
   - Esforço estimado
   - Impacto no milestone atual (dias de atraso)
   - Risco técnico
4. **DECIDIR:** Product Owner escolhe:
   - **A)** Fura-fila agora — milestone atual pausa, fura-fila executa completo (FASE 0→4→5), depois retoma
   - **B)** Próximo milestone — vai para o roadmap após o atual
   - **C)** Backlog — vai para após M08
5. **DOCUMENTAR:**
   - Criar `PRD/fura-fila/FF-XX-nome.md`
   - Registrar no roadmap
   - Salvar progresso do milestone atual antes de pausar

### 6.3 Restrições do Fura-Fila

- Máximo **1 fura-fila ativo** por vez
- Fura-filas **não acumulam** — se outro surgir durante um fura-fila, vai para backlog
- Fura-fila segue o **mesmo SDD completo** (FASE 0→5), sem atalhos
- Milestone pausado retoma **exatamente de onde parou**

---

## 7. DEFINIÇÃO DE PRONTO (Definition of Done)

Um milestone está **PRONTO** quando TODOS os itens abaixo são verdadeiros:

- [ ] **G0:** Especificação Gherkin aprovada pelo Product Owner
- [ ] **G1:** Arquitetura aprovada pelo Product Owner
- [ ] **G2:** Testes escritos (E2E + unitários), cobrem 100% cenários Gherkin, e FALHAM (🔴 RED — código ainda não implementado)
- [ ] **G3:** Todos os testes passam (🟢 GREEN), build e lint sem erros, deploy preview funcional
- [ ] **G4:** Product Owner homologou e aprovou o deploy preview
- [ ] **G5:** Retrospective concluída, SDLC e SoT atualizados
- [ ] Código revisado (não há `any`, secrets, debug code, console.log soltos)
- [ ] Responsivo mobile + tablet + desktop
- [ ] Lighthouse Performance ≥ 80, Accessibility ≥ 90
- [ ] `.env.example` atualizado com novas variáveis

---

## 8. ROADMAP DE MILESTONES

**MVP = FASE 1 (M01 + M02 + M03 + M04)**

| # | Milestone | Fase | Épicos | Status |
|---|-----------|------|--------|--------|
| M00 | Discovery | 0 | — | ⬜ A FAZER |
| M01 | Foundation | 1 | A (Foundation) | ⬜ A FAZER |
| M02 | Catalog + Experience | 1 | B + C (Produto) | ⬜ A FAZER |
| M03 | Cart + Checkout + Customer | 1 | C + D | ⬜ A FAZER |
| M04 | Admin + Operations + Analytics | 1 🎯 MVP | E + F | ⬜ A FAZER |
| M05 | Multi-Theme Experience | 2 | Diferenciação | ⬜ A FAZER |
| M06 | Personalized Customer Area | 2 | Diferenciação | ⬜ A FAZER |
| M07 | Growth Engine | 3 | Escala | ⬜ A FAZER |
| M08 | Scale & Optimize | 3 | Escala | ⬜ A FAZER |

**Detalhamento:** `PRD/milestones/MXX-nome.md`
**Especificações formais:** `specs/MXX-nome.spec.md`
**Fura-filas:** `PRD/fura-fila/`

---

## 9. REFERÊNCIAS AOS ARTEFATOS

| Artefato | Caminho | Papel |
|----------|---------|-------|
| Fonte da Verdade | `SOURCE_OF_TRUTH.md` | ⭐ Canônico — este documento |
| Maestro (orquestrador) | `CLAUDE.md` | Executor do processo |
| Processo SDD detalhado | `docs/SDLC.md` | Especificação do processo |
| Visão do Produto | `PRD/00-visao.md` | Norte do produto, estratégia, objetivos |
| Roadmap de Milestones | `PRD/01-milestones.md` | Planejamento de entregas (Fases 0-3) |
| Escopo Funcional (12 módulos) | `PRD/02-escopo-funcional.md` | Detalhamento dos módulos |
| Modelo de Dados | `PRD/03-modelo-dados.md` | Schema inicial com todas entidades |
| Fluxos Principais | `PRD/04-fluxos.md` | 5 fluxos do negócio |
| Regras de Negócio | `PRD/05-regras-negocio.md` | RNs catalogadas |
| Temas e Experiência | `PRD/06-temas-experiencia.md` | Estratégia de multi-tema |
| Analytics | `PRD/07-analytics.md` | Métricas, eventos, dashboards |
| Riscos e Integrações | `PRD/08-riscos.md` | Riscos mapeados e decisões em aberto |
| Detalhamento Milestone | `PRD/milestones/MXX-nome.md` | Definição do milestone |
| Especificação Formal (Gherkin) | `specs/MXX-nome.spec.md` | Contrato técnico testável |
| Fura-filas | `PRD/fura-fila/` | Emergenciais |
| Sessão Atual | `memory/session-latest.md` | Ponto de parada |
| Agentes | `.claude/agents/` | Definições dos agentes |

---

## 10. CHANGELOG

### v2.0.0 (2026-06-09)
- **PRD completo:** Visão estratégica, 12 módulos, modelo de dados (20+ entidades), fluxos, regras, analytics
- **Roadmap reestruturado:** 4 fases (Discovery → MVP → Diferenciação → Escala), 9 milestones
- **MVP redefinido:** M01-M04 com épicos A-F
- **Experience Engine:** Estratégia de multi-tema documentada
- **Decisões em aberto:** 10 decisões mapeadas para FASE 0
- **Novos artefatos PRD:** Escopo funcional, modelo de dados, fluxos, regras de negócio, analytics, riscos

### v1.1.0 (2026-06-09)
- TDD integrado ao ciclo SDD

### v1.0.0 (2026-06-09)
- Documento canônico criado
