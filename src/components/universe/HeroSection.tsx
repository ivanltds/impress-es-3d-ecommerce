// Server Component — homepage hero
interface Props {
  preferredSlug?: string | null
}

export function HeroSection({ preferredSlug: _ }: Props) {
  return (
    <section data-testid="hero-section" className="relative h-screen flex items-center justify-center overflow-hidden">
      <div data-testid="hero-bg-image" className="absolute inset-0 bg-gray-900" />
      <div className="relative z-10 text-center text-white px-4">
        <h1 data-testid="hero-headline" className="text-4xl md:text-6xl font-bold mb-6">
          Feito para você. Só para você.
        </h1>
        <p className="text-xl mb-8 opacity-90">
          Impressão 3D personalizada que transforma ideias em realidade.
        </p>
        <a
          data-testid="hero-cta-universos"
          href="#universos-section"
          className="inline-block bg-white text-gray-900 font-bold py-4 px-8 rounded-lg text-lg hover:bg-gray-100 transition-colors"
        >
          Explorar universos
        </a>
      </div>
    </section>
  )
}
