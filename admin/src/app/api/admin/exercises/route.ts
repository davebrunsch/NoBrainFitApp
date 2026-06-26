import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const q         = searchParams.get('q') ?? ''
  const equipment = searchParams.get('equipment') ?? ''
  const muscle    = searchParams.get('muscle') ?? ''

  const exercises = await db.exercise.findMany({
    where: {
      ...(equipment ? { equipment } : {}),
      ...(muscle    ? { muscle }    : {}),
      ...(q         ? { name: { contains: q, mode: 'insensitive' } } : {}),
    },
    orderBy: [{ equipment: 'asc' }, { name: 'asc' }],
  })

  return NextResponse.json(exercises)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { name, type, muscle, equipment, difficulty } = body

  if (!name || !type || !muscle || !equipment || !difficulty) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  const exercise = await db.exercise.create({
    data: { name, type, muscle, equipment, difficulty, isActive: true },
  })

  return NextResponse.json(exercise, { status: 201 })
}
