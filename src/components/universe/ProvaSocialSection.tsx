// Server Component — testimonials section
// Renders null if fewer than 3 testimonials
interface Testimonial {
  id: string
  authorName: string
  authorPhoto?: string | null
  productPhoto?: string | null
  text: string
}

interface Props {
  testimonials: Testimonial[]
}

export function ProvaSocialSection({ testimonials }: Props) {
  if (testimonials.length < 3) return null

  return (
    <section data-testid="prova-social-section" className="py-16">
      <h2 className="text-2xl font-bold text-center mb-12">O que nossos clientes dizem</h2>
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 px-4">
        {testimonials.map((t) => (
          <div key={t.id} data-testid="depoimento-card" className="bg-white rounded-lg p-6 shadow">
            <p className="text-gray-700 mb-4">"{t.text}"</p>
            <div className="flex items-center gap-3">
              {t.authorPhoto && (
                <img src={t.authorPhoto} alt={t.authorName} className="w-10 h-10 rounded-full" />
              )}
              <span className="font-semibold">{t.authorName}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
