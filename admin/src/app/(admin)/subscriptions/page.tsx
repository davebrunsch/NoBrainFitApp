import { db } from '@/lib/db'
import { Header } from '@/components/admin/header'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'

export default async function SubscriptionsPage() {
  const subscriptions = await db.subscription.findMany({
    include: { user: true, plan: true },
    orderBy: { startedAt: 'desc' },
  })

  const active   = subscriptions.filter(s => s.status === 'ACTIVE').length
  const expired  = subscriptions.filter(s => s.status === 'EXPIRED').length
  const cancelled = subscriptions.filter(s => s.status === 'CANCELLED').length

  return (
    <div>
      <Header
        title="Abonnements"
        description={`${active} actifs · ${expired} expirés · ${cancelled} annulés`}
        actions={
          <Link href="/subscriptions/plans"
            className="rounded-lg border border-[rgba(255,255,255,0.08)] bg-card-hi px-4 py-2 text-[13px] font-medium text-grey1 hover:text-snow transition-colors">
            Gérer les plans →
          </Link>
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

      <div className="p-6">
        <div className="overflow-hidden rounded-xl border border-[rgba(255,255,255,0.07)] bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[rgba(255,255,255,0.06)]">
                {['Utilisateur', 'Plan', 'Statut', 'Début', 'Expiration'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-grey2">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(255,255,255,0.04)]">
              {subscriptions.map(sub => (
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
