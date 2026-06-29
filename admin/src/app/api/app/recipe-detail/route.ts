import { NextRequest, NextResponse } from 'next/server'
import { authAppUser } from '@/lib/app-auth'
import { renderPrompt } from '@/lib/prompts'
import { generateText, extractJson, AiError } from '@/lib/ai'
import { quotaGuard } from '@/lib/quota'

/** Full recipe (ingredients + steps) for a named recipe. */
export async function POST(req: NextRequest) {
  const user = await authAppUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const limited = await quotaGuard(user.id, ['ai'])
  if (limited) return limited

  const { name, portions } = await req.json()
  if (!name || !portions) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

  const prompt = await renderPrompt('recipe_detail', { name: String(name), portions: String(portions) })
  if (!prompt) return NextResponse.json({ error: 'Prompt not configured' }, { status: 503 })

  let raw: string
  try {
    raw = await generateText(prompt, { json: true, userId: user.id, maxTokens: 1024 })
  } catch (e) {
    const status = e instanceof AiError ? e.status : 502
    return NextResponse.json({ error: 'AI generation failed' }, { status })
  }

  let detail: unknown
  try {
    detail = JSON.parse(extractJson(raw))
  } catch {
    return NextResponse.json({ error: 'Invalid AI response', raw }, { status: 502 })
  }

  return NextResponse.json(detail)
}
