// Server Component — 3-step "Como Funciona" section
export function ComoFuncionaSection() {
  return (
    <section data-testid="como-funciona-section" className="py-16 bg-gray-50">
      <h2 className="text-2xl font-bold text-center mb-12">Como funciona</h2>
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
        <div data-testid="passo-1" className="text-center">
          <div className="text-4xl mb-4">1</div>
          <h3 className="font-bold text-lg mb-2">Escolha seu universo</h3>
          <p className="text-gray-600">Selecione o tema que combina com você</p>
        </div>
        <div data-testid="passo-2" className="text-center">
          <div className="text-4xl mb-4">2</div>
          <h3 className="font-bold text-lg mb-2">Personalize seu produto</h3>
          <p className="text-gray-600">Adicione seu nome, foto ou mensagem especial</p>
        </div>
        <div data-testid="passo-3" className="text-center">
          <div className="text-4xl mb-4">3</div>
          <h3 className="font-bold text-lg mb-2">Receba em casa</h3>
          <p className="text-gray-600">Entregamos diretamente para você</p>
        </div>
      </div>
    </section>
  )
}
