import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const user = await db.user.findUnique({
    where: { id },
    include: {
      subscription: { include: { plan: true } },
      workoutSessions: { orderBy: { completedAt: 'desc' }, take: 10 },
    },
  })

  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(user)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  const { action, planId } = body

  if (action === 'suspend') {
    await db.user.update({ where: { id }, data: { status: 'SUSPENDED' } })
    return NextResponse.json({ ok: true })
  }

  if (action === 'activate') {
    await db.user.update({ where: { id }, data: { status: 'ACTIVE' } })
    return NextResponse.json({ ok: true })
  }

  if (action === 'delete') {
    await db.user.update({ where: { id }, data: { status: 'DELETED' } })
    return NextResponse.json({ ok: true })
  }

  if (action === 'change_plan' && planId) {
    const plan = await db.plan.findUnique({ where: { id: planId } })
    if (!plan) return NextResponse.json({ error: 'Plan not found' }, { status: 404 })

    await db.subscription.upsert({
      where: { userId: id },
      create: { userId: id, planId, status: 'ACTIVE', startedAt: new Date() },
      update: { planId, status: 'ACTIVE', startedAt: new Date(), expiresAt: null },
    })
    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}
