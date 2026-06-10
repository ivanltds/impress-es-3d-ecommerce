// ─── F8: Health Check Endpoint ───
// Atende ao cenário Gherkin: 8.1 (health check)
import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  })
}
