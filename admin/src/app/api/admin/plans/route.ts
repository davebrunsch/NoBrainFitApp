import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { sanitizeFeatures } from '@/lib/features'

/** Lists every plan (active or not) with its subscriber count. */
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const plans = await db.plan.findMany({
    orderBy: { priceMonthly: 'asc' },
    include: { _count: { select: { subscriptions: true } } },
  })

  return NextResponse.json({ plans })
}

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

const intOrDefault = (v: unknown, def: number) => {
  const n = typeof v === 'number' ? Math.trunc(v) : parseInt(String(v), 10)
  return Number.isFinite(n) ? n : def
}

/** Creates a new plan. */
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const name = String(body.name ?? '').trim()
  if (!name) return NextResponse.json({ error: 'Le nom est requis' }, { status: 400 })

  const slug = (String(body.slug ?? '').trim() || slugify(name))
  if (!slug) return NextResponse.json({ error: 'Slug invalide' }, { status: 400 })

  const existing = await db.plan.findUnique({ where: { slug } })
  if (existing) return NextResponse.json({ error: 'Ce slug existe déjà' }, { status: 409 })

  const plan = await db.plan.create({
    data: {
      name,
      slug,
      description: body.description ? String(body.description) : null,
      priceMonthly: typeof body.priceMonthly === 'number' ? body.priceMonthly : 0,
      maxWorkoutsDay: intOrDefault(body.maxWorkoutsDay, 3),
      maxAiCallsDay: intOrDefault(body.maxAiCallsDay, 10),
      features: sanitizeFeatures(body.features),
      isActive: body.isActive !== false,
    },
  })

  return NextResponse.json({ plan }, { status: 201 })
}
