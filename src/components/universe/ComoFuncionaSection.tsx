// Server Component — 3-step "Como Funciona" section

interface Step {
  n: number
  testid: string
  emoji: string
  title: string
  desc: string
  color: string
}

const STEPS: Step[] = [
  {
    n: 1,
    testid: 'passo-1',
    emoji: '🎯',
    title: 'Escolha seu universo',
    desc: 'Gaming, Anime, Casa, Presentes ou Auto — cada universo tem produtos e personalizacao pensados para o seu perfil.',
    color: '#6366f1',
  },
  {
    n: 2,
    testid: 'passo-2',
    emoji: '✏️',
    title: 'Personalize com seus dados',
    desc: 'Adicione nome, cor, foto ou mensagem especial. Nosso sistema de personalizacao e feito para impressao 3D de verdade.',
    color: '#8b5cf6',
  },
  {
    n: 3,
    testid: 'passo-3',
    emoji: '📦',
    title: 'Receba unico no mundo',
    desc: 'Producao sob demanda. Cada peca e impressa, acabada e enviada diretamente para voce. Nenhuma igual a outra.',
    color: '#06b6d4',
  },
]

export function ComoFuncionaSection() {
  return (
    <section
      data-testid="como-funciona-section"
      className="py-20"
      style={{ background: '#f8fafc' }}
    >
      <div className="max-w-5xl mx-auto px-4">
        <div className="text-center mb-14">
          <p
            className="text-sm font-semibold tracking-widest uppercase mb-3"
            style={{ color: '#6366f1' }}
          >
            Simples assim
          </p>
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-3">
            Como funciona
          </h2>
          <p className="text-gray-500">Da ideia ao produto unico em 3 passos</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {STEPS.map(({ n, testid, emoji, title, desc, color }) => (
            <div
              key={n}
              data-testid={testid}
              className="relative p-8 rounded-2xl"
              style={{
                background: 'white',
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
              }}
            >
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-6"
                style={{ background: color + '15' }}
              >
                {emoji}
              </div>
              <div
                className="absolute top-6 right-6 text-6xl font-black opacity-5"
                style={{ color }}
              >
                {n}
              </div>
              <h3 className="font-bold text-lg text-gray-900 mb-3">{title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
