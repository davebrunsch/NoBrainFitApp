'use client'
import { useState } from 'react'
import { CheckCircle2, XCircle, Loader2, Eye, EyeOff, Save } from 'lucide-react'

interface Field {
  key: string
  label: string
  type: 'text' | 'password' | 'number' | 'select'
  placeholder?: string
  value: string
  secret?: boolean
  options?: string[]
}

interface Props {
  title: string
  description: string
  icon: React.ReactNode
  accentClass: string
  testEndpoint: string
  fields: Field[]
}

export function ApiConfigCard({ title, description, icon, accentClass, testEndpoint, fields }: Props) {
  const [values, setValues]       = useState(Object.fromEntries(fields.map(f => [f.key, f.value])))
  const [showSecrets, setShows]   = useState<Record<string, boolean>>({})
  const [saving, setSaving]       = useState(false)
  const [testing, setTesting]     = useState(false)
  const [saved, setSaved]         = useState(false)
  const [testResult, setTestRes]  = useState<{ ok: boolean; msg: string } | null>(null)

  async function save() {
    setSaving(true)
    setSaved(false)
    await fetch('/api/admin/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ entries: Object.entries(values).map(([key, value]) => ({ key, value })) }),
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  async function test() {
    setTesting(true)
    setTestRes(null)
    try {
      const res  = await fetch(testEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })
      const data = await res.json().catch(() => ({}))
      // Test routes reply with HTTP 200 even on failure, carrying { ok, error }.
      const ok = res.ok && data.ok === true
      const msg = ok
        ? (data.modelFound === false
            ? `Connecté — modèle « ${data.model} » introuvable sur le serveur`
            : 'Connexion réussie')
        : (data.error ?? 'Erreur de connexion')
      setTestRes({ ok, msg })
    } catch {
      setTestRes({ ok: false, msg: 'Impossible de joindre le service' })
    }
    setTesting(false)
  }

  return (
    <div className="rounded-xl border border-[rgba(255,255,255,0.07)] bg-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-[rgba(255,255,255,0.06)] px-5 py-4">
        <div className={`flex h-9 w-9 items-center justify-center rounded-xl border ${accentClass}`}>
          {icon}
        </div>
        <div>
          <div className="text-[14px] font-semibold text-snow">{title}</div>
          <div className="text-[11px] text-grey2">{description}</div>
        </div>
      </div>

      {/* Fields */}
      <div className="p-5 space-y-4">
        {fields.map((f) => (
          <div key={f.key}>
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-grey2">
              {f.label}
            </label>

            {f.type === 'select' ? (
              <select
                value={values[f.key]}
                onChange={e => setValues(v => ({ ...v, [f.key]: e.target.value }))}
                className="w-full rounded-lg border border-[rgba(255,255,255,0.08)] bg-card-hi px-3 py-2 text-sm text-snow focus:outline-none focus:ring-2 focus:ring-blue"
              >
                {f.options?.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            ) : f.secret ? (
              <div className="relative">
                <input
                  type={showSecrets[f.key] ? 'text' : 'password'}
                  value={values[f.key]}
                  onChange={e => setValues(v => ({ ...v, [f.key]: e.target.value }))}
                  placeholder={f.placeholder}
                  className="w-full rounded-lg border border-[rgba(255,255,255,0.08)] bg-card-hi px-3 py-2 pr-10 text-sm text-snow placeholder:text-grey2 focus:outline-none focus:ring-2 focus:ring-blue font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShows(s => ({ ...s, [f.key]: !s[f.key] }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-grey2 hover:text-grey1"
                >
                  {showSecrets[f.key] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            ) : (
              <input
                type={f.type}
                value={values[f.key]}
                onChange={e => setValues(v => ({ ...v, [f.key]: e.target.value }))}
                placeholder={f.placeholder}
                className="w-full rounded-lg border border-[rgba(255,255,255,0.08)] bg-card-hi px-3 py-2 text-sm text-snow placeholder:text-grey2 focus:outline-none focus:ring-2 focus:ring-blue"
              />
            )}
          </div>
        ))}

        {/* Test result */}
        {testResult && (
          <div className={`flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm border ${
            testResult.ok
              ? 'bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/20'
              : 'bg-orange/10 text-orange border-orange/20'
          }`}>
            {testResult.ok
              ? <CheckCircle2 className="h-4 w-4 shrink-0" />
              : <XCircle className="h-4 w-4 shrink-0" />}
            {testResult.msg}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3 pt-1">
          <button
            onClick={test}
            disabled={testing}
            className="flex items-center gap-2 rounded-lg border border-[rgba(255,255,255,0.08)] bg-card-hi px-4 py-2 text-[13px] font-medium text-snow hover:bg-[rgba(255,255,255,0.08)] transition-colors disabled:opacity-50"
          >
            {testing ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {testing ? 'Test…' : 'Tester la connexion'}
          </button>
          <button
            onClick={save}
            disabled={saving}
            className="flex items-center gap-2 rounded-lg bg-blue px-4 py-2 text-[13px] font-semibold text-void hover:bg-blue/90 transition-colors disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : saved ? <CheckCircle2 className="h-4 w-4" /> : <Save className="h-4 w-4" />}
            {saving ? 'Sauvegarde…' : saved ? 'Sauvegardé !' : 'Sauvegarder'}
          </button>
        </div>
      </div>
    </div>
  )
}
