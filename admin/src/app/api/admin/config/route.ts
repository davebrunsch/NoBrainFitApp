import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const configs = await db.appConfig.findMany({ orderBy: { key: 'asc' } })
  return NextResponse.json(configs)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const contentType = req.headers.get('content-type') ?? ''
  const isJson = contentType.includes('application/json')

  // Accepts three shapes:
  //   • JSON { entries: [{ key, value }] }     — ApiConfigCard "Sauvegarder"
  //   • JSON { key: value, ... } (flat record) — generic callers
  //   • urlencoded key=…&value=…               — BackendSelector native <form>
  let updates: { key: string; value: string }[] = []

  if (isJson) {
    const body = await req.json()
    if (Array.isArray(body?.entries)) {
      updates = body.entries
        .filter((e: { key?: unknown }) => typeof e?.key === 'string')
        .map((e: { key: string; value: unknown }) => ({ key: e.key, value: String(e.value ?? '') }))
    } else if (body && typeof body === 'object') {
      updates = Object.entries(body as Record<string, unknown>)
        .map(([key, value]) => ({ key, value: String(value ?? '') }))
    }
  } else {
    const form = await req.formData()
    const key = form.get('key')
    const value = form.get('value')
    if (typeof key === 'string' && typeof value === 'string') {
      updates = [{ key, value }]
    }
  }

  if (updates.length === 0) {
    return NextResponse.json({ error: 'No configuration provided' }, { status: 400 })
  }

  await db.$transaction(
    updates.map(({ key, value }) =>
      db.appConfig.upsert({
        where: { key },
        create: { key, value },
        update: { value },
      })
    )
  )

  // A native form submission navigates the browser — send it back to the page.
  if (!isJson) {
    return NextResponse.redirect(new URL('/apis', req.url), 303)
  }
  return NextResponse.json({ ok: true })
}
