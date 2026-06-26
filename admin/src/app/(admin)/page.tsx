import { db } from '@/lib/db'
import { Header } from '@/components/admin/header'
import { StatCard } from '@/components/admin/stat-card'
import { Users, CreditCard, Dumbbell, Zap, Activity, AlertTriangle } from 'lucide-react'
import { formatDateTime } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

async function getStats() {
  const [
    totalUsers,
    activeSubscriptions,
    totalExercises,
    apiCallsToday,
    apiErrors,
    recentUsers,
    configStatus,
  ] = await Promise.all([
    db.user.count({ where: { status: 'ACTIVE' } }),
    db.subscription.count({ where: { status: 'ACTIVE' } }),
    db.exercise.count({ where: { isActive: true } }),
    db.apiCallLog.count({
      where: { createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } },
    }),
    db.apiCallLog.count({
      where: {
        statusCode: { gte: 400 },
        createdAt: { gte: new Date(Date.now() - 60 * 60 * 1000) },
      },
    }),
    db.user.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { subscription: { include: { plan: true } } },
    }),
    db.appConfig.findMany({
      where: { key: { in: ['ollama.base_url', 'claude.api_key', 'fitness_api.provider'] } },
    }),
  ])

  return { totalUsers, activeSubscriptions, totalExercises, apiCallsToday, apiErrors, recentUsers, configStatus }
}

export default async function DashboardPage() {
  const stats = await getStats()

  const ollamaUrl  = stats.configStatus.find(c => c.key === 'ollama.base_url')?.value ?? ''
  const claudeKey  = stats.configStatus.find(c => c.key === 'claude.api_key')?.value ?? ''
  const fitnessApi = stats.configStatus.find(c => c.key === 'fitness_api.provider')?.value ?? 'mock'

  return (
    <div>
      <Header title="Dashboard" description="Vue d'ensemble de la plateforme" />

      <div className="p-6 space-y-6">
        {/* Stats grid */}
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Utilisateurs actifs"
            value={stats.totalUsers}
            sub={`${stats.activeSubscriptions} abonnements actifs`}
            icon={Users}
            accent="blue"
            trend={{ value: 12, label: 'ce mois' }}
          />
          <StatCard
            title="Abonnements"
            value={stats.activeSubscriptions}
            sub={`${Math.round(stats.activeSubscriptions / Math.max(stats.totalUsers, 1) * 100)}% des users`}
            icon={CreditCard}
            accent="lime"
          />
          <StatCard
            title="Appels IA aujourd'hui"
            value={stats.apiCallsToday}
            sub={stats.apiErrors > 0 ? `${stats.apiErrors} erreurs (1h)` : 'Aucune erreur'}
            icon={Zap}
            accent={stats.apiErrors > 0 ? 'orange' : 'blue'}
          />
          <StatCard
            title="Bibliothèque exercices"
            value={stats.totalExercises}
            sub="Exercices actifs"
            icon={Dumbbell}
            accent="grey"
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Derniers inscrits */}
          <div className="rounded-xl border border-[rgba(255,255,255,0.07)] bg-card">
            <div className="flex items-center justify-between border-b border-[rgba(255,255,255,0.06)] px-5 py-4">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-blue" />
                <span className="text-[13px] font-semibold text-snow">Derniers inscrits</span>
              </div>
              <a href="/users" className="text-[12px] text-blue hover:underline">Voir tout →</a>
            </div>
            <div className="divide-y divide-[rgba(255,255,255,0.04)]">
              {stats.recentUsers.length === 0 ? (
                <div className="px-5 py-8 text-center text-[13px] text-grey2">Aucun utilisateur encore</div>
              ) : stats.recentUsers.map((u) => (
                <div key={u.id} className="flex items-center gap-3 px-5 py-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue/10 border border-blue/20 text-xs font-bold text-blue">
                    {(u.name ?? u.email)[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-medium text-snow truncate">{u.name ?? '—'}</div>
                    <div className="text-[11px] text-grey2 truncate">{u.email}</div>
                  </div>
                  <div className="text-right">
                    {u.subscription ? (
                      <Badge variant="default">{u.subscription.plan.name}</Badge>
                    ) : (
                      <Badge variant="secondary">Free</Badge>
                    )}
                    <div className="mt-0.5 text-[10px] text-grey2">{formatDateTime(u.createdAt)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Statut des APIs */}
          <div className="rounded-xl border border-[rgba(255,255,255,0.07)] bg-card">
            <div className="flex items-center gap-2 border-b border-[rgba(255,255,255,0.06)] px-5 py-4">
              <Zap className="h-4 w-4 text-blue" />
              <span className="text-[13px] font-semibold text-snow">Statut des APIs</span>
            </div>
            <div className="divide-y divide-[rgba(255,255,255,0.04)] p-1">
              <ApiStatusRow
                name="Ollama"
                description={ollamaUrl || 'Non configuré'}
                configured={!!ollamaUrl}
              />
              <ApiStatusRow
                name="Claude (Anthropic)"
                description={claudeKey ? `Clé configurée (sk-ant-…${claudeKey.slice(-4)})` : 'Clé non configurée'}
                configured={!!claudeKey}
              />
              <ApiStatusRow
                name="Fitness API"
                description={fitnessApi === 'mock' ? 'Mode mock (données locales)' : `Provider: ${fitnessApi}`}
                configured={true}
                warning={fitnessApi === 'mock'}
              />
            </div>
            <div className="px-5 pb-4 pt-2">
              <a href="/apis" className="text-[12px] text-blue hover:underline">Configurer les APIs →</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ApiStatusRow({ name, description, configured, warning }: {
  name: string; description: string; configured: boolean; warning?: boolean
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-card-hi transition-colors">
      <div className={`h-2 w-2 rounded-full shrink-0 ${warning ? 'bg-[#F59E0B]' : configured ? 'bg-[#22C55E]' : 'bg-grey2'}`} />
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-medium text-snow">{name}</div>
        <div className="text-[11px] text-grey2 truncate">{description}</div>
      </div>
      {warning ? (
        <AlertTriangle className="h-4 w-4 text-[#F59E0B] shrink-0" />
      ) : configured ? (
        <Badge variant="success">Actif</Badge>
      ) : (
        <Badge variant="secondary">Non configuré</Badge>
      )}
    </div>
  )
}
