# 🚨 FF05: Auth redirects por role + Header adaptado

> **Status:** ✅ IMPLEMENTADO
> **Sprint:** M04
> **Criado:** 2026-06-11
> **Concluído:** 2026-06-11
> **Escopo original:** M01/M03 (Foundation + Customer)

---

## Descrição

Comportamento de autenticação diferenciado por role e header da loja adaptado para usuário logado. A spec M04 cobria apenas proteção de rota admin (cenário 1.4). O redirecionamento pós-login e a adaptação do header são escopo de M01/M03 mas foram implementados durante M04.

---

## Escopo implementado

### Redirecionamento pós-login
- Admin (`role === 'admin'`) → `/admin`
- Cliente (`role === 'customer'`) → `/produtos`

### Header para usuário autenticado
- Mostra: avatar com iniciais + "Olá, {primeiro nome}" + ChevronDown
- Dropdown admin: "Painel Admin", "Sair"
- Dropdown cliente: "Minha Conta", "Meus Pedidos", "Sair"
- Carrinho oculto para admin
- Status `loading` → nada renderizado (sem flash de conteúdo)
- Status `unauthenticated` → link "Entrar"
- Fecha ao clicar fora (useRef + mousedown listener)

### SessionProvider
- `src/components/shared/providers.tsx` criado: `SessionProvider` + `ThemeProvider` + `StoreSettingsProvider`
- `src/app/layout.tsx` atualizado para usar `<Providers>`

---

## Arquivos modificados

| Arquivo | Mudança |
|---------|---------|
| `src/components/shared/providers.tsx` | Novo — wrapper de providers |
| `src/app/layout.tsx` | Usa `<Providers>` |
| `src/components/shared/header.tsx` | Reescrito com `useSession`, dropdown por role |
| `src/app/auth/entrar/page.tsx` | Redirect pós-login por role |

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
