# Estratégia de Temas e Experiências

---

## EXPERIENCE ENGINE

O produto implementa um **Experience Engine** desacoplado da lógica principal. Cada tema troca identidade visual e ambientação, mas preserva comportamento funcional.

### Itens que VARIAM por tema

- Paleta de cores
- Tipografia
- Banners e hero images
- Ícones e ilustrações
- Blocos de destaque
- Microcopy contextual
- Backgrounds e texturas

### Itens que NÃO VARIAM por tema

- Fluxo de checkout
- Componentes críticos de formulário
- Regras de carrinho e pedido
- Semântica de navegação
- Acessibilidade base (contraste, font-size mínimo)
- Estrutura de dados e APIs

---

## TEMAS INICIAIS

| Tema | Key | Público | Paleta |
|------|-----|---------|--------|
| **Core/Default** | `core` | Geral | Neutra, profissional, clean |
| **Gamer Energy** | `gamer` | Gamers, setup | Neon, escuro, RGB accents |
| **Anime Pop** | `anime` | Otakus, geeks | Vibrante, ilustrativo, kawaii |
| **Home Utility** | `home` | Casa, decoração | Clean, material-focused, minimalista |
| **Personalized Gifts** | `gifts` | Presentes | Quente, emocional, data-driven |
| **Auto Vintage** | `auto` | Carros antigos | Vintage, mecânico, retrô |

---

## IMPLEMENTAÇÃO TÉCNICA

### Design Tokens

Cada tema define um conjunto de tokens:

```yaml
theme:
  gamer:
    colors:
      primary: "#00ff41"
      secondary: "#ff00ff"
      background: "#0a0a0a"
      surface: "#1a1a2e"
      text: "#e0e0e0"
    typography:
      heading: "'Orbitron', sans-serif"
      body: "'Inter', sans-serif"
    assets:
      hero_banner: "/themes/gamer/hero.jpg"
      logo_variant: "/themes/gamer/logo.svg"
```

### Mecanismo de Resolução

1. Usuário logado → `ThemePreference.user_id.theme_key`
2. Usuário guest → cookie `theme_pref`
3. Fallback → `core` (default)
4. Sugestão → baseada em `CustomerProfile.favorite_collections` ou histórico de compra

### Persistência

- **Guest:** cookie `theme_pref` com duração de 30 dias
- **Logado:** tabela `ThemePreference`, campo `preferred_theme` no User
- **Sugestão:** flag `source: suggested` para diferenciar de escolha manual

---

## ARQUITETURA DE COMPONENTES

```
<ThemeProvider theme={activeTheme}>
  <Layout>
    <Header theme={activeTheme} />        ← varia
    <Navigation />                         ← NÃO varia
    <Main>
      {children}                           ← varia (cores, fontes, assets)
    </Main>
    <Footer theme={activeTheme} />         ← varia
  </Layout>
</ThemeProvider>
```

Componentes como `CheckoutForm`, `CartSummary`, `PaymentForm` são **theme-agnostic** — recebem o tema mas não alteram comportamento.
