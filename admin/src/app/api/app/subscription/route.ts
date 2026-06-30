import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { authAppUser } from '@/lib/app-auth'
import { resolveSubscription } from '@/lib/subscription'

/** Current plan, limits and today's usage for the authenticated user. */
export async function GET(req: NextRequest) {
  const user = await authAppUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const plan = await resolveSubscription(user.id)

  const startOfDay = new Date()
  startOfDay.setHours(0, 0, 0, 0)

  const [workoutsUsed, aiUsed] = await Promise.all([
    db.workoutSession.count({ where: { userId: user.id, createdAt: { gte: startOfDay } } }),
    db.apiCallLog.count({ where: { userId: user.id, createdAt: { gte: startOfDay } } }),
  ])

  const remaining = (limit: number, used: number) => (limit < 0 ? -1 : Math.max(0, limit - used))

  return NextResponse.json({
    plan: {
      name: plan.planName,
      slug: plan.planSlug,
      status: plan.status,
      priceMonthly: plan.priceMonthly,
      expiresAt: plan.expiresAt,
    },
    features: plan.features,
    limits: { workoutsPerDay: plan.maxWorkoutsDay, aiCallsPerDay: plan.maxAiCallsDay },
    usage: {
      workouts: workoutsUsed,
      aiCalls: aiUsed,
      workoutsRemaining: remaining(plan.maxWorkoutsDay, workoutsUsed),
      aiCallsRemaining: remaining(plan.maxAiCallsDay, aiUsed),
    },
  })
}

/**
 * Switches the user to another plan.
 * Free plans are applied immediately; paid plans require online checkout,
 * which isn't wired yet → 402. (Admins can still grant paid plans manually.)
 */
export async function POST(req: NextRequest) {
  const user = await authAppUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { planId } = await req.json()
  if (!planId) return NextResponse.json({ error: 'Missing planId' }, { status: 400 })

  const plan = await db.plan.findUnique({ where: { id: planId } })
  if (!plan || !plan.isActive) return NextResponse.json({ error: 'Plan not found' }, { status: 404 })

  if (plan.priceMonthly > 0) {
    return NextResponse.json(
      { error: 'Le paiement en ligne arrive bientôt. Contacte le support pour un plan payant.' },
      { status: 402 },
    )
  }

  await db.subscription.upsert({
    where: { userId: user.id },
    create: { userId: user.id, planId, status: 'ACTIVE', startedAt: new Date() },
    update: { planId, status: 'ACTIVE', startedAt: new Date(), expiresAt: null },
  })

  return NextResponse.json({ ok: true })
}
