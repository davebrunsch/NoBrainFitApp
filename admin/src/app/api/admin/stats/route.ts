import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const now   = new Date()
  const day7  = new Date(now.getTime() - 7  * 24 * 60 * 60 * 1000)
  const day30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  const [
    totalUsers,
    activeUsers,
    newUsers7d,
    activeSubscriptions,
    workouts7d,
    workouts30d,
    apiCalls7d,
    apiErrors7d,
  ] = await Promise.all([
    db.user.count({ where: { status: 'ACTIVE' } }),
    db.user.count({ where: { status: 'ACTIVE', createdAt: { gte: day30 } } }),
    db.user.count({ where: { createdAt: { gte: day7 } } }),
    db.subscription.count({ where: { status: 'ACTIVE' } }),
    db.workoutSession.count({ where: { completedAt: { gte: day7 } }, }),
    db.workoutSession.count({ where: { completedAt: { gte: day30 } }, }),
    db.apiCallLog.count({ where: { createdAt: { gte: day7 } } }),
    db.apiCallLog.count({ where: { createdAt: { gte: day7 }, statusCode: { gte: 400 } } }),
  ])

  return NextResponse.json({
    users: { total: totalUsers, active: activeUsers, new7d: newUsers7d },
    subscriptions: { active: activeSubscriptions },
    workouts: { last7d: workouts7d, last30d: workouts30d },
    api: { calls7d: apiCalls7d, errors7d: apiErrors7d },
  })
}
