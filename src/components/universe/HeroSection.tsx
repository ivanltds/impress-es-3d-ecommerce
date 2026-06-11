// Server Component — homepage hero
interface Props {
  preferredSlug?: string | null
}

export function HeroSection({ preferredSlug: _ }: Props) {
  return (
    <section
      data-testid="hero-section"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0a0a0a 0%, #0f172a 50%, #1a0a2e 100%)' }}
    >
      {/* Grid decorativo de fundo */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: 'linear-gradient(rgba(99,102,241,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.3) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />
      {/* Glow central */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full opacity-20 blur-3xl"
        style={{ background: 'radial-gradient(circle, #6366f1 0%, transparent 70%)' }}
      />
      <div
        data-testid="hero-bg-image"
        className="absolute inset-0"
        aria-hidden="true"
      />
      <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
        <div
          className="inline-block px-4 py-1 rounded-full text-xs font-semibold mb-6 tracking-widest uppercase"
          style={{ background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.4)', color: '#a5b4fc' }}
        >
          Impressao 3D personalizada
        </div>
        <h1
          data-testid="hero-headline"
          className="text-5xl md:text-7xl font-black mb-6 leading-tight"
          style={{ textShadow: '0 0 40px rgba(99,102,241,0.5)' }}
        >
          Feito para voce.<br />
          <span style={{ color: '#818cf8' }}>So para voce.</span>
        </h1>
        <p
          className="text-lg md:text-xl mb-10 max-w-2xl mx-auto"
          style={{ color: '#94a3b8' }}
        >
          Produtos unicos, impressos em 3D com o seu estilo.<br />
          Do setup gamer ao presente perfeito — cada peca conta sua historia.
        </p>
        <a
          data-testid="hero-cta-universos"
          href="#universos-section"
          className="inline-flex items-center gap-2 font-bold py-4 px-10 rounded-xl text-lg transition-all duration-300"
          style={{
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            boxShadow: '0 0 30px rgba(99,102,241,0.4)',
            color: 'white',
          }}
        >
          Descobrir meu universo
          <span aria-hidden="true">&#8594;</span>
        </a>
        <p className="mt-4 text-sm" style={{ color: '#475569' }}>
          Sem cadastro para explorar &middot; Entrega em todo Brasil
        </p>
      </div>
      {/* Seta scroll */}
      <div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce"
        style={{ color: '#475569' }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 5v14M5 12l7 7 7-7"/>
        </svg>
      </div>
    </section>
  )
}
