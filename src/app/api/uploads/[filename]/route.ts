// ─── M04: Serve uploaded files (dev: /public, prod: /tmp) ───
import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import path from 'path'
import { existsSync } from 'fs'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ filename: string }> }) {
  const { filename } = await params
  // Security: only allow alphanumeric, dash, underscore, dot
  if (!/^[a-zA-Z0-9._-]+$/.test(filename)) {
    return NextResponse.json({ error: 'Invalid filename' }, { status: 400 })
  }

  const isProd = process.env.NODE_ENV === 'production'
  const filePath = isProd
    ? path.join('/tmp', 'uploads', filename)
    : path.join(process.cwd(), 'public', 'uploads', filename)

  if (!existsSync(filePath)) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const buffer = await readFile(filePath)
  const ext = path.extname(filename).toLowerCase()
  const mimeTypes: Record<string, string> = {
    '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png',
    '.webp': 'image/webp', '.gif': 'image/gif',
  }
  const contentType = mimeTypes[ext] || 'application/octet-stream'

  return new NextResponse(buffer, { headers: { 'Content-Type': contentType, 'Cache-Control': 'public, max-age=31536000' } })
}
