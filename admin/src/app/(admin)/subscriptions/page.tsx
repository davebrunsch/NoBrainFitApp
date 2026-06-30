import { db } from '@/lib/db'
import { Header } from '@/components/admin/header'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'
import { SubscriptionActions } from './subscription-actions'
import { NewSubscriptionButton } from './new-subscription-button'

interface SearchParams { status?: string; plan?: string }

function formatPrice(euros: number) {
  if (euros === 0) return 'Gratuit'
  return `${euros.toFixed(2).replace(/\.00$/, '')}€/mois`
}

export default async function SubscriptionsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams

  const where = {
    ...(params.status ? { status: params.status as 'ACTIVE' | 'EXPIRED' | 'CANCELLED' } : {}),
    ...(params.plan   ? { plan: { slug: params.plan } } : {}),
  }

  const [subscriptions, plans, counts] = await Promise.all([
    db.subscription.findMany({
      where,
      include: { user: true, plan: true },
      orderBy: { startedAt: 'desc' },
    }),
    db.plan.findMany({ where: { isActive: true }, orderBy: { priceMonthly: 'asc' } }),
    db.subscription.groupBy({ by: ['status'], _count: true }),
  ])

  const countOf = (s: string) => counts.find(c => c.status === s)?._count ?? 0
  const active    = countOf('ACTIVE')
  const expired   = countOf('EXPIRED')
  const cancelled = countOf('CANCELLED')

  return (
    <div>
      <Header
        title="Abonnements"
        description={`${active} actifs · ${expired} expirés · ${cancelled} annulés`}
        actions={
          <div className="flex items-center gap-3">
            <Link href="/subscriptions/plans"
              className="rounded-lg border border-[rgba(255,255,255,0.08)] bg-card-hi px-4 py-2 text-[13px] font-medium text-grey1 hover:text-snow transition-colors">
              Gérer les plans →
            </Link>
            <NewSubscriptionButton plans={plans.map(p => ({ id: p.id, name: p.name }))} />
          </div>
        }
      />

      {/* Stats row */}
      <div className="px-6 pt-6 grid grid-cols-3 gap-4">
        {[
          { label: 'Actifs', value: active,    color: 'text-[#22C55E]' },
          { label: 'Expirés', value: expired,  color: 'text-[#F59E0B]' },
          { label: 'Annulés', value: cancelled, color: 'text-grey1' },
        ].map(s => (
          <div key={s.label} className="rounded-xl border border-[rgba(255,255,255,0.07)] bg-card p-4">
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-[12px] text-grey2">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="p-6 space-y-4">
        {/* Filters */}
        <form method="GET" className="flex items-center gap-2 flex-wrap">
          <select name="status" defaultValue={params.status ?? ''}
            className="h-9 rounded-lg border border-[rgba(255,255,255,0.08)] bg-card px-2 text-sm text-snow focus:outline-none focus:ring-2 focus:ring-blue">
            <option value="">Tous les statuts</option>
            <option value="ACTIVE">Actif</option>
            <option value="EXPIRED">Expiré</option>
            <option value="CANCELLED">Annulé</option>
          </select>
          <select name="plan" defaultValue={params.plan ?? ''}
            className="h-9 rounded-lg border border-[rgba(255,255,255,0.08)] bg-card px-2 text-sm text-snow focus:outline-none focus:ring-2 focus:ring-blue">
            <option value="">Tous les plans</option>
            {plans.map(p => <option key={p.id} value={p.slug}>{p.name}</option>)}
          </select>
          <button type="submit" className="h-9 rounded-lg bg-blue/10 border border-blue/20 px-4 text-sm font-medium text-blue hover:bg-blue/20 transition-colors">
            Filtrer
          </button>
        </form>

        <div className="overflow-hidden rounded-xl border border-[rgba(255,255,255,0.07)] bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[rgba(255,255,255,0.06)]">
                {['Utilisateur', 'Plan', 'Statut', 'Début', 'Expiration', ''].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-grey2">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(255,255,255,0.04)]">
              {subscriptions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-[13px] text-grey2">
                    Aucun abonnement trouvé
                  </td>
                </tr>
              ) : subscriptions.map(sub => (
                <tr key={sub.id} className="hover:bg-card-hi transition-colors">
                  <td className="px-4 py-3">
                    <Link href={`/users/${sub.userId}`} className="text-[13px] font-medium text-snow hover:text-blue transition-colors">
                      {sub.user.name ?? sub.user.email}
                    </Link>
                    <div className="text-[11px] text-grey2">{sub.user.email}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[13px] text-snow">{sub.plan.name}</span>
                    <div className="text-[11px] text-grey2">{sub.plan.priceMonthly === 0 ? 'Gratuit' : `${sub.plan.priceMonthly.toFixed(2)}€/mois`}</div>
                  </td>
                  <td className="px-4 py-3">
                    <SubStatusBadge status={sub.status} />
                  </td>
                  <td className="px-4 py-3 text-[12px] text-grey1">{formatDate(sub.startedAt)}</td>
                  <td className="px-4 py-3 text-[12px] text-grey1">
                    {sub.expiresAt ? formatDate(sub.expiresAt) : <span className="text-grey2">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    <SubscriptionActions
                      subscriptionId={sub.id}
                      status={sub.status}
                      currentPlanId={sub.planId}
                      expiresAt={sub.expiresAt ? sub.expiresAt.toISOString() : null}
                      plans={plans.map(p => ({ id: p.id, name: p.name }))}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function SubStatusBadge({ status }: { status: string }) {
  if (status === 'ACTIVE')    return <Badge variant="success">Actif</Badge>
  if (status === 'EXPIRED')   return <Badge variant="warning">Expiré</Badge>
  return <Badge variant="secondary">Annulé</Badge>
}
