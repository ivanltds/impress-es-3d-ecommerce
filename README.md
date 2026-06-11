# Impressões 3D — E-commerce

Loja virtual para produtos de impressão 3D personalizados, com painel administrativo completo para gestão de pedidos, produção e envio.

---

## Stack

- **Next.js 15** (App Router, Server Components)
- **TypeScript** (strict)
- **Tailwind CSS** + **shadcn/ui**
- **NextAuth.js v5** (autenticação com roles: admin / customer)
- **Prisma ORM** + **Neon PostgreSQL**
- **Melhor Envio API** (cotação e compra de etiquetas)
- **Vercel** (deploy)

---

## Funcionalidades

### Loja
- Catálogo de produtos com galeria de imagens
- Sistema de personalização (7 tipos de campo: texto, cor, tamanho, opções, upload de imagem/3D)
- Carrinho e checkout com endereço de entrega e CPF
- Cálculo de frete em tempo real via Melhor Envio
- Área do cliente: histórico de pedidos

### Admin
- CRUD de produtos com builder de personalização visual
- Gestão de pedidos (filtro, detalhe, atualização de status)
- Kanban de produção (5 colunas, drag-and-drop)
- Kanban de envio com geração de etiqueta Melhor Envio
- Dashboard de analytics (pedidos, receita, ticket médio, top produtos)
- Gestão de endereços de origem (para cálculo de frete)
- Configurações da loja (número WhatsApp configurável)

---

## Setup local

```bash
git clone https://github.com/ivanltds/impress-es-3d-ecommerce.git
cd impress-es-3d-ecommerce
npm install
```

Crie o `.env.local`:

```env
# Banco de dados
DATABASE_URL="postgresql://..."

# NextAuth
NEXTAUTH_SECRET="seu-secret"
NEXTAUTH_URL="http://localhost:3000"

# Melhor Envio
MELHOR_ENVIO_TOKEN="seu-token"
MELHOR_ENVIO_MOCK=true   # true para dev sem saldo

# Upload (opcional)
NEXT_PUBLIC_UPLOAD_MAX_MB=8
```

```bash
npx prisma db push
npx prisma generate
npm run dev
```

Acesse `http://localhost:3000`.

---

## Variáveis de ambiente (produção)

| Variável | Obrigatória | Descrição |
|----------|:-----------:|-----------|
| `DATABASE_URL` | ✅ | Connection string Neon/PostgreSQL |
| `NEXTAUTH_SECRET` | ✅ | Secret para JWT |
| `NEXTAUTH_URL` | ✅ | URL pública da aplicação |
| `MELHOR_ENVIO_TOKEN` | ✅ | Token da API Melhor Envio |
| `MELHOR_ENVIO_MOCK` | — | `true` para simular etiquetas sem saldo |

> **Nota:** O número de WhatsApp é configurado pelo painel admin em `/admin/configuracoes` — não precisa de variável de ambiente.

---

## Metodologia

Projeto desenvolvido com **Maestro — Agile SDD + TDD**: orquestração por agentes IA (Business Analyst, Dev, QA) com Quality Gates bloqueantes e Human-in-the-Loop.

Documentação de processo em `PRD/`, especificações em `specs/`, fura-filas em `PRD/fura-fila/`.

---

## Licença

MIT
