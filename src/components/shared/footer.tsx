// ─── F6: Footer ───
// Atende ao cenário: 6.4 (footer institucional)
import Link from 'next/link'

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t bg-muted/30" data-testid="footer">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-3">
          {/* Brand */}
          <div>
            <h3 className="font-heading text-lg font-bold">Impressão 3D</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Produtos personalizados com tecnologia de impressão 3D. Design
              autoral, produção sob demanda.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-heading text-sm font-semibold">Institucional</h4>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <Link
                  href="/termos"
                  className="text-muted-foreground hover:text-primary"
                >
                  Termos de Uso
                </Link>
              </li>
              <li>
                <Link
                  href="/privacidade"
                  className="text-muted-foreground hover:text-primary"
                >
                  Política de Privacidade
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="text-muted-foreground hover:text-primary"
                >
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Social + Newsletter */}
          <div>
            <h4 className="font-heading text-sm font-semibold">Redes Sociais</h4>
            <div className="mt-3 flex gap-3 text-lg">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary"
                aria-label="Instagram"
                data-testid="social-instagram"
              >
                📸
              </a>
              <a
                href="https://wa.me"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary"
                aria-label="WhatsApp"
                data-testid="social-whatsapp"
              >
                💬
              </a>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              Newsletter em breve.
            </p>
          </div>
        </div>

        <div className="mt-8 border-t pt-6 text-center text-xs text-muted-foreground">
          © {year} Impressão 3D Personalizada. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  )
}
