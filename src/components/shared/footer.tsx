import Link from 'next/link'
import { Camera, MessageCircle, ArrowUpRight } from 'lucide-react'

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t bg-muted/30" data-testid="footer">
      <div className="container mx-auto px-4 py-16">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <h3 className="font-heading text-lg font-bold">Impressão 3D</h3>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">
              Produtos personalizados com tecnologia de impressão 3D. Design autoral, produção sob demanda.
            </p>
          </div>

          <div>
            <h4 className="font-heading text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Institucional
            </h4>
            <ul className="mt-4 space-y-3 text-sm">
              {[
                { href: '/termos', label: 'Termos de Uso' },
                { href: '/privacidade', label: 'Política de Privacidade' },
                { href: '/faq', label: 'FAQ' },
              ].map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="inline-flex items-center gap-1 text-muted-foreground transition-colors hover:text-primary"
                  >
                    {l.label}
                    <ArrowUpRight className="h-3 w-3" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-heading text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Redes Sociais
            </h4>
            <div className="mt-4 flex gap-3">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-lg border bg-card text-muted-foreground transition-all hover:border-primary/50 hover:text-primary hover:shadow-md"
                aria-label="Instagram"
                data-testid="social-instagram"
              >
                <Camera className="h-5 w-5" />
              </a>
              <a
                href="https://wa.me"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-lg border bg-card text-muted-foreground transition-all hover:border-green-500/50 hover:text-green-500 hover:shadow-md"
                aria-label="WhatsApp"
                data-testid="social-whatsapp"
              >
                <MessageCircle className="h-5 w-5" />
              </a>
            </div>
            <p className="mt-5 text-xs text-muted-foreground">
              Newsletter em breve.
            </p>
          </div>
        </div>

        <div className="mt-12 border-t pt-6 text-center text-xs text-muted-foreground">
          © {year} Impressão 3D Personalizada. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  )
}
