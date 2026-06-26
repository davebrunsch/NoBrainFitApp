import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import {
  sslAvailable, readCertificate, installCustomCertificate,
  generateSelfSigned, readLetsEncryptStatus, signalReload,
} from '@/lib/ssl'
import { getConfigs } from '@/lib/config'

export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const available = await sslAvailable()
  const [certificate, leStatus, cfg] = await Promise.all([
    available ? readCertificate() : Promise.resolve(null),
    available ? readLetsEncryptStatus() : Promise.resolve(null),
    getConfigs(['ssl.mode', 'ssl.domain', 'ssl.email']),
  ])

  return NextResponse.json({
    available,
    certificate,
    letsEncrypt: leStatus,
    config: {
      mode:   cfg['ssl.mode']   ?? '',
      domain: cfg['ssl.domain'] ?? '',
      email:  cfg['ssl.email']  ?? '',
    },
  })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  if (!(await sslAvailable())) {
    return NextResponse.json({ error: 'La gestion SSL est disponible uniquement en déploiement production (volumes non montés).' }, { status: 409 })
  }

  const body = await req.json()
  const { action } = body

  try {
    if (action === 'upload') {
      const { cert, key } = body
      if (!cert || !key) return NextResponse.json({ error: 'Certificat et clé requis.' }, { status: 400 })
      await installCustomCertificate(cert, key)
      return NextResponse.json({ ok: true, message: 'Certificat installé et nginx rechargé.' })
    }

    if (action === 'self-signed') {
      const { domain } = body
      if (!domain) return NextResponse.json({ error: 'Domaine requis.' }, { status: 400 })
      await generateSelfSigned(domain)
      return NextResponse.json({ ok: true, message: `Certificat auto-signé généré pour ${domain}.` })
    }

    if (action === 'reload') {
      await signalReload()
      return NextResponse.json({ ok: true, message: 'Signal de rechargement envoyé à nginx.' })
    }

    return NextResponse.json({ error: 'Action inconnue.' }, { status: 400 })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Erreur SSL.' }, { status: 400 })
  }
}
