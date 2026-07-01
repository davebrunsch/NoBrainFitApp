import { NextRequest, NextResponse } from 'next/server'
import { authAppUser } from '@/lib/app-auth'
import { renderPrompt } from '@/lib/prompts'
import { generateText, AiError } from '@/lib/ai'
import { quotaGuard } from '@/lib/quota'
import { featureGuard } from '@/lib/subscription'

/** Short, free-text nutrition tip after a logged meal. */
export async function POST(req: NextRequest) {
  const user = await authAppUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const denied = await featureGuard(user.id, 'nutrition_ai')
  if (denied) return denied

  const limited = await quotaGuard(user.id, ['ai'])
  if (limited) return limited

  const { mealType, mealSize, totalKcal } = await req.json()
  if (!mealType || !mealSize || totalKcal === undefined) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  const prompt = await renderPrompt('nutrition_tip', {
    meal_type: String(mealType),
    meal_size: String(mealSize),
    total_kcal: String(totalKcal),
  })
  if (!prompt) return NextResponse.json({ error: 'Prompt not configured' }, { status: 503 })

  let raw: string
  try {
    raw = await generateText(prompt, { userId: user.id, maxTokens: 256 })
  } catch (e) {
    const status = e instanceof AiError ? e.status : 502
    return NextResponse.json({ error: 'AI generation failed' }, { status })
  }

  return NextResponse.json({ tip: raw.trim() })
}
