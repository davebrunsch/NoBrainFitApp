import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sslAvailable, requestLetsEncrypt, readLetsEncryptStatus } from '@/lib/ssl'
import { setConfig } from '@/lib/config'

export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  return NextResponse.json(await readLetsEncryptStatus())
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  if (!(await sslAvailable())) {
    return NextResponse.json({ error: 'Disponible uniquement en déploiement production.' }, { status: 409 })
  }

  const { domain, email, staging } = await req.json()
  if (!domain || !email) {
    return NextResponse.json({ error: 'Domaine et email requis.' }, { status: 400 })
  }

  try {
    await requestLetsEncrypt(domain, email, Boolean(staging))
    // Persist for next time / display.
    await Promise.all([
      setConfig('ssl.mode', 'letsencrypt'),
      setConfig('ssl.domain', domain),
      setConfig('ssl.email', email),
    ])
    return NextResponse.json({ ok: true, message: `Demande Let's Encrypt enregistrée pour ${domain}. L'émission peut prendre jusqu'à 1 minute.` })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Erreur Let\'s Encrypt.' }, { status: 400 })
  }
}
