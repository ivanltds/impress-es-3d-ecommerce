# 🎭 Maestro — Agile SDD com TDD

**Framework de orquestração de desenvolvimento com múltiplos agentes de IA.**

Specification-Driven Development + Test-Driven Development + Human-in-the-Loop + Quality Gates bloqueantes.

---

## 🧠 O que é

O Maestro é um framework onde **você** (Product Owner) se comunica apenas com um agente central — o **Maestro** — que orquestra três agentes especializados:

```
Você (Product Owner)
  │
  └── 🎭 Maestro (orquestrador)
        │
        ├── 📋 Business Analyst   → Especificações Gherkin
        ├── 💻 Full Stack Dev     → Arquitetura + Implementação (TDD)
        └── 🧪 QA Engineer        → Testes antes do código + Verificação
```

Cada agente tem um papel isolado. Nenhum faz o trabalho do outro. O Maestro garante que o processo seja seguido **sem atalhos**.

---

## 🔄 O Ciclo

```
FASE 0: Specification      → 📋 BA escreve spec Gherkin         → 🚧 G0 (PO aprova)
FASE 1: Derivation         → 💻 Dev deriva arquitetura          → 🚧 G1 (PO aprova)
FASE 2: Test Authoring     → 🧪 QA escreve testes, eles FALHAM  → 🚧 G2 (🔴 RED)
FASE 3: Implementation     → 💻 Dev codifica até testes passarem → 🚧 G3 (🟢 GREEN)
FASE 4: Verification       → 🧪 QA confirma deploy preview      → 🚧 G4 (CI + QA)
FASE 5: Acceptance         → 👑 PO homologa                     → 🚧 G5 (PO)
FASE 6: Retrospective      → 🎭 Maestro melhora o processo      → 🚧 G6
```

### 🔴 RED → 🟢 GREEN → 🔵 REFACTOR

O TDD está no coração do ciclo:
- **FASE 2:** QA escreve testes baseados na spec Gherkin. Eles **FALHAM** — o código ainda não existe.
- **FASE 3:** Dev escreve o **código mínimo** para os testes passarem. Depois refatora.
- Nenhuma linha de código é escrita sem um teste falhando que a justifique.

---

## 🚧 Quality Gates

| Gate | Nome | Quem libera |
|------|------|-------------|
| **G0** | Spec Approved | 👑 Product Owner |
| **G1** | Architecture Approved | 👑 Product Owner |
| **G2** | Tests Authored (RED 🔴) | 🧪 QA + 🎭 Maestro |
| **G3** | All Tests Pass + Build Green (🟢) | ⚡ CI |
| **G4** | Verification Passed | 🧪 QA |
| **G5** | Deploy Approved | 👑 Product Owner |
| **G6** | Process Improved | 🎭 Maestro |

**Gates são binários e bloqueantes.** 🚧 FECHADO = ninguém avança. ✅ APROVADO = próximo passo.

---

## 👤 Human-in-the-Loop

Gates manuais (G0, G1, G5) exigem **aprovação explícita** do Product Owner. O Maestro nunca decide "aprovado" por você. Silêncio não é consentimento.

---

## 📁 Estrutura

```
maestro-v2.0/
├── SOURCE_OF_TRUTH.md          ⭐ Documento canônico — comece aqui
├── CLAUDE.md                   🎭 Maestro (orquestrador)
├── README.md                   📖 Este arquivo
├── MEMORY.md                   Índice de memória
│
├── specs/                      📋 Especificações Gherkin
├── PRD/                        📦 Product Requirements Document
│   ├── 00-visao.md
│   ├── 01-milestones.md
│   ├── milestones/
│   └── fura-fila/
│
├── maestro-agile-sdd-apresentacao.html  📊 Apresentação (raiz)
├── docs/
│   ├── SDLC.md                 Processo completo (versionado)
│   ├── maestro-agile-sdd-apresentacao.md
│   └── maestro-agile-sdd-apresentacao.pdf
│
├── memory/                     🧠 Persistência entre sessões
│   ├── session-latest.md
│   └── project-overview.md
│
└── .claude/agents/             🤖 Definições dos agentes
    ├── business-analyst.md
    ├── fullstack-dev.md
    └── qa-engineer.md
```

---

## 🚀 Como Usar

### 1. Clone o repositório

```bash
git clone https://github.com/ivanltds/maestro-v2.0.git meu-projeto
cd meu-projeto
```

### 2. Configure o Claude Code

```bash
# Copie o template de settings
cp .claude/settings.example.json .claude/settings.json

# Edite o arquivo e coloque seu token
# "ANTHROPIC_AUTH_TOKEN": "sk-seu-token-aqui"
```

### 3. Inicie o Claude Code

```bash
claude
```

### 4. Fale com o Maestro

> 👑 *"Maestro, quero começar o desenvolvimento."*

O Maestro vai automaticamente:
- Ler `SOURCE_OF_TRUTH.md`
- Ler `memory/session-latest.md`
- Informar status e sugerir o próximo passo

### 5. Siga o fluxo

O Maestro guia você por cada fase. Você aprova ou ajusta. Não tem como errar — os gates bloqueiam avanços prematuros.

---

## 📊 Apresentação

Uma apresentação completa de 34 slides está disponível em 3 formatos:

| Formato | Arquivo |
|---------|---------|
| 🌐 HTML | `maestro-agile-sdd-apresentacao.html` |
| 📄 PDF | `docs/maestro-agile-sdd-apresentacao.pdf` |
| 📝 Fonte | `docs/maestro-agile-sdd-apresentacao.md` (MARP) |

Abra o HTML em qualquer navegador e use ← → para navegar.

---

## 🛡️ Valores

| Valor | Significado |
|-------|-------------|
| **Specification First** | Nada se implementa sem spec Gherkin aprovada |
| **Test First (TDD)** | Testes são escritos ANTES do código |
| **Human in the Loop** | Toda decisão de avanço requer aprovação humana |
| **Quality Non-Negotiable** | Gates não são bypassados |
| **Continuous Improvement** | Cada ciclo melhora o processo |

---

## 🚨 Fura-Fila

O Maestro **detecta proativamente** quando você pede algo fora do milestone atual — mesmo que você não use o termo "fura-fila". Ele sinaliza, analisa o impacto e deixa você decidir.

---

## 🔧 Adaptação

O framework é agnóstico a stack. Para usar com outro projeto:
1. Atualize a stack em `SOURCE_OF_TRUTH.md`
2. Ajuste os agentes em `.claude/agents/`
3. Defina seus milestones em `PRD/`
4. O resto (valores, princípios, gates) é universal

---

## 📄 Licença

MIT — Use, modifique e adapte livremente.
