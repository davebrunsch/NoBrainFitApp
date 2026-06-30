import { NextResponse } from 'next/server'
import { db } from './db'
import { resolveSubscription } from './subscription'

export type QuotaKind = 'workout' | 'ai'

interface QuotaResult {
  ok: boolean
  limit: number
  used: number
}

/** Checks a single daily quota for a user against their active (non-expired) plan. */
export async function checkQuota(userId: string, kind: QuotaKind): Promise<QuotaResult> {
  const plan = await resolveSubscription(userId)

  const limit = kind === 'workout' ? plan.maxWorkoutsDay : plan.maxAiCallsDay

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
