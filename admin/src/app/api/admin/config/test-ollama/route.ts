import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getOllamaConfig } from '@/lib/config'

export async function POST() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { url, model } = await getOllamaConfig()

  try {
    const res = await fetch(`${url}/api/tags`, { signal: AbortSignal.timeout(5000) })
    if (!res.ok) return NextResponse.json({ ok: false, error: `HTTP ${res.status}` })
    const data = await res.json() as { models?: { name: string }[] }
    const models = data.models?.map(m => m.name) ?? []
    const modelFound = models.includes(model)
    return NextResponse.json({ ok: true, models, modelFound, model })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Connection failed'
    return NextResponse.json({ ok: false, error: msg })
  }
}
