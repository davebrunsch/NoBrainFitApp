'use client'
import { useState } from 'react'
import { ChevronDown, ChevronUp, Save, CheckCircle2, Loader2 } from 'lucide-react'

interface Prompt {
  id: string
  slug: string
  name: string
  description: string | null
  template: string
  variables: unknown
  isActive: boolean
}

export function PromptEditor({ prompt }: { prompt: Prompt }) {
  const [open, setOpen]         = useState(false)
  const [template, setTemplate] = useState(prompt.template)
  const [active, setActive]     = useState(prompt.isActive)
  const [saving, setSaving]     = useState(false)
  const [saved, setSaved]       = useState(false)

  const vars = Array.isArray(prompt.variables) ? prompt.variables as string[] : []
  const hasChanges = template !== prompt.template || active !== prompt.isActive

  async function save() {
    setSaving(true)
    await fetch(`/api/admin/prompts/${prompt.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ template, isActive: active }),
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="overflow-hidden rounded-xl border border-[rgba(255,255,255,0.07)] bg-card">
      {/* Header */}
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-5 py-4 text-left hover:bg-card-hi transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={`h-2 w-2 rounded-full shrink-0 ${active ? 'bg-[#22C55E]' : 'bg-grey2'}`} />
          <div>
            <div className="text-[13px] font-semibold text-snow">{prompt.name}</div>
            <div className="text-[11px] text-grey2">{prompt.description}</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {vars.length > 0 && (
            <div className="hidden sm:flex items-center gap-1">
              {vars.map(v => (
                <span key={v} className="rounded bg-blue/10 px-1.5 py-0.5 text-[10px] font-mono text-blue border border-blue/20">
                  {'{' + v + '}'}
                </span>
              ))}
            </div>
          )}
          {open ? <ChevronUp className="h-4 w-4 text-grey2" /> : <ChevronDown className="h-4 w-4 text-grey2" />}
        </div>
      </button>

      {/* Editor */}
      {open && (
        <div className="border-t border-[rgba(255,255,255,0.06)] p-5 space-y-4">
          {/* Variables legend */}
          {vars.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] text-grey2">Variables disponibles :</span>
              {vars.map(v => (
                <span key={v} className="rounded bg-blue/10 px-2 py-0.5 text-[11px] font-mono text-blue border border-blue/20">
                  {'{' + v + '}'}
                </span>
              ))}
            </div>
          )}

          <textarea
            value={template}
            onChange={e => setTemplate(e.target.value)}
            rows={14}
            className="w-full rounded-lg border border-[rgba(255,255,255,0.08)] bg-card-hi px-3 py-2.5 text-sm text-snow placeholder:text-grey2 focus:outline-none focus:ring-2 focus:ring-blue font-mono resize-y"
          />

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <div
                onClick={() => setActive(!active)}
                className={`relative h-5 w-9 rounded-full border-2 border-transparent transition-colors cursor-pointer ${active ? 'bg-blue' : 'bg-card-hi border border-[rgba(255,255,255,0.08)]'}`}
              >
                <div className={`absolute top-0 h-4 w-4 rounded-full bg-snow shadow transition-transform ${active ? 'translate-x-4' : 'translate-x-0'}`} />
              </div>
              <span className="text-[13px] text-grey1">Prompt actif</span>
            </label>

            <button
              onClick={save}
              disabled={!hasChanges || saving}
              className="flex items-center gap-2 rounded-lg bg-blue px-4 py-2 text-[13px] font-semibold text-void hover:bg-blue/90 transition-colors disabled:opacity-40"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : saved ? <CheckCircle2 className="h-4 w-4" /> : <Save className="h-4 w-4" />}
              {saving ? 'Sauvegarde…' : saved ? 'Sauvegardé !' : 'Sauvegarder'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
