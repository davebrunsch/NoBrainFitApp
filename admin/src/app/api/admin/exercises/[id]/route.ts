import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const { action } = await req.json()

  if (action === 'activate') {
    await db.exercise.update({ where: { id }, data: { isActive: true } })
    return NextResponse.json({ ok: true })
  }

  if (action === 'deactivate') {
    await db.exercise.update({ where: { id }, data: { isActive: false } })
    return NextResponse.json({ ok: true })
  }

  if (action === 'delete') {
    await db.exercise.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}
