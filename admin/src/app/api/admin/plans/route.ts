import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const plans = await db.plan.findMany({
    orderBy: { priceMonthly: 'asc' },
    include: { _count: { select: { subscriptions: true } } },
  })
  return NextResponse.json(plans)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { name, description, priceMonthly, maxWorkoutsDay, maxAiCallsDay, features, isActive } = body

  if (!name || typeof name !== 'string') {
    return NextResponse.json({ error: 'Le nom est requis' }, { status: 400 })
  }

  const slug = (body.slug && String(body.slug).trim()) || slugify(name)
  if (!slug) return NextResponse.json({ error: 'Slug invalide' }, { status: 400 })

  const existing = await db.plan.findUnique({ where: { slug } })
  if (existing) return NextResponse.json({ error: `Le slug « ${slug} » existe déjà` }, { status: 409 })

  const plan = await db.plan.create({
    data: {
      name,
      slug,
      description:    description ?? null,
      priceMonthly:   Number(priceMonthly) || 0,
      maxWorkoutsDay: Number.isFinite(Number(maxWorkoutsDay)) ? Number(maxWorkoutsDay) : 3,
      maxAiCallsDay:  Number.isFinite(Number(maxAiCallsDay))  ? Number(maxAiCallsDay)  : 10,
      features:       Array.isArray(features) ? features : [],
      isActive:       isActive !== false,
    },
  })

  return NextResponse.json(plan, { status: 201 })
}
