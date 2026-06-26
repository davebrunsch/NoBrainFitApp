import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await req.json()

  // Quick toggle action
  if (body.action === 'activate' || body.action === 'deactivate') {
    const plan = await db.plan.update({
      where: { id },
      data: { isActive: body.action === 'activate' },
    })
    return NextResponse.json(plan)
  }

  const { name, slug, description, priceMonthly, maxWorkoutsDay, maxAiCallsDay, features, isActive } = body

  // Guard slug uniqueness when it changes
  if (slug) {
    const clash = await db.plan.findFirst({ where: { slug, NOT: { id } } })
    if (clash) return NextResponse.json({ error: `Le slug « ${slug} » existe déjà` }, { status: 409 })
  }

  const plan = await db.plan.update({
    where: { id },
    data: {
      ...(name           !== undefined ? { name } : {}),
      ...(slug           !== undefined ? { slug } : {}),
      ...(description     !== undefined ? { description: description || null } : {}),
      ...(priceMonthly   !== undefined ? { priceMonthly: Number(priceMonthly) || 0 } : {}),
      ...(maxWorkoutsDay !== undefined ? { maxWorkoutsDay: Number(maxWorkoutsDay) } : {}),
      ...(maxAiCallsDay  !== undefined ? { maxAiCallsDay: Number(maxAiCallsDay) } : {}),
      ...(features        !== undefined ? { features: Array.isArray(features) ? features : [] } : {}),
      ...(isActive        !== undefined ? { isActive } : {}),
    },
  })

  return NextResponse.json(plan)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  const count = await db.subscription.count({ where: { planId: id } })
  if (count > 0) {
    return NextResponse.json(
      { error: `Impossible de supprimer : ${count} abonnement(s) utilisent ce plan. Désactive-le plutôt.` },
      { status: 409 },
    )
  }

  await db.plan.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
