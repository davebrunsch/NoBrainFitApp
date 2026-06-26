'use client'
import { useState } from 'react'
import { Loader2, CheckCircle2 } from 'lucide-react'

export function SettingsForm({ currentEmail }: { currentEmail: string }) {
  const [email, setEmail]       = useState(currentEmail)
  const [password, setPassword] = useState('')
  const [confirm, setConfirm]   = useState('')
  const [saving, setSaving]     = useState(false)
  const [saved, setSaved]       = useState(false)
  const [error, setError]       = useState('')

  async function save(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (password && password !== confirm) {
      setError('Les mots de passe ne correspondent pas.')
      return
    }
    setSaving(true)
    const res = await fetch('/api/admin/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, ...(password ? { password } : {}) }),
    })
    setSaving(false)
    if (!res.ok) {
      const data = await res.json().catch(() => ({})) as { error?: string }
      setError(data.error ?? 'Erreur lors de la sauvegarde.')
      return
    }
    setSaved(true)
    setPassword('')
    setConfirm('')
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <section className="rounded-xl border border-[rgba(255,255,255,0.07)] bg-card p-5">
      <h2 className="mb-4 text-[13px] font-semibold text-snow">Mon compte</h2>
      <form onSubmit={save} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-grey2">Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full rounded-lg border border-[rgba(255,255,255,0.08)] bg-card-hi px-3 py-2 text-sm text-snow focus:outline-none focus:ring-2 focus:ring-blue"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-grey2">Nouveau mot de passe</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Laisser vide pour ne pas changer"
            className="w-full rounded-lg border border-[rgba(255,255,255,0.08)] bg-card-hi px-3 py-2 text-sm text-snow placeholder:text-grey2 focus:outline-none focus:ring-2 focus:ring-blue"
          />
        </div>
        {password && (
          <div>
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-grey2">Confirmer le mot de passe</label>
            <input
              type="password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              className="w-full rounded-lg border border-[rgba(255,255,255,0.08)] bg-card-hi px-3 py-2 text-sm text-snow focus:outline-none focus:ring-2 focus:ring-blue"
            />
          </div>
        )}
        {error && <p className="text-[12px] text-orange">{error}</p>}
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 rounded-lg bg-blue px-4 py-2 text-[13px] font-semibold text-void hover:bg-blue/90 transition-colors disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : saved ? <CheckCircle2 className="h-4 w-4" /> : null}
          {saving ? 'Sauvegarde…' : saved ? 'Sauvegardé !' : 'Sauvegarder'}
        </button>
      </form>
    </section>
  )
}
