'use client'
import { useState } from 'react'
import { Plus, X, Loader2 } from 'lucide-react'

export function AddExerciseDialog() {
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: '', type: 'strength', muscle: '', equipment: 'body_only', difficulty: 'beginner',
  })

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    await fetch('/api/admin/exercises', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setSaving(false)
    setOpen(false)
    setForm({ name: '', type: 'strength', muscle: '', equipment: 'body_only', difficulty: 'beginner' })
    window.location.reload()
  }

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [key]: e.target.value }))

  return (
    <>
      <button onClick={() => setOpen(true)} className="flex items-center gap-2 rounded-lg bg-blue px-4 py-2 text-[13px] font-semibold text-void hover:bg-blue/90 transition-colors">
        <Plus className="h-4 w-4" /> Ajouter
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative w-full max-w-md rounded-2xl border border-[rgba(255,255,255,0.08)] bg-card p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-[15px] font-semibold text-snow">Nouvel exercice</h2>
              <button onClick={() => setOpen(false)} className="text-grey2 hover:text-grey1"><X className="h-4 w-4" /></button>
            </div>
            <form onSubmit={submit} className="space-y-4">
              {[
                { label: 'Nom de l\'exercice', key: 'name', type: 'input', placeholder: 'ex: Pompes déclinées' },
              ].map(f => (
                <div key={f.key}>
                  <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-grey2">{f.label}</label>
                  <input required type="text" value={form.name} onChange={set('name')} placeholder={f.placeholder}
                    className="w-full rounded-lg border border-[rgba(255,255,255,0.08)] bg-card-hi px-3 py-2 text-sm text-snow placeholder:text-grey2 focus:outline-none focus:ring-2 focus:ring-blue" />
                </div>
              ))}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Groupe musculaire', key: 'muscle', opts: ['chest','lats','quads','hamstrings','shoulders','biceps','triceps','abdominals','glutes','traps','calves','lower_back','adductors','abductors','full_body'] },
                  { label: 'Équipement', key: 'equipment', opts: ['body_only','dumbbell','barbell','cable','machine'] },
                  { label: 'Type', key: 'type', opts: ['strength','cardio','stretching'] },
                  { label: 'Difficulté', key: 'difficulty', opts: ['beginner','intermediate','advanced'] },
                ].map(s => (
                  <div key={s.key}>
                    <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-grey2">{s.label}</label>
                    <select value={form[s.key as keyof typeof form]} onChange={set(s.key)}
                      className="w-full rounded-lg border border-[rgba(255,255,255,0.08)] bg-card-hi px-2 py-2 text-sm text-snow focus:outline-none focus:ring-2 focus:ring-blue">
                      {s.opts.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
                ))}
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setOpen(false)}
                  className="flex-1 rounded-lg border border-[rgba(255,255,255,0.08)] bg-card-hi py-2 text-[13px] font-medium text-grey1 hover:text-snow transition-colors">
                  Annuler
                </button>
                <button type="submit" disabled={!form.name || !form.muscle || saving}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue py-2 text-[13px] font-semibold text-void hover:bg-blue/90 transition-colors disabled:opacity-50">
                  {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                  Créer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
