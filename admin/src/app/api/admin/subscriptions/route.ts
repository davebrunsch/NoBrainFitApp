import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

// Search users that do NOT have a subscription yet (for the create picker).
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const q = (searchParams.get('q') ?? '').trim()

  const users = await db.user.findMany({
    where: {
      subscription: { is: null },
      status: { not: 'DELETED' },
      ...(q
        ? {
            OR: [
              { email: { contains: q, mode: 'insensitive' } },
              { name:  { contains: q, mode: 'insensitive' } },
            ],
          }
        : {}),
    },
    select: { id: true, email: true, name: true },
    orderBy: { createdAt: 'desc' },
    take: 20,
  })

  return NextResponse.json(users)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { userId, planId, expiresAt } = await req.json()

  if (!userId || !planId) {
    return NextResponse.json({ error: 'Utilisateur et plan requis' }, { status: 400 })
  }

  const [user, plan, existing] = await Promise.all([
    db.user.findUnique({ where: { id: userId } }),
    db.plan.findUnique({ where: { id: planId } }),
    db.subscription.findUnique({ where: { userId } }),
  ])

  if (!user)  return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 })
  if (!plan)  return NextResponse.json({ error: 'Plan introuvable' }, { status: 404 })
  if (existing) {
    return NextResponse.json(
      { error: 'Cet utilisateur a déjà un abonnement. Modifie-le depuis la liste.' },
      { status: 409 },
    )
  }

  let expiry: Date | null = null
  if (expiresAt) {
    expiry = new Date(expiresAt)
    if (Number.isNaN(expiry.getTime())) {
      return NextResponse.json({ error: 'Date invalide' }, { status: 400 })
    }
  }

  const subscription = await db.subscription.create({
    data: { userId, planId, status: 'ACTIVE', startedAt: new Date(), expiresAt: expiry },
  })

  return NextResponse.json(subscription, { status: 201 })
}
