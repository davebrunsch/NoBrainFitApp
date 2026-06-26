'use client'
import { useState, useEffect, useCallback } from 'react'
import {
  ShieldCheck, ShieldAlert, Shield, Upload, RefreshCw, Lock,
  Loader2, CheckCircle2, AlertTriangle, Calendar, Fingerprint,
} from 'lucide-react'

interface CertificateInfo {
  subject: string
  issuer: string
  commonName: string | null
  altNames: string[]
  validFrom: string
  validTo: string
  daysRemaining: number
  expired: boolean
  selfSigned: boolean
  letsEncrypt: boolean
  serialNumber: string
  fingerprint256: string
}

interface LeStatus { state: 'idle' | 'running' | 'success' | 'error'; message: string; ts: string | null }
interface Cfg { mode: string; domain: string; email: string }

type Tab = 'letsencrypt' | 'custom' | 'self-signed'

export function CertificateManager({ certificate, initialLeStatus, config }: {
  certificate: CertificateInfo | null
  initialLeStatus: LeStatus | null
  config: Cfg
}) {
  const [tab, setTab] = useState<Tab>(config.mode === 'letsencrypt' ? 'letsencrypt' : 'custom')
  const [leStatus, setLeStatus] = useState<LeStatus>(initialLeStatus ?? { state: 'idle', message: '', ts: null })

  // Poll Let's Encrypt status while a request is running.
  const poll = useCallback(async () => {
    const res = await fetch('/api/admin/certificates/letsencrypt')
    if (res.ok) setLeStatus(await res.json())
  }, [])

  useEffect(() => {
    if (leStatus.state !== 'running') return
    const id = setInterval(poll, 4000)
    return () => clearInterval(id)
  }, [leStatus.state, poll])

  return (
    <div className="space-y-6">
      <CurrentCertCard certificate={certificate} />

      {/* Action tabs */}
      <div className="rounded-xl border border-[rgba(255,255,255,0.07)] bg-card">
        <div className="flex border-b border-[rgba(255,255,255,0.06)]">
          <TabButton active={tab === 'letsencrypt'} onClick={() => setTab('letsencrypt')} icon={<Lock className="h-3.5 w-3.5" />} label="Let's Encrypt" />
          <TabButton active={tab === 'custom'}      onClick={() => setTab('custom')}      icon={<Upload className="h-3.5 w-3.5" />} label="Certificat perso" />
          <TabButton active={tab === 'self-signed'} onClick={() => setTab('self-signed')} icon={<Shield className="h-3.5 w-3.5" />} label="Auto-signé" />
        </div>
        <div className="p-5">
          {tab === 'letsencrypt' && <LetsEncryptForm config={config} status={leStatus} onSubmitted={setLeStatus} />}
          {tab === 'custom'      && <CustomCertForm />}
          {tab === 'self-signed' && <SelfSignedForm defaultDomain={config.domain} />}
        </div>
      </div>
    </div>
  )
}

function CurrentCertCard({ certificate }: { certificate: CertificateInfo | null }) {
  if (!certificate) {
    return (
      <div className="rounded-xl border border-[rgba(255,255,255,0.07)] bg-card p-5">
        <div className="flex items-center gap-2 text-grey1">
          <ShieldAlert className="h-5 w-5 text-grey2" />
          <span className="text-[13px]">Aucun certificat installé.</span>
        </div>
      </div>
    )
  }

  const { daysRemaining, expired } = certificate
  const warn = daysRemaining <= 21 && !expired
  const accent = expired ? 'text-orange' : warn ? 'text-[#F59E0B]' : 'text-[#22C55E]'
  const Icon = expired || warn ? ShieldAlert : ShieldCheck
  const kind = certificate.letsEncrypt ? "Let's Encrypt" : certificate.selfSigned ? 'Auto-signé' : 'Personnalisé'

  return (
    <div className="rounded-xl border border-[rgba(255,255,255,0.07)] bg-card p-5">
      <div className="mb-4 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-xl border ${expired || warn ? 'border-[#F59E0B]/20 bg-[#F59E0B]/10' : 'border-[#22C55E]/20 bg-[#22C55E]/10'}`}>
            <Icon className={`h-5 w-5 ${accent}`} />
          </div>
          <div>
            <div className="text-[14px] font-semibold text-snow">{certificate.commonName ?? 'Certificat'}</div>
            <div className="text-[12px] text-grey2">{kind}</div>
          </div>
        </div>
        <div className={`text-right ${accent}`}>
          <div className="text-xl font-bold">{expired ? 'Expiré' : `${daysRemaining} j`}</div>
          <div className="text-[11px] text-grey2">{expired ? 'à renouveler' : 'restants'}</div>
        </div>
      </div>

      {warn && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-[#F59E0B]/20 bg-[#F59E0B]/5 px-3 py-2 text-[12px] text-[#F59E0B]">
          <AlertTriangle className="h-4 w-4 shrink-0" /> Le certificat expire bientôt — pense à le renouveler.
        </div>
      )}

      <dl className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <Field label="Émetteur" value={certificate.issuer} />
        <Field label="Domaines (SAN)" value={certificate.altNames.join(', ') || '—'} />
        <Field icon={<Calendar className="h-3 w-3" />} label="Valide depuis" value={new Date(certificate.validFrom).toLocaleDateString('fr-FR')} />
        <Field icon={<Calendar className="h-3 w-3" />} label="Expire le"     value={new Date(certificate.validTo).toLocaleDateString('fr-FR')} />
        <Field icon={<Fingerprint className="h-3 w-3" />} label="Empreinte SHA-256" value={certificate.fingerprint256} mono />
        <Field label="N° de série" value={certificate.serialNumber} mono />
      </dl>
    </div>
  )
}

function Field({ label, value, icon, mono }: { label: string; value: string; icon?: React.ReactNode; mono?: boolean }) {
  return (
    <div className="rounded-lg border border-[rgba(255,255,255,0.05)] bg-card-hi px-3 py-2">
      <dt className="mb-0.5 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-grey2">{icon}{label}</dt>
      <dd className={`text-[12px] text-snow break-all ${mono ? 'font-mono text-[11px]' : ''}`}>{value}</dd>
    </div>
  )
}

function TabButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button onClick={onClick}
      className={`flex items-center gap-1.5 px-4 py-2.5 text-[12px] font-medium transition-colors ${active ? 'border-b-2 border-blue text-snow' : 'text-grey2 hover:text-grey1'}`}>
      {icon} {label}
    </button>
  )
}

function Banner({ kind, msg }: { kind: 'ok' | 'err' | 'info'; msg: string }) {
  const styles = {
    ok:   'border-[#22C55E]/20 bg-[#22C55E]/5 text-[#22C55E]',
    err:  'border-orange/20 bg-orange/5 text-orange',
    info: 'border-blue/20 bg-blue/5 text-blue',
  }[kind]
  const Icon = kind === 'ok' ? CheckCircle2 : kind === 'err' ? AlertTriangle : Loader2
  return (
    <div className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-[12px] ${styles}`}>
      <Icon className={`h-4 w-4 shrink-0 ${kind === 'info' ? 'animate-spin' : ''}`} /> {msg}
    </div>
  )
}

// ── Let's Encrypt ─────────────────────────────────────────────────────────────
function LetsEncryptForm({ config, status, onSubmitted }: { config: Cfg; status: LeStatus; onSubmitted: (s: LeStatus) => void }) {
  const [domain, setDomain]   = useState(config.domain)
  const [email, setEmail]     = useState(config.email)
  const [staging, setStaging] = useState(false)
  const [busy, setBusy]       = useState(false)
  const [err, setErr]         = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setErr(''); setBusy(true)
    const res = await fetch('/api/admin/certificates/letsencrypt', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ domain, email, staging }),
    })
    setBusy(false)
    const data = await res.json()
    if (!res.ok) { setErr(data.error ?? 'Erreur'); return }
    onSubmitted({ state: 'running', message: data.message, ts: new Date().toISOString() })
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <p className="text-[12px] text-grey1 leading-relaxed">
        Obtiens (ou renouvelle) un certificat gratuit reconnu par tous les navigateurs.
        Le domaine doit pointer vers ce serveur et les ports 80/443 doivent être accessibles.
      </p>

      {status.state === 'running' && <Banner kind="info" msg={status.message || 'Émission en cours…'} />}
      {status.state === 'success' && <Banner kind="ok"   msg={status.message || 'Certificat émis.'} />}
      {status.state === 'error'   && <Banner kind="err"  msg={status.message || 'Échec.'} />}
      {err && <Banner kind="err" msg={err} />}

      <FieldInput label="Domaine" value={domain} onChange={setDomain} placeholder="admin.mondomaine.com" />
      <FieldInput label="Email (notifications d'expiration)" value={email} onChange={setEmail} placeholder="vous@exemple.com" type="email" />

      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" checked={staging} onChange={e => setStaging(e.target.checked)}
          className="h-4 w-4 rounded border-[rgba(255,255,255,0.2)] bg-card-hi accent-blue" />
        <span className="text-[12px] text-grey1">Mode test (staging) — certificat non valide, pour vérifier la config sans limite de débit</span>
      </label>

      <button type="submit" disabled={busy || !domain || !email || status.state === 'running'}
        className="flex items-center gap-2 rounded-lg bg-blue px-4 py-2 text-[13px] font-semibold text-void hover:bg-blue/90 transition-colors disabled:opacity-50">
        {busy || status.state === 'running' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
        {status.state === 'running' ? 'Émission…' : 'Demander / Renouveler'}
      </button>
    </form>
  )
}

// ── Custom certificate upload ─────────────────────────────────────────────────
function CustomCertForm() {
  const [cert, setCert] = useState('')
  const [key, setKey]   = useState('')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg]   = useState<{ kind: 'ok' | 'err'; text: string } | null>(null)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setMsg(null); setBusy(true)
    const res = await fetch('/api/admin/certificates', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'upload', cert, key }),
    })
    setBusy(false)
    const data = await res.json()
    if (!res.ok) { setMsg({ kind: 'err', text: data.error ?? 'Erreur' }); return }
    setMsg({ kind: 'ok', text: data.message }); setCert(''); setKey('')
    setTimeout(() => window.location.reload(), 1200)
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <p className="text-[12px] text-grey1 leading-relaxed">
        Colle un certificat existant (chaîne complète) et sa clé privée au format PEM.
        La paire est validée avant installation, puis nginx est rechargé automatiquement.
      </p>
      {msg && <Banner kind={msg.kind} msg={msg.text} />}
      <PemArea label="Certificat (fullchain.pem)" value={cert} onChange={setCert} placeholder="-----BEGIN CERTIFICATE-----" />
      <PemArea label="Clé privée (privkey.pem)"    value={key}  onChange={setKey}  placeholder="-----BEGIN PRIVATE KEY-----" />
      <button type="submit" disabled={busy || !cert || !key}
        className="flex items-center gap-2 rounded-lg bg-blue px-4 py-2 text-[13px] font-semibold text-void hover:bg-blue/90 transition-colors disabled:opacity-50">
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
        Installer le certificat
      </button>
    </form>
  )
}

// ── Self-signed ───────────────────────────────────────────────────────────────
function SelfSignedForm({ defaultDomain }: { defaultDomain: string }) {
  const [domain, setDomain] = useState(defaultDomain || 'localhost')
  const [busy, setBusy]     = useState(false)
  const [msg, setMsg]       = useState<{ kind: 'ok' | 'err'; text: string } | null>(null)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setMsg(null); setBusy(true)
    const res = await fetch('/api/admin/certificates', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'self-signed', domain }),
    })
    setBusy(false)
    const data = await res.json()
    if (!res.ok) { setMsg({ kind: 'err', text: data.error ?? 'Erreur' }); return }
    setMsg({ kind: 'ok', text: data.message })
    setTimeout(() => window.location.reload(), 1200)
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <p className="text-[12px] text-grey1 leading-relaxed">
        Génère un certificat auto-signé (valable 1 an). Le chiffrement fonctionne mais les
        navigateurs afficheront un avertissement — pratique pour un usage interne ou un test.
      </p>
      {msg && <Banner kind={msg.kind} msg={msg.text} />}
      <FieldInput label="Domaine / CN" value={domain} onChange={setDomain} placeholder="admin.mondomaine.com" />
      <button type="submit" disabled={busy || !domain}
        className="flex items-center gap-2 rounded-lg bg-blue px-4 py-2 text-[13px] font-semibold text-void hover:bg-blue/90 transition-colors disabled:opacity-50">
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
        Générer
      </button>
    </form>
  )
}

function FieldInput({ label, value, onChange, placeholder, type = 'text' }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string
}) {
  return (
    <div>
      <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-grey2">{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="w-full rounded-lg border border-[rgba(255,255,255,0.08)] bg-card-hi px-3 py-2 text-sm text-snow placeholder:text-grey2 focus:outline-none focus:ring-2 focus:ring-blue" />
    </div>
  )
}

function PemArea({ label, value, onChange, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string
}) {
  return (
    <div>
      <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-grey2">{label}</label>
      <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={6}
        className="w-full rounded-lg border border-[rgba(255,255,255,0.08)] bg-card-hi px-3 py-2 text-[12px] text-snow placeholder:text-grey2 focus:outline-none focus:ring-2 focus:ring-blue font-mono resize-y" />
    </div>
  )
}
