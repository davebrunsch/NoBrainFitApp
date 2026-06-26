import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { authAppUser } from '@/lib/app-auth'

/** Lists the active subscription plans the user can choose from. */
export async function GET(req: NextRequest) {
  const user = await authAppUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const plans = await db.plan.findMany({
    where: { isActive: true },
    orderBy: { priceMonthly: 'asc' },
  })

  return NextResponse.json({
    plans: plans.map(p => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      description: p.description,
      priceMonthly: p.priceMonthly,
      maxWorkoutsDay: p.maxWorkoutsDay,
      maxAiCallsDay: p.maxAiCallsDay,
      features: Array.isArray(p.features) ? p.features : [],
    })),
  })
}
