import { db } from '@/lib/db'
import { notFound } from 'next/navigation'
import { Header } from '@/components/admin/header'
import { Badge } from '@/components/ui/badge'
import { formatDate, formatDateTime } from '@/lib/utils'
import Link from 'next/link'
import { ArrowLeft, Mail, Calendar, Dumbbell, Zap } from 'lucide-react'

export default async function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = await db.user.findUnique({
    where: { id },
    include: {
      subscription: { include: { plan: true } },
      workoutSessions: { orderBy: { completedAt: 'desc' }, take: 15 },
    },
  })

  const apiCallLogs = await db.apiCallLog.findMany({
    where: { userId: id },
    orderBy: { createdAt: 'desc' },
    take: 20,
  })

  if (!user) notFound()

  const statusVariant = user.status === 'ACTIVE' ? 'success' : user.status === 'SUSPENDED' ? 'warning' : 'destructive'
  const roleVariant   = user.role === 'SUPER_ADMIN' ? 'destructive' : user.role === 'ADMIN' ? 'warning' : 'secondary'

  return (
    <div>
      <Header
        title={user.name ?? user.email}
        description={user.email}
        actions={
          <Link href="/users" className="flex items-center gap-1.5 text-[13px] text-grey1 hover:text-snow transition-colors">
            <ArrowLeft className="h-4 w-4" /> Retour
          </Link>
        }
      />

      <div className="p-6 grid gap-4 lg:grid-cols-3">
        {/* Profile card */}
        <div className="lg:col-span-1 space-y-4">
          <div className="rounded-xl border border-[rgba(255,255,255,0.07)] bg-card p-5">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue/10 border border-blue/20">
              <span className="text-lg font-bold text-blue">
                {(user.name ?? user.email).charAt(0).toUpperCase()}
              </span>
            </div>
            <h2 className="text-[15px] font-semibold text-snow">{user.name ?? '—'}</h2>
            <p className="mb-4 text-[12px] text-grey2">{user.email}</p>
            <div className="flex flex-wrap gap-2">
              <Badge variant={statusVariant}>{user.status}</Badge>
              <Badge variant={roleVariant}>{user.role}</Badge>
            </div>
          </div>

          <div className="rounded-xl border border-[rgba(255,255,255,0.07)] bg-card p-5 space-y-3">
            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-grey2">Détails</h3>
            <InfoRow icon={<Mail className="h-3.5 w-3.5" />} label="Email" value={user.email} />
            <InfoRow icon={<Calendar className="h-3.5 w-3.5" />} label="Inscrit le" value={formatDate(user.createdAt)} />
            <InfoRow icon={<Dumbbell className="h-3.5 w-3.5" />} label="Séances" value={`${user.workoutSessions.length}`} />
            <InfoRow icon={<Zap className="h-3.5 w-3.5" />} label="Appels API" value={`${apiCallLogs.length}`} />
          </div>

          {/* Fitness profile */}
          <div className="rounded-xl border border-[rgba(255,255,255,0.07)] bg-card p-5 space-y-3">
            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-grey2">Profil fitness</h3>
            {user.profileCompleted ? (
              <>
                <InfoRow label="Objectif" value={GOAL_LABELS[user.goal ?? ''] ?? '—'} />
                <InfoRow label="Niveau" value={LEVEL_LABELS[user.fitnessLevel ?? ''] ?? '—'} />
                <InfoRow label="Mode de vie" value={LIFESTYLE_LABELS[user.lifestyle ?? ''] ?? '—'} />
                <InfoRow label="Fréquence" value={user.daysPerWeek ? `${user.daysPerWeek} séances/sem` : '—'} />
                <InfoRow label="Matériel" value={EQUIPMENT_LABELS[user.equipment ?? ''] ?? '—'} />
                <InfoRow label="Salle de sport" value={user.gymMember == null ? '—' : user.gymMember ? 'Oui' : 'Non'} />
                <InfoRow label="Mensurations" value={fmtMeasurements(user)} />
                {user.targetWeightKg ? (
                  <InfoRow label="Poids cible" value={`${Math.round(user.targetWeightKg)} kg`} />
                ) : null}
              </>
            ) : (
              <p className="text-[12px] text-grey2">Profil non complété</p>
            )}
          </div>

          {/* Subscription */}
          <div className="rounded-xl border border-[rgba(255,255,255,0.07)] bg-card p-5">
            <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-grey2">Abonnement</h3>
            {user.subscription ? (
              <div className="space-y-2">
                <div className="text-[14px] font-semibold text-snow">{user.subscription.plan.name}</div>
                <Badge variant={user.subscription.status === 'ACTIVE' ? 'success' : 'secondary'}>
                  {user.subscription.status}
                </Badge>
                <div className="text-[11px] text-grey2">Depuis le {formatDate(user.subscription.startedAt)}</div>
                {user.subscription.expiresAt && (
                  <div className="text-[11px] text-grey2">Expire le {formatDate(user.subscription.expiresAt)}</div>
                )}
              </div>
            ) : (
              <p className="text-[12px] text-grey2">Aucun abonnement</p>
            )}
          </div>
        </div>

        {/* Activity */}
        <div className="lg:col-span-2 space-y-4">
          {/* Recent workouts */}
          <div className="rounded-xl border border-[rgba(255,255,255,0.07)] bg-card">
            <div className="border-b border-[rgba(255,255,255,0.06)] px-5 py-3">
              <h3 className="text-[13px] font-semibold text-snow">Séances récentes</h3>
            </div>
            {user.workoutSessions.length === 0 ? (
              <p className="p-5 text-[13px] text-grey2">Aucune séance enregistrée.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[rgba(255,255,255,0.04)]">
                    {['Date', 'Objectif', 'Durée', 'Type'].map(h => (
                      <th key={h} className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-grey2">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgba(255,255,255,0.04)]">
                  {user.workoutSessions.map(ws => (
                    <tr key={ws.id} className="hover:bg-card-hi transition-colors">
                      <td className="px-4 py-2.5 text-[12px] text-grey1">{formatDateTime(ws.completedAt)}</td>
                      <td className="px-4 py-2.5 text-[12px] text-snow">{ws.goal ?? '—'}</td>
                      <td className="px-4 py-2.5 text-[12px] text-grey1">{ws.duration ? `${ws.duration} min` : '—'}</td>
                      <td className="px-4 py-2.5">
                        <Badge variant="secondary">{ws.type}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* API call logs */}
          <div className="rounded-xl border border-[rgba(255,255,255,0.07)] bg-card">
            <div className="border-b border-[rgba(255,255,255,0.06)] px-5 py-3">
              <h3 className="text-[13px] font-semibold text-snow">Appels API récents</h3>
            </div>
            {apiCallLogs.length === 0 ? (
              <p className="p-5 text-[13px] text-grey2">Aucun appel enregistré.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[rgba(255,255,255,0.04)]">
                    {['Date', 'Provider', 'Endpoint', 'Status', 'Durée'].map(h => (
                      <th key={h} className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-grey2">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgba(255,255,255,0.04)]">
                  {apiCallLogs.map(log => (
                    <tr key={log.id} className="hover:bg-card-hi transition-colors">
                      <td className="px-4 py-2.5 text-[12px] text-grey1">{formatDateTime(log.createdAt)}</td>
                      <td className="px-4 py-2.5 text-[12px] text-snow">{log.provider}</td>
                      <td className="px-4 py-2.5 text-[11px] font-mono text-grey2">{log.endpoint}</td>
                      <td className="px-4 py-2.5">
                        <Badge variant={log.statusCode < 400 ? 'success' : 'destructive'}>{log.statusCode}</Badge>
                      </td>
                      <td className="px-4 py-2.5 text-[12px] text-grey1">{log.durationMs}ms</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function InfoRow({ icon, label, value }: { icon?: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-1.5 text-[11px] text-grey2">
        {icon} {label}
      </div>
      <span className="text-[12px] text-snow text-right">{value}</span>
    </div>
  )
}

const SEX_LABELS: Record<string, string> = { male: 'Homme', female: 'Femme' }
const GOAL_LABELS: Record<string, string> = {
  loseFat: 'Perdre du gras',
  buildMuscle: 'Prendre du muscle',
  recomposition: 'Recomposition',
  maintain: 'Rester en forme',
  performance: 'Performer',
}
const LEVEL_LABELS: Record<string, string> = {
  beginner: 'Débutant',
  intermediate: 'Intermédiaire',
  advanced: 'Confirmé',
}
const LIFESTYLE_LABELS: Record<string, string> = {
  sedentary: 'Sédentaire',
  light: 'Peu actif',
  active: 'Actif',
  veryActive: 'Très actif',
}
const EQUIPMENT_LABELS: Record<string, string> = {
  bodyweight: 'Poids de corps',
  dumbbells: 'Haltères',
  machines: 'Machines guidées',
  fullGym: 'Salle complète',
}

function fmtMeasurements(u: {
  sex: string | null
  age: number | null
  heightCm: number | null
  weightKg: number | null
}): string {
  const parts: string[] = []
  if (u.sex) parts.push(SEX_LABELS[u.sex] ?? u.sex)
  if (u.age) parts.push(`${u.age} ans`)
  if (u.heightCm) parts.push(`${u.heightCm} cm`)
  if (u.weightKg) parts.push(`${Math.round(u.weightKg)} kg`)
  return parts.length ? parts.join(' · ') : '—'
}
