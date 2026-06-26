import { db } from '@/lib/db'
import { Header } from '@/components/admin/header'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'
import { UserActions } from './user-actions'

interface SearchParams { q?: string; status?: string; plan?: string; page?: string }

async function getUsers(params: SearchParams) {
  const page  = parseInt(params.page ?? '1', 10)
  const limit = 20
  const skip  = (page - 1) * limit

  const where = {
    ...(params.status ? { status: params.status as 'ACTIVE' | 'SUSPENDED' | 'DELETED' } : {}),
    ...(params.q ? {
      OR: [
        { email: { contains: params.q, mode: 'insensitive' as const } },
        { name:  { contains: params.q, mode: 'insensitive' as const } },
      ],
    } : {}),
    ...(params.plan ? {
      subscription: { plan: { slug: params.plan } },
    } : {}),
  }

  const [users, total] = await Promise.all([
    db.user.findMany({
      where,
      take:    limit,
      skip,
      orderBy: { createdAt: 'desc' },
      include: { subscription: { include: { plan: true } } },
    }),
    db.user.count({ where }),
  ])

  return { users, total, page, totalPages: Math.ceil(total / limit) }
}

export default async function UsersPage({ searchParams }: { searchParams: SearchParams }) {
  const { users, total, page, totalPages } = await getUsers(searchParams)
  const plans = await db.plan.findMany({ where: { isActive: true }, orderBy: { priceMonthly: 'asc' } })

  return (
    <div>
      <Header title="Utilisateurs" description={`${total} utilisateurs au total`} />

      <div className="p-6 space-y-4">
        {/* Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          <form method="GET" className="flex items-center gap-2 flex-1">
            <input
              name="q"
              defaultValue={searchParams.q}
              placeholder="Rechercher par email ou nom…"
              className="h-9 flex-1 max-w-xs rounded-lg border border-[rgba(255,255,255,0.08)] bg-card px-3 text-sm text-snow placeholder:text-grey2 focus:outline-none focus:ring-2 focus:ring-blue focus:ring-offset-2 focus:ring-offset-surface"
            />
            <select
              name="status"
              defaultValue={searchParams.status ?? ''}
              className="h-9 rounded-lg border border-[rgba(255,255,255,0.08)] bg-card px-2 text-sm text-snow focus:outline-none focus:ring-2 focus:ring-blue"
            >
              <option value="">Tous les statuts</option>
              <option value="ACTIVE">Actif</option>
              <option value="SUSPENDED">Suspendu</option>
              <option value="DELETED">Supprimé</option>
            </select>
            <select
              name="plan"
              defaultValue={searchParams.plan ?? ''}
              className="h-9 rounded-lg border border-[rgba(255,255,255,0.08)] bg-card px-2 text-sm text-snow focus:outline-none focus:ring-2 focus:ring-blue"
            >
              <option value="">Tous les plans</option>
              {plans.map(p => <option key={p.id} value={p.slug}>{p.name}</option>)}
            </select>
            <button type="submit" className="h-9 rounded-lg bg-blue/10 border border-blue/20 px-4 text-sm font-medium text-blue hover:bg-blue/20 transition-colors">
              Filtrer
            </button>
          </form>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-xl border border-[rgba(255,255,255,0.07)] bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[rgba(255,255,255,0.06)]">
                {['Utilisateur', 'Plan', 'Statut', 'Rôle', 'Inscription', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-grey2">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(255,255,255,0.04)]">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-[13px] text-grey2">
                    Aucun utilisateur trouvé
                  </td>
                </tr>
              ) : users.map((u) => (
                <tr key={u.id} className="hover:bg-card-hi transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue/10 border border-blue/20 text-xs font-bold text-blue">
                        {(u.name ?? u.email)[0].toUpperCase()}
                      </div>
                      <div>
                        <Link href={`/users/${u.id}`} className="text-[13px] font-medium text-snow hover:text-blue transition-colors">
                          {u.name ?? '—'}
                        </Link>
                        <div className="text-[11px] text-grey2">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {u.subscription ? (
                      <Badge variant="default">{u.subscription.plan.name}</Badge>
                    ) : (
                      <Badge variant="secondary">Free</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={u.status} />
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[12px] text-grey1">{u.role === 'SUPER_ADMIN' ? 'Super Admin' : u.role === 'ADMIN' ? 'Admin' : 'User'}</span>
                  </td>
                  <td className="px-4 py-3 text-[12px] text-grey1 whitespace-nowrap">
                    {formatDate(u.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <UserActions userId={u.id} status={u.status} plans={plans} currentPlanId={u.subscription?.planId} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between text-[12px] text-grey2">
            <span>Page {page} sur {totalPages} · {total} résultats</span>
            <div className="flex items-center gap-2">
              {page > 1 && (
                <a href={`?page=${page - 1}&q=${searchParams.q ?? ''}&status=${searchParams.status ?? ''}`}
                  className="rounded-lg border border-[rgba(255,255,255,0.07)] bg-card px-3 py-1.5 hover:bg-card-hi transition-colors text-snow">
                  ← Précédent
                </a>
              )}
              {page < totalPages && (
                <a href={`?page=${page + 1}&q=${searchParams.q ?? ''}&status=${searchParams.status ?? ''}`}
                  className="rounded-lg border border-[rgba(255,255,255,0.07)] bg-card px-3 py-1.5 hover:bg-card-hi transition-colors text-snow">
                  Suivant →
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'ACTIVE')    return <Badge variant="success">Actif</Badge>
  if (status === 'SUSPENDED') return <Badge variant="warning">Suspendu</Badge>
  return <Badge variant="destructive">Supprimé</Badge>
}
