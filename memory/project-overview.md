---
name: project-overview
description: Visão geral do projeto 3DPrint Store - e-commerce de impressão 3D com metodologia Maestro Agile SDD
metadata:
  type: project
---

# 3DPrint Store — E-commerce de Impressão 3D

**Metodologia:** Maestro - Agile SDD
**Fonte canônica:** [`SOURCE_OF_TRUTH.md`](../SOURCE_OF_TRUTH.md)

## Stack
Next.js 14+ (App Router), TypeScript strict, Tailwind CSS, shadcn/ui, Supabase, Prisma, Stripe + MercadoPago, Vercel

## Arquitetura de Agentes
- **Maestro** (CLAUDE.md) — orquestrador central, rege o ciclo SDD
- **Business Analyst** — FASE 0: especificações Gherkin
- **Full Stack Dev** — FASE 1+2: arquitetura e implementação
- **QA Engineer** — FASE 3: verificação contra spec

## Ciclo SDD
```
Specification → Derivation → Implementation → Verification → Acceptance → Retrospective
   (FASE 0)       (FASE 1)      (FASE 2)        (FASE 3)       (FASE 4)      (FASE 5)
   🚧 G0           🚧 G1          🚧 G2           🚧 G3          🚧 G4          🚧 G5
```

## Quality Gates
G0, G1, G4 → manuais (Product Owner aprova)
G2, G3 → automáticos (build/testes)
G5 → manual (Maestro)

## Roadmap
8 milestones, MVP em M04 (Checkout & Pagamento)

**How to apply:** Sempre iniciar pelo `SOURCE_OF_TRUTH.md`, verificar `memory/session-latest.md`, seguir o SDD sem pular gates.
