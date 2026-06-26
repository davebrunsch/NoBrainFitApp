import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getClaudeConfig } from '@/lib/config'

export async function POST() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { apiKey, model } = await getClaudeConfig()
  if (!apiKey) return NextResponse.json({ ok: false, error: 'No API key configured' })

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model,
        max_tokens: 10,
        messages: [{ role: 'user', content: 'ping' }],
      }),
      signal: AbortSignal.timeout(10000),
    })

    if (res.status === 401) return NextResponse.json({ ok: false, error: 'Invalid API key' })
    if (!res.ok) {
      const err = await res.json().catch(() => ({})) as { error?: { message?: string } }
      return NextResponse.json({ ok: false, error: err?.error?.message ?? `HTTP ${res.status}` })
    }
    return NextResponse.json({ ok: true, model })
  } catch (e) {
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : 'Connection failed' })
  }
}
