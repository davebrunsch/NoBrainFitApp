'use client'

const OPTIONS = [
  { value: 'ollama', label: 'Ollama (local)', desc: 'Gratuit, privé, nécessite un serveur' },
  { value: 'claude', label: 'Claude (Anthropic)', desc: 'Payant, cloud, haute qualité' },
]

export function BackendSelector({ current }: { current: string }) {
  return (
    <form action="/api/admin/config" method="POST" className="flex items-center gap-3">
      <input type="hidden" name="_action" value="set_single" />
      <input type="hidden" name="key" value="app.ai_backend" />
      {OPTIONS.map(opt => (
        <label
          key={opt.value}
          className={`flex flex-1 cursor-pointer items-center gap-3 rounded-xl border p-4 transition-colors ${
            current === opt.value
              ? 'border-blue/40 bg-blue/10'
              : 'border-[rgba(255,255,255,0.07)] bg-card-hi hover:border-blue/20'
          }`}
        >
          <input
            type="radio"
            name="value"
            value={opt.value}
            defaultChecked={current === opt.value}
            className="sr-only"
            onChange={e => {
              if (e.target.checked) (e.target.closest('form') as HTMLFormElement)?.requestSubmit()
            }}
          />
          <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center shrink-0 ${current === opt.value ? 'border-blue' : 'border-grey2'}`}>
            {current === opt.value && <div className="h-2 w-2 rounded-full bg-blue" />}
          </div>
          <div>
            <div className="text-[13px] font-semibold text-snow">{opt.label}</div>
            <div className="text-[11px] text-grey2">{opt.desc}</div>
          </div>
        </label>
      ))}
    </form>
  )
}
