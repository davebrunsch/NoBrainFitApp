'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Zap, Eye, EyeOff, Loader2 } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd]   = useState(false)
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const res = await signIn('credentials', { email, password, redirect: false })
    setLoading(false)
    if (res?.ok) {
      router.push('/')
    } else {
      setError('Email ou mot de passe incorrect.')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-void">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue/10 border border-blue/20">
            <Zap className="h-6 w-6 text-blue" />
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-snow tracking-tight">NoBrainFit</div>
            <div className="text-[11px] text-grey2 font-semibold tracking-widest mt-0.5">ADMIN PANEL</div>
          </div>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-[rgba(255,255,255,0.07)] bg-card p-6">
          <h2 className="mb-5 text-[15px] font-semibold text-snow">Connexion</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-grey2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full rounded-lg border border-[rgba(255,255,255,0.08)] bg-card-hi px-3 py-2 text-sm text-snow placeholder:text-grey2 focus:outline-none focus:ring-2 focus:ring-blue focus:ring-offset-2 focus:ring-offset-card"
                placeholder="admin@nobrainfitapp.com"
                required
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-grey2">
                Mot de passe
              </label>
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-[rgba(255,255,255,0.08)] bg-card-hi px-3 py-2 pr-10 text-sm text-snow placeholder:text-grey2 focus:outline-none focus:ring-2 focus:ring-blue focus:ring-offset-2 focus:ring-offset-card"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-grey2 hover:text-grey1"
                >
                  {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-lg border border-orange/20 bg-orange/10 px-3 py-2 text-sm text-orange">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue py-2.5 text-sm font-semibold text-void transition-colors hover:bg-blue/90 disabled:opacity-60"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {loading ? 'Connexion…' : 'Se connecter'}
            </button>
          </form>
        </div>

        <p className="mt-4 text-center text-[11px] text-grey2">
          NoBrainFit Admin · Accès restreint
        </p>
      </div>
    </div>
  )
}
