import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { sanitizeFeatures } from '@/lib/features'

const intOrUndef = (v: unknown) => {
  if (v === undefined) return undefined
  const n = typeof v === 'number' ? Math.trunc(v) : parseInt(String(v), 10)
  return Number.isFinite(n) ? n : undefined
}

/** Updates a plan (partial). Pass any subset of editable fields. */
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()

  const data: {
    name?: string
    description?: string | null
    priceMonthly?: number
    maxWorkoutsDay?: number
    maxAiCallsDay?: number
    features?: string[]
    isActive?: boolean
  } = {}

  if (body.name !== undefined) {
    const name = String(body.name).trim()
    if (!name) return NextResponse.json({ error: 'Le nom est requis' }, { status: 400 })
    data.name = name
  }
  if (body.description !== undefined) data.description = body.description ? String(body.description) : null
  if (typeof body.priceMonthly === 'number') data.priceMonthly = body.priceMonthly
  if (intOrUndef(body.maxWorkoutsDay) !== undefined) data.maxWorkoutsDay = intOrUndef(body.maxWorkoutsDay)
  if (intOrUndef(body.maxAiCallsDay) !== undefined) data.maxAiCallsDay = intOrUndef(body.maxAiCallsDay)
  if (body.features !== undefined) data.features = sanitizeFeatures(body.features)
  if (typeof body.isActive === 'boolean') data.isActive = body.isActive

  const plan = await db.plan.update({ where: { id: params.id }, data })
  return NextResponse.json({ plan })
}

/** Deletes a plan. Refused when subscriptions still reference it. */
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const count = await db.subscription.count({ where: { planId: params.id } })
  if (count > 0) {
    return NextResponse.json(
      { error: `Impossible : ${count} abonnement(s) utilisent ce plan. Désactive-le plutôt.` },
      { status: 409 },
    )
  }

  await db.plan.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
