import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getFitnessApiConfig } from '@/lib/config'

export async function POST() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { apiKey, provider } = await getFitnessApiConfig()
  if (!apiKey) return NextResponse.json({ ok: false, error: 'No API key configured' })

  try {
    const res = await fetch('https://api.api-ninjas.com/v1/exercises?type=strength&limit=1', {
      headers: { 'X-Api-Key': apiKey },
      signal: AbortSignal.timeout(8000),
    })

    if (res.status === 401 || res.status === 403) return NextResponse.json({ ok: false, error: 'Invalid API key' })
    if (!res.ok) return NextResponse.json({ ok: false, error: `HTTP ${res.status}` })

    const data = await res.json() as unknown[]
    return NextResponse.json({ ok: true, provider, exercisesReturned: data.length })
  } catch (e) {
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : 'Connection failed' })
  }
}
