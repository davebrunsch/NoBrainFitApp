import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const q      = searchParams.get('q') ?? ''
  const status = searchParams.get('status') ?? ''
  const page   = Math.max(1, parseInt(searchParams.get('page') ?? '1'))
  const limit  = 20

  const where = {
    ...(q      ? { OR: [{ email: { contains: q, mode: 'insensitive' as const } }, { name: { contains: q, mode: 'insensitive' as const } }] } : {}),
    ...(status ? { status: status as never } : {}),
  }

  const [users, total] = await Promise.all([
    db.user.findMany({
      where,
      include: { subscription: { include: { plan: true } } },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    db.user.count({ where }),
  ])

  return NextResponse.json({ users, total, page, pages: Math.ceil(total / limit) })
}
