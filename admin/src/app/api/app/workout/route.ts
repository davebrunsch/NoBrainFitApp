import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { authAppUser } from '@/lib/app-auth'
import { renderPrompt } from '@/lib/prompts'
import { generateText, extractJson, AiError } from '@/lib/ai'
import { quotaGuard } from '@/lib/quota'
import { featureGuard } from '@/lib/subscription'

/** RAG workout: the model may only use the exercises supplied by the client. */
export async function POST(req: NextRequest) {
  const user = await authAppUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const denied = await featureGuard(user.id, 'rag_workout')
  if (denied) return denied

  const limited = await quotaGuard(user.id, ['workout', 'ai'])
  if (limited) return limited

  const { goal, duration, equipment, exercises } = await req.json()
  if (!goal || !duration || !equipment || !Array.isArray(exercises)) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  const prompt = await renderPrompt('rag_workout', {
    goal: String(goal),
    duration: String(duration),
    equipment: String(equipment),
    exercises_json: JSON.stringify(exercises),
  })
  if (!prompt) return NextResponse.json({ error: 'Prompt not configured' }, { status: 503 })

  let raw: string
  try {
    raw = await generateText(prompt, { json: true, userId: user.id, maxTokens: 2048 })
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
      type: 'rag',
      goal,
      duration: String(duration),
      equipment,
      exercisesJson: exercises,
      completedAt: new Date(),
    },
  })

  return NextResponse.json({ workout })
}
