// ─── F5, F6: Root Layout ───
// Atende aos cenários: 5.1-5.8 (tema), 6.1-6.7 (layout), 6.7 (SEO)
import type { Metadata } from 'next'
import { Inter, Poppins } from 'next/font/google'
import { ThemeProvider } from '@/components/shared/theme-provider'
import { Header } from '@/components/shared/header'
import { Footer } from '@/components/shared/footer'
import { MetaPixel } from '@/components/shared/meta-pixel'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
})

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  variable: '--font-heading',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Impressão 3D Personalizada — Produtos com sua cara',
  description:
    'Produtos impressos em 3D com personalidade. Escolha seu universo, personalize com nome, cor e tamanho. Coleções Gamer, Anime, Casa, Presentes e Auto.',
  openGraph: {
    title: 'Impressão 3D Personalizada',
    description: 'Produtos impressos em 3D com personalidade. Personalize o seu.',
    type: 'website',
    locale: 'pt_BR',
  },
  robots: 'index, follow',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${inter.variable} ${poppins.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-background font-body text-foreground antialiased flex flex-col">
        <MetaPixel />
        <ThemeProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  )
}
