'use client'

// ─── F7: Home Page — M02 Enhanced ───
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Gamepad2,
  Sparkles,
  Home,
  Gift,
  Car,
  ShoppingBag,
  Palette,
  Truck,
  ArrowRight,
} from 'lucide-react'
import { WhatsAppButton } from '@/components/shared/whatsapp-button'
import { LeadForm } from '@/components/shop/lead-form'

const COLLECTIONS = [
  { slug: 'gamer', name: 'Gamer Energy', desc: 'Setup com atitude. Neon, energia e performance.', icon: Gamepad2 },
  { slug: 'anime', name: 'Anime Pop', desc: 'Seu universo favorito em cada detalhe.', icon: Sparkles },
  { slug: 'home', name: 'Casa & Utilidades', desc: 'Funcionalidade com design que impressiona.', icon: Home },
  { slug: 'gifts', name: 'Presentes Personalizados', desc: 'Presentes que contam histórias.', icon: Gift },
  { slug: 'auto', name: 'Auto Vintage', desc: 'Clássicos merecem acessórios à altura.', icon: Car },
]

const FEATURED = [
  { name: 'Porta-lata Personalizado', price: 'R$ 49,90', icon: ShoppingBag },
  { name: 'Chaveiro com Nome', price: 'R$ 19,90', icon: Sparkles },
  { name: 'Abajur Lithophane', price: 'R$ 89,90', icon: Palette },
  { name: 'Organizador de Mesa', price: 'R$ 59,90', icon: Home },
]

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, duration: 0.5 },
  },
}

const item = {
  hidden: { opacity: 0, y: 30 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
}

export default function HomePage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      data-testid="home-page"
    >
      {/* ─── Hero ─── */}
      <section
        className="relative flex min-h-[85vh] flex-col items-center justify-center overflow-hidden px-4 text-center"
        data-testid="hero-section"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-purple-500/5 to-transparent" />
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="relative"
        >
          <h1 className="font-heading text-5xl font-extrabold tracking-tight md:text-7xl">
            Produtos 3D com a{' '}
            <span className="bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
              sua cara
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground md:text-xl">
            Escolha seu universo, personalize com nome, cor e tamanho. Design autoral, produção sob demanda, entrega no Brasil inteiro.
          </p>
          <Link
            href="/colecoes"
            className="mt-8 inline-flex h-12 items-center gap-2 rounded-full bg-primary px-8 text-sm font-semibold text-primary-foreground transition-all hover:scale-105 hover:shadow-lg hover:shadow-primary/25"
            data-testid="hero-cta"
          >
            Ver Coleções
            <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>
      </section>

      {/* ─── Collections ─── */}
      <motion.section
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-100px' }}
        className="px-4 py-20"
        data-testid="collections-section"
      >
        <h2 className="text-center font-heading text-3xl font-bold md:text-4xl">
          Escolha seu Universo
        </h2>
        <p className="mt-2 text-center text-muted-foreground">
          Cada coleção tem sua identidade visual. Escolha a sua.
        </p>
        <div className="mx-auto mt-12 grid max-w-6xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
          {COLLECTIONS.map((c) => (
            <motion.div key={c.slug} variants={item}>
              <Link
                href={`/colecoes/${c.slug}`}
                className="group flex flex-col items-center rounded-2xl border bg-card p-8 text-center transition-all hover:scale-105 hover:border-primary/30 hover:shadow-xl"
                data-testid={`collection-card-${c.slug}`}
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <c.icon className="h-8 w-8" />
                </div>
                <h3 className="mt-4 font-heading text-lg font-semibold">{c.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{c.desc}</p>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* ─── How It Works ─── */}
      <motion.section
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-100px' }}
        className="bg-muted/30 px-4 py-20"
        data-testid="how-it-works"
      >
        <h2 className="text-center font-heading text-3xl font-bold md:text-4xl">
          Como Funciona
        </h2>
        <div className="mx-auto mt-12 grid max-w-4xl grid-cols-1 gap-8 md:grid-cols-3">
          {[
            { step: '1', title: 'Escolha', desc: 'Seu produto e coleção favorita', icon: ShoppingBag },
            { step: '2', title: 'Personalize', desc: 'Cor, tamanho e nome gravado', icon: Palette },
            { step: '3', title: 'Receba', desc: 'Produção sob demanda, direto na sua casa', icon: Truck },
          ].map((s) => (
            <motion.div key={s.step} variants={item} className="text-center" data-testid={`step-${s.step}`}>
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
                <s.icon className="h-7 w-7" />
              </div>
              <h3 className="mt-5 font-heading text-lg font-semibold">{s.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* ─── Featured Products ─── */}
      <motion.section
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-100px' }}
        className="px-4 py-20"
        data-testid="featured-products"
      >
        <h2 className="text-center font-heading text-3xl font-bold md:text-4xl">
          Produtos em Destaque
        </h2>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          Em breve — catálogo completo.
        </p>
        <div className="mx-auto mt-12 grid max-w-6xl grid-cols-2 gap-6 md:grid-cols-4">
          {FEATURED.map((p) => (
            <motion.div
              key={p.name}
              variants={item}
              whileHover={{ scale: 1.03, y: -2 }}
              className="group cursor-pointer rounded-2xl border bg-card p-6 text-center transition-shadow hover:shadow-xl"
              data-testid="featured-product-card"
            >
              <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-xl bg-muted transition-colors group-hover:bg-primary/10">
                <p.icon className="h-10 w-10 text-primary/60 transition-colors group-hover:text-primary" />
              </div>
              <h3 className="mt-4 font-heading text-sm font-semibold">{p.name}</h3>
              <p className="mt-1 text-lg font-bold text-primary">{p.price}</p>
              <span className="mt-2 inline-block rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
                Em breve
              </span>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* ─── Lead Form Section ─── */}
      <section className="bg-muted/30 px-4 py-20">
        <div className="mx-auto max-w-lg">
          <LeadForm />
        </div>
      </section>

      <WhatsAppButton />
    </motion.div>
  )
}
