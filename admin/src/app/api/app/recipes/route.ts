import { NextRequest, NextResponse } from 'next/server'
import { authAppUser } from '@/lib/app-auth'
import { renderPrompt } from '@/lib/prompts'
import { generateText, extractJson, AiError } from '@/lib/ai'
import { quotaGuard } from '@/lib/quota'

/** Recipe suggestions + consolidated shopping list. */
export async function POST(req: NextRequest) {
  const user = await authAppUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const limited = await quotaGuard(user.id, ['ai'])
  if (limited) return limited

  const { effort, portions } = await req.json()
  if (!effort || !portions) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  const prompt = await renderPrompt('recipes', {
    effort: String(effort),
    portions: String(portions),
  })
  if (!prompt) return NextResponse.json({ error: 'Prompt not configured' }, { status: 503 })

  let raw: string
  try {
    raw = await generateText(prompt, { json: true, userId: user.id })
  } catch (e) {
    const status = e instanceof AiError ? e.status : 502
    return NextResponse.json({ error: 'AI generation failed' }, { status })
  }

  let result: unknown
  try {
    result = JSON.parse(extractJson(raw))
  } catch {
    return NextResponse.json({ error: 'Invalid AI response', raw }, { status: 502 })
  }

  return NextResponse.json(result)
}
