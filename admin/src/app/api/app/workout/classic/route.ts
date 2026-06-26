import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { db } from '@/lib/db'
import { authAppUser } from '@/lib/app-auth'
import { renderPrompt } from '@/lib/prompts'
import { generateText, extractJson, AiError } from '@/lib/ai'
import { quotaGuard } from '@/lib/quota'

/** Classic workout: free generation from a duration + location. */
export async function POST(req: NextRequest) {
  const user = await authAppUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const limited = await quotaGuard(user.id, ['workout', 'ai'])
  if (limited) return limited

  const { duration, location } = await req.json()
  if (!duration || !location) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  const prompt = await renderPrompt('classic_workout', {
    duration: String(duration),
    location: String(location),
  })
  if (!prompt) return NextResponse.json({ error: 'Prompt not configured' }, { status: 503 })

  let raw: string
  try {
    raw = await generateText(prompt, { json: true, userId: user.id })
  } catch (e) {
    const status = e instanceof AiError ? e.status : 502
    return NextResponse.json({ error: 'AI generation failed' }, { status })
  }

  let workout: unknown
  try {
    workout = JSON.parse(extractJson(raw))
  } catch {
    return NextResponse.json({ error: 'Invalid AI response', raw }, { status: 502 })
  }

  await db.workoutSession.create({
    data: {
      userId: user.id,
      type: 'classic',
      duration: String(duration),
      location: String(location),
      exercisesJson: workout as Prisma.InputJsonValue,
      completedAt: new Date(),
    },
  })

  return NextResponse.json({ workout })
}
