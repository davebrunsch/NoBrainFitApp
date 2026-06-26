import { db } from '@/lib/db'
import { Header } from '@/components/admin/header'
import { Badge } from '@/components/ui/badge'
import { Check } from 'lucide-react'

export default async function PlansPage() {
  const plans = await db.plan.findMany({ orderBy: { priceMonthly: 'asc' } })

  return (
    <div>
      <Header
        title="Plans d'abonnement"
        description="Gère les offres disponibles pour les utilisateurs"
      />

      <div className="p-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {plans.map(plan => {
          const features = Array.isArray(plan.features) ? plan.features as string[] : []
          return (
            <div key={plan.id} className={`rounded-xl border bg-card p-5 ${plan.isActive ? 'border-[rgba(255,255,255,0.07)]' : 'border-[rgba(255,255,255,0.03)] opacity-50'}`}>
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <h3 className="text-[15px] font-bold text-snow">{plan.name}</h3>
                  <p className="text-[12px] text-grey2">{plan.description}</p>
                </div>
                <Badge variant={plan.isActive ? 'success' : 'secondary'}>
                  {plan.isActive ? 'Actif' : 'Inactif'}
                </Badge>
              </div>

              <div className="mb-4">
                <span className="text-2xl font-bold text-snow">
                  {plan.priceMonthly === 0 ? 'Gratuit' : `${(plan.priceMonthly / 100).toFixed(2)}€`}
                </span>
                {plan.priceMonthly > 0 && <span className="text-[12px] text-grey2">/mois</span>}
              </div>

              <div className="mb-4 space-y-1.5 text-[12px] text-grey1">
                <div>{plan.maxWorkoutsDay === -1 ? '∞' : plan.maxWorkoutsDay} séances / jour</div>
                <div>{plan.maxAiCallsDay  === -1 ? '∞' : plan.maxAiCallsDay}  appels IA / jour</div>
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
