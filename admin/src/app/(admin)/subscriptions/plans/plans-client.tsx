'use client'
import { useState } from 'react'
import { Plus, X, Loader2, Pencil, Trash2, Power, Check } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { FEATURES, featureLabel } from '@/lib/features'

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
  subscribers: number
}

interface PlanForm {
  name: string
  slug: string
  description: string
  priceMonthly: number
  maxWorkoutsDay: number
  maxAiCallsDay: number
  features: string[]
  isActive: boolean
}

const emptyForm: PlanForm = {
  name: '', slug: '', description: '',
  priceMonthly: 0, maxWorkoutsDay: 3, maxAiCallsDay: 10,
  features: [], isActive: true,
}

// ── Add button (header) ─────────────────────────────────────────────────────
export function AddPlanButton() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-lg bg-blue px-4 py-2 text-[13px] font-semibold text-void hover:bg-blue/90 transition-colors">
        <Plus className="h-4 w-4" /> Nouveau plan
      </button>
      {open && <PlanFormDialog initial={null} onClose={() => setOpen(false)} />}
    </>
  )
}

// ── Plan card (interactive) ─────────────────────────────────────────────────
export function PlanCard({ plan }: { plan: PlanData }) {
  const [editing, setEditing] = useState(false)
  const [busy, setBusy] = useState(false)

  async function patch(body: Record<string, unknown>) {
    setBusy(true)
    await fetch(`/api/admin/plans/${plan.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    window.location.reload()
  }

  async function remove() {
    if (!confirm(`Supprimer le plan « ${plan.name} » ?`)) return
    setBusy(true)
    const res = await fetch(`/api/admin/plans/${plan.id}`, { method: 'DELETE' })
    if (!res.ok) {
      const d = await res.json().catch(() => ({}))
      alert(d.error ?? 'Suppression impossible')
      setBusy(false)
      return
    }
    window.location.reload()
  }

  return (
    <div className={`flex flex-col rounded-xl border bg-card p-5 ${plan.isActive ? 'border-[rgba(255,255,255,0.07)]' : 'border-[rgba(255,255,255,0.03)] opacity-60'}`}>
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h3 className="text-[15px] font-bold text-snow">{plan.name}</h3>
          <p className="text-[12px] text-grey2">{plan.description ?? '—'}</p>
        </div>
        <Badge variant={plan.isActive ? 'success' : 'secondary'}>
          {plan.isActive ? 'Actif' : 'Inactif'}
        </Badge>
      </div>

      <div className="mb-4">
        <span className="text-2xl font-bold text-snow">
          {plan.priceMonthly === 0 ? 'Gratuit' : `${plan.priceMonthly.toFixed(2)}€`}
        </span>
        {plan.priceMonthly > 0 && <span className="text-[12px] text-grey2">/mois</span>}
        <span className="ml-2 text-[11px] text-grey2">· {plan.subscribers} abonné(s)</span>
      </div>

      <div className="mb-4 space-y-1.5 text-[12px] text-grey1">
        <div>{plan.maxWorkoutsDay === -1 ? '∞' : plan.maxWorkoutsDay} séances / jour</div>
        <div>{plan.maxAiCallsDay === -1 ? '∞' : plan.maxAiCallsDay} appels IA / jour</div>
      </div>

      {plan.features.length > 0 && (
        <ul className="mb-4 space-y-1.5">
          {plan.features.map((f) => (
            <li key={f} className="flex items-center gap-2 text-[12px] text-grey1">
              <Check className="h-3.5 w-3.5 shrink-0 text-[#22C55E]" />
              {featureLabel(f)}
            </li>
          ))}
        </ul>
      )}

      <div className="mt-auto flex gap-2 border-t border-[rgba(255,255,255,0.06)] pt-3">
        <button onClick={() => setEditing(true)} disabled={busy}
          className="flex items-center gap-1.5 rounded-lg border border-[rgba(255,255,255,0.08)] bg-card-hi px-3 py-1.5 text-[12px] font-medium text-grey1 hover:text-snow transition-colors disabled:opacity-50">
          <Pencil className="h-3.5 w-3.5" /> Éditer
        </button>
        <button onClick={() => patch({ isActive: !plan.isActive })} disabled={busy}
          className="flex items-center gap-1.5 rounded-lg border border-[rgba(255,255,255,0.08)] bg-card-hi px-3 py-1.5 text-[12px] font-medium text-grey1 hover:text-snow transition-colors disabled:opacity-50">
          <Power className="h-3.5 w-3.5" /> {plan.isActive ? 'Désactiver' : 'Activer'}
        </button>
        <button onClick={remove} disabled={busy}
          className="ml-auto flex items-center gap-1.5 rounded-lg border border-[rgba(255,255,255,0.08)] bg-card-hi px-3 py-1.5 text-[12px] font-medium text-grey1 hover:text-orange transition-colors disabled:opacity-50">
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      {editing && (
        <PlanFormDialog
          initial={{
            id: plan.id,
            slug: plan.slug,
            form: {
              name: plan.name,
              slug: plan.slug,
              description: plan.description ?? '',
              priceMonthly: plan.priceMonthly,
              maxWorkoutsDay: plan.maxWorkoutsDay,
              maxAiCallsDay: plan.maxAiCallsDay,
              features: plan.features,
              isActive: plan.isActive,
            },
          }}
          onClose={() => setEditing(false)}
        />
      )}
    </div>
  )
}

// ── Create / edit dialog ────────────────────────────────────────────────────
function PlanFormDialog({
  initial,
  onClose,
}: {
  initial: { id: string; slug: string; form: PlanForm } | null
  onClose: () => void
}) {
  const isEdit = initial !== null
  const [form, setForm] = useState<PlanForm>(initial ? initial.form : emptyForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  type NumKey = 'priceMonthly' | 'maxWorkoutsDay' | 'maxAiCallsDay'
  type StrKey = 'name' | 'slug' | 'description'
  const setNum = (key: NumKey) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: Number(e.target.value) }))
  const setStr = (key: StrKey) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }))

  const toggleFeature = (key: string) =>
    setForm((f) => ({
      ...f,
      features: f.features.includes(key)
        ? f.features.filter((k) => k !== key)
        : [...f.features, key],
    }))

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    const res = await fetch(initial ? `/api/admin/plans/${initial.id}` : '/api/admin/plans', {
      method: initial ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (!res.ok) {
      const d = await res.json().catch(() => ({}))
      setError(d.error ?? 'Une erreur est survenue')
      setSaving(false)
      return
    }
    window.location.reload()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-[rgba(255,255,255,0.08)] bg-card p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-[15px] font-semibold text-snow">{isEdit ? 'Éditer le plan' : 'Nouveau plan'}</h2>
          <button onClick={onClose} className="text-grey2 hover:text-grey1"><X className="h-4 w-4" /></button>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Nom">
              <input required type="text" value={form.name} onChange={setStr('name')} placeholder="ex: Pro"
                className={inputCls} />
            </Field>
            <Field label={isEdit ? 'Slug (non modifiable)' : 'Slug (auto si vide)'}>
              <input type="text" value={form.slug} onChange={setStr('slug')} disabled={isEdit} placeholder="ex: pro"
                className={`${inputCls} ${isEdit ? 'opacity-50' : ''}`} />
            </Field>
          </div>

          <Field label="Description">
            <input type="text" value={form.description} onChange={setStr('description')} placeholder="Pour les sportifs réguliers"
              className={inputCls} />
          </Field>

          <div className="grid grid-cols-3 gap-3">
            <Field label="Prix €/mois">
              <input type="number" min={0} step={0.01} value={form.priceMonthly} onChange={setNum('priceMonthly')} className={inputCls} />
            </Field>
            <Field label="Séances/j (-1 = ∞)">
              <input type="number" min={-1} value={form.maxWorkoutsDay} onChange={setNum('maxWorkoutsDay')} className={inputCls} />
            </Field>
            <Field label="IA/j (-1 = ∞)">
              <input type="number" min={-1} value={form.maxAiCallsDay} onChange={setNum('maxAiCallsDay')} className={inputCls} />
            </Field>
          </div>

          <div>
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-grey2">Fonctionnalités incluses</label>
            <div className="space-y-1.5">
              {FEATURES.map((feat) => {
                const on = form.features.includes(feat.key)
                return (
                  <button type="button" key={feat.key} onClick={() => toggleFeature(feat.key)}
                    className={`flex w-full items-center gap-3 rounded-lg border px-3 py-2 text-left transition-colors ${on ? 'border-blue/50 bg-blue/10' : 'border-[rgba(255,255,255,0.08)] bg-card-hi hover:border-[rgba(255,255,255,0.15)]'}`}>
                    <div className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${on ? 'border-blue bg-blue' : 'border-grey2'}`}>
                      {on && <Check className="h-3 w-3 text-void" />}
                    </div>
                    <div>
                      <div className="text-[13px] font-medium text-snow">{feat.label}</div>
                      <div className="text-[11px] text-grey2">{feat.description}</div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          <label className="flex items-center gap-2.5 text-[13px] text-grey1">
            <input type="checkbox" checked={form.isActive} onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
              className="h-4 w-4 accent-blue" />
            Plan actif (visible par les utilisateurs)
          </label>

          {error && <p className="text-[12px] text-orange">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 rounded-lg border border-[rgba(255,255,255,0.08)] bg-card-hi py-2 text-[13px] font-medium text-grey1 hover:text-snow transition-colors">
              Annuler
            </button>
            <button type="submit" disabled={!form.name || saving}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue py-2 text-[13px] font-semibold text-void hover:bg-blue/90 transition-colors disabled:opacity-50">
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {isEdit ? 'Enregistrer' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const inputCls =
  'w-full rounded-lg border border-[rgba(255,255,255,0.08)] bg-card-hi px-3 py-2 text-sm text-snow placeholder:text-grey2 focus:outline-none focus:ring-2 focus:ring-blue'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-grey2">{label}</label>
      {children}
    </div>
  )
}
