// PATCH /api/user/preference
// Persists universe preference for both guests (cookie) and logged users (DB + cookie).

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'

const VALID_SLUGS = ['gaming', 'anime-nerd', 'casa-decor', 'presentes', 'auto']

export async function PATCH(request: NextRequest) {
  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const universeSlug = body['universeSlug']

  if (!universeSlug || typeof universeSlug !== 'string') {
    return NextResponse.json({ error: 'universeSlug is required' }, { status: 400 })
  }

  if (!VALID_SLUGS.includes(universeSlug)) {
    return NextResponse.json({ error: 'Invalid universe slug' }, { status: 400 })
  }

  const session = await auth()

  if (session && session.user && (session.user as Record<string, unknown>)['id']) {
    const userId = (session.user as Record<string, unknown>)['id'] as string
    await prisma.user.update({
      where: { id: userId },
      data: { preferredCollection: universeSlug },
    })
  }

  const response = NextResponse.json({ ok: true, universeSlug })
  response.cookies.set('universe_pref', universeSlug, {
    maxAge: 2592000,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    path: '/',
  })
  return response
}
