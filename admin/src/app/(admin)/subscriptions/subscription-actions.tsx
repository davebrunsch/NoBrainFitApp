'use client'
import { useState } from 'react'
import { MoreHorizontal, XCircle, RefreshCw, CreditCard, CalendarClock, Trash2 } from 'lucide-react'

interface Plan { id: string; name: string }

interface Props {
  subscriptionId: string
  status: string
  currentPlanId: string
  expiresAt: string | null
  plans: Plan[]
}

export function SubscriptionActions({ subscriptionId, status, currentPlanId, expiresAt, plans }: Props) {
  const [open, setOpen]       = useState(false)
  const [loading, setLoading] = useState(false)

  async function call(action: string, body?: object) {
    setLoading(true)
    setOpen(false)
    const res = await fetch(`/api/admin/subscriptions/${subscriptionId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, ...body }),
    })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      alert(data.error ?? 'Une erreur est survenue')
      setLoading(false)
      return
    }
    window.location.reload()
  }

  async function remove() {
    setLoading(true)
    setOpen(false)
    await fetch(`/api/admin/subscriptions/${subscriptionId}`, { method: 'DELETE' })
    window.location.reload()
  }

  function setExpiry() {
    setOpen(false)
    const current = expiresAt ? expiresAt.slice(0, 10) : ''
    const input = prompt(
      'Date d\'expiration (AAAA-MM-JJ).\nLaisse vide pour « aucune expiration ».',
      current,
    )
    if (input === null) return // cancelled
    call('set_expiry', { expiresAt: input.trim() || null })
  }

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)}
        className="flex h-7 w-7 items-center justify-center rounded-lg border border-[rgba(255,255,255,0.08)] bg-card-hi text-grey1 hover:text-snow transition-colors">
        {loading
          ? <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-grey2 border-t-blue" />
          : <MoreHorizontal className="h-4 w-4" />}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-8 z-50 w-48 overflow-hidden rounded-xl border border-[rgba(255,255,255,0.08)] bg-card-hi shadow-xl">
            {status === 'ACTIVE' ? (
              <button onClick={() => call('cancel')}
                className="flex w-full items-center gap-2 px-3 py-2 text-[13px] text-[#F59E0B] hover:bg-[rgba(255,255,255,0.06)] transition-colors">
                <XCircle className="h-4 w-4" /> Annuler l'abonnement
              </button>
            ) : (
              <button onClick={() => call('reactivate')}
                className="flex w-full items-center gap-2 px-3 py-2 text-[13px] text-[#22C55E] hover:bg-[rgba(255,255,255,0.06)] transition-colors">
                <RefreshCw className="h-4 w-4" /> Réactiver
              </button>
            )}

            <button onClick={setExpiry}
              className="flex w-full items-center gap-2 px-3 py-2 text-[13px] text-snow hover:bg-[rgba(255,255,255,0.06)] transition-colors">
              <CalendarClock className="h-4 w-4 text-grey2" /> Date d'expiration
            </button>

            <div className="mx-2 my-1 h-px bg-[rgba(255,255,255,0.06)]" />
            <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-grey2">Changer de plan</div>
            {plans.filter(p => p.id !== currentPlanId).map(p => (
              <button key={p.id} onClick={() => call('change_plan', { planId: p.id })}
                className="flex w-full items-center gap-2 px-3 py-2 text-[13px] text-snow hover:bg-[rgba(255,255,255,0.06)] transition-colors">
                <CreditCard className="h-4 w-4 text-grey2" /> {p.name}
              </button>
            ))}

            <div className="mx-2 my-1 h-px bg-[rgba(255,255,255,0.06)]" />
            <button onClick={() => { if (confirm('Supprimer définitivement cet abonnement ?')) remove() }}
              className="flex w-full items-center gap-2 px-3 py-2 text-[13px] text-orange hover:bg-[rgba(255,255,255,0.06)] transition-colors">
              <Trash2 className="h-4 w-4" /> Supprimer
            </button>
          </div>
        </>
      )}
    </div>
  )
}
