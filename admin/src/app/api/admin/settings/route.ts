import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { email, password } = await req.json()

  const user = await db.user.findUnique({ where: { email: session.user.email } })
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  await db.user.update({
    where: { id: user.id },
    data: {
      ...(email    ? { email }                                   : {}),
      ...(password ? { passwordHash: await bcrypt.hash(password, 12) } : {}),
    },
  })

  return NextResponse.json({ ok: true })
}
