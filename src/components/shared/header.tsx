'use client'

// ─── F6: Header ───
// Atende aos cenários: 6.1 (desktop), 6.2 (mobile drawer), 6.3 (tablet/desktop)
import { useState } from 'react'
import Link from 'next/link'
import { useTheme } from '@/components/shared/theme-provider'

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { mode, toggleMode, mounted } = useTheme()

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link
          href="/"
          className="font-heading text-xl font-bold tracking-tight"
          data-testid="header-logo"
        >
          Impressão 3D
        </Link>

        {/* Desktop Nav */}
        <nav
          className="hidden items-center gap-6 md:flex"
          data-testid="header-nav"
        >
          <Link href="/" className="text-sm font-medium hover:text-primary">
            Início
          </Link>
          <span className="text-sm font-medium text-muted-foreground">
            Coleções
          </span>
          <span className="text-sm font-medium text-muted-foreground">
            Produtos
          </span>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle — F5.3 */}
          <button
            onClick={toggleMode}
            className="rounded-md p-2 hover:bg-muted"
            aria-label="Alternar tema"
            data-testid="theme-toggle"
          >
            {mounted ? (mode === 'dark' ? '☀️' : '🌙') : '🌙'}
          </button>

          {/* Search Icon — F6.1 (visual only in M01) */}
          <button
            className="rounded-md p-2 hover:bg-muted"
            aria-label="Buscar"
            data-testid="search-button"
          >
            🔍
          </button>

          {/* Cart Icon — F6.1 */}
          <Link
            href="/carrinho"
            className="relative rounded-md p-2 hover:bg-muted"
            data-testid="cart-button"
          >
            🛒
            <span className="sr-only">Carrinho</span>
          </Link>

          {/* Auth */}
          <Link
            href="/auth/entrar"
            className="text-sm font-medium hover:text-primary"
            data-testid="login-link"
          >
            Entrar
          </Link>
        </div>

        {/* Mobile Hamburger — F6.2 */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="rounded-md p-2 md:hidden"
          aria-label="Menu"
          data-testid="mobile-menu-button"
        >
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile Drawer — F6.2 */}
      {menuOpen && (
        <div
          className="border-t bg-background px-4 pb-4 md:hidden"
          data-testid="mobile-drawer"
        >
          <nav className="flex flex-col gap-3 pt-3">
            <Link
              href="/"
              className="text-sm font-medium"
              onClick={() => setMenuOpen(false)}
            >
              Início
            </Link>
            <span className="text-sm font-medium text-muted-foreground">
              Coleções
            </span>
            <span className="text-sm font-medium text-muted-foreground">
              Produtos
            </span>
          </nav>
        </div>
      )}
    </header>
  )
}
