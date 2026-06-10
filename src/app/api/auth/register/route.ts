// ─── F4.1: Register API ───
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json()

    if (!email || !password || password.length < 8) {
      return NextResponse.json(
        { error: 'E-mail obrigatório e senha mínimo 8 caracteres' },
        { status: 400 }
      )
    }

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json(
        { error: 'Este e-mail já está cadastrado' },
        { status: 409 }
      )
    }

    const passwordHash = await bcrypt.hash(password, 12)
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: 'customer',
      },
    })

    return NextResponse.json(
      { id: user.id, email: user.email },
      { status: 201 }
    )
  } catch (err) {
    // F8.2: Log estruturado no servidor
    console.error('[register]', {
      event: 'register_error',
      error: err instanceof Error ? err.message : String(err),
      timestamp: new Date().toISOString(),
    })

    const message =
      process.env.NODE_ENV === 'development'
        ? `Erro ao criar conta: ${err instanceof Error ? err.message : 'Verifique se o banco de dados está configurado (DATABASE_URL)'}`
        : 'Erro interno ao criar conta'

    return NextResponse.json({ error: message }, { status: 500 })
  }
}
