---
marp: true
theme: gaia
class:
  - lead
paginate: true
backgroundColor: '#ffffff'
color: '#1a1a2e'
header: ''
footer: 'Maestro · Agile SDD com TDD'
size: 16:9
style: |
  :root {
    --primary: #2563eb;
    --primary-dark: #1d4ed8;
    --accent: #7c3aed;
    --success: #059669;
    --warning: #d97706;
    --danger: #dc2626;
    --gray-50: #f8fafc;
    --gray-100: #f1f5f9;
    --gray-200: #e2e8f0;
    --gray-400: #94a3b8;
    --gray-600: #475569;
    --gray-800: #1e293b;
    --gray-900: #0f172a;
  }

  section {
    font-family: 'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif;
    color: var(--gray-800);
    padding: 45px 65px;
    font-size: 22px;
    line-height: 1.5;
  }

  section.lead {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    background: linear-gradient(160deg, #ffffff 0%, #f8fafc 40%, #e2e8f0 100%);
  }
  section.lead h1 {
    font-size: 3.8em; font-weight: 800; color: var(--gray-900);
    letter-spacing: -0.03em; margin-bottom: 0; line-height: 1.1;
  }
  section.lead h1 span {
    background: linear-gradient(135deg, var(--primary), var(--accent));
    -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
  }
  section.lead h2 {
    font-size: 1.3em; font-weight: 400; color: var(--gray-600); margin-top: 0.4em;
  }
  section.lead p { color: var(--gray-400); font-size: 0.85em; margin-top: 2em; }

  h1 {
    font-size: 1.9em; font-weight: 700; color: var(--gray-900);
    border-bottom: 3px solid var(--primary); padding-bottom: 0.2em; margin-bottom: 0.5em;
    letter-spacing: -0.02em;
  }
  h2 { font-size: 1.25em; font-weight: 600; color: var(--primary); margin-top: 0.5em; margin-bottom: 0.3em; }
  h3 { font-size: 1.05em; font-weight: 600; color: var(--gray-800); }

  table {
    width: 100%; border-collapse: separate; border-spacing: 0; margin: 0.8em 0;
    font-size: 0.8em; border-radius: 10px; overflow: hidden;
    box-shadow: 0 1px 3px rgba(0,0,0,0.08);
  }
  thead th {
    background: var(--gray-900); color: white; padding: 9px 14px;
    font-weight: 600; font-size: 0.88em; text-align: left; letter-spacing: 0.01em;
  }
  tbody td { padding: 8px 14px; border-bottom: 1px solid var(--gray-200); background: white; }
  tbody tr:last-child td { border-bottom: none; }
  tbody tr:nth-child(even) td { background: var(--gray-50); }

  code {
    background: var(--gray-100); color: var(--danger); padding: 2px 7px;
    border-radius: 4px; font-size: 0.85em;
    font-family: 'JetBrains Mono', 'Cascadia Code', monospace;
  }
  pre {
    background: var(--gray-900); color: #e2e8f0; padding: 14px 18px;
    border-radius: 10px; font-size: 0.66em; line-height: 1.5; overflow-x: auto;
  }
  pre code { background: transparent; color: inherit; padding: 0; font-size: 1em; }

  .callout {
    padding: 12px 18px; border-radius: 10px; margin: 0.6em 0;
    font-size: 0.85em; border-left: 4px solid; line-height: 1.5;
  }
  .c-info  { background: #eff6ff; border-color: var(--primary); color: #1e40af; }
  .c-warn  { background: #fffbeb; border-color: var(--warning); color: #92400e; }
  .c-ok    { background: #ecfdf5; border-color: var(--success); color: #065f46; }
  .c-err   { background: #fef2f2; border-color: var(--danger); color: #991b1b; }
  .c-red   { background: #fef2f2; border-color: #ef4444; color: #991b1b; }
  .c-green { background: #f0fdf4; border-color: #22c55e; color: #065f46; }
  .c-blue  { background: #eff6ff; border-color: #3b82f6; color: #1e40af; }
  .callout strong { color: inherit; font-weight: 700; }

  .cols  { display: grid; grid-template-columns: 1fr 1fr; gap: 28px; }
  .cols-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 18px; }

  .card {
    background: white; border: 1px solid var(--gray-200);
    border-radius: 12px; padding: 16px 20px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.04);
  }
  .card h3 { margin-top: 0; font-size: 0.95em; }
  .card p { font-size: 0.82em; color: var(--gray-600); margin: 0.3em 0 0 0; }

  .tag {
    display: inline-block; padding: 2px 9px; border-radius: 20px;
    font-size: 0.68em; font-weight: 700; letter-spacing: 0.03em;
  }
  .t-red    { background: #fef2f2; color: var(--danger); }
  .t-green  { background: #ecfdf5; color: var(--success); }
  .t-blue   { background: #eff6ff; color: var(--primary); }
  .t-purple { background: #f5f3ff; color: var(--accent); }

  .big-num {
    font-size: 3.2em; font-weight: 800; line-height: 1;
    color: var(--primary); letter-spacing: -0.03em;
  }

  ul, ol { line-height: 1.65; }
  li { margin-bottom: 0.15em; }
  li::marker { color: var(--primary); }

  blockquote {
    border-left: 4px solid var(--primary); background: var(--gray-50);
    padding: 10px 18px; margin: 0.7em 0; border-radius: 0 8px 8px 0;
    font-style: italic; color: var(--gray-600);
  }
---

<!-- _class: lead -->

# <span>Maestro</span>
## Agile SDD com TDD

Framework de orquestração de desenvolvimento
com múltiplos agentes de IA

*Specification-Driven · Test-Driven · Human-in-the-Loop*

---

# Quem Sou Eu

<div class="callout c-info">

**Esta apresentação ensina qualquer pessoa — com ou sem conhecimento técnico — a usar o Maestro Agile SDD com TDD para desenvolver software com qualidade garantida.**

</div>

## O que você vai aprender

<div class="cols">
<div>

1. O problema que o Maestro resolve
2. Os 5 papéis: PO, Maestro, BA, Dev, QA
3. Os 5 valores e 7 princípios
4. SDD + TDD: especificação E testes antes do código

</div>
<div>

5. Os 6 Quality Gates e o ciclo TDD (RED → GREEN → REFACTOR)
6. Human-in-the-Loop: você sempre aprova
7. Fura-fila com detecção proativa
8. Como começar um projeto do zero

</div>
</div>

---

# O Problema Que o Maestro Resolve

<div class="cols">
<div>

### Sem Orquestração ❌

<div class="callout c-err">
<strong>Caos de requisitos</strong><br>
Features sem especificação. Ninguém sabe o que entregar.
</div>

<div class="callout c-err">
<strong>Testes depois do código</strong><br>
"Funcionou na minha máquina." Testes viram obrigação burocrática, não ferramenta de design.
</div>

<div class="callout c-err">
<strong>Zero rastreabilidade</strong><br>
Impossível saber qual requisito originou qual código.
</div>

<div class="callout c-err">
<strong>Memória zero</strong><br>
Cada sessão começa do zero.
</div>

</div>
<div>

### Com Maestro Agile SDD + TDD ✅

<div class="callout c-ok">
<strong>Specification-First</strong><br>
Toda feature nasce como Gherkin formal. Spec é contrato.
</div>

<div class="callout c-ok">
<strong>Test-Driven Development</strong><br>
Testes são escritos ANTES do código. 🔴RED → 🟢GREEN → 🔵REFACTOR.
</div>

<div class="callout c-ok">
<strong>Rastreabilidade total</strong><br>
Spec → Teste → Código. Tudo linkado.
</div>

<div class="callout c-ok">
<strong>Memória persistente</strong><br>
`memory/session-latest.md` registra cada iteração.
</div>

</div>
</div>

---

# Por Que TDD?

### Test-Driven Development: escrever o teste ANTES do código

```
Abordagem tradicional:
  Escrever código → (Torcer para funcionar) → Escrever teste → Corrigir bugs

Abordagem TDD:
  Escrever teste → Teste FALHA (RED) → Escrever código mínimo → Teste PASSA (GREEN) → Refatorar
       ↑                                                              ↓
       └──────────────── próximo cenário ──────────────────────────────┘
```

<div class="cols" style="margin-top: 1em;">
<div>

**TDD garante:**
- ✅ Código só existe se há teste que o justifique
- ✅ Zero código desnecessário (YAGNI)
- ✅ Design guiado por uso real, não por especulação
- ✅ Refatoração segura (testes pegam regressão)
- ✅ Cobertura de testes naturalmente alta

</div>
<div>

**Sem TDD:**
- ❌ Testes escritos depois viram viés de confirmação
- ❌ Código testa o código, não o requisito
- ❌ "Funciona" sem saber se é o que deveria funcionar
- ❌ Refatoração é arriscada (sem rede de segurança)

</div>
</div>

---

# O Documento Canônico

<div class="callout c-warn">
<strong>SOURCE_OF_TRUTH.md</strong> é o documento mais importante do projeto. Em caso de conflito entre qualquer artefato, ele vence. Sempre.
</div>

### O que contém

| Seção | Conteúdo |
|-------|----------|
| **1. Identidade** | Nome, pitch, stack, idioma, público-alvo |
| **2. Metodologia** | Maestro Agile SDD com TDD, valores, princípios, ciclo |
| **3. Papéis** | Product Owner, Maestro, BA, Dev, QA — funções e fases |
| **4. Governance** | HITL obrigatório, 6 Quality Gates, protocolo de aprovação |
| **5. Processo** | 6 fases com TDD, entradas, saídas e gates |
| **6. Fura-fila** | Detecção proativa, protocolo, restrições |
| **7. DoD** | Definition of Done — checklist para milestone completo |
| **8. Roadmap** | Milestones mapeados com prioridades e status |
| **9. Referências** | Links para todos os artefatos complementares |

---

# Os 5 Papéis

<table>
<thead>
<tr><th>Papel</th><th>Quem</th><th>Fases</th><th>Responsabilidade</th></tr>
</thead>
<tbody>
<tr>
<td>👑 <strong>Product Owner</strong></td>
<td>Você (humano)</td>
<td>G0, G1, G5</td>
<td>Visão do produto, prioridades, aprova gates manuais</td>
</tr>
<tr>
<td>🎭 <strong>Maestro</strong></td>
<td>Claude (IA)</td>
<td>Todas</td>
<td>Orquestra o ciclo, garante gates, detecta fura-fila, mantém memória</td>
</tr>
<tr>
<td>📋 <strong>Business Analyst</strong></td>
<td>Agente IA</td>
<td>FASE 0</td>
<td>Transforma milestones em especificações Gherkin formais</td>
</tr>
<tr>
<td>💻 <strong>Full Stack Dev</strong></td>
<td>Agente IA</td>
<td>FASE 1 + FASE 3</td>
<td>Deriva arquitetura da spec + Implementa código que faz testes passarem (TDD)</td>
</tr>
<tr>
<td>🧪 <strong>QA Engineer</strong></td>
<td>Agente IA</td>
<td>FASE 2 + FASE 4</td>
<td>Escreve testes ANTES do código (RED) + Confirma deploy preview</td>
</tr>
</tbody>
</table>

<div class="callout c-warn">
<strong>Regra de comunicação:</strong> Product Owner ↔ Maestro ↔ Agentes. Nunca se pula hierarquia.
</div>

---

# Os 5 Valores

<div class="cols">
<div>

<div class="card">
<h3>📐 Specification First</h3>
<p>Nada é implementado sem spec Gherkin aprovada. A spec é o contrato.</p>
</div>

<div class="card">
<h3>🧪 Test First (TDD)</h3>
<p>Testes são escritos ANTES do código. 🔴RED → 🟢GREEN → 🔵REFACTOR. Código sem teste é código que não deveria existir.</p>
</div>

<div class="card">
<h3>👤 Human in the Loop</h3>
<p>Toda decisão de avanço é bloqueada até um humano liberar. Automação informa; humano decide.</p>
</div>

</div>
<div>

<div class="card">
<h3>🛡️ Quality Non-Negotiable</h3>
<p>Nenhum gate pode ser bypassado. Gate fechado = STOP.</p>
</div>

<div class="card">
<h3>🔄 Continuous Improvement</h3>
<p>Cada ciclo termina com uma melhoria concreta no processo. O framework evolui a cada sprint.</p>
</div>

</div>
</div>

---

# Os 7 Princípios

| # | Princípio | Na prática |
|---|-----------|------------|
| **P1** | Spec é contrato | O que está na spec Gherkin É o que será implementado e testado |
| **P2** | Testes primeiro | Teste existe antes do código. Se não tem teste, não tem código |
| **P3** | Gate fechado = STOP | Nenhum agente avança com gate atual fechado |
| **P4** | Uma fonte da verdade | `SOURCE_OF_TRUTH.md` é canônico; todo outro documento é subordinado |
| **P5** | Approval é humano | Build verde e testes passando informam, mas não decidem por você |
| **P6** | Falhe rápido | Erro na FASE 0 custa 10x menos que na FASE 3 |
| **P7** | Fura-fila é detectado | Maestro identifica desvios proativamente; PO não precisa saber o termo |

---

# O Ciclo SDD com TDD

```
┌──────────────────────────────────────────────────────────────────────────────────────┐
│                         MAESTRO · AGILE SDD COM TDD                                    │
│                                                                                        │
│  FASE 0          FASE 1          FASE 2             FASE 3           FASE 4    FASE 5 │
│  SPECIFICATION → DERIVATION  →  TEST AUTHORING  →  IMPLEMENTATION →  VERIFY  → ACCEPT │
│                                                                                        │
│  ┌─────────┐    ┌─────────┐     ┌─────────┐       ┌─────────┐      ┌───────┐ ┌──────┐│
│  │   📋    │    │   💻    │     │   🧪    │       │   💻    │      │ 🧪👑  │ │ 👑🎭 ││
│  │   BA    │    │   Dev   │     │   QA    │       │   Dev   │      │QA + PO│ │PO+Maes││
│  │ Escreve │    │ Deriva  │     │ Escreve │       │Codifica │      │Confirma│ │Homolog││
│  │ spec    │    │arquitet.│     │ testes  │       │p/ testes│      │preview │ │preview││
│  │ Gherkin │    │da spec  │     │ (FALHAM)│       │passarem │      │        │ │       ││
│  └────┬────┘    └────┬────┘     └────┬────┘       └────┬────┘      └───┬───┘ └──┬───┘│
│       │              │              │                  │               │         │     │
│    🚧 G0          🚧 G1          🚧 G2              🚧 G3           🚧 G4     🚧 G5  │
│    MANUAL         MANUAL         MANUAL             AUTO            AUTO     MANUAL  │
│    (PO)           (PO)           (QA+Maestro)       (CI)            (CI+QA)  (PO)    │
│       │              │              │                  │               │         │     │
│       │              │          🔴 RED           🟢 GREEN         🔵 CONFIRM    │     │
│       │              │      (testes falham)   (código mínimo)   (QA re-executa) │     │
│                                                                              │     │
│                                                          FASE 6              │     │
│                                                          RETROSPECTIVE ←─────┘     │
│                                                          🚧 G6 MANUAL (Maestro)    │
└──────────────────────────────────────────────────────────────────────────────────────┘
```

---

# O Ciclo TDD (Interno às Fases 2-3)

<div style="display: flex; align-items: center; justify-content: center; gap: 20px; margin: 1em 0; font-size: 1.1em;">

<div style="text-align: center; background: #fef2f2; padding: 24px; border-radius: 16px; border: 3px solid #ef4444; min-width: 140px;">
<div style="font-size: 2.5em;">🔴</div>
<div style="font-weight: 800; color: #dc2626; font-size: 1.2em;">RED</div>
<div style="color: #991b1b; font-size: 0.8em; margin-top: 4px;">FASE 2</div>
<div style="color: #991b1b; font-size: 0.75em;">QA escreve teste</div>
<div style="color: #991b1b; font-size: 0.75em;">Teste FALHA</div>
</div>

<div style="font-size: 2em; color: var(--gray-400);">→</div>

<div style="text-align: center; background: #f0fdf4; padding: 24px; border-radius: 16px; border: 3px solid #22c55e; min-width: 140px;">
<div style="font-size: 2.5em;">🟢</div>
<div style="font-weight: 800; color: #16a34a; font-size: 1.2em;">GREEN</div>
<div style="color: #065f46; font-size: 0.8em; margin-top: 4px;">FASE 3</div>
<div style="color: #065f46; font-size: 0.75em;">Dev escreve código</div>
<div style="color: #065f46; font-size: 0.75em;">mínimo para passar</div>
</div>

<div style="font-size: 2em; color: var(--gray-400);">→</div>

<div style="text-align: center; background: #eff6ff; padding: 24px; border-radius: 16px; border: 3px solid #3b82f6; min-width: 140px;">
<div style="font-size: 2.5em;">🔵</div>
<div style="font-weight: 800; color: #2563eb; font-size: 1.2em;">REFACTOR</div>
<div style="color: #1e40af; font-size: 0.8em; margin-top: 4px;">FASE 3</div>
<div style="color: #1e40af; font-size: 0.75em;">Dev otimiza código</div>
<div style="color: #1e40af; font-size: 0.75em;">Teste continua 🟢</div>
</div>

</div>

<div style="text-align: center; margin-top: 15px;">

**Repete para cada cenário Gherkin até todos passarem → G3 ✅**

</div>

<div class="callout c-info">
<strong>Princípio fundamental do TDD:</strong> Você só escreve código de produção se existe um teste FALHANDO que o justifique. Se não tem teste, não tem feature.
</div>

---

# Os 6 Quality Gates

<table>
<thead>
<tr><th>Gate</th><th>Nome</th><th>Fase</th><th>Verifica</th><th>Quem</th><th>Tipo</th></tr>
</thead>
<tbody>
<tr>
<td><span class="tag t-red">G0</span></td>
<td><strong>Spec Approved</strong></td>
<td>FASE 0</td>
<td>Gherkin 100% completo, zero ambiguidades</td>
<td>👑 PO</td>
<td><span class="tag t-red">MANUAL</span></td>
</tr>
<tr>
<td><span class="tag t-red">G1</span></td>
<td><strong>Architecture Approved</strong></td>
<td>FASE 1</td>
<td>Arquitetura cobre toda a spec, decisões justificadas</td>
<td>👑 PO</td>
<td><span class="tag t-red">MANUAL</span></td>
</tr>
<tr>
<td><span class="tag t-blue">G2</span></td>
<td><strong>Tests Authored (RED)</strong></td>
<td>FASE 2</td>
<td>Testes E2E+unitários escritos, cobrem 100% spec, e <strong>FALHAM</strong></td>
<td>🧪 QA + 🎭</td>
<td><span class="tag t-blue">MANUAL</span></td>
</tr>
<tr>
<td><span class="tag t-green">G3</span></td>
<td><strong>All Tests Pass + Build Green</strong></td>
<td>FASE 3</td>
<td>TODOS os testes passam + build + lint + deploy preview</td>
<td>⚡ CI</td>
<td><span class="tag t-green">AUTO</span></td>
</tr>
<tr>
<td><span class="tag t-green">G4</span></td>
<td><strong>Verification Passed</strong></td>
<td>FASE 4</td>
<td>QA confirma suite no deploy preview, 0 bugs críticos</td>
<td>🧪 QA</td>
<td><span class="tag t-green">AUTO</span></td>
</tr>
<tr>
<td><span class="tag t-red">G5</span></td>
<td><strong>Deploy Approved</strong></td>
<td>FASE 5</td>
<td>Homologação manual no deploy preview</td>
<td>👑 PO</td>
<td><span class="tag t-red">MANUAL</span></td>
</tr>
</tbody>
</table>

<div class="callout c-warn" style="margin-top: 0.8em;">
<strong>+ G6 (Process Improved):</strong> Retrospective concluída, melhoria documentada. Liberado pelo 🎭 Maestro.
</div>

---

# Por Que G2 é "Tests Authored (RED)"?

<div class="cols">
<div>

### G2 não verifica código. Verifica TESTES.

O G2 é um gate **anterior à implementação**. O QA entrega:
- Testes E2E para 100% dos cenários Gherkin
- Testes unitários para lógica crítica
- Todos os testes **FALHAM** — e isso é bom

**Por que a falha é necessária?**
- Prova que o teste é válido (testa algo real)
- Se um teste passar antes do código existir, ele está errado
- A falha é a prova de que o teste vai detectar quando a feature estiver OK

</div>
<div>

### Exemplo de relatório G2

```
🧪 G2 Report — M01 Fundação

Status: 🔴 RED (esperado)
Total tests: 48
Passing: 0
Failing: 48 ✅ (todos falham apropriadamente)

Cobertura Gherkin: 22/22 cenários (100%)
E2E specs: 6 (1 por feature)
Unit specs: 4 (lib, hooks, actions)
Viewports: 375px, 768px, 1280px

data-testid documentados: 34
Page Objects: HomePage, LayoutPage

✅ G2 APROVADO — testes prontos para FASE 3
```

</div>
</div>

---

# FASE 0 — Specification

### O Business Analyst transforma milestones em Gherkin

**Entrada:** Milestone do PRD  
**Saída:** `specs/MXX-nome.spec.md`  
**Gate:** 🚧 G0 — Product Owner aprova

```gherkin
## FEATURE 4: Tema Visual Base
**Como** visitante da loja
**Quero** ver uma loja com identidade visual profissional
**Para** confiar na qualidade da plataforma

### Cenário 4.1: Tema segue o sistema (happy path)
DADO que o visitante acessa a loja pela primeira vez
E o sistema operacional está configurado com tema escuro
QUANDO a página for carregada
ENTÃO o tema escuro deve ser aplicado automaticamente
E deve existir um botão de toggle para alternar para tema claro

### Cenário 4.2: Alternância manual (edge case)
DADO que o visitante está no tema escuro
QUANDO o toggle de tema for clicado
ENTÃO o tema deve alternar para claro em menos de 100ms
E não deve haver flicker visual durante a transição
```

> 💡 **Gherkin = contrato testável.** Tudo que está aqui SERÁ testado na FASE 2.

---

# FASE 1 — Derivation

### O Dev DERIVA arquitetura da spec. Sem código ainda.

<div class="cols">
<div>

**Processo:**
1. Dev lê cada cenário Gherkin
2. Para cada feature, projeta:
   - Schema Prisma
   - Estrutura de rotas
   - Árvore de componentes
   - Fluxo de dados
3. Documenta com rastreabilidade
4. PO aprova G1

</div>
<div>

**Exemplo de rastreabilidade:**
```markdown
## Decisão: Tabela Product

### Atende aos cenários:
- 6.3: Grid de produtos (name, price, images)
- 2.1: Listagem com filtros (categoryId)
- 2.2: Detalhe (description)

### Schema:
- id, name, slug, description
- price: Decimal
- images: String[] (Blob URLs)
- categoryId: FK → Category
```

</div>
</div>

<div class="callout c-info">
<strong>Gate G1:</strong> PO aprova arquitetura. Nenhum código foi escrito ainda.
</div>

---

# FASE 2 — Test Authoring (TDD: RED 🔴)

### ⚠️ O QA escreve testes. ZERO código de aplicação.

<div class="cols">
<div>

**Processo:**
1. QA lê spec Gherkin + arquitetura
2. Para CADA cenário, escreve teste
3. Executa → 🔴 FALHA (esperado!)
4. Documenta `data-testid` esperados
5. Garante 100% cobertura

**Entregáveis:**
- `e2e/specs/*.spec.ts` (Playwright)
- `tests/unit/*.test.ts` (Vitest)
- Lista de `data-testid`
- Relatório RED

</div>
<div>

**Exemplo de teste (escrito ANTES do código):**
```typescript
// e2e/specs/home.spec.ts
// Este teste FALHA agora — a Home Page
// ainda não foi implementada!

test('Cenário 6.1: Hero Section', async ({ page }) => {
  const home = new HomePage(page);
  await home.goto();

  // 🔴 RED: elementos não existem ainda
  await expect(home.heroTitle).toBeVisible();
  await expect(home.ctaButton)
    .toHaveText('Ver Produtos');
});
```

</div>
</div>

<div class="callout c-red">
<strong>Gate G2:</strong> QA entrega testes que FALHAM. Maestro verifica cobertura (100% spec). Se passarem sem código → voltar e corrigir.
</div>

---

# FASE 3 — Implementation (TDD: GREEN 🟢 + REFACTOR 🔵)

### O Dev recebe testes FALHANDO e faz eles passarem

<div class="cols">
<div>

**TDD Loop (por cenário):**

1. Pegue 1 cenário → veja o teste 🔴
2. Escreva **código mínimo** para passar
3. Execute → 🟢 GREEN? Avança. 🔴? Corrige.
4. 🔵 REFACTOR: otimize mantendo 🟢
5. Próximo cenário

**Regras:**
- Nunca escreva código sem teste falhando
- Código mínimo = YAGNI (You Aren't Gonna Need It)
- Refatore só depois do verde

</div>
<div>

**Após todos os cenários:**
```bash
npm run build    # deve passar
npm run lint     # deve passar
# Deploy na Vercel
```

**Padrões:**
- ✅ TypeScript strict, nunca `any`
- ✅ `data-testid` nos elementos
- ✅ Responsivo (375, 768, 1280)
- ✅ Server Components por padrão
- ✅ `loading.tsx` + `error.tsx`

</div>
</div>

<div class="callout c-green">
<strong>Gate G3 (automático):</strong> TODOS os testes passam + build verde + lint verde + deploy preview funcional. CI verifica.
</div>

---

# TDD na Prática — Exemplo de Sessão

<div class="callout c-red">
<strong>QA (FASE 2):</strong> "Maestro, G2 pronto. 48 testes escritos. Todos FALHAM 🔴. Cobertura: 22/22 cenários Gherkin."
</div>

<div class="callout c-info">
<strong>Maestro:</strong> "G2 ✅ Tests Authored. Dev, receba os testes. Eles estão em RED. Faça-os passar."
</div>

<div class="callout c-warn">
<strong>Dev (FASE 3):</strong> "Cenário 6.1: Hero Section. Teste espera `heroTitle` visível. Vou criar o componente Hero com `data-testid='hero-title'`."
</div>

<div class="callout c-green">
<strong>Dev:</strong> "Executei o teste do Cenário 6.1. 🟢 GREEN. Refatorei o CSS. Continuo 🟢. Próximo cenário."
</div>

<div class="callout c-info">
<strong>Dev:</strong> "Maestro, 48/48 testes passando 🟢. Build verde. Deploy preview: https://m01.vercel.app. G3 pronto."
</div>

<div class="callout c-ok">
<strong>Maestro:</strong> "G3 ✅ All Tests Pass. QA, FASE 4: confirme no deploy preview."
</div>

---

# FASE 4 — Verification

### QA confirma que deploy preview passa em tudo

<div class="cols">
<div>

**QA re-executa:**
1. Suite E2E no deploy preview
2. Smoke test manual rápido
3. Screenshots de regressão visual
4. Lighthouse audit

**Classificação de bugs:**

| Severidade | Critério | Bloqueia? |
|-----------|----------|:---:|
| 🔴 Crítica | Feature quebrada | SIM |
| 🟠 Alta | Falha grave | SIM |
| 🟡 Média | Limitação | NÃO |
| 🟢 Baixa | Cosmético | NÃO |

</div>
<div>

**Checklist G4:**
- [ ] Suite E2E 100% no deploy preview
- [ ] Smoke test sem surpresas
- [ ] Sem regressão visual
- [ ] Lighthouse ≥ 80 / ≥ 90
- [ ] 0 bugs 🔴 ou 🟠 abertos

**Se houver bugs:**
→ Maestro aciona Dev (FASE 3)
→ Dev corrige (TDD: teste já existe!)
→ QA re-verifica

</div>
</div>

---

# FASE 5 — Acceptance

### Product Owner homologa no deploy preview real

**Roteiro de homologação:**
1. 🎭 Maestro fornece URL do deploy preview
2. 👑 PO testa fluxos principais
3. 👑 PO verifica responsividade
4. 👑 PO faz teste exploratório
5. 👑 PO decide

<div class="cols" style="margin-top: 1em;">
<div class="callout c-ok">
<strong>✅ APROVADO</strong><br>
Milestone concluído! Maestro marca como CONCLUÍDO e prepara próximo.
</div>
<div class="callout c-warn">
<strong>🔄 AJUSTES</strong><br>
Correções pontuais. Volta à FASE 3. Se forem features NOVAS, é fura-fila.
</div>
</div>

---

# FASE 6 — Retrospective

### O framework melhora a cada ciclo

**Maestro coleta feedback de todos:**
- 📋 BA: A spec estava clara?
- 🧪 QA: Os testes capturaram bem os requisitos?
- 💻 Dev: O TDD fluiu bem? Houve retrabalho?
- 👑 PO: Os gates fizeram sentido?

**Maestro identifica ≥1 melhoria concreta e atualiza:**
- `docs/SDLC.md` → nova versão
- `SOURCE_OF_TRUTH.md` → se necessário
- `PRD/01-milestones.md` → milestone ✅
- `memory/session-latest.md` → próximo

> 💡 **Cada ciclo DEVE produzir ao menos 1 melhoria no processo.**

---

# Fura-Fila Com TDD

### O Maestro DETECTA. Você não precisa avisar.

<div class="callout c-err">
<strong>⚠️ O Product Owner não precisa conhecer o termo "fura-fila".</strong> O Maestro identifica proativamente quando algo está fora do milestone e age.
</div>

**Gatilhos de detecção:**
- Feature não listada no milestone atual
- "Já que estamos aqui, faz X"
- "Seria bom ter Y"
- Qualquer adição fora da spec Gherkin aprovada

**Protocolo:**
1. 🎭 **DETECTA** e **SINALIZA** imediatamente
2. 📋 BA analisa impacto (esforço, atraso, risco)
3. 👑 PO decide: **A)** Fura-fila agora **B)** Próximo milestone **C)** Backlog
4. Se aprovado: milestone atual pausa, fura-fila executa FASES 0→6, milestone retoma

> 💡 Fura-fila segue o **mesmo ciclo TDD**. Sem atalhos. Testes primeiro, código depois.

---

# Definition of Done

<div class="callout c-info">
<strong>Um milestone só está PRONTO quando TODOS os itens são verdadeiros.</strong>
</div>

| # | Critério | Gate |
|:---:|---|:---:|
| 1 | Especificação Gherkin aprovada pelo Product Owner | G0 ✅ |
| 2 | Arquitetura aprovada pelo Product Owner | G1 ✅ |
| 3 | Testes E2E+unitários escritos, cobrem 100% spec, e FALHAM (RED) | G2 ✅ |
| 4 | TODOS os testes passam + build + lint verdes + deploy preview | G3 ✅ |
| 5 | QA confirmou deploy preview, 0 bugs críticos/altos | G4 ✅ |
| 6 | Product Owner homologou e aprovou | G5 ✅ |
| 7 | Retrospective concluída, SDLC e SoT atualizados | G6 ✅ |
| 8 | Código limpo: sem `any`, sem secrets, sem debug | — |
| 9 | Responsivo: 375px, 768px, 1280px | — |
| 10 | Lighthouse: Performance ≥ 80, Accessibility ≥ 90 | — |

---

# Estrutura de Arquivos

```
meu-projeto/
├── SOURCE_OF_TRUTH.md          ⭐ Comece aqui. Sempre. É canônico.
├── CLAUDE.md                   🎭 O Maestro. Lê o SoT toda interação.
│
├── specs/                      📋 Especificações Gherkin (contrato)
│   └── M01-fundacao.spec.md    22 cenários, 6 features
│
├── e2e/                        🧪 Testes E2E (Playwright) — escritos ANTES
│   ├── pages/                  Page Object Models
│   └── specs/                  1 spec por feature Gherkin
│
├── tests/                      🧪 Testes unitários (Vitest) — escritos ANTES
│   ├── unit/                   Funções, hooks, utilitários
│   └── integration/            Componentes, Server Actions
│
├── PRD/                        📦 Product Requirements
│   ├── 00-visao.md             Visão, métricas, stakeholders
│   ├── 01-milestones.md        Roadmap com status
│   ├── milestones/             Detalhamento por milestone
│   └── fura-fila/              Emergenciais
│
├── docs/
│   ├── SDLC.md                 Processo completo (versionado)
│   └── maestro-agile-sdd-apresentacao.md
│
├── memory/
│   ├── session-latest.md       Onde paramos
│   └── project-overview.md     Memória do projeto
│
└── .claude/agents/             Definições dos agentes
    ├── business-analyst.md     📋 BA: FASE 0
    ├── fullstack-dev.md        💻 Dev: FASE 1 + FASE 3
    └── qa-engineer.md          🧪 QA: FASE 2 + FASE 4
```

---

# Exemplos de Interação

<div class="callout c-ok">
<strong>Aprovando gates</strong><br>
👑 <em>"Maestro, spec aprovada. Avança."</em><br>
🎭 <em>"G0 ✅ Spec Approved. Acionando Dev para FASE 1."</em>
</div>

<div class="callout c-warn">
<strong>Solicitando ajustes</strong><br>
👑 <em>"Adiciona cenário de erro na Feature 2: banco offline."</em><br>
🎭 <em>"Ajuste registrado. BA, refinar spec M01 com cenário de erro. Re-submeto G0."</em>
</div>

<div class="callout c-err">
<strong>Maestro bloqueia avanço prematuro</strong><br>
👑 <em>"Já manda o Dev codificar."</em><br>
🎭 <em>"Não posso. 🚧 G2 pendente. QA ainda não escreveu os testes. Testes primeiro, código depois. FASE 2 → G2 → depois FASE 3."</em>
</div>

<div class="callout c-blue">
<strong>Fura-fila detectado</strong><br>
👑 <em>"Aproveita e adiciona Página Sobre."</em><br>
🎭 <em>"⚠️ Fura-fila. M01 não inclui Sobre. +1 dia. Opções: A) Agora B) Próximo C) Backlog?"</em>
</div>

---

# Exemplo de Sessão Completa (TDD)

```
👑 "Maestro, começar M01."

🎭 "📊 M01 | FASE 0 | 🚧 G0 pendente.
    Spec tem 22 cenários Gherkin. Aprova?"

👑 "Aprovado."

🎭 "G0 ✅. FASE 1: Dev derivando arquitetura."

[1 iteração depois]

🎭 "G1 ✅. Arquitetura aprovada. FASE 2: QA escrevendo testes."

[1 iteração depois]

🎭 "🧪 QA: 48 testes escritos. Todos 🔴 RED.
    Cobertura: 22/22 cenários Gherkin. G2 pronto."

🎭 "G2 ✅. FASE 3: Dev, testes estão em RED. Faça-os passar."

[2 iterações depois]

🎭 "💻 Dev: 48/48 🟢 GREEN. Build verde. Deploy preview online."

🎭 "G3 ✅. FASE 4: QA, confirme no deploy preview."

🎭 "🧪 QA: Suite 100% OK. 0 bugs. G4 ✅."

🎭 "FASE 5: Deploy preview https://m01.vercel.app. Homologa?"
```

---

# O Que o Maestro NÃO Deixa Acontecer

<div class="cols">
<div>

### ❌ Bloqueios ativos

- Pular uma fase do SDD
- Implementar sem spec Gherkin (G0)
- Codificar antes dos testes (G2)
- Avançar com testes falhando
- Fazer deploy com bug crítico
- Tratar fura-fila como "ajuste"
- Aprovar gate sem PO explícito
- Perder contexto entre sessões

</div>
<div>

### ✅ Garantias

- Toda feature nasce na spec
- Testes ANTES do código
- Código mínimo (YAGNI)
- Product Owner aprova cada gate manual
- Build e lint sempre verdes
- Deploy preview para homologação
- Memória entre sessões
- Rastreabilidade total

</div>
</div>

---

# Adaptando Para Qualquer Projeto

<div class="callout c-info">
O Maestro Agile SDD com TDD é <strong>agnóstico a stack e domínio</strong>.
</div>

### O que customizar vs. O que é universal

| Customizável por projeto | Universal (nunca muda) |
|--------------------------|------------------------|
| Stack (Next.js → Django, Flutter, etc.) | 5 valores e 7 princípios |
| Agentes (Dev pode ser iOS, Data, etc.) | TDD: Testes antes do código |
| Milestones (domínio do negócio) | 6 Quality Gates (G0-G5) |
| Checklists internos dos gates | Human-in-the-Loop |
| Nomes de pastas e arquivos | Product Owner ↔ Maestro ↔ Agentes |
| | Memória de sessão |

---

# O Framework em Números

<div class="cols-3">

<div style="text-align: center; padding: 25px 0;">
<div class="big-num">5</div>
<p style="color: var(--gray-600); font-size: 0.85em;">Valores<br>imutáveis</p>
</div>

<div style="text-align: center; padding: 25px 0;">
<div class="big-num">7</div>
<p style="color: var(--gray-600); font-size: 0.85em;">Princípios<br>de governança</p>
</div>

<div style="text-align: center; padding: 25px 0;">
<div class="big-num">6</div>
<p style="color: var(--gray-600); font-size: 0.85em;">Quality Gates<br>bloqueantes</p>
</div>

<div style="text-align: center; padding: 25px 0;">
<div class="big-num">5</div>
<p style="color: var(--gray-600); font-size: 0.85em;">Papéis<br>especializados</p>
</div>

<div style="text-align: center; padding: 25px 0;">
<div class="big-num">6</div>
<p style="color: var(--gray-600); font-size: 0.85em;">Fases<br>do ciclo SDD</p>
</div>

<div style="text-align: center; padding: 25px 0;">
<div class="big-num">10</div>
<p style="color: var(--gray-600); font-size: 0.85em;">Critérios<br>no DoD</p>
</div>

</div>

<div style="text-align: center; margin-top: 15px;">

### 🔴 RED → 🟢 GREEN → 🔵 REFACTOR · MVP em 4 sprints · Qualidade garantida

</div>

---

# Glossário

| Termo | Significado |
|-------|-------------|
| **Maestro** | Agente IA central que orquestra o ciclo SDD |
| **SDD** | Specification-Driven Development — a spec é o artefato central |
| **TDD** | Test-Driven Development — testes escritos ANTES do código |
| **RED** | 🔴 FASE 2: QA escreve testes que FALHAM (código não existe) |
| **GREEN** | 🟢 FASE 3: Dev escreve código mínimo que faz o teste passar |
| **REFACTOR** | 🔵 FASE 3: Dev otimiza código mantendo testes verdes |
| **Gherkin** | Linguagem `DADO / QUANDO / ENTÃO` para especificações testáveis |
| **HITL** | Human-in-the-Loop — aprovação humana obrigatória em gates manuais |
| **Quality Gate** | Ponto de verificação bloqueante entre fases |
| **YAGNI** | You Aren't Gonna Need It — princípio TDD de código mínimo |
| **Spec** | Especificação formal em Gherkin — o contrato |
| **DoD** | Definition of Done — 10 critérios para milestone completo |
| **SoT** | Source of Truth — documento canônico do projeto |

---

<!-- _class: lead -->

# <span>Maestro</span>
## Agile SDD com TDD

<br>

### Spec é o contrato. Testes são a prova.
### 🔴 RED → 🟢 GREEN → 🔵 REFACTOR
### Você é a aprovação.

<br>

**Framework completo em** `SOURCE_OF_TRUTH.md`
