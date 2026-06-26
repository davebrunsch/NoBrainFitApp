import { db } from '@/lib/db'
import { Header } from '@/components/admin/header'
import { Badge } from '@/components/ui/badge'
import { Check, Users } from 'lucide-react'
import { NewPlanButton, PlanActions, type PlanData } from './plan-manager'

function formatPrice(euros: number) {
  if (euros === 0) return 'Gratuit'
  return `${euros.toFixed(2).replace(/\.00$/, '')}€`
}

export default async function PlansPage() {
  const plans = await db.plan.findMany({
    orderBy: { priceMonthly: 'asc' },
    include: { _count: { select: { subscriptions: true } } },
  })

  return (
    <div>
      <Header
        title="Plans d'abonnement"
        description="Gère les offres disponibles pour les utilisateurs"
        actions={<NewPlanButton />}
      />

      <div className="p-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {plans.length === 0 && (
          <div className="col-span-full rounded-xl border border-dashed border-[rgba(255,255,255,0.1)] bg-card p-10 text-center text-[13px] text-grey2">
            Aucun plan. Crée ton premier plan avec « Nouveau plan ».
          </div>
        )}
        {plans.map(plan => {
          const features = Array.isArray(plan.features) ? plan.features as string[] : []
          const planData: PlanData = {
            id: plan.id,
            name: plan.name,
            slug: plan.slug,
            description: plan.description,
            priceMonthly: plan.priceMonthly,
            maxWorkoutsDay: plan.maxWorkoutsDay,
            maxAiCallsDay: plan.maxAiCallsDay,
            features,
            isActive: plan.isActive,
            subscriberCount: plan._count.subscriptions,
          }
          return (
            <div key={plan.id} className={`rounded-xl border bg-card p-5 ${plan.isActive ? 'border-[rgba(255,255,255,0.07)]' : 'border-[rgba(255,255,255,0.03)] opacity-50'}`}>
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <h3 className="text-[15px] font-bold text-snow">{plan.name}</h3>
                  <p className="text-[12px] text-grey2">{plan.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={plan.isActive ? 'success' : 'secondary'}>
                    {plan.isActive ? 'Actif' : 'Inactif'}
                  </Badge>
                  <PlanActions plan={planData} />
                </div>
              </div>

              <div className="mb-4">
                <span className="text-2xl font-bold text-snow">{formatPrice(plan.priceMonthly)}</span>
                {plan.priceMonthly > 0 && <span className="text-[12px] text-grey2">/mois</span>}
              </div>

              <div className="mb-4 space-y-1.5 text-[12px] text-grey1">
                <div>{plan.maxWorkoutsDay === -1 ? '∞' : plan.maxWorkoutsDay} séances / jour</div>
                <div>{plan.maxAiCallsDay  === -1 ? '∞' : plan.maxAiCallsDay}  appels IA / jour</div>
                <div className="flex items-center gap-1.5 text-grey2">
                  <Users className="h-3.5 w-3.5" />
                  {plan._count.subscriptions} abonné{plan._count.subscriptions > 1 ? 's' : ''}
                </div>
              </div>

              {features.length > 0 && (
                <ul className="space-y-1.5">
                  {features.map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-[12px] text-grey1">
                      <Check className="h-3.5 w-3.5 shrink-0 text-[#22C55E]" />
                      {f}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
