import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const { template, isActive } = await req.json()

  const prompt = await db.aiPrompt.update({
    where: { id },
    data: {
      ...(template  !== undefined ? { template }  : {}),
      ...(isActive  !== undefined ? { isActive }  : {}),
    },
  })

  return NextResponse.json(prompt)
}
