import { db } from '@/lib/db'
import { Header } from '@/components/admin/header'
import { sanitizeFeatures } from '@/lib/features'
import { AddPlanButton, PlanCard, type PlanData } from './plans-client'

export default async function PlansPage() {
  const plans = await db.plan.findMany({
    orderBy: { priceMonthly: 'asc' },
    include: { _count: { select: { subscriptions: true } } },
  })

  const data: PlanData[] = plans.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: p.description,
    priceMonthly: p.priceMonthly,
    maxWorkoutsDay: p.maxWorkoutsDay,
    maxAiCallsDay: p.maxAiCallsDay,
    features: sanitizeFeatures(p.features),
    isActive: p.isActive,
    subscribers: p._count.subscriptions,
  }))

  return (
    <div>
      <Header
        title="Plans d'abonnement"
        description="Gère les offres et les fonctionnalités incluses dans chacune"
        actions={<AddPlanButton />}
      />

      {data.length === 0 ? (
        <div className="p-6">
          <div className="rounded-xl border border-dashed border-[rgba(255,255,255,0.1)] p-10 text-center text-[13px] text-grey2">
            Aucun plan. Crée ton premier plan avec « Nouveau plan ».
          </div>
        </div>
      ) : (
        <div className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((plan) => (
            <PlanCard key={plan.id} plan={plan} />
          ))}
        </div>
      )}
    </div>
  )
}
