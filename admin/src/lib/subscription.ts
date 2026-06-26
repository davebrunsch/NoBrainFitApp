import { db } from './db'

export interface ResolvedPlan {
  planId: string | null
  planName: string
  planSlug: string
  status: 'ACTIVE' | 'EXPIRED' | 'CANCELLED' | 'NONE'
  maxWorkoutsDay: number
  maxAiCallsDay: number
  priceMonthly: number
  expiresAt: Date | null
}

// Limits applied to users without an active paid subscription.
const FREE = { maxWorkoutsDay: 3, maxAiCallsDay: 10 }

/**
 * Resolves a user's effective plan, taking expiry into account.
 *
 * A subscription whose `expiresAt` is in the past is lazily flipped to
 * EXPIRED in the database and the user falls back to free-tier limits — so
 * quotas and the admin dashboard stay truthful without a separate cron job.
 */
export async function resolveSubscription(userId: string): Promise<ResolvedPlan> {
  const sub = await db.subscription.findUnique({ where: { userId }, include: { plan: true } })

  if (!sub) {
    return {
      planId: null, planName: 'Free', planSlug: 'free', status: 'NONE',
      ...FREE, priceMonthly: 0, expiresAt: null,
    }
  }

  let status = sub.status as ResolvedPlan['status']
  if (status === 'ACTIVE' && sub.expiresAt && sub.expiresAt.getTime() < Date.now()) {
    status = 'EXPIRED'
    await db.subscription.update({ where: { userId }, data: { status: 'EXPIRED' } }).catch(() => {})
  }

  const active = status === 'ACTIVE'
  return {
    planId:         active ? sub.planId : null,
    planName:       active ? sub.plan.name : 'Free',
    planSlug:       active ? sub.plan.slug : 'free',
    status,
    maxWorkoutsDay: active ? sub.plan.maxWorkoutsDay : FREE.maxWorkoutsDay,
    maxAiCallsDay:  active ? sub.plan.maxAiCallsDay : FREE.maxAiCallsDay,
    priceMonthly:   active ? sub.plan.priceMonthly : 0,
    expiresAt:      sub.expiresAt,
  }
}
