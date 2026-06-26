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

  const body: Record<string, string> = await req.json()

  await Promise.all(
    Object.entries(body).map(([key, value]) =>
      db.appConfig.upsert({
        where: { key },
        create: { key, value },
        update: { value },
      })
    )
  )

  return NextResponse.json({ ok: true })
}
