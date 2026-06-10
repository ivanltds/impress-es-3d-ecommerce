// ─── F7: Home Page ───
// Atende aos cenários: 7.1 (hero), 7.2 (coleções), 7.3 (como funciona),
// 7.4 (destaques), 7.5 (WhatsApp CTA), 7.6 (SEO), 7.7 (mobile grid), 7.8 (desktop grid)
import Link from 'next/link'
import { WhatsAppButton } from '@/components/shared/whatsapp-button'

const COLLECTIONS = [
  { slug: 'gamer', name: 'Gamer Energy', description: 'Setup com atitude. Neon, energia e performance.', emoji: '🎮' },
  { slug: 'anime', name: 'Anime Pop', description: 'Seu universo favorito em cada detalhe.', emoji: '🎌' },
  { slug: 'home', name: 'Casa & Utilidades', description: 'Funcionalidade com design que impressiona.', emoji: '🏠' },
  { slug: 'gifts', name: 'Presentes Personalizados', description: 'Presentes que contam histórias.', emoji: '🎁' },
  { slug: 'auto', name: 'Auto Vintage', description: 'Clássicos merecem acessórios à altura.', emoji: '🏎️' },
]

const FEATURED = [
  { name: 'Porta-lata Personalizado', price: 'R$ 49,90', emoji: '🥤' },
  { name: 'Chaveiro com Nome', price: 'R$ 19,90', emoji: '🔑' },
  { name: 'Abajur Lithophane', price: 'R$ 89,90', emoji: '💡' },
  { name: 'Organizador de Mesa', price: 'R$ 59,90', emoji: '📦' },
]

export default function HomePage() {
  return (
    <div data-testid="home-page">
      {/* ─── Hero — F7.1 ─── */}
      <section
        className="flex min-h-[80vh] flex-col items-center justify-center px-4 text-center"
        data-testid="hero-section"
      >
        <h1 className="font-heading text-4xl font-extrabold tracking-tight md:text-6xl">
          Produtos 3D com a{' '}
          <span className="text-primary">sua cara</span>
        </h1>
        <p className="mt-4 max-w-lg text-lg text-muted-foreground">
          Escolha seu universo, personalize com nome, cor e tamanho. Design
          autoral, produção sob demanda, entrega no Brasil inteiro.
        </p>
        <Link
          href="/colecoes"
          className="mt-8 inline-flex h-12 items-center justify-center rounded-full bg-primary px-8 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          data-testid="hero-cta"
        >
          Ver Coleções
        </Link>
      </section>

      {/* ─── Collections — F7.2 ─── */}
      <section className="px-4 py-16" data-testid="collections-section">
        <h2 className="text-center font-heading text-3xl font-bold">
          Escolha seu Universo
        </h2>
        <p className="mt-2 text-center text-muted-foreground">
          Cada coleção tem sua identidade visual. Escolha a sua.
        </p>
        <div className="mx-auto mt-10 grid max-w-6xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
          {COLLECTIONS.map((c) => (
            <Link
              key={c.slug}
              href={`/colecoes/${c.slug}`}
              className="group rounded-xl border bg-card p-6 text-center transition-shadow hover:shadow-lg"
              data-testid={`collection-card-${c.slug}`}
            >
              <div className="text-4xl">{c.emoji}</div>
              <h3 className="mt-3 font-heading font-semibold">{c.name}</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                {c.description}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* ─── How It Works — F7.3 ─── */}
      <section className="bg-muted/30 px-4 py-16" data-testid="how-it-works">
        <h2 className="text-center font-heading text-3xl font-bold">
          Como Funciona
        </h2>
        <div className="mx-auto mt-10 grid max-w-4xl grid-cols-1 gap-8 md:grid-cols-3">
          {[
            { step: '1', title: 'Escolha', desc: 'Seu produto e coleção favorita' },
            { step: '2', title: 'Personalize', desc: 'Cor, tamanho e nome gravado' },
            { step: '3', title: 'Receba', desc: 'Produção sob demanda, direto na sua casa' },
          ].map((s) => (
            <div key={s.step} className="text-center" data-testid={`step-${s.step}`}>
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground">
                {s.step}
              </div>
              <h3 className="mt-4 font-heading font-semibold">{s.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Featured Products — F7.4 (placeholder) ─── */}
      <section className="px-4 py-16" data-testid="featured-products">
        <h2 className="text-center font-heading text-3xl font-bold">
          Produtos em Destaque
        </h2>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          Em breve — catálogo completo.
        </p>
        <div className="mx-auto mt-10 grid max-w-6xl grid-cols-2 gap-6 md:grid-cols-4">
          {FEATURED.map((p) => (
            <div
              key={p.name}
              className="rounded-xl border bg-card p-4 text-center"
              data-testid="featured-product-card"
            >
              <div className="flex h-32 items-center justify-center rounded-lg bg-muted text-4xl">
                {p.emoji}
              </div>
              <h3 className="mt-3 font-heading text-sm font-semibold">{p.name}</h3>
              <p className="mt-1 text-sm font-bold text-primary">{p.price}</p>
              <span className="mt-2 inline-block rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                Em breve
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ─── WhatsApp Floating Button — F7.5 ─── */}
      <WhatsAppButton />
    </div>
  )
}
