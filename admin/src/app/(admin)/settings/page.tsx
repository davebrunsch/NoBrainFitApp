import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { Header } from '@/components/admin/header'
import { SettingsForm } from './settings-form'

export default async function SettingsPage() {
  const session = await getServerSession(authOptions)
  const admins = await db.user.findMany({
    where: { role: { in: ['ADMIN', 'SUPER_ADMIN'] } },
    orderBy: { createdAt: 'asc' },
  })

  return (
    <div>
      <Header title="Paramètres" description="Configuration du compte administrateur et de l'application" />
      <div className="p-6 max-w-2xl space-y-6">
        <section className="rounded-xl border border-[rgba(255,255,255,0.07)] bg-card p-5">
          <h2 className="mb-4 text-[13px] font-semibold text-snow">Administrateurs</h2>
          <div className="space-y-2">
            {admins.map(a => (
              <div key={a.id} className="flex items-center justify-between rounded-lg border border-[rgba(255,255,255,0.06)] bg-card-hi px-4 py-3">
                <div>
                  <div className="text-[13px] font-medium text-snow">{a.name ?? a.email}</div>
                  <div className="text-[11px] text-grey2">{a.email}</div>
                </div>
                <span className={`rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${a.role === 'SUPER_ADMIN' ? 'bg-orange/10 text-orange' : 'bg-blue/10 text-blue'}`}>
                  {a.role}
                </span>
              </div>
            ))}
          </div>
        </section>

        <SettingsForm currentEmail={session?.user?.email ?? ''} />
      </div>
    </div>
  )
}
