import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { authAppUser } from '@/lib/app-auth'
import { sanitizeFeatures, featureLabel } from '@/lib/features'

/** Lists the active subscription plans the user can choose from. */
export async function GET(req: NextRequest) {
  const user = await authAppUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const plans = await db.plan.findMany({
    where: { isActive: true },
    orderBy: { priceMonthly: 'asc' },
  })

  return NextResponse.json({
    plans: plans.map(p => {
      const features = sanitizeFeatures(p.features)
      return {
        id: p.id,
        name: p.name,
        slug: p.slug,
        description: p.description,
        priceMonthly: p.priceMonthly,
        maxWorkoutsDay: p.maxWorkoutsDay,
        maxAiCallsDay: p.maxAiCallsDay,
        features, // machine-readable keys
        featureLabels: features.map(featureLabel), // human-readable
      }
    }),
  })
}
