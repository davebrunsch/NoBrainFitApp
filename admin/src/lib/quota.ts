import { NextResponse } from 'next/server'
import { db } from './db'

export type QuotaKind = 'workout' | 'ai'

// Fallback limits when a user has no subscription (free tier).
const FREE_DEFAULTS = { maxWorkoutsDay: 3, maxAiCallsDay: 10 }

interface QuotaResult {
  ok: boolean
  limit: number
  used: number
}

/** Checks a single daily quota for a user against their active plan. */
export async function checkQuota(userId: string, kind: QuotaKind): Promise<QuotaResult> {
  const sub = await db.subscription.findUnique({ where: { userId }, include: { plan: true } })
  const plan = sub?.status === 'ACTIVE' ? sub.plan : null

  const limit =
    kind === 'workout'
      ? plan?.maxWorkoutsDay ?? FREE_DEFAULTS.maxWorkoutsDay
      : plan?.maxAiCallsDay ?? FREE_DEFAULTS.maxAiCallsDay

  if (limit < 0) return { ok: true, limit, used: 0 } // -1 = unlimited

  const startOfDay = new Date()
  startOfDay.setHours(0, 0, 0, 0)

  const used =
    kind === 'workout'
      ? await db.workoutSession.count({ where: { userId, createdAt: { gte: startOfDay } } })
      : await db.apiCallLog.count({ where: { userId, createdAt: { gte: startOfDay } } })

  return { ok: used < limit, limit, used }
}

/**
 * Enforces every requested quota. Returns a ready-to-send 429 response when
 * one is exceeded, or null when the request may proceed.
 */
export async function quotaGuard(userId: string, kinds: QuotaKind[]): Promise<NextResponse | null> {
  for (const kind of kinds) {
    const { ok, limit, used } = await checkQuota(userId, kind)
    if (!ok) {
      return NextResponse.json(
        { error: 'Quota exceeded', kind, limit, used },
        { status: 429 },
      )
    }
  }
  return null
}
