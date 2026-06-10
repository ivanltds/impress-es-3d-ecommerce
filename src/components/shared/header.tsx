'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useTheme } from '@/components/shared/theme-provider'
import { Sun, Moon, Search, ShoppingCart, Menu, X, Package } from 'lucide-react'

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [cartCount, setCartCount] = useState(0)
  const { mode, toggleMode, mounted } = useTheme()

  useEffect(() => {
    function update() {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]')
      setCartCount(cart.reduce((s: number, i: { qty: number }) => s + i.qty, 0))
    }
    update()
    window.addEventListener('cart-updated', update)
    return () => window.removeEventListener('cart-updated', update)
  }, [])

  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 font-heading text-xl font-bold tracking-tight transition-colors hover:text-primary"
          data-testid="header-logo"
        >
          <Package className="h-6 w-6 text-primary" />
          Impressão 3D
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-6 md:flex" data-testid="header-nav">
          <Link href="/" className="text-sm font-medium transition-colors hover:text-primary">
            Início
          </Link>
          <Link href="/colecoes" className="text-sm font-medium transition-colors hover:text-primary">
            Coleções
          </Link>
          <Link href="/produtos" className="text-sm font-medium transition-colors hover:text-primary">
            Produtos
          </Link>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleMode}
            className="rounded-lg p-2 transition-colors hover:bg-muted"
            aria-label="Alternar tema"
            data-testid="theme-toggle"
          >
            {mounted ? (
              mode === 'dark' ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </button>

          <button
            className="rounded-lg p-2 transition-colors hover:bg-muted"
            aria-label="Buscar"
            data-testid="search-button"
          >
            <Search className="h-5 w-5" />
          </button>

          <Link
            href="/carrinho"
            className="relative rounded-lg p-2 transition-colors hover:bg-muted"
            data-testid="cart-button"
          >
            <ShoppingCart className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground" data-testid="cart-count">
                {cartCount}
              </span>
            )}
            <span className="sr-only">Carrinho</span>
          </Link>

          <Link
            href="/auth/entrar"
            className="ml-1 text-sm font-medium transition-colors hover:text-primary"
            data-testid="login-link"
          >
            Entrar
          </Link>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="rounded-lg p-2 md:hidden"
            aria-label="Menu"
            data-testid="mobile-menu-button"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {menuOpen && (
        <div className="border-t bg-background px-4 pb-4 md:hidden" data-testid="mobile-drawer">
          <nav className="flex flex-col gap-3 pt-3">
            <Link href="/" className="text-sm font-medium" onClick={() => setMenuOpen(false)}>
              Início
            </Link>
            <Link href="/colecoes" className="text-sm font-medium" onClick={() => setMenuOpen(false)}>
              Coleções
            </Link>
            <Link href="/produtos" className="text-sm font-medium" onClick={() => setMenuOpen(false)}>
              Produtos
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}
