import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const { action, planId, expiresAt } = await req.json()

  if (action === 'cancel') {
    await db.subscription.update({ where: { id }, data: { status: 'CANCELLED' } })
    return NextResponse.json({ ok: true })
  }

  if (action === 'reactivate') {
    await db.subscription.update({
      where: { id },
      data: { status: 'ACTIVE', startedAt: new Date() },
    })
    return NextResponse.json({ ok: true })
  }

  if (action === 'change_plan') {
    if (!planId) return NextResponse.json({ error: 'planId requis' }, { status: 400 })
    const plan = await db.plan.findUnique({ where: { id: planId } })
    if (!plan) return NextResponse.json({ error: 'Plan introuvable' }, { status: 404 })
    await db.subscription.update({ where: { id }, data: { planId } })
    return NextResponse.json({ ok: true })
  }

  if (action === 'set_expiry') {
    // expiresAt: ISO date string, or null/'' to clear (= no expiration)
    const date = expiresAt ? new Date(expiresAt) : null
    if (expiresAt && Number.isNaN(date!.getTime())) {
      return NextResponse.json({ error: 'Date invalide' }, { status: 400 })
    }
    await db.subscription.update({ where: { id }, data: { expiresAt: date } })
    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ error: 'Action inconnue' }, { status: 400 })
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  await db.subscription.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
