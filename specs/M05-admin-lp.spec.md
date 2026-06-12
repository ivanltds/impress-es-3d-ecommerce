# Fura-fila FF08 — Admin LP: Universos

> **Status:** DRAFT — aguardando aprovação G0
> **Milestone de origem:** M05 (fura-fila dentro do ciclo ativo)
> **Identificador:** FF08
> **Última atualização:** 2026-06-11
> **Business Analyst:** Agente BA (Claude)
> **Stack:** Next.js 15 App Router, TypeScript strict, Tailwind CSS, shadcn/ui, Prisma + Neon PostgreSQL, NextAuth.js v5

---

## Contexto e Motivação

O milestone M05 implementou o model `Universe` no Prisma com os campos `id`, `slug`, `name`, `comingSoon` e `sortOrder`. A configuração de apresentação (tagline, bullets, imagens de card e hero) ainda está dividida entre:

- `src/config/universes.ts` — configuração estática (tagline, palette, fontes, paths de imagem)
- `UNIVERSE_DETAILS` em `UniversosSection.tsx` — bullets hardcoded no componente

Sem um painel de administração, qualquer atualização de conteúdo exige redeploy. Este fura-fila expõe uma tela admin em `/admin/universos` que permite:

1. Fazer upload de imagens PNG para o card e para o painel lateral (hero)
2. Editar a tagline e os 3 bullet points de cada universo

As imagens são salvas em `public/universes/{slug}/card.png` e `public/universes/{slug}/hero.png`. Os campos de texto e as URLs de imagem são persistidos nos novos campos `cardImageUrl`, `heroImageUrl`, `tagline` e `bullets` do model `Universe`. A LP passa a preferir o valor do banco, caindo de volta para `UNIVERSE_CONFIG` quando o campo for nulo.

---

## Regras de Negócio

| ID | Regra |
|----|-------|
| RN-FF08-01 | Somente usuários com role `admin` ou `operator` podem acessar `/admin/universos` |
| RN-FF08-02 | Não é possível criar ou deletar universos via UI — a lista de 5 slugs é fixa |
| RN-FF08-03 | Upload aceita apenas PNG (`image/png`); qualquer outro tipo MIME deve ser rejeitado com erro 422 |
| RN-FF08-04 | Tamanho máximo de arquivo por upload: 5 MB; arquivos maiores devem ser rejeitados com erro 413 |
| RN-FF08-05 | O arquivo salvo em disco usa nome fixo: `card.png` ou `hero.png` dentro do diretório do slug (`public/universes/{slug}/`) — substitui a versão anterior sem mover arquivos antigos |
| RN-FF08-06 | Após upload bem-sucedido, `cardImageUrl` ou `heroImageUrl` no registro `Universe` é atualizado para `/universes/{slug}/card.png` ou `/universes/{slug}/hero.png` |
| RN-FF08-07 | A `tagline` é obrigatória quando salva — não pode ser string vazia; máximo de 120 caracteres |
| RN-FF08-08 | O campo `bullets` armazena exatamente 3 itens; cada bullet tem no mínimo 5 e no máximo 100 caracteres |
| RN-FF08-09 | A API de upload e de edição de texto são rotas protegidas — exigem sessão com role admin/operator |
| RN-FF08-10 | Na LP, quando `Universe.cardImageUrl` não é nulo, a imagem é exibida no pill do universo; fallback: visual decorativo atual |
| RN-FF08-11 | Na LP, quando `Universe.heroImageUrl` não é nulo, a imagem é exibida no painel lateral direito do painel ativo; fallback: grid + glow atual |
| RN-FF08-12 | Na LP, quando `Universe.tagline` não é nulo, prevalece sobre `UNIVERSE_CONFIG[slug].tagline`; fallback: valor do config estático |
| RN-FF08-13 | Na LP, quando `Universe.bullets` não é nulo e tem 3 itens, prevalece sobre `UNIVERSE_DETAILS[slug].bullets` em `UniversosSection`; fallback: bullets hardcoded |
| RN-FF08-14 | Um upload parcial (arquivo salvo no disco mas falha ao atualizar o banco) não deve deixar o sistema em estado inconsistente — a URL só deve ser persistida se o arquivo foi gravado com sucesso |
| RN-FF08-15 | O campo `bullets` é persistido como `String[]` no Prisma (array nativo do PostgreSQL) |

---

## Schema — alterações necessárias no Prisma

```prisma
model Universe {
  id            String   @id @default(cuid())
  slug          String   @unique
  name          String
  comingSoon    Boolean  @default(false)
  sortOrder     Int      @default(0)

  // FF08: campos editáveis via admin
  cardImageUrl  String?  // ex: "/universes/gaming/card.png"
  heroImageUrl  String?  // ex: "/universes/gaming/hero.png"
  tagline       String?  // substitui UNIVERSE_CONFIG[slug].tagline quando presente
  bullets       String[] // 3 bullets; substitui UNIVERSE_DETAILS[slug].bullets quando presente

  products      ProductUniverse[]
  testimonials  Testimonial[]

  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}
```

---

## Features e Cenários

---

### Feature 1: Listagem de universos no admin

**História:** Como operador da loja, quero ver a lista de todos os universos no painel admin com o estado atual de cada um, para saber o que já foi configurado e o que ainda está no fallback.

---

**Cenário 1.1: Listagem exibe todos os 5 universos**
```gherkin
DADO que o operador está autenticado com role "admin"
QUANDO acessar "/admin/universos"
ENTÃO o elemento [data-testid="admin-universos-list"] deve estar visível
E devem existir exatamente 5 linhas com [data-testid="universo-row-{slug}"] — uma para cada slug: gaming, anime-nerd, casa-decor, presentes, auto
```

**Cenário 1.2: Linha mostra status de configuração por campo**
```gherkin
DADO que o universo "gaming" possui "cardImageUrl" preenchido e "heroImageUrl" nulo
QUANDO a listagem for renderizada
ENTÃO [data-testid="universo-row-gaming"] deve exibir [data-testid="status-card-image-gaming"] com ícone indicando "configurado"
E deve exibir [data-testid="status-hero-image-gaming"] com ícone indicando "não configurado"
E deve exibir [data-testid="status-tagline-gaming"] com ícone indicando o estado correspondente à presença ou ausência do campo
```

**Cenário 1.3: Rota exige autenticação admin**
```gherkin
DADO que o usuário NÃO está autenticado
QUANDO tentar acessar "/admin/universos"
ENTÃO deve ser redirecionado para "/auth/entrar"
E não deve ter acesso a nenhum dado de universo
```

---

### Feature 2: Upload de imagem de card (cardImageUrl)

**História:** Como operador da loja, quero fazer upload de uma imagem PNG para o card de cada universo no admin, para que a LP exiba a imagem personalizada no lugar do visual padrão.

---

**Cenário 2.1: Upload de PNG válido (card) — happy path**
```gherkin
DADO que o operador está em "/admin/universos"
E clica em "Editar" no universo "gaming"
QUANDO selecionar um arquivo PNG válido (menor ou igual a 5 MB) no campo [data-testid="input-card-image"]
E clicar em [data-testid="btn-upload-card"]
ENTÃO a API "POST /api/admin/universes/gaming/upload" deve retornar status 200
E o arquivo deve ser salvo em "public/universes/gaming/card.png"
E o campo "Universe.cardImageUrl" no banco deve ser atualizado para "/universes/gaming/card.png"
E o elemento [data-testid="preview-card-image"] deve exibir a imagem recém-enviada
E uma mensagem [data-testid="toast-success"] deve aparecer com texto "Imagem do card atualizada"
```

**Cenário 2.2: Upload rejeitado por tipo de arquivo inválido (card)**
```gherkin
DADO que o operador está na tela de edição do universo "gaming"
QUANDO selecionar um arquivo JPEG no campo [data-testid="input-card-image"]
E clicar em [data-testid="btn-upload-card"]
ENTÃO a API deve retornar status 422
E o elemento [data-testid="error-card-image"] deve exibir "Apenas PNG é aceito (transparência obrigatória)"
E nenhum arquivo deve ser gravado em disco
E o valor de "Universe.cardImageUrl" no banco não deve ser alterado
```

**Cenário 2.3: Upload rejeitado por arquivo acima de 5 MB (card)**
```gherkin
DADO que o operador está na tela de edição do universo "gaming"
QUANDO selecionar um arquivo PNG com tamanho de 6 MB no campo [data-testid="input-card-image"]
E clicar em [data-testid="btn-upload-card"]
ENTÃO a API deve retornar status 413
E o elemento [data-testid="error-card-image"] deve exibir "Arquivo muito grande. Máximo permitido: 5 MB"
E nenhum arquivo deve ser gravado em disco
```

**Cenário 2.4: Upload substitui imagem anterior sem criar duplicatas**
```gherkin
DADO que "Universe.cardImageUrl" já é "/universes/gaming/card.png"
QUANDO o operador fizer upload de um novo PNG válido para o card de "gaming"
ENTÃO o arquivo anterior em "public/universes/gaming/card.png" deve ser sobrescrito
E "Universe.cardImageUrl" deve permanecer "/universes/gaming/card.png" (mesmo path)
E não devem existir arquivos como "card-2.png" ou "card-copy.png" no diretório
```

---

### Feature 3: Upload de imagem hero (heroImageUrl)

**História:** Como operador da loja, quero fazer upload de uma imagem PNG maior para o painel lateral do universo, para substituir o visual decorativo genérico por uma imagem temática.

---

**Cenário 3.1: Upload de PNG válido (hero) — happy path**
```gherkin
DADO que o operador está na tela de edição do universo "anime-nerd"
QUANDO selecionar um arquivo PNG válido (menor ou igual a 5 MB) no campo [data-testid="input-hero-image"]
E clicar em [data-testid="btn-upload-hero"]
ENTÃO a API "POST /api/admin/universes/anime-nerd/upload" deve retornar status 200
E o arquivo deve ser salvo em "public/universes/anime-nerd/hero.png"
E o campo "Universe.heroImageUrl" no banco deve ser atualizado para "/universes/anime-nerd/hero.png"
E o elemento [data-testid="preview-hero-image"] deve exibir a imagem recém-enviada
E uma mensagem [data-testid="toast-success"] deve aparecer com texto "Imagem hero atualizada"
```

**Cenário 3.2: Upload rejeitado por tipo inválido (hero)**
```gherkin
DADO que o operador está na tela de edição do universo "presentes"
QUANDO selecionar um arquivo WebP no campo [data-testid="input-hero-image"]
E clicar em [data-testid="btn-upload-hero"]
ENTÃO a API deve retornar status 422
E o elemento [data-testid="error-hero-image"] deve exibir "Apenas PNG é aceito (transparência obrigatória)"
E "Universe.heroImageUrl" não deve ser alterado
```

**Cenário 3.3: Upload hero rejeitado por tamanho acima de 5 MB**
```gherkin
DADO que o operador está na tela de edição do universo "auto"
QUANDO selecionar um arquivo PNG de 8 MB no campo [data-testid="input-hero-image"]
E clicar em [data-testid="btn-upload-hero"]
ENTÃO a API deve retornar status 413
E o elemento [data-testid="error-hero-image"] deve exibir "Arquivo muito grande. Máximo permitido: 5 MB"
```

---

### Feature 4: Edição de tagline e bullets

**História:** Como operador da loja, quero editar a tagline e os 3 bullet points de cada universo pelo admin, para atualizar o conteúdo da LP sem necessidade de redeploy.

---

**Cenário 4.1: Salvar tagline válida — happy path**
```gherkin
DADO que o operador está na tela de edição do universo "casa-decor"
QUANDO alterar o valor do campo [data-testid="input-tagline"] para "Objetos únicos para lares únicos."
E clicar em [data-testid="btn-save-text"]
ENTÃO a API "PATCH /api/admin/universes/casa-decor" deve retornar status 200
E o campo "Universe.tagline" no banco deve ser "Objetos únicos para lares únicos."
E [data-testid="toast-success"] deve exibir "Conteúdo atualizado com sucesso"
```

**Cenário 4.2: Rejeitar tagline vazia**
```gherkin
DADO que o operador está na tela de edição do universo "gaming"
QUANDO limpar o campo [data-testid="input-tagline"] deixando-o vazio
E clicar em [data-testid="btn-save-text"]
ENTÃO o elemento [data-testid="error-tagline"] deve exibir "A tagline não pode ser vazia"
E a API não deve ser chamada
E o valor anterior de "Universe.tagline" no banco deve permanecer inalterado
```

**Cenário 4.3: Rejeitar tagline acima de 120 caracteres**
```gherkin
DADO que o operador está na tela de edição do universo "presentes"
QUANDO digitar uma string de 121 caracteres no campo [data-testid="input-tagline"]
ENTÃO o elemento [data-testid="error-tagline"] deve exibir "Máximo de 120 caracteres"
E [data-testid="btn-save-text"] deve estar desabilitado (atributo disabled presente)
```

**Cenário 4.4: Salvar os 3 bullets válidos — happy path**
```gherkin
DADO que o operador está na tela de edição do universo "gaming"
QUANDO preencher:
  | campo                           | valor                                    |
  | [data-testid="input-bullet-0"]  | "Miniaturas de personagens favoritos"    |
  | [data-testid="input-bullet-1"]  | "Suportes ergonômicos para setup"        |
  | [data-testid="input-bullet-2"]  | "Porta-controles e headset stands"       |
E clicar em [data-testid="btn-save-text"]
ENTÃO a API deve retornar status 200
E o campo "Universe.bullets" no banco deve conter exatamente esses 3 valores na ordem informada
```

**Cenário 4.5: Rejeitar bullet com menos de 5 caracteres**
```gherkin
DADO que o operador está na tela de edição do universo "anime-nerd"
QUANDO preencher [data-testid="input-bullet-1"] com "Ok" (2 caracteres)
E clicar em [data-testid="btn-save-text"]
ENTÃO o elemento [data-testid="error-bullet-1"] deve exibir "Mínimo de 5 caracteres por bullet"
E a API não deve ser chamada
```

**Cenário 4.6: Rejeitar bullet acima de 100 caracteres**
```gherkin
DADO que o operador está na tela de edição do universo "auto"
QUANDO preencher [data-testid="input-bullet-2"] com uma string de 101 caracteres
ENTÃO o elemento [data-testid="error-bullet-2"] deve exibir "Máximo de 100 caracteres por bullet"
E [data-testid="btn-save-text"] deve estar desabilitado
```

---

### Feature 5: Fallback na LP quando campos do banco são nulos

**História:** Como visitante da loja, quero que a LP continue funcionando normalmente quando o admin ainda não configurou imagens ou textos para um universo, usando o visual padrão existente.

---

**Cenário 5.1: cardImageUrl nulo — pill usa visual decorativo sem imagem**
```gherkin
DADO que "Universe.cardImageUrl" é nulo para o universo "auto"
QUANDO a LP for renderizada e o universo "auto" estiver visível
ENTÃO o pill [data-testid="universo-card-auto"] NÃO deve conter um elemento <img>
E deve continuar exibindo o estilo decorativo padrão (background gradient e texto)
```

**Cenário 5.2: heroImageUrl nulo — painel lateral usa grid e glow**
```gherkin
DADO que "Universe.heroImageUrl" é nulo para o universo "presentes"
QUANDO o painel lateral de "presentes" estiver ativo na UniversosSection
ENTÃO o painel lateral direito NÃO deve conter um elemento <img> com [data-testid="hero-universe-image"]
E deve exibir o padrão de grid e glow existente (background-image CSS com padrão linear-gradient)
```

**Cenário 5.3: tagline nula no banco — usa valor do UNIVERSE_CONFIG estático**
```gherkin
DADO que "Universe.tagline" é nulo para o universo "casa-decor"
QUANDO a UniversosSection renderizar o painel de "casa-decor"
ENTÃO o elemento de tagline deve exibir o texto de "UNIVERSE_CONFIG['casa-decor'].tagline"
E não deve haver texto vazio ou placeholder visível ao usuário
```

**Cenário 5.4: bullets nulos no banco — usa bullets hardcoded do componente**
```gherkin
DADO que "Universe.bullets" está vazio (array vazio ou nulo) para o universo "gaming"
QUANDO a UniversosSection renderizar o painel de "gaming"
ENTÃO a lista de bullets deve exibir os 3 itens de "UNIVERSE_DETAILS['gaming'].bullets"
E deve haver exatamente 3 elementos <li> visíveis
```

---

### Feature 6: Exibição das imagens e textos na LP quando configurados

**História:** Como visitante da loja, quando o admin tiver configurado imagens ou textos para um universo, quero que esses dados do banco apareçam no lugar do visual e copy genéricos.

---

**Cenário 6.1: cardImageUrl preenchido — imagem exibida no pill**
```gherkin
DADO que "Universe.cardImageUrl" é "/universes/gaming/card.png" para o universo "gaming"
QUANDO a LP for renderizada
ENTÃO o pill [data-testid="universo-card-gaming"] deve conter um elemento <img> com [data-testid="card-universe-image-gaming"]
E o atributo "src" da imagem deve ser "/universes/gaming/card.png"
E a imagem deve ter atributo "alt" descritivo (ex: "Gaming")
```

**Cenário 6.2: heroImageUrl preenchido — imagem exibida no painel lateral**
```gherkin
DADO que "Universe.heroImageUrl" é "/universes/anime-nerd/hero.png" para "anime-nerd"
E o universo "anime-nerd" está ativo no painel da UniversosSection
QUANDO o painel lateral direito for renderizado
ENTÃO deve existir um elemento <img> com [data-testid="hero-universe-image"]
E o atributo "src" deve ser "/universes/anime-nerd/hero.png"
E o visual decorativo (grid e glow) NÃO deve ser renderizado simultaneamente
```

**Cenário 6.3: tagline do banco sobrepõe config estático**
```gherkin
DADO que "Universe.tagline" é "Setup épico começa aqui." para o universo "gaming"
E "UNIVERSE_CONFIG['gaming'].tagline" é "Setup com atitude. Neon, energia e performance."
QUANDO a UniversosSection renderizar o painel de "gaming"
ENTÃO o elemento de tagline deve exibir "Setup épico começa aqui."
E NÃO deve exibir o texto do config estático
```

**Cenário 6.4: bullets do banco sobrepõem bullets hardcoded**
```gherkin
DADO que "Universe.bullets" é ["Bullet 1 editado", "Bullet 2 editado", "Bullet 3 editado"] para "presentes"
QUANDO a UniversosSection renderizar o painel de "presentes"
ENTÃO os 3 elementos <li> devem conter os textos do banco, nessa ordem
E os bullets hardcoded do componente NÃO devem aparecer
```

---

## Cobertura de data-testid

| Elemento | data-testid | Feature |
|----------|-------------|---------|
| Lista de universos no admin | `admin-universos-list` | F1 |
| Linha de universo na listagem | `universo-row-{slug}` | F1 |
| Status ícone card image | `status-card-image-{slug}` | F1 |
| Status ícone hero image | `status-hero-image-{slug}` | F1 |
| Status ícone tagline | `status-tagline-{slug}` | F1 |
| Input de card image | `input-card-image` | F2 |
| Botão upload card | `btn-upload-card` | F2 |
| Preview card image | `preview-card-image` | F2 |
| Erro card image | `error-card-image` | F2, F3 |
| Input de hero image | `input-hero-image` | F3 |
| Botão upload hero | `btn-upload-hero` | F3 |
| Preview hero image | `preview-hero-image` | F3 |
| Erro hero image | `error-hero-image` | F3 |
| Input tagline | `input-tagline` | F4 |
| Erro tagline | `error-tagline` | F4 |
| Input bullet (3 campos) | `input-bullet-{0,1,2}` | F4 |
| Erro bullet por índice | `error-bullet-{0,1,2}` | F4 |
| Botão salvar texto | `btn-save-text` | F4 |
| Toast de sucesso | `toast-success` | F2, F3, F4 |
| Imagem card na LP | `card-universe-image-{slug}` | F6 |
| Imagem hero no painel | `hero-universe-image` | F6 |

---

## API Routes necessárias

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/api/admin/universes` | Lista os 5 registros Universe com todos os campos |
| `GET` | `/api/admin/universes/[slug]` | Retorna um registro Universe pelo slug |
| `PATCH` | `/api/admin/universes/[slug]` | Atualiza `tagline` e `bullets` |
| `POST` | `/api/admin/universes/[slug]/upload` | Upload de imagem; `type` = `"card"` ou `"hero"` no form data |

---

## Dependências técnicas

| # | Dependência | Observação |
|---|-------------|------------|
| D1 | Migration Prisma adicionando `cardImageUrl`, `heroImageUrl`, `tagline`, `bullets` ao model `Universe` | Nova migration a ser criada |
| D2 | Handler de upload com `formData()` do Next.js 15 ou biblioteca equivalente | Verificar se já existe handler de upload no projeto — customização usa rota própria |
| D3 | Acesso ao filesystem em `public/universes/{slug}/` via `fs.writeFile` | Funciona em ambiente local; em Vercel cloud o `public/` não é gravável em runtime — avaliar uso de Vercel Blob se deploy for cloud |
| D4 | `UniversosSection` precisa receber dados do banco via Server Component pai | Hoje já recebe `universes: UniverseData[]` — adicionar `cardImageUrl`, `heroImageUrl`, `tagline`, `bullets` à interface `UniverseData` |
| D5 | `UNIVERSE_DETAILS` em `UniversosSection.tsx` deve virar fallback, não fonte primária | Refatorar lógica de prioridade: banco > config estático |

---

## Escopo NÃO incluído neste fura-fila

- Edição de `name`, `comingSoon` e `sortOrder` via admin — permanecem no seed/código
- Upload ou edição de `ogImage` — permanece no `UNIVERSE_CONFIG` estático
- Upload de múltiplas imagens simultâneas (batch)
- Crop ou redimensionamento de imagem no admin
- Histórico de versões de imagem ou rollback
- Admin UI para depoimentos (Testimonial) — backlog M06
- Ordenação drag-and-drop dos universos — backlog M06

---

> **Próximo passo após G0:** Acionar Dev (FASE 1 — Derivation) para derivar arquitetura técnica deste fura-fila, incluindo decisão sobre armazenamento de arquivo (filesystem local vs. Vercel Blob) e nova migration Prisma.
