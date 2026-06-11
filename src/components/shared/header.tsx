'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { useTheme } from '@/components/shared/theme-provider'
import { Sun, Moon, ShoppingCart, Menu, X, Package, ChevronDown, User, ShoppingBag, LogOut, LayoutDashboard } from 'lucide-react'

function getFirstName(name?: string | null) {
  if (!name) return 'você'
  return name.split(' ')[0]
}

function Initials({ name }: { name?: string | null }) {
  const parts = (name || '?').trim().split(' ')
  const init = parts.length > 1
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : parts[0].slice(0, 2).toUpperCase()
  return (
    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
      {init}
    </span>
  )
}

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [cartCount, setCartCount] = useState(0)
  const { mode, toggleMode, mounted } = useTheme()
  const { data: session, status } = useSession()
  const userMenuRef = useRef<HTMLDivElement>(null)

  const isAdmin = (session?.user as { role?: string })?.role === 'admin'
  const firstName = getFirstName(session?.user?.name)

  useEffect(() => {
    function update() {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]')
      setCartCount(cart.reduce((s: number, i: { qty: number }) => s + i.qty, 0))
    }
    update()
    window.addEventListener('cart-updated', update)
    return () => window.removeEventListener('cart-updated', update)
  }, [])

  // Fecha dropdown ao clicar fora
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
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
          {/* Tema */}
          <button
            onClick={toggleMode}
            className="rounded-lg p-2 transition-colors hover:bg-muted"
            aria-label="Alternar tema"
            data-testid="theme-toggle"
          >
            {mounted ? (
              mode === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </button>

          {/* Carrinho — oculto para admin */}
          {!isAdmin && (
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
          )}

          {/* Auth — logado */}
          {status === 'authenticated' ? (
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen((v) => !v)}
                className="flex items-center gap-2 rounded-lg px-2 py-1 transition-colors hover:bg-muted"
                data-testid="user-menu-button"
              >
                <Initials name={session.user?.name} />
                <span className="hidden text-sm font-medium md:block">
                  Olá, {firstName}
                </span>
                <ChevronDown className={`h-4 w-4 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 rounded-xl border bg-card shadow-xl z-50 overflow-hidden">
                  <div className="border-b px-4 py-3">
                    <p className="text-xs text-muted-foreground">Conectado como</p>
                    <p className="truncate text-sm font-semibold">{session.user?.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{session.user?.email}</p>
                  </div>
                  <div className="py-1">
                    {isAdmin && (
                      <Link
                        href="/admin"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm transition-colors hover:bg-muted"
                      >
                        <LayoutDashboard className="h-4 w-4 text-primary" />
                        Painel Admin
                      </Link>
                    )}
                    {!isAdmin && (
                      <>
                        <Link
                          href="/conta"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm transition-colors hover:bg-muted"
                        >
                          <User className="h-4 w-4" />
                          Minha Conta
                        </Link>
                        <Link
                          href="/conta/pedidos"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm transition-colors hover:bg-muted"
                        >
                          <ShoppingBag className="h-4 w-4" />
                          Meus Pedidos
                        </Link>
                      </>
                    )}
                  </div>
                  <div className="border-t py-1">
                    <button
                      onClick={() => { setUserMenuOpen(false); signOut({ callbackUrl: '/' }) }}
                      className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 transition-colors hover:bg-red-50 dark:hover:bg-red-950/30"
                      data-testid="logout-button"
                    >
                      <LogOut className="h-4 w-4" />
                      Sair
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : status === 'unauthenticated' ? (
            <Link
              href="/auth/entrar"
              className="ml-1 text-sm font-medium transition-colors hover:text-primary"
              data-testid="login-link"
            >
              Entrar
            </Link>
          ) : null /* loading — sem flash */}

          {/* Mobile hamburger */}
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
            <Link href="/" className="text-sm font-medium" onClick={() => setMenuOpen(false)}>Início</Link>
            <Link href="/colecoes" className="text-sm font-medium" onClick={() => setMenuOpen(false)}>Coleções</Link>
            <Link href="/produtos" className="text-sm font-medium" onClick={() => setMenuOpen(false)}>Produtos</Link>
            {status === 'authenticated' && !isAdmin && (
              <>
                <Link href="/conta" className="text-sm font-medium" onClick={() => setMenuOpen(false)}>Minha Conta</Link>
                <Link href="/conta/pedidos" className="text-sm font-medium" onClick={() => setMenuOpen(false)}>Meus Pedidos</Link>
              </>
            )}
            {status === 'authenticated' && isAdmin && (
              <Link href="/admin" className="text-sm font-medium text-primary" onClick={() => setMenuOpen(false)}>Painel Admin</Link>
            )}
            {status === 'unauthenticated' && (
              <Link href="/auth/entrar" className="text-sm font-medium" onClick={() => setMenuOpen(false)}>Entrar</Link>
            )}
            {status === 'authenticated' && (
              <button
                onClick={() => { setMenuOpen(false); signOut({ callbackUrl: '/' }) }}
                className="text-left text-sm font-medium text-red-600"
              >
                Sair
              </button>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}
