import { NextRequest, NextResponse } from 'next/server'
import { SignJWT, jwtVerify } from 'jose'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

function getSecret() {
  const s = process.env.NEXTAUTH_SECRET
  if (!s) throw new Error('NEXTAUTH_SECRET not set')
  return new TextEncoder().encode(s)
}

async function makeToken(payload: { sub: string; email: string; role: string }) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('30d')
    .sign(getSecret())
}

export async function POST(req: NextRequest) {
  const { action, email, password, name } = await req.json()

  if (action === 'login') {
    const user = await db.user.findUnique({ where: { email } })
    if (!user || !user.passwordHash) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }
    if (user.status !== 'ACTIVE') {
      return NextResponse.json({ error: 'Account suspended' }, { status: 403 })
    }
    const valid = await bcrypt.compare(password, user.passwordHash)
    if (!valid) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })

    const token = await makeToken({ sub: user.id, email: user.email, role: user.role })
    return NextResponse.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } })
  }

  if (action === 'register') {
    if (!email || !password || !name) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }
    const existing = await db.user.findUnique({ where: { email } })
    if (existing) return NextResponse.json({ error: 'Email already in use' }, { status: 409 })

    const hash = await bcrypt.hash(password, 12)
    const freePlan = await db.plan.findFirst({ where: { slug: 'free' } })

    const user = await db.user.create({
      data: {
        email,
        passwordHash: hash,
        name,
        role: 'USER',
        status: 'ACTIVE',
        ...(freePlan ? {
          subscription: {
            create: { planId: freePlan.id, status: 'ACTIVE', startedAt: new Date() }
          }
        } : {}),
      },
    })

    const token = await makeToken({ sub: user.id, email: user.email, role: user.role })
    return NextResponse.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } }, { status: 201 })
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}
