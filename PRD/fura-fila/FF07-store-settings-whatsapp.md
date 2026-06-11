# 🚨 FF07: StoreSettings — WhatsApp configurável pelo admin

> **Status:** ✅ IMPLEMENTADO
> **Sprint:** M04
> **Criado:** 2026-06-11
> **Concluído:** 2026-06-11

---

## Descrição

Sistema de configurações gerais da loja com singleton persistido no banco, permitindo que o admin configure o número de WhatsApp usado nos botões "Fale conosco" e "Enviar pelo WhatsApp" sem necessidade de variável de ambiente ou redeploy.

---

## Escopo implementado

### Banco de dados
```prisma
model StoreSettings {
  id            String   @id @default("singleton")
  whatsappPhone String   @default("")  // ex: "5511999999999" (com DDI, sem +)
  updatedAt     DateTime @updatedAt
}
```

### APIs
- `GET /api/admin/settings` — retorna configurações (autenticado)
- `PATCH /api/admin/settings` — atualiza `whatsappPhone` (autenticado)
- `GET /api/settings/public` — retorna `whatsappPhone` (sem auth, consumido pelo frontend)

### Página admin
- `/admin/configuracoes` — página geral de configurações
  - Campo WhatsApp: input numérico com prefixo "+", só aceita dígitos
  - Link de teste: `wa.me/{numero}` ao vivo
  - Botão "Salvo!" com feedback visual por 2,5s
  - Cards de navegação para sub-seções (ex: Endereços)
- Nav admin atualizado: "Configurações" → `/admin/configuracoes` (era "Endereços" direto)

### Contexto React
- `StoreSettingsProvider` em `src/components/shared/store-settings-provider.tsx`
  - Busca `/api/settings/public` no mount
  - Expõe `useStoreSettings()` hook
- Adicionado ao `Providers` wrapper
- `customization-modal.tsx` e `CustomizationSuggestion` usam `useStoreSettings()` ao invés de `process.env.NEXT_PUBLIC_WHATSAPP_PHONE`

---

## Arquivos criados/modificados

| Arquivo | Mudança |
|---------|---------|
| `prisma/schema.prisma` | Model StoreSettings |
| `src/app/api/admin/settings/route.ts` | GET + PATCH autenticado |
| `src/app/api/settings/public/route.ts` | GET público |
| `src/components/shared/store-settings-provider.tsx` | Contexto + hook |
| `src/components/shared/providers.tsx` | Inclui StoreSettingsProvider |
| `src/app/admin/configuracoes/page.tsx` | Página com form WhatsApp |
| `src/app/admin/layout.tsx` | Nav: Configurações → /admin/configuracoes |
| `src/components/shop/customization-modal.tsx` | useStoreSettings() |

---

## Status dos Gates

| Gate | Status |
|------|--------|
| G0 | ✅ Aprovado (PO solicitou explicitamente) |
| G1 | ✅ |
| G2 | ⚠️ Sem testes formais |
| G3 | ✅ Implementado |
| G4 | 🚧 Aguardando homologação |
| G5 | 🚧 Pendente |
