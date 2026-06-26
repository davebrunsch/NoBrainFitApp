'use client'
import { useState } from 'react'
import { MoreHorizontal, Eye, ShieldOff, Shield, Trash2, CreditCard } from 'lucide-react'
import Link from 'next/link'

interface Plan { id: string; name: string; slug: string }

interface Props {
  userId: string
  status: string
  plans: Plan[]
  currentPlanId?: string
}

export function UserActions({ userId, status, plans, currentPlanId }: Props) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState<string | null>(null)

  async function call(action: string, body?: object) {
    setLoading(action)
    setOpen(false)
    await fetch(`/api/admin/users/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, ...body }),
    })
    setLoading(null)
    window.location.reload()
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex h-7 w-7 items-center justify-center rounded-lg border border-[rgba(255,255,255,0.08)] bg-card-hi text-grey1 hover:text-snow transition-colors"
      >
        {loading ? (
          <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-grey2 border-t-blue" />
        ) : (
          <MoreHorizontal className="h-4 w-4" />
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-8 z-50 w-44 overflow-hidden rounded-xl border border-[rgba(255,255,255,0.08)] bg-card-hi shadow-xl">
            <Link href={`/users/${userId}`} className="flex items-center gap-2 px-3 py-2 text-[13px] text-snow hover:bg-[rgba(255,255,255,0.06)] transition-colors">
              <Eye className="h-4 w-4 text-grey2" /> Voir le profil
            </Link>

            <div className="mx-2 my-1 h-px bg-[rgba(255,255,255,0.06)]" />

            {plans.map(plan => plan.id !== currentPlanId && (
              <button key={plan.id} onClick={() => call('change_plan', { planId: plan.id })}
                className="flex w-full items-center gap-2 px-3 py-2 text-[13px] text-snow hover:bg-[rgba(255,255,255,0.06)] transition-colors">
                <CreditCard className="h-4 w-4 text-grey2" /> Plan {plan.name}
              </button>
            ))}

            <div className="mx-2 my-1 h-px bg-[rgba(255,255,255,0.06)]" />

            {status === 'ACTIVE' ? (
              <button onClick={() => call('suspend')}
                className="flex w-full items-center gap-2 px-3 py-2 text-[13px] text-[#F59E0B] hover:bg-[rgba(255,255,255,0.06)] transition-colors">
                <ShieldOff className="h-4 w-4" /> Suspendre
              </button>
            ) : (
              <button onClick={() => call('activate')}
                className="flex w-full items-center gap-2 px-3 py-2 text-[13px] text-[#22C55E] hover:bg-[rgba(255,255,255,0.06)] transition-colors">
                <Shield className="h-4 w-4" /> Réactiver
              </button>
            )}
            <button onClick={() => { if (confirm('Supprimer définitivement ?')) call('delete') }}
              className="flex w-full items-center gap-2 px-3 py-2 text-[13px] text-orange hover:bg-[rgba(255,255,255,0.06)] transition-colors">
              <Trash2 className="h-4 w-4" /> Supprimer
            </button>
          </div>
        </>
      )}
    </div>
  )
}
