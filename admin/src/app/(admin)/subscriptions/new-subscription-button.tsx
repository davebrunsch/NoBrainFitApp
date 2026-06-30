'use client'
import { useEffect, useState } from 'react'
import { Plus, X, Loader2, Search, Check } from 'lucide-react'

interface Plan { id: string; name: string }
interface EligibleUser { id: string; email: string; name: string | null }

export function NewSubscriptionButton({ plans }: { plans: Plan[] }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-lg bg-blue px-4 py-2 text-[13px] font-semibold text-void hover:bg-blue/90 transition-colors">
        <Plus className="h-4 w-4" /> Nouvel abonnement
      </button>
      {open && <Dialog plans={plans} onClose={() => setOpen(false)} />}
    </>
  )
}

function Dialog({ plans, onClose }: { plans: Plan[]; onClose: () => void }) {
  const [query, setQuery]       = useState('')
  const [users, setUsers]       = useState<EligibleUser[]>([])
  const [searching, setSearching] = useState(false)
  const [selected, setSelected] = useState<EligibleUser | null>(null)
  const [planId, setPlanId]     = useState(plans[0]?.id ?? '')
  const [expiresAt, setExpiresAt] = useState('')
  const [saving, setSaving]     = useState(false)
  const [error, setError]       = useState<string | null>(null)

  // Debounced search for users without a subscription.
  useEffect(() => {
    if (selected) return
    setSearching(true)
    const t = setTimeout(async () => {
      const res = await fetch(`/api/admin/subscriptions?q=${encodeURIComponent(query)}`)
      if (res.ok) setUsers(await res.json())
      setSearching(false)
    }, 250)
    return () => clearTimeout(t)
  }, [query, selected])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!selected || !planId) return
    setSaving(true)
    setError(null)
    const res = await fetch('/api/admin/subscriptions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: selected.id, planId, expiresAt: expiresAt || null }),
    })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setError(data.error ?? 'Une erreur est survenue')
      setSaving(false)
      return
    }
    window.location.reload()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl border border-[rgba(255,255,255,0.08)] bg-card p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-[15px] font-semibold text-snow">Nouvel abonnement</h2>
          <button onClick={onClose} className="text-grey2 hover:text-grey1"><X className="h-4 w-4" /></button>
        </div>

        <form onSubmit={submit} className="space-y-4">
          {/* User picker */}
          <div>
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-grey2">Utilisateur</label>
            {selected ? (
              <div className="flex items-center justify-between rounded-lg border border-blue/30 bg-blue/10 px-3 py-2">
                <div>
                  <div className="text-[13px] font-medium text-snow">{selected.name ?? selected.email}</div>
                  <div className="text-[11px] text-grey2">{selected.email}</div>
                </div>
                <button type="button" onClick={() => { setSelected(null); setQuery('') }}
                  className="text-grey2 hover:text-snow"><X className="h-4 w-4" /></button>
              </div>
            ) : (
              <>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-grey2" />
                  <input
                    autoFocus
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    placeholder="Rechercher par email ou nom…"
                    className="w-full rounded-lg border border-[rgba(255,255,255,0.08)] bg-card-hi pl-9 pr-3 py-2 text-sm text-snow placeholder:text-grey2 focus:outline-none focus:ring-2 focus:ring-blue" />
                </div>
                <div className="mt-2 max-h-44 overflow-y-auto rounded-lg border border-[rgba(255,255,255,0.06)] bg-card-hi">
                  {searching ? (
                    <div className="flex items-center justify-center gap-2 px-3 py-4 text-[12px] text-grey2">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" /> Recherche…
                    </div>
                  ) : users.length === 0 ? (
                    <div className="px-3 py-4 text-center text-[12px] text-grey2">
                      Aucun utilisateur sans abonnement
                    </div>
                  ) : users.map(u => (
                    <button key={u.id} type="button" onClick={() => setSelected(u)}
                      className="flex w-full items-center justify-between px-3 py-2 text-left hover:bg-[rgba(255,255,255,0.06)] transition-colors">
                      <div>
                        <div className="text-[13px] text-snow">{u.name ?? u.email}</div>
                        <div className="text-[11px] text-grey2">{u.email}</div>
                      </div>
                      <Check className="h-4 w-4 text-grey2 opacity-0" />
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Plan */}
          <div>
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-grey2">Plan</label>
            <select value={planId} onChange={e => setPlanId(e.target.value)}
              className="w-full rounded-lg border border-[rgba(255,255,255,0.08)] bg-card-hi px-3 py-2 text-sm text-snow focus:outline-none focus:ring-2 focus:ring-blue">
              {plans.length === 0 && <option value="">Aucun plan actif</option>}
              {plans.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>

          {/* Expiry (optional) */}
          <div>
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-grey2">Expiration (optionnel)</label>
            <input type="date" value={expiresAt} onChange={e => setExpiresAt(e.target.value)}
              className="w-full rounded-lg border border-[rgba(255,255,255,0.08)] bg-card-hi px-3 py-2 text-sm text-snow focus:outline-none focus:ring-2 focus:ring-blue [color-scheme:dark]" />
          </div>

          {error && (
            <div className="rounded-lg border border-orange/30 bg-orange/10 px-3 py-2 text-[12px] text-orange">{error}</div>
          )}

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 rounded-lg border border-[rgba(255,255,255,0.08)] bg-card-hi py-2 text-[13px] font-medium text-grey1 hover:text-snow transition-colors">
              Annuler
            </button>
            <button type="submit" disabled={!selected || !planId || saving}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue py-2 text-[13px] font-semibold text-void hover:bg-blue/90 transition-colors disabled:opacity-50">
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              Créer l'abonnement
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
