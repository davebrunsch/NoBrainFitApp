import { db } from '@/lib/db'
import { Header } from '@/components/admin/header'
import { ApiConfigCard } from './api-config-card'
import { Zap, Brain, Dumbbell } from 'lucide-react'

async function getApiConfigs() {
  const keys = [
    'ollama.base_url', 'ollama.model', 'ollama.timeout_seconds',
    'claude.api_key', 'claude.model', 'claude.max_tokens',
    'fitness_api.provider', 'fitness_api.key', 'app.rag_exercises_count',
    'app.ai_backend',
  ]
  const rows = await db.appConfig.findMany({ where: { key: { in: keys } } })
  return Object.fromEntries(rows.map(r => [r.key, r.value]))
}

export default async function ApisPage() {
  const cfg = await getApiConfigs()

  return (
    <div>
      <Header title="APIs & Configuration" description="Gestion des services externes et clés d'API" />

      <div className="p-6 space-y-5">
        {/* Default AI backend selector */}
        <div className="rounded-xl border border-[rgba(255,255,255,0.07)] bg-card p-5">
          <h3 className="text-[13px] font-semibold text-snow mb-1">Backend IA par défaut</h3>
          <p className="text-[12px] text-grey2 mb-4">
            Sélectionne le backend utilisé par l'application Flutter pour générer les programmes.
          </p>
          <BackendSelector current={cfg['app.ai_backend'] ?? 'ollama'} />
        </div>

        {/* Ollama */}
        <ApiConfigCard
          title="Ollama"
          description="LLM local — aucune donnée ne quitte ton serveur"
          icon={<Zap className="h-5 w-5 text-lime" />}
          accentClass="bg-lime/10 border-lime/20"
          testEndpoint="/api/admin/config/test-ollama"
          fields={[
            { key: 'ollama.base_url',        label: 'URL du serveur',      type: 'text',     placeholder: 'http://localhost:11434',     value: cfg['ollama.base_url'] ?? ''        },
            { key: 'ollama.model',            label: 'Modèle par défaut',   type: 'select',   options: ['llama3.2','llama3.1','mistral','gemma3','phi3','qwen2.5'], value: cfg['ollama.model'] ?? 'llama3.2' },
            { key: 'ollama.timeout_seconds',  label: 'Timeout (secondes)',  type: 'number',   placeholder: '120',                        value: cfg['ollama.timeout_seconds'] ?? '120' },
          ]}
        />

        {/* Claude */}
        <ApiConfigCard
          title="Claude (Anthropic)"
          description="LLM cloud — requiert une clé API Anthropic"
          icon={<Brain className="h-5 w-5 text-blue" />}
          accentClass="bg-blue/10 border-blue/20"
          testEndpoint="/api/admin/config/test-claude"
          fields={[
            { key: 'claude.api_key',    label: 'Clé API (sk-ant-…)',    type: 'password', placeholder: 'sk-ant-api03-…',               value: cfg['claude.api_key']    ?? '', secret: true },
            { key: 'claude.model',      label: 'Modèle',                type: 'select',   options: ['claude-haiku-4-5-20251001', 'claude-sonnet-4-6', 'claude-opus-4-8'], value: cfg['claude.model'] ?? 'claude-haiku-4-5-20251001' },
            { key: 'claude.max_tokens', label: 'Max tokens / réponse',  type: 'number',   placeholder: '1024',                         value: cfg['claude.max_tokens'] ?? '1024' },
          ]}
        />

        {/* Fitness API */}
        <ApiConfigCard
          title="Fitness API (Exercices)"
          description="Source des exercices injectés dans le prompt RAG"
          icon={<Dumbbell className="h-5 w-5 text-orange" />}
          accentClass="bg-orange/10 border-orange/20"
          testEndpoint="/api/admin/config/test-fitness"
          fields={[
            { key: 'fitness_api.provider', label: 'Provider',             type: 'select',  options: ['mock', 'ninjas'], value: cfg['fitness_api.provider'] ?? 'mock' },
            { key: 'fitness_api.key',      label: 'Clé API-Ninjas',       type: 'password', placeholder: 'Laisser vide pour le mode mock', value: cfg['fitness_api.key'] ?? '', secret: true },
            { key: 'app.rag_exercises_count', label: 'Nb exercices / prompt RAG', type: 'number', placeholder: '20', value: cfg['app.rag_exercises_count'] ?? '20' },
          ]}
        />
      </div>
    </div>
  )
}

function BackendSelector({ current }: { current: string }) {
  return (
    <form action="/api/admin/config" method="POST" className="flex items-center gap-3">
      <input type="hidden" name="_action" value="set_single" />
      <input type="hidden" name="key" value="app.ai_backend" />
      {[
        { value: 'ollama', label: 'Ollama (local)',        desc: 'Gratuit, privé, nécessite un serveur' },
        { value: 'claude', label: 'Claude (Anthropic)',    desc: 'Payant, cloud, haute qualité' },
      ].map(opt => (
        <label
          key={opt.value}
          className={`flex flex-1 cursor-pointer items-center gap-3 rounded-xl border p-4 transition-colors ${
            current === opt.value
              ? 'border-blue/40 bg-blue/10'
              : 'border-[rgba(255,255,255,0.07)] bg-card-hi hover:border-blue/20'
          }`}
        >
          <input type="radio" name="value" value={opt.value} defaultChecked={current === opt.value} className="sr-only" onChange={e => { if (e.target.checked) (e.target.closest('form') as HTMLFormElement)?.requestSubmit() }} />
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
