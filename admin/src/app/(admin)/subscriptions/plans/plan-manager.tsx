'use client'
import { useState } from 'react'
import { Plus, X, Loader2, MoreHorizontal, Pencil, Power, Trash2 } from 'lucide-react'

export interface PlanData {
  id: string
  name: string
  slug: string
  description: string | null
  priceMonthly: number
  maxWorkoutsDay: number
  maxAiCallsDay: number
  features: string[]
  isActive: boolean
  subscriberCount?: number
}

const EMPTY: Omit<PlanData, 'id'> = {
  name: '', slug: '', description: '', priceMonthly: 0,
  maxWorkoutsDay: 3, maxAiCallsDay: 10, features: [], isActive: true,
}

/** Shared create/edit modal. `plan` undefined → create mode. */
function PlanFormDialog({ plan, onClose }: { plan?: PlanData; onClose: () => void }) {
  const editing = !!plan
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState<string | null>(null)
  const [form, setForm] = useState<Omit<PlanData, 'id'>>(
    plan
      ? { ...plan, description: plan.description ?? '' }
      : { ...EMPTY },
  )

  function num(key: 'priceMonthly' | 'maxWorkoutsDay' | 'maxAiCallsDay') {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm(f => ({ ...f, [key]: e.target.value === '' ? 0 : Number(e.target.value) }))
  }
  function str(key: 'name' | 'slug' | 'description') {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm(f => ({ ...f, [key]: e.target.value }))
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const payload = {
      ...form,
      // empty slug → let the server derive it from the name
      slug: form.slug.trim() || undefined,
    }

    const res = await fetch(
      editing ? `/api/admin/plans/${plan!.id}` : '/api/admin/plans',
      {
        method: editing ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      },
    )

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
      <div className="relative w-full max-w-lg rounded-2xl border border-[rgba(255,255,255,0.08)] bg-card p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-[15px] font-semibold text-snow">{editing ? 'Modifier le plan' : 'Nouveau plan'}</h2>
          <button onClick={onClose} className="text-grey2 hover:text-grey1"><X className="h-4 w-4" /></button>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-grey2">Nom</label>
              <input required value={form.name} onChange={str('name')} placeholder="ex: Pro"
                className="w-full rounded-lg border border-[rgba(255,255,255,0.08)] bg-card-hi px-3 py-2 text-sm text-snow placeholder:text-grey2 focus:outline-none focus:ring-2 focus:ring-blue" />
            </div>
            <div>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-grey2">Slug (optionnel)</label>
              <input value={form.slug} onChange={str('slug')} placeholder="auto depuis le nom"
                className="w-full rounded-lg border border-[rgba(255,255,255,0.08)] bg-card-hi px-3 py-2 text-sm text-snow placeholder:text-grey2 focus:outline-none focus:ring-2 focus:ring-blue" />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-grey2">Description</label>
            <input value={form.description ?? ''} onChange={str('description')} placeholder="ex: Pour les sportifs réguliers"
              className="w-full rounded-lg border border-[rgba(255,255,255,0.08)] bg-card-hi px-3 py-2 text-sm text-snow placeholder:text-grey2 focus:outline-none focus:ring-2 focus:ring-blue" />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-grey2">Prix €/mois</label>
              <input type="number" min="0" step="0.01" value={form.priceMonthly} onChange={num('priceMonthly')}
                className="w-full rounded-lg border border-[rgba(255,255,255,0.08)] bg-card-hi px-3 py-2 text-sm text-snow focus:outline-none focus:ring-2 focus:ring-blue" />
            </div>
            <div>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-grey2">Séances/jour</label>
              <input type="number" min="-1" step="1" value={form.maxWorkoutsDay} onChange={num('maxWorkoutsDay')}
                className="w-full rounded-lg border border-[rgba(255,255,255,0.08)] bg-card-hi px-3 py-2 text-sm text-snow focus:outline-none focus:ring-2 focus:ring-blue" />
            </div>
            <div>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-grey2">Appels IA/jour</label>
              <input type="number" min="-1" step="1" value={form.maxAiCallsDay} onChange={num('maxAiCallsDay')}
                className="w-full rounded-lg border border-[rgba(255,255,255,0.08)] bg-card-hi px-3 py-2 text-sm text-snow focus:outline-none focus:ring-2 focus:ring-blue" />
            </div>
          </div>
          <p className="text-[11px] text-grey2">Astuce : utilise <span className="text-grey1">-1</span> pour « illimité ».</p>

          <div>
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-grey2">Fonctionnalités (une par ligne)</label>
            <textarea
              value={form.features.join('\n')}
              onChange={e => setForm(f => ({ ...f, features: e.target.value.split('\n').map(s => s.trim()).filter(Boolean) }))}
              rows={4}
              placeholder={'Programme RAG\nHistorique 30 jours'}
              className="w-full rounded-lg border border-[rgba(255,255,255,0.08)] bg-card-hi px-3 py-2 text-sm text-snow placeholder:text-grey2 focus:outline-none focus:ring-2 focus:ring-blue resize-none" />
          </div>

          <label className="flex items-center gap-2 text-[13px] text-grey1">
            <input type="checkbox" checked={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))}
              className="h-4 w-4 rounded border-[rgba(255,255,255,0.2)] bg-card-hi" />
            Plan actif (visible et souscriptible)
          </label>

          {error && (
            <div className="rounded-lg border border-orange/30 bg-orange/10 px-3 py-2 text-[12px] text-orange">{error}</div>
          )}

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 rounded-lg border border-[rgba(255,255,255,0.08)] bg-card-hi py-2 text-[13px] font-medium text-grey1 hover:text-snow transition-colors">
              Annuler
            </button>
            <button type="submit" disabled={!form.name || saving}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue py-2 text-[13px] font-semibold text-void hover:bg-blue/90 transition-colors disabled:opacity-50">
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {editing ? 'Enregistrer' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export function NewPlanButton() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-lg bg-blue px-4 py-2 text-[13px] font-semibold text-void hover:bg-blue/90 transition-colors">
        <Plus className="h-4 w-4" /> Nouveau plan
      </button>
      {open && <PlanFormDialog onClose={() => setOpen(false)} />}
    </>
  )
}

export function PlanActions({ plan }: { plan: PlanData }) {
  const [open, setOpen]   = useState(false)
  const [edit, setEdit]   = useState(false)
  const [loading, setLoading] = useState(false)

  async function call(method: 'PATCH' | 'DELETE', body?: object) {
    setLoading(true)
    setOpen(false)
    const res = await fetch(`/api/admin/plans/${plan.id}`, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      alert(data.error ?? 'Une erreur est survenue')
      setLoading(false)
      return
    }
    window.location.reload()
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
          <div className="absolute right-0 top-8 z-50 w-44 overflow-hidden rounded-xl border border-[rgba(255,255,255,0.08)] bg-card-hi shadow-xl">
            <button onClick={() => { setOpen(false); setEdit(true) }}
              className="flex w-full items-center gap-2 px-3 py-2 text-[13px] text-snow hover:bg-[rgba(255,255,255,0.06)] transition-colors">
              <Pencil className="h-4 w-4 text-grey2" /> Modifier
            </button>
            <button onClick={() => call('PATCH', { action: plan.isActive ? 'deactivate' : 'activate' })}
              className="flex w-full items-center gap-2 px-3 py-2 text-[13px] text-snow hover:bg-[rgba(255,255,255,0.06)] transition-colors">
              <Power className="h-4 w-4 text-grey2" /> {plan.isActive ? 'Désactiver' : 'Activer'}
            </button>
            <div className="mx-2 my-1 h-px bg-[rgba(255,255,255,0.06)]" />
            <button
              onClick={() => {
                const n = plan.subscriberCount ?? 0
                if (n > 0) { alert(`Impossible : ${n} abonnement(s) utilisent ce plan. Désactive-le plutôt.`); setOpen(false); return }
                if (confirm(`Supprimer le plan « ${plan.name} » ?`)) call('DELETE')
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-[13px] text-orange hover:bg-[rgba(255,255,255,0.06)] transition-colors">
              <Trash2 className="h-4 w-4" /> Supprimer
            </button>
          </div>
        </>
      )}

      {edit && <PlanFormDialog plan={plan} onClose={() => setEdit(false)} />}
    </div>
  )
}
